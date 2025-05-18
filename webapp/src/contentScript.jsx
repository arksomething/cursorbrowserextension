import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Sidebar from "./Sidebar.jsx";
// import InsertedComponent from "./InsertedComponent.jsx"

console.log("New content script")
let isActive = false;

console.log("Content script loaded");

const injectSidebar = () => {
  if (!document.getElementById("my-sidebar-root")) {
    const mountPoint = document.createElement("div");
    mountPoint.id = "my-sidebar-root";
    mountPoint.style.display = 'none';
    document.body.insertBefore(mountPoint, document.body.firstChild);
    const root = createRoot(mountPoint);
    
    const SidebarWrapper = () => {
      const [data, setData] = useState(null);
      
      useEffect(() => {
        const messageHandler = (event) => {
          if (event.detail?.type === 'UPDATE_SIDEBAR_DATA') {
            console.log("Received data:", event.detail.data);
            setData(event.detail.data);
          }
        };

        document.addEventListener('SIDEBAR_EVENT', messageHandler);
        return () => document.removeEventListener('SIDEBAR_EVENT', messageHandler);
      }, []);

      return <Sidebar isVisible={isActive} data={data} />;
    };

    root.render(<SidebarWrapper />);
  }
};

// const toggleSidebarMode = () => {
//     const sidebarRoot = document.getElementById("my-sidebar-root");
//     console.log('Toggling sidebar mode');
//     isActive = !isActive;

//     if (isActive) {
//         const currentMargin = parseInt(getComputedStyle(document.body).marginRight) || 0;
//         const selectedText = window.getSelection().toString().trim();
//         const tabText = document.body.innerText;
        
//         sendDataToSidebar({selectedText, tabText});

//         sidebarRoot.style.display = "block";
//         document.body.style.width = "calc(100% - 300px)";
//         document.body.style.marginRight = "300px";
//         document.querySelectorAll("header").forEach((el) => {
//             el.style.width = "calc(100% - 300px)";
//             el.style.marginRight = `${currentMargin + 300}px`;
//         });
//     } else {
//         sidebarRoot.style.display = "none";
//         document.body.style.width = "";
//         document.body.style.marginRight = "";
//         document.querySelectorAll("header").forEach((el) => {
//             el.style.width = "";
//             el.style.marginRight = "";
//         });
//     }
// };

const toggleSidebarMode = () => {
  console.log('Toggling sidebar mode');
  isActive = !isActive;

  if (isActive) {
      const selectedText = window.getSelection().toString().trim();
      const tabText = document.body.innerText;
      
      // Send data to the sidebar
      chrome.runtime.sendMessage({
          action: "updateSidebar",
          data: { selectedText, tabText }
      });
  } else {
    chrome.runtime.sendMessage({action: "closeSidePanel"});
  }
};


console.log("Content script loaded");

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      toggleSidebarMode()
    }
     
});

if (document.readyState === "complete") {
  injectSidebar();
} else {
  window.addEventListener("load", injectSidebar);
}

