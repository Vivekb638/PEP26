const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // Check if we already have an active database connection
  if (isConnected || mongoose.connection.readyState === 1) {
    console.log('Reusing existing database connection');
    return;
  }

  if (!process.env.DATABASE) {
    throw new Error('DATABASE environment variable is missing');
  }

  await mongoose.connect(process.env.DATABASE);
  isConnected = true;
  console.log('Database connection established');
};

module.exports = connectDB;
