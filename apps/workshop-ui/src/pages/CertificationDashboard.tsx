import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Certification {
  level: string;
  requirements: string[];
  status: "complete" | "in_progress" | "not_started";
}

export default function CertificationDashboard() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  async function loadCertifications() {
    setLoading(true);
    try {
      const result = await invoke<string>("get_certifications");
      setCertifications(JSON.parse(result));
    } catch (error) {
      console.error("Failed to load certifications:", error);
      // Mock data for now
      setCertifications([
        {
          level: "Level I - Technician",
          requirements: ["Device analysis basics", "Compliance reporting", "Audit log understanding"],
          status: "complete",
        },
        {
          level: "Level II - Specialist",
          requirements: ["Legal classification", "Ownership verification", "Authority routing"],
          status: "in_progress",
        },
        {
          level: "Level III - Custodian",
          requirements: ["Interpretive review", "High-risk case handling", "Legal framework expertise"],
          status: "not_started",
        },
      ]);
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