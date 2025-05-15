import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getDoc, doc, collection } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path if needed

import LogoutButton from './LogoutButton';

import './User.css';

const User = ({ setRoute }) => {
  const { user, loading } = useAuth();

  const [userInfo, setUserInfo] = useState(null);  
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);  // Reference to the user document
        const userDoc = await getDoc(userRef);     // Fetch the user document

        if (userDoc.exists()) {
          setUserInfo(userDoc.data());  // If the document exists, set the data to state
        } else {
          setError('No such user found!');  // Handle the case if the user does not exist
        }
      } catch (err) {
        setError('Error fetching user data: ' + err.message);  // Handle any errors
      } finally {
        setLoadingContent(false);  // Set loading to false once the data is fetched
      }
    };

    fetchUserInfo();
  }, [user]);  // Re-run effect if the userId changes

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className='user'>
      <h2 className='user-title'>User Profile</h2>
      {userInfo ? (
        <div className='user-info'>
          <p>Name: {userInfo.name}</p>
          <p>Email: {userInfo.email}</p>
          <p>Plan: {userInfo.plan}</p>
          <p>Credits: {userInfo.credits}</p>
          <p>Created At: {new Date(userInfo.createdAt.seconds * 1000).toLocaleString()}</p>
        </div>
      ) : (
        <div>No user information available</div>
      )}
      {loadingContent && <div>Loading...</div>}
      <div className='user-button-container'>
        <LogoutButton className="main-button"/>
        <button className="main-button" onClick={() => setRoute("Chat")}>Chat</button>
        <button className="main-button" onClick={() => setRoute("Subscribe")}>Subscribe</button>
      </div>
    </div>
    
  );
};

export default User;
