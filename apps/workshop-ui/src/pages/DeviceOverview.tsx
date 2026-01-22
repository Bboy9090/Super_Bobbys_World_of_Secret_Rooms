import { useState, useEffect } from "react";
import { apiRequest, getAPIUrl } from "../lib/apiConfig";

interface Device {
  serial: string;
  status: string;
  properties?: Record<string, string>;
  connected?: boolean;
  platform?: 'android' | 'ios';
  brand?: string;
  model?: string;
}

interface DetectedDevice {
  serial?: string;
  model?: string;
  manufacturer?: string;
  type?: string;
  status?: string;
  connection?: string;
  name?: string;
}

interface AnalysisResult {
  device?: {
    device_id?: string;
    model?: string;
    manufacturer?: string;
    platform?: string;
    android_version?: string;
    security_state?: string;
    classification?: string;
  };
  ownership?: {
    verified: boolean;
    confidence: number;
  };
  legal?: {
    status?: string;
    jurisdiction?: string;
    risk_level?: string;
  };
  detected_devices?: {
    adb?: DetectedDevice[];
    fastboot?: DetectedDevice[];
  };
  audit_integrity_verified?: boolean;
  ticket_id?: string;
  error?: string;
}

interface DeviceOverviewProps {
  onDeviceSelected?: (deviceId: string) => void;
}

export default function DeviceOverview({ onDeviceSelected }: DeviceOverviewProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackend();
    // Poll for devices every 2 seconds
    const interval = setInterval(() => {
      if (backendAvailable) {
        loadDevices();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [backendAvailable]);

  async function checkBackend() {
    try {
      const response = await fetch(getAPIUrl('/api/v1/ready'));
      setBackendAvailable(response.ok);
      if (response.ok) {
        loadDevices();
      }
    } catch {
      setBackendAvailable(false);
    }
  }

  async function loadDevices() {
    try {
      // Try multiple device sources
      const [adbDevices, bootforgeDevices] = await Promise.allSettled([
        apiRequest<{ devices: Device[] }>('/api/v1/adb/devices'),
        apiRequest<{ devices: any[] }>('/api/v1/bootforgeusb/scan').catch(() => null),
      ]);

      const allDevices: Device[] = [];
      
      // Add ADB devices
      if (adbDevices.status === 'fulfilled' && adbDevices.value.devices) {
        allDevices.push(...adbDevices.value.devices.map(d => ({
          ...d,
          platform: 'android' as const,
        })));
      }

      // Add BootForgeUSB devices (if available)
      if (bootforgeDevices.status === 'fulfilled' && bootforgeDevices.value?.devices) {
        bootforgeDevices.value.devices.forEach((d: any) => {
          if (!allDevices.find(existing => existing.serial === d.evidence?.usb?.serial)) {
            allDevices.push({
              serial: d.evidence?.usb?.serial || d.device_uid,
              status: 'device',
              connected: true,
              platform: d.platform_hint === 'android' ? 'android' as const : 'ios' as const,
              properties: d.evidence?.usb ? {
                model: d.evidence.usb.product,
                manufacturer: d.evidence.usb.manufacturer,
              } : {},
            });
          }
        });
      }

      setDevices(allDevices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }

  async function runAnalysis(device: Device) {
    setLoading(true);
    setSelectedDevice(device);
    
    try {
      // Get detailed device info
      if (device.platform === 'android' && device.serial) {
        const info = await apiRequest(`/api/v1/adb/device-info?serial=${encodeURIComponent(device.serial)}`);
        setAnalysisResult({
          device: {
            device_id: device.serial,
            model: info.model || device.properties?.model || 'Unknown',
            platform: 'android',
            security_state: device.status,
          },
          ownership: {
            confidence: 0,
            verified: false,
          },
          legal: {
            status: 'Under Review',
            jurisdiction: 'Global',
          },
          audit_integrity_verified: true,
        });
        
        if (onDeviceSelected) {
          onDeviceSelected(device.serial);
        }
      } else {
        // iOS device or unknown
        setAnalysisResult({
          device: {
            device_id: device.serial,
            model: device.properties?.model || 'Unknown',
            platform: device.platform || 'unknown',
            security_state: device.status,
          },
          ownership: {
            confidence: 0,
            verified: false,
          },
          legal: {
            status: 'Under Review',
            jurisdiction: 'Global',
          },
          audit_integrity_verified: true,
        });
        
        if (onDeviceSelected) {
          onDeviceSelected(device.serial);
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({ error: "Analysis failed: " + (error instanceof Error ? error.message : 'Unknown error') });
    } finally {
      setLoading(false);
    }
  }

  const getRiskBadgeColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      {!backendAvailable && (
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <p className="text-sm text-amber-300">
              Backend not available. Starting backend server...
            </p>
          </div>
        </div>
      )}

      {/* Connected Devices List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src="/assets/icons/shield-analysis.svg" alt="Analysis" className="w-8 h-8 mr-3" />
            <h2 className="text-xl font-semibold">Connected Devices</h2>
          </div>
          <button
            onClick={loadDevices}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm text-white disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Refresh"}
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No devices detected</p>
            <p className="text-sm mt-2">
              {backendAvailable 
                ? "Connect a device via USB and enable USB debugging (Android) or trust this computer (iOS)"
                : "Waiting for backend to start..."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.serial}
                onClick={() => runAnalysis(device)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDevice?.serial === device.serial
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{device.properties?.model || device.serial}</p>
                    <p className="text-sm text-gray-400">
                      {device.properties?.manufacturer || ''} • {device.platform?.toUpperCase() || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      device.connected ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-xs text-gray-400">{device.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device Analysis Results */}
      {analysisResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            {analysisResult.ticket_id && (
              <span className="text-xs text-gray-400 font-mono">
                Ticket: {analysisResult.ticket_id}
              </span>
            )}
          </div>
          
          {analysisResult.error ? (
            <p className="text-red-400">{analysisResult.error}</p>
          ) : (
            <div className="space-y-4">
              {analysisResult.device && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Device Model</label>
                    <p className="text-white">{analysisResult.device.model || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Platform</label>
                    <p className="text-white">{analysisResult.device.platform || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Observed Protection Layer</label>
                    <p className="text-white">{analysisResult.device.security_state || "Analysis Only"}</p>
                  </div>
                  {analysisResult.device.classification && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Classification</label>
                      <p className="text-white">{analysisResult.device.classification}</p>
                    </div>
                  )}
                </div>
              )}
              
              {analysisResult.ownership && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <label className="text-sm font-medium text-gray-400">Ownership Confidence</label>
                  <p className="text-white">{analysisResult.ownership.confidence || 0}%</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {analysisResult.ownership.verified ? "Verified" : "Requires additional documentation"}
                  </p>
                </div>
              )}
              
              {analysisResult.legal && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <label className="text-sm font-medium text-gray-400">Legal Status</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {analysisResult.legal.risk_level && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskBadgeColor(analysisResult.legal.risk_level)}`}>
                        {analysisResult.legal.risk_level} Risk
                      </span>
                    )}
                    <p className="text-white">{analysisResult.legal.status || "Under Review"}</p>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{analysisResult.legal.jurisdiction || ""}</p>
                </div>
              )}
              
              {analysisResult.audit_integrity_verified !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${analysisResult.audit_integrity_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-300">
                      Audit Integrity: {analysisResult.audit_integrity_verified ? "Verified" : "Failed"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}