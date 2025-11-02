# Build Resources

This folder contains build resources for the Steam Manifest Scanner application.

## Application Icon

Place your custom application icon in this folder as `icon.png`.

### Icon Requirements

- **Format**: PNG
- **Size**: 512x512 pixels (recommended)
- **File name**: `icon.png`
- **Location**: `build/icon.png`

### How It Works

electron-builder will automatically:
- Convert `icon.png` to `.ico` format for Windows
- Convert `icon.png` to `.icns` format for macOS
- Use `icon.png` directly for Linux

The icon will be used for:
- Windows: Application executable and installer icon
- macOS: Application bundle icon
- Linux: Application icon

### After Adding Your Icon

1. Place your `icon.png` (512x512 recommended) in this folder
2. Run any build command:
   ```bash
   npm run build:win    # Build for Windows
   npm run build:mac    # Build for macOS
   npm run build:linux  # Build for Linux
   npm run build:all    # Build for all platforms
   ```
3. Your custom icon will automatically be included in the build

### Notes

- If no icon is provided, electron-builder will use the default Electron icon
- For best results across all platforms, use a square PNG with transparent background
- Higher resolution icons (1024x1024) will also work and provide better quality on high-DPI displays
