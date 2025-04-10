import React from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import SidepanelApp from './SidepanelApp';
import './App.css';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <SidepanelApp />;
};

export default App;
