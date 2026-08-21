const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/documentController');
const bulk    = require('../controllers/bulkController');

const canGenerate = role('super_admin', 'system_admin', 'generator', 'approver');
const canView     = role('super_admin', 'system_admin', 'generator', 'approver', 'recipient');
const adminOnly   = role('super_admin', 'system_admin');

router.post('/preview',                    auth, canGenerate, ctrl.previewDocument);
router.post('/generate',                   auth, canGenerate, ctrl.generateDocument);

// FR-019: Bulk generation
router.post('/bulk',                       auth, canGenerate, bulk.startBulkJob);
router.get('/bulk',                        auth, canGenerate, bulk.listBulkJobs);
router.get('/bulk/:jobUuid',               auth, canGenerate, bulk.getBulkJobProgress);
router.get('/bulk/:jobUuid/download',      auth, canGenerate, bulk.downloadBulkZip);

router.get('/',                            auth, canView,     ctrl.getDocuments);
router.get('/:id',                         auth, canView,     ctrl.getDocumentById);
router.get('/:id/download',                auth, canView,     ctrl.downloadDocument);
router.patch('/:id/hand-delivered',        auth, adminOnly,   ctrl.markHandDelivered);

module.exports = router;
