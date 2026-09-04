const crypto       = require('crypto')
const User         = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt')
const { sendMail, welcomeEmail, passwordResetEmail, emailVerificationEmail } = require('../config/mailer')
const { logAction }            = require('../services/audit.service')
const { createNotification }   = require('../services/notification.service')

// ── Helper: create and persist a refresh token ───────────────────────
const createRefreshToken = async (userId) => {
  const payload = { id: userId }
  const token   = signRefreshToken(payload)
  const ms      = parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || 7) * 24 * 60 * 60 * 1000
  await RefreshToken.create({ token, user: userId, expiresAt: new Date(Date.now() + ms) })
  return token
}

// ── POST /api/auth/register ───────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password, role: 'patient', isVerified: true })

    const accessToken  = signAccessToken({ id: user._id, role: user.role, email: user.email })
    const refreshToken = await createRefreshToken(user._id)

    await createNotification({
      userId:  user._id,
      type:    'system',
      title:   'Welcome to SAHARA 🌊',
      message: `Hi ${user.name}! Your wellness journey begins today. Start by logging your mood or writing your first journal entry.`,
      link:    '/dashboard',
    })

    await logAction({ actor: user._id, actorEmail: user.email, action: 'USER_REGISTERED', target: 'User', targetId: user._id.toString(), req })

    // Send welcome email
    sendMail({ to: user.email, subject: 'Welcome to SAHARA — Your wellness journey begins', html: welcomeEmail(user.name) })

    return res.status(201).json({
      success:      true,
      message:      'Account created successfully',
      data: {
        token:        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      await logAction({ actorEmail: email, action: 'LOGIN_FAILED', result: 'failure', req })
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended. Please contact support.' })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const accessToken  = signAccessToken({ id: user._id, role: user.role, email: user.email })
    const refreshToken = await createRefreshToken(user._id)

    await logAction({ actor: user._id, actorEmail: user.email, action: 'USER_LOGIN', target: 'User', targetId: user._id.toString(), req })

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token:        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' })
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken })
    if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' })
    }

    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    // Rotate: revoke old, issue new
    tokenDoc.isRevoked = true
    await tokenDoc.save()

    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' })
    }

    const newAccessToken  = signAccessToken({ id: user._id, role: user.role, email: user.email })
    const newRefreshToken = await createRefreshToken(user._id)

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { token: newAccessToken, refreshToken: newRefreshToken },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true })
    }
    await logAction({ actor: req.user?.id, actorEmail: req.user?.email, action: 'USER_LOGOUT', req })
    return res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/forgot-password ────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      // Prevent user enumeration — always return 200
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link was sent' })
    }

    // Generate a signed token (contains email + timestamp)
    const rawToken  = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    user.resetPasswordToken  = tokenHash
    user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 min
    await user.save({ validateBeforeSave: false })

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`
    sendMail({ to: email, subject: 'Reset your SAHARA password — expires in 15 minutes', html: passwordResetEmail(user.name, resetLink) })

    await logAction({ actor: user._id, actorEmail: user.email, action: 'PASSWORD_RESET_REQUESTED', req })

    return res.status(200).json({ success: true, message: 'If that email exists, a reset link was sent' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/reset-password ─────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password } = req.body

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpiry')

    if (!user || user.resetPasswordToken !== tokenHash || user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' })
    }

    user.password            = password
    user.resetPasswordToken  = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true })

    await logAction({ actor: user._id, actorEmail: user.email, action: 'PASSWORD_RESET', req })

    return res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.status(200).json({ success: true, data: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe, verifyEmail, resendVerification }

// ── POST /api/auth/verify-email ───────────────────────────────────────
async function verifyEmail(req, res, next) {
  try {
    const { email, token } = req.body
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({ email }).select('+emailVerifyToken +emailVerifyExpiry')
    if (!user) return res.status(400).json({ success: false, message: 'Invalid verification link' })
    if (user.isVerified) return res.status(200).json({ success: true, message: 'Email already verified' })
    if (user.emailVerifyToken !== tokenHash || user.emailVerifyExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification link is invalid or has expired. Request a new one.' })
    }

    user.isVerified        = true
    user.emailVerifyToken  = undefined
    user.emailVerifyExpiry = undefined
    await user.save({ validateBeforeSave: false })

    await logAction({ actor: user._id, actorEmail: user.email, action: 'EMAIL_VERIFIED', req })

    return res.status(200).json({ success: true, message: 'Email verified successfully! You now have full access.' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/resend-verification ────────────────────────────────
async function resendVerification(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(200).json({ success: true, message: 'If that account exists, a verification email was sent.' })
    if (user.isVerified) return res.status(200).json({ success: true, message: 'Your email is already verified.' })

    const rawToken  = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.emailVerifyToken  = tokenHash
    user.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const verifyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`
    sendMail({ to: email, subject: 'Verify your SAHARA email address', html: emailVerificationEmail(user.name, verifyLink) })

    return res.status(200).json({ success: true, message: 'Verification email sent. Check your inbox.' })
  } catch (err) {
    next(err)
  }
}
