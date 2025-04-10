console.log("Background script running!");

let sText = "";
let tText = "";
let aText = "";
let curFavicon = "";
let curUrl = "";
let curTitle = "";
let curElement = "";

let isActive = false;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "getIsActive") {
        sendResponse(isActive);
    }

});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "toggleSidebar") {
    console.log("Toggling received")
    if (isActive) {
      console.log("Attempting Open...")
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
    } else {
      console.log("Attempting close...")
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
    }
    isActive = !isActive;
  }
});


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "updateSidebar") {
    const { selectedText, tabText, activeText, favicon, url, title, activeElement } = request.data;
    if (sender.tab) {
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
 
      sText = selectedText
      tText = tabText
      aText = activeText
      curFavicon = favicon
      curUrl = url
      curTitle = title
      curElement = activeElement
    }
  }

  if (request.action === "updateExistingSidebar") {
    const { selectedText, tabText, activeText, favicon, url, title, activeElement } = request.data;
    console.log("Called updateExistingSidebar, sending to sidebar from background")
    chrome.runtime.sendMessage({
      action: "sendExistingSidebar",
      data: { selectedText, tabText, activeText, favicon, url, title, activeElement }
    });

    sendResponse({ status: "success", message: "Sent data to sidebar" });
  }

  if (request.action === "closeSidePanel" && sender.tab) {
    try{
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
        } catch (error) {
      console.log(error)
    }
  }
  if (request.code) {
    // Send code to content script and wait for response
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { code: request.code }, function(response) {
        // Relay the response back to the popup
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ status: "Error sending code to content script" });
        } else {
          sendResponse(response);
        }
      });
    });
    return true; // Keep the message channel open for the async response
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestData") {
    const selectedText = sText;
    const tabText = tText;
    const activeText = aText;
    const favicon = curFavicon;
    const url = curUrl;
    const title = curTitle;
    const activeElement = curElement;
    sendResponse({selectedText, tabText, activeText, favicon, url, title, activeElement})
  }
});

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.sendMessage(activeInfo.tabId, { tabChanged: true });
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete") {
//     chrome.tabs.sendMessage(tabId, { tabSwitched: true });
//   }
// });
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    console.log("Active tab URL: " + tab.url);

    // Ensure the tab is in a 'complete' state
    if (tab.status === "complete") {
      chrome.tabs.sendMessage(activeInfo.tabId, { tabChanged: true }, function (response) {
        if (chrome.runtime.lastError) {
          console.warn("Content script not available on this tab. Err: " + chrome.runtime.lastError);
          console.log(chrome.runtime.lastError)
        } else {
          console.log("Response from content script: ", response);
          chrome.runtime.sendMessage({
            action: "sendExistingSidebar",
            data: response
          });
        }
      });
    } else {
      console.log("Tab is not yet complete. Status: " + tab.status);
    }
  });
});



chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (tab.active && change.url) {
      console.log("onUpdated: you are here: "+change.url);  
      chrome.tabs.sendMessage(tabId, { tabChanged: true });
  }
});


// // background.js
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.code) {
//       // console.log("Received code from popup:", request.code);
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//           chrome.tabs.sendMessage(tabs[0].id, { code: request.code }, (response) => {
//               // Respond back to the popup if necessary
//               sendResponse({ status: "Code sent to content script!" });
//           });
//       });
//       return true;
//   }
// });


