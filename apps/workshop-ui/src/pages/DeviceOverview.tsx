import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface DeviceOverviewProps {
  onDeviceSelected?: (deviceId: string) => void;
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

export default function DeviceOverview({ onDeviceSelected }: DeviceOverviewProps) {
  const [deviceInfo, setDeviceInfo] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<DetectedDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Detect connected devices on mount and periodically
  const detectDevices = useCallback(async () => {
    setDetecting(true);
    try {
      const result = await invoke<string>("detect_connected_devices");
      const parsed = JSON.parse(result);
      
      if (parsed.success && parsed.data) {
        const devices: DetectedDevice[] = [
          ...(parsed.data.adb || []),
          ...(parsed.data.fastboot || [])
        ];
        setConnectedDevices(devices);
      } else if (parsed.data) {
        // Direct response format
        const devices: DetectedDevice[] = [
          ...(parsed.data.adb || []),
          ...(parsed.data.fastboot || [])
        ];
        setConnectedDevices(devices);
      }
    } catch (err) {
      console.error("Device detection failed:", err);
      // Don't set error state - detection may not be available
    } finally {
      setDetecting(false);
    }
  }, []);

  useEffect(() => {
    detectDevices();
    // Refresh every 10 seconds
    const interval = setInterval(detectDevices, 10000);
    return () => clearInterval(interval);
  }, [detectDevices]);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("analyze_device", {
        deviceInfo,
        actor: "user",
      });
      const parsed: AnalysisResult = JSON.parse(result);
      setAnalysisResult(parsed);
      
      if (parsed.device?.device_id && onDeviceSelected) {
        onDeviceSelected(parsed.device.device_id);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(String(err));
      setAnalysisResult({ error: "Analysis failed - check device connection" });
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
      {/* Connected Devices Panel */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold">Connected Devices</h2>
          </div>
          <button
            onClick={detectDevices}
            disabled={detecting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {detecting ? "Scanning..." : "Refresh"}
          </button>
        </div>

        {connectedDevices.length > 0 ? (
          <div className="space-y-3">
            {connectedDevices.map((device, index) => (
              <div 
                key={device.serial || index}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {device.model || device.name || "Unknown Device"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {device.manufacturer && `${device.manufacturer} • `}
                      {device.serial || "No serial"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full border ${
                    device.connection === "fastboot" 
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}>
                    {device.connection?.toUpperCase() || device.type?.toUpperCase() || "USB"}
                  </span>
                  <button
                    onClick={() => {
                      setDeviceInfo(`${device.model || ''} - ${device.serial || ''}`);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p>No devices detected</p>
            <p className="text-sm mt-1">Connect a device via USB and enable USB debugging</p>
          </div>
        )}
      </div>

      {/* Analysis Panel */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <img src="/assets/icons/shield-analysis.svg" alt="Analysis" className="w-8 h-8 mr-3" />
          <h2 className="text-xl font-semibold">Device Analysis</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Device Information
            </label>
            <textarea
              value={deviceInfo}
              onChange={(e) => setDeviceInfo(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              rows={3}
              placeholder="Enter device details or select a connected device above..."
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={runAnalysis}
            disabled={loading || !deviceInfo.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-medium text-white transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze Device State
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {analysisResult && (
        <div className="bg-gray-800 rounded-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            {analysisResult.ticket_id && (
              <span className="text-xs text-gray-400 font-mono">
                Ticket: {analysisResult.ticket_id}
              </span>
            )}
          </div>
          
          {analysisResult.error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400">{analysisResult.error}</p>
              <p className="text-sm text-gray-400 mt-2">
                Ensure a device is connected via USB with debugging enabled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Info */}
              {analysisResult.device && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Device</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Model</span>
                      <p className="text-white font-medium">{analysisResult.device.model || "Unknown"}</p>
                    </div>
                    {analysisResult.device.manufacturer && (
                      <div>
                        <span className="text-xs text-gray-500">Manufacturer</span>
                        <p className="text-white">{analysisResult.device.manufacturer}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-gray-500">Platform</span>
                      <p className="text-white">{analysisResult.device.platform || "Unknown"}</p>
                    </div>
                    {analysisResult.device.android_version && (
                      <div>
                        <span className="text-xs text-gray-500">Android Version</span>
                        <p className="text-white">{analysisResult.device.android_version}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security State */}
              {analysisResult.device && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Security</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Security State</span>
                      <p className="text-white">{analysisResult.device.security_state || "Unknown"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Classification</span>
                      <p className="text-white">{analysisResult.device.classification || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ownership */}
              {analysisResult.ownership && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Ownership</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      analysisResult.ownership.verified 
                        ? 'bg-green-500/20' 
                        : 'bg-yellow-500/20'
                    }`}>
                      <span className="text-lg font-bold">
                        {analysisResult.ownership.confidence}%
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {analysisResult.ownership.verified ? "Verified" : "Requires Verification"}
                      </p>
                      <p className="text-sm text-gray-400">Ownership Confidence</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Status */}
              {analysisResult.legal && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Legal Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRiskBadgeColor(analysisResult.legal.risk_level)}`}>
                        {analysisResult.legal.risk_level || "Unknown"} Risk
                      </span>
                    </div>
                    <p className="text-white">{analysisResult.legal.status || "Under Review"}</p>
                    {analysisResult.legal.jurisdiction && (
                      <p className="text-sm text-gray-400">
                        Jurisdiction: {analysisResult.legal.jurisdiction}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit Integrity */}
          {analysisResult.audit_integrity_verified !== undefined && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  analysisResult.audit_integrity_verified ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-300">
                  Audit Integrity: {analysisResult.audit_integrity_verified ? "Verified" : "Failed"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
