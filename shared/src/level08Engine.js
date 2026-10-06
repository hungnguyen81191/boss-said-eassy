import {
  LEVEL08_HINTS,
  LEVEL08_INTRO,
  LEVEL08_WIN_MESSAGES,
} from "./level08Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    bossBusy: false,
    clockFixed: false,
    breakerHit: false,
    escaped: false,
    usedFakeTask: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level08Engine {
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
    if (this.flags.breakerHit) return 3;
    if (this.flags.clockFixed) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
      vacuumDragEnabled:
        this.flags.introComplete &&
        this.has("vacuum") &&
        !this.flags.escaped,
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
    this._pushDialogue(effects, LEVEL08_INTRO.speaker, LEVEL08_INTRO.text, () => {
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
    const hint = LEVEL08_HINTS[this.flags.hintIndex % LEVEL08_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    this._pushDialogue(effects, "…", "Không ghép — chỉ cần ra cửa lúc 18:00.", null);
    return effects;
  }

  _win() {
    this.flags.escaped = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — tối om nhưng đúng giờ!" : "Về nhà!";
    return [{ type: "win", stars, title, message: LEVEL08_WIN_MESSAGES[stars] }];
  }

  _tryExit() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.bossBusy || this.flags.clockFixed || this.flags.breakerHit) {
      this._pushDialogue(
        effects,
        "…",
        "18:00. Cửa mở. Sếp bận — em lọt.",
        () => this._win()
      );
      return effects;
    }
    this._pushDialogue(
      effects,
      "Sếp",
      "Em đi đâu? Báo cáo… à anh nhớ rồi. Quay lại bàn.",
      null
    );
    return effects;
  }

  vacuumDragEnd(overlapsBreaker) {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.escaped || !this.has("vacuum")) return effects;
    if (overlapsBreaker) {
      this.flags.breakerHit = true;
      this.flags.bossBusy = true;
      this.removeItem("vacuum");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "…",
        "Robot đụng aptomat — cả tầng tối. Sếp chạy xuống tầng 1.",
        null
      );
    }
    return effects;
  }

  hotspot(id) {
    if (this.flags.escaped) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "laptop":
        if (!this.has("fakeUrgent")) {
          this.addItem("fakeUrgent");
          this._pushDialogue(
            effects,
            "…",
            "Soạn mail: \"Họp gấp tầng 20 — CEO\" — lịch trống nhưng sếp không biết.",
            null
          );
        } else if (this.selectedItem === "fakeUrgent" && !this.flags.usedFakeTask) {
          this.flags.usedFakeTask = true;
          this.flags.bossBusy = true;
          this.removeItem("fakeUrgent");
          this.selectedItem = null;
          this._pushDialogue(
            effects,
            "Sếp",
            "CEO gọi họp?! Anh lên ngay — báo cáo mai nhé em!",
            null
          );
        }
        return effects;
      case "storage":
        if (!this.has("ladder")) {
          this.addItem("ladder");
          this._pushDialogue(effects, "…", "Thang chữ A — ghi \"IT only\".", null);
        }
        return effects;
      case "wallClock":
        if (this.selectedItem === "ladder" && !this.flags.clockFixed) {
          this.flags.clockFixed = true;
          this.flags.bossBusy = true;
          this._pushDialogue(
            effects,
            "…",
            "Lên thang chỉnh đồng hồ +10 phút. Sếp: \"Trời ơi muộn họp rồi!\"",
            null
          );
        } else {
          this._pushDialogue(effects, "Đồng hồ", "17:59… vĩnh cửu gần deadline.", null);
        }
        return effects;
      case "vacuumDock":
        if (!this.has("vacuum")) {
          this.addItem("vacuum");
          this._pushDialogue(effects, "…", "Robot hút bụi — không có mapping văn phòng.", null);
        }
        return effects;
      case "breaker":
        this._pushDialogue(effects, "…", "Aptomat tầng — đừng đụng. (Unless robot.)", null);
        return effects;
      case "bossDoor":
        return this._tryExit();
      default:
        return effects;
    }
  }
}
