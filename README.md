# Steam Manifest Scanner

A beautiful, modern Electron application for scanning Steam game manifests and generating Lua scripts. Built with Electron 30+, Node 18+, and TailwindCSS with Aceternity UI and Magic UI components.

## Features

- 🎮 **APPID-Based Scanning**: Enter any Steam APPID to scan for manifests
- 🎨 **Modern UI**: Clean interface with beautiful cards, animations, and loading states
- 📦 **Multi-Game Support**: Scan multiple games, each displayed as a separate card
- 🔍 **Smart Depot Detection**: Automatically finds depot IDs and manifest files
- 🔐 **Decryption Keys**: Extracts and includes decryption keys from Steam config
- 💾 **One-Click Export**: Save manifests and Lua scripts to organized folders
- 📝 **Live Lua Preview**: View generated Lua scripts with syntax highlighting
- 🌍 **Cross-Platform**: Works on Windows, Linux, and macOS
- ⚡ **Fast & Responsive**: Smooth animations and instant feedback

## Screenshots

### Main Interface
Clean input section with APPID field, scan button, and output directory picker.

### Game Cards
Beautiful cards displaying game information, header images, manifest counts, and depot details.

### Live Preview
Real-time Lua script preview with syntax highlighting and copy-to-clipboard functionality.

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

3. Build Tailwind CSS:
```bash
npx tailwindcss -i ./styles.css -o ./styles.css
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
     - Depot details (expandable)

4. **Save Manifests**
   - Hover over a card to see the Lua preview
   - Click "Save" to export manifests and Lua script
   - Files will be saved to: `{OutputDirectory}/{GameName}/`

5. **Scan More Games**
   - Enter another APPID to add more cards
   - Each game gets its own card

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
├── renderer.js               # Main app logic
├── steam-scanner.js          # Steam file parsing
├── index.html                # Main window
├── styles.css                # Tailwind + custom styles
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── components/
│   ├── GameCard.js           # Game card component
│   ├── InputSection.js       # Input and scan controls
│   ├── CodePreview.js        # Lua preview panel
│   └── Toast.js              # Toast notifications
└── README.md
```

### Technologies Used

- **Electron 30+**: Desktop application framework
- **Node.js 18+**: JavaScript runtime
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

## Acknowledgments

- Steam API for game information
- Aceternity UI for design inspiration
- Magic UI for component patterns
- TailwindCSS for styling utilities

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

Built with ❤️ using Electron, TailwindCSS, and modern web technologies.
