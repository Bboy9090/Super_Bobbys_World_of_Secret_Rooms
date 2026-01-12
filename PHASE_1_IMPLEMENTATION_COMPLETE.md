# Phase 1 Implementation: USB Enumeration → Backend API

**Status**: ✅ Complete  
**Date**: 2025-01-XX

## What Was Implemented

### 1. ✅ CLI Binary with JSON Output

**File**: `crates/bootforge-usb/bootforge-cli/src/main.rs`

- Added JSON output support (`--json` flag)
- Binary renamed to `bootforgeusb` (matches backend expectations)
- Uses `libbootforge::usb::detect_devices()` for enumeration
- Outputs properly serialized JSON array

**Commands**:
```bash
bootforgeusb scan          # Human-readable output
bootforgeusb scan --json   # JSON output (for backend API)
```

### 2. ✅ Cargo.toml Configuration

**File**: `crates/bootforge-usb/bootforge-cli/Cargo.toml`

- Added `[[bin]]` target named `bootforgeusb`
- Added `serde_json` dependency for JSON serialization
- Binary builds as `bootforgeusb` (matches backend expectations)

### 3. ✅ Backend Integration

**File**: `server/routes/v1/bootforgeusb.js` (already exists)

The backend API endpoint `/api/v1/bootforgeusb/scan` already exists and expects:
- Command: `bootforgeusb scan --json`
- Output: JSON array of device objects
- Response: Wrapped in API envelope format

## Testing Instructions

### Build the Binary

From workspace root:
```bash
cd crates/bootforge-usb
cargo build --release --bin bootforgeusb
```

Or from workspace root:
```bash
cargo build --release -p bootforge-cli --bin bootforgeusb
```

### Install the Binary

Option A: Local install
```bash
cargo install --path crates/bootforge-usb/bootforge-cli --bin bootforgeusb
```

Option B: Build and copy
```bash
# Windows
copy target\release\bootforgeusb.exe %USERPROFILE%\.cargo\bin\

# macOS/Linux
cp target/release/bootforgeusb ~/.cargo/bin/
```

### Test Locally

```bash
# Test JSON output
bootforgeusb scan --json

# Should output JSON array like:
# [
#   {
#     "id": "...",
#     "vendor_id": 1234,
#     "product_id": 5678,
#     "manufacturer": "...",
#     "product": "...",
#     ...
#   }
# ]
```

### Test Backend Integration

1. Start the backend server
2. Call the API endpoint:
   ```bash
   curl http://localhost:3000/api/v1/bootforgeusb/scan
   ```
3. Should return JSON envelope with device list

## Next Steps

### Phase 2: Complete Windows Enumeration (SetupAPI)

**Status**: ⚠️ Stub exists, needs implementation

**File**: `crates/bootforge-usb/libbootforge/src/enumerate/windows.rs`

**What's Needed**:
- Implement SetupAPI queries
- Extract instance IDs
- Get driver information
- Populate friendly names

**Priority**: High (you're on Boot Camp Windows 11)

### Phase 3: Device Memory & Hotplug

**Status**: ❌ Not started

**What's Needed**:
- Device fingerprinting (stable IDs across reconnects)
- Local device cache (JSON file)
- Hotplug watcher (Linux udev monitor, Windows device notifications, macOS IOKit notifications)

### Phase 4: Frontend Integration

**Status**: ❌ Not started

**What's Needed**:
- Device list React component
- Real-time updates (WebSocket)
- Device detail panel
- Integration with existing UI

## Known Issues

1. **Binary Name**: Backend expects `bootforgeusb`, CLI binary is configured correctly now
2. **Two USB Systems**: There are two different USB enumeration systems:
   - `enumerate` module (uses `rusb`, references non-existent `crate::types`)
   - `usb::detect` module (uses `nusb`, properly implemented)
   - **Current implementation uses `usb::detect`** (which works)
3. **Windows Enrichment**: SetupAPI implementation is still a stub
4. **macOS Enrichment**: IOKit implementation is still a stub

## Notes

- The `usb::detect_devices()` function uses `nusb` which works cross-platform
- JSON serialization works because `UsbDeviceInfo` derives `Serialize`
- Backend API endpoint already exists and is properly structured
- Binary name matches backend expectations (`bootforgeusb`)
