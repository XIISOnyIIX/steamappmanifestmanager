# Changelog

All notable changes to Steam Manifest Scanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-31

### Added

#### Core Features
- **Steam Library Detection**: Automatically detects Steam installation on Windows, Linux, and macOS
- **Multi-Library Support**: Scans all Steam library folders from libraryfolders.vdf
- **Depotcache Scanner**: Recursively scans all depotcache directories for .manifest files
- **VDF Parser Integration**: Parses Steam's VDF and ACF configuration files
- **Decryption Key Extraction**: Extracts depot decryption keys from config.vdf
- **APPID Inference**: Maps depot IDs to game APPIDs using appmanifest files
- **DLC Detection**: Identifies DLC APPIDs from game manifests
- **Lua Script Generation**: Generates properly formatted Lua scripts with addappid(), setManifestid(), and setDecryptionKey()

#### User Interface
- **Modern Design**: Beautiful gradient UI with TailwindCSS styling
- **Animated Components**: Smooth transitions and hover effects inspired by Aceternity UI and Magic UI
- **Action Buttons**: 
  - Scan Steam Depotcache (auto-detection)
  - Select .manifest Files (manual selection)
  - Save .lua Scripts (with validation)
- **Input Configuration**:
  - Default APPID fallback input
  - APPID inference toggle
  - Dump mode selector (Depotcache only / Base + depotcache / Base + DLCs + depotcache)
- **Output Configuration**:
  - Folder picker dialog
  - File structure options (Flat / {APPID}/ / MANIFESTS/{APPID}/)
  - Filename pattern with token support ({APPID}, {DATE}, {TIME})
- **Data Table**:
  - Displays all manifest information
  - Editable APPID and Type fields
  - Real-time validation with error highlighting
  - Hover effects and smooth animations
- **Live Preview Panel**:
  - Real-time Lua code preview
  - Syntax highlighting
  - Copy to clipboard functionality
- **Status Bar**: Loading indicators and operation status
- **Toast Notifications**: Color-coded success/error/warning messages

#### Data Processing
- **Manifest Parsing**: Extracts ManifestID (10-22 digits) and DepotID (5-9 digits) from filenames
- **Validation Engine**: 
  - ManifestID format validation
  - DepotID format validation
  - APPID integer validation
  - DecryptionKey hex format validation (64 characters)
- **Error Handling**: Comprehensive error messages for all edge cases
- **Grouping by APPID**: Automatically groups manifests by game
- **DLC Mode Support**: Includes DLC APPIDs even without manifests

#### File Operations
- **Multiple Structure Modes**: 
  - Flat: All files in root
  - {APPID}/: Subfolder per game
  - MANIFESTS/{APPID}/: Organized in MANIFESTS directory
- **Token Replacement**: Dynamic filename generation with APPID, DATE, and TIME
- **Directory Creation**: Automatically creates output directories
- **One File Per APPID**: Separate Lua file for each game

#### Settings & Persistence
- **Auto-Save Settings**: All configuration automatically saved
- **Settings Persistence**: Loaded on application start
- **User Data Storage**: Uses Electron's userData directory
- **Remembered Configuration**: 
  - Default APPID
  - Infer APPID toggle state
  - Dump mode selection
  - Output directory
  - File structure preference
  - Filename pattern

#### Cross-Platform Support
- **Windows Support**: 
  - Program Files detection
  - AppData path support
  - Backslash path handling
- **Linux Support**: 
  - ~/.steam/steam detection
  - ~/.local/share/Steam support
- **macOS Support**: 
  - Library/Application Support/Steam detection
  - Forward slash paths

#### Documentation
- **README.md**: Comprehensive user guide with setup, usage, and troubleshooting
- **QUICKSTART.md**: 5-minute getting started guide
- **DEVELOPMENT.md**: Developer guide for extending the application
- **FEATURES.md**: Complete feature checklist
- **CHANGELOG.md**: Version history and changes
- **LICENSE**: MIT License
- **example_output.lua**: Sample output for reference

#### Developer Experience
- **Plain JavaScript**: No framework dependencies, easy to understand
- **ES6+ Syntax**: Modern JavaScript with async/await
- **IPC Security**: Context isolation with preload bridge
- **TailwindCSS**: Utility-first CSS with custom theme
- **PostCSS**: Build pipeline for CSS
- **Code Organization**: Clean separation of concerns (main/renderer/preload)

### Technical Details

#### Dependencies
- Electron 30.5.1
- vdf-parser 1.2.1
- TailwindCSS 3.4.18
- PostCSS 8.5.6
- Autoprefixer 10.4.21

#### Project Structure
```
steam-manifest-scanner/
├── main.js              # Electron main process
├── preload.js           # IPC context bridge
├── renderer.js          # UI logic
├── index.html           # Main window
├── styles.css           # Compiled TailwindCSS
├── src/input.css        # TailwindCSS source
├── package.json         # Project configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── components/          # Reserved for future componentization
```

#### Supported Platforms
- Windows 10+
- Linux (Ubuntu, Debian, Fedora, Arch, etc.)
- macOS 10.13+

### Known Limitations
- Requires Steam to be installed in standard locations (or manual file selection)
- Decryption keys only available if present in config.vdf
- No batch editing of multiple rows simultaneously
- No search/filter functionality in data table

### Notes
Initial release with all core features as specified in requirements.
Application is fully functional and ready for production use.

---

[1.0.0]: https://github.com/yourusername/steam-manifest-scanner/releases/tag/v1.0.0
