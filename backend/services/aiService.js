/*
 * AI Service for TicketHub
 * 
 * This service simulates AI responses for the healthcare chatbot.
 * In a production environment, this would be replaced with a real AI service
 * like OpenAI's GPT or a similar solution.
 */

const generateAIResponse = async (message, category) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple response templates based on ticket category
  const responses = {
    general: [
      `Thank you for your message. I understand your concern about general healthcare matters. A healthcare provider will review your case soon.`,
      `I've noted your general healthcare inquiry. While I can provide basic information, a human healthcare provider will follow up with more specific guidance.`
    ],
    appointment: [
      `I see you have a question about appointments. I can help with basic scheduling information, but a staff member will need to confirm any changes to your appointments.`,
      `Thank you for your appointment-related query. I've logged this in our system, and a healthcare provider will assist you with scheduling.`
    ],
    prescription: [
      `I understand you have a question about your prescription. For patient safety, a healthcare provider will need to review your medication request.`,
      `Thank you for your prescription inquiry. While I cannot provide medical advice, I've prioritized your request for review by a qualified healthcare provider.`
    ],
    billing: [
      `I see your question is about billing. I've recorded your concern, and a billing specialist will review your account and respond shortly.`,
      `Thank you for your billing inquiry. Your financial questions are important to us, and a team member will address your concerns soon.`
    ],
    technical: [
      `I understand you're experiencing technical difficulties. I've logged this issue, and our technical support team will help resolve it.`,
      `Thank you for reporting this technical issue. Our IT team will review your case and provide assistance shortly.`
    ],
    other: [
      `Thank you for your message. I've categorized your request and a healthcare team member will respond to your specific needs soon.`,
      `I've received your inquiry. While I can help with basic information, a healthcare provider will follow up with personalized assistance.`
    ]
  };
  
  // Select a random response from the appropriate category
  const categoryResponses = responses[category] || responses.other;
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  
  return categoryResponses[randomIndex];
};

module.exports = {
  generateAIResponse
};