export const ROOM_CONTENT = Object.freeze({
  foyer: Object.freeze({
    title: "The Foyer",
    description: "A normal front hall, except the west wall sounds hollow when tapped.",
    items: [],
    secrets: ["foyer-wall-seam"],
  }),
  library: Object.freeze({
    title: "The Library",
    description: "A tall bookcase sits too far forward from the basement wall.",
    items: ["brass-eye-key"],
    secrets: ["library-bookcase-latch"],
  }),
  "basement-landing": Object.freeze({
    title: "Basement Landing",
    description: "Cold pipes disappear behind a locked workshop door.",
    items: ["workshop-key"],
    secrets: ["basement-pipe-map"],
  }),
  workshop: Object.freeze({
    title: "The Workshop",
    description: "Blueprints show rooms that cannot fit inside the house.",
    items: [],
    secrets: ["impossible-wing-blueprint"],
  }),
});

export function roomContent(roomId) {
  const room = ROOM_CONTENT[roomId];
  if (!room) throw new Error(`Unknown room content: ${roomId}`);
  return room;
}
