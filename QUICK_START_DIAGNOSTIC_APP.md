# Quick Start Guide - Diagnostic & Repair App

This guide will help you get the diagnostic and repair application up and running quickly.

## Prerequisites

### Required Tools

- **Node.js 20+** with npm
- **Flutter SDK 3.0+** 
- **Android Platform Tools** (ADB) - For Android diagnostics
- **libimobiledevice** (Optional) - For iOS diagnostics
- **Git** - For version control

### Installation

#### Node.js & npm
```bash
# Download from https://nodejs.org/
# Or use package manager
# macOS:
brew install node

# Linux:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Flutter
```bash
# Download from https://flutter.dev/docs/get-started/install
# Or use package manager
# macOS:
brew install --cask flutter

# Verify installation
flutter doctor
```

#### Android Platform Tools
```bash
# macOS:
brew install android-platform-tools

# Linux:
sudo apt install android-tools-adb android-tools-fastboot

# Windows:
# Download from https://developer.android.com/studio/releases/platform-tools
```

#### libimobiledevice (iOS Support)
```bash
# macOS:
brew install libimobiledevice

# Linux:
sudo apt install libimobiledevice-utils
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/Super_Bobbys_World_of_Secret_Rooms.git
cd Super_Bobbys_World_of_Secret_Rooms
```

### 2. Start Backend Server

```bash
cd Bobbys-Workshop--3.0.0/server
npm install
npm start
```

Backend will start on `http://localhost:3001`

### 3. Run Flutter Mobile App

```bash
cd mobile_app

# Install dependencies
flutter pub get

# Run on connected device/emulator
flutter run

# Or specify platform
flutter run -d android
flutter run -d ios
```

### 4. Test Diagnostic Scripts

#### Android Diagnostics
```bash
# Connect Android device via USB
# Enable USB debugging on device

# Run diagnostics
node scripts/android_diagnostics.mjs

# Or specific tests
node scripts/android_diagnostics.mjs battery
node scripts/android_diagnostics.mjs hardware
node scripts/android_diagnostics.mjs network
```

#### iOS Diagnostics
```bash
# Connect iOS device via USB
# Trust computer on device

# Run diagnostics
node scripts/ios_diagnostics.mjs

# Or specific tests
node scripts/ios_diagnostics.mjs battery
node scripts/ios_diagnostics.mjs hardware
node scripts/ios_diagnostics.mjs network
```

---

## API Endpoints Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Repair Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets` | List all tickets |
| GET | `/tickets/:id` | Get specific ticket |
| POST | `/tickets` | Create new ticket |
| PUT | `/tickets/:id` | Update ticket |
| DELETE | `/tickets/:id` | Delete ticket |
| POST | `/tickets/:id/notes` | Add note to ticket |
| GET | `/tickets/api/stats` | Get ticket statistics |

### Diagnostics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diagnostics/battery` | Battery diagnostics |
| GET | `/diagnostics/hardware` | Hardware diagnostics |
| GET | `/diagnostics/network` | Network diagnostics |
| GET | `/diagnostics/logs` | System logs |

### Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adb/devices` | List connected devices |
| POST | `/adb/enter-fastboot` | Enter Fastboot mode |
| POST | `/adb/enter-recovery` | Enter Recovery mode |
| POST | `/ios/enter-dfu` | Enter DFU mode |

### Firmware Flashing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flash/firmware` | Flash firmware to device |

---

## Example API Calls

### Create Repair Ticket

```bash
curl -X POST http://localhost:3001/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deviceId": "ABC123",
    "deviceModel": "Samsung Galaxy S21",
    "issueDescription": "Screen not responsive",
    "estimatedCost": 150.00
  }'
```

### Get Battery Diagnostics

```bash
curl "http://localhost:3001/api/v1/diagnostics/battery?deviceId=ABC123"
```

### Enter Fastboot Mode

```bash
curl -X POST http://localhost:3001/api/v1/adb/enter-fastboot \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "ABC123"}'
```

---

## Flutter App Configuration

### Update Backend URL

Edit `mobile_app/lib/config/api_config.dart`:

```dart
class ApiConfig {
  static const String baseUrl = 'http://YOUR_SERVER_IP:3001';
  static const String wsUrl = 'ws://YOUR_SERVER_IP:3001';
}
```

For local testing, use:
- Emulator: `http://10.0.2.2:3001` (Android) or `http://localhost:3001` (iOS)
- Physical device: Your computer's local IP address

### Build for Production

```bash
cd mobile_app

# Android APK
flutter build apk --release

# iOS IPA (macOS only)
flutter build ios --release

# Web
flutter build web --release
```

---

## Troubleshooting

### Backend Issues

**Port 3001 already in use**
```bash
# Find process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change PORT in .env
```

**ADB not recognized**
```bash
# Add to PATH or use full path
export PATH=$PATH:/path/to/platform-tools
```

### Flutter Issues

**Flutter doctor shows issues**
```bash
flutter doctor --android-licenses  # Accept Android licenses
```

**Unable to connect to device**
```bash
# Android
adb devices  # Check device connection
adb kill-server && adb start-server  # Restart ADB

# iOS
idevice_id -l  # Check device connection
```

**Build errors**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

### Device Connection Issues

**Android device not detected**
- Enable USB debugging in Developer Options
- Try different USB cable
- Install device drivers (Windows)
- Accept USB debugging prompt on device

**iOS device not detected**
- Trust computer on device
- Restart device and computer
- Check cable connection
- Install iTunes (Windows)

---

## Testing

### Manual Testing

1. **Connect a test device** (Android or iOS)
2. **Start backend server**
3. **Run Flutter app**
4. **Test features:**
   - Device detection
   - Battery diagnostics
   - Hardware tests
   - Network tests
   - Create repair ticket
   - QR code scanning

### Automated Testing

```bash
# Backend tests
cd Bobbys-Workshop--3.0.0/server
npm test

# Flutter tests
cd mobile_app
flutter test
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit secrets** - Use `.env` files (git-ignored)
2. **Use HTTPS in production** - Not HTTP
3. **Validate all inputs** - Backend and frontend
4. **Rate limit APIs** - Prevent abuse
5. **Authenticate users** - Add authentication layer
6. **Audit logging** - Log all sensitive operations
7. **Device authorization** - Verify device ownership before operations

---

## Support

### Documentation
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](Bobbys-Workshop--3.0.0/server/README.md)
- [Flutter README](mobile_app/README.md)

### Logs
- Backend: `Bobbys-Workshop--3.0.0/server/logs/backend.log`
- Flutter: Use `flutter logs` command

### Common Commands

```bash
# Backend
npm start                    # Start server
npm test                     # Run tests
npm run dev                  # Development mode

# Flutter
flutter run                  # Run app
flutter build apk            # Build Android
flutter build ios            # Build iOS
flutter test                 # Run tests
flutter doctor               # Check setup

# Diagnostics
node scripts/android_diagnostics.mjs
node scripts/ios_diagnostics.mjs
```

---

## Next Steps

1. **Customize** the app branding and colors
2. **Add authentication** for user management
3. **Set up database** for persistent storage
4. **Configure Firebase** for push notifications
5. **Deploy to production** following the deployment guide
6. **Monitor** application performance
7. **Gather feedback** from users

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
