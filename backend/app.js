const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB().catch(err => console.error('Initial DB connection failed:', err.message));

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.send('Welcome to the StudyStack API');
});

app.use('/api/courses', courseRoutes);
app.use('/', authRoutes);
app.use('/api', chatRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;