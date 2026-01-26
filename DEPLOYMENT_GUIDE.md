# Deployment Guide

Complete deployment guide for the Diagnostic and Repair Application with Flutter frontend and Node.js backend.

## Table of Contents

1. [Overview](#overview)
2. [Flutter Frontend Deployment](#flutter-frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Firebase Cloud Messaging](#firebase-cloud-messaging)
5. [Environment Configuration](#environment-configuration)
6. [Production Checklist](#production-checklist)

---

## Overview

This application consists of:
- **Flutter Mobile App** - Cross-platform frontend for Android and iOS
- **Node.js/Express Backend** - REST API server with WebSocket support
- **Firebase Services** - Hosting, Cloud Messaging, and optional database

### Architecture

```
┌─────────────────┐
│  Flutter App    │ (Android/iOS)
│  (Mobile)       │
└────────┬────────┘
         │ HTTPS/WSS
         │
         ▼
┌─────────────────┐
│  Firebase       │
│  Hosting        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js        │
│  Backend        │
│  (Heroku/AWS)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Device         │
│  Management     │
│  (ADB/libimob.) │
└─────────────────┘
```

---

## Flutter Frontend Deployment

### Option 1: Firebase Hosting (Recommended for Web)

If deploying Flutter as a web app:

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Initialize Firebase in Flutter Project

```bash
cd mobile_app
firebase login
firebase init hosting
```

Select options:
- **What do you want to use as your public directory?** `build/web`
- **Configure as a single-page app?** Yes
- **Set up automatic builds and deploys with GitHub?** Optional

#### 3. Build Flutter Web App

```bash
flutter build web --release
```

#### 4. Deploy to Firebase

```bash
firebase deploy --only hosting
```

Your app will be available at: `https://your-project.web.app`

### Option 2: Android APK Distribution

#### 1. Configure Signing

Create `android/key.properties`:

```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=your-key-alias
storeFile=path/to/keystore.jks
```

#### 2. Build Release APK

```bash
flutter build apk --release
```

APK location: `build/app/outputs/flutter-apk/app-release.apk`

#### 3. Distribute

Options:
- Upload to Google Play Store
- Self-host on your server
- Use Firebase App Distribution

```bash
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
  --app 1:YOUR_APP_ID \
  --groups testers
```

### Option 3: iOS App Store

#### 1. Configure Signing

Open `ios/Runner.xcworkspace` in Xcode:
- Set your Team ID
- Configure signing certificates
- Set up provisioning profiles

#### 2. Build Release IPA

```bash
flutter build ios --release
```

#### 3. Archive and Upload

- Open in Xcode: `Runner.xcarchive`
- Validate and upload to App Store Connect
- Submit for review

---

## Backend Deployment

### Option 1: Heroku (Recommended for Simplicity)

#### 1. Install Heroku CLI

```bash
npm install -g heroku
```

#### 2. Create Heroku App

```bash
cd Bobbys-Workshop--3.0.0/server
heroku login
heroku create your-app-name
```

#### 3. Configure Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
heroku config:set DEMO_MODE=0
heroku config:set BW_LOG_DIR=/app/logs
```

#### 4. Create Procfile

Create `Procfile` in server directory:

```
web: node index.js
```

#### 5. Deploy

```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 6. Scale Dynos

```bash
heroku ps:scale web=1
```

Your API will be available at: `https://your-app-name.herokuapp.com`

### Option 2: AWS Elastic Beanstalk

#### 1. Install EB CLI

```bash
pip install awsebcli
```

#### 2. Initialize EB

```bash
cd Bobbys-Workshop--3.0.0/server
eb init -p node.js -r us-east-1 diagnostic-repair-api
```

#### 3. Create Environment

```bash
eb create production-env
```

#### 4. Configure Environment Variables

```bash
eb setenv NODE_ENV=production PORT=3001 DEMO_MODE=0
```

#### 5. Deploy

```bash
eb deploy
```

#### 6. Open Application

```bash
eb open
```

### Option 3: AWS EC2 (Advanced)

#### 1. Launch EC2 Instance

- AMI: Ubuntu Server 22.04 LTS
- Instance Type: t2.micro (free tier) or larger
- Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (API)

#### 2. Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install ADB and libimobiledevice
sudo apt install -y android-tools-adb libimobiledevice-utils
```

#### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/your-repo.git
cd your-repo/Bobbys-Workshop--3.0.0/server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Start with PM2
pm2 start index.js --name "diagnostic-api"
pm2 save
pm2 startup
```

#### 5. Configure Nginx (Optional)

```bash
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/diagnostic-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/diagnostic-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Firebase Cloud Messaging

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name and follow setup

### 2. Add Firebase to Flutter App

#### Android

1. Download `google-services.json`
2. Place in `mobile_app/android/app/`
3. Add to `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

4. Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

#### iOS

1. Download `GoogleService-Info.plist`
2. Add to `mobile_app/ios/Runner/`
3. Update `ios/Podfile`:

```ruby
pod 'Firebase/Messaging'
```

### 3. Install Flutter FCM Package

```bash
cd mobile_app
flutter pub add firebase_messaging firebase_core
```

### 4. Initialize in Flutter

Create `lib/services/notification_service.dart`:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_core/firebase_core.dart';

class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  
  Future<void> initialize() async {
    await Firebase.initializeApp();
    
    // Request permission
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Get FCM token
    String? token = await _fcm.getToken();
    print('FCM Token: $token');
    
    // Listen for messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message: ${message.notification?.title}');
    });
  }
}
```

### 5. Send Notifications from Backend

Install Firebase Admin SDK:

```bash
cd Bobbys-Workshop--3.0.0/server
npm install firebase-admin
```

Create `firebase-admin.js`:

```javascript
import admin from 'firebase-admin';
import serviceAccount from './firebase-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export async function sendNotification(token, title, body, data) {
  const message = {
    notification: { title, body },
    data: data || {},
    token: token,
  };
  
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in server directory:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
DEMO_MODE=0

# Logging
BW_LOG_DIR=./logs
BW_LOG_FILE=./logs/backend.log

# Database (if using PostgreSQL/MySQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Firebase Admin (for FCM)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Device Operation Features
ALLOW_DEVICE_OPERATIONS=true
EXPERIMENTAL_EDL_MODE=false
EXPERIMENTAL_BOOTLOADER_ACCESS=false

# Security
TRAPDOOR_PASSCODE=your-secure-passcode
POWER_STAR_KEY=your-power-star-key

# External Services
PYTHON_BACKEND_URL=http://localhost:8000
```

### Flutter Environment Configuration

Create `lib/config/environment.dart`:

```dart
class Environment {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001',
  );
  
  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'ws://localhost:3001',
  );
}
```

Build with environment:

```bash
flutter build apk --dart-define=API_BASE_URL=https://your-api.com
```

---

## Production Checklist

### Security

- [ ] Enable HTTPS/TLS for all communications
- [ ] Set strong authentication tokens and keys
- [ ] Implement rate limiting on API endpoints
- [ ] Enable CORS only for trusted origins
- [ ] Sanitize all user inputs
- [ ] Use environment variables for secrets (never commit)
- [ ] Enable audit logging
- [ ] Implement request validation

### Performance

- [ ] Enable gzip compression on backend
- [ ] Implement caching where appropriate
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Implement connection pooling
- [ ] Monitor memory usage
- [ ] Set up load balancing (if needed)

### Monitoring

- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Implement health check endpoints
- [ ] Monitor API response times
- [ ] Track device connection metrics
- [ ] Set up alerts for critical failures
- [ ] Log all diagnostic operations
- [ ] Monitor WebSocket connections

### Testing

- [ ] Run all unit tests
- [ ] Execute integration tests
- [ ] Test on physical Android devices
- [ ] Test on physical iOS devices
- [ ] Verify WebSocket functionality
- [ ] Test push notifications
- [ ] Verify firmware flashing safety
- [ ] Load test API endpoints

### Documentation

- [ ] API documentation complete
- [ ] User guide available
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide created
- [ ] Architecture diagrams updated
- [ ] Environment setup guide ready

### Backup & Recovery

- [ ] Database backup strategy in place
- [ ] Application logs archived
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

---

## Support

For deployment issues:

- Backend: Check logs at `$BW_LOG_DIR/backend.log`
- Flutter: Run `flutter doctor` to diagnose issues
- Firebase: Check [Firebase Console](https://console.firebase.google.com/)
- Heroku: Use `heroku logs --tail`
- AWS: Check CloudWatch logs

## Additional Resources

- [Flutter Deployment Guide](https://flutter.dev/docs/deployment)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [AWS Elastic Beanstalk Node.js](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
