# Windows Build Symlink Error Fix

## Problem
The Windows build was failing with symlink privilege errors when electron-builder tried to extract winCodeSign binaries containing macOS symlinks (libcrypto.dylib, libssl.dylib).

## Solution
Added `signAndEditExecutable: false` to the Windows configuration in package.json. This setting tells electron-builder to skip the code signing and executable editing step, avoiding the need to extract the winCodeSign tool that causes the symlink issue.

## Changes Made
- Modified `package.json`: Added `"signAndEditExecutable": false` to the `build.win` configuration section

## Impact
- Windows builds will now complete successfully without requiring admin privileges
- The generated Windows executables will run correctly but won't be code-signed
- Users may see a Windows SmartScreen warning on first run (standard for unsigned executables)
- Mac and Linux build configurations remain unchanged and functional

## Testing
Run `npm run build:win` to verify the build completes without symlink errors.

## Additional Notes
If code signing is required in the future, you can:
1. Obtain a code signing certificate
2. Configure electron-builder with proper certificate settings
3. Set `signAndEditExecutable: true` again

For development and testing purposes, unsigned executables are perfectly acceptable.
