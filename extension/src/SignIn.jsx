import React, { useState } from 'react';
import { signIn } from './firebase';
import './Login.css';

const SignIn = ({ setCurrentRoute }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign In</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            className='form-field' type="email" id="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            className='form-field' type="password" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Sign In
        </button>
        <button
          type="button"
          className="toggle-button"
          onClick={() => setCurrentRoute("SignUp")}
        >
          Need an account? Sign Up
        </button>
        <button
          type="button"
          className="toggle-button"
          onClick={() => setCurrentRoute("ResetPassword")}
        >
          Forgot your password? Reset Here
        </button>
      </form>
    </div>
  );
};

export default SignIn;
