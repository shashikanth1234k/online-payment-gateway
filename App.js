import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentHistory from './pages/PaymentHistory';
import AddProduct from './components/AddProduct';
import PaymentQR from './pages/PaymentQR';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/payment-qr" element={<PaymentQR />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App; 