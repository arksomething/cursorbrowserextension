import React from 'react';
import './Subscribe.css';
import { useAuth } from './AuthContext';

export default function Subscribe({ setRoute }) {
  const { user } = useAuth();
  
  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://createcheckoutsession-n3piq2jhqq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lookup_key: 'sophon_plus', uid: user.uid })
      });      
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const url = await response.text();
      // Open Stripe checkout in a new tab instead of redirecting
      chrome.tabs.create({ url });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="pricing-page">
      <h1 className="pricing-header">Pricing</h1>
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
            <button className="upgrade-button" onClick={handleCheckout}>
              Upgrade to Plus
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
      <button className="return-button" onClick={() => setRoute("Chat")}>
        Return to Chat
      </button>
    </div>
  );
}
