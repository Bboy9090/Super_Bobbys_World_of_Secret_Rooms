import { createHouseGraph, DOOR_STATES } from "./doorGraph.mjs";
import { ACTIONS, createNewGame, reduceGameAction } from "./gameReducer.mjs";
import { parseSave, serializeSave } from "./saveState.mjs";
import { roomContent } from "./roomContent.mjs";

const graph = createHouseGraph();
let state = createNewGame(graph);
const saveKey = "bobbys-house-hidden-doors:save:v1";

const root = document.querySelector("#game");
const status = document.querySelector("#status");

function setStatus(message) {
  status.textContent = message;
}

function dispatch(action) {
  try {
    state = reduceGameAction(state, graph, action);
    render();
    setStatus("");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
}

function doorActions() {
  return Object.values(graph.doors).filter((door) => door.from === state.currentRoom);
}

function renderProgress() {
  const order = ["foyer", "library", "basement-landing", "workshop"];
  const current = Math.max(0, order.indexOf(state.currentRoom));
  const progress = document.createElement("p");
  progress.className = "progress";
  progress.dataset.testid = "room-progress";
  progress.textContent = `Room ${current + 1} of ${order.length} · ${state.currentRoom}`;
  return progress;
}

function button(label, onClick, disabled = false) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  el.disabled = disabled;
  el.addEventListener("click", onClick);
  return el;
}

function activateHotspot(hotspot) {
  if (hotspot.kind === "item") {
    dispatch({ type: ACTIONS.PICK_UP_ITEM, itemId: hotspot.id });
    return;
  }

  dispatch({ type: ACTIONS.DISCOVER_SECRET, secretId: hotspot.id });
  if (hotspot.revealsDoor) {
    dispatch({ type: ACTIONS.REVEAL_DOOR, doorId: hotspot.revealsDoor });
  }
}

function renderScene(room) {
  const scene = document.createElement("section");
  scene.className = "scene-panel";
  scene.dataset.testid = "room-scene";

  const heading = document.createElement("div");
  heading.className = "scene-heading";

  const label = document.createElement("span");
  label.className = "scene-label";
  label.textContent = room.sceneLabel;

  const atmosphere = document.createElement("p");
  atmosphere.textContent = room.atmosphere;
  heading.append(label, atmosphere);
  scene.append(heading);

  const canvas = document.createElement("div");
  canvas.className = "scene-canvas";
  canvas.setAttribute("aria-label", `${room.title} interactive scene`);

  const roomShape = document.createElement("div");
  roomShape.className = "room-shape";
  roomShape.setAttribute("aria-hidden", "true");
  canvas.append(roomShape);

  for (const hotspot of room.hotspots) {
    const resolved =
      hotspot.kind === "item"
        ? state.inventory.includes(hotspot.id)
        : state.discoveredSecrets.includes(hotspot.id);
    const marker = button(
      resolved ? `Resolved: ${hotspot.label}` : hotspot.label,
      () => activateHotspot(hotspot),
      resolved,
    );
    marker.className = `hotspot hotspot--${hotspot.position}`;
    marker.dataset.hotspot = hotspot.id;
    marker.title = hotspot.hint;
    canvas.append(marker);
  }

  scene.append(canvas);
  return scene;
}

function renderJournal() {
  const journal = document.createElement("section");
  journal.className = "journal";
  journal.dataset.testid = "clue-journal";

  const title = document.createElement("h2");
  title.textContent = "Clue Journal";
  journal.append(title);

  if (!state.discoveredSecrets.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hidden clues recorded yet.";
    journal.append(empty);
    return journal;
  }

  const list = document.createElement("ol");
  for (const secretId of state.discoveredSecrets) {
    const item = document.createElement("li");
    item.textContent = secretId.replaceAll("-", " ");
    list.append(item);
  }
  journal.append(list);
  return journal;
}

function renderDoors() {
  const exits = document.createElement("section");
  exits.className = "door-grid";
  const exitsTitle = document.createElement("h2");
  exitsTitle.textContent = "Doors";
  exits.append(exitsTitle);

  for (const door of doorActions()) {
    const doorState = state.doorStates[door.id];
    const card = document.createElement("article");
    card.className = `door-card door-card--${doorState}`;
    card.dataset.door = door.id;

    const label = document.createElement("strong");
    label.textContent = door.id.replaceAll("-", " ");
    const stateLabel = document.createElement("span");
    stateLabel.className = "door-state";
    stateLabel.textContent = doorState;
    card.append(label, stateLabel);

    if (doorState === DOOR_STATES.HIDDEN) {
      const hidden = document.createElement("p");
      hidden.textContent = "No visible doorway. A clue may expose the seam.";
      card.append(hidden);
    } else if (doorState !== DOOR_STATES.OPEN) {
      card.append(
        button(
          door.requiredItem ? `Unlock with ${door.requiredItem}` : "Open door",
          () => dispatch({ type: ACTIONS.OPEN_DOOR, doorId: door.id }),
        ),
      );
    } else {
      card.append(
        button(`Enter ${graph.rooms[door.to].wing}: ${door.to}`, () => {
          dispatch({ type: ACTIONS.TRAVERSE_DOOR, doorId: door.id });
        }),
      );
    }

    exits.append(card);
  }
  return exits;
}

function render() {
  const room = roomContent(state.currentRoom);
  root.replaceChildren();

  root.dataset.room = state.currentRoom;
  const title = document.createElement("h1");
  title.dataset.testid = "room-title";
  title.textContent = room.title;
  const description = document.createElement("p");
  description.className = "room-description";
  description.textContent = room.description;
  root.append(title, description, renderProgress(), renderScene(room));

  const inventory = document.createElement("section");
  inventory.className = "inventory";
  inventory.innerHTML = `<h2>Inventory</h2><p>${
    state.inventory.length ? state.inventory.join(", ") : "Empty"
  }</p>`;

  root.append(inventory, renderJournal(), renderDoors());
}

document.querySelector("#save").addEventListener("click", () => {
  localStorage.setItem(saveKey, serializeSave(state));
  setStatus("Game saved.");
});

document.querySelector("#load").addEventListener("click", () => {
  const serialized = localStorage.getItem(saveKey);
  if (!serialized) {
    setStatus("No save found.");
    return;
  }
  try {
    state = parseSave(serialized, graph);
    render();
    setStatus("Save loaded.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
});

document.querySelector("#new-game").addEventListener("click", () => {
  state = createNewGame(graph);
  render();
  setStatus("New game started.");
});

render();
