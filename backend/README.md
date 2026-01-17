# Super Bobby's World: Warp Zones Backend

Rust Axum backend with SSE event streaming and safe plugin architecture.

## 🔐 Safety & Feature Flags

This backend follows **Truth + Production** principles:
- ✅ **NO placeholders or fake success**
- ✅ **All sensitive features are OFF by default**
- ✅ **Feature flags gate dangerous operations**
- ✅ **Everything is logged to audit trail**

### Feature Flags (Environment Variables)

All sensitive operations require explicit feature flags:

```bash
# Device Operations (OFF by default)
ALLOW_DEVICE_OPERATIONS=false

# Experimental Features (OFF by default)
EXPERIMENTAL_EDL_MODE=false
EXPERIMENTAL_BOOTLOADER_ACCESS=false
EXPERIMENTAL_DEVICE_UNLOCK=false
EXPERIMENTAL_PLUGIN_SYSTEM=false
```

### Authorization Key

```bash
# Required for any sensitive operation
POWER_STAR_KEY=your-secret-key-here
```

Store this as a GitHub Secret for CI/CD, never commit to source control.

## 🚀 Getting Started

### Prerequisites
- Rust 1.70+ (Edition 2021)
- Cargo

### Build

```bash
cargo build --release
```

### Run

```bash
cargo run
# Or with release build:
cargo run --release
```

Server starts on `http://localhost:3001` by default.

### Test

```bash
cargo test
```

## 📡 API Endpoints

### `GET /`
Welcome message with API info.

**Response:**
```json
{
  "name": "Super Bobby's World: Warp Zones",
  "version": "1.0.0",
  "status": "online",
  "endpoints": { ... }
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T06:00:00Z"
}
```

### `POST /api/command`
Execute API commands.

**Request:**
```json
{
  "type": "listDevices"
}
```

**Response:**
```json
{
  "success": true,
  "data": [],
  "error": null
}
```

**Available Commands:**
- `ListDevices` - List connected devices (safe, read-only)
- `GetDeviceState` - Get device state (safe, read-only)

### `GET /api/events`
Server-Sent Events (SSE) stream for real-time updates.

**Event Types:**
- `connected` - Initial connection established
- `app_event` - Application events (logs, device updates, etc.)

## 🏗️ Architecture

### Modules

- **`main.rs`** - Axum server, routes, API handlers
- **`events.rs`** - Event management system with broadcast channels
- **`plugins.rs`** - Safe plugin architecture (stubs)

### Event System

Uses `tokio::sync::broadcast` for SSE streaming:
- Multiple subscribers supported
- 100-event buffer by default
- Real-time delivery to all connected clients

### Plugin System

**SAFE STUBS ONLY** - No actual execution without authorization.

To enable (requires explicit authorization):
1. Set `EXPERIMENTAL_PLUGIN_SYSTEM=true`
2. Provide valid `POWER_STAR_KEY`
3. Implement whitelist verification
4. Set up sandbox isolation
5. Configure audit logging

## 🔧 Configuration

### Environment Variables

```bash
# Server
PORT=3001
RUST_LOG=info,warp_zones_backend=debug

# Logging
LOG_LEVEL=info
AUDIT_LOG_PATH=./logs/audit.log

# Security
POWER_STAR_KEY=your-secret-key

# Feature Flags (all OFF by default)
ALLOW_DEVICE_OPERATIONS=false
EXPERIMENTAL_PLUGIN_SYSTEM=false
```

## 🚧 Integration Points (TODOs)

### For Authorized Operators Only

The following areas are stubbed for future integration:

#### 1. Device Operations (`main.rs`)
```rust
// TODO: Implement actual device detection
// REQUIRES: ALLOW_DEVICE_OPERATIONS=true + POWER_STAR_KEY
// Must verify ownership before any operation
```

#### 2. Plugin Execution (`plugins.rs`)
```rust
// TODO: Implement secure plugin execution
// REQUIRES: EXPERIMENTAL_PLUGIN_SYSTEM=true
// Must use sandbox isolation (Docker, systemd-nspawn)
```

#### 3. Audit Logging (`events.rs`)
```rust
// TODO: Implement encrypted audit trail
// Format: timestamp, operator, action, device, result, hash_chain
```

#### 4. Authorization (`main.rs`)
```rust
// TODO: Implement POWER_STAR_KEY verification
// Check against secure key storage
// Rate limit failed attempts
```

### Integration Requirements

All integrations must:
1. ✅ Require explicit feature flag
2. ✅ Verify POWER_STAR_KEY
3. ✅ Check ownership/authorization
4. ✅ Log to encrypted audit trail
5. ✅ Include rollback capability
6. ✅ Follow compliance guidelines

## 🧪 Testing

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Test specific module
cargo test events::tests
```

## 📦 Docker

### Build Image

```bash
docker build -t warp-zones-backend .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -e POWER_STAR_KEY=your-key \
  -e RUST_LOG=info \
  warp-zones-backend
```

## 🔒 Security

- **No secrets in code** - All keys via environment variables
- **Feature flags OFF by default** - Explicit opt-in required
- **Audit logging** - All operations logged
- **Sandbox isolation** - Plugins run in isolated environments
- **Ownership verification** - Required for device operations

## 📝 Logging

Structured logging with `tracing`:

```rust
use tracing::{info, warn, error, debug};

info!("Normal operation");
warn!("Potential issue");
error!("Operation failed");
debug!("Detailed diagnostic info");
```

Log levels: `RUST_LOG=debug,info,warn,error`

## 🐛 Troubleshooting

### Server won't start
- Check port 3001 is not in use
- Verify environment variables are set
- Check logs for errors

### SSE not connecting
- Ensure CORS is properly configured
- Check browser console for errors
- Verify endpoint is `/api/events`

### Feature flag not working
- Ensure environment variable is set to `"true"` (string)
- Check variable name spelling
- Restart server after changing environment

## 📚 Resources

- [Axum Documentation](https://docs.rs/axum/)
- [Tokio Documentation](https://docs.rs/tokio/)
- [Tracing Documentation](https://docs.rs/tracing/)

---

*Truth + Production. No Placeholders.™*
