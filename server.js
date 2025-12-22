const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve Apple Pay domain verification file
app.use('/.well-known', express.static('.well-known'));

// Explicit route for Apple Pay domain verification
app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  res.sendFile(path.join(__dirname, '.well-known', 'apple-developer-merchantid-domain-association'));
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Apple Pay session endpoint
app.post('/api/apple-pay-session', (req, res) => {
  // This endpoint creates an Apple Pay session
  // In production, you'll need to validate with Apple servers
  console.log('Apple Pay session requested');
  
  res.json({
    success: true,
    message: 'Apple Pay session created'
  });
});

// Payment validation endpoint
app.post('/api/process-payment', (req, res) => {
  const { token } = req.body;
  
  // In production, process the payment token here
  // Send it to your payment processor or Apple Pay directly
  console.log('Payment received:', token ? 'Token present' : 'No token');
  
  res.json({
    success: true,
    message: 'Payment processed successfully'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Open the index.html file in your browser');
});
