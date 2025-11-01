# Test Plan: Auto-Scan Fix Verification

## Purpose
Verify that the auto-scan on startup issue has been completely resolved.

## Test Environment Setup
1. Ensure Steam is installed on the test machine
2. Build the app: `npm install && npm start`
3. Open DevTools Console immediately when app starts (F12 or Cmd+Option+I)

## Test Cases

### Test 1: Clean Startup (CRITICAL)
**Objective**: Verify no automatic scanning occurs on app startup

**Steps**:
1. Close the app if running
2. Start the app fresh
3. Watch the console output

**Expected Results**:
✅ App opens normally
✅ Console shows initialization messages:
   - "DOM loaded, initializing app..."
   - "🔧 Initializing Steam Manifest App..."
   - "🔧 No scans should be triggered during initialization!"
   - "Toast manager initialized"
   - "Input section initialized"
   - "🔧 Setting default UI state..."
   - "✓ Toggle set to unchecked"
   - "Steam scanner initialized"
   - "✅ App initialized successfully - NO SCANS TRIGGERED"
✅ NO scan-related messages appear:
   - Should NOT see "🚨 scanAllInstalledGames called!"
   - Should NOT see "🚨 findAllInstalledGames called!"
   - Should NOT see any trace/stack dumps
✅ NO loading overlay appears automatically
✅ NO popup dialogs appear
✅ UI shows "Scan all installed" toggle in OFF state
✅ Input field is enabled and shows "Enter APPID" placeholder
✅ Scan button shows "Scan" text

**Result**: PASS / FAIL

---

### Test 2: Manual Single APPID Scan
**Objective**: Verify single APPID scanning still works correctly

**Steps**:
1. Ensure app is started and initialized (Test 1 passed)
2. Enter a valid APPID (e.g., "730" for CS:GO)
3. Click the "Scan" button
4. Watch console and UI

**Expected Results**:
✅ Console shows "🔍 handleScan called - User initiated scan"
✅ Console shows trace indicating user click triggered the scan
✅ Loading card appears for the APPID
✅ Game information is fetched and displayed
✅ Manifests are found (if game is installed)
✅ Success toast appears

**Result**: PASS / FAIL

---

### Test 3: Toggle to Scan All Mode
**Objective**: Verify toggle works without triggering automatic scans

**Steps**:
1. Ensure app is started and initialized
2. Click the "Scan all installed" toggle to turn it ON
3. Watch console and UI
4. Wait 5 seconds

**Expected Results**:
✅ Console shows "🎚️ Toggle changed to: Scan All"
✅ Console shows "🎚️ Only updating UI - NOT triggering scan"
✅ Input field becomes disabled and grayed out
✅ Placeholder changes to "Scan all mode enabled"
✅ Scan button text changes to "Scan All"
✅ NO scan is triggered automatically
✅ NO loading overlay appears
✅ Console does NOT show any scan messages

**Result**: PASS / FAIL

---

### Test 4: Manual Scan All
**Objective**: Verify Scan All mode works when user clicks button

**Steps**:
1. Toggle "Scan all installed" to ON (Test 3)
2. Click the "Scan All" button
3. Watch console and UI

**Expected Results**:
✅ Console shows "🔍 handleScan called - User initiated scan"
✅ Console shows "🚨 scanAllInstalledGames called!"
✅ Console shows "🚨 findAllInstalledGames called!"
✅ Loading overlay appears with "Finding installed games..." message
✅ Progress bar shows scanning progress
✅ Game cards appear as they are scanned
✅ Success toast appears when complete

**Result**: PASS / FAIL

---

### Test 5: Toggle OFF (Back to Single Mode)
**Objective**: Verify toggling back to single mode works correctly

**Steps**:
1. If in Scan All mode, toggle OFF
2. Watch console and UI

**Expected Results**:
✅ Console shows "🎚️ Toggle changed to: Single APPID"
✅ Console shows "🎚️ Only updating UI - NOT triggering scan"
✅ Input field becomes enabled
✅ Placeholder changes to "Enter APPID"
✅ Scan button text changes to "Scan"
✅ NO scan is triggered

**Result**: PASS / FAIL

---

### Test 6: Multiple App Restarts
**Objective**: Verify fix is consistent across multiple app restarts

**Steps**:
1. Close and restart the app 5 times
2. Watch console on each startup
3. Count how many times automatic scans occur

**Expected Results**:
✅ Zero automatic scans across all 5 restarts
✅ Consistent initialization logs every time
✅ No race conditions or timing issues

**Result**: PASS / FAIL

---

### Test 7: Rapid Toggle Switching
**Objective**: Verify no race conditions with fast toggle changes

**Steps**:
1. Quickly toggle "Scan all installed" ON and OFF 10 times
2. Do NOT click Scan button
3. Watch console

**Expected Results**:
✅ Only toggle change logs appear
✅ NO scan is triggered
✅ UI updates correctly each time
✅ No errors in console

**Result**: PASS / FAIL

---

### Test 8: Error Recovery
**Objective**: Verify guards remain active even after errors

**Steps**:
1. Enter invalid APPID (e.g., "99999999999")
2. Click Scan
3. Wait for error
4. Restart app
5. Check if auto-scan occurs

**Expected Results**:
✅ Error is handled gracefully
✅ On restart, NO auto-scan occurs
✅ Guards are still active

**Result**: PASS / FAIL

---

## Debug Checklist

If Test 1 fails (auto-scan still occurs), check:

1. **Console Stack Trace**: Look for the trace after "🚨" to see what called the scan
2. **Guard Messages**: Check if any "⚠️ BLOCKED" messages appear (they should during init)
3. **Initialization Flag**: Add `console.log(window.app.isInitializing)` in console to check state
4. **Event Listeners**: Check if any programmatic `dispatchEvent()` or `.click()` calls exist
5. **Timing**: Check if there's a race condition between initialization and event listener attachment

## Success Criteria

ALL of the following must be true:
- ✅ Test 1 (Clean Startup) PASSES - This is critical
- ✅ Tests 2-5 (Functionality) PASS - Features still work
- ✅ Tests 6-8 (Edge Cases) PASS - No race conditions

## Failure Actions

If ANY test fails:
1. Review console logs from the failed test
2. Check which guard (if any) logged a BLOCKED message
3. Verify window.app.isInitializing flag state
4. Review AUTO_SCAN_FIX_SUMMARY.md for troubleshooting steps
5. Check for any new code that might trigger scans

## Regression Testing

After confirming fix works, verify these still work:
- ✅ Output directory selection
- ✅ Manifest saving functionality  
- ✅ Lua script generation
- ✅ Multiple Steam library paths support
- ✅ Toast notifications
- ✅ Error handling
- ✅ Cancel scan functionality
