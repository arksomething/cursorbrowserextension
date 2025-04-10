import React, { useState } from 'react';
import { signUp } from './firebase';
import './Login.css';

const SignUp = ({ setCurrentRoute }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log("submitting")
  
    const formattedName = name.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  
    if (formattedName !== name) {
      setError('Name must be properly capitalized.');
      return;
    }

    if (password !== passwordValidation) {
      setError('Passwords must match.');
      return;
    }
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }
  
    try {
      await signUp(formattedName, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Create Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            className='form-field' type="text" id="name" value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="password-validation">Validate Password</label>
          <input
            className='form-field' type="password" id="password-validation" value={passwordValidation}
            onChange={(e) => setPasswordValidation(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Sign Up
        </button>
        <button
          type="button"
          className="toggle-button"
          onClick={() => setCurrentRoute("SignIn")}
        >
          Already have an account? Sign In
        </button>
      </form>
    </div>
  );
};

export default SignUp;
