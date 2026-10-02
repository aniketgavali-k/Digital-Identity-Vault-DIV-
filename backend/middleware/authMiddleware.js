const jwt = require('jsonwebtoken');

const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined in environment variables!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_emergency', {
    expiresIn: '30d',
  });
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const authHeader = req.headers.authorization;
      token = authHeader.split(' ')[1];
      
      if (!token || token === 'undefined' || token === 'null') {
        console.error('Malformed Authorization header:', authHeader);
        return res.status(401).json({ message: 'Not authorized, malformed token' });
      }

      console.log('Verifying token (prefix):', token.substring(0, 10) + '...');
      console.log('Using JWT_SECRET (prefix):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'UNDEFINED');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT payload:', decoded);

      const User = require('../models/User');
      req.user = await User.findByPk(decoded.id);
      
      if (!req.user) {
        console.warn('User ID from token not found in DB:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('Auth successful for user:', req.user.email);
      next();
    } catch (error) {
      console.error('JWT Verification FAIL:', error.name, '-', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    if (!token) {
      console.warn('Missing Authorization header');
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed: User ${req.user.id} with role ${req.user.role} tried to access ${req.originalUrl}. Required roles: ${roles}`);
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, signToken, authorize };
