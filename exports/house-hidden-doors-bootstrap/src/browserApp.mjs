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

function render() {
  const room = roomContent(state.currentRoom);
  root.replaceChildren();

  root.dataset.room = state.currentRoom;
  const title = document.createElement("h1");
  title.dataset.testid = "room-title";
  title.textContent = room.title;
  const description = document.createElement("p");
  description.textContent = room.description;
  root.append(title, description, renderProgress());

  const inventory = document.createElement("section");
  inventory.innerHTML = `<h2>Inventory</h2><p>${state.inventory.length ? state.inventory.join(", ") : "Empty"}</p>`;
  root.append(inventory);

  const interactables = document.createElement("section");
  const interactableTitle = document.createElement("h2");
  interactableTitle.textContent = "Inspect";
  interactables.append(interactableTitle);

  for (const secretId of room.secrets) {
    const found = state.discoveredSecrets.includes(secretId);
    interactables.append(
      button(found ? `Discovered: ${secretId}` : `Inspect: ${secretId}`, () => {
        dispatch({ type: ACTIONS.DISCOVER_SECRET, secretId });
        if (secretId === "library-bookcase-latch") {
          dispatch({ type: ACTIONS.REVEAL_DOOR, doorId: "library-basement" });
        }
      }, found),
    );
  }

  for (const itemId of room.items) {
    const owned = state.inventory.includes(itemId);
    interactables.append(
      button(owned ? `Collected: ${itemId}` : `Pick up: ${itemId}`, () => {
        dispatch({ type: ACTIONS.PICK_UP_ITEM, itemId });
      }, owned),
    );
  }
  root.append(interactables);

  const exits = document.createElement("section");
  const exitsTitle = document.createElement("h2");
  exitsTitle.textContent = "Doors";
  exits.append(exitsTitle);

  for (const door of doorActions()) {
    const doorState = state.doorStates[door.id];

    if (doorState === DOOR_STATES.HIDDEN) {
      const hidden = document.createElement("p");
      hidden.textContent = "Nothing obvious here.";
      exits.append(hidden);
      continue;
    }

    if (doorState !== DOOR_STATES.OPEN) {
      exits.append(
        button(
          door.requiredItem ? `Unlock ${door.id}` : `Open ${door.id}`,
          () => dispatch({ type: ACTIONS.OPEN_DOOR, doorId: door.id }),
        ),
      );
    } else {
      exits.append(
        button(`Enter ${graph.rooms[door.to].wing}: ${door.to}`, () => {
          dispatch({ type: ACTIONS.TRAVERSE_DOOR, doorId: door.id });
        }),
      );
    }
  }
  root.append(exits);
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
