# Steam Manifest Scanner

A modern Electron app to scan Steam games and generate Lua manifest scripts with decryption keys.

![Steam Manifest Scanner](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/electron-30.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔍 **Scan Single Games** - Enter an APPID to scan specific games
- 📚 **Scan All Games** - Automatically detect and scan all installed Steam games
- 💾 **Multi-Drive Support** - Detects games across all Steam library locations (C:, D:, E:, etc.)
- 🔑 **Extract Decryption Keys** - Pulls manifest IDs and decryption keys from Steam
- 📝 **Generate Lua Scripts** - Creates ready-to-use Lua scripts with all manifest data
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 🚀 **Fast & Efficient** - Batch processing with progress tracking

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Steam installed on your system

### Setup
```bash
# Clone the repository
git clone https://github.com/XIISOnyIIX/steamappmanifestmanager.git
cd steamappmanifestmanager

# Install dependencies
npm install

# Start the app
npm start
```

## 🚀 Usage

### Scan a Single Game
1. Enter a Steam APPID in the input field
2. Click the **Scan** button
3. View the generated card with game info
4. Click **Save** to export manifests and Lua script

### Scan All Installed Games
1. Click the dropdown arrow next to **Scan**
2. Select **"Scan All Installed Games"**
3. Confirm the scan
4. Wait for all games to be processed
5. Save individual games or export all

### Output Structure
```
/YourOutputDirectory/
  ├── Half-Life/
  │   ├── 2947441_7885175683255934976.manifest
  │   ├── 2947441_8672341905523156732.manifest
  │   └── script_480.lua
  ├── Counter-Strike/
  │   ├── ...
  │   └── script_10.lua
  └── ...
```

## 🛠️ Building

### Build for Windows
```bash
npm run build:win
```
Output: `dist/Steam Manifest Scanner Setup 1.0.0.exe`

### Build for macOS
```bash
npm run build:mac
```

### Build for Linux
```bash
npm run build:linux
```

### Build for All Platforms
```bash
npm run build:all
```

## 📋 Lua Script Example

Generated Lua scripts contain:
```lua
addappid(480)
setManifestid(480,"7885175683255934976")
setDecryptionKey(480,"5329bd39507637997739c33a4b5737f9539ee434a7b79bd875b5fc7d1337c684")
setManifestid(480,"8672341905523156732")
setDecryptionKey(480,"abc123...")
```

## 🎨 Tech Stack

- **Electron 30+** - Desktop app framework
- **TailwindCSS** - Styling
- **VDF Parser** - Parse Steam configuration files
- **Node.js 18+** - JavaScript runtime

## 🗂️ Project Structure

```
steam-manifest-scanner/
├── main.js              # Electron main process
├── preload.js           # Context bridge
├── renderer.js          # Main app logic
├── steam-scanner.js     # Steam file scanning
├── index.html           # Main window
├── styles.css           # Tailwind styles
├── components/          # UI components
├── package.json         # Dependencies & scripts
└── README.md            # Documentation
```

## ⚙️ Configuration

### Output Directory
Click the folder icon (📁) to select where Lua scripts and manifests will be saved.

### Supported Platforms
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, etc.)

## 🐛 Troubleshooting

**Steam not detected:**
- Ensure Steam is installed in the default location
- Check that `libraryfolders.vdf` exists in Steam config

**No games found:**
- Verify games are fully installed (not just downloading)
- Check Steam library folders are readable

**Build errors:**
- Delete `node_modules` and run `npm install` again
- Ensure all dependencies are installed

## 📝 License

MIT License - feel free to use and modify

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Made with ❤️**
