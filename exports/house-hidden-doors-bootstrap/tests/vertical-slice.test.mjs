import test from "node:test";
import assert from "node:assert/strict";
import { createHouseGraph } from "../src/doorGraph.mjs";
import { ACTIONS, createNewGame, reduceGameAction } from "../src/gameReducer.mjs";

test("complete foyer-to-workshop vertical slice is reachable only through intended clues and keys", () => {
  const graph = createHouseGraph();
  let state = createNewGame(graph);

  state = reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "foyer-library" });
  state = reduceGameAction(state, graph, { type: ACTIONS.TRAVERSE_DOOR, doorId: "foyer-library" });
  assert.equal(state.currentRoom, "library");

  assert.throws(
    () => reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "library-basement" }),
    /not been revealed/,
  );

  state = reduceGameAction(state, graph, {
    type: ACTIONS.DISCOVER_SECRET,
    secretId: "library-bookcase-latch",
  });
  state = reduceGameAction(state, graph, { type: ACTIONS.REVEAL_DOOR, doorId: "library-basement" });

  assert.throws(
    () => reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "library-basement" }),
    /brass-eye-key/,
  );

  state = reduceGameAction(state, graph, { type: ACTIONS.PICK_UP_ITEM, itemId: "brass-eye-key" });
  state = reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "library-basement" });
  state = reduceGameAction(state, graph, { type: ACTIONS.TRAVERSE_DOOR, doorId: "library-basement" });
  assert.equal(state.currentRoom, "basement-landing");

  assert.throws(
    () => reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "basement-workshop" }),
    /workshop-key/,
  );

  state = reduceGameAction(state, graph, { type: ACTIONS.PICK_UP_ITEM, itemId: "workshop-key" });
  state = reduceGameAction(state, graph, { type: ACTIONS.OPEN_DOOR, doorId: "basement-workshop" });
  state = reduceGameAction(state, graph, { type: ACTIONS.TRAVERSE_DOOR, doorId: "basement-workshop" });

  assert.equal(state.currentRoom, "workshop");
  assert.deepEqual(state.inventory, ["brass-eye-key", "workshop-key"]);
  assert.ok(state.discoveredSecrets.includes("library-bookcase-latch"));
});
