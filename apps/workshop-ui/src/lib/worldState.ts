/**
 * SUPER BOBBY'S WORLD: WORLD SAVE STATE
 * 
 * Persistent state that makes the world feel alive:
 * - Last zone visited
 * - Last routed system
 * - Last device seen
 * - Session statistics
 * 
 * Stored in localStorage for persistence across sessions.
 */

import { WorldZone } from "../components/WorldMap";
import { StarLevel } from "./powerStars";

const STORAGE_KEY = "super_bobbys_world_state";
const STATE_VERSION = 1;

export interface DeviceMemory {
  id: string;
  model: string;
  manufacturer?: string;
  platform?: string;
  lastSeen: string;
  timesConnected: number;
}

export interface ZoneVisit {
  zone: WorldZone;
  timestamp: string;
  duration?: number;
}

export interface WorldSaveState {
  version: number;
  
  // Current session
  currentZone: WorldZone;
  starLevel: StarLevel;
  warpPipeMode: boolean;
  
  // History
  lastZoneVisited: WorldZone;
  lastZoneTimestamp: string;
  zoneVisitCounts: Record<WorldZone, number>;
  
  // Device memory
  lastDeviceSeen: DeviceMemory | null;
  knownDevices: DeviceMemory[];
  
  // Routing history
  lastRoutedSystem: string | null;
  routingHistory: Array<{
    system: string;
    timestamp: string;
    deviceId?: string;
  }>;
  
  // Statistics
  totalSessionTime: number;
  sessionsCount: number;
  firstVisit: string;
  lastVisit: string;
  
  // Achievements
  zonesUnlocked: WorldZone[];
  achievementsUnlocked: string[];
}

const DEFAULT_STATE: WorldSaveState = {
  version: STATE_VERSION,
  currentZone: "boot",
  starLevel: 0,
  warpPipeMode: true,
  lastZoneVisited: "boot",
  lastZoneTimestamp: new Date().toISOString(),
  zoneVisitCounts: {
    boot: 0,
    device: 0,
    signal: 0,
    memory: 0,
    power: 0,
    forge: 0,
    shadow: 0,
    chaos: 0,
    core: 0
  },
  lastDeviceSeen: null,
  knownDevices: [],
  lastRoutedSystem: null,
  routingHistory: [],
  totalSessionTime: 0,
  sessionsCount: 0,
  firstVisit: new Date().toISOString(),
  lastVisit: new Date().toISOString(),
  zonesUnlocked: ["boot", "device"],
  achievementsUnlocked: []
};

/**
 * Load world state from localStorage
 */
export function loadWorldState(): WorldSaveState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const newState = { ...DEFAULT_STATE, firstVisit: new Date().toISOString() };
      saveWorldState(newState);
      return newState;
    }
    
    const parsed = JSON.parse(stored) as WorldSaveState;
    
    // Migration: update to latest version if needed
    if (parsed.version < STATE_VERSION) {
      return migrateState(parsed);
    }
    
    // Update session info
    parsed.lastVisit = new Date().toISOString();
    parsed.sessionsCount += 1;
    saveWorldState(parsed);
    
    return parsed;
  } catch (error) {
    console.error("Failed to load world state:", error);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Save world state to localStorage
 */
export function saveWorldState(state: WorldSaveState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save world state:", error);
  }
}

/**
 * Update specific fields in world state
 */
export function updateWorldState(updates: Partial<WorldSaveState>): WorldSaveState {
  const current = loadWorldState();
  const updated = { ...current, ...updates, lastVisit: new Date().toISOString() };
  saveWorldState(updated);
  return updated;
}

/**
 * Record a zone visit
 */
export function recordZoneVisit(zone: WorldZone): WorldSaveState {
  const state = loadWorldState();
  
  state.lastZoneVisited = state.currentZone;
  state.currentZone = zone;
  state.lastZoneTimestamp = new Date().toISOString();
  state.zoneVisitCounts[zone] = (state.zoneVisitCounts[zone] || 0) + 1;
  
  // Unlock zone if not already
  if (!state.zonesUnlocked.includes(zone)) {
    state.zonesUnlocked.push(zone);
  }
  
  saveWorldState(state);
  return state;
}

/**
 * Record a device connection
 */
export function recordDeviceSeen(device: Omit<DeviceMemory, "lastSeen" | "timesConnected">): WorldSaveState {
  const state = loadWorldState();
  const now = new Date().toISOString();
  
  // Check if device already known
  const existingIndex = state.knownDevices.findIndex(d => d.id === device.id);
  
  if (existingIndex >= 0) {
    state.knownDevices[existingIndex].lastSeen = now;
    state.knownDevices[existingIndex].timesConnected += 1;
    state.lastDeviceSeen = state.knownDevices[existingIndex];
  } else {
    const newDevice: DeviceMemory = {
      ...device,
      lastSeen: now,
      timesConnected: 1
    };
    state.knownDevices.push(newDevice);
    state.lastDeviceSeen = newDevice;
  }
  
  saveWorldState(state);
  return state;
}

/**
 * Record a routing action
 */
export function recordRouting(system: string, deviceId?: string): WorldSaveState {
  const state = loadWorldState();
  
  state.lastRoutedSystem = system;
  state.routingHistory.unshift({
    system,
    timestamp: new Date().toISOString(),
    deviceId
  });
  
  // Keep only last 50 routing entries
  if (state.routingHistory.length > 50) {
    state.routingHistory = state.routingHistory.slice(0, 50);
  }
  
  saveWorldState(state);
  return state;
}

/**
 * Update star level
 */
export function updateStarLevel(level: StarLevel): WorldSaveState {
  const state = loadWorldState();
  state.starLevel = level;
  saveWorldState(state);
  return state;
}

/**
 * Toggle warp pipe mode
 */
export function toggleWarpPipeMode(): WorldSaveState {
  const state = loadWorldState();
  state.warpPipeMode = !state.warpPipeMode;
  saveWorldState(state);
  return state;
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(achievement: string): WorldSaveState {
  const state = loadWorldState();
  if (!state.achievementsUnlocked.includes(achievement)) {
    state.achievementsUnlocked.push(achievement);
    saveWorldState(state);
  }
  return state;
}

/**
 * Get device by ID from memory
 */
export function getKnownDevice(id: string): DeviceMemory | null {
  const state = loadWorldState();
  return state.knownDevices.find(d => d.id === id) || null;
}

/**
 * Clear world state (reset)
 */
export function clearWorldState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Migrate state from older versions
 */
function migrateState(oldState: Partial<WorldSaveState>): WorldSaveState {
  // Merge with defaults for any missing fields
  const migrated: WorldSaveState = {
    ...DEFAULT_STATE,
    ...oldState,
    version: STATE_VERSION
  };
  saveWorldState(migrated);
  return migrated;
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  totalZonesVisited: number;
  favoriteZone: WorldZone | null;
  totalDevicesSeen: number;
  totalRoutings: number;
} {
  const state = loadWorldState();
  
  const totalVisits = Object.values(state.zoneVisitCounts).reduce((a, b) => a + b, 0);
  
  let favoriteZone: WorldZone | null = null;
  let maxVisits = 0;
  for (const [zone, count] of Object.entries(state.zoneVisitCounts)) {
    if (count > maxVisits) {
      maxVisits = count;
      favoriteZone = zone as WorldZone;
    }
  }
  
  return {
    totalZonesVisited: totalVisits,
    favoriteZone,
    totalDevicesSeen: state.knownDevices.length,
    totalRoutings: state.routingHistory.length
  };
}

export default {
  loadWorldState,
  saveWorldState,
  updateWorldState,
  recordZoneVisit,
  recordDeviceSeen,
  recordRouting,
  updateStarLevel,
  toggleWarpPipeMode,
  unlockAchievement,
  getKnownDevice,
  clearWorldState,
  getSessionStats
};
