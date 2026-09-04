const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, required: true, enum: ['video', 'in-person', 'phone'] },
    status:   { type: String, enum: ['upcoming', 'in_progress', 'completed', 'cancelled', 'no_show'], default: 'upcoming' },
    date:     { type: String, required: true },  // YYYY-MM-DD
    time:     { type: String, required: true },  // HH:MM
    duration: { type: Number, default: 50 },
    notes:    { type: String, maxlength: 1000, default: null },
    cancelledBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancellationReason:  { type: String, default: null },
    reminderSent:        { type: Boolean, default: false },  // set true after 24h reminder email fires
  },
  { timestamps: true }
)

appointmentSchema.index({ patient: 1, date: 1 })
appointmentSchema.index({ doctor:  1, date: 1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
