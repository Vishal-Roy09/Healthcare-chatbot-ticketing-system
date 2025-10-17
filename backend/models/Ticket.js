/**
 * Ticket Model
 * 
 * This model represents a patient support ticket in the healthcare system.
 * Each ticket contains the patient's question, AI and healthcare provider responses,
 * and metadata about the ticket's status and priority.
 */

const mongoose = require('mongoose');

// Define the structure of a ticket in the database
const TicketSchema = new mongoose.Schema({
  // Basic ticket information
  title: {
    type: String,
    required: true          // Every ticket must have a title
  },
  description: {
    type: String,
    required: true          // Every ticket must have a description
  },
  
  // Ticket status tracking
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],  // Only these values are allowed
    default: 'open'         // New tickets start as "open"
  },
  
  // Ticket urgency level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],  // Only these values are allowed
    default: 'medium'       // Default priority is "medium"
  },
  
  // Type of healthcare question
  category: {
    type: String,
    enum: ['general', 'appointment', 'prescription', 'billing', 'technical', 'other'],
    required: true          // Category must be specified when creating a ticket
  },
  // Relationships to users
  user: {
    type: mongoose.Schema.Types.ObjectId,  // Links to a User document
    ref: 'User',                            // References the User model
    required: true                          // Every ticket must be associated with a user
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,   // Links to a User document (healthcare provider)
    ref: 'User',                             // References the User model
    default: null                            // Initially not assigned to any healthcare provider
  },
  // AI response tracking
  aiResponded: {
    type: Boolean,
    default: false           // Tracks whether the AI has responded yet
  },
  aiResponse: {
    type: String,
    default: ''              // Stores the initial AI response
  },
  
  // Language preferences
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'zh', 'ar', 'auto'],  // Supported languages
    default: 'auto'          // Auto-detect language by default
  },
  // Feedback on AI responses
  feedbackProvided: {
    type: Boolean,
    default: false           // Tracks whether the user has provided feedback
  },
  feedbackRating: {
    type: Number,
    min: 1,                  // Minimum rating (1 star)
    max: 5,                  // Maximum rating (5 stars)
    default: null            // No rating initially
  },
  feedbackComments: {
    type: String,
    default: ''              // Optional written feedback
  },
  // Conversation thread (all messages in this ticket)
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,  // Who sent this message (user ID)
        ref: 'User'                            // References the User model
      },
      isAI: {
        type: Boolean,
        default: false                         // Whether this is an AI-generated message
      },
      content: {
        type: String,
        required: true                         // Every message must have content
      },
      timestamp: {
        type: Date,
        default: Date.now                      // When this message was sent
      }
    }
  ],
  // Timestamps for tracking ticket lifecycle
  createdAt: {
    type: Date,
    default: Date.now                          // When the ticket was first created
  },
  updatedAt: {
    type: Date,
    default: Date.now                          // When the ticket was last updated
  }
});

/**
 * Pre-save hook: Automatically update the 'updatedAt' timestamp
 * whenever a ticket is modified and saved to the database
 */
TicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();  // Set the current time
  next();                       // Continue with the save operation
});

module.exports = mongoose.model('Ticket', TicketSchema);