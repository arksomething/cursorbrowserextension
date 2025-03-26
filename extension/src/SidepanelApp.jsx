import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx'
import OpenAIStream from './OpenAIStream.jsx'

const SidepanelApp = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      chrome.runtime.sendMessage({ action: "requestData" }, (response) => {
        setData(response)
      });
    } catch {
      setData({selectedText: "test", tabText: "text"})
    }
  
  }, []);

  return (
    <>
      <Sidebar data={data}/>
      {/* <OpenAIStream /> */}
    </>
  );
};

export default SidepanelApp;
