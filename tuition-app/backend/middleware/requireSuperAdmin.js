// Must run after loadUser (needs req.currentUser)
module.exports = (req, res, next) => {
  if (req.currentUser?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only a super admin can do this' });
  }
  next();
};
