/**
 * SUPER BOBBY'S WORLD: POWER STAR PERMISSION SCHEMA
 * 
 * Power Star Levels:
 * ⭐ Bronze (0)      — View / Observe
 * ⭐⭐ Silver (1)    — Route / Prepare  
 * ⭐⭐⭐ Gold (2)    — Execute via downstream system
 * 🌟 Black Star (3) — Core-only (Phoenix Key / local)
 * 
 * No stars = no pipes open.
 */

export type StarLevel = 0 | 1 | 2 | 3;

export interface PowerStarConfig {
  level: StarLevel;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  permissions: string[];
  description: string;
}

export const POWER_STARS: Record<StarLevel, PowerStarConfig> = {
  0: {
    level: 0,
    name: "bronze",
    displayName: "Bronze Star",
    icon: "⭐",
    color: "#cd7f32",
    permissions: ["view", "observe", "read"],
    description: "View and observe system state. Read-only access."
  },
  1: {
    level: 1,
    name: "silver",
    displayName: "Silver Star",
    icon: "⭐⭐",
    color: "#c0c0c0",
    permissions: ["view", "observe", "read", "route", "prepare", "analyze"],
    description: "Route devices and prepare operations. Analysis access."
  },
  2: {
    level: 2,
    name: "gold",
    displayName: "Gold Star",
    icon: "⭐⭐⭐",
    color: "#ffd700",
    permissions: ["view", "observe", "read", "route", "prepare", "analyze", "execute", "export"],
    description: "Execute operations via downstream systems. Full operational access."
  },
  3: {
    level: 3,
    name: "blackstar",
    displayName: "Black Star",
    icon: "🌟",
    color: "#1a1a2e",
    permissions: ["view", "observe", "read", "route", "prepare", "analyze", "execute", "export", "core", "phoenix", "forge"],
    description: "Core system access. Phoenix Key holder. Local authority."
  }
};

export type Permission = 
  | "view"      // View data
  | "observe"   // Observe system state
  | "read"      // Read files/logs
  | "route"     // Route to external systems
  | "prepare"   // Prepare operations
  | "analyze"   // Analyze devices
  | "execute"   // Execute operations
  | "export"    // Export reports
  | "core"      // Core system access
  | "phoenix"   // Phoenix Key operations
  | "forge";    // Forge zone operations

/**
 * Check if a star level has a specific permission
 */
export function hasPermission(starLevel: StarLevel, permission: Permission): boolean {
  return POWER_STARS[starLevel].permissions.includes(permission);
}

/**
 * Check if a star level can access a required level
 */
export function canAccess(userStarLevel: StarLevel, requiredLevel: StarLevel): boolean {
  return userStarLevel >= requiredLevel;
}

/**
 * Get all permissions for a star level
 */
export function getPermissions(starLevel: StarLevel): Permission[] {
  return POWER_STARS[starLevel].permissions as Permission[];
}

/**
 * Get the star configuration
 */
export function getStarConfig(starLevel: StarLevel): PowerStarConfig {
  return POWER_STARS[starLevel];
}

/**
 * Render star icons for a level
 */
export function renderStars(level: StarLevel): string {
  if (level === 3) return "🌟";
  return "⭐".repeat(level) || "○";
}

/**
 * Get star level from permission requirements
 */
export function getRequiredStarLevel(permissions: Permission[]): StarLevel {
  if (permissions.some(p => ["core", "phoenix", "forge"].includes(p))) return 3;
  if (permissions.some(p => ["execute", "export"].includes(p))) return 2;
  if (permissions.some(p => ["route", "prepare", "analyze"].includes(p))) return 1;
  return 0;
}

/**
 * Zone to Star Level mapping
 */
export const ZONE_STAR_REQUIREMENTS: Record<string, StarLevel> = {
  boot: 0,
  device: 0,
  signal: 1,
  memory: 1,
  power: 1,
  forge: 2,
  shadow: 2,
  chaos: 2,
  core: 3
};

/**
 * Check if user can access a zone
 */
export function canAccessZone(userStarLevel: StarLevel, zone: string): boolean {
  const required = ZONE_STAR_REQUIREMENTS[zone] ?? 0;
  return userStarLevel >= required;
}

export default {
  POWER_STARS,
  hasPermission,
  canAccess,
  getPermissions,
  getStarConfig,
  renderStars,
  getRequiredStarLevel,
  canAccessZone
};
