const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const ctrl    = require('../controllers/esignController');

router.post('/request',   auth, ctrl.requestSignature);
router.post('/otp/send',  auth, ctrl.sendOtp);
router.post('/otp/verify',auth, ctrl.verifyOtp);
router.post('/approve',   auth, ctrl.approveDocument);
router.post('/reject',    auth, ctrl.rejectDocument);
router.get('/pending',    auth, ctrl.getPendingRequests);

module.exports = router;
