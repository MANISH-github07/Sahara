const router      = require('express').Router()
const ctrl        = require('../controllers/dashboard.controller')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/roles')

router.get('/', verifyToken, requireRole('patient'), ctrl.getDashboard)

module.exports = router
