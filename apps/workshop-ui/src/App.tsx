/**
 * SUPER BOBBY'S WORLD: WARP ZONES
 * 
 * A legendary world map for systems.
 * Not a tool. Not a repair app. A WORLD.
 */

import { useMemo, useState, useEffect, useCallback } from "react";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummary";
import LegalClassification from "./pages/LegalClassification";
import CustodianVaultGate from "./pages/CustodianVaultGate";
import CertificationDashboard from "./pages/CertificationDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import { WorldMap, WorldZone, WORLD_ZONES } from "./components/WorldMap";
import { PowerStarDisplay, StarBadge } from "./components/PowerStarDisplay";
import { StarLevel, canAccessZone } from "./lib/powerStars";
import { 
  loadWorldState, 
  recordZoneVisit, 
  updateStarLevel,
  toggleWarpPipeMode,
  recordDeviceSeen,
  WorldSaveState,
  getSessionStats
} from "./lib/worldState";
import "./App.css";

// Map zones to tab types for backward compatibility
type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault";

const ZONE_TO_TAB: Record<WorldZone, TabType> = {
  boot: "dashboard",
  device: "analysis",
  signal: "compliance",
  memory: "legal",
  power: "certification",
  forge: "vault",
  shadow: "operations",
  chaos: "operations",
  core: "vault"
};

const TAB_TO_ZONE: Record<TabType, WorldZone> = {
  dashboard: "boot",
  analysis: "device",
  compliance: "signal",
  legal: "memory",
  certification: "power",
  vault: "forge",
  operations: "shadow"
};

function App() {
  // World State - persisted across sessions
  const [worldState, setWorldState] = useState<WorldSaveState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<"online" | "checking" | "offline">("checking");

  // Load world state on mount
  useEffect(() => {
    const state = loadWorldState();
    setWorldState(state);
    
    // System status check
    const checkStatus = async () => {
      setSystemStatus("checking");
      await new Promise(resolve => setTimeout(resolve, 800));
      setSystemStatus("online");
    };
    checkStatus();
  }, []);

  // Derived state from world state
  const currentZone = worldState?.currentZone ?? "boot";
  const starLevel = worldState?.starLevel ?? 0;
  const warpPipeMode = worldState?.warpPipeMode ?? true;
  const activeTab = ZONE_TO_TAB[currentZone] ?? "dashboard";

  // Session stats
  const sessionStats = useMemo(() => {
    if (!worldState) return null;
    return getSessionStats();
  }, [worldState]);

  const handleZoneChange = useCallback((zone: WorldZone) => {
    if (!canAccessZone(starLevel, zone)) {
      console.warn(`Zone ${zone} requires higher star level`);
      return;
    }
    
    if (zone === currentZone) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const newState = recordZoneVisit(zone);
      setWorldState(newState);
      setIsTransitioning(false);
    }, 150);
  }, [currentZone, starLevel]);

  const handleTabChange = useCallback((tab: TabType) => {
    const zone = TAB_TO_ZONE[tab];
    handleZoneChange(zone);
  }, [handleZoneChange]);

  const handleStarLevelChange = useCallback((level: StarLevel) => {
    const newState = updateStarLevel(level);
    setWorldState(newState);
  }, []);

  const handleWarpPipeModeToggle = useCallback(() => {
    const newState = toggleWarpPipeMode();
    setWorldState(newState);
  }, []);

  const handleDeviceSelected = useCallback((id: string) => {
    setDeviceId(id);
    // Record device in world state
    recordDeviceSeen({ id, model: id, platform: "detected" });
  }, []);

  const tabLabel = useMemo(() => ({
    dashboard: "Dashboard",
    analysis: "Device Analysis",
    compliance: "Compliance Summary",
    legal: "Legal Classification",
    certification: "Certification",
    vault: "Custodian Vault",
    operations: "Operations",
  }), []);

  const getZoneLabel = (zone: WorldZone) => WORLD_ZONES[zone];

  const getStatusColor = () => {
    switch (systemStatus) {
      case "online": return "bg-emerald-500";
      case "checking": return "bg-amber-500 animate-pulse";
      case "offline": return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case "online": return "All Systems Operational";
      case "checking": return "Checking Systems...";
      case "offline": return "System Offline";
    }
  };

  if (!worldState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading World State...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white ${warpPipeMode ? "theme-warp" : "bg-gray-900"}`}>
      {/* Header */}
      <header className={`p-4 border-b ${warpPipeMode ? "theme-warp__header" : "bg-gray-800 border-gray-700"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                🍄
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()} ring-2 ring-gray-900`} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                SUPER BOBBY'S WORLD
              </h1>
              <p className="text-xs text-gray-400 tracking-wide">
                WARP ZONES • {getZoneLabel(currentZone).name}
              </p>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-4">
            {/* Session Stats */}
            {sessionStats && (
              <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
                <span>📱 {sessionStats.totalDevicesSeen} devices</span>
                <span>🗺️ {sessionStats.totalZonesVisited} visits</span>
              </div>
            )}

            {/* Star Level Badge */}
            <StarBadge level={starLevel} />

            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span>{getStatusText()}</span>
            </div>

            {/* World Map Toggle */}
            <button
              onClick={() => setShowWorldMap(!showWorldMap)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                showWorldMap
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">World Map</span>
            </button>

            {/* Warp Mode Toggle */}
            <button
              type="button"
              onClick={handleWarpPipeModeToggle}
              className={`relative overflow-hidden rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                warpPipeMode
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
            >
              🍄 Warp: {warpPipeMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </header>

      {/* World Map Panel */}
      {showWorldMap && (
        <div className="bg-gray-900/95 border-b border-gray-700 p-4 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">World Map</h2>
                <p className="text-sm text-gray-400">Navigate between zones. Stars unlock access.</p>
              </div>
              <PowerStarDisplay 
                level={starLevel} 
                onLevelChange={handleStarLevelChange}
                compact
              />
            </div>
            <WorldMap 
              currentZone={currentZone}
              starLevel={starLevel}
              onZoneSelect={handleZoneChange}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`${warpPipeMode ? "theme-warp__nav" : "bg-gray-800 border-b border-gray-700"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 py-3">
            {Object.entries(ZONE_TO_TAB)
              .filter(([zone]) => !["chaos", "core"].includes(zone))
              .map(([zone, tab], index) => {
                const zoneConfig = WORLD_ZONES[zone as WorldZone];
                const hasAccess = canAccessZone(starLevel, zone);
                const isActive = currentZone === zone;
                
                return (
                  <button
                    key={zone}
                    onClick={() => hasAccess && handleTabChange(tab)}
                    disabled={!hasAccess}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={
                      warpPipeMode
                        ? `warp-tab animate-fade-in ${isActive ? "warp-tab--active" : ""} ${!hasAccess ? "opacity-40 cursor-not-allowed" : ""}`
                        : `flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-r ${zoneConfig.gradient} text-white shadow-lg`
                              : hasAccess
                                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                                : "text-gray-600 cursor-not-allowed opacity-40"
                          }`
                    }
                    title={hasAccess ? zoneConfig.subtitle : `Requires ${zoneConfig.requiredStars} star(s)`}
                  >
                    {warpPipeMode ? (
                      <>
                        <span className="warp-tab__zone">{zoneConfig.icon} {zoneConfig.name}</span>
                        <span className="warp-tab__label">{tabLabel[tab]}</span>
                      </>
                    ) : (
                      <>
                        <span>{zoneConfig.icon}</span>
                        <span>{tabLabel[tab]}</span>
                        {zoneConfig.requiredStars > 0 && (
                          <span className="text-xs opacity-60">{"⭐".repeat(zoneConfig.requiredStars)}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </nav>

      {/* Last Visit Info */}
      {worldState.lastDeviceSeen && (
        <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>📱 Last device: <strong className="text-gray-400">{worldState.lastDeviceSeen.model}</strong></span>
              {worldState.lastRoutedSystem && (
                <span>🔀 Last routed: <strong className="text-gray-400">{worldState.lastRoutedSystem}</strong></span>
              )}
            </div>
            <span>
              Session #{worldState.sessionsCount} • {new Date(worldState.lastVisit).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto py-6 px-4 transition-opacity duration-150 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
        <div className="animate-fade-in">
          {activeTab === "dashboard" && <DeviceOverview />}
          {activeTab === "analysis" && <DeviceOverview onDeviceSelected={handleDeviceSelected} />}
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
            {/* World Info */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span>🍄</span>
                <span>Super Bobby's World: Warp Zones</span>
                <span className="text-gray-600">|</span>
                <span>A world map for systems</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Not a tool. Not a repair app. A WORLD.
              </p>
            </div>

            {/* Zone Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Object.values(WORLD_ZONES).slice(0, 7).map((zone) => (
                  <div
                    key={zone.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      worldState.zonesUnlocked.includes(zone.id)
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                    title={zone.name}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {worldState.zonesUnlocked.length}/{Object.keys(WORLD_ZONES).length} zones unlocked
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
