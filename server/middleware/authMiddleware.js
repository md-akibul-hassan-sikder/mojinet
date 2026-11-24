const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    // reject any token issued before the last password change
    if (req.user.passwordChangedAt && decoded.iat) {
      const issuedAtMs = decoded.iat * 1000;
      if (issuedAtMs + 5000 < new Date(req.user.passwordChangedAt).getTime()) {
        return res.status(401).json({ message: 'Password changed — please sign in again' });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

module.exports = { protect, adminOnly };