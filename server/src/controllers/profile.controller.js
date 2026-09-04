const path    = require('path')
const multer  = require('multer')
const User    = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const { logAction } = require('../services/audit.service')

// ── Multer config ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.user.id}_${Date.now()}${ext}`)
  },
})

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true)
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)
  },
})

// ── GET /api/profile ──────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.status(200).json({ success: true, data: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/profile/update ───────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, language, specialty, bio, sessionTypes, consultationFee, isAvailable } = req.body
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (name !== undefined)            user.name            = name
    if (language !== undefined)        user.language        = language
    if (specialty !== undefined)       user.specialty       = specialty
    if (bio !== undefined)             user.bio             = bio
    if (sessionTypes !== undefined)    user.sessionTypes    = sessionTypes
    if (consultationFee !== undefined) user.consultationFee = consultationFee
    if (isAvailable !== undefined)     user.isAvailable     = isAvailable

    await user.save()
    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'PROFILE_UPDATED', req })

    return res.status(200).json({ success: true, message: 'Profile updated', data: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/profile/avatar ──────────────────────────────────────────
const uploadAvatarMiddleware = upload.single('avatar')

const uploadAvatar = async (req, res, next) => {
  uploadAvatarMiddleware(req, res, async (err) => {
    if (err) return next(err)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }
    try {
      const avatarUrl = `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`
      await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl })
      return res.status(200).json({ success: true, message: 'Avatar updated', data: { avatarUrl } })
    } catch (e) {
      next(e)
    }
  })
}

// ── POST /api/profile/change-password ────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    // Revoke all refresh tokens (force re-login on all devices)
    await RefreshToken.updateMany({ user: req.user.id }, { isRevoked: true })

    await logAction({ actor: req.user.id, actorEmail: req.user.email, action: 'PASSWORD_CHANGED', req })

    return res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword }
