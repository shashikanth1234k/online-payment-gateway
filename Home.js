import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to the Payment Gateway System</h1>
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Shop Products</h5>
              <p className="card-text">Browse and purchase our products</p>
              <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">View Cart</h5>
              <p className="card-text">Manage your shopping cart</p>
              <Link to="/cart" className="btn btn-primary">View Cart</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 