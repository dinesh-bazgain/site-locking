chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url && 
    (tab.url.includes('facebook.com') || tab.url.includes('instagram.com'))
  ) {
    // Check session storage for authorization
    const { [tabId]: isAuthorized } = await chrome.storage.session.get(tabId.toString());
    
    if (!isAuthorized) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["inject.js"]
      });
    }
  }
});

// Handle authorization messages from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'AUTHORIZE_TAB' && sender.tab?.id) {
    chrome.storage.session.set({ [sender.tab.id]: true });
  }
});