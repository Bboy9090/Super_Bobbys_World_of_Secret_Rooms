import test from "node:test";
import assert from "node:assert/strict";
import { ACTIONS, createNewGame, reduceGameAction } from "../src/gameReducer.mjs";
import { createHouseGraph, DOOR_STATES } from "../src/doorGraph.mjs";
import { parseSave, serializeSave } from "../src/saveState.mjs";

test("action reducer drives the first hidden-door loop deterministically", () => {
  const graph = createHouseGraph();
  let state = createNewGame(graph);

  state = reduceGameAction(state, graph, {
    type: ACTIONS.OPEN_DOOR,
    doorId: "foyer-library",
  });
  state = reduceGameAction(state, graph, {
    type: ACTIONS.TRAVERSE_DOOR,
    doorId: "foyer-library",
  });
  assert.equal(state.currentRoom, "library");

  state = reduceGameAction(state, graph, {
    type: ACTIONS.REVEAL_DOOR,
    doorId: "library-basement",
  });
  assert.equal(state.doorStates["library-basement"], DOOR_STATES.LOCKED);

  state = reduceGameAction(state, graph, {
    type: ACTIONS.PICK_UP_ITEM,
    itemId: "brass-eye-key",
  });
  state = reduceGameAction(state, graph, {
    type: ACTIONS.OPEN_DOOR,
    doorId: "library-basement",
  });
  state = reduceGameAction(state, graph, {
    type: ACTIONS.TRAVERSE_DOOR,
    doorId: "library-basement",
  });
  assert.equal(state.currentRoom, "basement-landing");
});

test("versioned save state round-trips current progress", () => {
  const graph = createHouseGraph();
  let state = createNewGame(graph);
  state = reduceGameAction(state, graph, {
    type: ACTIONS.DISCOVER_SECRET,
    secretId: "foyer-wall-seam",
  });

  const restored = parseSave(serializeSave(state), graph);
  assert.deepEqual(restored, state);
});

test("save parser fails closed on unknown rooms and graph drift", () => {
  const graph = createHouseGraph();
  const state = createNewGame(graph);
  const payload = JSON.parse(serializeSave(state));

  payload.state.currentRoom = "nonexistent-wing";
  assert.throws(() => parseSave(JSON.stringify(payload), graph), /unknown room/);

  payload.state.currentRoom = "foyer";
  delete payload.state.doorStates["foyer-library"];
  assert.throws(() => parseSave(JSON.stringify(payload), graph), /door graph/);
});


test("save parser rejects invalid door-state values", () => {
  const graph = createHouseGraph();
  const state = createNewGame(graph);
  const payload = JSON.parse(serializeSave(state));

  payload.state.doorStates["library-basement"] = null;
  assert.throws(
    () => parseSave(JSON.stringify(payload), graph),
    /invalid door state/
  );

  payload.state.doorStates["library-basement"] = "teleported";
  assert.throws(
    () => parseSave(JSON.stringify(payload), graph),
    /invalid door state/
  );
});
