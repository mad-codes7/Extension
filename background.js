// Enable side panel for ChatGPT pages
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  
  const isChatGPT = tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com');
  
  if (isChatGPT && info.status === 'complete') {
    try {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      });
    } catch (error) {
      console.error('Failed to enable side panel:', error);
    }
  }
});

// Handle side panel toggle
chrome.action.onClicked.addListener(async (tab) => {
  const isChatGPT = tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com'));
  
  if (isChatGPT) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROMPTS_UPDATED') {
    // Forward the message to the side panel
    chrome.runtime.sendMessage(message).catch(() => {
      // Side panel might not be open, that's okay
    });
  }
});
