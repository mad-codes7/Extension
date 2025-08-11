# ChatGPT Prompt Navigator

A Chrome extension that enhances your ChatGPT experience by providing easy navigation through your conversation prompts with a convenient side panel interface.

## 🌟 Features

- **📋 Prompt Overview**: View all your prompts in a conversation at a glance
- **🔍 Smart Search**: Quickly find specific prompts using real-time search functionality
- **🎯 Jump Navigation**: Click any prompt to instantly scroll to it in the conversation
- **✨ Visual Highlighting**: Automatically highlights the selected prompt for easy identification
- **🔄 Real-time Updates**: Automatically detects new prompts as you continue your conversation
- **📊 Prompt Counter**: Keep track of how many prompts you've sent in the current session
- **🎨 Clean Interface**: Modern, intuitive design that doesn't interfere with ChatGPT's UI

## 🚀 Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/chatgpt-prompt-navigator.git
   cd chatgpt-prompt-navigator
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Select the extension folder

3. **Activate the Extension**
   - Navigate to [ChatGPT](https://chat.openai.com) or [ChatGPT.com](https://chatgpt.com)
   - Click the extension icon in your browser toolbar
   - The side panel will automatically open

## 💡 How to Use

### Opening the Side Panel
- Click the ChatGPT Prompt Navigator icon in your Chrome toolbar
- The side panel will appear on the right side of your browser

### Navigating Prompts
1. **View All Prompts**: All your conversation prompts are listed in chronological order
2. **Search Prompts**: Type in the search box to filter prompts by content
3. **Jump to Prompt**: Click any prompt in the list to scroll directly to it in the conversation
4. **Clear Search**: Use the X button to clear your search and see all prompts again
5. **Refresh**: Click the refresh button to manually update the prompt list

### Visual Feedback
- Selected prompts are temporarily highlighted with a yellow background and orange border
- The prompt counter shows the total number of prompts in the current conversation
- Search results update in real-time as you type

## 🛠️ Technical Details

### Architecture
- **Content Script**: Monitors ChatGPT pages for prompt changes using MutationObserver
- **Side Panel**: Provides the user interface for navigation and search
- **Background Script**: Handles communication between components
- **Manifest V3**: Built using the latest Chrome extension standards

### Key Components
- `content.js`: ChatGPT page monitoring and prompt extraction
- `sidepanel.html/js/css`: User interface and interaction handling
- `background.js`: Extension lifecycle and message routing
- `manifest.json`: Extension configuration and permissions

### Browser Compatibility
- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, etc.)

## 📁 Project Structure

```
chatgpt-prompt-navigator/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js
├── content.js
├── sidepanel.html
├── sidepanel.css
├── sidepanel.js
├── manifest.json
└── README.md
```

## 🔧 Development

### Prerequisites
- Chrome 88+ or Chromium-based browser
- Basic knowledge of Chrome extension development

### Local Development
1. Clone the repository
2. Make your changes
3. Load the extension in Chrome (Developer mode)
4. Test on ChatGPT pages
5. Reload the extension after each change

### Key Features Implementation
- **DOM Monitoring**: Uses MutationObserver for real-time prompt detection
- **Multi-selector Strategy**: Robust prompt detection across different ChatGPT UI versions
- **Smooth Scrolling**: Implements smooth scroll behavior with element highlighting
- **Search Functionality**: Real-time filtering with debounced input handling

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Test thoroughly on different ChatGPT UI versions
- Update documentation for new features
- Ensure backward compatibility when possible

## 🐛 Known Issues

- May require refresh when ChatGPT updates its UI structure
- Some prompt detection edge cases with very long messages
- Performance considerations with very long conversations (1000+ prompts)

## 📋 Roadmap

- [ ] Export conversation prompts
- [ ] Prompt categorization and tagging
- [ ] Keyboard shortcuts for navigation
- [ ] Dark/light theme toggle
- [ ] Prompt analytics and insights
- [ ] Support for other AI chat platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for creating ChatGPT
- Chrome Extensions team for comprehensive documentation
- Beta testers

**⭐ If you find this extension helpful, please consider giving it a star on GitHub!**

---
