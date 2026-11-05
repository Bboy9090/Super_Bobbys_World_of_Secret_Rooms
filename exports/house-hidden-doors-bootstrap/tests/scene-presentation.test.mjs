import test from "node:test";
import assert from "node:assert/strict";
import { ROOM_CONTENT, hotspotFor } from "../src/roomContent.mjs";

test("every room item and secret has a scene hotspot", () => {
  for (const [roomId, room] of Object.entries(ROOM_CONTENT)) {
    assert.ok(room.atmosphere.length > 20, `${roomId} atmosphere`);
    assert.ok(room.sceneLabel.length > 3, `${roomId} scene label`);

    const hotspotIds = new Set(room.hotspots.map((hotspot) => hotspot.id));
    for (const itemId of room.items) {
      assert.ok(hotspotIds.has(itemId), `${roomId} item hotspot: ${itemId}`);
    }
    for (const secretId of room.secrets) {
      assert.ok(hotspotIds.has(secretId), `${roomId} secret hotspot: ${secretId}`);
    }

    for (const hotspot of room.hotspots) {
      assert.ok(["item", "secret"].includes(hotspot.kind));
      assert.ok(["north", "south", "east", "west"].includes(hotspot.position));
      assert.ok(hotspot.hint.length > 10);
      assert.equal(hotspotFor(roomId, hotspot.id), hotspot);
    }
  }
});

test("the library visual latch reveals the existing basement route", () => {
  const latch = hotspotFor("library", "library-bookcase-latch");
  assert.equal(latch.kind, "secret");
  assert.equal(latch.revealsDoor, "library-basement");
});


test("the workshop key is gated by the basement pipe-map clue", () => {
  const key = hotspotFor("basement-landing", "workshop-key");
  assert.equal(key.requiresSecret, "basement-pipe-map");
});

test("the workshop finale is an ordered three-clue mechanism", () => {
  const blueprint = hotspotFor("workshop", "impossible-wing-blueprint");
  const dial = hotspotFor("workshop", "brass-coordinate-dial");
  const coordinates = hotspotFor("workshop", "hidden-wing-coordinates");

  assert.equal(blueprint.requiresSecret, undefined);
  assert.equal(dial.requiresSecret, "impossible-wing-blueprint");
  assert.equal(coordinates.requiresSecret, "brass-coordinate-dial");
});

