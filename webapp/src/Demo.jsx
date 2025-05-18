import { Link } from 'react-router-dom';
import logo128 from './assets/logo128.png';
import sophonPin from './assets/sophon_pin.gif';
import sophonAction from './assets/sophon_action.gif';
import './Demo.css';

function Demo() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="sidebar-header">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <img src={logo128} alt="Logo" width="32" height="32" />
              <h2 style={{ fontSize: '16px'}}>Sophon</h2>
            </div>
          </Link>
          <div className="sidebar-header-right">
            <a href="https://chromewebstore.google.com/detail/sophon-chat-with-context/pkmkmplckmndoendhcobbbieicoocmjo?authuser=0&hl=en" target="_blank" rel="noopener noreferrer" className="main-button premium-button">Download</a>
          </div>
        </div>
      </div>

      <div className="demo-container">
        <div className="demo-header">
          <h1>How to Use Sophon</h1>
          <p>Get started with Sophon in two simple steps</p>
        </div>

        <div className="demo-walkthrough">
          <div className="demo-gifs">
            <div className="gif-container">
              <h3>1. Pin Sophon to Your Browser</h3>
              <img src={sophonPin} alt="How to pin Sophon extension" className="demo-gif" />
              <p>Click the extensions menu (puzzle icon) in Chrome and pin Sophon for easy access</p>
            </div>
            <div className="gif-container">
              <h3>2. Start Using Sophon</h3>
              <img src={sophonAction} alt="How to use Sophon extension" className="demo-gif" />
              <p>
                Select any text on a webpage and click the Sophon icon, or press{' '}
                <span className="keyboard-shortcut">
                  <span className="key">Alt</span>
                  <span className="key-plus">+</span>
                  <span className="key">L</span>
                </span>
                {' '}to open the chat
              </p>
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="info-section">
            <h3>Create Your Account</h3>
            <p>
              To get started, simply click the Sophon icon after installation and create an account or sign in. 
            </p>
          </div>
          
          <div className="info-section">
            <h3>Try Our Web App</h3>
            <p>
              Don't want to install the extension? Try our{' '}
              <Link to="/extension" className="web-app-link">web application</Link>
              {' '}first. You'll get the same UI, model access, and billing in your browser.
            </p>
          </div>
        </div>

        <div className="demo-cta">
          <a 
            href="https://chromewebstore.google.com/detail/sophon-chat-with-context/pkmkmplckmndoendhcobbbieicoocmjo"
            target="_blank"
            rel="noopener noreferrer"
            className="main-button premium-button"
          >
            Install Sophon Extension
          </a>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="mailto:ark296296@gmail.com">Contact</a>
            built with envy @ NYC
          </div>
          <div>© {currentYear} Sophon</div>
        </div>
      </footer>
    </>
  );
}

export default Demo;
