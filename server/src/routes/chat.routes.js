const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/chat.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')
const { chatLimiter } = require('../middleware/rateLimiter')

const auth = [verifyToken, requireRole('patient')]

router.get('/history', auth, ctrl.getChatHistory)
router.post('/send',
  auth,
  chatLimiter,
  [body('content').trim().notEmpty().withMessage('Message content required').isLength({ max: 4000 })],
  validate,
  ctrl.sendMessage
)

module.exports = router
