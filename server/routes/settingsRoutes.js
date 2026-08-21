const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/settingsController');

const superAdmin = role('super_admin');

// Multer for seal / branding image uploads
const brandingUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../storage/uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `seal_${Date.now()}${ext}`);
    },
  }),
  limits:     { fileSize: 2 * 1024 * 1024 },          // 2 MB
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp|svg\+xml)$/.test(file.mimetype)),
});

router.get('/system',      auth, superAdmin, ctrl.getSystemConfiguration);
router.put('/system',      auth, superAdmin, ctrl.updateSystemConfiguration);
router.post('/seal',       auth, superAdmin, brandingUpload.single('seal'), ctrl.uploadSeal);

module.exports = router;
