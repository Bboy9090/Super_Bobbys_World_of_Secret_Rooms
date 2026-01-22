# 🚀 Install & Run - Production Build

## 🔨 Build Production Executable

**Double-click**: `BUILD_PRODUCTION.ps1`

This will:
- ✅ Build the frontend
- ✅ Create a standalone .exe file
- ✅ Create MSI and NSIS installers
- ✅ Copy everything to `app/windows/`

**Time**: 5-10 minutes

---

## 📦 Installation Options

### Option 1: Use Installer (Recommended)

1. Go to `app/windows/`
2. Double-click the `.msi` or `.exe` installer
3. Follow the installation wizard
4. Launch from Start Menu

### Option 2: Run Directly (Portable)

1. Go to `app/windows/`
2. Double-click `Super Bobbys World.exe`
3. App launches immediately (no installation needed)

---

## 📍 Where Are My Files?

After building, everything is in:
```
app\windows\
├── Super Bobbys World.exe     ← Run this directly
├── Super Bobbys World_1.3.0_x64_en-US.msi  ← MSI installer
└── Super Bobbys World_1.3.0_x64-setup.exe ← NSIS installer
```

---

## ✅ That's It!

**To build**: Double-click `BUILD_PRODUCTION.ps1`  
**To run**: Double-click `Super Bobbys World.exe`  
**To install**: Double-click the `.msi` or `.exe` installer

**No dev mode, no rebuilding - just click and run!** 🎮
