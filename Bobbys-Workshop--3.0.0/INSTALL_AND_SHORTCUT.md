# Install App and Create Desktop Shortcut

## Quick Setup Guide

### Step 1: Save Your Logo

Since the logo image cannot be saved directly, please:

1. **Right-click the logo image** you provided
2. **Save it** to: `src-tauri\icons\icon.png`
3. **Convert to ICO format** (recommended for Windows):
   - Use online converter: https://convertio.co/png-ico/
   - Or: https://www.icoconverter.com/
4. **Save the ICO file** as: `src-tauri\icons\icon.ico`

**Recommended icon sizes:**
- `icon.ico` - 256x256 or 512x512 (Windows)
- `icon.png` - 512x512 (general use)
- Optional sizes: 32x32.png, 128x128.png, 256x256.png

### Step 2: Choose Installation Method

#### Option A: Development Mode (Quick Start)

For development/testing:

```powershell
# Create desktop shortcut for dev mode
.\scripts\create-desktop-shortcut.ps1 -Mode dev -AppName "Super Bobby's World"
```

This will:
- Create a desktop shortcut
- Launch the dev server when clicked
- Start backends automatically
- Open the app in your browser

#### Option B: Production Build (Full Install)

For a full desktop app installation:

```powershell
# Build the Tauri app
npm run tauri:build:windows

# Create desktop shortcut (shortcut is usually created automatically during build)
# If not, use the existing script:
.\scripts\create-desktop-shortcut.ps1 -Mode production -AppName "Super Bobby's World"
```

This will:
- Build a standalone Windows executable
- Create a desktop shortcut automatically
- Install as a native desktop app

### Step 3: Use the Desktop Shortcut

After running the script:
1. **Find the shortcut** on your desktop: `Super Bobby's World.lnk`
2. **Double-click** to launch the app
3. The app will start with all backends running

## Files Created

- `scripts\create-desktop-shortcut.ps1` - Creates desktop shortcut
- `scripts\launch-app.ps1` - Launches the app (used by shortcut)
- `assets\icons\README.md` - Icon instructions

## Troubleshooting

**Logo not showing?**
- Make sure `icon.ico` exists in `src-tauri\icons\`
- Try converting PNG to ICO again
- Check file size (should be 256x256 or larger)

**Shortcut not working?**
- Check that Node.js is installed
- Verify both backends can start: `.\start-all-backends.ps1`
- Check PowerShell execution policy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Want to change the shortcut name?**
```powershell
.\scripts\create-desktop-shortcut.ps1 -AppName "Your Custom Name"
```

## Notes

- The shortcut uses the logo from `src-tauri\icons\icon.ico` (or `assets\icons\app-icon.ico`)
- For development mode, the shortcut launches the dev server
- For production mode, the shortcut launches the built executable
- All backend services start automatically
