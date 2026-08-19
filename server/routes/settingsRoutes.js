const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const controller = require('../controllers/settingsController');

router.get('/system', auth, role('super_admin'), controller.getSystemConfiguration);
router.put('/system', auth, role('super_admin'), controller.updateSystemConfiguration);

module.exports = router;
