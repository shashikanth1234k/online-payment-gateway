import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/payments/history');
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <div className="payment-history-container">
      <h2>Payment History</h2>
      {payments.length === 0 ? (
        <p>No payment history available.</p>
      ) : (
        <div className="row">
          {payments.map(payment => (
            <div key={payment.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Payment #{payment.id}</h5>
                  <p className="card-text">Amount: ${payment.amount}</p>
                  <p className="card-text">Status: {payment.status}</p>
                  <p className="card-text">
                    Date: {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 