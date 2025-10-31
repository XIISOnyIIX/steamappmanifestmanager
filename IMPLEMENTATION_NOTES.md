# Implementation Notes

## Technical Decisions

### Why Plain JavaScript?

The ticket specifically requested plain JavaScript (no frameworks). This decision offers:
- **Simplicity**: Easy to understand and modify
- **Performance**: No framework overhead
- **Learning**: Clear separation of concerns without framework abstractions
- **Compatibility**: Works everywhere without build complexity

### Why vdf-parser?

Steam's VDF (Valve Data Format) is a custom key-value format. The `vdf-parser` package provides:
- Reliable parsing of Steam configuration files
- Small footprint (minimal dependencies)
- Simple API (`parse()` and `stringify()`)
- Community-maintained and widely used

### Why TailwindCSS?

TailwindCSS was chosen for:
- **Rapid Development**: Utility-first approach speeds up UI development
- **Consistency**: Design system built-in
- **Customization**: Easy to extend with custom animations
- **No CSS Conflicts**: Scoped utility classes
- **Modern Look**: Matches Aceternity UI / Magic UI aesthetic

### IPC Architecture

The application uses Electron's recommended security model:
```
Renderer (Untrusted)
    ↓
Preload (Context Bridge)
    ↓
Main Process (Trusted)
    ↓
Node.js APIs / File System
```

This ensures the renderer cannot directly access Node.js APIs, preventing security vulnerabilities.

## Key Implementation Patterns

### 1. Error Handling Pattern

All async operations follow this pattern:
```javascript
try {
  showStatus('Loading...', true);
  const result = await window.electron.someOperation();
  showStatus('Success!');
  showToast('Operation completed', 'success');
} catch (error) {
  showStatus('');
  showToast(`Error: ${error.message}`, 'error');
  console.error('Operation failed:', error);
}
```

### 2. Validation Pattern

Validation is centralized and returns errors:
```javascript
function validateManifest(manifest) {
  const errors = [];
  if (/* condition */) errors.push('Error message');
  return errors; // Empty array = valid
}
```

### 3. UI Update Pattern

UI updates follow a consistent flow:
```javascript
1. Update data (manifestsData array)
2. Call updateTable()
3. updateTable() calls updatePreview()
4. updatePreview() calls updateSaveButton()
```

### 4. Settings Persistence Pattern

Settings are auto-saved on change:
```javascript
input.addEventListener('change', () => {
  saveSettings(); // Async save to userData
});
```

## File Structure Rationale

### Why Separate preload.js?

Context isolation requires a separate preload script. This:
- Prevents direct Node.js access from renderer
- Provides controlled IPC exposure
- Follows Electron security best practices

### Why Inline Components?

Components are not separated into individual files because:
- Application is single-page
- No component reuse across pages
- Simplifies development and debugging
- Reduces file count and complexity

The `components/` directory exists for future modularization if needed.

### Why src/input.css?

Separating TailwindCSS source allows:
- Custom utility classes
- Custom animations
- Separation of source and compiled CSS
- Easy rebuild with `npm run build-css`

## Platform-Specific Considerations

### Windows
- Uses backslashes in paths (handled by `path.join()`)
- Program Files requires administrator installation
- AppData for per-user installations

### Linux
- Hidden folders start with dot (`.steam`)
- Multiple possible installation locations
- Case-sensitive file system

### macOS
- Library folder in home directory
- Forward slashes in paths
- Different Steam path structure

## VDF/ACF File Format

Steam's VDF format is a simple key-value structure:
```
"key"
{
    "subkey" "value"
    "number" "123"
}
```

The `vdf-parser` package converts this to JavaScript objects:
```javascript
{
  key: {
    subkey: "value",
    number: "123"
  }
}
```

Note: All values are strings, even numbers. Convert as needed.

## Manifest Filename Pattern

Steam manifest files follow this pattern:
```
{DEPOT_ID}_{MANIFEST_ID}.manifest
```

Examples:
- `2947441_7885175683255934976.manifest`
- `489830_1234567890123456789.manifest`

The regex patterns extract these IDs:
- DepotID: `^\d{5,9}_` (5-9 digits at start)
- ManifestID: `\d{10,22}` (10-22 digits anywhere)

## Lua Output Format

The generated Lua scripts follow a specific format required by the target system:

```lua
-- Comment with APPID
addappid(APPID)
setManifestid(APPID,"MANIFESTID")
setDecryptionKey(APPID,"KEY")
```

All functions use the APPID as the first parameter. Manifest IDs and keys are strings.

## State Management

The application uses a simple state management approach:

```javascript
// Global state
let manifestsData = [];  // Array of manifest objects
let dlcList = {};        // Map of base APPID to DLC IDs

// UI reflects state
function updateTable() {
  // Render manifestsData to DOM
}
```

React-like one-way data flow:
```
State Change → Update UI → User Action → State Change
```

## Performance Notes

### Large Manifest Lists

For Steam libraries with thousands of manifests:
- DOM updates are batched (innerHTML for entire tbody)
- Validation runs only on changed data
- Preview updates are synchronous but fast

For production with 10,000+ manifests, consider:
- Virtual scrolling
- Pagination
- Web Workers for validation

### File Operations

All file operations are:
- Asynchronous (using async/await)
- Non-blocking (don't freeze UI)
- Error-handled (try/catch blocks)

## Security Considerations

### Input Validation

All user inputs are validated:
- File paths: Verified before operations
- APPIDs: Parsed as integers
- Pattern strings: Escaped before use
- Output directory: Checked for existence and permissions

### XSS Prevention

The application uses:
- `textContent` instead of `innerHTML` for user data
- Template literals with escaped values
- No `eval()` or `Function()` constructors
- No user-provided code execution

### Path Traversal Prevention

File paths are:
- Normalized using `path` module
- Validated before use
- Created with `path.join()` for safety
- Never constructed from raw user input

## Testing Strategy

### Manual Testing

For development testing:
1. Use sample VDF files
2. Create mock manifest files
3. Test error conditions
4. Verify cross-platform paths

### Automated Testing (Future)

Could add:
- Unit tests (Jest)
- Integration tests (Spectron)
- E2E tests (Playwright)

## Known Edge Cases

### Empty Manifests

If a depot has no manifests but is a DLC:
- Still include `addappid(DLCID)` in output
- No `setManifestid()` calls for that APPID

### Missing Decryption Keys

If `config.vdf` doesn't have keys:
- Continue with partial data
- Warn user in UI
- Generate scripts without `setDecryptionKey()` calls

### Invalid Filenames

If manifest filename doesn't match expected pattern:
- Mark as invalid in table
- Show specific error message
- Exclude from output

### Special Characters in Paths

Handled by:
- Using Node.js `path` module
- Proper string escaping
- OS-specific path separators

## Debugging Tips

### Enable DevTools

Set environment variable:
```bash
NODE_ENV=development npm start
```

Or modify main.js temporarily:
```javascript
mainWindow.webContents.openDevTools();
```

### Console Logging

Main process logs appear in terminal:
```javascript
console.log('Main:', data);
```

Renderer logs appear in DevTools:
```javascript
console.log('Renderer:', data);
```

### IPC Debugging

Log IPC calls in preload.js:
```javascript
myMethod: (data) => {
  console.log('IPC call:', data);
  return ipcRenderer.invoke('handler', data);
}
```

## Optimization Opportunities

### Current Implementation

Prioritizes:
- Readability over optimization
- Correctness over speed
- Simplicity over complexity

### Future Optimizations

If performance becomes an issue:
1. **Table Rendering**: Use virtual scrolling for 10,000+ rows
2. **Validation**: Move to Web Worker for large datasets
3. **File Operations**: Batch reads for better I/O performance
4. **Preview**: Debounce updates for smoother UX

## Browser Compatibility

Electron uses Chromium, so modern JavaScript features are supported:
- ES6+ (arrow functions, classes, modules)
- Async/await
- Template literals
- Destructuring
- Spread operator
- Optional chaining
- Nullish coalescing

No transpilation needed.

## Build Process

### Development
```bash
npm install  # Install dependencies
npm start    # Start application
```

### CSS Rebuild
```bash
npm run build-css  # Rebuild TailwindCSS
```

### Production (Future)
```bash
npm run build  # Create distributable (requires electron-builder)
```

## Maintenance Notes

### Dependency Updates

Keep dependencies updated for security:
```bash
npm audit        # Check for vulnerabilities
npm update       # Update to latest compatible versions
npm audit fix    # Auto-fix security issues
```

### Electron Version Updates

When updating Electron:
1. Check breaking changes in release notes
2. Test IPC communication
3. Verify context isolation still works
4. Test on all platforms

### TailwindCSS Updates

When updating Tailwind:
1. Run `npm run build-css`
2. Check for deprecated classes
3. Test UI for visual regressions

## Contributing Guidelines

For future contributors:

1. **Code Style**: Follow existing patterns
2. **Comments**: Add for complex logic only
3. **Error Handling**: Always use try/catch for async
4. **Testing**: Test cross-platform changes
5. **Documentation**: Update README for new features
6. **Git**: Atomic commits with clear messages

## License

MIT License - see LICENSE file for details.

---

**Last Updated**: 2024-10-31  
**Version**: 1.0.0
