import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import qr from '../assets/qr.jpg';
const PaymentQR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const { qrCode, amount } = location.state || {};

  useEffect(() => {
    if (!qrCode || !amount) {
      navigate('/checkout');
      return;
    }

    // Extract payment ID from QR code data
    try {
      const qrData = JSON.parse(atob(qrCode.split(',')[1]));
      setPaymentId(qrData.paymentId);
    } catch (err) {
      setError('Invalid QR code data');
      return;
    }

    // Start polling for payment status
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/payments/status/${paymentId}`);
        if (response.data.success) {
          if (response.data.status === 'completed') {
            clearCart();
            navigate('/payment-success');
          } else if (response.data.status === 'failed') {
            setStatus('failed');
            setError('Payment failed. Please try again.');
            clearInterval(pollInterval);
          }
        } else {
          setError(response.data.message || 'Error checking payment status');
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError('Error checking payment status');
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [qrCode, amount, paymentId, navigate, clearCart]);

  if (!qrCode || !amount) {
    return null;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h2>Scan QR Code to Pay</h2>
          <div className="card p-4">
            <img 
              src="./qr.jpg"
              alt="Payment QR Code" 
              className="img-fluid mb-3" 
              style={{ maxWidth: '300px' }}
              onError={() => setError('Failed to load QR code image')}
            />
            <h4 className="mb-3">Amount: ${amount.toFixed(2)}</h4>
            <p className="text-muted">Scan this QR code with your payment app to complete the transaction</p>
            
            {status === 'pending' && (
              <div className="alert alert-info">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Waiting for payment confirmation...
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger">
                {error}
                <div className="mt-3">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigate('/checkout')}
                  >
                    Try Again
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentQR; 