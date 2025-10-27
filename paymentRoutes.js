const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');

// Store payment status in memory (in production, use a database)
const paymentStatus = new Map();

// UPI Payment
router.post('/upi', async (req, res) => {
  console.log('Received UPI payment request:', req.body);
  
  try {
    const { amount, upiId, products } = req.body;
    
    // Validate input
    if (!amount || isNaN(amount)) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!upiId) {
      console.log('Missing UPI ID');
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      });
    }

    // Validate UPI ID format (basic validation)
    if (!upiId.includes('@')) {
      console.log('Invalid UPI ID format:', upiId);
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI ID format'
      });
    }

    // Generate a unique payment ID
    const paymentId = crypto.randomBytes(16).toString('hex');
    console.log('Generated payment ID:', paymentId);
    
    // Store payment details
    const paymentDetails = {
      status: 'pending',
      amount,
      upiId,
      products,
      timestamp: Date.now()
    };
    paymentStatus.set(paymentId, paymentDetails);
    console.log('Stored payment details:', paymentDetails);

    // Simulate UPI payment processing
    setTimeout(() => {
      const updatedPayment = {
        ...paymentDetails,
        status: 'completed',
        completedAt: Date.now()
      };
      paymentStatus.set(paymentId, updatedPayment);
      console.log('Payment completed:', updatedPayment);
    }, 5000); // Simulate 5 second processing time

    res.json({
      success: true,
      message: 'UPI payment initiated',
      paymentId
    });
  } catch (error) {
    console.error('Error processing UPI payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process UPI payment',
      error: error.message
    });
  }
});

// Generate QR code for payment
router.post('/generate-qr', async (req, res) => {
  console.log('Received QR code generation request:', req.body);
  
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount)) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Generate a unique payment ID
    const paymentId = crypto.randomBytes(16).toString('hex');
    console.log('Generated payment ID:', paymentId);
    
    // Create payment data string
    const paymentData = {
      paymentId,
      amount,
      timestamp: Date.now()
    };
    
    // Convert payment data to string
    const paymentDataString = JSON.stringify(paymentData);
    console.log('Payment data:', paymentData);
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(paymentDataString);
    console.log('Generated QR code');
    
    // Store initial payment status
    const paymentDetails = {
      status: 'pending',
      amount,
      timestamp: Date.now()
    };
    paymentStatus.set(paymentId, paymentDetails);
    console.log('Stored payment details:', paymentDetails);
    
    res.json({
      success: true,
      qrCode,
      paymentId
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

// Check payment status
router.get('/status/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  console.log('Checking payment status for:', paymentId);
  
  try {
    const payment = paymentStatus.get(paymentId);
    
    if (!payment) {
      console.log('Payment not found:', paymentId);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    console.log('Payment status:', payment.status);
    res.json({
      success: true,
      status: payment.status
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Simulate payment completion (for testing)
router.post('/complete-payment/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  console.log('Completing payment:', paymentId);
  
  try {
    const payment = paymentStatus.get(paymentId);
    
    if (!payment) {
      console.log('Payment not found:', paymentId);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update payment status
    const updatedPayment = {
      ...payment,
      status: 'completed',
      completedAt: Date.now()
    };
    paymentStatus.set(paymentId, updatedPayment);
    console.log('Payment completed:', updatedPayment);
    
    res.json({
      success: true,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete payment',
      error: error.message
    });
  }
});

module.exports = router; 