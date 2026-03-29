const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

async function protect(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw httpError(401, 'Authorization token missing');
  }

  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.userId).select('-password');

  if (!user) {
    throw httpError(401, 'User not found');
  }

  req.user = user;
  next();
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw httpError(403, 'Access denied');
    }
    next();
  };
}

module.exports = { protect, authorize };
