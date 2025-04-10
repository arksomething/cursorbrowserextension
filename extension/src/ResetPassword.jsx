import React, { useState } from 'react';
import { resetPassword } from './firebase'; // Make sure to import your Firebase config
import './Login.css';

const ResetPassword = ({ setCurrentRoute }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');  // Reset the error message
    setMessage(''); // Reset the success message

    try {
      await resetPassword(email);  // Send the password reset email
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setError(error.message);  // Display any error that occurs
    }
  };

  return (
    <div className="login-container">
      <h2>Reset Password</h2>
      {error && <div className="error-message">{error}</div>}  {/* Display error if any */}
      {message && <div className="success-message">{message}</div>}  {/* Display success message */}
      <form onSubmit={handleResetPassword}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Reset Password
        </button>
        <button
          type="button"
          className="toggle-button"
          onClick={() => setCurrentRoute("SignIn")}  // Redirect to sign-in if user remembers password
        >
          Remembered? Sign In
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
