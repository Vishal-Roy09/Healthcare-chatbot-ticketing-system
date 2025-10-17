/**
 * User Model
 * 
 * This model represents a user in the TicketHub system.
 * Users can be patients, healthcare providers, or administrators.
 * The model handles password hashing automatically when a user is created or password is changed.
 */

const mongoose = require('mongoose');  // MongoDB object modeling tool
const bcrypt = require('bcryptjs');    // Password hashing library

// Define the structure of a user in the database
const UserSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true                // Every user must have a name
  },
  email: {
    type: String,
    required: true,               // Every user must have an email
    unique: true                  // No duplicate emails allowed
  },
  password: {
    type: String,
    required: true                // Every user must have a password (will be hashed)
  },
  
  // User role determines permissions and access levels
  role: {
    type: String,
    enum: ['patient', 'healthcare_provider', 'admin'],  // Only these roles are allowed
    default: 'patient'            // New users are patients by default
  },
  
  // Timestamp for when the user account was created
  createdAt: {
    type: Date,
    default: Date.now             // Automatically set to current time when created
  }
});

/**
 * Pre-save hook: Automatically hash the password before saving
 * This ensures passwords are never stored in plain text in the database
 * Only runs when the password field has been modified
 */
UserSchema.pre('save', async function(next) {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate a salt (random data for strengthening the hash)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Continue with the save operation
    next();
  } catch (error) {
    // Pass any errors to the next middleware
    next(error);
  }
});

/**
 * Method to verify a password during login
 * Compares the provided password with the stored hash
 * 
 * @param {string} candidatePassword - The password to check
 * @returns {boolean} True if password matches, false otherwise
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);