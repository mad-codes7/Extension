class ChatGPTPromptMonitor {
  constructor() {
    this.prompts = [];
    this.observer = null;
    this.isInitialized = false;
    this.lastPromptCount = 0;
    
    this.init();
  }

  init() {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    // Initial scan
    this.scanForPrompts();
    
    // Set up mutation observer to watch for new prompts
    this.setupMutationObserver();
    
    // Set up message listener for scroll requests
    this.setupMessageListener();
    
    // Periodic check as backup
    setInterval(() => this.scanForPrompts(), 2000);
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain chat messages
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (this.isMessageContainer(node) || 
                  node.querySelector && node.querySelector(this.getMessageSelectors().join(', '))) {
                shouldScan = true;
              }
            }
          });
        }
      });
      
      if (shouldScan) {
        setTimeout(() => this.scanForPrompts(), 500);
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  getMessageSelectors() {
    // Multiple selectors to handle different ChatGPT UI versions
    return [
      '[data-message-author-role="user"]',
      '.group.w-full.text-token-text-primary',
      '[data-testid*="conversation-turn"]',
      '.flex.flex-col.items-start.gap-4.whitespace-pre-wrap',
      '.group.final-completion'
    ];
  }

  isMessageContainer(element) {
    const selectors = this.getMessageSelectors();
    return selectors.some(selector => {
      try {
        return element.matches && element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }

  scanForPrompts() {
    try {
      const newPrompts = [];
      const selectors = this.getMessageSelectors();
      
      // Try multiple selectors to find user messages
      let userMessages = [];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (this.isUserMessage(element)) {
              userMessages.push(element);
            }
          });
        } catch (e) {
          // Selector might not be valid in current context
        }
      });

      // Remove duplicates and sort by position
      userMessages = this.removeDuplicates(userMessages);
      userMessages.sort((a, b) => {
        const posA = a.getBoundingClientRect().top + window.scrollY;
        const posB = b.getBoundingClientRect().top + window.scrollY;
        return posA - posB;
      });

      userMessages.forEach((element, index) => {
        const text = this.extractPromptText(element);
        if (text && text.trim().length > 0) {
          newPrompts.push({
            id: `prompt-${Date.now()}-${index}`,
            text: text.trim(),
            element: element,
            timestamp: new Date().toLocaleTimeString(),
            index: index + 1
          });
        }
      });

      // Only update if prompts changed
      if (newPrompts.length !== this.prompts.length || 
          !this.arraysEqual(newPrompts.map(p => p.text), this.prompts.map(p => p.text))) {
        this.prompts = newPrompts;
        this.notifyPromptsUpdated();
      }
    } catch (error) {
      console.error('Error scanning for prompts:', error);
    }
  }

  isUserMessage(element) {
    // Check various indicators that this is a user message
    const indicators = [
      () => element.getAttribute('data-message-author-role') === 'user',
      () => element.querySelector('[data-message-author-role="user"]'),
      () => element.classList.contains('group') && 
            element.querySelector('.bg-token-main-surface-secondary'),
      () => {
        const parent = element.closest('.group');
        return parent && parent.querySelector('[data-message-author-role="user"]');
      },
      () => {
        // Look for user avatar or indicators
        const hasUserIndicator = element.querySelector('img[alt*="User"], .user-avatar, [class*="user"]');
        return hasUserIndicator;
      }
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch (e) {
        return false;
      }
    });
  }

  extractPromptText(element) {
    try {
      // Try multiple methods to extract text
      const textSelectors = [
        '.whitespace-pre-wrap',
        '[data-message-content]',
        '.markdown',
        'p',
        'div'
      ];

      for (const selector of textSelectors) {
        const textElement = element.querySelector(selector);
        if (textElement && textElement.textContent.trim()) {
          return textElement.textContent.trim();
        }
      }

      // Fallback to direct text content
      return element.textContent.trim();
    } catch (error) {
      return '';
    }
  }

  removeDuplicates(elements) {
    const seen = new Set();
    return elements.filter(element => {
      const key = element.textContent.trim().substring(0, 50);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  notifyPromptsUpdated() {
    const promptsData = this.prompts.map(prompt => ({
      id: prompt.id,
      text: prompt.text,
      timestamp: prompt.timestamp,
      index: prompt.index
    }));

    chrome.runtime.sendMessage({
      type: 'PROMPTS_UPDATED',
      prompts: promptsData
    }).catch(() => {
      // Extension context might be invalidated
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCROLL_TO_PROMPT') {
        this.scrollToPrompt(message.promptId);
        sendResponse({ success: true });
      }
    });
  }

  scrollToPrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (prompt && prompt.element) {
      // Smooth scroll to the element
      prompt.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });

      // Highlight the prompt temporarily
      this.highlightElement(prompt.element);
    }
  }

  highlightElement(element) {
    const originalStyle = element.style.cssText;
    element.style.cssText += `
      background-color: #fef3c7 !important;
      border: 2px solid #f59e0b !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
    `;

    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, 2000);
  }
}

// Initialize the monitor
new ChatGPTPromptMonitor();
