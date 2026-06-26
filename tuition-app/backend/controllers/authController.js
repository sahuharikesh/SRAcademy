const USERS = {
  'harikesh.sahu@gmail.com': '123456',
  'kusum.gupta@gmail.com': '123456',
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const e = (email || '').toLowerCase().trim();
  if (USERS[e] && USERS[e] === password) {
    const token = Buffer.from(e).toString('base64');
    return res.json({ token, email: e });
  }
  res.status(401).json({ error: 'Invalid email or password' });
};
