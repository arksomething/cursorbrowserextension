console.log("Background script running!");

let activeData = {selectedText: "", tabText: "", activeText: "", favicon: "", url: "", title: "", targetElement: ""};

let isActive = true;

chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command received: ${command}, cur isActive: ${isActive}`);

  if (isActive) {
    await chrome.windows.getCurrent(w => chrome.sidePanel.open({windowId: w.id}))
    isActive = !isActive;
    return
  }

  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const response = await chrome.tabs.sendMessage(tab.id, {action: "commandSend"})

  if (!isActive && !response) {
    await chrome.sidePanel.setOptions({ enabled: false });
    await chrome.sidePanel.setOptions({ enabled: true });
    isActive = !isActive;
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log(`Action clicked, cur isActive: ${isActive}`);

  try {
    if (isActive) {
      await chrome.windows.getCurrent(w => chrome.sidePanel.open({windowId: w.id}))
      isActive = !isActive;
      return
    }

    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    const response = await chrome.tabs.sendMessage(tab.id, {action: "commandSend"})

    if (!isActive && !response) {
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
      isActive = !isActive;
    }
  } catch (error) {
    console.error("Error in action clicked: ", error);
  }
});



chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "getIsActive") {
        sendResponse(isActive);
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.action === "updateExistingSidebar") {
    console.log("Called updateExistingSidebar, activeData: ", request.data)
    activeData = request.data

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
    sendResponse(activeData)
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log("Tab activated")
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    // Ensure the tab is in a 'complete' state
    if (tab.status === "complete") {
      chrome.tabs.sendMessage(activeInfo.tabId, { tabChanged: true }, function (response) {
        if (chrome.runtime.lastError) {
          console.warn("Content script not available on this tab. Err: " + chrome.runtime.lastError);
        } else {
          activeData = response;
          console.log("Active data updated, response: ", response)
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
      console.log("Tab updated, sending message to content script")
      chrome.tabs.sendMessage(tabId, { tabChanged: true }, function (response) {
        if (chrome.runtime.lastError) {
          console.warn("Content script not available on this tab. Err: " + chrome.runtime.lastError);
        } else {
          activeData = response
          console.log("Active data updated, response: ", response)
          chrome.runtime.sendMessage({
            action: "sendExistingSidebar",
            data: response
          });
        }
      });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://sophonextension.vercel.app/demo" }); // or any other page
  }
});


