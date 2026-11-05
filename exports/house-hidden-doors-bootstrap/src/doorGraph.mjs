export const DOOR_STATES = Object.freeze({
  HIDDEN: "hidden",
  REVEALED: "revealed",
  LOCKED: "locked",
  OPEN: "open",
});

export function createHouseGraph() {
  return Object.freeze({
    rooms: Object.freeze({
      foyer: Object.freeze({ id: "foyer", wing: "Ground Floor" }),
      library: Object.freeze({ id: "library", wing: "Ground Floor" }),
      "basement-landing": Object.freeze({ id: "basement-landing", wing: "Basement" }),
      workshop: Object.freeze({ id: "workshop", wing: "Workshop" }),
      "hidden-wing": Object.freeze({ id: "hidden-wing", wing: "Unknown Wing" }),
      attic: Object.freeze({ id: "attic", wing: "Attic" }),
    }),
    doors: Object.freeze({
      "foyer-library": Object.freeze({
        id: "foyer-library",
        from: "foyer",
        to: "library",
        initialState: DOOR_STATES.REVEALED,
        requiredItem: null,
      }),
      "library-basement": Object.freeze({
        id: "library-basement",
        from: "library",
        to: "basement-landing",
        initialState: DOOR_STATES.HIDDEN,
        requiredItem: "brass-eye-key",
      }),
      "basement-workshop": Object.freeze({
        id: "basement-workshop",
        from: "basement-landing",
        to: "workshop",
        initialState: DOOR_STATES.LOCKED,
        requiredItem: "workshop-key",
      }),
      "workshop-hidden-wing": Object.freeze({
        id: "workshop-hidden-wing",
        from: "workshop",
        to: "hidden-wing",
        initialState: DOOR_STATES.HIDDEN,
        requiredItem: null,
      }),
      "hidden-wing-attic": Object.freeze({
        id: "hidden-wing-attic",
        from: "hidden-wing",
        to: "attic",
        initialState: DOOR_STATES.HIDDEN,
        requiredItem: null,
      }),
    }),
  });
}

export function validateHouseGraph(graph) {
  const roomIds = new Set(Object.keys(graph.rooms));
  for (const door of Object.values(graph.doors)) {
    if (!roomIds.has(door.from) || !roomIds.has(door.to)) {
      throw new Error(`Door ${door.id} references an unknown room`);
    }
    if (door.from === door.to) {
      throw new Error(`Door ${door.id} cannot target its own room`);
    }
  }
  return true;
}
