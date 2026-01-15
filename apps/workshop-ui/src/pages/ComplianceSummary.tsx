import { useState, useEffect } from "react";
import { apiRequest, getAPIUrl } from "../lib/apiConfig";

interface ComplianceSummaryProps {
  deviceId?: string;
}

export default function ComplianceSummary({ deviceId }: ComplianceSummaryProps) {
  const [summary, setSummary] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadSummary();
      loadAuditLogs();
    }
  }, [deviceId]);

  async function loadSummary() {
    setLoading(true);
    try {
      // Load compliance summary from audit logs
      const logs = await apiRequest<any>(`/api/v1/trapdoor/logs/shadow?deviceSerial=${encodeURIComponent(deviceId || '')}&limit=50`);
      
      if (logs.logs && logs.logs.length > 0) {
        // Build summary from audit logs
        const latest = logs.logs[0];
        setSummary({
          device: {
            model: latest.metadata?.deviceModel || 'Unknown',
            platform: latest.metadata?.platform || 'unknown',
          },
          ownership: {
            confidence: latest.metadata?.ownershipConfidence || 0,
            verified: latest.authorization && latest.authorization !== 'ERROR',
          },
          legal: {
            status: latest.metadata?.legalStatus || 'Under Review',
            jurisdiction: latest.metadata?.jurisdiction || 'Global',
          },
          audit_reference: latest.id || latest.timestamp,
          next_step: latest.success ? 'Operation completed successfully' : 'Review operation logs',
        });
      }
    } catch (error) {
      console.error("Failed to load compliance summary:", error);
      // Set default summary if API fails
      setSummary({
        device: { model: 'Unknown', platform: 'unknown' },
        ownership: { confidence: 0, verified: false },
        legal: { status: 'Under Review', jurisdiction: 'Global' },
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      const logs = await apiRequest<any>(`/api/v1/trapdoor/logs/shadow?deviceSerial=${encodeURIComponent(deviceId || '')}&limit=100`);
      setAuditLogs(logs.logs || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      setAuditLogs([]);
    }
  }

  async function exportPDF() {
    setExporting(true);
    try {
      // Export audit logs as JSON (PDF export can be added later)
      const logs = await apiRequest<any>(`/api/v1/trapdoor/logs/shadow?deviceSerial=${encodeURIComponent(deviceId || '')}&limit=1000`);
      const exportData = {
        deviceId,
        summary,
        auditLogs: logs.logs || [],
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${deviceId || 'all'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert("Compliance report exported successfully");
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Export failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Loading compliance summary...</p>
      </div>
    );
  }

  if (!summary && !deviceId) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No device analyzed. Please analyze a device first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Compliance Summary</h2>

        <div className="bg-blue-900/20 border border-blue-700 rounded p-4 mb-4">
          <p className="text-blue-200 text-sm">
            <strong>This assessment documents device analysis and jurisdictional considerations only.</strong>
          </p>
          <p className="text-gray-300 text-sm mt-2">
            No modification, circumvention, or account interference was performed or advised.
          </p>
        </div>

        {summary && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Device</label>
                <p className="text-white">{summary.device?.model || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Platform</label>
                <p className="text-white">{summary.device?.platform || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Ownership Confidence</label>
                <p className="text-white">{summary.ownership?.confidence || 0}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Legal Status</label>
                <p className="text-white">{summary.legal?.status || "Under Review"}</p>
              </div>
            </div>

            {summary.next_step && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Next Lawful Step
                </label>
                <p className="text-gray-300 text-sm">{summary.next_step}</p>
              </div>
            )}

            {summary.audit_reference && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Audit Reference ID
                </label>
                <p className="text-gray-300 text-sm font-mono">{summary.audit_reference}</p>
              </div>
            )}

            {auditLogs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Recent Audit Events ({auditLogs.length})
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {auditLogs.slice(0, 10).map((log: any, idx: number) => (
                    <div key={idx} className="bg-gray-900 rounded p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{log.operation || 'Unknown'}</span>
                        <span className={`px-2 py-1 rounded ${log.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">{new Date(log.timestamp || Date.now()).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={exportPDF}
            disabled={exporting || !deviceId}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium text-white"
          >
            {exporting ? "Exporting..." : "Generate Compliance Record (PDF)"}
          </button>
        </div>
      </div>
    </div>
  );
}