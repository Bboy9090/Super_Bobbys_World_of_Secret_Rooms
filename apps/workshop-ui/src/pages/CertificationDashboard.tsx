import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface Certification {
  level: string;
  requirements: string[];
  status: "complete" | "in_progress" | "not_started";
}

export default function CertificationDashboard() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertifications();
  }, []);

  async function loadCertifications() {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("get_certifications");
      setCertifications(JSON.parse(result));
    } catch (error) {
      console.error("Failed to load certifications:", error);
      setCertifications([]);
      setError("Unable to load certification status from the local runtime.");
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = {
    complete: "bg-green-600 text-white",
    in_progress: "bg-amber-600 text-white",
    not_started: "bg-gray-600 text-gray-300",
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Certification Dashboard</h2>

      {loading ? (
        <p className="text-gray-400">Loading certifications...</p>
      ) : error ? (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
          <p className="text-sm font-medium text-red-300">Certifications unavailable</p>
          <p className="mt-1 text-sm text-red-200/80">{error}</p>
          <p className="mt-3 text-xs text-gray-400">
            This UI only displays real certification data; it does not fabricate placeholder records.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {certifications.map((cert, idx) => (
            <div key={idx} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{cert.level}</h3>
                <span className={`px-3 py-1 rounded text-xs font-medium ${statusBadge[cert.status]}`}>
                  {cert.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Requirements</label>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {cert.requirements.map((req, reqIdx) => (
                    <li key={reqIdx}>{req}</li>
                  ))}
                </ul>
              </div>

              {cert.status !== "complete" && (
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-sm text-white">
                  View Requirements
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Certification demonstrates competency in compliance-first device analysis and lawful recovery routing.
        </p>
      </div>
    </div>
  );
}