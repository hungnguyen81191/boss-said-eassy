import {
  ITEM_DEFS,
  HOTSPOTS,
  Level01Engine,
} from "../../shared/src/index.js";

const engine = new Level01Engine();

const el = {
  scene: document.getElementById("scene"),
  inventory: document.getElementById("inventory"),
  dialogue: document.getElementById("dialogue"),
  dialogueName: document.getElementById("dialogueName"),
  dialogueText: document.getElementById("dialogueText"),
  dialogueNext: document.getElementById("dialogueNext"),
  stars: document.getElementById("stars"),
  overlay: document.getElementById("overlay"),
  winPanel: document.getElementById("winPanel"),
  winTitle: document.getElementById("winTitle"),
  winMessage: document.getElementById("winMessage"),
  winStars: document.getElementById("winStars"),
  btnReplay: document.getElementById("btnReplay"),
  btnHint: document.getElementById("btnHint"),
  btnCombine: document.getElementById("btnCombine"),
  btnGuard: document.getElementById("btnGuard"),
  cabinetGhost: document.getElementById("cabinetGhost"),
};

let winState = null;

function renderUI() {
  const snap = engine.getSnapshot();

  el.inventory.innerHTML = "";
  for (const id of snap.inventory) {
    const def = ITEM_DEFS[id];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inv-item" + (snap.selectedItem === id ? " selected" : "");
    btn.title = def.name;
    btn.innerHTML = `<span>${def.icon}</span><span class="label">${def.name}</span>`;
    btn.addEventListener("click", () => {
      engine.selectItem(id);
      renderUI();
    });
    el.inventory.appendChild(btn);
  }

  el.btnGuard.hidden = !snap.showGuardButton;

  const dragOn = snap.cabinetDragEnabled;
  el.cabinetGhost.hidden = !dragOn;

  if (snap.dialogue) {
    el.dialogueName.textContent = snap.dialogue.speaker;
    el.dialogueText.textContent = snap.dialogue.text;
    el.dialogue.hidden = false;
  } else if (!winState) {
    el.dialogue.hidden = true;
  }

  if (winState) {
    document.querySelectorAll(".hud .star").forEach((node) => {
      const n = Number(node.dataset.star);
      node.classList.toggle("earned", n <= winState.stars);
    });
  }
}

function showWin(effect) {
  winState = effect;
  el.winTitle.textContent = effect.title;
  el.winMessage.textContent = effect.message;
  el.winStars.innerHTML = [1, 2, 3]
    .map((n) => `<span class="star${n <= effect.stars ? " earned" : ""}">★</span>`)
    .join("");
  el.overlay.hidden = false;
  el.winPanel.hidden = false;
  el.dialogue.hidden = true;
  renderUI();
}

function processEffects(effects) {
  for (const e of effects) {
    if (e.type === "win") showWin(e);
  }
  renderUI();
}

function runAction(fn) {
  const effects = fn();
  processEffects(effects);
}

el.dialogueNext.addEventListener("click", () => {
  if (!engine.activeDialogue) {
    el.dialogue.hidden = true;
    return;
  }
  const more = engine.dismissDialogue();
  processEffects(more);
  renderUI();
});

function buildHotspots() {
  for (const spot of HOTSPOTS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hotspot";
    btn.dataset.id = spot.id;
    btn.style.left = `${spot.left}%`;
    btn.style.top = `${spot.top}%`;
    btn.style.width = `${spot.width}%`;
    btn.style.height = `${spot.height}%`;
    btn.setAttribute("aria-label", spot.label);
    btn.addEventListener("click", () => runAction(() => engine.hotspot(spot.id)));
    el.scene.appendChild(btn);
  }
}

function setupCabinetDrag() {
  let dragging = false;

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const rect = el.scene.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    el.cabinetGhost.style.left = `${Math.min(85, Math.max(5, x - 7))}%`;
    el.cabinetGhost.style.top = `${Math.min(75, Math.max(10, y - 20))}%`;
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    const ghost = el.cabinetGhost.getBoundingClientRect();
    const printer = el.scene.querySelector('[data-id="printer"]')?.getBoundingClientRect();
    if (!printer) return;
    const overlap =
      ghost.left < printer.right &&
      ghost.right > printer.left &&
      ghost.top < printer.bottom &&
      ghost.bottom > printer.top;
    runAction(() => engine.cabinetDragEnd(overlap));
  };

  el.cabinetGhost.addEventListener("pointerdown", (e) => {
    if (el.cabinetGhost.hidden) return;
    dragging = true;
    el.cabinetGhost.setPointerCapture(e.pointerId);
  });
  el.cabinetGhost.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
  el.cabinetGhost.addEventListener("pointerup", endDrag);
  el.cabinetGhost.addEventListener("pointercancel", endDrag);
}

el.btnCombine.addEventListener("click", () => runAction(() => engine.combine()));
el.btnGuard.addEventListener("click", () => runAction(() => engine.callGuard()));
el.btnHint.addEventListener("click", () => runAction(() => engine.hint()));
el.btnReplay.addEventListener("click", () => location.reload());

function init() {
  buildHotspots();
  setupCabinetDrag();
  runAction(() => engine.startLevel());

  if (new URLSearchParams(location.search).has("debug")) {
    document.body.classList.add("debug-hotspots");
  }
}

init();
