import { useState } from "react";
import { apiRequest } from "../lib/apiConfig";

interface CustodianVaultGateProps {
  confidence?: number;
  deviceId?: string;
}

export default function CustodianVaultGate({ confidence = 0, deviceId }: CustodianVaultGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [interpretiveData, setInterpretiveData] = useState<any>(null);
  const [secretRooms, setSecretRooms] = useState<any>(null);

  if (confidence < 85) {
    return (
      <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-amber-400 mb-4">Ownership Confidence Insufficient</h2>
        <p className="text-gray-300 mb-4">
          Ownership confidence score ({confidence}%) is below the threshold required for interpretive review.
        </p>
        <p className="text-gray-400 text-sm">
          External authorization from manufacturer, carrier, or legal authority is required.
        </p>
      </div>
    );
  }

  async function loadInterpretiveData() {
    try {
      // Load Secret Rooms status
      const rooms = await apiRequest<any>('/api/v1/trapdoor/status').catch(() => ({ secretRooms: null }));
      setSecretRooms(rooms.secretRooms || null);
      
      // Load audit logs for interpretive context
      const logs = await apiRequest<any>(`/api/v1/trapdoor/logs/shadow?deviceSerial=${encodeURIComponent(deviceId || '')}&limit=50`).catch(() => ({ logs: [] }));
      
      setInterpretiveData({
        context: `Device ${deviceId || 'not specified'}. Total operations: ${logs.logs?.length || 0}. Successful operations: ${logs.logs?.filter((l: any) => l.success).length || 0}.`,
        legal_framework: "All operations are logged immutably. Ownership verification is required for all bypass/unlock operations. Operations comply with local jurisdiction requirements.",
        recommended_pathway: logs.logs?.length > 0 
          ? "Review audit history for device operations. Ensure ownership verification before proceeding with any bypass or unlock operations."
          : "Begin device analysis to establish ownership and legal classification before attempting any operations.",
        audit_history: logs.logs || [],
      });
    } catch (error) {
      console.error("Failed to load interpretive context:", error);
      setInterpretiveData({
        context: "Unable to load interpretive context from backend.",
        legal_framework: "All operations require ownership verification and legal compliance.",
        recommended_pathway: "Ensure backend is running and device is connected.",
      });
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <img src="/assets/icons/vault-mark.svg" alt="Vault" className="w-8 h-8 mr-3" />
        <h2 className="text-xl font-semibold">Custodian Vault — Interpretive Mode</h2>
      </div>

      <div className="bg-amber-900/20 border border-amber-700 rounded p-4 mb-4">
        <p className="text-amber-200 text-sm mb-2">
          <strong>Analysis Only.</strong> No actions executed. All activity logged for compliance.
        </p>
        <p className="text-gray-300 text-sm">
          This view provides historical context and legal framework analysis.
          No procedural guidance or executable steps are provided.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
          />
          <span className="text-sm text-gray-300">
            I acknowledge that interpretive review provides context only and does not enable device modification.
          </span>
        </label>

        {acknowledged && (
          <button
            onClick={loadInterpretiveData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-white"
          >
            Load Interpretive Context
          </button>
        )}

        {interpretiveData && (
          <div className="bg-gray-900 rounded p-4 mt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Historical Context</h3>
              <p className="text-sm text-gray-300 mb-2">{interpretiveData.context}</p>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium text-gray-400 text-sm mb-2">Legal Framework</h4>
              <p className="text-sm text-gray-300">{interpretiveData.legal_framework}</p>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium text-gray-400 text-sm mb-2">Recommended Pathway</h4>
              <p className="text-sm text-gray-300">{interpretiveData.recommended_pathway}</p>
            </div>
            {secretRooms && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-medium text-gray-400 text-sm mb-2">Available Secret Rooms</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(secretRooms).map(([key, room]: [string, any]) => (
                    <div key={key} className="bg-gray-800 rounded p-2 text-xs">
                      <p className="text-white font-medium">{room.name || key}</p>
                      <p className="text-gray-400 mt-1">{room.available ? '✅ Available' : '❌ Unavailable'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {interpretiveData.audit_history && interpretiveData.audit_history.length > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-medium text-gray-400 text-sm mb-2">Recent Audit History</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {interpretiveData.audit_history.slice(0, 5).map((log: any, idx: number) => (
                    <div key={idx} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{log.operation || 'Unknown'}</span>
                        <span className={`px-2 py-0.5 rounded ${log.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                          {log.success ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}