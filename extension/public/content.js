console.log("New content script loaded - keyboard listener enabled");

var activeElement;

chrome.runtime.sendMessage({
  action: "updateExistingSidebar",
  data: ingestData()
});


function getFavicon() {
  const iconLink = document.querySelector("link[rel~='icon'], link[rel='shortcut icon']");
  if (iconLink && iconLink.href) {
    return iconLink.href;
  }

  const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
  if (appleIcon && appleIcon.href) {
    return appleIcon.href;
  }

  return `${window.location.origin}/favicon.ico`;
}

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    const highlightedText = window.getSelection().toString().trim();
    
    if (highlightedText == "") {
      chrome.runtime.sendMessage({
        action: "toggleSidebar",
        data: ingestData(),
      });
    } 

    chrome.runtime.sendMessage({
      action: "updateExistingSidebar",
      data: ingestData()
    });
  }

  // if (event.ctrlKey && event.key.toLowerCase() === 'y') { 
  //   simulateSelectAllAndDelete()
  //   simulatePaste("testing text")
  // }

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
}, true);


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

//helper functions below

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

function simulatePaste(text) {
  if (!activeElement) {
    console.error("No active element found");
    return;
  }

  try {
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

    if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
      if (activeElement.value === "") {
        activeElement.value = text;
      }

    } else if (activeElement.isContentEditable) {
      if (activeElement.textContent === "") {
        activeElement.textContent = text;
      }

    }
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

  const selectAllEvent = new KeyboardEvent('keydown', {
    key: 'a',
    code: 'KeyA', 
    keyCode: 65,
    ctrlKey: true,
    bubbles: true,
  });
  document.activeElement.dispatchEvent(selectAllEvent);

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

  let targetEditable = false;
  
  let activeText = "";
  if (targetElement && (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA")) {
    activeText = targetElement.value;
    targetEditable = true;
  } else if (targetElement && targetElement.isContentEditable) {
    activeText = targetElement.innerText;
    targetEditable = true;
  }

  const data = { selectedText: highlightedText, tabText, activeText, favicon, url, title, targetEditable }
  return data
}