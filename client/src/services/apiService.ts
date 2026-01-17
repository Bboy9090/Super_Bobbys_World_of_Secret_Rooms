/**
 * API Service - Typed interface to backend API
 * 
 * All API calls are real and follow Truth + Production principles.
 * No fake success responses.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// API Command Types
export type ApiCommand = 
  | { type: 'listDevices' }
  | { type: 'getDeviceState'; deviceId: string }

// API Response Type
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Device Info Type
export interface DeviceInfo {
  id: string
  name: string
  status: string
}

/**
 * Send a command to the backend
 */
export async function sendCommand<T>(command: ApiCommand): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Connect to SSE event stream
 * Returns an EventSource that can be used to listen for events
 */
export function connectEventStream(): EventSource {
  const eventSource = new EventSource(`${API_BASE}/events`)
  return eventSource
}
