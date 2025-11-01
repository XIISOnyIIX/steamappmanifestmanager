# Steam Manifest Scanner

Scan Steam games and generate Lua manifest scripts.

## Installation

```bash
npm install
```

## Build CSS

```bash
npx tailwindcss -i ./styles.css -o ./dist/styles.css
```

## Usage

```bash
npm start
```

## Build

### Windows
```bash
npm run build:win
```

### Mac
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

### All Platforms
```bash
npm run build:all
```

## Features

- 🎮 Scan single game by APPID
- 📚 Scan all installed games (all drives)
- 💿 Multi-drive Steam library detection
- 🔐 Extract decryption keys
- 📦 Generate Lua scripts with manifest IDs
- 💾 Save manifests to organized folders

## Common APPIDs for Testing

| APPID | Game Name |
|-------|-----------|
| 480   | Half-Life |
| 730   | Counter-Strike: Global Offensive |
| 570   | Dota 2 |
| 440   | Team Fortress 2 |

## License

MIT License
