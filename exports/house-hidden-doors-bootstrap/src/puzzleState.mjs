import { DOOR_STATES } from "./doorGraph.mjs";

export function createInitialState(graph) {
  return {
    currentRoom: "foyer",
    inventory: [],
    discoveredSecrets: [],
    doorStates: Object.fromEntries(
      Object.values(graph.doors).map((door) => [door.id, door.initialState]),
    ),
  };
}

export function addItem(state, itemId) {
  if (state.inventory.includes(itemId)) return state;
  return { ...state, inventory: [...state.inventory, itemId] };
}

export function revealDoor(state, doorId) {
  if (!(doorId in state.doorStates)) throw new Error("Unknown door");
  if (state.doorStates[doorId] !== DOOR_STATES.HIDDEN) return state;
  return {
    ...state,
    doorStates: { ...state.doorStates, [doorId]: DOOR_STATES.LOCKED },
  };
}

export function openDoor(state, graph, doorId) {
  const door = graph.doors[doorId];
  if (!door) throw new Error("Unknown door");

  const current = state.doorStates[doorId];
  if (current === DOOR_STATES.HIDDEN) {
    throw new Error("Door has not been revealed");
  }

  if (door.requiredItem && !state.inventory.includes(door.requiredItem)) {
    throw new Error(`Missing required item: ${door.requiredItem}`);
  }

  return {
    ...state,
    doorStates: { ...state.doorStates, [doorId]: DOOR_STATES.OPEN },
  };
}

export function traverseDoor(state, graph, doorId) {
  const door = graph.doors[doorId];
  if (!door) throw new Error("Unknown door");
  if (state.doorStates[doorId] !== DOOR_STATES.OPEN) {
    throw new Error("Door is not open");
  }
  if (state.currentRoom !== door.from) {
    throw new Error("Player is not at this door");
  }
  return { ...state, currentRoom: door.to };
}
