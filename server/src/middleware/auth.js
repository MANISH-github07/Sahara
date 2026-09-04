const { verifyAccessToken } = require('../config/jwt')

/**
 * verifyToken — attaches req.user = { id, role, email }
 * Returns 401 for missing/expired tokens, 403 for tampered tokens.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' })
    }
    return res.status(403).json({ success: false, message: 'Invalid token' })
  }
}

module.exports = verifyToken
