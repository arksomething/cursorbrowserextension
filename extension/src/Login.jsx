import React, { useState } from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';
import ResetPassword from './ResetPassword'; // Import ResetPassword
import './Login.css';

const Login = () => {
  const [currentRoute, setCurrentRoute] = useState('SignIn'); // Single state to manage routes

  return (
    <div>
      {currentRoute === 'ResetPassword' ? (
        <ResetPassword setCurrentRoute={setCurrentRoute} />
      ) : currentRoute === 'SignUp' ? (
        <SignUp setCurrentRoute={setCurrentRoute} />
      ) : (
        <SignIn setCurrentRoute={setCurrentRoute} />
      )}
    </div>
  );
};

export default Login;
