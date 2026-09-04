const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, trim: true, maxlength: 200, default: 'Untitled entry' },
    content:   { type: String, required: true, maxlength: 10000 },
    mood:      { type: String, required: true, enum: ['excellent', 'good', 'neutral', 'low', 'difficult'] },
    tags:      { type: [String], validate: [v => v.length <= 10, 'Max 10 tags'] },
    aiInsight: { type: String, default: null },
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
)

journalSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Journal', journalSchema)
