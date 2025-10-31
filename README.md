# Steam Manifest Scanner

A cross-platform Electron application that scans Steam depotcache directories and generates Lua manifest scripts with decryption keys. Built with Electron 30+, Node.js 18+, TailwindCSS, and featuring a beautiful UI with animated components.

## Features

- 🔍 **Auto-detect Steam libraries** - Automatically finds all Steam installations and library folders
- 📦 **Parse .manifest files** - Extracts manifest data from Steam's depotcache
- 🔑 **Extract decryption keys** - Pulls decryption keys from Steam's config.vdf
- 🎮 **APPID inference** - Maps depot IDs to APPIDs using Steam's appmanifest files
- 📝 **Generate Lua scripts** - Creates formatted Lua scripts with `addappid()`, `setManifestid()`, and `setDecryptionKey()`
- ✨ **Beautiful UI** - Modern interface with TailwindCSS, animated components, and smooth transitions
- 💾 **Persistent settings** - Saves your configuration between sessions
- 🎨 **Live preview** - See generated Lua code in real-time
- ✅ **Inline validation** - Highlights errors and invalid data immediately
- 🌐 **Cross-platform** - Works on Windows, Linux, and macOS

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

## Usage

### Basic Workflow

1. **Scan Steam Depotcache**
   - Click the "Scan Steam Depotcache" button to automatically scan all Steam library locations
   - The app will find all `.manifest` files and populate the data table

2. **Or Select Files Manually**
   - Click "Select .manifest Files" to manually choose specific manifest files
   - Use this option if Steam is installed in a non-standard location

3. **Review and Edit Data**
   - The data table shows all discovered manifests with their information
   - Edit APPID values if needed (click on the input field)
   - Change the Type (Base/DLC/Depot) using the dropdown
   - Invalid entries are highlighted in red with error messages

4. **Configure Output**
   - Set a default APPID for manifests without detected APPIDs
   - Choose a dump mode (Depotcache only, Base + depotcache, Base + DLCs + depotcache)
   - Select an output directory
   - Choose file structure (Flat, {APPID}/, or MANIFESTS/{APPID}/)
   - Customize filename pattern using tokens: {APPID}, {DATE}, {TIME}

5. **Preview and Save**
   - Review the generated Lua code in the live preview panel
   - Click "Copy to Clipboard" to copy the preview
   - Click "Save .lua Scripts" to write files to disk

### Configuration Options

#### Input Configuration

- **Default APPID**: Fallback APPID for manifests that couldn't be mapped automatically
- **Infer APPID from Steam depot mapping**: When checked, the app will attempt to map depot IDs to APPIDs using Steam's appmanifest files
- **Dump Mode**: 
  - Depotcache only: Include only scanned manifest files
  - Base + depotcache: Include base game manifests
  - Base + DLCs + depotcache: Include base game and all DLCs

#### Output Configuration

- **Output Root Directory**: Where to save the generated Lua scripts
- **File Structure**:
  - Flat: All files in the output root directory
  - {APPID}/: Creates a subfolder for each APPID
  - MANIFESTS/{APPID}/: Creates MANIFESTS folder with APPID subfolders
- **Filename Pattern**: Customize output filenames with tokens
  - `{APPID}`: Replaced with the game's APPID
  - `{DATE}`: Replaced with current date (YYYY-MM-DD)
  - `{TIME}`: Replaced with current time (HH-MM-SS)

### Output Example

Generated Lua scripts look like this:

```lua
-- APPID: 480
addappid(480)
setManifestid(480,"7885175683255934976")
setDecryptionKey(480,"5329bd39507637997739c33a4b5737f9539ee434a7b79bd875b5fc7d1337c684")
setManifestid(480,"8672341905523156732")
setDecryptionKey(480,"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2")
```

## Platform-Specific Details

### Windows

- Default Steam path: `C:\Program Files (x86)\Steam`
- Config location: `C:\Program Files (x86)\Steam\config\`
- Depotcache: `C:\Program Files (x86)\Steam\depotcache\`

### Linux

- Default Steam path: `~/.steam/steam` or `~/.local/share/Steam`
- Config location: `~/.steam/steam/config/`
- Depotcache: `~/.steam/steam/depotcache/`

### macOS

- Default Steam path: `~/Library/Application Support/Steam`
- Config location: `~/Library/Application Support/Steam/config/`
- Depotcache: `~/Library/Application Support/Steam/depotcache/`

## File Structure

```
steam-manifest-scanner/
├── package.json          # Project dependencies and scripts
├── main.js              # Electron main process (Node.js backend)
├── preload.js           # IPC context bridge
├── renderer.js          # UI logic and event handlers
├── index.html           # Main window HTML structure
├── styles.css           # Compiled TailwindCSS styles
├── src/
│   └── input.css        # TailwindCSS source
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── README.md            # This file
```

## Validation Rules

The app validates all manifest data before allowing you to save:

- **Manifest ID**: Must be a 10-22 digit numeric string
- **Depot ID**: Must be a 5-9 digit integer
- **APPID**: Must be a valid integer
- **Decryption Key**: Must be a 64-character hexadecimal string (optional)

Invalid entries are:
- Highlighted in red in the data table
- Shown with specific error messages
- Excluded from the generated Lua output

## Troubleshooting

### Steam not detected

If the app can't find your Steam installation:
1. Check that Steam is installed in a standard location
2. Use "Select .manifest Files" to manually choose manifest files
3. Set a "Default APPID" for manifests that couldn't be mapped

### Missing decryption keys

If decryption keys are not found:
1. Ensure Steam is properly installed
2. Check that `config.vdf` exists in Steam's config directory
3. The app will still generate scripts but without `setDecryptionKey()` calls

### Permission denied when saving

If you get a permission error:
1. Choose a different output directory where you have write access
2. On Linux/macOS, ensure the directory is not system-protected

## Technology Stack

- **Electron 30+**: Cross-platform desktop framework
- **Node.js 18+**: JavaScript runtime
- **TailwindCSS 3.4+**: Utility-first CSS framework
- **vdf-parser**: VDF/ACF file parser for Steam files
- **Plain JavaScript**: No framework dependencies for the UI

## Development

To modify the styles:

```bash
npm run build-css
```

To enable development mode with DevTools:

```bash
NODE_ENV=development npm start
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- UI components inspired by Aceternity UI and Magic UI
- Built for the Steam community
