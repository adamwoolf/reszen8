const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Chat test route is working!' });
});

// Handle chat messages
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log('Received chat request with messages:', messages.length);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map(({ role, content }) => ({
        role,
        content: content.toString()
      })),
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
    
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

module.exports = router;