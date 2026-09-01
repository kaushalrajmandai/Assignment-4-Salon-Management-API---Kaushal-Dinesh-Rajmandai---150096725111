const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  isNonEmptyString,
  isValidEmail,
  isValidUsername,
  trimString
} = require('../utils/validate');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const register = asyncHandler(async (req, res) => {
  const username = trimString(req.body.username);
  const email = trimString(req.body.email);
  const { password } = req.body;

  if (!isValidUsername(username)) {
    throw new ApiError(400, 'Username must be 3-50 characters (letters, numbers, ., _, -)');
  }
  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findByEmailOrUsername(email, username);
  if (existing) {
    throw new ApiError(409, 'Email or username already registered');
  }

  const user = await User.create({ username, email, password });
  const token = signToken(user);

  sendSuccess(res, 201, { user, token }, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const email = trimString(req.body.email);
  const { password } = req.body;

  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const match = await User.comparePassword(password, user.password);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const publicUser = User.toPublic(user);
  const token = signToken(publicUser);

  sendSuccess(res, 200, { user: publicUser, token }, 'Login successful');
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  sendSuccess(res, 200, user, 'Current user fetched');
});

module.exports = { register, login, me };   