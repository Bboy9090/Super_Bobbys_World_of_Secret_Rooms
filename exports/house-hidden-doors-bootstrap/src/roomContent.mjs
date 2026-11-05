export const ROOM_CONTENT = Object.freeze({
  foyer: Object.freeze({
    title: "The Foyer",
    description: "A normal front hall, except the west wall sounds hollow when tapped.",
    atmosphere: "Rain ticks against the glass. The house feels one room wider than it should.",
    sceneLabel: "Front Hall · West Wall",
    items: [],
    secrets: ["foyer-wall-seam"],
    hotspots: Object.freeze([
      Object.freeze({
        id: "foyer-wall-seam",
        kind: "secret",
        label: "Hairline wall seam",
        hint: "The wallpaper pattern breaks beside the coat hooks.",
        position: "west",
      }),
    ]),
  }),
  library: Object.freeze({
    title: "The Library",
    description: "A tall bookcase sits too far forward from the basement wall.",
    atmosphere: "Dust hangs in the lamplight. One shelf has fresh scratches beneath it.",
    sceneLabel: "Library · False Bookcase",
    items: ["brass-eye-key"],
    secrets: ["library-bookcase-latch"],
    hotspots: Object.freeze([
      Object.freeze({
        id: "library-bookcase-latch",
        kind: "secret",
        label: "Misaligned brass book",
        hint: "Its spine is warm, and it does not belong to any series.",
        position: "north",
        revealsDoor: "library-basement",
      }),
      Object.freeze({
        id: "brass-eye-key",
        kind: "item",
        label: "Brass eye key",
        hint: "A small key rests inside a hollow atlas.",
        position: "east",
      }),
    ]),
  }),
  "basement-landing": Object.freeze({
    title: "Basement Landing",
    description: "Cold pipes disappear behind a locked workshop door.",
    atmosphere: "The boiler is silent, but something behind the pipes clicks in a steady pattern.",
    sceneLabel: "Basement · Pipe Landing",
    items: ["workshop-key"],
    secrets: ["basement-pipe-map"],
    hotspots: Object.freeze([
      Object.freeze({
        id: "basement-pipe-map",
        kind: "secret",
        label: "Painted pipe markings",
        hint: "Colored bands form a floor plan when viewed from the stairs.",
        position: "west",
      }),
      Object.freeze({
        id: "workshop-key",
        kind: "item",
        label: "Workshop key",
        hint: "The pipe map points to a loose pressure-gauge plate hiding a steel key.",
        position: "south",
        requiresSecret: "basement-pipe-map",
      }),
    ]),
  }),
  workshop: Object.freeze({
    title: "The Workshop",
    description: "Blueprints show rooms that cannot fit inside the house.",
    atmosphere: "Every tool is clean. The newest blueprint is dated tomorrow.",
    sceneLabel: "Workshop · Impossible Plans",
    items: [],
    secrets: [
      "impossible-wing-blueprint",
      "brass-coordinate-dial",
      "hidden-wing-coordinates",
    ],
    hotspots: Object.freeze([
      Object.freeze({
        id: "impossible-wing-blueprint",
        kind: "secret",
        label: "Impossible wing blueprint",
        hint: "Three circled room numbers are joined by a line that ends at the workbench.",
        position: "north",
      }),
      Object.freeze({
        id: "brass-coordinate-dial",
        kind: "secret",
        label: "Brass coordinate dial",
        hint: "The blueprint numbers match three engraved positions on the dial.",
        position: "east",
        requiresSecret: "impossible-wing-blueprint",
      }),
      Object.freeze({
        id: "hidden-wing-coordinates",
        kind: "secret",
        label: "Hidden wing coordinates",
        hint: "The aligned dial projects coordinates for a room that is not on the house plans.",
        position: "south",
        requiresSecret: "brass-coordinate-dial",
      }),
    ]),
  }),
});

export function roomContent(roomId) {
  const room = ROOM_CONTENT[roomId];
  if (!room) throw new Error(`Unknown room content: ${roomId}`);
  return room;
}

export function hotspotFor(roomId, hotspotId) {
  const hotspot = roomContent(roomId).hotspots.find((candidate) => candidate.id === hotspotId);
  if (!hotspot) throw new Error(`Unknown hotspot ${hotspotId} in ${roomId}`);
  return hotspot;
}
