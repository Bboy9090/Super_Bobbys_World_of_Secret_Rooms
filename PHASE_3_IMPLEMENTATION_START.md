# Phase 3 Implementation: Device Memory & Hotplug

**Date**: 2025-01-XX  
**Status**: Starting Implementation

---

## Implementation Plan

### Task 1: Device Fingerprinting (First)

**Goal**: Generate stable device IDs that persist across reconnects

**Implementation**:
- Use `unique_key()` from `UsbDeviceInfo` (already exists: `VID:PID:serial`)
- Generate stable UUID based on unique_key (deterministic)
- Store in device cache

### Task 2: Local Device Cache

**Goal**: Track devices over time (first-seen, last-seen, capabilities)

**Implementation**:
- JSON file: Platform-specific location
  - Windows: `%LOCALAPPDATA%\BobbysWorkshop\devices.json`
  - macOS: `~/.local/share/bobbys-workshop/devices.json`
  - Linux: `~/.local/share/bobbys-workshop/devices.json`
- Store: unique_key, first_seen, last_seen, capabilities, count
- Update on each scan

### Task 3: Integrate Cache into detect_devices()

**Goal**: Use cache to populate first_seen/last_seen

**Implementation**:
- Load cache at start of `detect_devices()`
- Match devices by unique_key
- Use cached first_seen if exists, otherwise use current time
- Update last_seen to current time
- Save cache after scan

---

## Files to Create/Modify

1. **New File**: `crates/bootforge-usb/libbootforge/src/usb/cache.rs`
   - Device cache structure
   - Load/save cache functions
   - Platform-specific cache path

2. **Modify**: `crates/bootforge-usb/libbootforge/src/usb/detect.rs`
   - Integrate cache loading
   - Update first_seen/last_seen from cache
   - Save cache after scan

3. **Modify**: `crates/bootforge-usb/libbootforge/src/usb/mod.rs`
   - Export cache module

4. **Update**: `Cargo.toml`
   - Add `dirs` dependency for platform paths (if needed)

---

## Next Steps

1. Create cache.rs module
2. Implement cache load/save
3. Integrate into detect_devices()
4. Test device fingerprinting
