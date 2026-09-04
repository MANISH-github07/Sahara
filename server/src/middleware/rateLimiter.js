const rateLimit = require('express-rate-limit')

/** Auth endpoints: login, register, forgot-password — 10 per 15 min per IP */
const authLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,
  max:       10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please wait and try again.' },
})

/** General API: 100 per 15 min per IP */
const apiLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,
  max:       100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
})

/** Chat endpoint: 30 per minute per IP */
const chatLimiter = rateLimit({
  windowMs:  60 * 1000,
  max:       30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Chat rate limit reached. Please wait a moment.' },
})

module.exports = { authLimiter, apiLimiter, chatLimiter }
