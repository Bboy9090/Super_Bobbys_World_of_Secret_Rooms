# 🔨 Build Production Executable

## Quick Start

**Double-click**: `BUILD_PRODUCTION.ps1`

This will create a production-ready executable and installer that you can:
- ✅ Double-click to run (no dev mode)
- ✅ Install on any Windows PC
- ✅ Share with others

---

## What Gets Built

1. **Standalone Executable** (`Super Bobbys World.exe`)
   - Run directly, no installation needed
   - Portable - can copy to any folder

2. **MSI Installer** (`.msi` file)
   - Windows installer package
   - Installs to Program Files
   - Creates Start Menu shortcut

3. **NSIS Installer** (`.exe` file)
   - Windows setup wizard
   - Customizable installation
   - Creates desktop shortcut

---

## Build Process

The script will:
1. ✅ Prepare bundle resources (server, Node.js, Python)
2. ✅ Build frontend (React app)
3. ✅ Build Tauri executable (5-10 minutes)
4. ✅ Copy files to `app/windows/`

**Total time**: 5-10 minutes

---

## Output Location

After building, all files are in:
```
app\windows\
├── Super Bobbys World.exe              ← Run this directly
├── Super Bobbys World_1.3.0_x64_en-US.msi  ← MSI installer
└── Super Bobbys World_1.3.0_x64-setup.exe  ← NSIS installer
```

---

## How to Use

### Run Directly (Portable)
1. Go to `app\windows\`
2. Double-click `Super Bobbys World.exe`
3. App launches immediately

### Install (Recommended)
1. Go to `app\windows\`
2. Double-click the `.msi` or `.exe` installer
3. Follow the installation wizard
4. Launch from Start Menu or desktop shortcut

---

## Requirements

Before building, make sure you have:
- ✅ Node.js 18+ installed
- ✅ Rust toolchain installed (`rustup`)
- ✅ Tauri CLI installed (`cargo install tauri-cli`)

---

## Troubleshooting

### "cargo: command not found"
Install Rust: https://rustup.rs/

### "tauri: command not found"
Install Tauri CLI:
```powershell
cargo install tauri-cli
```

### Build fails
1. Make sure all dependencies are installed: `npm install`
2. Check Rust is up to date: `rustup update`
3. Clean and rebuild: Delete `src-tauri/target/` and try again

---

**That's it! Just double-click `BUILD_PRODUCTION.ps1` and wait 5-10 minutes!** 🚀
