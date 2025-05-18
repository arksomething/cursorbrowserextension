import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import Sidebar from './Sidebar.jsx'
import User from './User.jsx'
import OpenAIStream from './OpenAIStream.jsx'
import Subscribe from './Subscribe.jsx'

import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path if needed


const SidepanelApp = () => {
  const [data, setData] = useState(null);
  const [route, setRoute] = useState("Chat");
  const [userInfo, setUserInfo] = useState(null);  
  const { user, loading } = useAuth();

  useEffect(() => {
    try {
      chrome.runtime.sendMessage({ action: "requestData" }, (response) => {
        setData(response)
      });
    } catch {
      setData({selectedText: "test", tabText: "text", activeText: "test", 
        favicon: "https://example.com/favicon.ico", url: "https://example.com/", title: "Example", targetElement: "None"
      })
    }
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);  // Reference to the user document
        const userDoc = await getDoc(userRef);     // Fetch the user document

        if (userDoc.exists()) {
          setUserInfo(userDoc.data());  // If the document exists, set the data to state
        } else {
          console.error('No such user found!');  // Handle the case if the user does not exist
        }
      } catch (err) {
        console.error('Error fetching user data: ' + err.message);  // Handle any errors
      } 
    };

    fetchUserInfo();
  }, [user]);  // Re-run effect if the userId changes

  // useEffect(() => {
  //   console.log(data)
  // }, [data]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "b") { // Detect Ctrl + K
        event.preventDefault();
        chrome.runtime.sendMessage({ action: "toggleSidebar", data: {} });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);


  useEffect(() => {
    const handleMessage = (message) => {
      if (message.action === "sendExistingSidebar") {
        console.log(message)
        console.log(message)
        setData(message.data);
      }
    };

    try {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => {
        chrome.runtime.onMessage.removeListener(handleMessage);
      };
    } catch (err) {
      console.error(err)
    }

  }, []);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      {route == "Chat" && <Sidebar data={data} setRoute={setRoute}/>}
      {route == "User" && <User setRoute={setRoute} userInfo={userInfo}/>}
      {route == "Subscribe" && <Subscribe setRoute={setRoute}/>}
      {/* <OpenAIStream /> */}
    </>
  );
};

export default SidepanelApp;
