console.log("New content script loaded - keyboard listener enabled");

let isActive = false;
var activeElement;

chrome.runtime.sendMessage({
  action: "updateExistingSidebar",
  data: ingestData()
});


function ensureFocus(element) {
  if (!element) return false;
  
  try {
    element.focus();
    setTimeout(() => {
      element.focus();
      element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, 50);
    return document.activeElement === element;
  } catch (error) {
    console.error("Focus error:", error);
    return false;
  }
}

function getFavicon() {
  // First, try to get the favicon from <link rel="icon"> or <link rel="shortcut icon">
  const iconLink = document.querySelector("link[rel~='icon'], link[rel='shortcut icon']");
  if (iconLink && iconLink.href) {
    return iconLink.href;
  }

  // If not found, try looking for an apple-touch-icon (for mobile)
  const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
  if (appleIcon && appleIcon.href) {
    return appleIcon.href;
  }

  // If no favicon found, fallback to /favicon.ico
  return `${window.location.origin}/favicon.ico`;
}

const toggleSidebarMode = () => {
  isActive = !isActive;

  if (isActive) {
    
    // Send data to the sidebar
    chrome.runtime.sendMessage({
      action: "updateSidebar",
      data: ingestData()
    });
  } else {
    chrome.runtime.sendMessage({action: "closeSidePanel"});
  }
};

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    const highlightedText = window.getSelection().toString().trim();
    
    if (highlightedText && isActive) {
      chrome.runtime.sendMessage({
        action: "updateExistingSidebar",
        data: ingestData()
      });
    
    } else {
      chrome.runtime.sendMessage({
        action: "updateExistingSidebar",
        data: ingestData()
      });
      chrome.runtime.sendMessage({
        action: "toggleSidebar",
      });
      toggleSidebarMode();
      
    }
  }

  if (event.ctrlKey && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    const highlightedText = window.getSelection().toString().trim();
    
    if (highlightedText == "") {
      console.log("togglingSidebar...")
      chrome.runtime.sendMessage({
        action: "toggleSidebar",
      });
    } 

    chrome.runtime.sendMessage({
      action: "updateExistingSidebar",
      data: ingestData()
    });
  }

}, true);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.tabChanged) {
    sendResponse(ingestData());
  }
});

document.addEventListener("focus", (event) => {
  chrome.runtime.sendMessage({
    action: "updateExistingSidebar",
    data: ingestData()
  });
}, true); // Use capture phase to catch all focus events


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.code) {
    const targetElement = activeElement || document.activeElement;
    
    if (targetElement && (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA" || targetElement.isContentEditable)) {
      activeElement = targetElement;
      ensureFocus(activeElement);
      
      setTimeout(() => {
        simulateSelectAllAndDelete()
        simulatePaste(message.code)
        triggerInputEvent(activeElement);
        sendResponse({ status: "Code inserted" });
      }, 100);
    } else {
      sendResponse({ status: "No valid input field found" });
    }
    return true;
  }
});

function simulatePaste(text) {
  if (!activeElement) {
    console.error("No active element found");
    return;
  }

  try {
    if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
      activeElement.value = "";
    } else if (activeElement.isContentEditable) {
      activeElement.textContent = "";
    }

    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: clipboardData
    });

    activeElement.dispatchEvent(pasteEvent);

    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (error) {
    console.error("Error in simulatePaste:", error);
  }
}

// Simple function to trigger input event
function triggerInputEvent(element) {
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function simulateSelectAllAndDelete() {
  // Ensure the Monaco editor (or text area) has focus
  const targetElement = activeElement || document.activeElement;
  ensureFocus(targetElement);

  // Simulate "Ctrl+A" (Select All) to select the content
  const selectAllEvent = new KeyboardEvent('keydown', {
    key: 'a',
    code: 'KeyA',
    keyCode: 65,
    ctrlKey: true,
    bubbles: true,
  });
  document.activeElement.dispatchEvent(selectAllEvent);

  // Simulate "Backspace" to delete the selected content
  const deleteEvent = new KeyboardEvent('keydown', {
    key: 'Backspace',
    code: 'Backspace',
    keyCode: 8,
    bubbles: true,
  });
  document.activeElement.dispatchEvent(deleteEvent);
}

function ingestData() {
  const highlightedText = window.getSelection().toString().trim();
  const tabText = document.body.innerText;
  const targetElement = document.activeElement;
  const favicon = getFavicon();
  const url = window.location.href;
  const title = document.title;

  activeElement = targetElement;
  
  let activeText = "";
  if (targetElement && (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA")) {
    activeText = targetElement.value;
  } else if (targetElement && targetElement.isContentEditable) {
    activeText = targetElement.innerText;
  }

  const data = { selectedText: highlightedText, tabText, activeText, favicon, url, title, targetElement }
  return data
}