# Bobby's Workshop — Current State & Next Steps

**Last Updated**: 2025-01-XX  
**Status**: ~70% Foundation Complete | Ready for Integration Phase

---

## ✅ What's Built & Working

### 1. **USB Enumeration Core** (Rust)
**Location**: `crates/bootforge-usb/libbootforge/src/`

**Status**:
- ✅ Cross-platform libusb base enumeration (works everywhere)
- ✅ Linux enrichment via udev (fully implemented)
- ⚠️ Windows enrichment (SetupAPI stub — needs implementation)
- ⚠️ macOS enrichment (IOKit stub — needs implementation)

**What Works**:
- `enumerate_all()` returns device list on all platforms
- VID/PID detection
- Manufacturer/product strings (when available)
- Serial numbers (when available)
- Bus/address mapping

**What's Missing**:
- Windows: Instance ID, driver info, friendly names
- macOS: IORegistry paths, location IDs
- Hotplug watcher (device add/remove events)
- Stable device fingerprinting (same device across reconnects)

### 2. **Backend API** (Node.js/Express)
**Location**: `server/index.js`, `server/routes/`

**Status**: ✅ Production-ready

**Endpoints Working**:
- `GET /api/health` — Health checks
- `GET /api/tools/catalog` — Tool inventory
- `GET /api/system-tools/*` — System diagnostics
- `GET /api/adb/devices` — ADB device list
- `GET /api/ios/scan` — iOS device detection
- `POST /api/tests/run` — Environment self-tests
- `GET /api/catalog` — Manifest-based catalog

**Architecture**:
- Manifest-driven (`runtime/manifests/`)
- Tool detection via `command -v` / `where`
- Path resolution
- Version probing
- Environment-aware (local vs codespaces)

### 3. **Frontend Utilities** (TypeScript/React)
**Location**: `src/lib/`

**Status**: ✅ Clean & Refactored

**What Works**:
- ✅ Centralized clipboard (`src/lib/clipboard.ts`)
  - Success/error handling
  - Graceful fallbacks
  - No duplicate logic
- ✅ Tool registry components
- ✅ UI state management
- ✅ React hooks properly structured

**Components**:
- `ToolRegistry.tsx` — Tool catalog UI
- `PandoraCodexIntegrationGuide.tsx` — Integration docs
- `BackendAPIGuide.tsx` — API reference
- Various module panels

### 4. **Architecture Foundation**
**Status**: ✅ Solid

**Structure**:
```
Bobbys-Workshop-/
├── crates/bootforge-usb/     # Rust USB core
├── server/                    # Node.js API
├── src/                       # React frontend
├── runtime/manifests/         # Configuration
└── docs/                      # Documentation
```

**Patterns**:
- Manifest-driven configuration
- Cross-platform tool detection
- Type-safe Rust → JS bridge ready
- Clean separation: detection / action / reporting

---

## ⚠️ What's Partially Done

### USB Enumeration → Backend Bridge
**Status**: Structure exists, needs wiring

**What Exists**:
- Rust enumeration functions
- Backend API structure
- Type definitions

**What's Missing**:
- Node.js bridge to call Rust code
- API endpoint: `GET /api/usb/enumerate`
- WebSocket stream for hotplug events
- Device persistence (track same device across scans)

### Windows/macOS Enrichment
**Status**: Stubs in place, need implementation

**Windows** (`enumerate/windows.rs`):
- Current: Placeholder with format strings
- Needed: SetupAPI implementation
  - `SetupDiGetClassDevs`
  - `SetupDiEnumDeviceInfo`
  - `SetupDiGetDeviceRegistryProperty`
  - VID/PID → Instance ID mapping

**macOS** (`enumerate/macos.rs`):
- Current: Placeholder
- Needed: IOKit implementation
  - `IOServiceGetMatchingServices`
  - `IORegistryEntryCreateCFProperty`
  - Location ID extraction

---

## 🔴 What's Missing (Next Phase)

### 1. **USB → Backend Integration** (High Priority)

**Goal**: Make Rust USB enumeration available to Node.js backend

**Steps**:
1. **Create Node.js bridge**
   - Option A: FFI via `napi-rs` / `neon`
   - Option B: CLI subprocess (simpler, slower)
   - Option C: HTTP service (separate Rust server)

2. **Add API endpoint**
   ```javascript
   // server/routes/usb.js
   GET /api/usb/enumerate
   GET /api/usb/watch (WebSocket)
   ```

3. **Wire to frontend**
   - Device list panel
   - Real-time hotplug updates
   - Device detail views

### 2. **Complete OS-Specific Enumeration** (Medium Priority)

**Windows**:
- Implement SetupAPI queries
- Extract driver information
- Get friendly names
- Map instance IDs

**macOS**:
- Implement IOKit matching
- Extract IORegistry properties
- Get location IDs
- Map to device paths

**Why This Matters**:
- More accurate device identification
- Better driver status detection
- Stable device tracking
- "Been here before" feeling

### 3. **Device Memory / Fingerprinting** (Medium Priority)

**Goal**: Track devices across reconnects

**Needed**:
- Stable device ID generation (VID:PID:Serial hash)
- Local device database (JSON file, optional SQLite)
- First-seen / last-seen timestamps
- Device capability cache

**Implementation**:
```rust
// crates/bootforge-usb/libbootforge/src/usb/fingerprint.rs
pub struct DeviceFingerprint {
    pub vid: u16,
    pub pid: u16,
    pub serial_hash: String,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub capabilities: Vec<ProtocolType>,
}
```

### 4. **Hotplug Watcher** (Medium Priority)

**Goal**: Real-time device add/remove events

**Needed**:
- Linux: udev monitor (event stream)
- Windows: Device notification callbacks
- macOS: IOKit notifications
- WebSocket stream to frontend

**Implementation**:
```rust
// Event stream
pub enum DeviceEvent {
    Added(UsbDeviceInfo),
    Removed { fingerprint: String },
    Changed(UsbDeviceInfo),
}
```

### 5. **Frontend Device UI** (Low Priority)

**Goal**: Visual device panel

**Needed**:
- Device list component
- Device detail panel
- Real-time updates (WebSocket)
- Platform/mode badges
- Connection status indicators

---

## 📋 Recommended Next Steps (Priority Order)

### Phase 1: Make USB Enumeration Usable (This Week)

1. **Choose integration method**
   - Recommended: CLI subprocess (fastest to implement)
   - Future: FFI for performance

2. **Create USB API endpoint**
   ```bash
   # server/routes/usb.js
   GET /api/usb/enumerate → calls Rust CLI
   ```

3. **Test on Boot Camp Windows 11**
   - Verify libusb works
   - Check device detection
   - Validate JSON output

### Phase 2: Complete Windows Enumeration (Next Week)

1. **Implement SetupAPI queries**
   - Follow skeleton in `enumerate/windows.rs`
   - Use `windows` crate (already in dependencies)
   - Extract instance IDs, driver names

2. **Test & verify**
   - Compare with Device Manager
   - Verify device matching
   - Check driver detection

### Phase 3: Device Memory & Watcher (Week 3)

1. **Add fingerprinting**
   - Stable ID generation
   - Local cache file
   - First/last seen tracking

2. **Implement hotplug**
   - Start with Linux (easiest: udev monitor)
   - Add Windows (device notifications)
   - Add macOS (IOKit notifications)

3. **Wire WebSocket stream**
   - Backend → Frontend
   - Real-time device updates
   - Connection status

### Phase 4: Frontend Integration (Week 4)

1. **Device list panel**
   - React component
   - Real-time updates
   - Device detail views

2. **Integration with existing UI**
   - Tool registry
   - Workbench panels
   - Device history

---

## 🎯 "Legendary" Completion Criteria

You're at **~70%** foundation. To hit "best of the best":

### Must Have (Core)
- ✅ Cross-platform enumeration (works, needs enrichment)
- ⚠️ Platform-specific enrichment (Linux done, Win/Mac stubs)
- ❌ Hotplug watcher (missing)
- ❌ Stable device tracking (missing)
- ⚠️ Backend integration (structure exists, needs wiring)

### Should Have (Polish)
- ❌ Device memory/cache
- ❌ Capability detection (ADB/Fastboot/DFU presence)
- ❌ Driver status checks per OS
- ❌ Frontend device UI
- ❌ WebSocket event stream

### Nice to Have (Future)
- Operation envelopes (structured job tracking)
- Evidence bundles (case management)
- Tool auto-detection integration
- Native Tauri bridge

---

## 🔧 Quick Wins (Do These First)

1. **Wire USB enumeration to backend** (2-4 hours)
   - Create CLI wrapper
   - Add `/api/usb/enumerate` endpoint
   - Test on your iMacs

2. **Test current enumeration** (1 hour)
   - Run `cargo run -p bootforge-usb --bin enumerate`
   - Verify devices detected
   - Check JSON output format

3. **Create device list API endpoint** (1 hour)
   - Simple wrapper around Rust CLI
   - Return JSON array
   - Test from frontend

4. **Add frontend device panel** (2-3 hours)
   - Basic list component
   - Fetch from API
   - Display VID/PID/product

---

## 📝 Notes

### Architecture Decisions Made
- ✅ Rust for USB enumeration (performance, cross-platform)
- ✅ Node.js for API (flexibility, ecosystem)
- ✅ React/TypeScript for UI (modern, maintainable)
- ✅ Manifest-driven config (versionable, auditable)

### What NOT to Do
- ❌ Don't reimplement enumeration (libusb works)
- ❌ Don't add fake device data (keep it real)
- ❌ Don't skip error handling (failures are info)
- ❌ Don't hide unsupported platforms (be honest)

### What TO Do
- ✅ Keep detection read-only first
- ✅ Add action gates later (policy-driven)
- ✅ Test on real hardware (your iMacs)
- ✅ Document what works vs stubs
- ✅ Make failures informative

---

## 🚀 Immediate Action Items

Pick ONE and do it:

1. **"Wire USB enum to backend"** → I'll create the bridge code
2. **"Complete Windows enum"** → I'll implement SetupAPI
3. **"Test current setup"** → I'll provide test commands
4. **"Frontend device panel"** → I'll create the component

Tell me which one, and I'll generate the exact code/files you need.
