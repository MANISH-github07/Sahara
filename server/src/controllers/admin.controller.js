const User        = require('../models/User')
const Assessment  = require('../models/Assessment')
const Appointment = require('../models/Appointment')
const AuditLog    = require('../models/AuditLog')
const { logAction }         = require('../services/audit.service')
const { createNotification } = require('../services/notification.service')
const { sendMail, welcomeEmail } = require('../config/mailer')
const { subDays, format } = require('../utils/dateHelper')

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── GET /api/admin/stats ──────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const now        = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyAgo  = subDays(now, 30)

    // Run all independent top-level counts in parallel
    const [totalUsers, activeUsers, professionals, appointments, assessmentsToday, flaggedCases] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ lastLogin: { $gte: thirtyAgo } }),
        User.countDocuments({ role: 'doctor' }),
        Appointment.countDocuments(),
        Assessment.countDocuments({ createdAt: { $gte: todayStart } }),
        Assessment.countDocuments({ isCrisisFlag: true, reviewedBy: null }),
      ])

    // User growth — single aggregation instead of 6 separate countDocuments calls
    const userGrowthRaw = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Build last-6-months cumulative counts from the aggregation result
    const userGrowth = Array.from({ length: 6 }, (_, i) => {
      const d     = subDays(now, (5 - i) * 30)
      const month = MONTHS[d.getMonth()]
      const year  = d.getFullYear()
      const mo    = d.getMonth() + 1
      // Cumulative: count all users created up to end of this month
      const users = userGrowthRaw
        .filter(r => r._id.year < year || (r._id.year === year && r._id.month <= mo))
        .reduce((s, r) => s + r.count, 0)
      return { month, users }
    })

    // Assessment activity — single aggregation instead of 12 separate queries
    const assessmentActivityRaw = await Assessment.aggregate([
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type:  '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const assessmentActivity = Array.from({ length: 6 }, (_, i) => {
      const d   = subDays(now, (5 - i) * 30)
      const mo  = d.getMonth() + 1
      const yr  = d.getFullYear()
      const phq9 = assessmentActivityRaw.find(r => r._id.year === yr && r._id.month === mo && r._id.type === 'PHQ-9')?.count || 0
      const gad7 = assessmentActivityRaw.find(r => r._id.year === yr && r._id.month === mo && r._id.type === 'GAD-7')?.count || 0
      return { month: MONTHS[d.getMonth()], phq9, gad7 }
    })

    // Risk distribution — single aggregation
    const riskDist = await Assessment.aggregate([
      { $sort: { user: 1, createdAt: -1 } },
      { $group: { _id: '$user', severity: { $first: '$severity' } } },
      { $group: { _id: '$severity', value: { $sum: 1 } } },
    ])

    const COLORS = {
      minimal: '#22c55e', mild: '#0ea5e9',
      moderate: '#f59e0b', 'moderately-severe': '#f97316', severe: '#ef4444',
    }
    const riskDistribution = riskDist.map(r => ({
      name:  r._id ? r._id.charAt(0).toUpperCase() + r._id.slice(1) : 'Unknown',
      value: r.value,
      color: COLORS[r._id] || '#a8a29e',
    }))

    return res.status(200).json({
      success: true,
      data: {
        totalUsers, activeUsers, professionals, appointments,
        assessmentsToday, flaggedCases,
        userGrowth, assessmentActivity, riskDistribution,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/users ──────────────────────────────────────────────
const listUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query
    const query = {}
    if (role)   query.role     = role
    if (status === 'active')   query.isActive = true
    if (status === 'inactive') query.isActive = false
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await User.countDocuments(query)
    const data  = await User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit))
      .select('name email role isActive isVerified lastLogin createdAt avatar specialty')

    return res.status(200).json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/admin/users/:id ────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { isActive, role, assignedDoctor } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (isActive !== undefined)       user.isActive       = isActive
    if (role !== undefined)           user.role           = role
    if (assignedDoctor !== undefined) {
      // null = unassign; string ObjectId = assign
      if (assignedDoctor === null || assignedDoctor === '') {
        user.assignedDoctor = null
      } else {
        // Verify the doctor exists
        const doctor = await User.findById(assignedDoctor).select('role')
        if (!doctor || doctor.role !== 'doctor') {
          return res.status(400).json({ success: false, message: 'Assigned user must be a doctor' })
        }
        user.assignedDoctor = assignedDoctor
      }
    }

    await user.save({ validateBeforeSave: false })
    await logAction({
      actor: req.user.id, actorEmail: req.user.email,
      action: 'ADMIN_USER_UPDATED', target: 'User',
      targetId: user._id.toString(), req,
      metadata: { isActive, role, assignedDoctor },
    })

    return res.status(200).json({ success: true, message: 'User updated', data: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/professionals ──────────────────────────────────────
const listProfessionals = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name email specialty qualifications isAvailable rating reviewCount avatar createdAt')

    const enriched = await Promise.all(doctors.map(async d => {
      const apptCount = await Appointment.countDocuments({ doctor: d._id })
      const patCount  = await User.countDocuments({ assignedDoctor: d._id })
      return { ...d.toObject(), appointmentCount: apptCount, patientCount: patCount }
    }))

    return res.status(200).json({ success: true, data: enriched })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/professionals ─────────────────────────────────────
const createProfessional = async (req, res, next) => {
  try {
    const { name, email, password, specialty, qualifications, experience, bio, sessionTypes, consultationFee, languages } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })

    const doctor = await User.create({
      name, email, password, role: 'doctor',
      specialty, qualifications, experience, bio,
      sessionTypes: sessionTypes || ['video'],
      consultationFee, languages: languages || ['English'],
      isAvailable: true, isVerified: true,
    })

    sendMail({ to: email, subject: 'Welcome to SAHARA — Your professional account is ready', html: welcomeEmail(name) })

    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'ADMIN_PROFESSIONAL_CREATED', target: 'User', targetId: doctor._id.toString(), req })

    return res.status(201).json({ success: true, message: 'Professional account created', data: doctor.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// ── DELETE (soft) /api/admin/users/:id ────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted this way' })
    }
    user.isActive = false
    await user.save({ validateBeforeSave: false })
    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'ADMIN_USER_DELETED', target: 'User', targetId: user._id.toString(), req })
    return res.status(200).json({ success: true, message: 'User deactivated' })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/audit-logs ─────────────────────────────────────────
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, actor, startDate, endDate, page = 1, limit = 20 } = req.query
    const query = {}
    if (action)    query.action     = { $regex: action, $options: 'i' }
    if (actor)     query.actorEmail = { $regex: actor,  $options: 'i' }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate)   query.createdAt.$lte = new Date(endDate)
    }
    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await AuditLog.countDocuments(query)
    const data  = await AuditLog.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit))
    return res.status(200).json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats, listUsers, updateUser, listProfessionals, createProfessional, deleteUser, getAuditLogs }
