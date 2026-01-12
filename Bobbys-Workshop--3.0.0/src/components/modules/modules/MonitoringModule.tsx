/**
 * MonitoringModule
 * 
 * Module content for real-time device monitoring
 * Connects to /api/v1/monitor/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Activity, Battery, Cpu, HardDrive } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface PerformanceMetrics {
  cpu?: { usage: number; cores: number };
  memory?: { used: number; total: number; percentage: number };
  battery?: { level: number; status: string; temperature?: number };
  storage?: { used: number; total: number; percentage: number };
}

export function MonitoringModule() {
  const [deviceSerial, setDeviceSerial] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!deviceSerial.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl(`/api/v1/monitor/performance/${encodeURIComponent(deviceSerial)}`));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setMetrics(data.data);
        } else {
          setMetrics(null);
          setError('No metrics data available');
        }
      } else {
        setMetrics(null);
        setError('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Metrics fetch error:', error);
      setMetrics(null);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefresh && deviceSerial.trim()) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, deviceSerial]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h4 className="font-semibold text-white mb-2">Performance Monitor</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
            placeholder="Device serial..."
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={fetchMetrics}
            disabled={loading || !deviceSerial.trim()}
            className="p-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <label className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          Auto-refresh (5s)
        </label>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {metrics ? (
          <>
            {metrics.cpu && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">CPU</span>
                  </div>
                  <span className="text-sm text-gray-400">{metrics.cpu.usage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${metrics.cpu.usage}%` }}
                  />
                </div>
                {metrics.cpu.cores && (
                  <div className="text-xs text-gray-400 mt-1">{metrics.cpu.cores} cores</div>
                )}
              </div>
            )}

            {metrics.memory && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Memory</span>
                  </div>
                  <span className="text-sm text-gray-400">{metrics.memory.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${metrics.memory.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(metrics.memory.used / 1024 / 1024)} MB / {Math.round(metrics.memory.total / 1024 / 1024)} MB
                </div>
              </div>
            )}

            {metrics.battery && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Battery</span>
                  </div>
                  <span className="text-sm text-gray-400">{metrics.battery.level}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${metrics.battery.level}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {metrics.battery.status}
                  {metrics.battery.temperature && ` • ${metrics.battery.temperature}°C`}
                </div>
              </div>
            )}

            {metrics.storage && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Storage</span>
                  </div>
                  <span className="text-sm text-gray-400">{metrics.storage.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${metrics.storage.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(metrics.storage.used / 1024 / 1024 / 1024)} GB / {Math.round(metrics.storage.total / 1024 / 1024 / 1024)} GB
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter device serial to view metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}
