import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ComplianceSummaryProps {
  deviceId?: string;
}

export default function ComplianceSummary({ deviceId }: ComplianceSummaryProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadSummary();
    }
  }, [deviceId]);

  async function loadSummary() {
    setLoading(true);
    try {
      const result = await invoke<string>("get_compliance_summary", { deviceId });
      setSummary(JSON.parse(result));
    } catch (error) {
      console.error("Failed to load compliance summary:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportPDF() {
    setExporting(true);
    try {
      await invoke("export_compliance_report", { deviceId: deviceId || "" });
      alert("Compliance report exported successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Export failed");
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