const jwt = require('jsonwebtoken')

/**
 * Sign a short-lived access token (default 15m).
 * payload: { id, role, email }
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  })

/**
 * Sign a long-lived refresh token (default 7d).
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  })

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET)

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET)

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken }
