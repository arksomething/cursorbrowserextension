import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getDoc, doc, collection } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path if needed

import LogoutButton from './LogoutButton';

import './User.css';

const User = ({ setRoute, userInfo }) => {
  const { user, loading } = useAuth();

  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState(null);


  if (error) {
    return <div>{error}</div>;
  }

  const handleSubscriptionInfo = async () => {
    // Open subscription management in a new tab
    chrome.tabs.create({ url: "https://billing.stripe.com/p/login/28E28r9bidBe49dcIofQI00" }); // TODO: change to the actual URL
  }

  return (
    <div className='user'>
      <div className='user-header'>
        <h2 className='user-title'>User</h2>
        <button className="main-button" onClick={() => setRoute("Chat")}>Chat</button>
      </div>
      <div className='user-body'>
        {userInfo ? (
          <div className='user-info'>
            <p>Name: {userInfo.name}</p>
            <p>Email: {userInfo.email}</p>
            <p>Plan: {userInfo.plan}</p>
            <p>Try our webapp <a href="https://sophonextension.vercel.app/extension" target="_blank" rel="noopener noreferrer">here</a></p>
            <p>Learn how to use Sophon <a href="https://sophonextension.vercel.app/demo" target="_blank" rel="noopener noreferrer">here</a></p>
            <p>Contact us for support, bugs, or anything else at ark296296@gmail.com!</p>
          </div>
        ) : (
          <div>No user information available</div>
        )}
        {!userInfo && <div>Loading...</div>}
        <div className='user-button-container'>
          {userInfo?.plan === 'Plus' ? (
            <button className="main-button" onClick={handleSubscriptionInfo}>Subscription</button>
          ) : (
            <button className="main-button premium-button" onClick={() => setRoute("Subscribe")}>Premium</button>
          )}
          <LogoutButton className="main-button"/>
      </div>
      </div>
    </div>
    
  );
};

export default User;
