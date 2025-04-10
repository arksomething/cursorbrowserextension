// Listen for authentication state changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_STATE_CHANGED') {
    // Store the authentication state
    chrome.storage.local.set({ authState: message.authState }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for the async response
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage
  chrome.storage.local.set({
    authState: null,
    userData: null
  });
}); 