const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:    { type: String, enum: ['appointment', 'assessment', 'wellness', 'ai', 'care', 'system'], default: 'system' },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    readAt:  { type: Date,   default: null },
    link:    { type: String, default: null },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1, read: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
