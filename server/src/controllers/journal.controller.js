const Journal  = require('../models/Journal')
const User     = require('../models/User')
const gemini   = require('../services/gemini.service')
const { createNotification } = require('../services/notification.service')
const { logAction }          = require('../services/audit.service')

// ── Recalculate and update wellness progress ──────────────────────────
const recalcProgress = async (userId) => {
  try {
    const Assessment  = require('../models/Assessment')
    const MoodLog     = require('../models/MoodLog')
    const Appointment = require('../models/Appointment')
    const { format, subDays, startOfMonth } = require('../utils/dateHelper')
    const now = new Date()
    const today = format(now)
    const [recentAssessment, weekJournals, todayMood, upcomingAppts, moodLogs] = await Promise.all([
      Assessment.findOne({ user: userId, createdAt: { $gte: subDays(now, 30) } }),
      Journal.find({ user: userId, createdAt: { $gte: subDays(now, 7) } }),
      MoodLog.findOne({ user: userId, logDate: today }),
      Appointment.find({ user: userId, status: 'upcoming', date: { $gte: today } }).limit(1),
      MoodLog.find({ user: userId, logDate: { $gte: format(subDays(now, 7)) } }),
    ])
    const avgMood = moodLogs.length ? moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length : 0
    const user = await User.findById(userId).select('createdAt')
    const accountAgeDays = (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    let p = 0
    if (recentAssessment) p += 20
    if (weekJournals.length > 0) p += 20
    if (todayMood) p += 15
    if (upcomingAppts.length > 0) p += 15
    if (avgMood >= 3) p += 15
    if (accountAgeDays > 7) p += 15
    await User.findByIdAndUpdate(userId, { wellnessProgress: Math.min(100, p) })
  } catch {}
}

// ── GET /api/journal ──────────────────────────────────────────────────
const listJournals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, mood, search, startDate, endDate } = req.query
    const query = { user: req.user.id }
    if (mood) query.mood = mood
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate)   query.createdAt.$lte = new Date(endDate)
    }
    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ]
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Journal.countDocuments(query)
    const journals = await Journal.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    // Truncate content in list view
    const data = journals.map(j => ({
      ...j,
      content: j.content.length > 200 ? j.content.slice(0, 200) + '…' : j.content,
    }))

    return res.status(200).json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/journal/:id ──────────────────────────────────────────────
const getJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id)
    if (!journal) return res.status(404).json({ success: false, message: 'Journal entry not found' })
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    return res.status(200).json({ success: true, data: journal })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/journal ─────────────────────────────────────────────────
const createJournal = async (req, res, next) => {
  try {
    const { title, content, mood, tags } = req.body
    const journal = await Journal.create({
      user: req.user.id, title: title || 'Untitled entry', content, mood, tags: tags || [],
    })

    // Respond immediately — AI insight generated asynchronously
    res.status(201).json({ success: true, message: 'Journal entry saved', data: journal })

    // Non-blocking AI insight generation
    setImmediate(async () => {
      try {
        const insight = await gemini.generateJournalInsight(content, mood)
        if (insight) await Journal.findByIdAndUpdate(journal._id, { aiInsight: insight })
      } catch {}
      await recalcProgress(req.user.id)
    })

    await createNotification({
      userId:  req.user.id,
      type:    'wellness',
      title:   'Journal entry saved',
      message: 'Your journal entry has been saved privately.',
      link:    `/journal/${journal._id}`,
    })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/journal/:id ──────────────────────────────────────────────
const updateJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id)
    if (!journal) return res.status(404).json({ success: false, message: 'Not found' })
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    const { title, content, mood, tags } = req.body
    if (title !== undefined) journal.title   = title
    if (content !== undefined) journal.content = content
    if (mood !== undefined)  journal.mood    = mood
    if (tags !== undefined)  journal.tags    = tags
    await journal.save()
    return res.status(200).json({ success: true, data: journal })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/journal/:id ───────────────────────────────────────────
const deleteJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id)
    if (!journal) return res.status(404).json({ success: false, message: 'Not found' })
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    await journal.deleteOne()
    return res.status(200).json({ success: true, message: 'Journal entry deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listJournals, getJournal, createJournal, updateJournal, deleteJournal }
