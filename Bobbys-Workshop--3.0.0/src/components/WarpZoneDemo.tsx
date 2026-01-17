import React from 'react';

/**
 * WarpZoneDemo - Showcase component for Super Mario 8-bit themed UI elements
 * 
 * This component demonstrates the new pixel-perfect CSS classes:
 * - pixel-card: Golden card with pixelated rendering
 * - warp-pipe: Green pipe-styled containers with inset shadows
 * - btn-pixel: Retro red buttons with press effect
 * - coin-block: Golden blocks for status indicators
 * - question-block: Mystery blocks with diagonal stripes
 * - power-star: Glowing animated star containers
 * - fire-flower: Flaming gradient containers
 */
export function WarpZoneDemo() {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 min-h-screen">
      <h1 className="text-5xl font-display text-white text-center mb-8 drop-shadow-lg">
        🍄 SUPER BOBBY'S WORLD: WARP ZONES
      </h1>

      {/* Pixel Card Demo */}
      <div className="pixel-card">
        <h2 className="text-2xl font-bold mb-4">🏰 Unlock Castle</h2>
        <p className="text-gray-900">
          Automated bootloader and FRP authority. This card uses the pixel-card class
          for that authentic 8-bit look.
        </p>
      </div>

      {/* Warp Pipe Demo */}
      <div className="warp-pipe">
        <h2 className="text-2xl font-bold mb-4">🕳️ Abyssal Layer Terminal</h2>
        <pre className="text-sm">
          {`> Connecting to device...
> ADB Status: AUTHORIZED
> Device: SM-G998B
> Ready for operations`}
        </pre>
      </div>

      {/* Button Demo */}
      <div className="flex gap-4 flex-wrap">
        <button className="btn-pixel">
          ⚡ Flash Device
        </button>
        <button className="btn-pixel">
          🔓 Unlock Bootloader
        </button>
        <button className="btn-pixel">
          🔄 Reboot to Recovery
        </button>
      </div>

      {/* Coin Block Demo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="coin-block">
          <div className="text-3xl mb-2">🟡</div>
          <div className="font-bold">Coins Collected</div>
          <div className="text-2xl">42</div>
        </div>
        <div className="coin-block">
          <div className="text-3xl mb-2">⭐</div>
          <div className="font-bold">Power Stars</div>
          <div className="text-2xl">7</div>
        </div>
        <div className="coin-block">
          <div className="text-3xl mb-2">👻</div>
          <div className="font-bold">Secrets Found</div>
          <div className="text-2xl">13</div>
        </div>
      </div>

      {/* Question Block Demo */}
      <div className="question-block">
        <div className="text-center">
          <div className="text-6xl mb-4">?</div>
          <h3 className="text-xl font-bold">Mystery Feature</h3>
          <p className="text-sm mt-2">Click to reveal hidden functionality</p>
        </div>
      </div>

      {/* Power Star Demo */}
      <div className="power-star p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900">✨ Achievement Unlocked!</h3>
        <p className="text-gray-800 mt-2">
          You've successfully flashed 100 devices
        </p>
      </div>

      {/* Fire Flower Demo */}
      <div className="fire-flower p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-white">🔥 Fire Mode Active</h3>
        <p className="text-white mt-2">
          Advanced operations enabled
        </p>
      </div>

      {/* Usage Instructions */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">🎮 Available CSS Classes</h2>
        <ul className="space-y-2 font-mono text-sm">
          <li><code className="bg-gray-200 px-2 py-1 rounded">.pixel-card</code> - Golden card with 8-bit styling</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.warp-pipe</code> - Green pipe terminal container</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.btn-pixel</code> - Retro red button with press effect</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.coin-block</code> - Golden status block</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.question-block</code> - Mystery block with stripes</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.power-star</code> - Glowing animated container</li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">.fire-flower</code> - Flaming gradient container</li>
        </ul>
      </div>
    </div>
  );
}
