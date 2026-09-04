const MoodLog = require('../models/MoodLog')
const { format, subDays } = require('../utils/dateHelper')

// ── GET /api/mood/history ─────────────────────────────────────────────
const getMoodHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7
    const from = format(subDays(new Date(), days))
    const logs = await MoodLog.find({ user: req.user.id, logDate: { $gte: from } }).sort('logDate')
    return res.status(200).json({ success: true, data: logs })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/mood ────────────────────────────────────────────────────
const logMood = async (req, res, next) => {
  try {
    const { mood, score, note, logDate } = req.body
    const dateStr = logDate || format(new Date())

    // Upsert: one entry per day per user
    const log = await MoodLog.findOneAndUpdate(
      { user: req.user.id, logDate: dateStr },
      { mood, score, note: note || null },
      { new: true, upsert: true, runValidators: true }
    )

    return res.status(200).json({ success: true, message: 'Mood logged', data: log })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/mood/:id ──────────────────────────────────────────────
const deleteMood = async (req, res, next) => {
  try {
    const log = await MoodLog.findById(req.params.id)
    if (!log) return res.status(404).json({ success: false, message: 'Mood log not found' })
    if (log.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    await log.deleteOne()
    return res.status(200).json({ success: true, message: 'Mood log deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getMoodHistory, logMood, deleteMood }
