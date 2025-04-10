import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './AuthContext';

import './index.css'
import SidepanelApp from './SidepanelApp.jsx'

import "katex/dist/katex.min.css";  // Needed for LaTeX rendering

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SidepanelApp />
    </AuthProvider>
  </StrictMode>,
)
