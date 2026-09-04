const Assessment = require('../models/Assessment')
const User       = require('../models/User')
const gemini     = require('../services/gemini.service')
const { createNotification } = require('../services/notification.service')
const { logAction }          = require('../services/audit.service')
const { sendMail, crisisAlertEmail } = require('../config/mailer')

// ── Scoring helpers ──────────────────────────────────────────────────
const getPHQ9Severity = (score) => {
  if (score <= 4)  return 'minimal'
  if (score <= 9)  return 'mild'
  if (score <= 14) return 'moderate'
  if (score <= 19) return 'moderately-severe'
  return 'severe'
}

const getGAD7Severity = (score) => {
  if (score <= 4)  return 'minimal'
  if (score <= 9)  return 'mild'
  if (score <= 14) return 'moderate'
  return 'severe'
}

const getRecommendation = (type, severity) => {
  const recs = {
    minimal:           'Continue your current wellness practices. Regular check-ins help maintain mental wellness.',
    mild:              'Consider speaking with a mental health professional for further evaluation and support.',
    moderate:          'We recommend connecting with a mental health professional. Professional support can make a meaningful difference.',
    'moderately-severe':'Professional support is strongly recommended. Please consider booking a session with one of our professionals.',
    severe:            'Please connect with a mental health professional as soon as possible. You deserve support right now.',
  }
  return recs[severity] || recs.mild
}

// ── POST /api/assessment/phq9/submit ─────────────────────────────────
const submitAssessment = (type) => async (req, res, next) => {
  try {
    const { answers } = req.body
    const requiredCount = type === 'PHQ-9' ? 9 : 7
    const maxScore      = type === 'PHQ-9' ? 27 : 21

    if (!answers || answers.length < requiredCount) {
      return res.status(422).json({
        success: false,
        message: `All ${requiredCount} questions must be answered`,
        errors: [{ field: 'answers', message: `${requiredCount} answers required` }],
      })
    }

    // Validate each answer value 0-3
    for (const a of answers) {
      if (a.value < 0 || a.value > 3) {
        return res.status(422).json({ success: false, message: 'Each answer must be 0–3' })
      }
    }

    const score    = answers.reduce((s, a) => s + (a.value || 0), 0)
    const severity = type === 'PHQ-9' ? getPHQ9Severity(score) : getGAD7Severity(score)

    // Crisis check: PHQ-9 Q9 > 0 OR score >= 20
    const q9Value     = type === 'PHQ-9' ? (answers.find(a => a.questionId === 9)?.value || 0) : 0
    const isCrisisFlag = type === 'PHQ-9' && (q9Value > 0 || score >= 20)

    // AI interpretation (non-blocking for speed but awaited for response data)
    const [interpretation] = await Promise.all([
      gemini.generateAssessmentInterpretation(type, score, severity),
    ])
    const recommendation = getRecommendation(type, severity)

    const assessment = await Assessment.create({
      user: req.user.id, type, answers, score, maxScore,
      severity, interpretation, recommendation, isCrisisFlag,
    })

    // Post-save side effects
    const user = await User.findById(req.user.id).select('assignedDoctor email')

    if (isCrisisFlag) {
      await createNotification({
        userId:  req.user.id,
        type:    'assessment',
        title:   '⚠️ Important: Please seek support',
        message: 'Your assessment result includes a risk indicator. Please consider reaching out to a mental health professional or crisis helpline immediately.',
        link:    '/care',
      })

      // Alert admin and assigned doctor
      const adminUsers = await User.find({ role: 'admin' }).select('email')
      const alertEmails = adminUsers.map(a => a.email)
      if (user.assignedDoctor) {
        const doctor = await User.findById(user.assignedDoctor).select('email')
        if (doctor) alertEmails.push(doctor.email)
      }
      for (const email of alertEmails) {
        sendMail({
          to: email,
          subject: '[SAHARA ALERT] Risk indicator — review required',
          html: crisisAlertEmail(req.user.id, type, new Date()),
        })
      }
    } else {
      await createNotification({
        userId:  req.user.id,
        type:    'assessment',
        title:   'Assessment completed',
        message: `Your ${type} screening has been completed. View your results in the Assessments section.`,
        link:    `/assessment/${assessment._id}`,
      })
    }

    // Recalc wellness progress
    const { format, subDays } = require('../utils/dateHelper')
    const now = new Date()
    const recentAssessment = score !== undefined
    const Journal = require('../models/Journal')
    const MoodLog = require('../models/MoodLog')
    const Appointment = require('../models/Appointment')
    const [weekJournals, todayMood, upcomingAppts, moodLogs] = await Promise.all([
      Journal.find({ user: req.user.id, createdAt: { $gte: subDays(now, 7) } }),
      MoodLog.findOne({ user: req.user.id, logDate: format(now) }),
      Appointment.find({ user: req.user.id, status: 'upcoming', date: { $gte: format(now) } }).limit(1),
      MoodLog.find({ user: req.user.id, logDate: { $gte: format(subDays(now, 7)) } }),
    ])
    const avgMood = moodLogs.length ? moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length : 0
    const userDoc = await User.findById(req.user.id).select('createdAt')
    const accountAgeDays = (now - new Date(userDoc.createdAt)) / (1000 * 60 * 60 * 24)
    let p = 20 // assessment done
    if (weekJournals.length > 0) p += 20
    if (todayMood) p += 15
    if (upcomingAppts.length > 0) p += 15
    if (avgMood >= 3) p += 15
    if (accountAgeDays > 7) p += 15
    await User.findByIdAndUpdate(req.user.id, { wellnessProgress: Math.min(100, p) })

    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'ASSESSMENT_SUBMITTED', target: 'Assessment', targetId: assessment._id.toString(), req, metadata: { type, score, severity, isCrisisFlag } })

    return res.status(201).json({
      success: true,
      message: 'Assessment submitted',
      data: { assessment, interpretation, recommendation, isCrisis: isCrisisFlag },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/assessment/history ───────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Assessment.countDocuments({ user: req.user.id })
    const data  = await Assessment.find({ user: req.user.id }).sort('-createdAt').skip(skip).limit(parseInt(limit))
    return res.status(200).json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/assessment/:id ───────────────────────────────────────────
const getAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' })

    const isOwner = assessment.user.toString() === req.user.id

    // Doctor: only allowed if they are the patient's assignedDoctor
    let isDoctorAllowed = false
    if (req.user.role === 'doctor') {
      const patient = await User.findById(assessment.user).select('assignedDoctor')
      isDoctorAllowed = patient?.assignedDoctor?.toString() === req.user.id
    }

    // Admin can view any assessment
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isDoctorAllowed && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this assessment' })
    }

    return res.status(200).json({ success: true, data: assessment })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  submitPHQ9:    submitAssessment('PHQ-9'),
  submitGAD7:    submitAssessment('GAD-7'),
  getHistory,
  getAssessment,
}
