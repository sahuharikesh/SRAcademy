const User = require('../models/User');

// Overwrites req.currentUser with the user identified by :id — used on
// super-admin routes that upload a logo/signature for another academy.
// Must run after requireSuperAdmin (which already checked the caller's role
// off the original req.currentUser).
module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    req.currentUser = user;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
