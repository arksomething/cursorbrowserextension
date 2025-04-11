import React from 'react';
import './App.css';
import Logo from './assets/logo.png';


const App = () => {
  return (
    <div style={popupStyle}>
      <p style={textStyle}>Reload your tabs, then press Ctrl + B to toggle the sidebar.</p>
      <img src={Logo} alt="Sophon Logo"  
        style={{ width: 48, height: 48 }}
      />
    </div>
  )
};

const popupStyle = {
  width: "200px",
  height: "100px",
  display: "flex",
  padding: "48px",
  justifyContent: "center",
  gap: "12px",
  alignItems: "center",
  textAlign: "center",
  backgroundColor: "white",
};

const textStyle = {
  fontSize: "14px",
  color: "#333",
};


export default App;
