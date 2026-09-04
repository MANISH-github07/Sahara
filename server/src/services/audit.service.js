const AuditLog = require('../models/AuditLog')

/**
 * Write an audit log entry.
 * Never throws — catches internally so audit failure never crashes a request.
 *
 * @param {Object} options
 * @param {string}  options.actor      - User ID (optional)
 * @param {string}  options.actorEmail - User email
 * @param {string}  options.action     - Action name (e.g. USER_LOGIN)
 * @param {string}  options.target     - Resource type (e.g. 'User', 'Journal')
 * @param {string}  options.targetId   - Resource ID
 * @param {string}  options.result     - 'success' | 'failure'
 * @param {Object}  options.req        - Express req (for IP and user-agent)
 * @param {Object}  options.metadata   - Any extra context
 */
const logAction = async ({
  actor,
  actorEmail,
  action,
  target,
  targetId,
  result = 'success',
  req,
  metadata,
}) => {
  try {
    await AuditLog.create({
      actor:      actor     || null,
      actorEmail: actorEmail|| null,
      action,
      target:     target    || null,
      targetId:   targetId  || null,
      result,
      ip:         req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent:  req?.headers?.['user-agent'] || null,
      metadata:   metadata || null,
    })
  } catch (err) {
    console.error('⚠️  Audit log failed:', err.message)
  }
}

module.exports = { logAction }
