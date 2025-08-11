class SidePanelManager {
  constructor() {
    this.prompts = [];
    this.filteredPrompts = [];
    this.currentSearchTerm = '';
    
    this.initializeElements();
    this.setupEventListeners();
    this.requestPromptsUpdate();
  }

  initializeElements() {
    this.promptList = document.getElementById('promptList');
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearch');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.promptCount = document.getElementById('promptCount');
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.clearSearch();
    });

    // Refresh button
    this.refreshBtn.addEventListener('click', () => {
      this.refreshPrompts();
    });

    // Listen for prompts updates from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PROMPTS_UPDATED') {
        this.updatePrompts(message.prompts);
      }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        this.searchInput.focus();
      }
    });
  }

  handleSearch(searchTerm) {
    this.currentSearchTerm = searchTerm.toLowerCase().trim();
    
    if (this.currentSearchTerm) {
      this.clearSearchBtn.style.display = 'flex';
      this.filteredPrompts = this.prompts.filter(prompt =>
        prompt.text.toLowerCase().includes(this.currentSearchTerm)
      );
    } else {
      this.clearSearchBtn.style.display = 'none';
      this.filteredPrompts = [...this.prompts];
    }
    
    this.renderPrompts();
  }

  clearSearch() {
    this.searchInput.value = '';
    this.currentSearchTerm = '';
    this.clearSearchBtn.style.display = 'none';
    this.filteredPrompts = [...this.prompts];
    this.renderPrompts();
    this.searchInput.focus();
  }

  updatePrompts(prompts) {
    this.prompts = prompts || [];
    this.filteredPrompts = this.currentSearchTerm ? 
      this.prompts.filter(prompt => 
        prompt.text.toLowerCase().includes(this.currentSearchTerm)
      ) : [...this.prompts];
    
    this.updatePromptCount();
    this.renderPrompts();
  }

  updatePromptCount() {
    const count = this.prompts.length;
    this.promptCount.textContent = `${count} prompt${count !== 1 ? 's' : ''}`;
  }

  renderPrompts() {
    if (this.filteredPrompts.length === 0) {
      this.renderEmptyState();
      return;
    }

    const promptsHTML = this.filteredPrompts.map((prompt, index) => {
      const highlightedText = this.highlightSearchTerm(prompt.text);
      const truncatedText = this.truncateText(highlightedText, 150);
      
      return `
        <div class="prompt-item" data-prompt-id="${prompt.id}">
          <div class="prompt-content">
            <div class="prompt-number">${prompt.index}</div>
            <div class="prompt-details">
              <div class="prompt-text">${truncatedText}</div>
              <div class="prompt-meta">
                <span class="timestamp">${prompt.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.promptList.innerHTML = promptsHTML;

    // Add click listeners
    this.promptList.querySelectorAll('.prompt-item').forEach(item => {
      item.addEventListener('click', () => {
        const promptId = item.dataset.promptId;
        this.scrollToPrompt(promptId);
      });
    });
  }

  renderEmptyState() {
    if (this.currentSearchTerm) {
      this.promptList.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No prompts found</h3>
          <p>No prompts match "${this.currentSearchTerm}"</p>
        </div>
      `;
    } else {
      this.promptList.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12h8m-8 4h6m2 5H6a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No prompts found</h3>
          <p>Start chatting with ChatGPT to see your prompts here</p>
        </div>
      `;
    }
  }

  highlightSearchTerm(text) {
    if (!this.currentSearchTerm) return this.escapeHtml(text);
    
    const escapedText = this.escapeHtml(text);
    const escapedSearchTerm = this.escapeHtml(this.currentSearchTerm);
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    // Find a good breaking point
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return text.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async scrollToPrompt(promptId) {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) return;

      // Send message to content script to scroll to prompt
      await chrome.tabs.sendMessage(tab.id, {
        type: 'SCROLL_TO_PROMPT',
        promptId: promptId
      });

      // Visual feedback
      this.showScrollFeedback();
    } catch (error) {
      console.error('Failed to scroll to prompt:', error);
      this.showErrorFeedback();
    }
  }

  showScrollFeedback() {
    // Temporarily change refresh button to show success
    const originalText = this.refreshBtn.innerHTML;
    this.refreshBtn.innerHTML = `
      <svg class="refresh-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      Scrolled!
    `;
    
    setTimeout(() => {
      this.refreshBtn.innerHTML = originalText;
    }, 1500);
  }

  showErrorFeedback() {
    const originalText = this.refreshBtn.innerHTML;
    this.refreshBtn.innerHTML = `
      <svg class="refresh-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      Error
    `;
    
    setTimeout(() => {
      this.refreshBtn.innerHTML = originalText;
    }, 1500);
  }

  async refreshPrompts() {
    // Show loading state
    this.refreshBtn.innerHTML = `
      <svg class="refresh-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
      </svg>
      Refreshing...
    `;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        // Trigger a refresh in the content script
        await chrome.tabs.sendMessage(tab.id, { type: 'REFRESH_PROMPTS' });
      }
    } catch (error) {
      console.error('Failed to refresh prompts:', error);
    }

    // Reset button after a delay
    setTimeout(() => {
      this.refreshBtn.innerHTML = `
        <svg class="refresh-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
        </svg>
        Refresh
      `;
    }, 1000);
  }

  requestPromptsUpdate() {
    // Request initial prompts update
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'REQUEST_PROMPTS_UPDATE' }).catch(() => {
        // Extension context might not be ready
      });
    }, 500);
  }
}

// Initialize the side panel manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SidePanelManager();
});
