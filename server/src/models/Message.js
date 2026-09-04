const mongoose = require('mongoose')

/**
 * Message — Direct message between a patient and their assigned doctor.
 * Both parties can send and read messages in the same thread.
 */
const messageSchema = new mongoose.Schema(
  {
    // The two participants
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Who sent this specific message
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content:  { type: String, required: true, maxlength: 2000, trim: true },
    readAt:   { type: Date, default: null },   // null = unread by recipient
  },
  { timestamps: true }
)

messageSchema.index({ patient: 1, doctor: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)
