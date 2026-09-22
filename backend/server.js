import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './src/config/db.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🏥 [MedRentia API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[MedRentia Unhandled Rejection]: ${err.message}`);
});
