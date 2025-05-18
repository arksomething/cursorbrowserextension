import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthContext';
import SidepanelApp from './SidepanelApp';

import './App.css';

const ExtensionApp = () => {
  return (
    <div className="extension-container">
      <AuthProvider>
        <SidepanelApp />
      </AuthProvider>
    </div>
  );
};

export default ExtensionApp; 