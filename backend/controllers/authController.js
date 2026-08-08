const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = createToken(user);
    res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);
    res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.role = req.body.role !== undefined ? req.body.role : user.role;
    if (req.body.password !== undefined) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
