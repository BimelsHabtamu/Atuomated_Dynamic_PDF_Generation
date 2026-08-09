const express       = require('express');
const router        = express.Router();
const { login, getMe } = require('../controllers/authController');
const auth          = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', auth, getMe);

module.exports = router;
