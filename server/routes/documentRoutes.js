const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/documentController');

const canGenerate = role('super_admin', 'system_admin', 'generator', 'approver');
const canView     = role('super_admin', 'system_admin', 'generator', 'approver', 'recipient');

router.post('/preview',     auth, canGenerate, ctrl.previewDocument);
router.post('/generate',    auth, canGenerate, ctrl.generateDocument);
router.get('/',             auth, canView,     ctrl.getDocuments);
router.get('/:id',          auth, canView,     ctrl.getDocumentById);
router.get('/:id/download', auth, canView,     ctrl.downloadDocument);

module.exports = router;
