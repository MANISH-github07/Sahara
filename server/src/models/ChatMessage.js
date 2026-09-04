const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role:     { type: String, required: true, enum: ['user', 'assistant'] },
    content:  { type: String, required: true, maxlength: 4000 },
    isCrisis: { type: Boolean, default: false },
    isAI:     { type: Boolean, default: false },
  },
  { timestamps: true }
)

chatMessageSchema.index({ user: 1, createdAt: -1 })
// TTL: auto-delete messages older than 90 days
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
