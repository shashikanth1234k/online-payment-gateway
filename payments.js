const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const { isAuthenticated } = require('../middleware/auth');

// Create payment intent
router.post('/create-payment-intent', isAuthenticated, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save payment details
router.post('/save-payment', isAuthenticated, async (req, res) => {
  try {
    const { amount, paymentMethod, stripePaymentId, products } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod || !stripePaymentId || !products) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, paymentMethod, stripePaymentId, or products' 
      });
    }

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required and must not be empty' });
    }

    // Validate each product
    for (const product of products) {
      if (!product.productId || !product.quantity) {
        return res.status(400).json({ error: 'Each product must have a productId and quantity' });
      }
    }

    const payment = new Payment({
      userId: req.user._id,  // Get user ID from authenticated request
      amount,
      paymentMethod,
      stripePaymentId,
      products,
      status: 'completed'
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ 
      error: 'Failed to save payment details',
      details: error.message 
    });
  }
});

// Get payment history
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 