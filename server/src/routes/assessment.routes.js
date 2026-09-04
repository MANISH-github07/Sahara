const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/assessment.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth = [verifyToken, requireRole('patient')]
const answersRule = [
  body('answers').isArray({ min: 1 }).withMessage('Answers array required'),
  body('answers.*.questionId').isInt({ min: 1 }).withMessage('questionId must be a positive integer'),
  body('answers.*.value').isInt({ min: 0, max: 3 }).withMessage('Answer value must be 0–3'),
]

router.post('/phq9/submit', auth, answersRule, validate, ctrl.submitPHQ9)
router.post('/gad7/submit', auth, answersRule, validate, ctrl.submitGAD7)
router.get('/history',      auth, ctrl.getHistory)
router.get('/:id',  verifyToken, ctrl.getAssessment)

module.exports = router
