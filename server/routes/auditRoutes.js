const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/auditController');

const admins = role('super_admin', 'system_admin');

router.get('/dashboard', auth,        ctrl.getDashboard);
router.get('/logs',      auth, admins, ctrl.getAllAuditLogs);
router.get('/search',    auth, admins, ctrl.searchDocuments);
router.get('/:doc_id',   auth, admins, ctrl.getAuditTrail);

module.exports = router;
