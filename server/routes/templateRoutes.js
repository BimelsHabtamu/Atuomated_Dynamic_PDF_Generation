const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const auth     = require('../middlewares/authMiddleware');
const role     = require('../middlewares/roleMiddleware');
const ctrl     = require('../controllers/templateController');

const admins  = role('super_admin', 'system_admin');
const canView = role('super_admin', 'system_admin', 'generator', 'approver');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../storage/uploads')),
  filename:    (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/svg+xml','image/webp'];
  cb(null, allowed.includes(file.mimetype));
}});

router.get('/schema',         auth, admins,   ctrl.getSchemaFields);
router.get('/',               auth, canView,  ctrl.getTemplates);
router.get('/:id',            auth, canView,  ctrl.getTemplateById);
router.post('/',              auth, admins,   ctrl.createTemplate);
router.put('/:id',            auth, admins,   ctrl.updateTemplate);
router.patch('/:id/status',   auth, admins,   ctrl.setTemplateStatus);
router.delete('/:id',         auth, admins,   ctrl.deleteTemplate);
router.post('/:id/logo',      auth, admins,   upload.single('logo'), ctrl.uploadLogo);

module.exports = router;
