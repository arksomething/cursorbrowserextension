import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './AuthContext';

import './index.css'
import App from './App.jsx';

import "katex/dist/katex.min.css";  // Needed for LaTeX rendering
import "highlight.js/styles/github-dark.css"; // Needed for syntax highlighting


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
