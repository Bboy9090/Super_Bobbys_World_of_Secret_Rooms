import {
  addItem,
  createInitialState,
  openDoor,
  revealDoor,
  traverseDoor,
} from "./puzzleState.mjs";

export const ACTIONS = Object.freeze({
  PICK_UP_ITEM: "pick-up-item",
  REVEAL_DOOR: "reveal-door",
  OPEN_DOOR: "open-door",
  TRAVERSE_DOOR: "traverse-door",
  DISCOVER_SECRET: "discover-secret",
});

export function reduceGameAction(state, graph, action) {
  switch (action.type) {
    case ACTIONS.PICK_UP_ITEM:
      return addItem(state, action.itemId);

    case ACTIONS.REVEAL_DOOR:
      return revealDoor(state, action.doorId);

    case ACTIONS.OPEN_DOOR:
      return openDoor(state, graph, action.doorId);

    case ACTIONS.TRAVERSE_DOOR:
      return traverseDoor(state, graph, action.doorId);

    case ACTIONS.DISCOVER_SECRET:
      if (state.discoveredSecrets.includes(action.secretId)) return state;
      return {
        ...state,
        discoveredSecrets: [...state.discoveredSecrets, action.secretId],
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function createNewGame(graph) {
  return createInitialState(graph);
}
