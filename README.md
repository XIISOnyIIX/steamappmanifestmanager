# Steam Manifest Scanner

A beautiful, modern Electron application for scanning Steam game manifests and generating Lua scripts. Built with Electron 30+, Node 18+, DaisyUI, and TailwindCSS for a professional, polished interface.

## Features

- 🎮 **APPID-Based Scanning**: Enter any Steam APPID to scan for manifests
- 🎨 **Modern DaisyUI Interface**: Professional, clean design with consistent components
- 📦 **Multi-Game Support**: Scan multiple games, each displayed as a beautiful card
- 🔍 **Smart Depot Detection**: Automatically finds depot IDs and manifest files
- 🔐 **Decryption Keys**: Extracts and includes decryption keys from Steam config
- 💾 **Flexible Saving**: Save manifests multiple times with "Save Again" functionality
- 🗑️ **Card Management**: Remove cards from the list with confirmation dialogs
- 📊 **Collapsible Details**: Depot information in clean tables inside card body
- 🌍 **Cross-Platform**: Works on Windows, Linux, and macOS
- ⚡ **Fast & Responsive**: Smooth animations and instant feedback
- 🎯 **Toast Notifications**: Clear feedback for every action

## Screenshots

### Main Interface
Clean input section with APPID field, scan button, and output directory picker.

### Game Cards
Beautiful DaisyUI cards displaying:
- Game header images
- Manifest counts with badges
- Collapsible depot details (properly positioned inside card body)
- Save/Save Again buttons
- Remove button with confirmation

### No More Lua Preview Panel
The bottom Lua preview panel has been removed. Lua scripts are saved directly to files.

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Steam installed on your system

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd steam-manifest-scanner
```

2. Install dependencies:
```bash
npm install
```

3. Build Tailwind CSS with DaisyUI:
```bash
npx tailwindcss -i ./styles.css -o ./dist/styles.css
```

4. Run the application:
```bash
npm start
```

## Usage

### Basic Workflow

1. **Select Output Directory** (Optional, but required for saving)
   - Click the "Output Directory" button
   - Choose where you want to save manifests and scripts

2. **Enter APPID**
   - Type a Steam APPID in the input field (e.g., 480 for Half-Life)
   - Press Enter or click "Scan"

3. **View Results**
   - A card will appear showing:
     - Game header image
     - Game name
     - APPID badge
     - Number of manifests found
     - "Show Depot Details" collapse button
     - Save and Remove buttons

4. **View Depot Details**
   - Click "Show Depot Details" to expand
   - See table with Depot IDs, Manifest IDs, and Decryption Keys
   - Details properly positioned inside card body (below banner)
   - Can collapse/expand without issues

5. **Save Manifests**
   - Click "Save" to export manifests and Lua script
   - Files will be saved to: `{OutputDirectory}/{GameName}/`
   - Button changes to "Save Again" after first save
   - Can save multiple times (useful if changing output directory)
   - Green "Saved" badge appears on card banner
   - Shows "Last saved" timestamp

6. **Remove Cards**
   - Click "Remove" button (red trash icon)
   - Confirmation modal appears
   - Confirm to remove card from list
   - Card fades out smoothly

7. **Scan More Games**
   - Enter another APPID to add more cards
   - Each game gets its own independent card

### Output Structure

When you save a game's manifests, the following structure is created:

```
/OutputDirectory/
└── Half-Life/
    ├── 2947441_7885175683255934976.manifest
    ├── 2947441_8672341905523156732.manifest
    └── script_480.lua
```

### Lua Script Format

Generated Lua scripts follow this format:

```lua
addappid(480)
setManifestid(480,"7885175683255934976")
setDecryptionKey(480,"5329bd39507637997739c33a4b5737f9539ee434a7b79bd875b5fc7d1337c684")
setManifestid(480,"8672341905523156732")
setDecryptionKey(480,"abc123...")
```

## How It Works

### 1. Steam Detection
- Automatically detects Steam installation paths
- Supports multiple Steam library folders
- Parses `libraryfolders.vdf` to find all game libraries

### 2. Manifest Scanning
- Reads `appmanifest_{APPID}.acf` to get depot IDs
- Scans `depotcache` folders for matching manifest files
- Matches pattern: `{DEPOT_ID}_{MANIFEST_ID}.manifest`

### 3. Decryption Keys
- Extracts keys from `config/config.vdf`
- Maps depot IDs to 64-character hex keys
- Includes keys in generated Lua scripts

### 4. Steam API Integration
- Fetches game information from Steam Store API
- Gets game name, header image, and type
- Handles rate limiting and errors gracefully

## Supported Platforms

| Platform | Status | Default Steam Path |
|----------|--------|-------------------|
| Windows  | ✅ Supported | `C:\Program Files (x86)\Steam` |
| Linux    | ✅ Supported | `~/.steam/steam` or `~/.local/share/Steam` |
| macOS    | ✅ Supported | `~/Library/Application Support/Steam` |

## Error Handling

The app gracefully handles various error scenarios:

- **Steam Not Installed**: Shows error message with instructions
- **Invalid APPID**: Validates input before scanning
- **Network Errors**: Displays user-friendly error cards
- **No Manifests Found**: Shows "0 manifests" badge on card
- **Missing Decryption Keys**: Warns but continues operation
- **File Permission Errors**: Shows detailed error notifications

## Development

### Project Structure

```
steam-manifest-scanner/
├── package.json              # Dependencies and scripts
├── main.js                   # Electron main process
├── preload.js                # IPC context bridge
├── renderer.js               # Main app logic and state
├── steam-scanner.js          # Steam file parsing
├── index.html                # Main window with DaisyUI
├── styles.css                # Source styles (custom animations)
├── tailwind.config.js        # Tailwind + DaisyUI config
├── postcss.config.js         # PostCSS configuration
├── dist/
│   └── styles.css            # Built CSS with DaisyUI
├── components/
│   ├── GameCard.js           # Game card with DaisyUI components
│   ├── InputSection.js       # Navbar input section
│   ├── ConfirmModal.js       # Confirmation dialogs
│   └── Toast.js              # Toast notifications (DaisyUI alerts)
├── UI_OVERHAUL_SUMMARY.md    # Complete list of changes
├── TESTING_GUIDE.md          # How to test the new UI
└── README.md
```

### Technologies Used

- **Electron 30+**: Desktop application framework
- **Node.js 18+**: JavaScript runtime
- **DaisyUI 4.x**: Professional Tailwind component library
- **TailwindCSS 3.4**: Utility-first CSS framework
- **VDF Parser**: Steam VDF file parsing
- **Node Fetch**: HTTP requests to Steam API

### Key Libraries

- `vdf-parser`: Parse Steam's VDF (Valve Data Format) files
- `node-fetch`: Modern fetch API for Node.js
- `electron`: Cross-platform desktop application framework

## Testing

### Test Cases

1. **Valid APPID** (e.g., 480)
   - Should fetch Half-Life info
   - Should find manifests if installed
   - Should display card with details

2. **Invalid APPID** (e.g., 999999999)
   - Should show error card
   - Should not crash application

3. **No Manifests Found**
   - Should show "0 manifests" badge
   - Should disable save button

4. **Multiple Scans**
   - Should display multiple cards
   - Each card should be independent

5. **Save Functionality**
   - Should create game-named folder
   - Should copy manifest files
   - Should generate Lua script
   - Should show success notification

## Common APPIDs for Testing

| APPID | Game Name |
|-------|-----------|
| 480   | Half-Life |
| 730   | Counter-Strike: Global Offensive |
| 570   | Dota 2 |
| 440   | Team Fortress 2 |
| 271590 | Grand Theft Auto V |

## Troubleshooting

### Steam Not Detected
- Ensure Steam is installed in the default location
- Check if Steam is running
- Try manually selecting Steam directory (future feature)

### No Manifests Found
- Game must be installed on your system
- Check if the game files are in depotcache
- Some games may not have manifest files

### Save Fails
- Ensure output directory is selected
- Check write permissions for the output folder
- Ensure sufficient disk space

### API Rate Limiting
- Steam API may rate limit requests
- Wait a few seconds between scans
- The app handles this gracefully

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on all platforms
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Recent Updates

### v2.0 - DaisyUI UI Overhaul (Latest)

Complete UI redesign with professional component library:

**What's New:**
- ✨ **DaisyUI Integration**: Modern, consistent component library
- 🔧 **Fixed Depot Details**: Now properly positioned inside card body (not under banner)
- 🗑️ **Card Management**: Remove cards with confirmation dialogs
- 💾 **Save Again**: Can save manifests multiple times
- 🎯 **Better UX**: Toast notifications for all actions
- 🚫 **Removed Lua Preview**: Bottom panel removed (Lua saved to files only)

**Files Added:**
- `components/ConfirmModal.js` - Confirmation dialogs
- `UI_OVERHAUL_SUMMARY.md` - Complete change documentation
- `TESTING_GUIDE.md` - Testing instructions

**Files Removed:**
- `components/CodePreview.js` - No longer needed

See `UI_OVERHAUL_SUMMARY.md` for complete details.

## Acknowledgments

- Steam API for game information
- DaisyUI for professional component library
- TailwindCSS for styling utilities
- Electron team for the framework

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

Built with ❤️ using Electron, TailwindCSS, and modern web technologies.
