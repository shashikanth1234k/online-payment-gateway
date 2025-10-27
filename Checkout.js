import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountName: ''
  });
  const [qrCode, setQrCode] = useState(null);

  const handlePaymentMethodChange = async (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setError(null);

    if (method === 'qr') {
      try {
        const response = await axios.post('http://localhost:5000/api/payments/generate-qr', {
          amount: getCartTotal()
        });
        
        if (response.data.success) {
          setQrCode(response.data.qrCode);
        } else {
          setError(response.data.message || 'Failed to generate QR code');
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code. Please try again.');
      }
    }
  };

  const handleUpiIdChange = (e) => {
    setUpiId(e.target.value);
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          console.error('Stripe not initialized');
          setError('Payment system not ready. Please try again.');
          setProcessing(false);
          return;
        }

        const { data: { clientSecret } } = await axios.post(
          'http://localhost:5000/api/payments/create-payment-intent',
          { amount: getCartTotal() }
        );

        const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
            },
          }
        );

        if (stripeError) {
          console.error('Stripe payment error:', stripeError);
          setError(stripeError.message);
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          await savePaymentDetails('card', paymentIntent.id);
        }
      } else if (paymentMethod === 'upi') {
        if (!upiId) {
          console.error('UPI ID not provided');
          setError('Please enter your UPI ID');
          setProcessing(false);
          return;
        }

        console.log('Initiating UPI payment:', {
          amount: getCartTotal(),
          upiId,
          products: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        });

        const response = await axios.post('http://localhost:5000/api/payments/upi', {
          amount: getCartTotal(),
          upiId,
          products: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        });

        console.log('UPI payment response:', response.data);

        if (response.data.success) {
          await savePaymentDetails('upi', response.data.paymentId);
        } else {
          console.error('UPI payment failed:', response.data.message);
          setError(response.data.message || 'UPI payment failed');
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === 'bank') {
        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountName) {
          console.error('Bank details incomplete');
          setError('Please fill in all bank details');
          setProcessing(false);
          return;
        }

        console.log('Initiating bank transfer:', {
          amount: getCartTotal(),
          bankDetails,
          products: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        });

        const response = await axios.post('http://localhost:5000/api/payments/bank-transfer', {
          amount: getCartTotal(),
          bankDetails,
          products: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        });

        console.log('Bank transfer response:', response.data);

        if (response.data.success) {
          await savePaymentDetails('bank', response.data.paymentId);
        } else {
          console.error('Bank transfer failed:', response.data.message);
          setError(response.data.message || 'Bank transfer failed');
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === 'qr') {
        console.log('Redirecting to QR code payment');
        navigate('/payment-qr', { state: { qrCode, amount: getCartTotal() } });
        return;
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Payment failed');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError('An error occurred. Please try again.');
      }
      setProcessing(false);
    }
  };

  const savePaymentDetails = async (method, paymentId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/payments/save-payment', {
        amount: getCartTotal(),
        paymentMethod: method,
        stripePaymentId: paymentId,
        products: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearCart();
      navigate('/payment-success');
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment details. Please try again.');
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="payment-method-selector mb-4">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            id="cardPayment"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={handlePaymentMethodChange}
          />
          <label className="form-check-label" htmlFor="cardPayment">
            Credit/Debit Card
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            id="upiPayment"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={handlePaymentMethodChange}
          />
          <label className="form-check-label" htmlFor="upiPayment">
            UPI
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            id="qrPayment"
            value="qr"
            checked={paymentMethod === 'qr'}
            onChange={handlePaymentMethodChange}
          />
          <label className="form-check-label" htmlFor="qrPayment">
            Scan QR Code
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="paymentMethod"
            id="bankPayment"
            value="bank"
            checked={paymentMethod === 'bank'}
            onChange={handlePaymentMethodChange}
          />
          <label className="form-check-label" htmlFor="bankPayment">
            Bank Transfer
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        {paymentMethod === 'card' ? (
          <div className="mb-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        ) : paymentMethod === 'upi' ? (
          <div className="mb-3">
            <label htmlFor="upiId" className="form-label">UPI ID</label>
            <input
              type="text"
              className="form-control"
              id="upiId"
              value={upiId}
              onChange={handleUpiIdChange}
              placeholder="Enter your UPI ID (e.g., username@upi)"
              required
            />
          </div>
        ) : paymentMethod === 'bank' ? (
          <div className="mb-3">
            <div className="mb-3">
              <label htmlFor="accountName" className="form-label">Account Holder Name</label>
              <input
                type="text"
                className="form-control"
                id="accountName"
                name="accountName"
                value={bankDetails.accountName}
                onChange={handleBankDetailsChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="accountNumber" className="form-label">Account Number</label>
              <input
                type="text"
                className="form-control"
                id="accountNumber"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
              <input
                type="text"
                className="form-control"
                id="ifscCode"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={handleBankDetailsChange}
                required
              />
            </div>
          </div>
        ) : paymentMethod === 'qr' && qrCode ? (
          <div className="mb-3 text-center">
            <img src={qrCode} alt="Payment QR Code" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
            <p className="text-muted">Scan this QR code with your payment app to complete the transaction</p>
          </div>
        ) : null}

        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="order-summary mb-4">
          <h4>Order Summary</h4>
          <p>Total Amount: ${getCartTotal().toFixed(2)}</p>
        </div>

        {paymentMethod !== 'qr' && (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
          </button>
        )}
      </form>
    </div>
  );
};

const Checkout = () => {
  return (
    <div className="container mt-4">
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
};

export default Checkout; 