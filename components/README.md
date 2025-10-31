# UI Components

This directory is reserved for extracting UI components into separate modules if needed in the future.

Currently, all UI components are implemented inline in `index.html` and `renderer.js` for simplicity.

## Potential Components

If you decide to modularize the UI, consider extracting:

- **AnimatedButton**: The gradient buttons with hover effects
- **DataTable**: The editable manifest data table
- **CodePreview**: The Lua script preview panel with syntax highlighting
- **FolderPicker**: The folder selection dialog
- **Toast**: The notification toast system
- **StatusBar**: The bottom status bar with loading indicator

## Implementation Note

Since this is a plain JavaScript application without a UI framework, components would be implemented as:
- ES6 modules with `export` statements
- HTML template strings or DOM manipulation functions
- Event handler registration
- Styling using TailwindCSS utility classes
