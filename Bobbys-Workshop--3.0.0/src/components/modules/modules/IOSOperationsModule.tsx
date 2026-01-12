/**
 * IOSOperationsModule
 * 
 * Module content for iOS device operations
 * Connects to /api/v1/ios/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { Laptop, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface IOSDevice {
  udid: string;
  name?: string;
  deviceClass?: string;
  productType?: string;
  productVersion?: string;
  serialNumber?: string;
}

export function IOSOperationsModule() {
  const [devices, setDevices] = useState<IOSDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl('/api/v1/ios/scan'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data?.devices) {
          setDevices(data.data.devices);
        } else {
          setDevices([]);
        }
      } else {
        setDevices([]);
        setError('Failed to connect to backend');
      }
    } catch (error) {
      console.error('iOS device scan error:', error);
      setDevices([]);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanDevices();
    const interval = setInterval(scanDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">iOS Devices</h4>
        <button
          onClick={scanDevices}
          disabled={loading}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="Refresh devices"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {devices.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Laptop className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No iOS devices connected</p>
            <p className="text-xs mt-1">Connect an iOS device via USB</p>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.udid}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Laptop className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {device.name || device.productType || 'iOS Device'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">
                      {device.udid}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {device.productVersion && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                          iOS {device.productVersion}
                        </span>
                      )}
                      {device.productType && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                          {device.productType}
                        </span>
                      )}
                      {device.deviceClass && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                          {device.deviceClass}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        {devices.length} iOS device{devices.length !== 1 ? 's' : ''} connected
      </div>
    </div>
  );
}
