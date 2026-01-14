import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface DeviceOverviewProps {
  onDeviceSelected?: (deviceId: string) => void;
}

export default function DeviceOverview({ onDeviceSelected }: DeviceOverviewProps) {
  const [deviceInfo, setDeviceInfo] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    try {
      const result = await invoke<string>("analyze_device", {
        deviceInfo,
        actor: "user",
      });
      const parsed = JSON.parse(result);
      setAnalysisResult(parsed);
      if (parsed.device?.device_id && onDeviceSelected) {
        onDeviceSelected(parsed.device.device_id);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({ error: "Analysis failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <img src="/assets/icons/shield-analysis.svg" alt="Analysis" className="w-8 h-8 mr-3" />
          <h2 className="text-xl font-semibold">Device Insight</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Device Information
            </label>
            <textarea
              value={deviceInfo}
              onChange={(e) => setDeviceInfo(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              rows={3}
              placeholder="Enter device details (e.g., iPhone 13 Pro - Clean device)"
            />
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading || !deviceInfo.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium text-white"
          >
            {loading ? "Analyzing..." : "Analyze Device State"}
          </button>
        </div>
      </div>

      {analysisResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          
          {analysisResult.error ? (
            <p className="text-red-400">{analysisResult.error}</p>
          ) : (
            <div className="space-y-4">
              {analysisResult.device && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Device Model</label>
                  <p className="text-white">{analysisResult.device.model || "Unknown"}</p>
                </div>
              )}
              
              {analysisResult.device && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Platform</label>
                  <p className="text-white">{analysisResult.device.platform || "Unknown"}</p>
                </div>
              )}
              
              {analysisResult.device && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Observed Protection Layer</label>
                  <p className="text-white">{analysisResult.device.security_state || "Analysis Only"}</p>
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
                  <p className="text-white">{analysisResult.legal.status || "Under Review"}</p>
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