# Quick Start Guide

Get up and running with Steam Manifest Scanner in 5 minutes!

## Prerequisites

- Node.js 18 or higher ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Steam installed on your system

## Installation

1. **Download or clone this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

That's it! The application window should open.

## First Use

### Quick Scan

1. Click the blue **"Scan Steam Depotcache"** button
2. Wait a few seconds while the app scans your Steam directories
3. Review the table of discovered manifest files
4. Click the folder icon to select an output directory
5. Click the green **"Save .lua Scripts"** button

Your Lua scripts are now saved!

### Manual File Selection

If you have manifest files in a custom location:

1. Click the purple **"Select .manifest Files"** button
2. Browse to your manifest files and select them (you can select multiple)
3. The files will appear in the table
4. Select an output directory
5. Click **"Save .lua Scripts"**

## Understanding the Output

Generated Lua files will contain commands like:

```lua
-- APPID: 480
addappid(480)
setManifestid(480,"7885175683255934976")
setDecryptionKey(480,"5329bd39507637997739c33a4b5737f9539ee434a7b79bd875b5fc7d1337c684")
```

Where:
- `480` is the Steam APPID (game ID)
- `"7885175683255934976"` is the manifest ID
- The long hex string is the decryption key

## Common Use Cases

### Scan All Games

1. Click **"Scan Steam Depotcache"**
2. Leave "Infer APPID from Steam depot mapping" checked
3. Select **"Depotcache only"** in Dump Mode
4. Choose output folder
5. Click **"Save .lua Scripts"**

### Include DLCs

1. Click **"Scan Steam Depotcache"**
2. Select **"Base + DLCs + depotcache"** in Dump Mode
3. Continue as normal

### Organize by Game

1. In Output Configuration, select **"{APPID}/ subfolders"**
2. Each game will get its own folder

### Custom Filenames

1. Change the "Filename pattern" field
2. Use tokens:
   - `{APPID}` → Game ID
   - `{DATE}` → Current date
   - `{TIME}` → Current time
3. Example: `manifest_{APPID}_{DATE}.lua`

## Tips

- **Red rows in table** = Invalid data that won't be saved
- **Edit APPID** = Click on the number in the APPID column to change it
- **Live Preview** = The bottom panel shows what will be saved
- **Copy Preview** = Click "Copy to Clipboard" to copy the Lua code
- **Settings Saved** = Your settings are automatically saved between sessions

## Troubleshooting

### "Steam installation not found"

- Make sure Steam is installed
- Try using **"Select .manifest Files"** to manually choose files

### "No manifests found"

- Check that Steam has downloaded some games
- Look in Steam's depotcache folder manually to verify files exist

### No decryption keys

- This is normal for some games
- Scripts will still be generated without `setDecryptionKey()` calls

### Permission denied when saving

- Choose a different output folder
- Make sure you have write permissions to the selected directory

## Need More Help?

See the full [README.md](README.md) for detailed documentation.

## Keyboard Shortcuts

- `Ctrl+C` / `Cmd+C` in preview panel = Copy Lua code (if supported by browser)
- `F12` or `Ctrl+Shift+I` = Open DevTools (for debugging)

## Next Steps

- Explore the **Output Configuration** options for different file structures
- Try different **Dump Modes** to include base games and DLCs
- Check out the live preview to see what your scripts will look like

Happy scanning! 🎮
