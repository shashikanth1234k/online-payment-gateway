import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{item.name}</h5>
              <p className="card-text">${item.price}</p>
              <div className="quantity-controls">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-danger btn-sm mt-2"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h4>Total: ${getCartTotal().toFixed(2)}</h4>
        <button className="btn btn-primary" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 