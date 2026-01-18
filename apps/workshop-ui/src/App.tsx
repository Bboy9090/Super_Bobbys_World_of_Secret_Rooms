import { useMemo, useState, useEffect, useCallback } from "react";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummary";
import LegalClassification from "./pages/LegalClassification";
import CustodianVaultGate from "./pages/CustodianVaultGate";
import CertificationDashboard from "./pages/CertificationDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import "./App.css";

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault";

// Tab icons using SVG for crisp rendering
const TabIcons: Record<TabType, JSX.Element> = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  analysis: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  compliance: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  legal: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  certification: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  vault: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  operations: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [warpPipeMode, setWarpPipeMode] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<"online" | "checking" | "offline">("checking");

  // Simulate system status check on mount
  useEffect(() => {
    const checkStatus = async () => {
      setSystemStatus("checking");
      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 800));
      setSystemStatus("online");
    };
    checkStatus();
  }, []);

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
      dashboard: "Zone 1 - Start",
      analysis: "Zone 2 - Scanner",
      compliance: "Zone 3 - Audit",
      legal: "Zone 4 - Jurisdiction",
      certification: "Zone 5 - Badge Check",
      vault: "Zone 6 - Vault Pipe",
      operations: "Zone 7 - Control Tower",
    };
    return zones;
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  }, [activeTab]);

  const getStatusColor = useCallback(() => {
    switch (systemStatus) {
      case "online": return "bg-emerald-500";
      case "checking": return "bg-amber-500 animate-pulse";
      case "offline": return "bg-red-500";
    }
  }, [systemStatus]);

  const getStatusText = useCallback(() => {
    switch (systemStatus) {
      case "online": return "All Systems Operational";
      case "checking": return "Checking Systems...";
      case "offline": return "System Offline";
    }
  }, [systemStatus]);

  return (
    <div className={`min-h-screen text-white ${warpPipeMode ? "theme-warp" : "bg-gray-900"}`}>
      {/* Header */}
      <header className={`p-4 border-b ${warpPipeMode ? "theme-warp__header" : "bg-gray-800 border-gray-700"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="/assets/icons/app-icon.svg" 
                alt="REFORGE OS" 
                className="w-12 h-12 transition-transform duration-300 hover:scale-110" 
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()} ring-2 ring-gray-900`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                REFORGE OS
              </h1>
              <p className="text-xs text-gray-400 tracking-wide">
                Analysis - Classification - Lawful Routing
              </p>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span>{getStatusText()}</span>
            </div>

            {/* Version Badge */}
            <div className="hidden sm:block px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400">
              v3.0.0
            </div>

            {/* Warp Mode Toggle */}
            <button
              type="button"
              onClick={() => setWarpPipeMode((v) => !v)}
              className={`relative overflow-hidden rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                warpPipeMode
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
              aria-pressed={warpPipeMode}
              title="Toggle Warp Pipe Zones theme"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Warp Zones: {warpPipeMode ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${warpPipeMode ? "theme-warp__nav" : "bg-gray-800 border-b border-gray-700"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex flex-wrap gap-2 py-3 ${warpPipeMode ? "" : "space-x-4"}`}>
            {(Object.keys(tabLabel) as TabType[]).map((tab, index) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={
                  warpPipeMode
                    ? `warp-tab animate-fade-in ${activeTab === tab ? "warp-tab--active" : ""}`
                    : `flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === tab
                          ? tab === "vault"
                            ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                            : tab === "operations"
                              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                              : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                      }`
                }
                title={warpPipeMode ? `${warpZoneLabel[tab]} - ${tabLabel[tab]}` : tabLabel[tab]}
              >
                {warpPipeMode ? (
                  <>
                    <span className="warp-tab__zone">{warpZoneLabel[tab]}</span>
                    <span className="warp-tab__label">{tabLabel[tab]}</span>
                  </>
                ) : (
                  <>
                    {TabIcons[tab]}
                    <span>{tabLabel[tab]}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto py-6 px-4 transition-opacity duration-150 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
        <div className="animate-fade-in">
          {activeTab === "dashboard" && <DeviceOverview />}
          {activeTab === "analysis" && <DeviceOverview onDeviceSelected={setDeviceId} />}
          {activeTab === "compliance" && <ComplianceSummary deviceId={deviceId || undefined} />}
          {activeTab === "legal" && <LegalClassification deviceId={deviceId || undefined} />}
          {activeTab === "certification" && <CertificationDashboard />}
          {activeTab === "vault" && <CustodianVaultGate deviceId={deviceId || undefined} />}
          {activeTab === "operations" && <OpsDashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${warpPipeMode ? "theme-warp__footer" : "bg-gray-800 border-t border-gray-700"} mt-12 py-6`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Compliance Notice */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                This platform provides analysis and documentation only.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                No modification, circumvention, or account interference is performed or advised.
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-gray-400">Compliance Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-gray-400">Audit Secured</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
