const User = require('../models/User');
const createToken = require('../utils/createToken');
const httpError = require('../utils/httpError');
const { ROLES } = require('../utils/constants');

async function signup(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw httpError(400, 'name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError(409, 'User already exists');

  const allowedRole = role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;

  const user = await User.create({
    name,
    email,
    password,
    role: allowedRole
  });

  const token = createToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw httpError(401, 'Invalid credentials');

  const token = createToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    }
  });
}

async function me(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = {
  signup,
  login,
  me
};