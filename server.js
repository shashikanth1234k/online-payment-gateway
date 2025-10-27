const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentRoutes = require('./routes/paymentRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Mount payment routes
app.use('/api/payments', paymentRoutes);

// In-memory database
let products = [];
let payments = [];

// Helper function to generate unique ID
const generateId = () => Date.now().toString();

// Routes
app.get('/api/products', (req, res) => {
  try {
    console.log('GET /api/products - Returning products:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    console.log('POST /api/products - Received data:', req.body);
    const { name, description, price, image, stock, category } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !image || !stock || !category) {
      console.log('Missing required fields:', { name, description, price, image, stock, category });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate price and stock are numbers
    if (isNaN(price) || isNaN(stock)) {
      console.log('Invalid number format:', { price, stock });
      return res.status(400).json({ error: 'Price and stock must be numbers' });
    }

    const product = {
      id: generateId(),
      name,
      description,
      price: parseFloat(price),
      image,
      stock: parseInt(stock),
      category,
      createdAt: new Date()
    };

    products.push(product);
    console.log('Added product:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/save-payment', (req, res) => {
  try {
    const { amount, paymentMethod, stripePaymentId, products: paymentProducts } = req.body;
    
    if (!amount || !paymentMethod || !stripePaymentId || !paymentProducts) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    const payment = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      paymentMethod,
      stripePaymentId,
      products: paymentProducts,
      status: 'completed',
      createdAt: new Date()
    };

    payments.push(payment);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ error: 'Failed to save payment' });
  }
});

app.get('/api/payments/history', (req, res) => {
  try {
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  console.error(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/payments/upi');
  console.log('- POST /api/payments/generate-qr');
  console.log('- GET /api/payments/status/:paymentId');
  console.log('- POST /api/payments/complete-payment/:paymentId');
}); 