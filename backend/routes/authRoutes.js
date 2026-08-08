const express = require('express');
const {
  register,
  login,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, requireInstructor } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/api/users', protect, requireInstructor, createUser);
router.get('/api/users', protect, requireInstructor, getUsers);
router.get('/api/users/:id', protect, requireInstructor, getUserById);
router.put('/api/users/:id', protect, requireInstructor, updateUser);
router.delete('/api/users/:id', protect, requireInstructor, deleteUser);

module.exports = router;
