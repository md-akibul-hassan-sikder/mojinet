const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const generateToken = (id, expiresIn = '7d') =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

// We only ever modify password / passwordChangedAt / reset-token fields in
// changePassword, forgotPassword and resetPassword. Skipping full-document
// validation prevents unrelated legacy fields (e.g. an empty `name` from an
// admin record created directly in the DB) from blocking the save.
// The bcrypt pre-save hook still runs — passwords are still hashed.
const SAVE_OPTS = { validateBeforeSave: false };

/* ── POST /api/auth/register ─────────────────────────────── */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400); throw new Error('All fields are required');
  }
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('User already exists'); }

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

/* ── POST /api/auth/login ────────────────────────────────── */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password');
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, rememberMe ? '30d' : '7d'),
  });
});

/* ── GET /api/auth/me (protected) ────────────────────────── */
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

/* ── PUT /api/auth/change-password (protected) ───────────── */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400); throw new Error('Both current and new password are required');
  }
  if (newPassword.length < 6) {
    res.status(400); throw new Error('New password must be at least 6 characters');
  }
  if (currentPassword === newPassword) {
    res.status(400); throw new Error('New password must be different from the current one');
  }

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const ok = await user.matchPassword(currentPassword);
  if (!ok) { res.status(401); throw new Error('Current password is incorrect'); }

  user.password = newPassword;                 // hashed by the pre-save hook
  user.passwordChangedAt = new Date();         // invalidates every other session
  await user.save(SAVE_OPTS);                  // skip unrelated field validation

  // issue a fresh token so this session stays valid
  const newToken = generateToken(user._id, '7d');

  res.json({
    message: 'Password updated successfully',
    token: newToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/* ── POST /api/auth/forgot-password ──────────────────────── */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  const GENERIC_RESPONSE = {
    message: 'If an account exists with that email, a reset link has been sent.',
  };

  if (!user) {
    await new Promise((r) => setTimeout(r, 350));
    return res.json(GENERIC_RESPONSE);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  await user.save(SAVE_OPTS);

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    console.log(`📧 Password reset link sent to ${user.email}`);
  } catch (err) {
    // roll back so a retry works
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save(SAVE_OPTS);
    console.error('❌ Failed to send reset email:', err.message);
  }

  res.json(GENERIC_RESPONSE);
});

/* ── GET /api/auth/verify-reset-token/:token ─────────────── */
const verifyResetToken = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }

  res.json({ valid: true, email: user.email, name: user.name });
});

/* ── POST /api/auth/reset-password/:token ────────────────── */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400); throw new Error('Password must be at least 6 characters');
  }

  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }

  user.password = password;                    // hashed by the pre-save hook
  user.passwordChangedAt = new Date();         // invalidate all existing sessions
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save(SAVE_OPTS);

  res.json({ message: 'Password reset successfully. You can now sign in.' });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};