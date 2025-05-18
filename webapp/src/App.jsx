import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import logo128 from './assets/logo128.png'
import './App.css'
import ExtensionApp from './ExtensionApp';
import Demo from './Demo';

function Header() {
  return (
    <div className="sidebar-header">
      <div className="header-content">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <img src={logo128} alt="Logo" width="32" height="32" />
            <h2 style={{ fontSize: '16px'}}>Sophon</h2>
          </div>
        </Link>
        <div className="sidebar-header-right">
          <a href="https://chromewebstore.google.com/detail/sophon-chat-with-context/pkmkmplckmndoendhcobbbieicoocmjo?authuser=0&hl=en" target="_blank" rel="noopener noreferrer" className="main-button premium-button">Download</a>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="mailto:ark296296@gmail.com">Contact</a>
          built with envy @ NYC
        </div>
        <div>© {currentYear} Sophon</div>
      </div>
    </footer>
  );
}

function Landing() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="landing-container">
      <Header />
      <div className="landing-content">
        <img src={logo128} alt="Logo" width="54" height="54" style={{ marginBottom: '24px' }} />
        <h1>Welcome to Sophon</h1>
        <p>Your intelligent browser companion</p>
        <div className="cta-buttons">
          <a href="https://chromewebstore.google.com/detail/sophon-chat-with-context/pkmkmplckmndoendhcobbbieicoocmjo?authuser=0&hl=en" target="_blank" rel="noopener noreferrer" className="main-button premium-button">Download Extension</a>
          <a href="/extension" className="main-button">Try Web App</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Success() {
  return (
    <div className="success-container">
      <Header />
      <div className="success-content">
        <img src={logo128} alt="Logo" width="64" height="64" />
        <h1>Payment Success</h1>
        <p>Your payment was successful. Thank you!</p>
        <Link to="/extension" className="main-button">Return to App</Link>
      </div>
      <Footer />
    </div>
  );
}

function Cancel() {
  return (
    <div className="cancel-container">
      <Header />
      <div className="cancel-content">
        <img src={logo128} alt="Logo" width="64" height="64" />
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. Please try again.</p>
        <Link to="/extension" className="main-button">Return to App</Link>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/extension/*" element={<ExtensionApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
