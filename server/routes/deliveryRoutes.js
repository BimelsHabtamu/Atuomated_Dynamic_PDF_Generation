const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const ctrl    = require('../controllers/deliveryController');

router.get('/logs',     auth, ctrl.getDeliveryLogs);
router.post('/deliver', auth, ctrl.deliverDocument);
router.get('/download', ctrl.downloadDocument);

module.exports = router;
