const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/templateController');

router.get('/',              auth, ctrl.getTemplates);
router.get('/:id',           auth, ctrl.getTemplateById);
router.post('/',             auth, role('admin'), ctrl.createTemplate);
router.put('/:id',           auth, role('admin'), ctrl.updateTemplate);
router.patch('/:id/status',  auth, role('admin'), ctrl.setTemplateStatus);
router.delete('/:id',        auth, role('admin'), ctrl.deleteTemplate);

module.exports = router;
