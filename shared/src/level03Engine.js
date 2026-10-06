import {
  LEVEL03_HINTS,
  LEVEL03_INTRO,
  LEVEL03_WIN_MESSAGES,
} from "./level03Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    recipeFromCalendar: false,
    recipeFromNote: false,
    addedSugar: false,
    brewed: false,
    delivered: false,
    usedInstant: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level03Engine {
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
    if (this.flags.usedInstant) return 3;
    if (this.flags.recipeFromNote && !this.flags.recipeFromCalendar) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
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
    this._pushDialogue(effects, LEVEL03_INTRO.speaker, LEVEL03_INTRO.text, () => {
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
    const hint = LEVEL03_HINTS[this.flags.hintIndex % LEVEL03_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.has("cup") && this.has("instantSachet")) {
      this.removeItem("cup");
      this.removeItem("instantSachet");
      this.flags.usedInstant = true;
      this.addItem("fakeLatte");
      this.selectedItem = "fakeLatte";
      this._pushDialogue(
        effects,
        "…",
        "Hòa 3in1 vào ly. Viết nhầm \"Single Origin\" lên tay cầm.",
        null
      );
      return effects;
    }
    this._pushDialogue(effects, "…", "Ghép không ăn. Pantry không phải phòng thí nghiệm.", null);
    return effects;
  }

  _win() {
    this.flags.delivered = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — specialty 3in1!" : "Sếp có cà phê!";
    return [{ type: "win", stars, title, message: LEVEL03_WIN_MESSAGES[stars] }];
  }

  _deliver() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem === "fakeLatte") {
      this.removeItem("fakeLatte");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "Sếp",
        "Thơm… lạ. Nhưng deadline đang thơm hơn. Cảm ơn em.",
        () => this._win()
      );
      return effects;
    }
    if (this.selectedItem === "coffeeDone") {
      if (this.flags.addedSugar) {
        this._pushDialogue(
          effects,
          "Sếp",
          "Khách sắp tới mà đường? Em muốn anh ngủ trong cuộc họp à?",
          null
        );
        return effects;
      }
      if (!this.flags.recipeFromCalendar && !this.flags.recipeFromNote) {
        this._pushDialogue(
          effects,
          "Sếp",
          "Ly này… em có đọc lịch anh không?",
          null
        );
        return effects;
      }
      this.removeItem("coffeeDone");
      this.selectedItem = null;
      this._pushDialogue(effects, "Sếp", "Đúng gu. Họp khách mà cà phê không đường — chuẩn.", () =>
        this._win()
      );
      return effects;
    }
    this._pushDialogue(effects, "Sếp", "Anh cần cà phê, không cần ly rỗng.", null);
    return effects;
  }

  hotspot(id) {
    if (this.flags.delivered) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "calendar":
        this.flags.recipeFromCalendar = true;
        this._pushDialogue(
          effects,
          "Lịch",
          "10:00 Họp khách — ghi chú: \"KP: không đường, không sữa, nóng.\"",
          null
        );
        return effects;
      case "fridgeNote":
        this.flags.recipeFromNote = true;
        this._pushDialogue(
          effects,
          "Note",
          "Khách = 0 đường!!! (viết bởi thực tập sinh 2023)",
          null
        );
        return effects;
      case "cupShelf":
        if (!this.has("cup") && !this.has("coffeeDone")) {
          this.addItem("cup");
          this.selectedItem = "cup";
          this._pushDialogue(effects, "…", "Ly sạch. Hy vọng cũng sạch.", null);
        }
        return effects;
      case "sugar":
        if (this.selectedItem === "cup") {
          this.flags.addedSugar = true;
          this._pushDialogue(effects, "…", "Cho đường vào ly. Sếp sẽ không vui.", null);
        } else {
          this._pushDialogue(effects, "…", "Hũ đường im lặng nhìn bạn.", null);
        }
        return effects;
      case "machine":
        if (this.selectedItem === "cup" && !this.flags.brewed) {
          if (this.flags.addedSugar) {
            this._pushDialogue(effects, "Máy", "Pha xong — ly đã ngọt rồi.", null);
            return effects;
          }
          this.removeItem("cup");
          this.addItem("coffeeDone");
          this.selectedItem = "coffeeDone";
          this.flags.brewed = true;
          this._pushDialogue(effects, "Máy", "Espresso đen. Mùi deadline.", null);
        } else if (this.has("coffeeDone")) {
          this._pushDialogue(effects, "Máy", "Đã có cà phê rồi.", null);
        } else {
          this._pushDialogue(effects, "Máy", "Cần ly trước.", null);
        }
        return effects;
      case "instantShelf":
        if (!this.has("instantSachet")) {
          this.addItem("instantSachet");
          this._pushDialogue(effects, "…", "Gói 3in1 từ năm ngoái. Vẫn hạn… chắc vậy.", null);
        }
        return effects;
      case "boss":
        return this._deliver();
      default:
        return effects;
    }
  }
}
