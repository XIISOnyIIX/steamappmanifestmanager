# Hotfix: Remove Auto-Scan on Startup

## Overview
Emergency fix to prevent automatic game scanning when the app starts up.

## Branch
`hotfix-remove-auto-scan-on-startup`

## Files Changed

### 1. renderer.js
**Changes**:
- Added `isInitializing` flag to `SteamManifestApp` constructor (line 36)
- Added guard in `scanAppId()` method (lines 143-147)
- Added guard in `scanAllInstalledGames()` method (lines 189-192)
- Added guard in `scanGameByAppId()` method (lines 270-274)
- Set `isInitializing = false` after successful initialization (line 95)
- Set `isInitializing = false` in error handler (line 103)
- Moved `window.app` assignment before `app.initialize()` (line 637)
- Added debug logging throughout initialization

**Impact**: 
- Prevents ALL scan methods from running during initialization
- Makes app instance available to guards before initialization completes

### 2. components/InputSection.js
**Changes**:
- Added guard in `handleToggleChange()` method (lines 87-90)
- Added guard in `handleScan()` method (lines 119-122)
- Added debug logging in both methods

**Impact**:
- Prevents toggle changes from triggering side effects during init
- Prevents user-triggered scans during initialization

### 3. steam-scanner.js
**Changes**:
- Added debug logging to `findAllInstalledGames()` method (lines 248-249)

**Impact**:
- Helps diagnose if this method is called unexpectedly

### 4. .gitignore
**Changes**:
- Added `dist/` directory to ignore list

**Impact**:
- Prevents build artifacts from being committed

### 5. New Files Created
- `AUTO_SCAN_FIX_SUMMARY.md` - Technical documentation of the fix
- `TEST_PLAN_AUTO_SCAN_FIX.md` - Comprehensive testing guide
- `HOTFIX_CHANGES.md` - This file

## How It Works

### Initialization Guard Pattern
```javascript
// 1. Flag starts as true
constructor() {
  this.isInitializing = true;
}

// 2. All scan methods check the flag
async scanAllInstalledGames() {
  if (this.isInitializing) {
    console.warn('⚠️ BLOCKED: Scan attempted during initialization!');
    return;
  }
  // ... rest of scan logic
}

// 3. Flag is cleared when init completes
async initialize() {
  // ... initialization code
  this.isInitializing = false;
}
```

### Multi-Layer Defense
1. **Constructor Level**: Flag initialized to block scans
2. **Method Level**: Every scan method checks the flag
3. **Component Level**: InputSection checks flag before triggering scans
4. **Timing Level**: window.app set early so guards work during init

## Breaking Changes
**NONE** - All existing functionality preserved. Guards only activate during initialization.

## Testing Required
See `TEST_PLAN_AUTO_SCAN_FIX.md` for comprehensive testing checklist.

**Critical Test**: App must start WITHOUT any automatic scanning.

## Rollback Plan
If this fix causes issues, revert this hotfix branch:
```bash
git checkout main
```

## Console Messages to Expect

### Normal Startup (GOOD):
```
DOM loaded, initializing app...
🔧 Initializing Steam Manifest App...
🔧 No scans should be triggered during initialization!
...
✅ App initialized successfully - NO SCANS TRIGGERED
✅ User must click the Scan button to start scanning
```

### If Auto-Scan Was Blocked (GOOD):
```
⚠️ BLOCKED: Scan attempted during initialization!
⚠️ BLOCKED: Cannot scan during initialization
```

### Problem Indicators (BAD):
```
🚨 scanAllInstalledGames called!
🚨 findAllInstalledGames called!
[stack traces during initialization]
```

## Monitoring
After deployment, watch for:
- User reports of app not opening properly
- User reports of scans not working when button clicked
- Console errors related to `isInitializing` being undefined

## Success Metrics
- ✅ Zero reports of auto-scan on startup
- ✅ Zero breaking changes to existing functionality
- ✅ Scan button still works for both single and scan-all modes

## Author Notes
This is a defensive fix using guard clauses. Even if something attempts to trigger a scan during initialization (race condition, event timing, async issue, etc.), the guards will block it. The debug logging will help identify the source of any future issues.

The fix is:
- **Safe**: Only blocks during initialization
- **Visible**: Logs all blocked attempts
- **Reversible**: Easy to rollback if needed
- **Comprehensive**: Multiple layers of defense
