/**
 * SUPER BOBBY'S WORLD: POWER STAR DISPLAY
 * 
 * Visual representation of the user's Power Star level
 */

import { StarLevel, POWER_STARS, getStarConfig } from "../lib/powerStars";

interface PowerStarDisplayProps {
  level: StarLevel;
  onLevelChange?: (level: StarLevel) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function PowerStarDisplay({ 
  level, 
  onLevelChange, 
  showDetails = false,
  compact = false 
}: PowerStarDisplayProps) {
  const config = getStarConfig(level);
  
  if (compact) {
    return (
      <div 
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700"
        title={`${config.displayName}: ${config.description}`}
      >
        <span className="text-sm">{config.icon}</span>
        <span className="text-xs font-medium text-gray-300">{config.displayName}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Power Star Level
        </h3>
        {onLevelChange && (
          <div className="flex gap-1">
            {([0, 1, 2, 3] as StarLevel[]).map((l) => (
              <button
                key={l}
                onClick={() => onLevelChange(l)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  l === level 
                    ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black" 
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
                title={POWER_STARS[l].displayName}
              >
                {l === 3 ? "🌟" : l === 0 ? "○" : "⭐".repeat(l)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Star Visual */}
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${config.color}, ${config.color}88)`,
            boxShadow: `0 0 20px ${config.color}44`
          }}
        >
          {config.icon}
        </div>

        {/* Star Info */}
        <div className="flex-1">
          <div className="text-lg font-bold text-white">{config.displayName}</div>
          <div className="text-sm text-gray-400 mt-0.5">{config.description}</div>
        </div>
      </div>

      {/* Permissions */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</div>
          <div className="flex flex-wrap gap-1.5">
            {config.permissions.map((perm) => (
              <span 
                key={perm}
                className="px-2 py-0.5 text-xs rounded bg-gray-700/50 text-gray-300 capitalize"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress to Next Level */}
      {level < 3 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Progress to {POWER_STARS[(level + 1) as StarLevel].displayName}</span>
            <span className="text-gray-400">Requires authorization</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline star badge for headers/compact views
 */
export function StarBadge({ level }: { level: StarLevel }) {
  const config = getStarConfig(level);
  
  return (
    <div 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: `${config.color}22`,
        color: config.color === "#1a1a2e" ? "#fff" : config.color,
        border: `1px solid ${config.color}44`
      }}
    >
      <span>{config.icon}</span>
      <span>{config.name.charAt(0).toUpperCase() + config.name.slice(1)}</span>
    </div>
  );
}

/**
 * Star requirement indicator for zones/features
 */
export function StarRequirement({ 
  required, 
  current,
  showLabel = true 
}: { 
  required: StarLevel; 
  current: StarLevel;
  showLabel?: boolean;
}) {
  const hasAccess = current >= required;
  const config = getStarConfig(required);
  
  return (
    <div className={`inline-flex items-center gap-1 ${hasAccess ? "opacity-100" : "opacity-50"}`}>
      <span className="text-xs">{config.icon}</span>
      {showLabel && (
        <span className={`text-xs ${hasAccess ? "text-green-400" : "text-gray-500"}`}>
          {hasAccess ? "Unlocked" : `Requires ${config.displayName}`}
        </span>
      )}
    </div>
  );
}

export default PowerStarDisplay;
