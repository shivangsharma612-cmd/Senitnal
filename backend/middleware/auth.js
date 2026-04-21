// ============================================================
// middleware/auth.js — JWT Authentication Middleware
// Protects routes by verifying Bearer tokens
// ============================================================
 
const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
const protect = async (req, res, next) => {
  let token;
 
  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
 
      // Verify token signature using JWT_SECRET from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
      // Attach user to request (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');
 
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
 
      next(); // Proceed to route handler
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }
 
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
 
module.exports = { protect };
 