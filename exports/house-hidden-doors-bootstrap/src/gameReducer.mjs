import {
  addItem,
  createInitialState,
  openDoor,
  revealDoor,
  traverseDoor,
  turnWorkshopDial,
} from "./puzzleState.mjs";
import { hotspotFor } from "./roomContent.mjs";

export const ACTIONS = Object.freeze({
  PICK_UP_ITEM: "pick-up-item",
  REVEAL_DOOR: "reveal-door",
  OPEN_DOOR: "open-door",
  TRAVERSE_DOOR: "traverse-door",
  DISCOVER_SECRET: "discover-secret",
  TURN_WORKSHOP_DIAL: "turn-workshop-dial",
});

export function reduceGameAction(state, graph, action) {
  switch (action.type) {
    case ACTIONS.PICK_UP_ITEM: {
      const hotspot = hotspotFor(state.currentRoom, action.itemId);
      if (hotspot.kind !== "item") {
        throw new Error(`${action.itemId} is not an item in ${state.currentRoom}`);
      }
      if (
        hotspot.requiresSecret &&
        !state.discoveredSecrets.includes(hotspot.requiresSecret)
      ) {
        throw new Error(
          `${action.itemId} is not accessible until ${hotspot.requiresSecret} is discovered`,
        );
      }
      return addItem(state, action.itemId);
    }

    case ACTIONS.REVEAL_DOOR:
      return revealDoor(state, action.doorId);

    case ACTIONS.OPEN_DOOR:
      return openDoor(state, graph, action.doorId);

    case ACTIONS.TRAVERSE_DOOR:
      return traverseDoor(state, graph, action.doorId);

    case ACTIONS.DISCOVER_SECRET: {
      const hotspot = hotspotFor(state.currentRoom, action.secretId);
      if (hotspot.kind !== "secret") {
        throw new Error(`${action.secretId} is not a secret in ${state.currentRoom}`);
      }
      if (
        hotspot.requiresSecret &&
        !state.discoveredSecrets.includes(hotspot.requiresSecret)
      ) {
        throw new Error(
          `${action.secretId} is not accessible until ${hotspot.requiresSecret} is discovered`,
        );
      }
      if (
        hotspot.requiresPuzzle &&
        !state.puzzles?.[hotspot.requiresPuzzle]?.solved
      ) {
        throw new Error(
          `${action.secretId} is not accessible until ${hotspot.requiresPuzzle} is solved`,
        );
      }
      if (state.discoveredSecrets.includes(action.secretId)) return state;
      return {
        ...state,
        discoveredSecrets: [...state.discoveredSecrets, action.secretId],
      };
    }

    case ACTIONS.TURN_WORKSHOP_DIAL:
      if (state.currentRoom !== "workshop") {
        throw new Error("The workshop dial can only be used in the workshop");
      }
      if (!state.discoveredSecrets.includes("brass-coordinate-dial")) {
        throw new Error("The brass coordinate dial has not been discovered");
      }
      return turnWorkshopDial(state, action.value);

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function createNewGame(graph) {
  return createInitialState(graph);
}
