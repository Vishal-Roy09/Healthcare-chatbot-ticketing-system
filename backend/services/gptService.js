/**
 * GPT Service for TicketHub Healthcare Chatbot
 * 
 * This service integrates OpenAI's GPT models to enhance the existing NLP capabilities
 * with more advanced natural language understanding and generation.
 * 
 * Features:
 * - Advanced natural language understanding
 * - More human-like responses
 * - Better handling of unknown queries
 * - Context-aware conversation handling
 */

const { OpenAI } = require('openai');
const { analyzeMessage } = require('./aiService');

// Initialize OpenAI client
let openai;
try {
  // Make sure we have the API key from .env
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
  }
  
  // Validate API key format (basic check)
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    throw new Error('OPENAI_API_KEY appears to be invalid. It should start with "sk-" and be at least 20 characters long');
  }
  
  // Check if the API key is still the placeholder value
  if (apiKey.includes('your-openai-api-key-goes-here')) {
    throw new Error('OPENAI_API_KEY is still set to the placeholder value. Please replace it with your actual OpenAI API key');
  }
  
  openai = new OpenAI({
    apiKey: apiKey
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
  console.warn('GPT features will be disabled. Please check your OpenAI API key.');
}

/**
 * Checks if the OpenAI client is properly initialized
 * @returns {boolean} Whether the OpenAI client is available
 */
const isGptAvailable = () => {
  return !!openai;
};

/**
 * Generates a response using GPT for more advanced natural language understanding
 * @param {string} message - The user's message
 * @param {string} category - The detected category/intent
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} The GPT-generated response
 */
const generateGptResponse = async (message, category, conversationHistory = []) => {
  if (!isGptAvailable()) {
    throw new Error('OpenAI client is not available. Check your API key configuration.');
  }

  try {
    // Create a system message that provides context about the healthcare chatbot
    const systemMessage = {
      role: 'system',
      content: `You are a helpful healthcare assistant for TicketHub. 
      The user's query has been classified as: ${category}. 
      Provide a helpful, accurate, and compassionate response. 
      For medical questions, avoid giving specific medical advice and recommend consulting with a healthcare professional. 
      For emergency situations, advise seeking immediate medical attention.`
    };

    // Format conversation history for the GPT context
    const formattedHistory = conversationHistory.map(item => ({
      role: item.isAI ? 'assistant' : 'user',
      content: item.content
    }));

    // Add the current message
    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Can be upgraded to gpt-4 for better results
      messages: messages,
      max_tokens: 500,
      temperature: 0.7, // Slightly creative but still focused
      top_p: 0.9,
      frequency_penalty: 0.5, // Reduce repetition
      presence_penalty: 0.5, // Encourage new topics
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating GPT response:', error);
    throw new Error(`Failed to generate GPT response: ${error.message}`);
  }
};

/**
 * Handles unknown queries by using GPT to generate a more helpful response
 * @param {string} message - The user's message that couldn't be classified
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} A helpful response for the unknown query
 */
const handleUnknownQuery = async (message, conversationHistory = []) => {
  if (!isGptAvailable()) {
    console.error('OpenAI client is not available. Check your API key configuration in .env file.');
    // Provide a more helpful response when OpenAI is unavailable
    return "I'm sorry, but I'm currently unable to process your request due to a configuration issue. The OpenAI API key appears to be invalid or missing. Please contact the system administrator to resolve this issue. In the meantime, I can still help with basic healthcare-related questions about appointments, prescriptions, billing, or medical symptoms.";
  }

  try {
    console.log('Handling unknown query with GPT:', message);
    
    const systemMessage = {
      role: 'system',
      content: `You are a helpful healthcare assistant for TicketHub. 
      The user has sent a message that our classification system couldn't categorize. 
      Try to understand their intent and provide a helpful response. 
      If it's a medical question, be cautious and recommend consulting with a healthcare professional. 
      For emergency situations, advise seeking immediate medical attention.`
    };

    // Format conversation history for the GPT context
    const formattedHistory = conversationHistory.map(item => ({
      role: item.isAI ? 'assistant' : 'user',
      content: item.content
    }));

    // Log the request being sent to OpenAI
    console.log('Sending request to OpenAI with message:', message);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    // Log successful response
    console.log('Received response from OpenAI');
    
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error handling unknown query with GPT:', error);
    // Provide more detailed error message for debugging
    if (error.response) {
      console.error('OpenAI API Error Status:', error.response.status);
      console.error('OpenAI API Error Data:', error.response.data);
    }
    return "I'm having trouble understanding your request due to a technical issue. Please try again later or contact support if the problem persists. (Error: " + error.message + ")";
  }
};

/**
 * Enhances a basic AI response with GPT to make it more natural and contextually relevant
 * @param {string} basicResponse - The response from the basic NLP system
 * @param {string} message - The original user message
 * @param {string} category - The detected category/intent
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} The enhanced response
 */
const enhanceResponseWithGpt = async (basicResponse, message, category, conversationHistory = []) => {
  if (!isGptAvailable()) {
    return basicResponse;
  }

  try {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful healthcare assistant for TicketHub. 
      The user's query has been classified as: ${category}. 
      Our basic AI system generated this response: "${basicResponse}"
      Please enhance this response to make it more natural, helpful, and contextually relevant to the user's query. 
      Maintain the same general information and advice, but make it more conversational and empathetic.`
    };

    // Format conversation history for the GPT context
    const formattedHistory = conversationHistory.map(item => ({
      role: item.isAI ? 'assistant' : 'user',
      content: item.content
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing response with GPT:', error);
    return basicResponse; // Fall back to the basic response if enhancement fails
  }
};

module.exports = {
  isGptAvailable,
  generateGptResponse,
  handleUnknownQuery,
  enhanceResponseWithGpt
};