import React from 'react';
import './App.css';
import Logo from './assets/logo.png';


const App = () => {
  return (
    <div style={popupStyle}>
      <div style={leftDivStyle}>
        <p style={textStyle}>Reload your current tabs, then press Alt + L to toggle the sidebar.</p>
        {/* <button style={buttonStyle} onClick={() => chrome.runtime.sendMessage({action: "toggleSidebarFromPopup"})}>
          Toggle Sidebar
        </button> */}
      </div>
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

const leftDivStyle = {
  display: "flex",
  gap: "12px",
  flexDirection: "column"
};

const buttonStyle = {
  padding: "0.3em 0.6em",
  borderRadius: "8px",
  background: "#000",
  color: "white",
  border: "none",
};

const textStyle = {
  fontSize: "14px",
  color: "#333",
};


export default App;
