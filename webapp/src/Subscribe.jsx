import React, { useState } from 'react';
import './Subscribe.css';
import { useAuth } from './AuthContext';
import { STRIPE_CHECKOUT_ENDPOINT, STRIPE_PRODUCTS } from './constants';

export default function Subscribe({ setRoute }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(STRIPE_CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lookup_key: STRIPE_PRODUCTS.PLUS, 
          uid: user.uid,
          success_url: window.location.origin + '/success',
          cancel_url: window.location.origin + '/cancel'
        })
      });      
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const url = await response.text();
      window.location.href = url;
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      <h1 className="pricing-header">Pricing</h1>
      {error && <div className="error-message">{error}</div>}
      <section className="plans-container">
        <div className="product premium">
          <div className="description">
            <div className="plan-header">
              <h3>Plus</h3>
              <div className="price-details">
                <span className="current-price">$9.99</span>
                <span className="per-month">/Mo</span>
              </div>
            </div>
            <ul className="features">
              <li>Unlimited Base Models</li>
              <li>Monthly Access to Premium Models</li>
            </ul>
            <button 
              className="upgrade-button" 
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Upgrade to Plus'}
            </button>
          </div>
        </div>

        <div className="product">
          <div className="description">
            <div className="plan-header">
              <h3>Free</h3>
              <div className="price-details">
                <span className="current-price">No cost</span>
              </div>
            </div>
            <ul className="features">
              <li>Base Model Trial Credits</li>
              <li>Access to core functionality</li>
            </ul>
          </div>
        </div>
      </section>
      <button 
        className="return-button" 
        onClick={() => setRoute("Chat")}
        disabled={isLoading}
      >
        Return to Chat
      </button>
    </div>
  );
}
