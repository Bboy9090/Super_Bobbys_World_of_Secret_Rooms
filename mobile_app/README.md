# Diagnostic and Repair Mobile App

A Flutter-based cross-platform mobile application for Android and iOS device diagnostics and repair management.

## Features

### Diagnostic Tools
- **Real-time Battery Health** - Monitor battery status, health, voltage, and temperature
- **Hardware Diagnostics** - Test screen, sensors, cameras, speakers, and other hardware
- **System Logs** - View and export system logs for troubleshooting
- **Network Tests** - Check Wi-Fi, cellular, and network connectivity

### Repair Ticket Management
- Create and manage repair tickets
- Track customer information
- Record device details
- Document issue descriptions
- Monitor repair status
- Generate cost estimates

### Device Tracking
- QR code scanning for device identification
- Barcode scanning for part tracking
- Quick device lookup and history

### Real-time Updates
- Live progress tracking for repairs
- Push notifications for status changes
- Real-time diagnostic results

## Prerequisites

- Flutter SDK 3.0.0 or higher
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Node.js backend server running

## Setup

1. **Install Dependencies**
   ```bash
   flutter pub get
   ```

2. **Configure Backend URL**
   Edit `lib/config/api_config.dart` and set your backend URL:
   ```dart
   static const String baseUrl = 'http://your-backend-url:3001';
   ```

3. **Run the App**
   ```bash
   # For Android
   flutter run -d android
   
   # For iOS
   flutter run -d ios
   
   # For development with hot reload
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── config/
│   └── api_config.dart         # API configuration
├── models/
│   ├── device.dart             # Device data model
│   ├── repair_ticket.dart      # Repair ticket model
│   └── diagnostic_result.dart  # Diagnostic result model
├── services/
│   ├── api_service.dart        # HTTP API client
│   ├── socket_service.dart     # Socket.IO client
│   └── diagnostic_service.dart # Diagnostic operations
├── providers/
│   ├── device_provider.dart    # Device state management
│   └── ticket_provider.dart    # Ticket state management
├── screens/
│   ├── home_screen.dart        # Home dashboard
│   ├── diagnostics/
│   │   ├── battery_screen.dart
│   │   ├── hardware_screen.dart
│   │   ├── system_logs_screen.dart
│   │   └── network_screen.dart
│   ├── tickets/
│   │   ├── ticket_list_screen.dart
│   │   ├── ticket_detail_screen.dart
│   │   └── create_ticket_screen.dart
│   └── scanner/
│       └── qr_scanner_screen.dart
└── widgets/
    ├── diagnostic_card.dart
    ├── ticket_card.dart
    └── progress_indicator.dart
```

## Building for Production

### Android
```bash
flutter build apk --release
# Or for app bundle
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Backend Integration

This app connects to the Node.js/Express backend running on port 3001. Required backend endpoints:

- `GET /api/v1/tickets` - List repair tickets
- `POST /api/v1/tickets` - Create repair ticket
- `GET /api/v1/tickets/:id` - Get ticket details
- `PUT /api/v1/tickets/:id` - Update ticket
- `DELETE /api/v1/tickets/:id` - Delete ticket
- `GET /api/v1/diagnostics/battery` - Battery diagnostics
- `GET /api/v1/diagnostics/hardware` - Hardware diagnostics
- `GET /api/v1/diagnostics/network` - Network diagnostics
- `POST /api/v1/adb/enter-fastboot` - Enter Fastboot mode
- `POST /api/v1/adb/enter-recovery` - Enter Recovery mode
- `POST /api/v1/ios/enter-dfu` - Enter DFU mode
- `POST /api/v1/flash/firmware` - Flash firmware

WebSocket endpoint: `ws://backend-url:3001`

## Permissions

### Android (android/app/src/main/AndroidManifest.xml)
- `CAMERA` - For QR/barcode scanning
- `INTERNET` - For API communication
- `ACCESS_NETWORK_STATE` - For network diagnostics

### iOS (ios/Runner/Info.plist)
- `NSCameraUsageDescription` - For QR/barcode scanning
- `NSLocalNetworkUsageDescription` - For local network access

## Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter drive --target=test_driver/app.dart
```

## Troubleshooting

### Cannot connect to backend
- Verify backend is running on the correct port
- Check firewall settings
- Ensure correct IP address in api_config.dart

### QR Scanner not working
- Grant camera permissions in device settings
- Check AndroidManifest.xml and Info.plist for permission declarations

### Build errors
- Run `flutter clean` and `flutter pub get`
- Update Flutter SDK: `flutter upgrade`

## License

Proprietary - All rights reserved
