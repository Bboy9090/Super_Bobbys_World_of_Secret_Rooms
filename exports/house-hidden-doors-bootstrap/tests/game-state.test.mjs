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

test("save parser fails closed on unknown rooms while forward-filling known doors", () => {
  const graph = createHouseGraph();
  const state = createNewGame(graph);
  const payload = JSON.parse(serializeSave(state));

  payload.state.currentRoom = "nonexistent-wing";
  assert.throws(() => parseSave(JSON.stringify(payload), graph), /unknown room/);

  payload.state.currentRoom = "foyer";
  delete payload.state.doorStates["foyer-library"];
  const restored = parseSave(JSON.stringify(payload), graph);
  assert.equal(restored.doorStates["foyer-library"], DOOR_STATES.REVEALED);
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

test("v1 saves forward-fill doors added by later content updates", () => {
  const graph = createHouseGraph();
  const legacy = createNewGame(graph);
  delete legacy.doorStates["workshop-hidden-wing"];

  const payload = JSON.parse(serializeSave(legacy));
  const restored = parseSave(JSON.stringify(payload), graph);

  assert.equal(restored.doorStates["workshop-hidden-wing"], DOOR_STATES.HIDDEN);
  assert.equal(restored.doorStates["foyer-library"], legacy.doorStates["foyer-library"]);
});

test("v1 saves still reject unknown injected door identifiers", () => {
  const graph = createHouseGraph();
  const state = createNewGame(graph);
  const payload = JSON.parse(serializeSave(state));
  payload.state.doorStates["invented-door"] = DOOR_STATES.OPEN;

  assert.throws(
    () => parseSave(JSON.stringify(payload), graph),
    /unknown door/,
  );
});



test("v1 saves without puzzle state default to an unsolved workshop dial", () => {
  const graph = createHouseGraph();
  const legacy = createNewGame(graph);
  delete legacy.puzzles;

  const payload = JSON.parse(serializeSave(legacy));
  const restored = parseSave(JSON.stringify(payload), graph);

  assert.deepEqual(restored.puzzles.workshopCoordinateDial, {
    entered: [],
    solved: false,
  });
});

test("save parser rejects malformed workshop dial state", () => {
  const graph = createHouseGraph();
  const state = createNewGame(graph);
  const payload = JSON.parse(serializeSave(state));

  payload.state.puzzles.workshopCoordinateDial.entered = [3, 9];
  assert.throws(
    () => parseSave(JSON.stringify(payload), graph),
    /workshop dial state is invalid/,
  );

  payload.state.puzzles.workshopCoordinateDial = {
    entered: [3, 1, 4, 2],
    solved: false,
  };
  assert.throws(
    () => parseSave(JSON.stringify(payload), graph),
    /workshop dial state is invalid/,
  );
});
