import { useMemo } from "react";

/**
 * SUPER BOBBY'S WORLD: WARP ZONES
 * 
 * World Map Canon - The legendary navigation system
 * 
 * Zone Structure:
 *                              [ Boot Zone ]──┐
 *                ├──▶[ Device Zone ]──▶[ Signal Zone ]
 * [ Memory Zone ]┘              │
 *                                ├──▶[ Forge Zone ]
 * [ Power Zone ]───────────────▶│
 *                                └──▶[ Shadow Zone ]──▶[ Chaos Zone ]
 *                                                 │
 *                                                 └──▶[ Core Zone ]
 */

export type WorldZone = 
  | "boot"      // Zone 1 - Start/Dashboard
  | "device"    // Zone 2 - Device Analysis
  | "signal"    // Zone 3 - Compliance/Audit
  | "memory"    // Zone 4 - Legal Classification
  | "power"     // Zone 5 - Certification
  | "forge"     // Zone 6 - Custodian Vault
  | "shadow"    // Zone 7 - Operations
  | "chaos"     // Zone 8 - Advanced Operations (hidden)
  | "core";     // Zone 9 - Core System (Phoenix Key only)

export interface ZoneConfig {
  id: WorldZone;
  name: string;
  subtitle: string;
  color: string;
  gradient: string;
  icon: string;
  requiredStars: number; // 0=Bronze, 1=Silver, 2=Gold, 3=BlackStar
  connections: WorldZone[];
  position: { x: number; y: number };
}

export const WORLD_ZONES: Record<WorldZone, ZoneConfig> = {
  boot: {
    id: "boot",
    name: "Boot Zone",
    subtitle: "System Initialization",
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-600",
    icon: "🚀",
    requiredStars: 0,
    connections: ["device", "memory"],
    position: { x: 50, y: 10 }
  },
  device: {
    id: "device",
    name: "Device Zone",
    subtitle: "Hardware Detection",
    color: "#3b82f6",
    gradient: "from-blue-500 to-indigo-600",
    icon: "📱",
    requiredStars: 0,
    connections: ["signal", "forge", "shadow"],
    position: { x: 50, y: 35 }
  },
  signal: {
    id: "signal",
    name: "Signal Zone",
    subtitle: "Communication Analysis",
    color: "#8b5cf6",
    gradient: "from-purple-500 to-violet-600",
    icon: "📡",
    requiredStars: 1,
    connections: ["device"],
    position: { x: 80, y: 35 }
  },
  memory: {
    id: "memory",
    name: "Memory Zone",
    subtitle: "Data Classification",
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-600",
    icon: "🧠",
    requiredStars: 1,
    connections: ["boot", "device"],
    position: { x: 20, y: 35 }
  },
  power: {
    id: "power",
    name: "Power Zone",
    subtitle: "Energy & Certification",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    icon: "⚡",
    requiredStars: 1,
    connections: ["forge", "shadow"],
    position: { x: 20, y: 60 }
  },
  forge: {
    id: "forge",
    name: "Forge Zone",
    subtitle: "Creation & Repair",
    color: "#ef4444",
    gradient: "from-red-500 to-rose-600",
    icon: "🔨",
    requiredStars: 2,
    connections: ["device", "power"],
    position: { x: 50, y: 60 }
  },
  shadow: {
    id: "shadow",
    name: "Shadow Zone",
    subtitle: "Operations Center",
    color: "#6366f1",
    gradient: "from-indigo-500 to-purple-600",
    icon: "🌑",
    requiredStars: 2,
    connections: ["device", "power", "chaos", "core"],
    position: { x: 80, y: 60 }
  },
  chaos: {
    id: "chaos",
    name: "Chaos Zone",
    subtitle: "Advanced Systems",
    color: "#dc2626",
    gradient: "from-red-600 to-red-800",
    icon: "🌀",
    requiredStars: 2,
    connections: ["shadow"],
    position: { x: 80, y: 85 }
  },
  core: {
    id: "core",
    name: "Core Zone",
    subtitle: "Phoenix Key Access",
    color: "#000000",
    gradient: "from-gray-800 to-black",
    icon: "🌟",
    requiredStars: 3,
    connections: ["shadow"],
    position: { x: 50, y: 85 }
  }
};

interface WorldMapProps {
  currentZone: WorldZone;
  starLevel: number;
  onZoneSelect: (zone: WorldZone) => void;
  compact?: boolean;
}

export function WorldMap({ currentZone, starLevel, onZoneSelect, compact = false }: WorldMapProps) {
  const accessibleZones = useMemo(() => {
    return Object.values(WORLD_ZONES).filter(zone => zone.requiredStars <= starLevel);
  }, [starLevel]);

  const canAccess = (zone: ZoneConfig) => zone.requiredStars <= starLevel;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg overflow-x-auto">
        {Object.values(WORLD_ZONES).slice(0, 7).map(zone => (
          <button
            key={zone.id}
            onClick={() => canAccess(zone) && onZoneSelect(zone.id)}
            disabled={!canAccess(zone)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentZone === zone.id
                ? `bg-gradient-to-r ${zone.gradient} text-white shadow-lg`
                : canAccess(zone)
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  : "bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-50"
            }`}
            title={`${zone.name} - ${zone.subtitle}`}
          >
            <span>{zone.icon}</span>
            <span className="hidden sm:inline">{zone.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-500"/>
        </svg>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Object.values(WORLD_ZONES).map(zone => 
          zone.connections.map(targetId => {
            const target = WORLD_ZONES[targetId];
            const isAccessible = canAccess(zone) && canAccess(target);
            return (
              <line
                key={`${zone.id}-${targetId}`}
                x1={`${zone.position.x}%`}
                y1={`${zone.position.y}%`}
                x2={`${target.position.x}%`}
                y2={`${target.position.y}%`}
                stroke={isAccessible ? zone.color : "#374151"}
                strokeWidth="2"
                strokeDasharray={isAccessible ? "none" : "4 4"}
                opacity={isAccessible ? 0.6 : 0.3}
              />
            );
          })
        )}
      </svg>

      {/* Zone Nodes */}
      {Object.values(WORLD_ZONES).map(zone => {
        const accessible = canAccess(zone);
        const isCurrent = currentZone === zone.id;
        
        return (
          <button
            key={zone.id}
            onClick={() => accessible && onZoneSelect(zone.id)}
            disabled={!accessible}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              accessible ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            style={{ 
              left: `${zone.position.x}%`, 
              top: `${zone.position.y}%` 
            }}
          >
            <div className={`relative flex flex-col items-center ${
              isCurrent ? "scale-110" : accessible ? "hover:scale-105" : "opacity-40"
            }`}>
              {/* Glow Effect */}
              {isCurrent && (
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse"
                  style={{ backgroundColor: zone.color, transform: "scale(2)" }}
                />
              )}
              
              {/* Zone Icon */}
              <div 
                className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                  isCurrent 
                    ? "border-white shadow-lg" 
                    : accessible 
                      ? "border-gray-500 hover:border-gray-400" 
                      : "border-gray-700"
                }`}
                style={{ 
                  backgroundColor: accessible ? zone.color : "#1f2937",
                  boxShadow: isCurrent ? `0 0 20px ${zone.color}` : "none"
                }}
              >
                {zone.icon}
              </div>
              
              {/* Zone Label */}
              <div className={`mt-1 text-center ${isCurrent ? "text-white" : "text-gray-400"}`}>
                <div className="text-xs font-bold whitespace-nowrap">{zone.name}</div>
                <div className="text-[10px] opacity-70 whitespace-nowrap">{zone.subtitle}</div>
              </div>

              {/* Star Requirement */}
              {zone.requiredStars > 0 && (
                <div className="absolute -top-1 -right-1 flex">
                  {Array.from({ length: zone.requiredStars }).map((_, i) => (
                    <span key={i} className={`text-xs ${
                      zone.requiredStars === 3 ? "text-gray-900" : "text-yellow-400"
                    }`}>
                      {zone.requiredStars === 3 ? "🌟" : "⭐"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span> Bronze
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐⭐</span> Silver
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐⭐⭐</span> Gold
        </div>
        <div className="flex items-center gap-1">
          <span>🌟</span> Black Star
        </div>
      </div>
    </div>
  );
}

export default WorldMap;
