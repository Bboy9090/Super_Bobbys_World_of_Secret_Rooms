import { useState, useEffect } from 'react'
import WarpZoneDashboard from './components/WarpZoneDashboard'

function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Check backend health on mount
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        console.error('Failed to connect to backend:', error)
        setBackendStatus('offline')
      }
    }

    checkBackend()
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-warp-dark to-warp-green p-4 warp-pipe-border border-b-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-pixel text-xs sm:text-sm md:text-xl text-white glow">
            🌟 Super Bobby's World: Warp Zones
          </h1>
          <div className="flex items-center gap-4">
            {/* Backend Status */}
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs">Backend:</span>
              {backendStatus === 'checking' && (
                <span className="status-processing text-xs">Checking...</span>
              )}
              {backendStatus === 'online' && (
                <span className="status-online text-xs">Online ✓</span>
              )}
              {backendStatus === 'offline' && (
                <span className="status-offline text-xs">Offline ✗</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {backendStatus === 'offline' && (
          <div className="bg-red-900 border-4 border-red-600 p-4 mb-4 rounded">
            <p className="font-pixel text-xs text-white">
              ⚠️ Backend is offline. Please start the backend server.
            </p>
            <p className="font-mono text-xs text-gray-300 mt-2">
              Run: <code className="bg-black p-1">cd backend && cargo run</code>
            </p>
          </div>
        )}
        
        <WarpZoneDashboard />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t-4 border-warp-green p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="font-pixel text-xs text-gray-400">
            Truth + Production. No Placeholders.™
          </p>
          <p className="font-mono text-xs text-gray-500 mt-2">
            All sensitive features are OFF by default. Feature flags required for authorized operations.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
