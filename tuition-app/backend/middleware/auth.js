const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId    = decoded.id;
    req.adminEmail = decoded.email; // kept as the per-academy scoping key used across all models
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
