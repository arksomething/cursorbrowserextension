console.log("Background script running!");

let activeData = {selectedText: "", tabText: "", activeText: "", favicon: "", url: "", title: "", targetElement: ""};

let isActive = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "getIsActive") {
        sendResponse(isActive);
    }

});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  
  if (request.action === "toggleSidebar") {
    console.log("Toggling received")
    if (isActive) {
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
      activeData = request.data

    } else {
      console.log("Attempting close...")
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
    }
    isActive = !isActive;
  }
});


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.action === "updateExistingSidebar") {
    console.log("Called updateExistingSidebar, sending to sidebar from background")

    activeData = request.data
    console.log(activeData)

    chrome.runtime.sendMessage({
      action: "sendExistingSidebar",
      data: activeData
    });

    sendResponse({ status: "success", message: "Sent data to sidebar" });
  }

  if (request.code) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { code: request.code }, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ status: "Error sending code to content script" });
        } else {
          sendResponse(response);
        }
      });
    });
    return true; 
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestData") {
    console.log("Requesting activeData from Sidebar, activeData: ", activeData)
    sendResponse(activeData)
  }
});

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
        } else {
          console.log("Response from content script: ", response);
          activeData = response;
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
      chrome.tabs.sendMessage(tabId, { tabChanged: true }, function (response) {
        if (chrome.runtime.lastError) {
          console.warn("Content script not available on this tab. Err: " + chrome.runtime.lastError);
        } else {
          console.log("Response from content script: ", response);
          chrome.runtime.sendMessage({
            action: "sendExistingSidebar",
            data: response
          });
        }
      });
  }
});



