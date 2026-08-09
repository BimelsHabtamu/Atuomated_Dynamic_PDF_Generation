const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const ctrl    = require('../controllers/documentController');

router.post('/preview',       auth, ctrl.previewDocument);
router.post('/generate',      auth, ctrl.generateDocument);
router.get('/',               auth, ctrl.getDocuments);
router.get('/:id',            auth, ctrl.getDocumentById);
router.get('/:id/download',   auth, ctrl.downloadDocument);

module.exports = router;
