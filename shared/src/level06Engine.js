import {
  LEVEL06_HINTS,
  LEVEL06_INTRO,
  LEVEL06_WIN_MESSAGES,
} from "./level06Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    readSticky: false,
    usedShortcut: false,
    usedPlantCam: false,
    bgReady: false,
    joined: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level06Engine {
  constructor() {
    this.reset();
  }

  reset() {
    this.inventory = new Set();
    this.selectedItem = null;
    this.flags = defaultFlags();
    this.activeDialogue = null;
    this._afterDialogue = null;
  }

  has(id) {
    return this.inventory.has(id);
  }

  addItem(id) {
    this.inventory.add(id);
  }

  removeItem(id) {
    this.inventory.delete(id);
    if (this.selectedItem === id) this.selectedItem = null;
  }

  calcStars() {
    if (this.flags.usedPlantCam) return 3;
    if (this.flags.usedShortcut) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
      plantDragEnabled:
        this.flags.introComplete &&
        this.has("bgPlant") &&
        !this.flags.joined,
      dialogue: this.activeDialogue,
    };
  }

  _pushDialogue(effects, speaker, text, after) {
    this.activeDialogue = { speaker, text };
    effects.push({ type: "dialogue", dialogue: this.activeDialogue });
    if (after) this._afterDialogue = after;
  }

  dismissDialogue() {
    this.activeDialogue = null;
    const fn = this._afterDialogue;
    this._afterDialogue = null;
    if (!fn) return [];
    const next = fn();
    for (const e of next) {
      if (e.type === "dialogue") this.activeDialogue = e.dialogue;
    }
    return next;
  }

  startLevel() {
    const effects = /** @type {Effect[]} */ ([]);
    this._pushDialogue(effects, LEVEL06_INTRO.speaker, LEVEL06_INTRO.text, () => {
      this.flags.introComplete = true;
      return [];
    });
    return effects;
  }

  selectItem(id) {
    if (id && !this.has(id)) return [];
    this.selectedItem = this.selectedItem === id ? null : id;
    return [];
  }

  hint() {
    const effects = /** @type {Effect[]} */ ([]);
    const hint = LEVEL06_HINTS[this.flags.hintIndex % LEVEL06_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    if (
      this.has("bgCurtain") &&
      this.has("bgPoster") &&
      this.has("bgPlant")
    ) {
      this.removeItem("bgCurtain");
      this.removeItem("bgPoster");
      this.removeItem("bgPlant");
      this.addItem("virtualBg");
      this.selectedItem = "virtualBg";
      this.flags.bgReady = true;
      this._pushDialogue(
        effects,
        "Zoom",
        "Ghép rèm + poster + cây. Background ảo hơi lệch nhưng đủ dùng.",
        null
      );
      return effects;
    }
    this._pushDialogue(effects, "…", "Thiếu lớp background. Pantry vẫn lộ nếu join.", null);
    return effects;
  }

  _win() {
    this.flags.joined = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — cây làm filter!" : "Vào họp!";
    return [{ type: "win", stars, title, message: LEVEL06_WIN_MESSAGES[stars] }];
  }

  _tryJoin() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.usedPlantCam) {
      this._pushDialogue(
        effects,
        "Sếp",
        "Sao nền toàn lá xanh… thôi em trình bày đi.",
        () => this._win()
      );
      return effects;
    }
    if (this.flags.bgReady && this.has("virtualBg")) {
      this._pushDialogue(
        effects,
        "Sếp",
        "Ồ phòng họp đẹp đấy. Bắt đầu thôi.",
        () => this._win()
      );
      return effects;
    }
    if (this.flags.usedShortcut && this.has("bgPoster")) {
      this._pushDialogue(
        effects,
        "Sếp",
        "Hơi mờ phía sau nhưng OK. Cam on.",
        () => this._win()
      );
      return effects;
    }
    this._pushDialogue(
      effects,
      "Zoom",
      "Cảnh pantry + máy pha cà phê. Sếp đã gửi emoji 👀.",
      null
    );
    return effects;
  }

  plantDragEnd(overlapsLaptop) {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.joined || !this.has("bgPlant")) return effects;
    if (overlapsLaptop) {
      this.flags.usedPlantCam = true;
      this.removeItem("bgPlant");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "…",
        "Kê cây trước webcam. Pantry biến thành \"văn phòng xanh\".",
        null
      );
    }
    return effects;
  }

  hotspot(id) {
    if (this.flags.joined) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "curtain":
        if (!this.has("bgCurtain")) {
          this.addItem("bgCurtain");
          this._pushDialogue(effects, "…", "Chụp rèm phòng họp làm lớp nền.", null);
        }
        return effects;
      case "poster":
        if (!this.has("bgPoster")) {
          this.addItem("bgPoster");
          this._pushDialogue(effects, "…", "Poster \"Mọi Việc Đều Gấp\" — brand identity.", null);
        }
        return effects;
      case "plant":
        if (!this.has("bgPlant")) {
          this.addItem("bgPlant");
          this._pushDialogue(effects, "…", "Cây giả — chi phí CAPEX thấp.", null);
        }
        return effects;
      case "sticky":
        this.flags.readSticky = true;
        this._pushDialogue(
          effects,
          "Note",
          "Chỉ cần poster phía sau + blur là đủ. Đừng nói IT.",
          null
        );
        return effects;
      case "laptop":
        if (
          this.flags.readSticky &&
          this.selectedItem === "bgPoster" &&
          !this.flags.usedShortcut
        ) {
          this.flags.usedShortcut = true;
          this.flags.bgReady = true;
          this._pushDialogue(
            effects,
            "Zoom",
            "Bật blur nền + poster. Shortcut cho thực tập sinh.",
            null
          );
        } else {
          this._pushDialogue(effects, "Laptop", "Zoom đang chờ background.", null);
        }
        return effects;
      case "joinBtn":
        return this._tryJoin();
      default:
        return effects;
    }
  }
}
