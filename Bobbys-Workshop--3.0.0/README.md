# 🍄 SUPER BOBBY'S WORLD: WARP ZONES

**"All Secrets. All Devices. One World."**

Welcome to the hidden pipes of device management. This toolkit is built for those who operate at the frequency of the hardware.

## 🎮 The Four Kingdoms

- **🏰 Unlock Castle**: Automated bootloader and FRP authority
- **⚡ Flash Forge**: Sequential flashing for all major chipsets
- **🕳️ Abyssal Layer**: Raw hardware authority through EDL and SysCfg
- **📜 Shadow Logs**: Every move is recorded in the Question Block Archive

## 🎵 Secret Rooms

Three powerful "Secret Rooms" power this world:

- **🎵 Sonic Codex**: Audio forensic intelligence with neural enhancement
- **👻 Ghost Codex**: Stealth operations & identity protection
- **⚡ Pandora Codex**: Hardware manipulation & jailbreaking

---

## 🚀 Quick Start

To ignite the world, just run:

```bash
npm run world:start
```

### Windows
```powershell
# Run setup script
.\scripts\setup-windows.ps1

# Start backend (in one terminal)
.\scripts\start-backend.bat

# Start frontend (in another terminal)
.\scripts\start-frontend.bat
```

### Mac/Linux
```bash
# Run setup script
chmod +x scripts/setup-mac-linux.sh
./scripts/setup-mac-linux.sh

# Start backend (in one terminal)
./scripts/start-backend.sh

# Start frontend (in another terminal)
./scripts/start-frontend.sh
```

### Manual Setup
See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **FFmpeg** (for audio/video processing)
- **Git**

---

## 🎨 8-Bit UI Theme

Super Bobby's World features a retro Super Mario-inspired 8-bit aesthetic with power-up styled components:

### Available CSS Classes

- **`.pixel-card`** - Golden card with pixelated rendering and bold black borders
- **`.warp-pipe`** - Green pipe-styled terminal containers with inset shadows
- **`.btn-pixel`** - Retro red buttons with satisfying press-down effect
- **`.coin-block`** - Golden status blocks for metrics display
- **`.question-block`** - Mystery blocks with diagonal stripe patterns
- **`.power-star`** - Glowing animated containers for achievements
- **`.fire-flower`** - Flaming gradient containers for power modes

### Real-Time Progress Tracking

All device operations stream live progress through WebSocket connections:

- **Flash Operations**: Real-time percentage, transfer speed, and ETA
- **Device Detection**: Instant hotplug notifications
- **Authorization Events**: Live ADB authorization state changes
- **System Monitoring**: Continuous device state polling

WebSocket endpoints available at:
- `/ws/flash-progress` - Flash operation updates
- `/ws/hotplug` - Device connection events
- `/ws/monitor` - Device state monitoring

---

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Python FastAPI (audio processing) + Node.js Express (device management)
- **State**: Zustand
- **Auth**: Phoenix Key (custom authentication)

---

## 🎯 Features

### Sonic Codex
- Upload/URL extraction of audio/video
- Neural audio enhancement (DeepFilterNet)
- Whisper transcription (multi-language)
- Speaker diarization
- Live recording with spectrogram
- Multiple export formats (SRT, TXT, JSON, ZIP)

### Ghost Codex
- Metadata shredder (images, audio, video)
- Canary token generator (tripwire alerts)
- Burner persona vault (temp emails/phones)

### Pandora Codex
- Hardware detection (DFU, Recovery, Normal)
- DFU entry automation
- Jailbreak execution (Checkm8, Palera1n, Unc0ver)
- Firmware flashing

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Installation instructions
- [User Guides](./docs/) - User documentation for each room
- [API Reference](./docs/API_REFERENCE.md) - API endpoints
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Architecture & contribution

---

## 🧪 Testing

```bash
# Backend tests
npm run test:backend

# E2E tests
npm run test:e2e
```

---

## 🔐 Authentication

**Phoenix Key**: Use secret sequence `PHOENIX_RISES_2025` or gesture pattern to access Secret Rooms.

---

## ⚠️ Legal & Ethical

- **Consent-based only**: All audio transcription is for lawful, consent-based recordings
- **Owner devices**: Pandora Codex operations are for owner devices only
- **No surveillance**: Do not use for covert surveillance

---

## 📊 Project Status

**~95% Complete** - Production Ready

- ✅ Phase 1: Foundation
- ✅ Phase 2: Core Features
- ✅ Phase 3: Advanced Features
- ✅ Phase 4: Integration & Polish
- ✅ Phase 5: Testing & Documentation

---

## 🛠️ Development

```bash
# Install dependencies
npm install
cd backend && pip install -r requirements.txt

# Run development servers
npm run dev              # Frontend
uvicorn backend.main:app --reload  # Backend

# Build for production
npm run build
```

---

## 📝 License

See LICENSE file for details.

---

**Built with 🔥 in the Bronx**
