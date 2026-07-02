const User = require('../models/User');

// Attaches the full User doc to req.currentUser — used where handlers need
// more than the id/email already carried on the JWT (e.g. building an
// upload filename from the academy name).
module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    req.currentUser = user;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
