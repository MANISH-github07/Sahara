const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/appointment.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

router.get( '/',              verifyToken, ctrl.listAppointments)
router.get( '/doctors',       verifyToken, ctrl.getDoctors)
router.get( '/doctors/:id/availability', verifyToken, ctrl.getDoctorAvailability)
router.put( '/doctors/schedule', verifyToken, ctrl.updateSchedule)
router.post('/',              verifyToken, requireRole('patient'),
  [
    body('doctorId').notEmpty().withMessage('doctorId required'),
    body('type').isIn(['video','in-person','phone']).withMessage('Invalid session type'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:MM'),
  ],
  validate, ctrl.bookAppointment
)
router.patch('/:id/cancel',   verifyToken, ctrl.cancelAppointment)
router.patch('/:id/complete', verifyToken, requireRole('doctor'), ctrl.completeAppointment)

module.exports = router
