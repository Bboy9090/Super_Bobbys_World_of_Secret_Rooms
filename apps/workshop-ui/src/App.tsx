import { useMemo, useState } from "react";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummary";
import LegalClassification from "./pages/LegalClassification";
import CustodianVaultGate from "./pages/CustodianVaultGate";
import CertificationDashboard from "./pages/CertificationDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import "./App.css";

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [warpPipeMode, setWarpPipeMode] = useState<boolean>(true);

  const tabLabel = useMemo(() => {
    const labels: Record<TabType, string> = {
      dashboard: "Dashboard",
      analysis: "Device Analysis",
      compliance: "Compliance Summary",
      legal: "Legal Classification",
      certification: "Certification",
      vault: "Custodian Vault",
      operations: "Operations",
    };
    return labels;
  }, []);

  const warpZoneLabel = useMemo(() => {
    const zones: Record<TabType, string> = {
      dashboard: "Zone 1 • Start",
      analysis: "Zone 2 • Scanner",
      compliance: "Zone 3 • Audit",
      legal: "Zone 4 • Jurisdiction",
      certification: "Zone 5 • Badge Check",
      vault: "Zone 6 • Vault Pipe",
      operations: "Zone 7 • Control Tower",
    };
    return zones;
  }, []);

  return (
    <div className={`min-h-screen text-white ${warpPipeMode ? "theme-warp" : "bg-gray-900"}`}>
      <header className={`p-4 border-b ${warpPipeMode ? "theme-warp__header" : "bg-gray-800 border-gray-700"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/assets/icons/app-icon.svg" alt="REFORGE OS" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">REFORGE OS</h1>
              <p className="text-sm text-gray-400">Analysis • Classification • Lawful Routing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Professional Repair Platform</div>
            <button
              type="button"
              onClick={() => setWarpPipeMode((v) => !v)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                warpPipeMode
                  ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
              aria-pressed={warpPipeMode}
              title="Toggle Warp Pipe Zones theme"
            >
              {warpPipeMode ? "Warp Pipe Zones: ON" : "Warp Pipe Zones: OFF"}
            </button>
          </div>
        </div>
      </header>

      <nav className={`${warpPipeMode ? "theme-warp__nav" : "bg-gray-800 border-b border-gray-700"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex flex-wrap gap-3 py-3 ${warpPipeMode ? "" : "space-x-8"}`}>
            {(Object.keys(tabLabel) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  warpPipeMode
                    ? `warp-tab ${activeTab === tab ? "warp-tab--active" : ""}`
                    : `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? tab === "vault"
                            ? "border-amber-500 text-amber-400"
                            : tab === "operations"
                              ? "border-green-500 text-green-400"
                              : "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`
                }
                title={warpPipeMode ? `${warpZoneLabel[tab]} — ${tabLabel[tab]}` : tabLabel[tab]}
              >
                <span className="warp-tab__zone">{warpPipeMode ? warpZoneLabel[tab] : ""}</span>
                <span className="warp-tab__label">{tabLabel[tab]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === "dashboard" && <DeviceOverview />}
        {activeTab === "analysis" && <DeviceOverview onDeviceSelected={setDeviceId} />}
        {activeTab === "compliance" && <ComplianceSummary deviceId={deviceId || undefined} />}
        {activeTab === "legal" && <LegalClassification deviceId={deviceId || undefined} />}
        {activeTab === "certification" && <CertificationDashboard />}
        {activeTab === "vault" && <CustodianVaultGate deviceId={deviceId || undefined} />}
        {activeTab === "operations" && <OpsDashboard />}
      </main>

      <footer className={`${warpPipeMode ? "theme-warp__footer" : "bg-gray-800 border-t border-gray-700"} mt-12 py-4`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>This platform provides analysis and documentation only.</p>
          <p className="mt-1">No modification, circumvention, or account interference is performed or advised.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;