import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import Sidebar from './Sidebar'
import User from './User'
import Subscribe from './Subscribe'

import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const SidepanelApp = () => {
  const [data, setData] = useState({
    selectedText: "Welcome to the web version! Try selecting some text on this page.",
    tabText: "This is the web version of Sophon. You can use it to test the functionality without installing the extension.",
    activeText: "Web Version",
    favicon: "/src/assets/logo128.png",
    url: window.location.href,
    title: "Sophon Web Version",
    targetElement: "None"
  });
  const [route, setRoute] = useState("Chat");
  const [userInfo, setUserInfo] = useState(null);  
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        } else {
          console.error('No such user found!');
        }
      } catch (err) {
        console.error('Error fetching user data:', err.message);
      } 
    };

    fetchUserInfo();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      {route === "Chat" && <Sidebar data={data} setRoute={setRoute}/>}
      {route === "User" && <User setRoute={setRoute} userInfo={userInfo}/>}
      {route === "Subscribe" && <Subscribe setRoute={setRoute}/>}
    </>
  );
};

export default SidepanelApp;
