# Super Bobby's World of Warp Pipes - Architecture Blueprint

## Overview

This document describes the production-grade architecture for the device diagnostics and repair platform. The system uses an embedded Python runtime with Rust authority, Tauri desktop container, and strict health gating.

---

## Locked Decisions

- **Runtime choice**: Embedded Python runtime (not PyInstaller)
- **IPC**: Localhost HTTP (127.0.0.1) with ephemeral port
- **Authority**: Rust (Pandora/Crucible) owns policy & decisions
- **Python role**: Stateless worker only
- **Lifecycle**: Auto-launched by Tauri, killed on app exit
- **UI**: Hard-gated on backend health

---

## 1. Python Service - API Schema (V1)

### Binding & Security
- Bind: 127.0.0.1
- Port: ephemeral (assigned at launch)
- No external network access
- No persistence beyond process lifetime

### Endpoints

```
GET  /health
POST /inspect/basic
POST /inspect/deep
POST /logs/collect
POST /report/format
```

### Common Headers

```
X-Session-Id: <uuid>
X-Policy-Mode: public
Content-Type: application/json
```

### /health (required for UI unlock)

Response:
```json
{
  "status": "ok",
  "version": "py-worker-1.0.0",
  "uptime_ms": 12345
}
```

### /inspect/basic

Request:
```json
{
  "device_id": "dev_001",
  "platform": "ios",
  "hints": {
    "connection": "usb"
  }
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "activation_locked": true,
    "mdm_enrolled": false,
    "frp_locked": null,
    "efi_locked": null
  },
  "warnings": []
}
```

### /inspect/deep

Request:
```json
{
  "device_id": "dev_001",
  "platform": "ios"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "signals": ["battery_state", "storage_health"],
    "notes": "deep probe completed"
  },
  "warnings": ["partial_data"]
}
```

### /logs/collect

Request:
```json
{
  "device_id": "dev_001",
  "scope": "default"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "log_count": 12
  }
}
```

### /report/format

Request:
```json
{
  "report_id": "rep_abc123",
  "format": "pdf"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "artifact": "report.pdf"
  }
}
```

**Hard rule**: Python never mutates devices. It returns observations only.

---

## 2. Rust ↔ Python Contracts (Type-Locked)

### Rust request/response structs

```rust
// common.rs
#[derive(Serialize)]
pub struct PyRequest<T> {
  pub device_id: String,
  pub platform: String,
  pub payload: T,
}

#[derive(Deserialize)]
pub struct PyResponse<T> {
  pub ok: bool,
  pub data: Option<T>,
  pub warnings: Vec<String>,
}

// inspect.rs
#[derive(Serialize)]
pub struct InspectBasicPayload {
  pub hints: serde_json::Value,
}

#[derive(Deserialize)]
pub struct InspectFlags {
  pub activation_locked: Option<bool>,
  pub mdm_enrolled: Option<bool>,
  pub frp_locked: Option<bool>,
  pub efi_locked: Option<bool>,
}
```

### Rust call pattern (authoritative)

```rust
policy.ensure_allowed("inspect_basic")?;

let res: PyResponse<InspectFlags> =
  py_client.post("/inspect/basic", req).await?;

let flags = res.data.unwrap_or_default();
```

Policy is checked before the call. Evidence is written after the call.

---

## 3. Python Service Structure

```
python/
├── app/
│   ├── main.py        # server + lifecycle
│   ├── inspect.py     # handlers
│   ├── logs.py
│   ├── report.py
│   ├── policy.py      # mirror-only (refusal, never escalation)
│   └── health.py
├── requirements.txt   # pinned, minimal
└── runtime/           # embedded interpreter files
```

### Python rules
- No REPL
- No pip
- No shell
- No user scripts
- Stateless handlers

---

## 4. Tauri Auto-Launcher Behavior

### What happens at app start
1. Resolve embedded Python path
2. Spawn worker with args:
   - `--data-dir <app_data>`
   - `--policy-mode public`
   - `--port auto`
3. Poll /health (timeout 5s)
4. If healthy → unlock UI
5. If not → show blocking error

### What happens at app exit
- Send SIGTERM
- Wait (graceful)
- SIGKILL if needed

No background daemons. Ever.

---

## 5. UI Health & Readiness Gating

### App states
- BOOTING
- BACKEND_READY
- BACKEND_FAILED

### UI behavior
- BOOTING: splash + spinner ("Initializing engine...")
- BACKEND_READY: full navigation enabled
- BACKEND_FAILED: locked screen with retry/quit

### Inspect button gating
Disabled until:
- backend healthy
- policy allows workflow
- license allows capability

UI cannot bypass this.

---

## 6. Why Embedded Python (Final Call)

### Embedded Runtime (Chosen)
**Pros:**
- Small, auditable surface
- Predictable versions
- Easier compliance
- Faster cold start
- Clear file layout

**Cons:**
- Slightly more setup once (worth it)

### PyInstaller (Rejected)
- Large binaries
- Harder audits
- Slower iteration
- Less transparent

Decision stands: Embedded runtime.

---

## 7. Build & Packaging Notes

- Bundle Python under app resources
- Exclude dev tooling
- Sign binaries
- CI builds public artifacts only
- Custodial artifacts never referenced

---

## 8. Final Implementation Order

1. Implement /health in Python
2. Wire Rust client + structs
3. Add Tauri launcher
4. Gate UI on health
5. Add policy checks
6. Add evidence writes
7. Ship MVP

---

## Done Checklist

- [ ] App opens → backend starts → UI unlocks
- [ ] Killing app kills backend
- [ ] Inspect produces report
- [ ] No shell access anywhere
- [ ] No system Python dependency
- [ ] Policy blocks anything outside scope

---

## Rust HTTP Client (Authoritative Layer)

### Dependencies (Cargo.toml)

```toml
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
portpicker = "0.1"
```

### Shared structs

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize)]
pub struct PyInspectRequest<T> {
    pub device_id: String,
    pub platform: String,
    pub payload: T,
}

#[derive(Deserialize)]
pub struct PyResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub warnings: Vec<String>,
}

#[derive(Deserialize, Default)]
pub struct InspectFlags {
    pub activation_locked: Option<bool>,
    pub mdm_enrolled: Option<bool>,
    pub frp_locked: Option<bool>,
    pub efi_locked: Option<bool>,
}
```

### Python client wrapper (Rust)

```rust
pub struct PyWorkerClient {
    base_url: String,
    client: reqwest::Client,
}

impl PyWorkerClient {
    pub fn new(port: u16) -> Self {
        Self {
            base_url: format!("http://127.0.0.1:{}", port),
            client: reqwest::Client::new(),
        }
    }

    pub async fn health(&self) -> anyhow::Result<()> {
        let res = self.client
            .get(format!("{}/health", self.base_url))
            .send()
            .await?;

        if !res.status().is_success() {
            anyhow::bail!("Python backend unhealthy");
        }
        Ok(())
    }

    pub async fn inspect_basic(
        &self,
        device_id: &str,
        platform: &str,
    ) -> anyhow::Result<InspectFlags> {
        let req = PyInspectRequest {
            device_id: device_id.to_string(),
            platform: platform.to_string(),
            payload: serde_json::json!({}),
        };

        let res: PyResponse<InspectFlags> = self.client
            .post(format!("{}/inspect/basic", self.base_url))
            .json(&req)
            .send()
            .await?
            .json()
            .await?;

        if !res.ok {
            anyhow::bail!("Inspect failed");
        }

        Ok(res.data.unwrap_or_default())
    }
}
```

---

## Tauri Auto-Launcher

### src-tauri/src/backend.rs

```rust
use std::process::{Child, Command};
use std::sync::Mutex;

static PY_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

pub fn launch_python_backend(app_dir: &std::path::Path) -> anyhow::Result<u16> {
    let python_path = app_dir.join("python").join("bin").join("python");
    let script_path = app_dir.join("python").join("app").join("main.py");

    let port = pick_free_port();

    let child = Command::new(python_path)
        .arg(script_path)
        .arg("--port")
        .arg(port.to_string())
        .spawn()?;

    *PY_PROCESS.lock().unwrap() = Some(child);

    Ok(port)
}

pub fn shutdown_python_backend() {
    if let Some(mut child) = PY_PROCESS.lock().unwrap().take() {
        let _ = child.kill();
    }
}

fn pick_free_port() -> u16 {
    portpicker::pick_unused_port().expect("No free ports")
}
```

### src-tauri/src/main.rs

```rust
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path_resolver().resource_dir().unwrap();

            let port = launch_python_backend(&app_dir)
                .expect("Failed to launch backend");

            app.manage(port);

            Ok(())
        })
        .on_window_event(|_, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                shutdown_python_backend();
            }
        })
        .run(tauri::generate_context!())
        .expect("error running app");
}
```

---

## Installers & Signing

### macOS

**Build:**
```bash
pnpm tauri build
```

**Sign:**
```bash
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Company" \
  SuperBobbys.app
```

**Notarize:**
```bash
xcrun notarytool submit SuperBobbys.dmg \
  --apple-id YOUR_ID \
  --team-id TEAM_ID \
  --password APP_PASSWORD \
  --wait
```

**Staple:**
```bash
xcrun stapler staple SuperBobbys.app
```

### Windows

**Build:**
```bash
pnpm tauri build
```

**Sign:**
```bash
signtool sign /fd SHA256 /a SuperBobbys.exe
```

**Installer:**
- Use NSIS or MSI
- No admin rights required
- Installs per-user

### Linux

- AppImage
- No system install
- No root required

---

## Final Build Checklist

- [ ] Python /health works
- [ ] Tauri spawns backend
- [ ] UI waits for health
- [ ] Closing app kills backend
- [ ] Rust enforces policy before calls
- [ ] Python never mutates devices
- [ ] Public builds contain no private assets
- [ ] App is signed

---

## Repository

**GitHub**: https://github.com/Bboy9090/Super_Bobbys_World_of_Secret_Rooms
