const User        = require('../models/User')
const Assessment  = require('../models/Assessment')
const Appointment = require('../models/Appointment')
const MoodLog     = require('../models/MoodLog')
const AuditLog    = require('../models/AuditLog')
const DoctorNote  = require('../models/DoctorNote')
const { logAction } = require('../services/audit.service')
const { format, subDays } = require('../utils/dateHelper')

// ── GET /api/doctor/patients ──────────────────────────────────────────
const getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ assignedDoctor: req.user.id, role: 'patient', isActive: true })
      .select('name avatar email createdAt wellnessProgress')

    const enriched = await Promise.all(patients.map(async (p) => {
      const now   = format(new Date())
      const [lastAppt, nextAppt, lastAssessment] = await Promise.all([
        Appointment.findOne({ patient: p._id, doctor: req.user.id, status: 'completed' }).sort('-date').select('date'),
        Appointment.findOne({ patient: p._id, doctor: req.user.id, status: 'upcoming', date: { $gte: now } }).sort('date').select('date time'),
        Assessment.findOne({ user: p._id }).sort('-createdAt').select('type score severity createdAt'),
      ])
      return {
        id:             p._id,
        name:           p.name,
        avatar:         p.avatar,
        age:            null, // age not stored — calculated from joinedAt approximation
        lastSession:    lastAppt?.date || null,
        nextSession:    nextAppt?.date || null,
        riskLevel:      lastAssessment?.severity || 'minimal',
        lastAssessment: lastAssessment ? {
          type:  lastAssessment.type,
          score: lastAssessment.score,
          date:  lastAssessment.createdAt,
        } : null,
        status: 'active',
      }
    }))

    return res.status(200).json({ success: true, data: enriched })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/doctor/patients/:id ──────────────────────────────────────
const getPatientDetail = async (req, res, next) => {
  try {
    const patient = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpiry')
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' })

    // Verify this patient is assigned to this doctor
    if (patient.assignedDoctor?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This patient is not assigned to you' })
    }

    const [assessments, moodLogs, appointments] = await Promise.all([
      Assessment.find({ user: patient._id }).sort('-createdAt'),
      MoodLog.find({ user: patient._id, logDate: { $gte: format(subDays(new Date(), 30)) } }).sort('logDate'),
      Appointment.find({ patient: patient._id, doctor: req.user.id }).sort('-date').limit(10),
    ])

    // Risk indicators — derived, not raw AI output
    const latestAssessment = assessments[0]
    const avgMood = moodLogs.length ? moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length : null

    const riskIndicators = {
      latestSeverity: latestAssessment?.severity || 'no data',
      isCrisisFlag:   latestAssessment?.isCrisisFlag || false,
      avgMoodScore:   avgMood ? parseFloat(avgMood.toFixed(1)) : null,
      moodTrend:      moodLogs.map(m => ({ logDate: m.logDate, mood: m.mood, score: m.score })),
    }

    return res.status(200).json({
      success: true,
      data: {
        profile:       { id: patient._id, name: patient.name, avatar: patient.avatar, language: patient.language, joinedAt: patient.createdAt },
        assessments:   assessments.map(a => ({ id: a._id, type: a.type, score: a.score, maxScore: a.maxScore, severity: a.severity, interpretation: a.interpretation, recommendation: a.recommendation, isCrisisFlag: a.isCrisisFlag, completedAt: a.createdAt })),
        moodTrend:     moodLogs.map(m => ({ logDate: m.logDate, mood: m.mood, score: m.score })),
        appointments:  appointments,
        riskIndicators,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/doctor/notes ────────────────────────────────────────────
const addNote = async (req, res, next) => {
  try {
    const { patientId, appointmentId, content, isConfidential = true } = req.body

    if (!content || !content.trim()) {
      return res.status(422).json({ success: false, message: 'Note content is required' })
    }

    // Verify this patient is assigned to this doctor
    const patient = await User.findById(patientId).select('assignedDoctor')
    if (!patient || patient.assignedDoctor?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Patient not assigned to you' })
    }

    const note = await DoctorNote.create({
      doctor:         req.user.id,
      patient:        patientId,
      appointment:    appointmentId || null,
      content:        content.trim(),
      isConfidential: isConfidential !== false,
    })

    await logAction({
      actor: req.user.id, actorEmail: req.user.email,
      action: 'DOCTOR_NOTE_ADDED', target: 'Patient', targetId: patientId, req,
    })

    return res.status(201).json({ success: true, message: 'Note saved', data: note })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/doctor/notes/:patientId ──────────────────────────────────
const getNotes = async (req, res, next) => {
  try {
    const { patientId } = req.params

    // Verify assignment
    const patient = await User.findById(patientId).select('assignedDoctor')
    if (!patient || patient.assignedDoctor?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Patient not assigned to you' })
    }

    const notes = await DoctorNote.find({ doctor: req.user.id, patient: patientId })
      .sort('-createdAt')
      .populate('appointment', 'date time type')

    return res.status(200).json({ success: true, data: notes })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/doctor/analytics ─────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const mongoose   = require('mongoose')
    const doctorObjId = new mongoose.Types.ObjectId(req.user.id)

    const patients   = await User.find({ assignedDoctor: req.user.id, role: 'patient' }).select('_id')
    const patientIds = patients.map(p => p._id)

    const [severityDist, moodLogs, apptStats] = await Promise.all([
      patientIds.length
        ? Assessment.aggregate([
            { $match: { user: { $in: patientIds } } },
            { $sort:  { user: 1, createdAt: -1 } },
            { $group: { _id: '$user', severity: { $first: '$severity' } } },
            { $group: { _id: '$severity', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
      patientIds.length
        ? MoodLog.find({ user: { $in: patientIds } }).select('score').lean()
        : Promise.resolve([]),
      Appointment.aggregate([
        { $match: { doctor: doctorObjId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    const avgMood = moodLogs.length
      ? (moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length).toFixed(1)
      : null

    const now            = new Date()
    const thirtyDaysAgo  = subDays(now, 30)
    const activePatients = patientIds.length
      ? await Appointment.distinct('patient', {
          doctor: req.user.id,
          status: { $in: ['upcoming', 'completed'] },
          date:   { $gte: format(thirtyDaysAgo) },
        })
      : []

    return res.status(200).json({
      success: true,
      data: {
        totalPatients:        patients.length,
        activePatients:       activePatients.length,
        severityDistribution: severityDist,
        appointmentStats:     apptStats,
        averageMoodScore:     avgMood,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getPatients, getPatientDetail, addNote, getNotes, getAnalytics }
