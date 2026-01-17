# 🍄 Super Mario Makeover - Quick Reference

## 🎨 CSS Classes Cheat Sheet

```css
.pixel-card       /* Golden card with 8-bit styling */
.warp-pipe        /* Green pipe terminal container */
.btn-pixel        /* Retro red button with press effect */
.coin-block       /* Golden status block */
.question-block   /* Mystery block with stripes */
.power-star       /* Glowing animated container */
.fire-flower      /* Flaming gradient container */
```

## 🚀 NPM Commands

```bash
npm run world:start    # Start the development server
npm run build          # Build for production
npm test               # Run tests
```

## 🌐 WebSocket Endpoints

```
ws://localhost:3001/ws/flash-progress   # Flash operation updates
ws://localhost:3001/ws/hotplug          # Device hotplug events
ws://localhost:3001/ws/monitor          # Device state monitoring
```

## 📊 WebSocket Event Types

### Flash Progress Events

```typescript
{
  type: 'flash_started',
  jobId: string,
  deviceId: string,
  deviceName: string,
  stage: string,
  totalBytes: number
}

{
  type: 'flash_progress',
  jobId: string,
  deviceId: string,
  progress: number,        // 0-100
  stage: string,
  bytesTransferred: number,
  totalBytes: number,
  transferSpeed: number,   // bytes/sec
  estimatedTimeRemaining: number  // seconds
}

{
  type: 'flash_complete',
  jobId: string,
  deviceId: string,
  success: boolean,
  message: string
}
```

### Device Events

```typescript
{
  type: 'device_connected',
  deviceId: string,
  deviceName: string,
  mode: 'adb' | 'fastboot' | 'recovery'
}

{
  type: 'device_disconnected',
  deviceId: string
}

{
  type: 'authorization_changed',
  deviceId: string,
  authorized: boolean
}
```

## 🎮 GitHub Actions Workflow

The **Warp Zone Guard** workflow runs on every push:

1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Run tests
5. ✅ Build project
6. ✅ Report status

Located at: `.github/workflows/warp-zone.yml`

## 📖 Documentation

- **8-Bit UI Guide**: `docs/8BIT_UI_GUIDE.md`
- **Demo Component**: `src/components/WarpZoneDemo.tsx`
- **Main README**: `README.md`

## 🔧 Quick Setup

```bash
# Clone the repo
git clone https://github.com/Bboy9090/Super_Bobbys_World_of_Secret_Rooms.git

# Navigate to project
cd Super_Bobbys_World_of_Secret_Rooms/Bobbys-Workshop--3.0.0

# Install dependencies
npm install

# Start the world
npm run world:start
```

## 🎯 Component Examples

### Simple Button

```tsx
<button className="btn-pixel">
  ⚡ Flash Device
</button>
```

### Info Card

```tsx
<div className="pixel-card">
  <h2>Device Info</h2>
  <p>Serial: RF8N123456</p>
</div>
```

### Terminal

```tsx
<div className="warp-pipe">
  <pre>$ adb devices</pre>
</div>
```

### Stats

```tsx
<div className="coin-block">
  <div className="text-3xl">📱</div>
  <div className="font-bold">Connected</div>
  <div className="text-2xl">3</div>
</div>
```

## 🎨 Color Palette

```
Golden:  #f8b800
Green:   #00a800
Red:     #e40058
Black:   #000000
```

## 🚦 Status Colors

```css
Success:     #2ECC71
Warning:     #CFA24D
Error:       #E74C3C
Primary:     #1ECAD3
```

---

**🍄 Welcome to Super Bobby's World!**
