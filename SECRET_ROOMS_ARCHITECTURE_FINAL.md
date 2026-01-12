# Secret Rooms Architecture - Final Configuration

**Date**: 2025-01-XX  
**Status**: ✅ **ARCHITECTURE VERIFIED AND CORRECTED**

---

## Backend Separation

### Python FastAPI Backend (Port 8000)
**Secret Rooms - Advanced Modules**:
- ✅ `/api/v1/trapdoor/sonic/*` - Sonic Codex (audio forensic intelligence)
- ✅ `/api/v1/trapdoor/ghost/*` - Ghost Codex (metadata shredder, canary tokens, personas)
- ✅ `/api/v1/trapdoor/pandora/*` - Pandora Codex (hardware manipulation, DFU, jailbreak)
- ✅ `/api/v1/trapdoor/phoenix/*` - Phoenix Key authentication

**Status**: ✅ All components correctly configured to use port 8000

---

### Node.js Express Backend (Port 3001)
**Legacy Secret Rooms + Public Features**:
- ✅ `/api/v1/trapdoor/workflows` - Workflow execution (legacy - remains in Node.js)
- ✅ `/api/v1/trapdoor/logs/shadow` - Shadow logs (legacy - remains in Node.js)
- ✅ `/api/v1/trapdoor/unlock/*` - Unlock Chamber
- ✅ `/api/v1/trapdoor/bypass/*` - Bypass Laboratory
- ✅ `/api/v1/trapdoor/pandora/*` - Basic Pandora routes (different from Python version)
- ✅ Public features: USB enumeration, ADB, Fastboot, etc.

**Status**: ✅ All components correctly configured to use port 3001

---

## Component Configuration

### ✅ Components Using Python Backend (Port 8000)

1. **Sonic Codex** (`WizardFlow.tsx`):
   - Uses `API_CONFIG.BASE_URL` (port 8000)
   - Uses `apiRequest()` from `api-client.ts`
   - ✅ Correct

2. **Ghost Codex** (`GhostDashboard.tsx`):
   - Uses `getAPIUrl()` from `apiConfig.ts`
   - ✅ Correct

3. **Pandora Codex** (`ChainBreakerDashboard.tsx`):
   - Uses `API_CONFIG` and `apiRequest()`
   - ✅ Correct

4. **Phoenix Key** (auth components):
   - Uses `API_CONFIG.ENDPOINTS.PHOENIX_*`
   - ✅ Correct

### ✅ Components Using Node.js Backend (Port 3001)

1. **WorkflowExecutionConsole.tsx**:
   - Uses `http://localhost:3001/api/v1/trapdoor/workflows`
   - ✅ Correct (workflows are in Node.js backend)

2. **TrapdoorControlPanel.tsx**:
   - Uses `http://localhost:3001/api/v1/trapdoor/${endpoint}`
   - ✅ Correct (legacy endpoints in Node.js backend)

3. **ShadowLogsViewer.tsx**:
   - Uses `http://localhost:3001/api/v1/trapdoor/logs/shadow`
   - ✅ Correct (shadow logs are in Node.js backend)

---

## Integration Status

### ✅ Complete Integration

**Frontend Components**:
- ✅ All Secret Rooms (Sonic/Ghost/Pandora) components integrated
- ✅ Phoenix Key authentication integrated
- ✅ Room navigation and transitions working
- ✅ All components use correct backend ports

**Backend Services**:
- ✅ Python FastAPI backend exists with all routes
- ✅ Node.js Express backend exists with legacy routes
- ✅ Clear separation of concerns

**E2E Testing**:
- ✅ E2E test folder exists with test files
- ✅ Tests configured for all three codex modules

---

## Connection Flow

### Secret Rooms (Sonic/Ghost/Pandora)

1. **User navigates to Secret Rooms** → `WorkbenchSecretRooms.tsx`
2. **Phoenix Key authentication** → Python backend (port 8000) → `/api/v1/trapdoor/phoenix/unlock`
3. **Room selection** → User selects Sonic/Ghost/Pandora
4. **API calls** → Python backend (port 8000) → `/api/v1/trapdoor/{codex}/*`
5. **Response** → Frontend updates UI

### Legacy Secret Rooms (Workflows/Logs)

1. **Workflow execution** → Node.js backend (port 3001) → `/api/v1/trapdoor/workflows`
2. **Shadow logs** → Node.js backend (port 3001) → `/api/v1/trapdoor/logs/shadow`
3. **Unlock/Bypass** → Node.js backend (port 3001) → `/api/v1/trapdoor/{operation}/*`

---

## Startup Requirements

### To Run Secret Rooms:

1. **Python FastAPI Backend** (port 8000) - **REQUIRED**:
   ```powershell
   .\start-backend.ps1
   # Or: uvicorn backend.main:app --reload --port 8000
   ```

2. **Frontend Dev Server** (port 5000) - **REQUIRED**:
   ```powershell
   npm run dev
   ```

3. **Node.js Express Backend** (port 3001) - **OPTIONAL**:
   - Only needed for workflows, shadow logs, unlock, bypass
   - NOT required for Sonic/Ghost/Pandora/Phoenix

---

## Summary

**Architecture**: ✅ **CORRECTLY CONFIGURED**

- Python FastAPI (port 8000): Sonic, Ghost, Pandora, Phoenix ✅
- Node.js Express (port 3001): Workflows, Shadow Logs, Unlock, Bypass ✅
- All components use correct backend ports ✅
- Integration complete and ready for testing ✅

**Status**: ✅ **READY FOR TESTING**
