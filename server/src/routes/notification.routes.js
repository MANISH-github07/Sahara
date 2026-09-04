const router      = require('express').Router()
const ctrl        = require('../controllers/notification.controller')
const verifyToken = require('../middleware/auth')

router.get('/',           verifyToken, ctrl.listNotifications)
router.patch('/:id/read', verifyToken, ctrl.markRead)
router.post('/read-all',  verifyToken, ctrl.markAllRead)
router.delete('/:id',     verifyToken, ctrl.deleteNotification)

module.exports = router
