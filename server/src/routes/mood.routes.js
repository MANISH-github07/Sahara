const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/mood.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth = [verifyToken, requireRole('patient')]

router.get('/history', auth, ctrl.getMoodHistory)
router.post('/', auth,
  [
    body('mood').isIn(['excellent','good','calm','neutral','low','difficult']).withMessage('Invalid mood'),
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1–5'),
    body('note').optional().isLength({ max: 500 }),
  ],
  validate, ctrl.logMood
)
router.delete('/:id', auth, ctrl.deleteMood)

module.exports = router
