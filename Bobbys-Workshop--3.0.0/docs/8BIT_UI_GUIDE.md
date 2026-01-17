# 🎮 8-Bit UI Theme Guide

## Overview

Super Bobby's World features a retro Super Mario-inspired 8-bit aesthetic. This guide shows you how to use the power-up styled components in your own pages.

## CSS Classes Reference

### 1. Pixel Card (`.pixel-card`)

Golden card with pixelated rendering and bold black borders.

```tsx
<div className="pixel-card">
  <h2 className="text-2xl font-bold mb-4">🏰 Unlock Castle</h2>
  <p>Automated bootloader and FRP authority.</p>
</div>
```

**Best for:**
- Feature cards
- Information panels
- Dashboard widgets

---

### 2. Warp Pipe (`.warp-pipe`)

Green pipe-styled terminal containers with inset shadows.

```tsx
<div className="warp-pipe">
  <h2 className="text-2xl font-bold mb-4">🕳️ Terminal</h2>
  <pre className="text-sm">
    {`> Device connected
> Status: READY`}
  </pre>
</div>
```

**Best for:**
- Terminal outputs
- Log displays
- Real-time monitoring
- Command interfaces

---

### 3. Pixel Button (`.btn-pixel`)

Retro red buttons with satisfying press-down effect.

```tsx
<button className="btn-pixel">
  ⚡ Flash Device
</button>
```

**Features:**
- Press-down animation on click
- Shadow effect disappears on active
- Brightness hover effect

**Best for:**
- Primary actions
- Call-to-action buttons
- Dangerous operations

---

### 4. Coin Block (`.coin-block`)

Golden status blocks for metrics display.

```tsx
<div className="coin-block">
  <div className="text-3xl mb-2">🟡</div>
  <div className="font-bold">Devices Flashed</div>
  <div className="text-2xl">42</div>
</div>
```

**Best for:**
- Metrics display
- Statistics cards
- Achievement counters
- Status indicators

---

### 5. Question Block (`.question-block`)

Mystery blocks with diagonal stripe patterns.

```tsx
<div className="question-block">
  <div className="text-6xl mb-4">?</div>
  <h3 className="text-xl font-bold">Mystery Feature</h3>
  <p>Click to reveal</p>
</div>
```

**Best for:**
- Hidden features
- Easter eggs
- Tutorial prompts
- Mystery rewards

---

### 6. Power Star (`.power-star`)

Glowing animated containers for achievements.

```tsx
<div className="power-star p-6 rounded-lg">
  <h3 className="text-2xl font-bold">✨ Achievement Unlocked!</h3>
  <p>You've flashed 100 devices</p>
</div>
```

**Features:**
- Pulse animation
- Glowing shadow effect
- Gradient background

**Best for:**
- Achievement notifications
- Success messages
- Special milestones
- Premium features

---

### 7. Fire Flower (`.fire-flower`)

Flaming gradient containers for power modes.

```tsx
<div className="fire-flower p-6 rounded-lg">
  <h3 className="text-2xl font-bold text-white">🔥 Fire Mode Active</h3>
  <p className="text-white">Advanced operations enabled</p>
</div>
```

**Features:**
- Flicker animation
- Fire-colored gradient
- Red border

**Best for:**
- Power-up notifications
- Advanced mode indicators
- Warning messages
- Pro features

---

## Complete Example: Device Dashboard

```tsx
import React from 'react';

export function DeviceDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-5xl font-display text-center mb-8">
        🍄 Device Manager
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="coin-block">
          <div className="text-3xl mb-2">📱</div>
          <div className="font-bold">Connected</div>
          <div className="text-2xl">3</div>
        </div>
        <div className="coin-block">
          <div className="text-3xl mb-2">⚡</div>
          <div className="font-bold">Flashing</div>
          <div className="text-2xl">1</div>
        </div>
        <div className="coin-block">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-bold">Complete</div>
          <div className="text-2xl">42</div>
        </div>
      </div>

      {/* Device Info Card */}
      <div className="pixel-card">
        <h2 className="text-2xl font-bold mb-4">📱 Samsung Galaxy S21</h2>
        <div className="space-y-2">
          <p><strong>Serial:</strong> RF8N123456</p>
          <p><strong>Status:</strong> Authorized</p>
          <p><strong>Battery:</strong> 85%</p>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="warp-pipe">
        <h3 className="text-xl font-bold mb-4">📟 Live Console</h3>
        <pre className="text-sm">
          {`> Connecting to device...
> ADB Status: AUTHORIZED
> Device: SM-G998B
> Ready for operations
> Flashing firmware...
> Progress: 45%`}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="btn-pixel">
          ⚡ Flash Firmware
        </button>
        <button className="btn-pixel">
          🔓 Unlock Bootloader
        </button>
        <button className="btn-pixel">
          🔄 Reboot Device
        </button>
      </div>

      {/* Achievement Notification */}
      <div className="power-star p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900">
          ✨ Master Flasher Unlocked!
        </h3>
        <p className="text-gray-800 mt-2">
          You've successfully flashed 100 devices without errors
        </p>
      </div>
    </div>
  );
}
```

---

## Design Guidelines

### Color Palette

- **Golden Yellow** (`#f8b800`) - Cards, blocks, success
- **Green Pipe** (`#00a800`) - Terminals, active states
- **Red** (`#e40058`) - Buttons, actions, alerts
- **Black** - Borders, text, shadows

### Typography

- **Headers**: Use `font-display` (Bebas Neue) for bold impact
- **Body**: Use default `font-sans` (Outfit) for readability
- **Terminal**: Use `font-mono` (Space Mono) for code/logs

### Spacing

- Use consistent padding (p-4, p-6, p-8)
- Add generous spacing between sections (space-y-8)
- Keep gaps between grid items (gap-4)

### Animations

All animations are subtle and performant:
- Buttons: 0.1s transform on press
- Power Star: 2s pulse loop
- Fire Flower: 1.5s flicker loop

---

## Tips & Tricks

1. **Combine classes**: Mix 8-bit classes with utility classes
   ```tsx
   <div className="pixel-card hover:scale-105 transition-transform">
   ```

2. **Responsive design**: Use Tailwind breakpoints
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   ```

3. **Add emojis**: Enhance the retro feel with pixel-perfect emojis
   ```tsx
   <div className="pixel-card">
     <div className="text-4xl mb-2">🎮</div>
   ```

4. **Layer effects**: Stack components for depth
   ```tsx
   <div className="pixel-card shadow-2xl transform hover:-translate-y-1">
   ```

---

## Demo Component

Import and use the demo component to see all classes in action:

```tsx
import { WarpZoneDemo } from './components/WarpZoneDemo';

function App() {
  return <WarpZoneDemo />;
}
```

---

## Browser Compatibility

All CSS classes use standard CSS properties supported by:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

The `image-rendering: pixelated` property ensures crisp pixel art on all modern browsers.

---

**Built with 🍄 for the 8-bit generation**
