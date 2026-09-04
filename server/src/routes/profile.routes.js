const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/profile.controller')
const verifyToken = require('../middleware/auth')
const validate    = require('../middleware/validate')

router.get('/update',           verifyToken, ctrl.getProfile)
router.get('/',                 verifyToken, ctrl.getProfile)
router.put('/update',           verifyToken,
  [body('name').optional().trim().isLength({ min: 2, max: 100 })],
  validate, ctrl.updateProfile
)
router.post('/avatar',          verifyToken, ctrl.uploadAvatar)
router.post('/change-password', verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate, ctrl.changePassword
)

module.exports = router
