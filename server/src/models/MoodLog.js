const mongoose = require('mongoose')

const moodLogSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood:    { type: String, required: true, enum: ['excellent', 'good', 'calm', 'neutral', 'low', 'difficult'] },
    score:   { type: Number, required: true, min: 1, max: 5 },
    note:    { type: String, maxlength: 500, default: null },
    logDate: { type: String, required: true },  // YYYY-MM-DD
  },
  { timestamps: true }
)

// One entry per user per day
moodLogSchema.index({ user: 1, logDate: 1 }, { unique: true })

module.exports = mongoose.model('MoodLog', moodLogSchema)
