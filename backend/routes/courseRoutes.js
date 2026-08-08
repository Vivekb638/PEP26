const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect, requireInstructor } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, requireInstructor, createCourse);
router.put('/:id', protect, requireInstructor, updateCourse);
router.delete('/:id', protect, requireInstructor, deleteCourse);

module.exports = router;
