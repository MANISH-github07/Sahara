const router    = require('express').Router()
const { body }  = require('express-validator')
const ctrl      = require('../controllers/auth.controller')
const validate  = require('../middleware/validate')
const verifyToken = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimiter')

// ── POST /api/auth/register ───────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  validate,
  ctrl.register
)

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
)

// ── POST /api/auth/refresh ────────────────────────────────────────────
router.post('/refresh', ctrl.refresh)

// ── POST /api/auth/logout ─────────────────────────────────────────────
router.post('/logout', verifyToken, ctrl.logout)

// ── POST /api/auth/forgot-password ────────────────────────────────────
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validate,
  ctrl.forgotPassword
)

// ── POST /api/auth/reset-password ─────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('token').notEmpty().withMessage('Reset token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  ctrl.resetPassword
)

// ── POST /api/auth/verify-email ───────────────────────────────────────
router.post(
  '/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('token').notEmpty().withMessage('Verification token required'),
  ],
  validate,
  ctrl.verifyEmail
)

// ── POST /api/auth/resend-verification ────────────────────────────────
router.post(
  '/resend-verification',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  ctrl.resendVerification
)

// ── GET /api/auth/me ──────────────────────────────────────────────────
router.get('/me', verifyToken, ctrl.getMe)

module.exports = router
