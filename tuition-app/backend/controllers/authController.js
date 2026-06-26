// Credentials loaded from environment variables
// Set ADMIN_EMAILS as comma-separated "email:password" pairs in .env
// e.g. ADMIN_EMAILS=harikesh.sahu@gmail.com:pass123,other@gmail.com:pass456
function loadUsers() {
  const raw = process.env.ADMIN_EMAILS || '';
  const users = {};
  raw.split(',').forEach((pair) => {
    const [email, ...rest] = pair.trim().split(':');
    if (email && rest.length) users[email.toLowerCase()] = rest.join(':');
  });
  return users;
}

exports.login = (req, res) => {
  const USERS = loadUsers();
  const { email, password } = req.body;
  const e = (email || '').toLowerCase().trim();
  if (USERS[e] && USERS[e] === password) {
    const token = Buffer.from(e).toString('base64');
    return res.json({ token, email: e });
  }
  res.status(401).json({ error: 'Invalid email or password' });
};
