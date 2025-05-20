require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables (don't log in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment variables:');
  console.log('STRIPE_SECRET_KEY:', process.env.VITE_STRIPE_SECRET_KEY ? '***set***' : 'missing');
  console.log('PORT:', PORT);
}

// Middleware with CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/create-payment-intent', async (req, res, next) => {
  try {
    console.log('Payment intent request body:', JSON.stringify(req.body, null, 2));
    
    const { amount } = req.body;
    
    if (!amount || isNaN(amount)) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: { received: amount, type: typeof amount }
      });
    }
    
    // Convert amount to cents (smallest currency unit for Stripe)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    console.log('Creating payment intent for amount:', amountInCents, 'cents');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      id: paymentIntent.id
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET  http://localhost:${PORT}/api/test`);
  console.log(`- POST http://localhost:${PORT}/api/create-payment-intent`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
