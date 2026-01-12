# Secret Rooms Integration Status Report: Sonic/Ghost/Pandora Codex

**Date**: 2025-01-XX  
**Status**: ⚠️ **PARTIALLY INTEGRATED - BACKEND CONNECTION ISSUES FOUND**

---

## Executive Summary

**Current State**: 
- ✅ Frontend components exist and are integrated into WorkbenchSecretRooms
- ✅ Python FastAPI backend exists with all three codex modules
- ✅ E2E test folder exists with test files
- ⚠️ **CRITICAL ISSUE**: Frontend uses wrong backend URL (port 3001 vs 8000)
- ⚠️ **CRITICAL ISSUE**: Some components use hardcoded URLs instead of apiConfig
- ⚠️ **CRITICAL ISSUE**: Python backend must be running separately

---

## Architecture Overview

### Two Separate Backends

**Python FastAPI Backend** (Port 8000):
- ✅ Location: `backend/main.py`
- ✅ Routes:
  - `/api/v1/trapdoor/sonic/*` - Sonic Codex
  - `/api/v1/trapdoor/ghost/*` - Ghost Codex
  - `/api/v1/trapdoor/pandora/*` - Pandora Codex
  - `/api/v1/trapdoor/phoenix/*` - Phoenix Key auth
- ✅ Startup: `start-backend.ps1` or `uvicorn backend.main:app --reload --port 8000`
- ✅ Status: **Must be running separately**

**Node.js Express Backend** (Port 3001):
- ✅ Location: `server/index.js`
- ✅ Has `/api/v1/trapdoor/*` routes
- ✅ Routes: unlock, workflows, logs, bypass, pandora
- ⚠️ **Note**: Pandora routes in Node.js backend are DIFFERENT from Python backend
- ⚠️ **No proxy**: Node.js backend does NOT proxy to Python backend

---

## Frontend Configuration

### API Configuration (`src/lib/apiConfig.ts`)

**Base URL Logic**:
```typescript
// Priority: VITE_API_URL > Tauri detection > default (8000 for Python FastAPI)
// Default: http://localhost:8000 (Python FastAPI)
```

**Endpoints Defined**:
- ✅ PHOENIX_UNLOCK, PHOENIX_VALIDATE, PHOENIX_REVOKE
- ✅ SONIC_UPLOAD, SONIC_JOBS, SONIC_JOB_DETAILS, etc.
- ✅ GHOST_SHRED, GHOST_CANARY_GENERATE, etc.
- ✅ PANDORA_HARDWARE_STATUS, PANDORA_DFU_ENTER, etc.

**Status**: ✅ Correctly configured for port 8000 (Python backend)

---

## Frontend Components

### ✅ Integrated Components

**WorkbenchSecretRooms.tsx**:
- ✅ Imports all three codex components
- ✅ Phoenix Key authentication integrated
- ✅ Room transitions implemented
- ✅ Uses Zustand stores

**Sonic Codex** (`src/components/sonic/WizardFlow.tsx`):
- ✅ Uses `API_CONFIG.BASE_URL` and `API_CONFIG.ENDPOINTS.SONIC_*`
- ✅ Uses `apiRequest()` from `api-client.ts`
- ✅ Should connect to port 8000 (Python backend)

**Ghost Codex** (`src/components/ghost/GhostDashboard.tsx`):
- ✅ Main dashboard component exists
- ✅ Tabs: MetadataShredder, CanaryDashboard, PersonaVault
- ✅ Should use `getAPIUrl()` from apiConfig

**Pandora Codex** (`src/components/pandora/ChainBreakerDashboard.tsx`):
- ✅ Uses `API_CONFIG` and `apiRequest()`
- ✅ Should connect to port 8000 (Python backend)

### ⚠️ Components with Issues

**WorkflowExecutionConsole.tsx**:
- ⚠️ Uses hardcoded: `http://localhost:3001/api/trapdoor/workflows`
- ❌ Should use: `getAPIUrl(API_CONFIG.ENDPOINTS.TRAPDOOR_WORKFLOWS)`
- ❌ Wrong port (3001 instead of 8000)

**TrapdoorControlPanel.tsx**:
- ⚠️ Uses hardcoded: `http://localhost:3001/api/trapdoor/${endpoint}`
- ❌ Should use: `getAPIUrl()` helper
- ❌ Wrong port (3001 instead of 8000)

**Other components**:
- Some use port 3001 (Node.js backend)
- Some use port 8000 (Python backend)
- **Inconsistent**

---

## E2E Testing

**E2E Folder** (`tests/e2e/`):
- ✅ Exists with test files
- ✅ Test files: `01-authentication.spec.ts`, `02-sonic-codex.spec.ts`, `03-ghost-codex.spec.ts`, `04-pandora-codex.spec.ts`
- ✅ Setup file: `setup.ts` with MockBackend class
- ✅ Tests mock backend responses (don't require real backend)
- ⚠️ Tests use port 5000 (frontend dev server)
- ⚠️ Tests mock backend (don't test real Python backend integration)

**Status**: ✅ E2E tests exist but mock backend (not real integration)

---

## Integration Issues Found

### Issue 1: ⚠️ **WRONG BACKEND PORT** (CRITICAL)

**Problem**:
- Some components use `http://localhost:3001` (Node.js backend)
- But Secret Rooms (Sonic/Ghost/Pandora) run on Python FastAPI (port 8000)
- Node.js backend does NOT have Sonic/Ghost routes

**Affected Files**:
- `WorkflowExecutionConsole.tsx` - Uses port 3001
- `TrapdoorControlPanel.tsx` - Uses port 3001
- Some other components - Use port 3001

**Impact**: These components will fail when Python backend is on port 8000

**Fix Required**: Update all components to use `getAPIUrl()` from apiConfig (port 8000)

---

### Issue 2: ⚠️ **NO PROXY MIDDLEWARE** (CRITICAL)

**Problem**:
- Node.js backend does NOT proxy requests to Python backend
- Frontend must connect directly to Python backend (port 8000)
- But some components still use port 3001 (Node.js)

**Impact**: Components using port 3001 won't work for Secret Rooms

**Options**:
- Option A: Update all components to use port 8000 (Python backend) directly
- Option B: Add proxy middleware in Node.js backend to forward `/api/v1/trapdoor/sonic|ghost|pandora` to Python backend
- Option C: Move all Secret Rooms routes to Node.js backend (not recommended - Python has better implementations)

**Recommendation**: Option A (update components to use port 8000 directly)

---

### Issue 3: ⚠️ **DUAL BACKEND CONFUSION**

**Problem**:
- Two backends (Node.js on 3001, Python on 8000)
- Both have `/api/v1/trapdoor/*` routes
- But different routes in each:
  - Node.js: unlock, workflows, logs, bypass, pandora (basic)
  - Python: sonic, ghost, pandora (advanced), phoenix

**Impact**: Confusion about which backend handles what

**Solution**: Clear separation:
- Node.js (port 3001): Public features (USB enumeration, ADB, Fastboot, etc.)
- Python (port 8000): Secret Rooms (Sonic, Ghost, Pandora, Phoenix)

---

## Connection Sequence

### How It Should Work

1. **User navigates to Secret Rooms**:
   - `WorkbenchSecretRooms.tsx` loads
   - Shows Phoenix Key authentication

2. **Phoenix Key Authentication**:
   - `PhoenixKey.tsx` component
   - Calls `/api/v1/trapdoor/phoenix/unlock` (Python backend, port 8000)
   - Gets token, stores in Zustand store

3. **Room Navigation**:
   - User selects room (Sonic/Ghost/Pandora)
   - `WorkbenchSecretRooms.tsx` renders appropriate component

4. **API Calls**:
   - Components use `getAPIUrl(API_CONFIG.ENDPOINTS.SONIC_*)` (port 8000)
   - Include token in headers: `X-Secret-Room-Passcode`
   - Connect directly to Python FastAPI backend

5. **Backend Response**:
   - Python FastAPI processes request
   - Returns JSON response
   - Frontend updates UI

### How It Currently Works (with bugs)

1. ✅ User navigates to Secret Rooms
2. ✅ Phoenix Key authentication
3. ✅ Room navigation
4. ⚠️ **Some components use port 3001 (wrong)**
5. ⚠️ **Some components use port 8000 (correct)**
6. ⚠️ **Inconsistent**

---

## E2E Folder Status

**Location**: `tests/e2e/`

**Files**:
- ✅ `01-authentication.spec.ts` - Phoenix Key auth tests
- ✅ `02-sonic-codex.spec.ts` - Sonic Codex tests
- ✅ `03-ghost-codex.spec.ts` - Ghost Codex tests
- ✅ `04-pandora-codex.spec.ts` - Pandora Codex tests
- ✅ `05-mobile-responsive.spec.ts` - Mobile tests
- ✅ `setup.ts` - Test setup with MockBackend

**Status**: ✅ E2E tests exist and are configured

**Note**: Tests mock backend (don't require real Python backend running)

---

## Startup Requirements

### To Run Secret Rooms, You Need:

1. ✅ **Python FastAPI Backend** (port 8000):
   ```powershell
   # Windows
   .\start-backend.ps1
   
   # Or manually
   cd backend
   .\venv\Scripts\activate
   uvicorn backend.main:app --reload --port 8000
   ```

2. ✅ **Frontend Dev Server** (port 5000):
   ```powershell
   npm run dev
   ```

3. ⚠️ **Node.js Backend** (port 3001) - Optional for Secret Rooms:
   - Only needed for public features (USB enumeration, ADB, Fastboot)
   - NOT needed for Secret Rooms (Sonic/Ghost/Pandora)

---

## Integration Completeness

### ✅ What's Working

1. ✅ Python FastAPI backend exists with all routes
2. ✅ Frontend components exist and are integrated
3. ✅ Phoenix Key authentication integrated
4. ✅ Room navigation and transitions working
5. ✅ Zustand stores for state management
6. ✅ E2E test folder with test files
7. ✅ API configuration points to port 8000

### ⚠️ What's Not Working

1. ⚠️ Some components use wrong port (3001 instead of 8000)
2. ⚠️ Some components use hardcoded URLs instead of apiConfig
3. ⚠️ Python backend must be started separately (easy to forget)
4. ⚠️ No unified startup script for both backends

### ❌ What's Missing

1. ❌ No proxy middleware (frontend must connect directly to Python backend)
2. ❌ No unified startup script (must start Python backend separately)
3. ❌ Inconsistent API URL usage across components
4. ❌ No health check to verify Python backend is running

---

## Recommendations

### Immediate Fixes (Required)

1. **Fix API URLs**:
   - Update `WorkflowExecutionConsole.tsx` to use `getAPIUrl()`
   - Update `TrapdoorControlPanel.tsx` to use `getAPIUrl()`
   - Search for all hardcoded `http://localhost:3001/api/trapdoor` and replace with `getAPIUrl()`

2. **Verify Python Backend Running**:
   - Add health check in frontend to verify Python backend (port 8000)
   - Show error if Python backend not available

3. **Unified Startup Script**:
   - Create script to start both backends
   - Or add Node.js backend proxy to Python backend

### Long-Term Improvements (Optional)

1. **Add Proxy Middleware** (Option B):
   - Add http-proxy-middleware to Node.js backend
   - Proxy `/api/v1/trapdoor/sonic|ghost|pandora|phoenix` to Python backend (port 8000)
   - Frontend only connects to Node.js backend (port 3001)
   - Node.js backend proxies to Python backend

2. **Health Check Integration**:
   - Check Python backend health on frontend startup
   - Show warning if Python backend not available
   - Guide user to start Python backend

---

## Summary

**Integration Status**: ⚠️ **PARTIALLY INTEGRATED**

**Working**:
- ✅ Frontend components integrated
- ✅ Python backend exists with all routes
- ✅ E2E tests exist
- ✅ Phoenix Key authentication working

**Not Working**:
- ⚠️ Some components use wrong port (3001 instead of 8000)
- ⚠️ Inconsistent API URL usage
- ⚠️ Python backend must be started separately

**Action Required**:
1. Fix API URLs in components (use `getAPIUrl()` from apiConfig)
2. Ensure Python backend is running on port 8000
3. Test Secret Rooms functionality end-to-end

**Overall Assessment**: Architecture is correct (separate backends), but some components need URL fixes to work properly.
