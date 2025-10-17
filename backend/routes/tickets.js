const express = require('express');
const router = express.Router();
const { auth, isHealthcareProvider } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { generateAIResponse } = require('../services/aiService');
const { isGptAvailable, enhanceResponseWithGpt, handleUnknownQuery } = require('../services/gptService');
const { generateEnhancedAIResponse } = require('../services/enhancedAIService');

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // Create new ticket
    const newTicket = new Ticket({
      title,
      description,
      category,
      priority: priority || 'medium',
      user: req.user.id,
      messages: [
        {
          sender: req.user.id,
          content: description,
          isAI: false
        }
      ]
    });

    // Save ticket
    const ticket = await newTicket.save();

    // Generate AI response using the AI service with NLP capabilities
    setTimeout(async () => {
      try {
        // Get user preferences
        const user = await User.findById(req.user.id);
        const preferredLanguage = user?.preferredLanguage || 'en';
        
        let aiResponse;
        
        // Try to use enhanced AI with GPT if available
        try {
          if (isGptAvailable()) {
            console.log('Using GPT-enhanced response generation');
            
            // Use the enhanced AI service which incorporates GPT
            const options = {
              preferredLanguage,
              conversationHistory: ticket.messages.map(msg => ({
                content: msg.content,
                isAI: msg.isAI
              }))
            };
            
            // Generate enhanced response with GPT
            const enhancedResponse = await generateEnhancedAIResponse(
              description,
              category,
              req.user.id,
              options
            );
            
            aiResponse = enhancedResponse.textResponse;
          } else {
            // Fall back to basic AI response
            aiResponse = await generateAIResponse(description, category, req.user.id, preferredLanguage);
          }
        } catch (gptError) {
          console.error('Error using GPT service:', gptError.message);
          // Fall back to basic AI response
          aiResponse = await generateAIResponse(description, category, req.user.id, preferredLanguage);
        }
        
        ticket.aiResponded = true;
        ticket.aiResponse = aiResponse;
        ticket.messages.push({
          isAI: true,
          content: aiResponse,
          timestamp: Date.now()
        });
        
        await ticket.save();
      } catch (err) {
        console.error('Error generating AI response:', err);
      }
    }, 1000);

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tickets
// @desc    Get all tickets for current user or all tickets for healthcare providers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required to view tickets' });
    }
    
    let tickets;
    
    // If user is a healthcare provider or admin, they can see all tickets
    if (req.user.role === 'healthcare_provider' || req.user.role === 'admin') {
      tickets = await Ticket.find()
        .populate('user', ['name', 'email'])
        .populate('assignedTo', ['name', 'email'])
        .sort({ updatedAt: -1 });
    } else {
      // Regular users can only see their own tickets
      tickets = await Ticket.find({ user: req.user.id })
        .populate('assignedTo', ['name', 'email'])
        .sort({ updatedAt: -1 });
    }
    
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', ['name', 'email'])
      .populate('assignedTo', ['name', 'email'])
      .populate('messages.sender', ['name', 'role']);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    
    // Check if user is authorized to view this ticket
    if (
      ticket.user._id.toString() !== req.user.id && 
      req.user.role !== 'healthcare_provider' && 
      req.user.role !== 'admin' &&
      (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user.id)
    ) {
      return res.status(401).json({ msg: 'Not authorized to view this ticket' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/tickets/:id
// @desc    Update ticket
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    
    // Check if user is authorized to update this ticket
    if (
      ticket.user.toString() !== req.user.id && 
      req.user.role !== 'healthcare_provider' && 
      req.user.role !== 'admin' &&
      (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id)
    ) {
      return res.status(401).json({ msg: 'Not authorized to update this ticket' });
    }
    
    const { status, priority, assignedTo } = req.body;
    
    // Update fields if provided
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo && (req.user.role === 'healthcare_provider' || req.user.role === 'admin')) {
      ticket.assignedTo = assignedTo;
    }
    
    await ticket.save();
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tickets/:id/message
// @desc    Add a message to a ticket with GPT-enhanced responses
// @access  Private
router.post('/:id/message', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ msg: 'Message content is required' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    
    // Check if user is authorized to add message
    if (ticket.user.toString() !== req.user.id && 
        (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to add message to this ticket' });
    }
    
    // Add user message
    ticket.messages.push({
      sender: req.user.id,
      content,
      isAI: false,
      timestamp: Date.now()
    });
    
    // Update ticket status if it was closed
    if (ticket.status === 'closed') {
      ticket.status = 'reopened';
    }
    
    ticket.updatedAt = Date.now();
    await ticket.save();
    
    // Generate AI response
    setTimeout(async () => {
      try {
        // Get user preferences
        const user = await User.findById(req.user.id);
        const preferredLanguage = user?.preferredLanguage || 'en';
        
        let aiResponse;
        
        // Try to use enhanced AI with GPT if available
        try {
          if (isGptAvailable()) {
            console.log('Using GPT-enhanced response generation for ticket message');
            
            // Format conversation history for context
            const conversationHistory = ticket.messages.map(msg => ({
              content: msg.content,
              isAI: msg.isAI
            }));
            
            // Use GPT to generate or enhance response
            if (ticket.category) {
              // Get basic response first
              const basicResponse = await generateAIResponse(content, ticket.category, req.user.id, preferredLanguage);
              // Enhance it with GPT
              aiResponse = await enhanceResponseWithGpt(basicResponse, content, ticket.category);
            } else {
              // For unknown categories, let GPT handle it directly
              aiResponse = await handleUnknownQuery(content);
            }
          } else {
            // Fall back to basic AI response
            aiResponse = await generateAIResponse(content, ticket.category, req.user.id, preferredLanguage);
          }
        } catch (gptError) {
          console.error('Error using GPT service:', gptError.message);
          // Fall back to basic AI response
          aiResponse = await generateAIResponse(content, ticket.category, req.user.id, preferredLanguage);
        }
        
        ticket.messages.push({
          isAI: true,
          content: aiResponse,
          timestamp: Date.now()
        });
        
        ticket.updatedAt = Date.now();
        await ticket.save();
      } catch (err) {
        console.error('Error generating AI response:', err);
      }
    }, 1000);
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/tickets/:id
// @desc    Delete a ticket
// @access  Private (Admin only)
router.delete('/:id', [auth, isHealthcareProvider], async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    
    // Only admins can delete tickets
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete tickets' });
    }
    
    await ticket.remove();
    
    res.json({ msg: 'Ticket removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;