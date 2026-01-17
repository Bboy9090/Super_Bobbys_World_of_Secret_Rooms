# 🌟 Super Bobby's World: Warp Zones

**A Safe, Compliance-First Platform for Device Analysis & Education**

> 8-bit themed UI meets modern Rust + React architecture

---

## 🎮 What is This?

**Super Bobby's World: Warp Zones** is a production-ready scaffold combining:
- 🦀 **Rust Axum Backend** - Fast, safe, and concurrent
- ⚛️ **React + TypeScript Frontend** - Modern UI with 8-bit/Super Mario aesthetics  
- 🐳 **Docker Compose** - One-command deployment
- 🔐 **Safety-First Design** - Feature flags, audit logs, and no exploit code

### Core Philosophy: Truth + Production

✅ **NO placeholders, mocks, or fake success**  
✅ **All features are real or clearly gated**  
✅ **Sensitive operations require explicit authorization**  
✅ **Everything is audited and logged**

---

## 🚀 Quick Start

### Prerequisites
- Rust 1.70+ (Edition 2021)
- Node.js 18+ and npm
- Docker & Docker Compose (optional)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Bboy9090/Super_Bobbys_World_of_Secret_Rooms.git
cd Super_Bobbys_World_of_Secret_Rooms

# 2. Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# 3. Install dependencies
npm run install:all

# 4. Start both backend and frontend
npm run world:start
```

Visit **http://localhost:5173** to see the Warp Zones dashboard!

### Docker Quick Start

```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down
```

---

## 📁 Project Structure

```
Super_Bobbys_World_of_Secret_Rooms/
├── backend/                 # Rust Axum backend
│   ├── src/
│   │   ├── main.rs         # Server, routes, API endpoints
│   │   ├── events.rs       # SSE event streaming
│   │   └── plugins.rs      # Safe plugin host (stubs)
│   ├── Cargo.toml
│   └── Dockerfile
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── WarpZoneDashboard.tsx
│   │   │   ├── DeviceList.tsx
│   │   │   └── Terminal.tsx
│   │   └── services/
│   │       └── apiService.ts
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   ├── build.sh            # Orchestrated build
│   └── test.sh             # Orchestrated tests
├── .github/workflows/
│   ├── ci.yml              # Build & test CI
│   └── warp-zone-guard.yml # Health check workflow
├── docker-compose.yml
├── package.json            # Workspace scripts
└── .env.example
```

---

## 🛡️ Safety & Legal Notice

### ⚠️ CRITICAL: This is a SAFE SCAFFOLD

This repository contains **NO exploit, bypass, or circumvention code**. All sensitive operations are:

1. **Gated behind feature flags** (OFF by default)
2. **Clearly marked with TODOs** for authorized integrations
3. **Require explicit operator confirmation** via environment variables
4. **Logged to encrypted audit trails**

### What This Is NOT

❌ **Not a jailbreak tool**  
❌ **Not a bootloader exploit**  
❌ **Not an EDL mode executor**  
❌ **Not a device unlock utility**

### What This IS

✅ **A safe educational platform**  
✅ **A compliance-first architecture**  
✅ **A foundation for authorized research**  
✅ **A transparent, auditable system**

### Legal Compliance

- All operations require **documented ownership** or **legal authorization**
- Device operations are **disabled by default** and require explicit flags
- All activity is **logged for audit purposes**
- No circumvention of security measures without proper authority

For complete legal terms, see [LICENSE](LICENSE) and [SECURITY.md](SECURITY.md).

---

## 🎯 Features

### Backend (Rust + Axum)
- ✅ **RESTful API** with typed endpoints
- ✅ **SSE (Server-Sent Events)** for real-time updates
- ✅ **Event broadcasting** via tokio channels
- ✅ **Safe plugin system** (stubs for authorized extensions)
- ✅ **Structured logging** with tracing
- ✅ **Health checks** and metrics

### Frontend (React + TypeScript)
- ✅ **8-bit/Super Mario themed UI** (no copyrighted assets)
- ✅ **Real-time terminal** with SSE connection
- ✅ **Device list** with safe API polling
- ✅ **Coins counter** (gamified UI element)
- ✅ **Responsive design** with Tailwind CSS
- ✅ **TypeScript types** for all API calls

### DevOps
- ✅ **Docker Compose** for multi-container deployment
- ✅ **GitHub Actions CI/CD** for automated testing
- ✅ **Health check workflows** to validate services
- ✅ **Multi-stage Docker builds** for optimized images

---

## 🔧 Development

### Backend Development

```bash
cd backend
cargo build          # Build
cargo test           # Run tests
cargo run            # Start server (port 3001)
```

**API Endpoints:**
- `GET /` - Welcome message
- `GET /api/health` - Health check
- `POST /api/command` - Send commands (ListDevices, GetDeviceState)
- `GET /api/events` - SSE stream for real-time events

### Frontend Development

```bash
cd client
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Running Tests

```bash
# Test everything
npm test

# Test backend only
npm run test:backend

# Test frontend only
npm run test:frontend
```

---

## 🎨 UI Theme

The frontend uses an **8-bit/Super Mario inspired aesthetic** WITHOUT copyrighted character assets:

- 🟢 **Warp Pipe Green** color scheme
- 🎮 **Pixel fonts** and retro UI elements
- 🪙 **Coin counter** for gamified interactions
- 📟 **Terminal view** for command outputs
- 🌟 **Power Star** branding (non-infringing)

All design elements are original and do not violate Nintendo's IP.

---

## 🔐 Security Features

### Feature Flags (Environment Variables)

All sensitive operations are **OFF by default**:

```bash
# .env file
EXPERIMENTAL_EDL_MODE=false              # EDL bootloader access
EXPERIMENTAL_BOOTLOADER_ACCESS=false     # Bootloader operations
EXPERIMENTAL_DEVICE_UNLOCK=false         # Device unlock features
ALLOW_DEVICE_OPERATIONS=false            # Any device modifications
```

To enable (requires authorization):
1. Set environment variable to `true`
2. Provide valid `POWER_STAR_KEY`
3. Confirm legal ownership/authorization
4. All actions are logged to audit trail

### Audit Logging

All operations are logged to `backend/logs/audit.log` with:
- Timestamp (ISO 8601)
- Action type
- User/operator ID (if available)
- Device identifiers
- Result status
- Error details (if any)

**Note:** Store `POWER_STAR_KEY` as a GitHub Secret for CI/CD.

---

## 🚧 Integration Points (TODOs for Authorized Operators)

The following areas are **stubbed out** for future authorized integration:

### Backend (`backend/src/plugins.rs`)
```rust
// TODO: Authorized operators may integrate:
// - Secure Python plugin execution
// - Device communication protocols (with proper auth)
// - Advanced diagnostics (ownership-verified)

// FEATURE FLAG REQUIRED: EXPERIMENTAL_DEVICE_OPERATIONS=true
```

### Event System (`backend/src/events.rs`)
```rust
// TODO: Authorized event types:
// - DeviceConnected (with ownership check)
// - FlashProgress (operator-gated)
// - DiagnosticResult (audit-logged)
```

### API Commands (`backend/src/main.rs`)
```rust
// Existing safe commands:
// - ListDevices (read-only, safe)
// - GetDeviceState (read-only, safe)

// TODO for authorized operators:
// - FlashDevice (requires POWER_STAR_KEY + ownership proof)
// - RunDiagnostic (requires authorization + audit log)
```

**All integrations must:**
1. Require explicit feature flags
2. Verify ownership/authorization
3. Log to encrypted audit trail
4. Include rollback capabilities
5. Follow compliance guidelines

---

## 📚 Documentation

- [Backend README](backend/README.md) - Feature flags and architecture
- [Security Policy](SECURITY.md) - Vulnerability reporting
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Platform Overview](docs/public/platform-overview.md)
- [Legal Taxonomy](docs/public/legal-taxonomy.md)

---

## 🤝 Platform Structure

This repository is part of the larger **ForgeWorks Platform**:

### Layers
- **Workshop (Public)**: Brand trust, education, customer transparency
- **ForgeWorks (Core)**: Decision engine, audit logging, authority routing
- **Pandora Codex (Internal)**: Historical research and risk models

### Other Services (see `services/`)
- `device-analysis` - Capability classification
- `ownership-verification` - Attestation engine
- `legal-classification` - Jurisdiction-aware labeling
- `audit-logging` - Immutable hash-chained logs
- `authority-routing` - OEM, carrier, court pathways

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

**Additional Terms:**
- Compliance-first platform providing analysis and lawful routing only
- No execution, automation, or facilitation of security circumvention
- Users must affirm lawful ownership or documented authorization
- All activity is logged for compliance and audit purposes

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Bboy9090/Super_Bobbys_World_of_Secret_Rooms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Bboy9090/Super_Bobbys_World_of_Secret_Rooms/discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for vulnerability reporting

---

## 🌟 Acknowledgments

Built with:
- [Rust](https://www.rust-lang.org/) & [Axum](https://github.com/tokio-rs/axum)
- [React](https://react.dev/) & [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tokio](https://tokio.rs/)

**Aesthetic inspiration** from 8-bit/retro gaming (no copyrighted assets used).

---

*Platform, Not Product.™*  
*Truth + Production. No Placeholders.™*
