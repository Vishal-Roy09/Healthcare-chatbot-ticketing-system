/**
 * Main Server File for TicketHub API
 * 
 * This file sets up the Express server, connects to MongoDB,
 * configures middleware, and defines API routes.
 */

// Import required packages
const express = require('express');  // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors');        // Cross-Origin Resource Sharing middleware
const dotenv = require('dotenv');    // Environment variable loader

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Configure Middleware
app.use(cors());         // Enable CORS for all routes (allows frontend to communicate with API)
app.use(express.json()); // Parse incoming JSON requests

// Database Configuration
// Get MongoDB connection string from environment variables or use local fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tickethub';

// MongoDB connection options for better reliability and performance
const mongoOptions = {
  useNewUrlParser: true,      // Use new URL parser to avoid deprecation warnings
  useUnifiedTopology: true,   // Use new server discovery and monitoring engine
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if server selection fails
  socketTimeoutMS: 45000,     // Close sockets after 45 seconds of inactivity
  family: 4                   // Use IPv4, skip trying IPv6 for better compatibility
};

/**
 * Connect to MongoDB Database
 * 
 * This function attempts to establish a connection to MongoDB using the provided
 * connection string and options. If the connection fails, it provides helpful
 * troubleshooting information and exits the process.
 */
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI, mongoOptions);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Please ensure:');
    console.error('1. MongoDB is installed and running on your machine');
    console.error('2. The connection string in .env is correct');
    console.error('3. MongoDB is listening on the default port (27017)');
    // Exit process with failure
    process.exit(1);
  }
};

// Initialize database connection
connectDB();


// Register API Routes
// Authentication routes (login, register, user management)
app.use('/api/auth', require('./routes/auth'));

// Ticket management routes (create, update, list tickets)
app.use('/api/tickets', require('./routes/tickets'));

// Enhanced AI features (advanced chatbot capabilities)
app.use('/api/enhanced-ai', require('./routes/enhancedAI'));

// Base route - API health check endpoint
app.get('/', (req, res) => {
  res.send('TicketHub API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});