const User        = require('../models/User')
const Journal     = require('../models/Journal')
const Assessment  = require('../models/Assessment')
const Appointment = require('../models/Appointment')
const MoodLog     = require('../models/MoodLog')
const gemini      = require('../services/gemini.service')
const { format, subDays, startOfMonth, startOfWeek, isAfter } = require('../utils/dateHelper')

// ── GET /api/dashboard ────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id
    const user   = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const now     = new Date()
    const today   = format(now)                  // YYYY-MM-DD
    const weekAgo = subDays(now, 7)
    const monthStart = startOfMonth(now)

    // ── Parallel data fetch ───────────────────────────────────────────
    const [todayMood, moodLogs, journalMonthCount, weekJournals, lastAssessment, upcomingAppts] = await Promise.all([
      MoodLog.findOne({ user: userId, logDate: today }),
      MoodLog.find({ user: userId, logDate: { $gte: format(weekAgo) } }).sort('logDate'),
      Journal.countDocuments({ user: userId, createdAt: { $gte: monthStart } }),
      Journal.find({ user: userId, createdAt: { $gte: new Date(weekAgo) } }).select('tags'),
      Assessment.findOne({ user: userId }).sort('-createdAt'),
      Appointment.find({ patient: userId, status: 'upcoming', date: { $gte: today } })
        .sort('date time')
        .populate('doctor', 'name')
        .limit(1),
    ])

    // ── Wellness progress ─────────────────────────────────────────────
    const thirtyDaysAgo = subDays(now, 30)
    const recentAssessment = await Assessment.findOne({ user: userId, createdAt: { $gte: thirtyDaysAgo } })
    const avgMood = moodLogs.length
      ? moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length
      : 0
    const accountAgeDays = (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)

    let progress = 0
    if (recentAssessment) progress += 20
    if (weekJournals.length > 0) progress += 20
    if (todayMood) progress += 15
    if (upcomingAppts.length > 0) progress += 15
    if (avgMood >= 3) progress += 15
    if (accountAgeDays > 7) progress += 15
    progress = Math.min(100, progress)

    // Update stored wellness progress
    await User.findByIdAndUpdate(userId, { wellnessProgress: progress })

    // ── AI insights (cached 24h) ──────────────────────────────────────
    let aiRecommendations
    const cacheAge = user.aiInsightsCache?.generatedAt
      ? (now - new Date(user.aiInsightsCache.generatedAt)) / (1000 * 60 * 60)
      : Infinity

    if (cacheAge < 24 && user.aiInsightsCache?.recommendations?.length > 0) {
      aiRecommendations = user.aiInsightsCache.recommendations
    } else {
      const moodData    = moodLogs.map(m => ({ mood: m.mood, score: m.score }))
      const journalTags = weekJournals.flatMap(j => j.tags || [])
      const assessSummary = lastAssessment
        ? `${lastAssessment.type}: score ${lastAssessment.score}, ${lastAssessment.severity}`
        : 'No recent assessments'

      aiRecommendations = await gemini.generateWellnessSummary(moodData, journalTags, assessSummary)

      await User.findByIdAndUpdate(userId, {
        'aiInsightsCache.recommendations': aiRecommendations,
        'aiInsightsCache.generatedAt':     now,
      })
    }

    // ── Mood trend (last 7 days) ──────────────────────────────────────
    const MOOD_LABELS = { excellent:'Excellent', good:'Good', calm:'Calm', neutral:'Neutral', low:'Low', difficult:'Difficult' }
    const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const moodTrend   = moodLogs.map(m => ({
      day:   DAY_LABELS[new Date(m.logDate).getDay()],
      mood:  m.mood,
      score: m.score,
      label: MOOD_LABELS[m.mood] || m.mood,
    }))

    // ── Current mood ──────────────────────────────────────────────────
    const MOOD_META = {
      excellent: { label:'Excellent', description:'Feeling wonderful today', emoji:'😄' },
      good:      { label:'Good',      description:'Having a good day',       emoji:'😊' },
      calm:      { label:'Calm',      description:'Feeling balanced today',  emoji:'😌' },
      neutral:   { label:'Neutral',   description:'Feeling steady',          emoji:'😐' },
      low:       { label:'Low',       description:'Could be better today',   emoji:'😔' },
      difficult: { label:'Difficult', description:'Having a tough day',      emoji:'😢' },
    }
    const currentMood = todayMood
      ? { value: todayMood.mood, ...MOOD_META[todayMood.mood] }
      : null

    // ── Next appointment ──────────────────────────────────────────────
    const nextAppt = upcomingAppts[0]
    const nextAppointmentStr = nextAppt
      ? `${new Date(nextAppt.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}, ${nextAppt.time}`
      : null

    // ── Recent activity (last 10 combined) ───────────────────────────
    const [recentJournals, recentAssessments, recentMoods, recentApptActivity] = await Promise.all([
      Journal.find({ user: userId }).sort('-createdAt').limit(4).select('createdAt mood'),
      Assessment.find({ user: userId }).sort('-createdAt').limit(3).select('createdAt type'),
      MoodLog.find({ user: userId }).sort('-logDate').limit(3).select('logDate mood'),
      Appointment.find({ patient: userId }).sort('-createdAt').limit(3).select('createdAt status date'),
    ])

    const activity = [
      ...recentJournals.map(j => ({ id: j._id, type: 'journal', label: 'Journal entry added', time: timeAgo(j.createdAt) })),
      ...recentAssessments.map(a => ({ id: a._id, type: 'assessment', label: `${a.type} assessment completed`, time: timeAgo(a.createdAt) })),
      ...recentMoods.map(m => ({ id: m._id, type: 'mood', label: `Mood recorded — ${m.mood}`, time: m.logDate })),
      ...recentApptActivity.map(a => ({ id: a._id, type: 'appointment', label: `Appointment ${a.status}`, time: timeAgo(a.createdAt) })),
    ]
      .sort((a, b) => new Date(b.rawTime || b.time) - new Date(a.rawTime || a.time))
      .slice(0, 10)

    // ── Today's focus ────────────────────────────────────────────────
    const focuses = [
      'Complete today\'s journal and practice five minutes of mindful breathing.',
      'Log your mood and take a short break from screens.',
      'Write a brief gratitude note in your journal.',
      'Try a 5-minute grounding exercise in the Wellness section.',
      'Check in with yourself — how are you really feeling today?',
    ]
    const todayFocus = focuses[new Date().getDay() % focuses.length]

    // ── Greeting ──────────────────────────────────────────────────────
    const h = now.getHours()
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

    const updatedAt = `Today • ${now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}`

    return res.status(200).json({
      success: true,
      data: {
        greeting,
        wellnessProgress:    progress,
        todayFocus,
        currentMood,
        journalCount:        journalMonthCount,
        journalPeriod:       'This month',
        lastAssessment:      lastAssessment ? {
          name:        lastAssessment.type,
          status:      'Completed',
          score:       lastAssessment.score,
          completedAt: lastAssessment.createdAt,
        } : null,
        upcomingAppointments: upcomingAppts.length,
        nextAppointment:     nextAppointmentStr,
        aiInsights:          { recommendations: aiRecommendations, updatedAt },
        moodTrend,
        recentActivity:      activity,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Helper: human-readable time ago ──────────────────────────────────
function timeAgo(date) {
  if (!date) return ''
  const d    = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)    return 'Just now'
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1)  return 'Yesterday'
  if (days < 7)    return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

module.exports = { getDashboard }
