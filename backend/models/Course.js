const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price should be greater than 0']
    },
    instructor: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema, 'Courses');
