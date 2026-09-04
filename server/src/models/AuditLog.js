const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  actor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorEmail:  { type: String, default: null },
  action:      { type: String, required: true },
  target:      { type: String, default: null },
  targetId:    { type: String, default: null },
  result:      { type: String, enum: ['success', 'failure'], default: 'success' },
  ip:          { type: String, default: null },
  userAgent:   { type: String, default: null },
  metadata:    { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt:   { type: Date, default: Date.now },
})

auditLogSchema.index({ actor: 1, createdAt: -1 })
auditLogSchema.index({ action: 1 })
// TTL: auto-delete after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
