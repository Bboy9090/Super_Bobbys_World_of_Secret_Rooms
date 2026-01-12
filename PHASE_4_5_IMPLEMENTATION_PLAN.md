# Phase 4 & 5 Implementation Plan

**Date**: 2025-01-XX  
**Status**: Starting Phase 4 & 5 Implementation

---

## Phase 4: Frontend Integration

### Task 1: Update Frontend TypeScript Interfaces
**Goal**: Add first_seen and last_seen to DeviceRecord interface

**File**: `src/components/BootForgeUSBScanner.tsx`

**Changes**:
- Add `first_seen?: string` to DeviceRecord interface
- Add `last_seen?: string` to DeviceRecord interface
- These will come from the Rust CLI JSON output (which already includes them)

### Task 2: Update Frontend Component to Display Cache Info
**Goal**: Show first_seen/last_seen timestamps in device list

**File**: `src/components/BootForgeUSBScanner.tsx`

**Changes**:
- Display first_seen timestamp (formatted)
- Display last_seen timestamp (formatted)
- Show "First Seen" badge or indicator
- Show "Last Seen" time ago (e.g., "5 minutes ago")

### Task 3: Device Detail Panel Enhancement
**Goal**: Show detailed cache information in device detail view

**File**: `src/components/BootForgeUSBScanner.tsx`

**Changes**:
- Add cache section to device detail panel
- Show first_seen, last_seen, and calculated time difference
- Show device history info (if available)

---

## Phase 5: Audit Logging

### Task 1: Verify Audit Middleware is Applied
**Goal**: Ensure audit logging is active for bootforgeusb endpoints

**File**: `server/index.js` or wherever routes are registered

**Action**: Check if audit middleware is applied to bootforgeusb routes

### Task 2: Enhance Audit Logging for Device Scans
**Goal**: Log device scan operations with device information

**File**: `server/routes/v1/bootforgeusb.js`

**Changes**:
- Add explicit audit logging for scan operations
- Log device count, scan duration, etc.
- Include device serials (hashed) in audit log

### Task 3: Add Audit Log Viewing (Optional)
**Goal**: Allow viewing audit logs in UI (if needed)

**File**: New component or existing audit viewer

**Changes**:
- Create/update audit log viewer component
- Show device scan operations
- Filter by operation type, device, etc.

---

## Implementation Order

1. ✅ Phase 3: Device Cache (complete)
2. ⏳ Phase 4 Task 1: Update TypeScript interfaces
3. ⏳ Phase 4 Task 2: Update frontend component
4. ⏳ Phase 4 Task 3: Device detail panel (if time)
5. ⏳ Phase 5 Task 1: Verify audit middleware
6. ⏳ Phase 5 Task 2: Enhance audit logging
7. ⏳ Phase 5 Task 3: Audit log viewer (optional)

---

## Files to Modify

1. **Phase 4**:
   - `src/components/BootForgeUSBScanner.tsx` - Update interfaces and UI

2. **Phase 5**:
   - `server/routes/v1/bootforgeusb.js` - Add audit logging
   - `server/index.js` - Verify middleware (if needed)

---

## Notes

- Backend endpoint already calls Rust CLI which outputs first_seen/last_seen
- Just need to pass through to frontend and display
- Audit middleware already exists, just need to ensure it's applied
- Optional: Add explicit audit logging for device scans
