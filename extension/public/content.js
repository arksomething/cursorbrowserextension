console.log("New content script")
let isActive = false;

const toggleSidebarMode = () => {
  console.log('Toggling sidebar mode');
  isActive = !isActive;

  const selectedText = window.getSelection().toString().trim();
  if (isActive) {
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

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      toggleSidebarMode()
    }
     
});