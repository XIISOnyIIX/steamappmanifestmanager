# Testing Guide - DaisyUI UI Overhaul

## How to Test the Changes

### 1. Build and Run
```bash
# Install dependencies (if not already done)
npm install

# Build CSS with DaisyUI
npx tailwindcss -i ./styles.css -o ./dist/styles.css

# Run the app
npm start
```

### 2. Visual Tests

#### Top Navigation Bar
- [ ] Should see "Steam Manifest Scanner" title on left
- [ ] Should see APPID input field on right
- [ ] Should see "Scan" button next to input
- [ ] Should see "Output" button for directory selection
- [ ] Navigation bar should stick to top when scrolling

#### Empty State
- [ ] Before scanning, should see hero section with:
  - Large document icon
  - "No Games Scanned Yet" heading
  - Instructional text

#### Scanning a Game
1. Select an output directory (button turns green, shows ✓)
2. Enter a valid APPID (e.g., 480 for Half-Life)
3. Click "Scan" or press Enter
4. Should see:
   - [ ] Loading card with spinner and progress bar
   - [ ] Card replaces with game card after fetch

#### Game Card - Visual Elements
- [ ] Banner image at top of card
- [ ] Game name as card title
- [ ] Blue "APPID: xxx" badge
- [ ] Manifest count text
- [ ] "Show Depot Details" collapse button
- [ ] "Save" button (green)
- [ ] "Remove" button (red)

### 3. Functional Tests

#### Depot Details (THE BIG FIX)
- [ ] Click "Show Depot Details"
- [ ] Details expand BELOW the card banner (not under it)
- [ ] Table shows:
  - Depot ID column
  - Manifest ID column
  - Decryption Key column (green if present, warning if not)
- [ ] Collapse properly animates
- [ ] Can open/close multiple times without issues
- [ ] Other cards' details don't interfere

#### Save Functionality
**First Save:**
- [ ] Click "Save" button
- [ ] Button shows spinner + "Saving..."
- [ ] After save, shows checkmark + "Saved!" (2 seconds)
- [ ] Then changes to "Save Again"
- [ ] Green "Saved" badge appears on banner
- [ ] "Last saved: [timestamp]" appears below depot details
- [ ] Toast notification: "Successfully saved manifests for [game]"

**Save Again:**
- [ ] Can click "Save Again" button
- [ ] Same animation sequence
- [ ] Timestamp updates
- [ ] Can save unlimited times

#### Remove Functionality
- [ ] Click "Remove" button
- [ ] Confirmation modal appears
- [ ] Modal shows game name and warning message
- [ ] "Cancel" button closes modal without removing
- [ ] "Confirm" button:
  - Closes modal
  - Card fades out
  - Card removed from list
  - Toast notification: "Removed [game] from list"
  - If last card, empty state reappears

### 4. Toast Notifications

Should see toasts for:
- [ ] "Steam installation detected" (success) on load
- [ ] "Output directory selected" (success) when directory chosen
- [ ] "[X] manifest(s) found for [game]" (success) after scan
- [ ] "No manifests found for [game]" (warning) if none found
- [ ] "APPID xxx has already been scanned" (warning) if duplicate
- [ ] "Error scanning APPID xxx: [message]" (error) on failures
- [ ] "Please select an output directory first" (error) if save without directory

### 5. Responsive Design

Test at different screen sizes:
- [ ] **Mobile (< 768px)**: 1 column of cards
- [ ] **Tablet (768-1024px)**: 2 columns of cards
- [ ] **Desktop (> 1024px)**: 3 columns of cards
- [ ] Navigation bar adjusts properly
- [ ] Cards remain readable at all sizes

### 6. Animations

- [ ] New cards fade in smoothly
- [ ] Removed cards fade out smoothly
- [ ] Toast notifications slide up
- [ ] Collapse/expand is smooth
- [ ] Hover on cards: shadow increases
- [ ] Button hover effects work

### 7. Edge Cases

#### No Output Directory
- [ ] Try to save without selecting directory
- [ ] Should show error toast
- [ ] Save button should still work after selecting directory

#### No Manifests Found
- [ ] Scan a game with no manifests
- [ ] Card should show warning badge
- [ ] No "Save" button should appear
- [ ] "Remove" button should still work

#### Invalid APPID
- [ ] Enter invalid/non-existent APPID
- [ ] Should show error card
- [ ] Error card should have remove button
- [ ] Can remove error card

#### Multiple Cards
- [ ] Scan multiple games
- [ ] Each card operates independently
- [ ] Can expand different depot details simultaneously
- [ ] Removing one doesn't affect others
- [ ] Can save different games independently

### 8. Keyboard Shortcuts

- [ ] Press Enter in APPID field to scan
- [ ] Escape key closes modal (native DaisyUI behavior)
- [ ] Tab navigation works through buttons

## Known Working Configurations

- Electron 30.x
- DaisyUI 4.x
- Tailwind CSS 3.4.x
- Node.js (any recent version with Electron support)

## What Was Fixed

### ✅ Problem 1: Depot Details Under Banner
**Before**: Details appeared under/behind the banner image
**After**: Details properly expand inside card body, below banner

### ✅ Problem 2: Lua Preview Won't Close
**Before**: Bottom panel kept reappearing
**After**: Panel completely removed, no longer exists

### ✅ Problem 3: No Card Management
**Before**: No way to remove cards
**After**: Remove button with confirmation modal

### ✅ Problem 4: One-Time Save Only
**Before**: Could only save once
**After**: "Save Again" button allows multiple saves

### ✅ Problem 5: UI Not Impressive
**Before**: Custom Aceternity/Magic UI
**After**: Professional DaisyUI components

## Troubleshooting

### CSS Not Applied
```bash
npx tailwindcss -i ./styles.css -o ./dist/styles.css
```

### DaisyUI Components Not Styled
- Check `data-theme="dark"` is in `<html>` tag
- Verify DaisyUI in tailwind.config.js plugins
- Rebuild CSS

### Modal Not Working
- Check ConfirmModal.js is loaded in HTML
- Check `confirmModal.initialize()` is called in renderer.js

### Depot Details Still Under Banner
- Check card structure has `<figure>` then `<div class="card-body">`
- Collapse should be inside `card-body`
- Not inside or after `figure`

## Success Criteria

All checkboxes above should be checked ✓
No console errors when:
- Loading app
- Scanning games
- Saving manifests
- Removing cards
- Opening/closing depot details
