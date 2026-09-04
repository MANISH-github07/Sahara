const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/message.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth = [verifyToken, requireRole('patient', 'doctor')]

router.get('/',             auth, ctrl.getMessages)
router.get('/unread-count', auth, ctrl.getUnreadCount)
router.post('/',            auth,
  [body('content').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message required, max 2000 chars')],
  validate,
  ctrl.sendMessage
)

module.exports = router
