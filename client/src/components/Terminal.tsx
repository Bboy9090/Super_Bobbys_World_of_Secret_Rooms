/**
 * Terminal Component - Displays logs in retro terminal style
 */

import { useEffect, useRef } from 'react'

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

interface TerminalProps {
  logs: LogEntry[]
  maxLogs?: number
}

export default function Terminal({ logs, maxLogs = 100 }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400'
      case 'warn':
        return 'text-yellow-400'
      case 'info':
        return 'text-green-400'
      case 'debug':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const displayLogs = logs.slice(-maxLogs)

  return (
    <div className="warp-pipe-border bg-black rounded-lg">
      <div className="bg-gray-800 px-4 py-2 border-b-2 border-warp-green">
        <h3 className="font-pixel text-xs text-warp-green">📟 Event Terminal</h3>
      </div>
      <div
        ref={terminalRef}
        className="p-4 h-64 overflow-y-auto font-mono text-xs"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {displayLogs.length === 0 ? (
          <p className="text-gray-500">Waiting for events...</p>
        ) : (
          displayLogs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className={getLevelColor(log.level)}>[{log.level.toUpperCase()}]</span>{' '}
              <span className="text-green-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
