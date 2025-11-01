# Dropdown Fix - Test Checklist

## Pre-Test Setup

1. ✅ CSS compiled: `dist/styles.css` exists
2. ✅ JavaScript syntax validated
3. ✅ All event listeners properly attached
4. ✅ Test function available: `window.testDropdownMenu()`

## Test Procedure

### Test 1: Verify Console Logs on Page Load

**Steps:**
1. Open the app
2. Open DevTools (F12)
3. Go to Console tab

**Expected Output:**
```
=== DROPDOWN DEBUG START ===
🔍 Element check:
  - input exists? true
  - scanButton exists? true
  - outputDirButton exists? true
  - scanDropdown exists? true
  - scanMenu exists? true
  - dropdownItem exists? true
📊 Menu initial state:
  - classList: [list of classes including "hidden"]
  - display style: none
  - position: absolute
  - zIndex: 50
🔧 Attaching event listeners...
✅ Dropdown click listener attached
✅ Document click listener will be attached
✅ Dropdown menu item listener attached
✅ All event listeners attached successfully
=== DROPDOWN DEBUG END ===
💡 Test function available: window.testDropdownMenu()
```

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

### Test 2: Click Dropdown Arrow Button

**Steps:**
1. Locate the dropdown arrow button (▼) next to the Scan button
2. Click the arrow once
3. Observe console output

**Expected Console Output:**
```
🚨 DROPDOWN BUTTON CLICKED!
  - Event target: <button>
  - Current target: <button>
  - Menu currently hidden? true
  - Menu classList before toggle: [with "hidden"]
  - Menu classList after toggle: [without "hidden"]
  - Menu hidden after toggle? false
  - Menu display style: block (or not "none")
  - Menu visibility: visible
  - Menu opacity: 1
  - Added "active" class to dropdown button
  - Menu position: {top: X, left: Y, right: Z, bottom: W, width: A, height: B}
✅ Click handler completed
```

**Expected Visual Result:**
- Dropdown menu appears below the button
- Menu shows "📚 Scan All Installed Games"
- Menu has dark background with border
- Menu is clickable

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

### Test 3: Click Dropdown Arrow Again (Close Menu)

**Steps:**
1. With menu open, click the dropdown arrow again
2. Observe console and visual changes

**Expected Console Output:**
```
🚨 DROPDOWN BUTTON CLICKED!
  - Menu currently hidden? false
  - Menu classList after toggle: [with "hidden"]
  - Menu hidden after toggle? true
  - Removed "active" class from dropdown button
✅ Click handler completed
```

**Expected Visual Result:**
- Menu disappears smoothly
- No errors in console

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

### Test 4: Click Outside to Close Menu

**Steps:**
1. Click dropdown arrow to open menu
2. Click anywhere outside the menu (e.g., on the page background)
3. Observe console and visual changes

**Expected Console Output:**
```
🔴 Click outside detected - closing menu
```

**Expected Visual Result:**
- Menu closes automatically
- No errors

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

### Test 5: Click Menu Item

**Steps:**
1. Click dropdown arrow to open menu
2. Click on "📚 Scan All Installed Games" option
3. Observe modal and console

**Expected Console Output:**
```
📚 Scan All menu item clicked
```

**Expected Visual Result:**
- Menu closes
- Confirmation modal appears with:
  - Title: "Scan All Installed Games?"
  - Message about scanning Steam games
  - Cancel and Confirm buttons

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

### Test 6: Force Visibility Test (Emergency Test)

**Purpose:** Verify the menu element exists and can be styled

**Steps:**
1. Open DevTools Console
2. Type and run: `window.testDropdownMenu()`
3. Look at the page

**Expected Console Output:**
```
🧪 TESTING DROPDOWN MENU
Menu found - forcing visible
✅ Menu should now be visible with red background
Menu position: {top: X, left: Y, ...}
```

**Expected Visual Result:**
- A RED box appears with yellow border
- Box contains "📚 Scan All Installed Games"
- Box is in the top-right area of the page

**If NO RED BOX appears:**
- This indicates the menu element doesn't exist in the DOM
- Check HTML rendering
- Check if InputSection.render() was called

**Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________

---

## Common Issues & Solutions

### Issue: Elements don't exist (all show "false")
**Diagnosis:** InputSection not rendered properly  
**Solution:** Check if `inputSection.render()` is called in renderer.js

### Issue: Click detected but menu stays hidden
**Diagnosis:** CSS `hidden` class not working  
**Solution:** 
- Verify `dist/styles.css` is loaded
- Check CSS contains `.scan-dropdown-menu.hidden { display: none; }`
- Run force visibility test

### Issue: Menu appears then immediately closes
**Diagnosis:** Document click listener timing issue  
**Solution:** Already fixed with `setTimeout`, but verify no other scripts interfere

### Issue: Menu appears off-screen
**Diagnosis:** Positioning or viewport issue  
**Solution:** 
- Check browser zoom (should be 100%)
- Inspect menu position values in console
- Verify `position: absolute` is applied

### Issue: No console logs at all
**Diagnosis:** JavaScript not loaded or syntax error  
**Solution:**
- Check browser console for errors (red text)
- Verify all script tags in index.html
- Check network tab for failed loads

---

## Success Criteria

All tests must pass for the fix to be complete:

- [ ] Test 1: Console logs on page load
- [ ] Test 2: Dropdown opens on arrow click
- [ ] Test 3: Dropdown closes on second arrow click
- [ ] Test 4: Dropdown closes on outside click
- [ ] Test 5: Menu item click shows modal
- [ ] Test 6: Force visibility test shows red box

**Additional checks:**
- [ ] No JavaScript errors in console
- [ ] Menu animation is smooth
- [ ] Menu is properly positioned (not off-screen)
- [ ] Menu items are clickable
- [ ] Hover effects work on menu items

---

## Test Results Summary

**Tester:** _____________________  
**Date:** _____________________  
**Browser:** _____________________  
**Overall Result:** ⬜ PASS / ⬜ FAIL  

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Additional Comments:**
_____________________________________________
_____________________________________________
_____________________________________________
