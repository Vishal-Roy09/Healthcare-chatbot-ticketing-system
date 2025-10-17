/**
 * Enhanced AI Service for TicketHub Chatbot
 * 
 * This service provides natural language processing capabilities
 * using the natural library for intent recognition and entity extraction.
 */

const natural = require('natural');
const { generateAIResponse, analyzeMessage } = require('./aiService');

// Initialize NLP components
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

/**
 * Process and analyze user message using NLP
 * @param {string} message - The user's message to analyze
 * @returns {Object} Analysis results including intent and entities
 */
const processMessage = (message) => {
  // Tokenize the message
  const tokens = tokenizer.tokenize(message.toLowerCase());
  
  // Extract basic entities (dates, numbers, etc)
  const entities = {
    dates: tokens.filter(token => /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(token)),
    numbers: tokens.filter(token => /^\d+$/.test(token)),
    keywords: tokens.filter(token => token.length > 3) // Basic keyword extraction
  };
  
  return {
    tokens,
    entities,
    originalMessage: message
  };
};

/**
 * Train the classifier with sample intents
 * This should be called during application initialization
 */
const trainClassifier = () => {
  // Add training data for common intents
  classifier.addDocument('how do I create a new ticket', 'create_ticket');
  classifier.addDocument('I need to submit a ticket', 'create_ticket');
  classifier.addDocument('open a new ticket', 'create_ticket');
  
  classifier.addDocument('what is the status of my ticket', 'check_status');
  classifier.addDocument('where is my ticket', 'check_status');
  classifier.addDocument('ticket status', 'check_status');
  
  classifier.addDocument('I need help with my ticket', 'get_help');
  classifier.addDocument('can you help me', 'get_help');
  classifier.addDocument('assist me please', 'get_help');
  
  // Train the classifier
  classifier.train();
};

/**
 * Identify the intent of a user message
 * @param {string} message - The user's message
 * @returns {Object} The classified intent and confidence score
 */
const identifyIntent = (message) => {
  const classification = classifier.classify(message);
  return {
    intent: classification,
    confidence: 0.85 // In production, use actual confidence scores
  };
};

/**
 * Generate an enhanced response using NLP analysis
 * @param {string} message - The user's message
 * @returns {Object} Enhanced response with NLP analysis
 */
const generateEnhancedResponse = async (message) => {
  // Process the message with NLP
  const analysis = processMessage(message);
  const intentInfo = identifyIntent(message);
  
  // Get base response from AI service
  const baseResponse = await generateAIResponse(message);
  
  return {
    response: baseResponse,
    analysis: {
      intent: intentInfo.intent,
      confidence: intentInfo.confidence,
      entities: analysis.entities
    }
  };
};

module.exports = {
  processMessage,
  trainClassifier,
  identifyIntent,
  generateEnhancedResponse,
  generateEnhancedAIResponse: generateEnhancedResponse // Alias for compatibility with route imports
};