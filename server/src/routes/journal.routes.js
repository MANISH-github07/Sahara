const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/journal.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth    = [verifyToken, requireRole('patient')]
const rules   = [
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
  body('mood').isIn(['excellent','good','neutral','low','difficult']).withMessage('Invalid mood value'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Max 10 tags'),
]

router.get('/',    auth, ctrl.listJournals)
router.get('/:id', auth, ctrl.getJournal)
router.post('/',   auth, rules, validate, ctrl.createJournal)
router.put('/:id', auth, [
  body('content').optional().trim().isLength({ max: 10000 }),
  body('mood').optional().isIn(['excellent','good','neutral','low','difficult']),
], validate, ctrl.updateJournal)
router.delete('/:id', auth, ctrl.deleteJournal)

module.exports = router
