const Appointment = require('../models/Appointment')
const User        = require('../models/User')
const { createNotification } = require('../services/notification.service')
const { logAction }          = require('../services/audit.service')
const { sendMail, appointmentConfirmEmail } = require('../config/mailer')
const { format } = require('../utils/dateHelper')

// ── GET /api/appointments ─────────────────────────────────────────────
const listAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}

    if (req.user.role === 'patient') query.patient = req.user.id
    if (req.user.role === 'doctor')  query.doctor  = req.user.id

    if (status) query.status = status

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Appointment.countDocuments(query)
    const data  = await Appointment.find(query)
      .sort('-date')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('doctor',  'name specialty avatar consultationFee')
      .populate('patient', 'name avatar')

    return res.status(200).json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/appointments ────────────────────────────────────────────
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, type, date, time, duration, notes } = req.body
    const today = format(new Date())

    if (date < today) {
      return res.status(400).json({ success: false, message: 'Appointment date must be today or in the future' })
    }

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' })
    }
    if (!doctor.isAvailable) {
      return res.status(400).json({ success: false, message: 'This professional is currently unavailable' })
    }

    // Check for double-booking
    const conflict = await Appointment.findOne({
      doctor: doctorId, date, time,
      status: { $in: ['upcoming', 'in_progress'] },
    })
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' })
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      type, date, time,
      duration: duration || 50,
      notes: notes || null,
    })

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialty email')
      .populate('patient', 'name email')

    // Notify patient
    await createNotification({
      userId:  req.user.id,
      type:    'appointment',
      title:   'Appointment booked',
      message: `Your session with ${doctor.name} on ${date} at ${time} is confirmed.`,
      link:    '/appointments',
    })

    // Notify doctor
    await createNotification({
      userId:  doctorId,
      type:    'appointment',
      title:   'New appointment',
      message: `A new session has been booked by a patient for ${date} at ${time}.`,
      link:    '/doctor/appointments',
    })

    sendMail({
      to:      populated.patient.email,
      subject: `Appointment confirmed with ${doctor.name}`,
      html:    appointmentConfirmEmail(populated.patient.name, doctor.name, date, time, type),
    })

    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'APPOINTMENT_BOOKED', target: 'Appointment', targetId: appointment._id.toString(), req })

    return res.status(201).json({ success: true, message: 'Appointment booked', data: populated })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/appointments/:id/cancel ────────────────────────────────
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name')
      .populate('doctor',  'name')

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })

    const isPatient = appointment.patient._id.toString() === req.user.id
    const isDoctor  = appointment.doctor._id.toString()  === req.user.id
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    appointment.status            = 'cancelled'
    appointment.cancelledBy       = req.user.id
    appointment.cancellationReason = req.body.reason || null
    await appointment.save()

    // Notify the other party
    const notifyId = isPatient ? appointment.doctor._id : appointment.patient._id
    await createNotification({
      userId:  notifyId,
      type:    'appointment',
      title:   'Appointment cancelled',
      message: `An appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
      link:    '/appointments',
    })

    return res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/appointments/:id/complete ─────────────────────────────
const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' })
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the doctor can complete this appointment' })
    }
    appointment.status = 'completed'
    await appointment.save()
    return res.status(200).json({ success: true, message: 'Appointment completed', data: appointment })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/appointments/doctors ─────────────────────────────────────
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isAvailable: true, isActive: true })
      .select('name specialty qualifications experience bio languages consultationFee sessionTypes rating reviewCount avatar')
    return res.status(200).json({ success: true, data: doctors })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/appointments/doctors/:id/availability ────────────────────
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ success: false, message: 'Date query parameter required' })

    // Use doctor's configured slots, or fall back to the standard set
    const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00']
    const doctor = await User.findById(req.params.id).select('availableSlots workingDays isAvailable')

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
    if (!doctor.isAvailable) return res.status(200).json({ success: true, data: [] })

    // Check if the requested date is a working day
    const requestedDayOfWeek = new Date(date).getDay()  // 0=Sun
    const workingDays = doctor.workingDays?.length ? doctor.workingDays : [1,2,3,4,5]
    if (!workingDays.includes(requestedDayOfWeek)) {
      return res.status(200).json({ success: true, data: [], message: 'Doctor does not work on this day' })
    }

    const slots = doctor.availableSlots?.length ? doctor.availableSlots : DEFAULT_SLOTS

    // Subtract already-booked slots
    const booked = await Appointment.find({
      doctor: req.params.id,
      date,
      status: { $in: ['upcoming', 'in_progress'] },
    }).select('time')

    const bookedTimes = booked.map(a => a.time)
    const available   = slots.filter(s => !bookedTimes.includes(s)).sort()

    return res.status(200).json({ success: true, data: available })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/appointments/doctors/schedule ────────────────────────────
// Allows a doctor to configure their own available time slots and working days
const updateSchedule = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can update their schedule' })
    }

    const { availableSlots, workingDays } = req.body

    // Validate slot format HH:MM
    const VALID_RE = /^([01]\d|2[0-3]):[0-5]\d$/
    if (availableSlots) {
      for (const slot of availableSlots) {
        if (!VALID_RE.test(slot)) {
          return res.status(422).json({ success: false, message: `Invalid time slot format: ${slot}. Use HH:MM.` })
        }
      }
    }
    // Validate working days (0–6)
    if (workingDays) {
      for (const day of workingDays) {
        if (day < 0 || day > 6) {
          return res.status(422).json({ success: false, message: `Invalid working day: ${day}. Use 0(Sun)–6(Sat).` })
        }
      }
    }

    const updates = {}
    if (availableSlots !== undefined) updates.availableSlots = availableSlots
    if (workingDays    !== undefined) updates.workingDays    = workingDays

    const doctor = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('availableSlots workingDays isAvailable name')

    return res.status(200).json({ success: true, message: 'Schedule updated', data: doctor })
  } catch (err) {
    next(err)
  }
}

module.exports = { listAppointments, bookAppointment, cancelAppointment, completeAppointment, getDoctors, getDoctorAvailability, updateSchedule }
