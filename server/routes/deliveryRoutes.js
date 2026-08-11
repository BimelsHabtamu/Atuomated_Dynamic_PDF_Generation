const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/deliveryController');

const admins     = role('super_admin', 'system_admin');
const canDeliver = role('super_admin', 'system_admin', 'generator');

router.get('/logs',      auth, admins,     ctrl.getDeliveryLogs);
router.post('/deliver',  auth, canDeliver, ctrl.deliverDocument);
router.get('/download',                    ctrl.downloadDocument);

module.exports = router;
