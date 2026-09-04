/**
 * Global error handler — must be last middleware in app.js (4 arguments).
 * Maps known error types to appropriate HTTP status codes.
 * Never exposes stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production'

  // Log the full error server-side
  console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.error(`   ${err.name}: ${err.message}`)
  if (!isProd) console.error(err.stack)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }))
    return res.status(422).json({ success: false, message: 'Validation failed', errors })
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      errors: [{ field, message: 'Already in use' }],
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' })
  }

  // HTTP errors with explicit status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
    })
  }

  // Fallback 500
  return res.status(500).json({
    success:  false,
    message:  isProd ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  })
}

module.exports = errorHandler
