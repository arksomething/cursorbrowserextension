import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import logo128 from './assets/logo128.png'
import './App.css'

function Landing() {
  return <div><h1>Landing Page</h1><p>Welcome to the landing page.</p></div>;
}

function Success() {
  return (
    <div>
      <img src={logo128} alt="Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
      <h1>Payment Success</h1>
      <p>Your payment was successful. Thank you!</p>
    </div>
  );
}

function Cancel() {
  return (
    <div>
      <img src={logo128} alt="Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled. Please try again.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
