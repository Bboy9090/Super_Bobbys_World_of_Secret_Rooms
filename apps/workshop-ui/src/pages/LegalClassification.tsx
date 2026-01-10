import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface LegalClassificationProps {
  deviceId?: string;
}

export default function LegalClassification({ deviceId }: LegalClassificationProps) {
  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadClassification();
    }
  }, [deviceId]);

  async function loadClassification() {
    setLoading(true);
    try {
      const result = await invoke<string>("get_legal_classification", { deviceId });
      setClassification(JSON.parse(result));
    } catch (error) {
      console.error("Failed to load legal classification:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Loading legal classification...</p>
      </div>
    );
  }

  if (!classification) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No classification available. Analyze a device first.</p>
      </div>
    );
  }

  const statusColor = {
    permitted: "text-green-400",
    conditional: "text-amber-400",
    prohibited: "text-red-400",
  }[classification.status] || "text-gray-400";

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Legal Classification</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-400">Jurisdiction</label>
          <p className="text-white">{classification.jurisdiction}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400">Classification</label>
          <p className={`font-semibold ${statusColor}`}>{classification.status.toUpperCase()}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400">Rationale</label>
          <p className="text-gray-300 text-sm">{classification.rationale}</p>
        </div>

        {classification.status === "conditional" && (
          <div className="bg-amber-900/20 border border-amber-700 rounded p-4">
            <p className="text-amber-200 text-sm">
              <strong>Conditional Status:</strong> External authorization may be required from manufacturer, carrier, or legal authority.
            </p>
          </div>
        )}

        {classification.status === "prohibited" && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4">
            <p className="text-red-200 text-sm">
              <strong>Prohibited Status:</strong> Recovery is not permitted under current legal framework.
              No further action can be taken without court order or authorized executor consent.
            </p>
          </div>
        )}

        {classification.authorization_required && classification.authorization_required.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              External Authorization Required
            </label>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {classification.authorization_required.map((auth: string, idx: number) => (
                <li key={idx}>{auth}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}