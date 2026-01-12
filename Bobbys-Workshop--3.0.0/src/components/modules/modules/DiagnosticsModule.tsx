/**
 * DiagnosticsModule
 * 
 * Module content for device diagnostics
 * Connects to /api/v1/diagnostics/* endpoints
 */

import React, { useState } from 'react';
import { Terminal, Search, CheckCircle2, XCircle, Battery, Cpu } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface DiagnosticsResult {
  hardware?: {
    screen?: { status: string; resolution?: string };
    sensors?: { status: string };
    camera?: { status: string };
    audio?: { status: string };
  };
  battery?: {
    health: string;
    level: number;
    status: string;
    temperature?: number;
    voltage?: number;
  };
}

export function DiagnosticsModule() {
  const [deviceSerial, setDeviceSerial] = useState('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosticType, setDiagnosticType] = useState<'hardware' | 'battery'>('hardware');
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    if (!deviceSerial.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const diagnosticsResult: DiagnosticsResult = {};

      if (diagnosticType === 'hardware') {
        try {
          const response = await fetch(getAPIUrl(`/api/v1/diagnostics/hardware/${encodeURIComponent(deviceSerial)}`));
          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data) {
              diagnosticsResult.hardware = data.data;
            }
          }
        } catch (error) {
          console.error('Hardware diagnostics error:', error);
        }
      } else if (diagnosticType === 'battery') {
        try {
          const response = await fetch(getAPIUrl(`/api/v1/diagnostics/battery/${encodeURIComponent(deviceSerial)}`));
          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data) {
              diagnosticsResult.battery = data.data;
            }
          }
        } catch (error) {
          console.error('Battery diagnostics error:', error);
        }
      }

      setDiagnostics(diagnosticsResult);
    } catch (error) {
      console.error('Diagnostics error:', error);
      setError('Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h4 className="font-semibold text-white mb-2">Device Diagnostics</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
            placeholder="Device serial..."
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyPress={(e) => e.key === 'Enter' && runDiagnostics()}
          />
          <button
            onClick={runDiagnostics}
            disabled={loading || !deviceSerial.trim()}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Run
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDiagnosticType('hardware')}
            className={`flex-1 px-2 py-1 text-xs rounded-lg transition-colors ${
              diagnosticType === 'hardware'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Hardware
          </button>
          <button
            onClick={() => setDiagnosticType('battery')}
            className={`flex-1 px-2 py-1 text-xs rounded-lg transition-colors ${
              diagnosticType === 'battery'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Battery
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {diagnostics ? (
          <>
            {diagnostics.hardware && (
              <div className="space-y-2">
                {diagnostics.hardware.screen && (
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-white text-sm">Screen</span>
                      </div>
                      {diagnostics.hardware.screen.status === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {diagnostics.hardware.screen.status}
                      {diagnostics.hardware.screen.resolution && ` • ${diagnostics.hardware.screen.resolution}`}
                    </div>
                  </div>
                )}

                {diagnostics.hardware.camera && (
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-white text-sm">Camera</span>
                      </div>
                      {diagnostics.hardware.camera.status === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{diagnostics.hardware.camera.status}</div>
                  </div>
                )}

                {diagnostics.hardware.audio && (
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-white text-sm">Audio</span>
                      </div>
                      {diagnostics.hardware.audio.status === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{diagnostics.hardware.audio.status}</div>
                  </div>
                )}
              </div>
            )}

            {diagnostics.battery && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Battery Health</span>
                  </div>
                  <span className="text-sm text-gray-400">{diagnostics.battery.level}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${diagnostics.battery.level}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <div>Health: {diagnostics.battery.health}</div>
                  <div>Status: {diagnostics.battery.status}</div>
                  {diagnostics.battery.temperature && (
                    <div>Temperature: {diagnostics.battery.temperature}°C</div>
                  )}
                  {diagnostics.battery.voltage && (
                    <div>Voltage: {diagnostics.battery.voltage}V</div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter device serial and select diagnostic type</p>
          </div>
        )}
      </div>
    </div>
  );
}
