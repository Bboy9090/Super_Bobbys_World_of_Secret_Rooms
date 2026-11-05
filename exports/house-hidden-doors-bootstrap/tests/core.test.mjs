import test from "node:test";
import assert from "node:assert/strict";
import { createHouseGraph, validateHouseGraph, DOOR_STATES } from "../src/doorGraph.mjs";
import { addItem, createInitialState, openDoor, revealDoor, traverseDoor } from "../src/puzzleState.mjs";

test("house graph is deterministic and internally valid", () => {
  const graph = createHouseGraph();
  assert.equal(validateHouseGraph(graph), true);
  assert.deepEqual(Object.keys(graph.rooms), ["foyer", "library", "basementLanding", "workshop"]);
});

test("hidden door cannot be traversed before reveal and key", () => {
  const graph = createHouseGraph();
  let state = createInitialState(graph);

  assert.equal(state.doorStates["library-basement"], DOOR_STATES.HIDDEN);
  assert.throws(() => openDoor(state, graph, "library-basement"), /not been revealed/);

  state = revealDoor(state, "library-basement");
  assert.equal(state.doorStates["library-basement"], DOOR_STATES.LOCKED);
  assert.throws(() => openDoor(state, graph, "library-basement"), /brass-eye-key/);
});

test("valid item unlocks traversal without mutating prior state", () => {
  const graph = createHouseGraph();
  const initial = createInitialState(graph);
  const inLibrary = { ...initial, currentRoom: "library" };
  const revealed = revealDoor(inLibrary, "library-basement");
  const equipped = addItem(revealed, "brass-eye-key");
  const opened = openDoor(equipped, graph, "library-basement");
  const traversed = traverseDoor(opened, graph, "library-basement");

  assert.equal(inLibrary.doorStates["library-basement"], DOOR_STATES.HIDDEN);
  assert.equal(opened.doorStates["library-basement"], DOOR_STATES.OPEN);
  assert.equal(traversed.currentRoom, "basement-landing");
});
