# TicketHub Code Guide

## Introduction

This guide provides a human-readable explanation of the TicketHub codebase. It's designed to help developers understand how the system works without having to decipher complex code.

## System Overview

TicketHub is a healthcare chatbot ticketing system built with the MERN stack:
- **MongoDB**: Database for storing tickets, users, and messages
- **Express**: Backend API framework
- **React**: Frontend user interface
- **Node.js**: JavaScript runtime environment

## Project Structure

```
project/
├── backend/           # Server-side code
│   ├── config/        # Configuration files
│   ├── middleware/    # Express middleware
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   └── server.js      # Main server file
├── frontend/          # Client-side code
│   ├── public/        # Static assets
│   └── src/           # React source code
│       ├── components/# React components
│       ├── context/   # React context providers
│       └── utils/     # Utility functions
└── docs/              # Documentation
```

## Key Components Explained

### Backend

#### Server Setup (server.js)

The main server file initializes the Express application, connects to MongoDB, and sets up API routes. It's designed to be easy to understand with clear comments explaining each section.

#### Database Models

1. **User Model** (`models/User.js`):
   - Stores user information (name, email, password)
   - Handles password hashing automatically
   - Defines user roles (patient, healthcare provider, admin)

2. **Ticket Model** (`models/Ticket.js`):
   - Stores ticket details (title, description, status)
   - Tracks ticket priority and category
   - Contains message history between users and AI
   - Manages feedback on AI responses

#### AI Services

The system includes several AI-related services:

1. **Basic AI Service** (`services/aiService.js`):
   - Processes user messages using Natural Language Processing
   - Identifies user intent and sentiment
   - Extracts important entities (dates, medications, symptoms)
   - Maintains conversation context

2. **Enhanced AI Service** (`services/enhancedAIService.js`):
   - Provides more advanced AI capabilities
   - Integrates with external AI services when available

3. **GPT Service** (`services/gptService.js`):
   - Optional integration with more powerful language models
   - Falls back to basic AI when unavailable

#### API Routes

1. **Authentication Routes** (`routes/auth.js`):
   - User registration and login
   - Password management
   - User profile operations

2. **Ticket Routes** (`routes/tickets.js`):
   - Create, read, update, and delete tickets
   - Add messages to tickets
   - Generate AI responses
   - Provide feedback on AI responses

### Frontend

#### App Structure

The React application is organized around a component-based architecture:

1. **Layout Components**:
   - Header, Footer, and main layout structure

2. **Authentication Components**:
   - Login and Registration forms
   - Protected route handling

3. **Ticket Components**:
   - Ticket listing and filtering
   - Ticket creation form
   - Ticket detail view with messaging

#### State Management

The application uses React Context for state management:

- **AuthContext**: Manages user authentication state
- **TicketContext**: Handles ticket-related state

## Data Flow

1. **Creating a Ticket**:
   - User submits a ticket through the frontend form
   - Request is sent to the `/api/tickets` endpoint
   - Server creates a ticket in the database
   - AI service generates an initial response
   - Response is saved to the ticket
   - Updated ticket is returned to the frontend

2. **Messaging Flow**:
   - User sends a message on a ticket
   - Message is saved to the ticket's message array
   - AI analyzes the message content
   - AI generates a response based on context and intent
   - Response is added to the message thread

## AI Processing Pipeline

1. **Message Analysis**:
   - Tokenization: Breaking message into words
   - Intent Classification: Determining what the user wants
   - Entity Extraction: Identifying important information
   - Sentiment Analysis: Detecting user emotion

2. **Response Generation**:
   - Context-aware responses based on conversation history
   - Personalized based on user preferences
   - Multi-language support
   - Fallback mechanisms for unknown queries

## Common Workflows

### Patient Workflow

1. Patient creates an account/logs in
2. Patient creates a new ticket with health question
3. AI provides immediate initial response
4. Healthcare provider can follow up if needed
5. Patient can provide feedback on AI responses

### Healthcare Provider Workflow

1. Provider logs in with healthcare credentials
2. Views list of all patient tickets
3. Can filter by status, priority, or category
4. Responds to tickets that need human attention
5. Can update ticket status and priority

## Extending the System

To add new features to the system:

1. **New AI Capabilities**:
   - Add new training data in `trainingData.js`
   - Extend entity recognition in `aiService.js`

2. **New Ticket Categories**:
   - Update the Ticket model schema
   - Add corresponding UI elements in the frontend

3. **Additional User Roles**:
   - Extend the User model schema
   - Update authentication middleware
   - Add role-specific UI components

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**:
   - Check that MongoDB is running
   - Verify connection string in `.env` file
   - Ensure network connectivity to database server

2. **AI Response Issues**:
   - Check training data for relevant examples
   - Verify NLP services are properly initialized
   - Look for errors in the AI service logs

3. **Authentication Problems**:
   - Verify JWT secret in environment variables
   - Check token expiration settings
   - Ensure proper middleware is applied to protected routes