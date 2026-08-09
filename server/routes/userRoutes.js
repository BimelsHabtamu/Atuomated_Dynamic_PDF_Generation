const express    = require('express');
const router     = express.Router();
const auth       = require('../middlewares/authMiddleware');
const role       = require('../middlewares/roleMiddleware');
const ctrl       = require('../controllers/userController');

const adminOnly  = [auth, role('admin')];

router.get('/',         ...adminOnly, ctrl.getUsers);
router.post('/',        ...adminOnly, ctrl.createUser);
router.put('/:id',      ...adminOnly, ctrl.updateUser);
router.delete('/:id',   ...adminOnly, ctrl.deleteUser);
router.patch('/:id/role', ...adminOnly, ctrl.changeRole);

module.exports = router;
