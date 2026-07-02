const router = require('express').Router();
const auth = require('../middleware/auth');
const loadUser = require('../middleware/loadUser');
const loadUserById = require('../middleware/loadUserById');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const upload = require('../middleware/upload');
const {
  register, login, me, updateMe, uploadLogo, uploadSignature,
  listUsers, getUser, updateUser, deleteUser, adminUploadLogo, adminUploadSignature,
} = require('../controllers/authController');

// Only an already-logged-in super_admin can create new academy accounts —
// there is no public self-signup.
router.post('/register', auth, loadUser, requireSuperAdmin, register);
router.post('/login', login);
router.get('/me', auth, me);
router.put('/me', auth, updateMe);
router.post('/upload-logo', auth, loadUser, upload.single('logo'), uploadLogo);
router.post('/upload-signature', auth, loadUser, upload.single('signature'), uploadSignature);

// Super-admin: manage all academy accounts
router.get('/users',     auth, loadUser, requireSuperAdmin, listUsers);
router.get('/users/:id', auth, loadUser, requireSuperAdmin, getUser);
router.put('/users/:id', auth, loadUser, requireSuperAdmin, updateUser);
router.delete('/users/:id', auth, loadUser, requireSuperAdmin, deleteUser);
router.post('/users/:id/upload-logo', auth, loadUser, requireSuperAdmin, loadUserById, upload.single('logo'), adminUploadLogo);
router.post('/users/:id/upload-signature', auth, loadUser, requireSuperAdmin, loadUserById, upload.single('signature'), adminUploadSignature);

module.exports = router;
