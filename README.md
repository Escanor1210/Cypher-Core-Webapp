# Cypher Core - Modular Encryption Platform

A fully client-side web application for encryption, encoding, and text transformation with a modular pipeline architecture.

## Features

- 🔒 **100% Client-Side**: All transformations happen in your browser
- 🔧 **Modular Architecture**: Plugin-based system with easy module registration
- ⚡ **Real-Time Processing**: Instant results as you type
- 🔗 **Pipeline Chaining**: Combine multiple modules for complex transformations
- 📦 **No Dependencies**: Pure JavaScript, no external libraries required

## Available Modules

### Encoding
- Base64
- Base32
- Hexadecimal
- Binary
- URL Encode
- Morse Code

### Classical Ciphers
- Caesar Cipher (configurable shift)
- ROT13
- Atbash

### Transformations
- Reverse

## Installation & Setup

1. **Clone or download** this repository to your local machine

2. **File Structure**:
   ```
   cypher-core/
   ├── index.html
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── modules/
   │   │   ├── ModuleRegistry.js
   │   │   ├── CipherModule.js
   │   │   └── moduleDefinitions.js
   │   ├── ui/
   │   │   └── UIController.js
   │   └── app.js
   └── README.md
   ```

3. **Run Locally**:

   **Option 1: Simple HTTP Server (Python)**
   ```bash
   # Navigate to project directory
   cd cypher-core
   
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   Then open: `http://localhost:8000`

   **Option 2: Node.js HTTP Server**
   ```bash
   # Install http-server globally
   npm install -g http-server
   
   # Run in project directory
   http-server -p 8000
   ```
   Then open: `http://localhost:8000`

   **Option 3: VS Code Live Server**
   - Install "Live Server" extension in VS Code
   - Right-click `index.html`
   - Select "Open with Live Server"

   **Option 4: Direct File Access**
   - Simply open `index.html` in your browser
   - Note: Some browsers may restrict ES modules with file:// protocol

## Usage

1. **Enter Text**: Type or paste text in the "View Text" panel
2. **Add Modules**: Click "Add Module" and select transformation modules
3. **Configure**: Adjust parameters (e.g., Caesar shift value)
4. **Switch Mode**: Toggle between "Encode" and "Decode"
5. **View Output**: See results in real-time in the "Cypher Text" panel

## Adding Custom Modules

Create new modules in `js/modules/moduleDefinitions.js`:

```javascript
new CipherModule({
    id: 'my-cipher',
    name: 'My Custom Cipher',
    category: 'Custom',
    description: 'Description of your cipher',
    parameters: [
        { name: 'key', label: 'Key', type: 'text', default: 'secret' }
    ],
    encode: (input, params) => {
        // Your encoding logic
        return encodedText;
    },
    decode: (input, params) => {
        // Your decoding logic
        return decodedText;
    }
})
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

Requires ES6+ support (modern browsers from 2015+)

## Security Note

This is an educational tool for understanding encryption and encoding concepts. The implementations are meant for demonstration purposes and should not be used for securing sensitive data.

## License

MIT License - Feel free to use and modify as needed.

## Contributing

To add new cipher modules:
1. Create a new `CipherModule` in `moduleDefinitions.js`
2. Implement `encode` and `decode` functions
3. Add any required parameters
4. The module will automatically appear in the UI

---

**Made with ❤️ for learning cryptography and text transformations**
```

## 🚀 Quick Start Instructions

1. **Create the folder structure**:
   ```bash
   mkdir -p cypher-core/css cypher-core/js/modules cypher-core/js/ui
   ```

2. **Copy each file** to its respective location as shown in the structure above

3. **Run a local server** (choose one method):
   ```bash
   # Python 3
   cd cypher-core
   python -m http.server 8000
   ```

4. **Open your browser** to `http://localhost:8000`

## 📝 Notes

- All files use ES6 modules (`import/export`)
- No build process required - runs directly in browser
- Must use a local server (not file://) for ES modules to work
- Fully responsive design
- No external dependencies