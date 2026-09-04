const mongoose = require('mongoose')

const assessmentSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:           { type: String, required: true, enum: ['PHQ-9', 'GAD-7'] },
    answers:        [{ questionId: Number, value: Number }],
    score:          { type: Number, required: true },
    maxScore:       { type: Number, required: true },
    severity:       { type: String, enum: ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe'] },
    interpretation: { type: String, default: null },
    recommendation: { type: String, default: null },
    isCrisisFlag:   { type: Boolean, default: false },
    reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote:     { type: String, default: null },
  },
  { timestamps: true }
)

assessmentSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Assessment', assessmentSchema)
