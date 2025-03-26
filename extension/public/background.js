
console.log("Background script running!");

let sText = "";
let tText = "";
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("receiving message...")
  if (request.action === "updateSidebar") {
    const { selectedText, tabText } = request.data;
    console.log("Received data from content script:", { selectedText, tabText });
    if (sender.tab) {
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
 
      sText = selectedText
      tText = tabText
      console.log("selected and tab have been stored.")
    }
  }
  if (request.action === "closeSidePanel" && sender.tab) {
    try{
      console.log("closing")
      await chrome.sidePanel.setOptions({ enabled: false });
      await chrome.sidePanel.setOptions({ enabled: true });
        } catch (error) {
      console.log(error)
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  if (request.action === "requestData") {
    console.log("selected is being sent to frontend")
    const selectedText = sText;
    const tabText = tText;
    sendResponse({selectedText, tabText})
  }
});

