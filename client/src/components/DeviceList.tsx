/**
 * Device List Component - Displays connected devices (safe, read-only)
 */

import { useState, useEffect } from 'react'
import { sendCommand, type DeviceInfo } from '../services/apiService'

export default function DeviceList() {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    
    const response = await sendCommand<DeviceInfo[]>({ type: 'listDevices' })
    
    if (response.success && response.data) {
      setDevices(response.data)
    } else {
      setError(response.error || 'Failed to fetch devices')
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchDevices()
    // Poll every 5 seconds
    const interval = setInterval(fetchDevices, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="warp-pipe-border bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-pixel text-xs text-warp-green">🎮 Connected Devices</h3>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="btn-8bit text-xs px-2 py-1"
        >
          {loading ? '...' : '↻'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border-2 border-red-600 p-2 mb-4 rounded">
          <p className="font-mono text-xs text-white">{error}</p>
        </div>
      )}

      {devices.length === 0 && !loading && !error && (
        <div className="bg-gray-700 border-2 border-gray-600 p-4 rounded text-center">
          <p className="font-pixel text-xs text-gray-400 mb-2">No devices detected</p>
          <p className="font-mono text-xs text-gray-500">
            This is a safe stub. Device detection requires authorization.
          </p>
        </div>
      )}

      {devices.length > 0 && (
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-gray-700 border-2 border-warp-green p-3 rounded hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-pixel text-xs text-white">{device.name}</p>
                  <p className="font-mono text-xs text-gray-400 mt-1">ID: {device.id}</p>
                </div>
                <span className={`font-pixel text-xs ${
                  device.status === 'connected' ? 'status-online' : 'status-offline'
                }`}>
                  {device.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
