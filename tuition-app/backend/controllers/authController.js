const jwt  = require('jsonwebtoken');
const path = require('path');
const fs   = require('fs');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/mailer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// One academy = one account. New academies are created only by an existing
// super_admin (see requireSuperAdmin middleware) — no public self-signup.
exports.register = async (req, res) => {
  try {
    const { academyName, academyTitle, name, email, password, mobile, upiId, primaryColor, themeColor, role, stdList, subjectList } = req.body;
    if (!academyName || !name || !email || !password) {
      return res.status(400).json({ error: 'academyName, name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const user = await User.create({
      academyName, academyTitle, name,
      email: email.toLowerCase().trim(),
      password, mobile, upiId, primaryColor, themeColor, role, stdList, subjectList,
    });

    const token = signToken(user);
    sendWelcomeEmail({ to: user.email, academyName: user.academyName, email: user.email, password }); // best-effort, not awaited
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim(), isActive: true });
    if (!user || !(await user.comparePassword(password || ''))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    // `email` kept at top level for backwards-compatible frontend clients
    res.json({ token, email: user.email, user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user.toSafeObject());
};

// Self-service and admin-on-behalf-of uploads both land here — whichever
// middleware ran first (loadUser or loadUserById) has already put the right
// target user on req.currentUser, so the handler itself doesn't need to care.
function makeUploadHandler(urlField) {
  return async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const user = await User.findByIdAndUpdate(
        req.currentUser._id,
        { [urlField]: `/uploads/${req.currentUser._id}/${req.file.filename}` },
        { new: true }
      );
      res.json(user.toSafeObject());
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  };
}

exports.uploadLogo      = makeUploadHandler('logoUrl');
exports.uploadSignature = makeUploadHandler('signatureUrl');
exports.adminUploadLogo = exports.uploadLogo;
exports.adminUploadSignature = exports.uploadSignature;

exports.updateMe = async (req, res) => {
  try {
    const { academyName, academyTitle, name, mobile, logoUrl, signatureUrl, upiId, primaryColor, themeColor, stdList, subjectList } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { academyName, academyTitle, name, mobile, logoUrl, signatureUrl, upiId, primaryColor, themeColor, stdList, subjectList },
      { new: true, runValidators: true }
    );
    res.json(user.toSafeObject());
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// ── Super-admin account management ──────────────────────────────────────
exports.listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeObject()));
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user.toSafeObject());
};

exports.updateUser = async (req, res) => {
  try {
    const { academyName, academyTitle, name, mobile, upiId, primaryColor, themeColor, role, stdList, subjectList, isActive, password } = req.body;
    const update = { academyName, academyTitle, name, mobile, upiId, primaryColor, themeColor, role, stdList, subjectList, isActive };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    Object.assign(user, update);
    if (password) user.password = password; // re-hashed by the pre-save hook
    await user.save();
    res.json(user.toSafeObject());
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.userId)) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });

  const dir = path.join(UPLOAD_ROOT, String(user._id));
  fs.rm(dir, { recursive: true, force: true }, () => {}); // best-effort cleanup of their logo/signature folder

  res.json({ message: 'Academy deleted' });
};
