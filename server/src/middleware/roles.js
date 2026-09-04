/**
 * requireRole(...roles) — restrict a route to specific roles.
 * Must be used AFTER verifyToken middleware.
 *
 * Usage:
 *   router.get('/admin/stats', verifyToken, requireRole('admin'), handler)
 *   router.get('/doctor/patients', verifyToken, requireRole('doctor', 'admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    })
  }
  next()
}

module.exports = requireRole
