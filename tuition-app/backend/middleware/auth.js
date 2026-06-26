const VALID = ['harikesh.sahu@gmail.com', 'kusum.gupta@gmail.com'];

module.exports = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const email = Buffer.from(token, 'base64').toString('utf8');
    if (!VALID.includes(email)) throw new Error();
    req.adminEmail = email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
