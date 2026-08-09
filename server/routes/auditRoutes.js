const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/auditController');

router.get('/dashboard',    auth, ctrl.getDashboard);
router.get('/search',       auth, role('admin'), ctrl.searchDocuments);
router.get('/logs',         auth, role('admin'), ctrl.getAllAuditLogs);
router.get('/:doc_id',      auth, role('admin'), ctrl.getAuditTrail);

module.exports = router;
