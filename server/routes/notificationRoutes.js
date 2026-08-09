const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const ctrl    = require('../controllers/notificationController');

router.get('/', auth, ctrl.getNotifications);

module.exports = router;
