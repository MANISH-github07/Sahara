const router      = require('express').Router()
const { body }    = require('express-validator')
const ctrl        = require('../controllers/admin.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const validate    = require('../middleware/validate')

const auth = [verifyToken, requireRole('admin')]

router.get('/stats',            auth, ctrl.getStats)
router.get('/users',            auth, ctrl.listUsers)
router.patch('/users/:id',      auth, ctrl.updateUser)
router.delete('/users/:id',     auth, ctrl.deleteUser)
router.get('/professionals',    auth, ctrl.listProfessionals)
router.post('/professionals',   auth,
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('specialty').notEmpty(),
  ],
  validate, ctrl.createProfessional
)
router.get('/audit-logs',       auth, ctrl.getAuditLogs)

module.exports = router
