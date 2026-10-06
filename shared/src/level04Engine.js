import {
  LEVEL04_HINTS,
  LEVEL04_INTRO,
  LEVEL04_WIN_MESSAGES,
} from "./level04Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    triedPrint: false,
    itDistracted: false,
    cableSwapped: false,
    usedChocolate: false,
    phoneUnplugged: false,
    printed: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level04Engine {
  constructor() {
    this.reset();
  }

  reset() {
    this.inventory = new Set(["printFile"]);
    this.selectedItem = "printFile";
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
    if (this.flags.phoneUnplugged) return 3;
    if (this.flags.usedChocolate) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
      showItButton: this.flags.introComplete && !this.flags.printed,
      phoneDragEnabled:
        this.flags.introComplete &&
        this.flags.triedPrint &&
        !this.flags.cableSwapped &&
        !this.flags.printed,
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
    this._pushDialogue(effects, LEVEL04_INTRO.speaker, LEVEL04_INTRO.text, () => {
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
    const hint = LEVEL04_HINTS[this.flags.hintIndex % LEVEL04_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "IT", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    this._pushDialogue(effects, "…", "Ghép cáp với file? Máy in không ăn vậy.", null);
    return effects;
  }

  _win() {
    this.flags.printed = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — in trong hỗn loạn!" : "In xong!";
    return [{ type: "win", stars, title, message: LEVEL04_WIN_MESSAGES[stars] }];
  }

  _tryPrint() {
    const effects = /** @type {Effect[]} */ ([]);
    this.flags.triedPrint = true;
    if (!this.flags.cableSwapped) {
      this._pushDialogue(
        effects,
        "Máy in",
        "Lỗi: không có kết nối. Cáp USB biến mất — hướng bàn IT.",
        null
      );
      return effects;
    }
    this._pushDialogue(
      effects,
      "Máy in",
      "In… in… 20/20. Giấy bay như deadline.",
      () => this._win()
    );
    return effects;
  }

  _swapCable() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.cableSwapped) {
      this._pushDialogue(effects, "…", "Cáp đã ổn.", null);
      return effects;
    }
    if (this.selectedItem !== "spareCable") {
      this._pushDialogue(effects, "…", "Cần cáp dự phòng.", null);
      return effects;
    }
    if (!this.flags.itDistracted && !this.flags.usedChocolate) {
      this._pushDialogue(effects, "IT", "Anh đang sạc pin 3% — đừng đụng cáp.", null);
      return effects;
    }
    this.removeItem("spareCable");
    this.selectedItem = null;
    this.flags.cableSwapped = true;
    this._pushDialogue(
      effects,
      "…",
      "Đổi cáp nhanh như đổi blame. IT không phát hiện.",
      null
    );
    return effects;
  }

  callIt() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem === "chocolate" && !this.flags.cableSwapped) {
      this.removeItem("chocolate");
      this.selectedItem = null;
      this.flags.usedChocolate = true;
      this.flags.cableSwapped = true;
      this._pushDialogue(
        effects,
        "IT",
        "Socola à… OK anh cắm cáp dự phòng giúp. Đừng nói với sếp.",
        null
      );
      return effects;
    }
    this._pushDialogue(
      effects,
      "IT",
      "Máy in lỗi hả? Anh bận giữ mạng sống còn công ty.",
      null
    );
    return effects;
  }

  phoneDragEnd(overlapsItGuy) {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.cableSwapped || this.flags.printed) return effects;
    if (overlapsItGuy) {
      this.flags.phoneUnplugged = true;
      this.flags.cableSwapped = true;
      this.flags.itDistracted = true;
      this._pushDialogue(
        effects,
        "IT",
        "Ai rút sạc?! Pin anh… à kệ, cáp máy in rơi ra rồi.",
        null
      );
    }
    return effects;
  }

  hotspot(id) {
    if (this.flags.printed) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "printer":
        return this._tryPrint();
      case "drawer":
        if (!this.has("spareCable")) {
          this.addItem("spareCable");
          this._pushDialogue(effects, "…", "Cáp USB dự phòng — nhãn \"Đừng động\".", null);
        }
        return effects;
      case "wifiPoster":
        this.flags.itDistracted = true;
        this._pushDialogue(
          effects,
          "IT",
          "Wi‑Fi sập?! Đợi anh — poster nói gọi ext 404.",
          null
        );
        return effects;
      case "itDesk":
        return this._swapCable();
      case "itGuy":
        return this.callIt();
      case "phone":
        this._pushDialogue(
          effects,
          "Điện thoại",
          "Pin 3%. Cáp cắm vào… máy in.",
          null
        );
        return effects;
      case "snackMachine":
        if (!this.has("chocolate")) {
          this.addItem("chocolate");
          this._pushDialogue(effects, "…", "Mua socola cuối cùng. Hy vọng IT ăn chay.", null);
        }
        return effects;
      default:
        return effects;
    }
  }
}
