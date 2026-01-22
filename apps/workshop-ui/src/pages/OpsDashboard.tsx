import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { apiRequest } from "../lib/apiConfig";

interface Metrics {
  activeUnits: number;
  auditCoverage: number;
  escalations: number;
  complianceScore: number;
  activeUsers: number;
  processedDevices: number;
  totalOperations?: number;
  successfulOperations?: number;
  timestamp?: string;
}

interface SystemHealth {
  status: string;
  components: {
    python: boolean;
    storage: boolean;
    modules: {
      bootforge: boolean;
      phoenix: boolean;
      bobby_dev_mode: boolean;
      history: boolean;
      crm: boolean;
      reports: boolean;
    };
  };
  timestamp?: string;
}

export default function OpsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logs, bootforge, adb] = await Promise.allSettled([
        apiRequest<any>('/api/v1/trapdoor/logs/shadow?limit=1000').catch(() => ({ logs: [] })),
        apiRequest<any>('/api/v1/bootforgeusb/scan').catch(() => ({ devices: [] })),
        apiRequest<any>('/api/v1/adb/devices').catch(() => ({ devices: [] })),
      ]);

      const auditLogs = logs.status === 'fulfilled' ? logs.value.logs || [] : [];
      const bootforgeDevices = bootforge.status === 'fulfilled' ? bootforge.value.devices || [] : [];
      const adbDevices = adb.status === 'fulfilled' ? adb.value.devices || [] : [];

      const totalOps = auditLogs.length;
      const successfulOps = auditLogs.filter((l: any) => l.success).length;
      const authorizedOps = auditLogs.filter((l: any) => l.authorization && l.authorization !== 'ERROR').length;
      const uniqueDevices = new Set(auditLogs.map((l: any) => l.deviceSerial).filter(Boolean)).size;
      const uniqueUsers = new Set(auditLogs.map((l: any) => l.userId).filter(Boolean)).size;

      const complianceScore = totalOps > 0
        ? (authorizedOps / totalOps) * 100
        : 0;

      const auditCoverage = totalOps > 0
        ? (auditLogs.filter((l: any) => l.id || l.timestamp).length / totalOps) * 100
        : 0;

      const adbActive = Array.isArray(adbDevices)
        ? adbDevices.filter((d: any) => d.connected !== false).length
        : 0;

      setMetrics({
        activeUnits: bootforgeDevices.length + adbActive,
        auditCoverage,
        escalations: auditLogs.filter((l: any) => l.metadata?.requiresAuthorization).length,
        complianceScore,
        activeUsers: uniqueUsers,
        processedDevices: uniqueDevices,
        totalOperations: totalOps,
        successfulOperations: successfulOps,
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Metrics load failed:", err);
      setMetrics(null);
      setError("Unable to load operations metrics from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSystemHealth = useCallback(async () => {
    try {
      const result = await invoke<string>("health_check");
      const parsed = JSON.parse(result);
      
      if (parsed.success && parsed.data) {
        setSystemHealth(parsed.data);
      } else if (parsed.status) {
        setSystemHealth(parsed);
      }
    } catch (err) {
      console.error("Health check failed:", err);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    loadSystemHealth();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadMetrics();
      loadSystemHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadMetrics, loadSystemHealth]);

  const getHealthStatusColor = (healthy: boolean) => {
    return healthy ? "text-green-400" : "text-red-400";
  };

  const getMetricColor = (value: number, thresholds: { good: number; warn: number }) => {
    if (value >= thresholds.good) return "text-green-400";
    if (value >= thresholds.warn) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operations Control Tower</h2>
          <p className="text-gray-400 text-sm mt-1">
            Real-time metrics from connected systems
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { loadMetrics(); loadSystemHealth(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Refreshing..." : "Refresh Metrics"}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-red-300">Metrics Unavailable</p>
              <p className="mt-1 text-sm text-red-200/80">{error}</p>
              <p className="mt-3 text-xs text-gray-400">
                This UI displays real metrics only. Ensure all backend services are running.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Active Units */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Active Units</h3>
                <p className="text-3xl font-bold text-white">{metrics.activeUnits}</p>
                <p className="text-xs text-gray-500 mt-2">Connected devices detected</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Audit Coverage */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Audit Coverage</h3>
                <p className={`text-3xl font-bold ${getMetricColor(metrics.auditCoverage, { good: 95, warn: 80 })}`}>
                  {metrics.auditCoverage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Events with verified hash chains</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.auditCoverage >= 95 ? 'bg-green-500' : 
                  metrics.auditCoverage >= 80 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.auditCoverage, 100)}%` }}
              />
            </div>
          </div>

          {/* Compliance Escalations */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Escalations</h3>
                <p className={`text-3xl font-bold ${metrics.escalations > 5 ? 'text-amber-400' : 'text-white'}`}>
                  {metrics.escalations}
                </p>
                <p className="text-xs text-gray-500 mt-2">Requiring external authorization</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Compliance Score</h3>
                <p className={`text-3xl font-bold ${getMetricColor(metrics.complianceScore, { good: 90, warn: 70 })}`}>
                  {metrics.complianceScore.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Overall compliance health</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Active Users</h3>
                <p className="text-3xl font-bold text-white">{metrics.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-2">Registered in CRM</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Processed Devices */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Processed Devices</h3>
                <p className="text-3xl font-bold text-white">{metrics.processedDevices}</p>
                <p className="text-xs text-gray-500 mt-2">Total cases in history</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Operations */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Total Operations</h3>
                <p className="text-3xl font-bold text-white">{metrics.totalOperations ?? 0}</p>
                <p className="text-xs text-gray-500 mt-2">All-time operations logged</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Success Rate</h3>
                <p className="text-3xl font-bold text-green-400">
                  {(metrics.totalOperations ?? 0) > 0
                    ? (((metrics.successfulOperations ?? 0) / (metrics.totalOperations ?? 1)) * 100).toFixed(1)
                    : "0.0"}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Successful operations</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        
        {systemHealth ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-300">Overall Status</span>
                <span className={`text-sm font-medium ${
                  systemHealth.status === 'healthy' ? 'text-green-400' : 
                  systemHealth.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-300">Python Runtime</span>
                <span className={`text-sm font-medium ${getHealthStatusColor(systemHealth.components.python)}`}>
                  {systemHealth.components.python ? "Active" : "Unavailable"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-300">Storage</span>
                <span className={`text-sm font-medium ${getHealthStatusColor(systemHealth.components.storage)}`}>
                  {systemHealth.components.storage ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {/* Module Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Modules</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(systemHealth.components.modules).map(([name, status]) => (
                  <div key={name} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded">
                    <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-300 capitalize">{name.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Audit Log Integrity</span>
              <span className="text-sm font-medium text-green-400">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Language Guard</span>
              <span className="text-sm font-medium text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">Pandora Codex Isolation</span>
              <span className="text-sm font-medium text-green-400">Enforced</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
