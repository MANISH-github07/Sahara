const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 8, select: false },
    role:      { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    avatar:    { type: String, default: null },
    language:  { type: String, default: 'en' },
    isActive:  { type: Boolean, default: true },
    isVerified:{ type: Boolean, default: false },
    lastLogin: { type: Date, default: null },

    // ── Patient fields ─────────────────────────────────────────────
    wellnessProgress: { type: Number, default: 0, min: 0, max: 100 },
    assignedDoctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // AI insights cache (avoids regenerating every dashboard load)
    aiInsightsCache: {
      recommendations: [String],
      generatedAt: { type: Date, default: null },
    },

    // ── Doctor fields ───────────────────────────────────────────────
    specialty:       { type: String, default: null },
    qualifications:  { type: String, default: null },
    experience:      { type: String, default: null },
    bio:             { type: String, maxlength: 1000, default: null },
    languages:       [{ type: String }],
    consultationFee: { type: Number, default: null },
    sessionTypes:    [{ type: String, enum: ['video', 'in-person', 'phone'] }],
    isAvailable:     { type: Boolean, default: true },
    rating:          { type: Number, default: 0 },
    reviewCount:     { type: Number, default: 0 },

    // ── Doctor working schedule ─────────────────────────────────────
    // availableSlots: array of HH:MM strings the doctor accepts bookings for
    // If empty, defaults to standard slots: ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00']
    availableSlots:  [{ type: String }],  // e.g. ['09:00','10:00','11:00']
    workingDays:     { type: [Number], default: [1,2,3,4,5] }, // 0=Sun,1=Mon…6=Sat

    // ── Email verification fields ────────────────────────────────────
    emailVerifyToken:  { type: String, select: false, default: null },
    emailVerifyExpiry: { type: Date,   select: false, default: null },

    // ── Password reset ──────────────────────────────────────────────
    resetPasswordToken:  { type: String, select: false, default: null },
    resetPasswordExpiry: { type: Date,   select: false, default: null },
  },
  { timestamps: true }
)

// ── Pre-save: hash password if modified ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// ── Instance method: compare password ────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

// ── Safe public profile (no sensitive fields) ─────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpiry
  delete obj.__v
  return obj
}

module.exports = mongoose.model('User', userSchema)
