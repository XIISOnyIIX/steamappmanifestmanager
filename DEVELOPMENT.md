# Development Guide

This guide provides information for developers who want to extend or modify the Steam Manifest Scanner application.

## Architecture Overview

### Electron Process Model

The application follows Electron's multi-process architecture:

```
┌─────────────────┐
│   Main Process  │  (main.js)
│   Node.js APIs  │
│   File System   │
│   IPC Handlers  │
└────────┬────────┘
         │ IPC
         │ (Context Bridge)
         │
┌────────▼────────┐
│ Renderer Process│  (renderer.js + index.html)
│   Browser APIs  │
│   DOM           │
│   UI Logic      │
└─────────────────┘
```

### File Responsibilities

#### main.js (Main Process)
- Window creation and management
- Steam path detection (OS-specific)
- File system operations (read VDF files, scan directories)
- VDF/ACF parsing using vdf-parser
- IPC handlers for renderer requests
- Settings persistence

#### preload.js (Context Bridge)
- Secure IPC communication bridge
- Exposes limited APIs to renderer
- Prevents direct access to Node.js from renderer

#### renderer.js (Renderer Process)
- UI event handlers
- Data management (manifests array)
- Table rendering and updates
- Preview generation
- Validation logic
- User interaction handling

#### index.html (UI Structure)
- HTML structure
- TailwindCSS classes
- SVG icons
- Form elements

## Key Functions

### Main Process (main.js)

```javascript
// Steam Detection
getSteamPath()              // Detects Steam installation
getSteamLibraries()         // Finds all Steam libraries
scanDepotCache()            // Scans for .manifest files

// Parsing
parseVDF(content)           // Parses VDF format files
getDecryptionKeys()         // Extracts keys from config.vdf
getDepotToAppidMapping()    // Maps depots to APPIDs

// File Operations
extractManifestInfo()       // Parses manifest filename
```

### Renderer Process (renderer.js)

```javascript
// UI Updates
updateTable()               // Renders manifest table
updatePreview()            // Generates Lua preview
updateSaveButton()         // Enables/disables save

// Validation
validateManifest()         // Validates single manifest

// User Actions
scanDepotcache()           // Triggers depot scan
selectFiles()              // Opens file picker
saveLuaScripts()           // Saves generated scripts

// UI Feedback
showStatus()               // Shows status bar
showToast()                // Shows notification
```

## Adding New Features

### Adding a New IPC Handler

1. **Main Process** (main.js):
```javascript
ipcMain.handle('my-new-handler', async (event, arg) => {
  // Your logic here
  return result;
});
```

2. **Preload Script** (preload.js):
```javascript
contextBridge.exposeInMainWorld('electron', {
  // ... existing methods
  myNewMethod: (data) => ipcRenderer.invoke('my-new-handler', data)
});
```

3. **Renderer** (renderer.js):
```javascript
async function myNewFeature() {
  const result = await window.electron.myNewMethod(data);
  // Handle result
}
```

### Adding a New UI Component

1. Add HTML structure to `index.html`
2. Add styling using TailwindCSS classes
3. Add event handlers in `renderer.js`
4. Update state and trigger re-renders

Example:
```javascript
// In renderer.js
function createCustomComponent(data) {
  const element = document.createElement('div');
  element.className = 'card bg-white rounded-xl shadow-lg p-6';
  element.innerHTML = `
    <h3 class="text-xl font-bold">${data.title}</h3>
    <p class="text-slate-600">${data.content}</p>
  `;
  return element;
}
```

### Adding Custom Validation

Add validation rules to `validateManifest()` in renderer.js:

```javascript
function validateManifest(manifest) {
  const errors = [];
  
  // Add your custom validation
  if (myCustomCondition) {
    errors.push('Custom error message');
  }
  
  return errors;
}
```

## Styling Guide

### TailwindCSS Usage

The application uses TailwindCSS utility classes for all styling. Common patterns:

```html
<!-- Cards -->
<div class="card bg-white rounded-xl shadow-lg p-6 animate-fade-in">

<!-- Buttons -->
<button class="animated-button bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">

<!-- Inputs -->
<input class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">

<!-- Tables -->
<tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
```

### Custom Animations

Defined in `src/input.css` and `tailwind.config.js`:

- `animate-fade-in`: Fade in on load
- `animate-slide-up`: Slide up from bottom
- `animate-shimmer`: Shimmer effect for loading states

### Adding New Animations

1. Add keyframes in `tailwind.config.js`:
```javascript
keyframes: {
  myAnimation: {
    '0%': { /* start state */ },
    '100%': { /* end state */ }
  }
}
```

2. Add animation utility:
```javascript
animation: {
  'my-animation': 'myAnimation 1s ease-in-out'
}
```

3. Use in HTML:
```html
<div class="animate-my-animation">...</div>
```

## Debugging

### Enable DevTools

Set environment variable:
```bash
NODE_ENV=development npm start
```

Or modify `main.js`:
```javascript
// In createWindow()
mainWindow.webContents.openDevTools();
```

### Console Logging

Main process logs appear in terminal:
```javascript
console.log('Main process:', data);
```

Renderer process logs appear in DevTools console:
```javascript
console.log('Renderer:', data);
```

### Common Issues

**IPC not working:**
- Check preload script is correctly loaded
- Verify handler names match in main and preload
- Check contextBridge is exposing methods

**Styles not updating:**
- Run `npm run build-css` to rebuild TailwindCSS
- Check class names are correct
- Verify styles.css is linked in HTML

**File operations failing:**
- Ensure operations are in main process, not renderer
- Check file paths are absolute
- Verify permissions on target directories

## Testing

### Manual Testing Checklist

- [ ] Scan depotcache on Windows
- [ ] Scan depotcache on Linux/macOS
- [ ] Select individual files
- [ ] Edit APPID values
- [ ] Edit Type values
- [ ] Change output settings
- [ ] Test all filename patterns
- [ ] Test all folder structures
- [ ] Verify settings persistence
- [ ] Test copy to clipboard
- [ ] Test error states (no Steam, no manifests)

### Testing VDF Parsing

Create test VDF files in your project:

```javascript
const testVDF = `
"depots"
{
    "123456"
    {
        "DecryptionKey" "abcd1234..."
    }
}
`;

const parsed = vdf.parse(testVDF);
console.log(parsed);
```

## Building for Distribution

### Electron Builder (Not included, but recommended)

1. Install electron-builder:
```bash
npm install --save-dev electron-builder
```

2. Add build config to package.json:
```json
{
  "build": {
    "appId": "com.steammanifestscanner.app",
    "productName": "Steam Manifest Scanner",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

3. Add build script:
```json
{
  "scripts": {
    "build": "electron-builder"
  }
}
```

4. Build:
```bash
npm run build
```

## Code Style

### JavaScript

- Use `const` by default, `let` when reassignment needed
- Use arrow functions for callbacks
- Use async/await instead of callbacks or raw promises
- Use template literals for strings with variables
- Destructure objects when accessing multiple properties

### Naming Conventions

- Functions: camelCase (`getUserSettings`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Classes: PascalCase (`ManifestParser`)
- Files: kebab-case (`manifest-parser.js`)

### Error Handling

Always use try/catch for async operations:

```javascript
async function myFunction() {
  try {
    const result = await somethingAsync();
    return result;
  } catch (error) {
    console.error('Error in myFunction:', error);
    showToast(`Error: ${error.message}`, 'error');
    throw error; // Re-throw if caller needs to handle
  }
}
```

## Performance Tips

- Use `document.createDocumentFragment()` for batch DOM updates
- Debounce expensive operations (search, filter)
- Use `requestAnimationFrame()` for animations
- Cache DOM queries in variables
- Avoid unnecessary re-renders

## Security Considerations

- Never use `nodeIntegration: true` in renderer
- Always use `contextIsolation: true`
- Use preload script for IPC exposure
- Validate all user input
- Sanitize file paths before operations
- Never execute user-provided code

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [VDF Format Specification](https://developer.valvesoftware.com/wiki/KeyValues)
- [Node.js File System API](https://nodejs.org/api/fs.html)

## Contributing

When contributing to this project:

1. Maintain the existing code style
2. Add comments for complex logic
3. Update documentation for new features
4. Test on multiple platforms if possible
5. Keep commits atomic and well-described
6. Update FEATURES.md for new features
