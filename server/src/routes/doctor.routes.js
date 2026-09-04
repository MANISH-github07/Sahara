const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/doctor.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth = [verifyToken, requireRole('doctor')]

router.get('/patients',       auth, ctrl.getPatients)
router.get('/patients/:id',   auth, ctrl.getPatientDetail)
router.post('/notes',         auth,
  [body('patientId').notEmpty(), body('content').notEmpty().isLength({ max: 5000 })],
  validate, ctrl.addNote
)
router.get('/notes/:patientId', auth, ctrl.getNotes)
router.get('/analytics',      auth, ctrl.getAnalytics)

module.exports = router
