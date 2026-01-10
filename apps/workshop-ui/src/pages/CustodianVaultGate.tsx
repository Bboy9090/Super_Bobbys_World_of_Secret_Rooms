import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CustodianVaultGateProps {
  confidence?: number;
  deviceId?: string;
}

export default function CustodianVaultGate({ confidence = 0, deviceId }: CustodianVaultGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [interpretiveData, setInterpretiveData] = useState<any>(null);

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
      const result = await invoke<string>("get_interpretive_context", { deviceId });
      setInterpretiveData(JSON.parse(result));
    } catch (error) {
      console.error("Failed to load interpretive context:", error);
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
          <div className="bg-gray-900 rounded p-4 mt-4">
            <h3 className="font-semibold text-blue-400 mb-2">Historical Context</h3>
            <p className="text-sm text-gray-300 mb-2">{interpretiveData.context}</p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-medium text-gray-400 text-sm mb-2">Legal Framework</h4>
              <p className="text-sm text-gray-300">{interpretiveData.legal_framework}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-medium text-gray-400 text-sm mb-2">Recommended Pathway</h4>
              <p className="text-sm text-gray-300">{interpretiveData.recommended_pathway}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}