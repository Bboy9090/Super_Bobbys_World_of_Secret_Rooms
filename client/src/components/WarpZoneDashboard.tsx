/**
 * Warp Zone Dashboard - Main dashboard with SSE connection
 */

import { useState, useEffect } from 'react'
import { connectEventStream } from '../services/apiService'
import Terminal, { type LogEntry } from './Terminal'
import DeviceList from './DeviceList'

interface AppEvent {
  type: string
  level?: string
  message?: string
  deviceId?: string
  deviceName?: string
  status?: string
  details?: string
}

export default function WarpZoneDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [coins, setCoins] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = connectEventStream()

      eventSource.onopen = () => {
        setConnectionStatus('connected')
        addLog('info', 'Connected to Warp Zones backend')
      }

      // Note: 'connected' is a custom event type sent by our backend
      // Standard SSE would use 'open' event, but we handle that in onopen above
      eventSource.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          addLog('info', data.message || 'SSE connection established')
        } catch {
          addLog('info', 'SSE connection established')
        }
      })

      eventSource.addEventListener('app_event', (event: MessageEvent) => {
        try {
          const appEvent: AppEvent = JSON.parse(event.data)
          handleAppEvent(appEvent)
        } catch (error) {
          addLog('error', 'Failed to parse event: ' + error)
        }
      })

      eventSource.onerror = () => {
        setConnectionStatus('disconnected')
        addLog('error', 'SSE connection lost. Reconnecting...')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      addLog('error', 'Failed to connect to event stream: ' + error)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  const handleAppEvent = (event: AppEvent) => {
    switch (event.type) {
      case 'logMessage':
        addLog((event.level as 'info' | 'warn' | 'error' | 'debug') || 'info', event.message || '')
        break
      case 'deviceConnected':
        addLog('info', `Device connected: ${event.deviceName || event.deviceId || 'Unknown'}`)
        setCoins(c => c + 1) // Gamification: earn coin for device connection
        break
      case 'deviceDisconnected':
        addLog('warn', `Device disconnected: ${event.deviceId || 'Unknown'}`)
        break
      case 'systemStatus':
        addLog('info', `System: ${event.status || 'Unknown'} - ${event.details || ''}`)
        break
      default:
        addLog('debug', `Unknown event: ${event.type}`)
    }
  }

  const addLog = (level: 'info' | 'warn' | 'error' | 'debug', message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prevLogs => [...prevLogs, { timestamp, level, message }])
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <div className="warp-pipe-border bg-gray-800 p-4 rounded-lg">
          <p className="font-pixel text-xs text-gray-400 mb-2">SSE Status</p>
          <p className={`font-pixel text-sm ${
            connectionStatus === 'connected' ? 'status-online' :
            connectionStatus === 'connecting' ? 'status-processing' :
            'status-offline'
          }`}>
            {connectionStatus === 'connected' ? '✓ Connected' :
             connectionStatus === 'connecting' ? '⏳ Connecting...' :
             '✗ Disconnected'}
          </p>
        </div>

        {/* Coins Counter */}
        <div className="warp-pipe-border bg-gray-800 p-4 rounded-lg">
          <p className="font-pixel text-xs text-gray-400 mb-2">🪙 Coins Collected</p>
          <p className="font-pixel text-2xl text-coin-gold">
            {coins.toString().padStart(3, '0')}
          </p>
        </div>

        {/* Safety Notice */}
        <div className="warp-pipe-border bg-gray-800 p-4 rounded-lg">
          <p className="font-pixel text-xs text-gray-400 mb-2">🔐 Safety Mode</p>
          <p className="font-pixel text-xs text-green-400">All features OFF</p>
        </div>
      </div>

      {/* Device List */}
      <DeviceList />

      {/* Terminal */}
      <Terminal logs={logs} maxLogs={100} />

      {/* Info Panel */}
      <div className="bg-gray-800 border-2 border-warp-green p-4 rounded-lg">
        <h3 className="font-pixel text-xs text-warp-green mb-3">ℹ️ Information</h3>
        <ul className="font-mono text-xs text-gray-300 space-y-2">
          <li>• All device operations are <strong className="text-warp-green">SAFE STUBS</strong></li>
          <li>• Sensitive features require <strong className="text-yellow-400">explicit authorization</strong></li>
          <li>• Feature flags are <strong className="text-red-400">OFF by default</strong></li>
          <li>• All actions are <strong className="text-blue-400">logged to audit trail</strong></li>
        </ul>
      </div>
    </div>
  )
}
