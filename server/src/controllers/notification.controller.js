const Notification = require('../models/Notification')

// ── GET /api/notifications ────────────────────────────────────────────
const listNotifications = async (req, res, next) => {
  try {
    const { read, page = 1, limit = 20 } = req.query
    const query = { user: req.user.id }
    if (read === 'true')  query.read = true
    if (read === 'false') query.read = false

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Notification.countDocuments(query)
    const data  = await Notification.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit))

    return res.status(200).json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/notifications/:id/read ────────────────────────────────
const markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id)
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' })
    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    notif.read   = true
    notif.readAt = new Date()
    await notif.save()
    return res.status(200).json({ success: true, data: notif })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/notifications/read-all ─────────────────────────────────
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true, readAt: new Date() }
    )
    return res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/notifications/:id ─────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id)
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' })
    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    await notif.deleteOne()
    return res.status(200).json({ success: true, message: 'Notification deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listNotifications, markRead, markAllRead, deleteNotification }
