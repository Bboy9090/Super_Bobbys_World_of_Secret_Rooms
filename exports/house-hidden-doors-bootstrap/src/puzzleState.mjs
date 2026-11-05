import { DOOR_STATES } from "./doorGraph.mjs";

export function createInitialState(graph) {
  return {
    currentRoom: "foyer",
    inventory: [],
    discoveredSecrets: [],
    puzzles: {
      workshopCoordinateDial: {
        entered: [],
        solved: false,
      },
    },
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


export const WORKSHOP_DIAL_SOLUTION = Object.freeze([3, 1, 4]);

export function turnWorkshopDial(state, value) {
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw new Error("Dial position must be an integer from 1 through 6");
  }

  const current = state.puzzles?.workshopCoordinateDial ?? {
    entered: [],
    solved: false,
  };
  if (current.solved) return state;

  const expectedIndex = current.entered.length;
  const expected = WORKSHOP_DIAL_SOLUTION[expectedIndex];

  if (value !== expected) {
    return {
      ...state,
      puzzles: {
        ...state.puzzles,
        workshopCoordinateDial: {
          entered: [],
          solved: false,
        },
      },
    };
  }

  const entered = [...current.entered, value];
  const solved = entered.length === WORKSHOP_DIAL_SOLUTION.length;
  return {
    ...state,
    puzzles: {
      ...state.puzzles,
      workshopCoordinateDial: {
        entered,
        solved,
      },
    },
  };
}
