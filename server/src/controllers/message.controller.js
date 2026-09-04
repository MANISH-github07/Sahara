const Message  = require('../models/Message')
const User     = require('../models/User')
const { createNotification } = require('../services/notification.service')

// ── GET /api/messages — list messages in the thread ──────────────────
const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id
    const role   = req.user.role

    let patient, doctor
    if (role === 'patient') {
      patient = userId
      // Find their assigned doctor
      const user = await User.findById(userId).select('assignedDoctor')
      if (!user?.assignedDoctor) {
        return res.status(200).json({ success: true, data: [], message: 'No doctor assigned yet' })
      }
      doctor = user.assignedDoctor.toString()
    } else if (role === 'doctor') {
      doctor  = userId
      patient = req.query.patientId
      if (!patient) {
        return res.status(400).json({ success: false, message: 'patientId query parameter required for doctors' })
      }
      // Verify the patient is assigned to this doctor
      const patientDoc = await User.findById(patient).select('assignedDoctor')
      if (!patientDoc || patientDoc.assignedDoctor?.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Patient not assigned to you' })
      }
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const messages = await Message.find({ patient, doctor })
      .sort('createdAt')
      .limit(200)
      .populate('sender', 'name avatar role')

    // Mark unread messages as read (messages sent BY the other party)
    await Message.updateMany(
      { patient, doctor, sender: { $ne: userId }, readAt: null },
      { readAt: new Date() }
    )

    return res.status(200).json({ success: true, data: messages })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/messages — send a message ─────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { content, patientId } = req.body
    const userId = req.user.id
    const role   = req.user.role

    if (!content || !content.trim()) {
      return res.status(422).json({ success: false, message: 'Message content required' })
    }

    let patient, doctor, recipientId, recipientRole

    if (role === 'patient') {
      patient = userId
      const user = await User.findById(userId).select('assignedDoctor')
      if (!user?.assignedDoctor) {
        return res.status(400).json({ success: false, message: 'You do not have an assigned doctor yet. Ask your admin to assign one.' })
      }
      doctor        = user.assignedDoctor.toString()
      recipientId   = doctor
      recipientRole = 'doctor'
    } else if (role === 'doctor') {
      if (!patientId) {
        return res.status(422).json({ success: false, message: 'patientId required' })
      }
      // Verify assignment
      const patientDoc = await User.findById(patientId).select('assignedDoctor')
      if (!patientDoc || patientDoc.assignedDoctor?.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Patient not assigned to you' })
      }
      doctor        = userId
      patient       = patientId
      recipientId   = patient
      recipientRole = 'patient'
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const message = await Message.create({
      patient,
      doctor,
      sender:  userId,
      content: content.trim(),
    })

    const populated = await Message.findById(message._id).populate('sender', 'name avatar role')

    // Notify recipient
    const sender = await User.findById(userId).select('name')
    await createNotification({
      userId:  recipientId,
      type:    'care',
      title:   `New message from ${sender.name}`,
      message: content.trim().slice(0, 100),
      link:    recipientRole === 'patient' ? '/messages' : `/messages?patientId=${patient}`,
    })

    return res.status(201).json({ success: true, data: populated })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/messages/unread-count ───────────────────────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id
    const role   = req.user.role

    let query
    if (role === 'patient') {
      const user = await User.findById(userId).select('assignedDoctor')
      if (!user?.assignedDoctor) return res.status(200).json({ success: true, data: { count: 0 } })
      query = { patient: userId, doctor: user.assignedDoctor, sender: { $ne: userId }, readAt: null }
    } else if (role === 'doctor') {
      query = { doctor: userId, sender: { $ne: userId }, readAt: null }
    } else {
      return res.status(200).json({ success: true, data: { count: 0 } })
    }

    const count = await Message.countDocuments(query)
    return res.status(200).json({ success: true, data: { count } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getMessages, sendMessage, getUnreadCount }
