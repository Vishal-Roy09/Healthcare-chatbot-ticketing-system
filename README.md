# TicketHub

A full-stack ticket management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

This project consists of two main parts:

- **Backend**: Express.js API with MongoDB database
- **Frontend**: React application built with Vite

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Install all dependencies (backend, frontend, and root):

```
npm run install:all
```

Alternatively, you can install dependencies separately:

```
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### MongoDB Setup

Make sure to set up your MongoDB connection. You have two options:

#### Option 1: MongoDB Atlas (Recommended)

1. Create a free MongoDB Atlas account
2. Set up a cluster and get your connection string
3. Create a `.env` file in the backend directory with your connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-address>/tickethub?retryWrites=true&w=majority
```

#### Option 2: Local MongoDB

1. Install and run MongoDB locally
2. Create a `.env` file in the backend directory:

```
MONGO_URI=mongodb://localhost:27017/tickethub
```

## Running the Application

### Development Mode

To run both frontend and backend in development mode simultaneously:

```
npm run dev
```

This will start:
- Backend server on port 5000
- Frontend development server on port 3000

### Running Separately

If you prefer to run the servers separately:

```
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Mode

To run the backend in production mode:

```
npm run start:backend
```

To build the frontend for production:

```
cd frontend
npm run build
```#   H e a l t h c a r e - c h a t b o t - t i c k e t i n g - s y s t e m  
 