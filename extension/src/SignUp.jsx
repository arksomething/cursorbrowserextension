import React, { useState } from 'react';
import { signUp } from './firebase';
import './Login.css';

const SignUp = ({ setCurrentRoute }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.06202 12.3481C1.97868 12.1236 1.97868 11.8766 2.06202 11.6521C2.87372 9.68397 4.25153 8.00116 6.02079 6.81701C7.79004 5.63287 9.87106 5.00073 12 5.00073C14.129 5.00073 16.21 5.63287 17.9792 6.81701C19.7485 8.00116 21.1263 9.68397 21.938 11.6521C22.0214 11.8766 22.0214 12.1236 21.938 12.3481C21.1263 14.3163 19.7485 15.9991 17.9792 17.1832C16.21 18.3674 14.129 18.9995 12 18.9995C9.87106 18.9995 7.79004 18.3674 6.02079 17.1832C4.25153 15.9991 2.87372 14.3163 2.06202 12.3481Z" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L14.278 14.75M2 8C2.74835 10.0508 4.10913 11.8219 5.8979 13.0733C7.68667 14.3247 9.81695 14.9959 12 14.9959C14.1831 14.9959 16.3133 14.3247 18.1021 13.0733C19.8909 11.8219 21.2516 10.0508 22 8M20 15L18.274 12.95M4 15L5.726 12.95M9 18L9.722 14.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const formattedName = name.split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&^#_~\-+=]{6,}$/;
    const errors = [];
    
    if (password.length < 6) {
      errors.push('be at least 6 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('contain at least one number');
    }
    if (!/^[A-Za-z\d@$!%*?&^#_~\-+=]+$/.test(password)) {
      errors.push('contain only valid characters (letters, numbers, and @$!%*?&^#_~-+=)');
    }

    if (errors.length > 0) {
      setError('Password must ' + errors.join(', ') + '.');
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
          <div style={{ position: 'relative' }}>
            <input
              className='form-field' 
              type={showPassword ? "text" : "password"} 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
