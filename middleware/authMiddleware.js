const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = (req, res, next) => {
  // Look for the token in the "Authorization" header, removing the "Bearer " prefix if present.
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    // Use process.env.JWT_SECRET for security, fallback to 'secret' for development.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user; // Ensure your token payload contains a "user" property with an "id"
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

  
module.exports = { authenticate : authMiddleware };
