import { DOOR_STATES } from "./doorGraph.mjs";

export const SAVE_SCHEMA_VERSION = 1;

export function serializeSave(state) {
  return JSON.stringify({
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt: new Date(0).toISOString(),
    state,
  });
}

export function parseSave(serialized, graph) {
  const payload = JSON.parse(serialized);

  if (payload.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new Error("Unsupported save schema version");
  }

  const state = payload.state;
  if (!state || typeof state !== "object") {
    throw new Error("Save state is missing");
  }

  if (!graph.rooms[state.currentRoom]) {
    throw new Error("Save references an unknown room");
  }

  const expectedDoorIds = new Set(Object.keys(graph.doors));
  const savedDoorStates = state.doorStates ?? {};
  const savedDoorIds = Object.keys(savedDoorStates);
  if (savedDoorIds.some((id) => !expectedDoorIds.has(id))) {
    throw new Error("Save door graph contains an unknown door");
  }

  const validDoorStates = new Set(Object.values(DOOR_STATES));
  for (const doorId of savedDoorIds) {
    if (!validDoorStates.has(savedDoorStates[doorId])) {
      throw new Error(`Save contains an invalid door state for ${doorId}`);
    }
  }

  const doorStates = Object.fromEntries(
    Object.entries(graph.doors).map(([doorId, door]) => [
      doorId,
      savedDoorStates[doorId] ?? door.initialState,
    ]),
  );

  if (!Array.isArray(state.inventory) || !Array.isArray(state.discoveredSecrets)) {
    throw new Error("Save inventory or secret ledger is invalid");
  }

  return { ...state, doorStates };
}
