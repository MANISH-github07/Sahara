const mongoose = require('mongoose')

/**
 * DoctorNote — Clinical notes added by a doctor about a patient.
 * Replaces the previous AuditLog workaround.
 */
const doctorNoteSchema = new mongoose.Schema(
  {
    doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    content:       { type: String, required: true, maxlength: 5000, trim: true },
    isConfidential:{ type: Boolean, default: true },  // patient cannot see confidential notes
  },
  { timestamps: true }
)

doctorNoteSchema.index({ doctor: 1, patient: 1, createdAt: -1 })

module.exports = mongoose.model('DoctorNote', doctorNoteSchema)
