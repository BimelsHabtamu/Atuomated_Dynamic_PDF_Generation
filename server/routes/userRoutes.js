const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/authMiddleware');
const role    = require('../middlewares/roleMiddleware');
const ctrl    = require('../controllers/userController');

const admins = role('super_admin', 'system_admin');

router.get('/',           auth, admins, ctrl.getUsers);
router.post('/',          auth, admins, ctrl.createUser);
router.put('/:id',        auth, admins, ctrl.updateUser);
router.delete('/:id',     auth, admins, ctrl.deleteUser);
router.patch('/:id/role', auth, admins, ctrl.changeRole);
router.post('/change-password', auth, ctrl.changePassword);

module.exports = router;
