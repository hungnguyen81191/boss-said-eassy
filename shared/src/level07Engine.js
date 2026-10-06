import {
  LEVEL07_HINTS,
  LEVEL07_INTRO,
  LEVEL07_WIN_MESSAGES,
} from "./level07Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    wrongTried: false,
    usedAbsurdPass: false,
    unlocked: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level07Engine {
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
    if (this.flags.usedAbsurdPass) return 3;
    if (!this.flags.wrongTried) return 2;
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
    this._pushDialogue(effects, LEVEL07_INTRO.speaker, LEVEL07_INTRO.text, () => {
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
    const hint = LEVEL07_HINTS[this.flags.hintIndex % LEVEL07_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.has("errorPrintout")) {
      this.addItem("passwordRVND");
      this.selectedItem = "passwordRVND";
      this._pushDialogue(
        effects,
        "…",
        "#REF #VALUE #NAME #DIV/0 → R-V-N-D. Intern genius.",
        null
      );
      return effects;
    }
    this._pushDialogue(effects, "…", "Cần sheet lỗi trước.", null);
    return effects;
  }

  _win() {
    this.flags.unlocked = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — mật khẩu vô lý!" : "Mở file!";
    return [{ type: "win", stars, title, message: LEVEL07_WIN_MESSAGES[stars] }];
  }

  _submitPassword() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem === "password884") {
      this.flags.usedAbsurdPass = true;
      this.removeItem("password884");
      this.addItem("unlockedReport");
      this.selectedItem = "unlockedReport";
      this._pushDialogue(
        effects,
        "Excel",
        "Mật khẩu 884… backdoor thực tập 2021 vẫn hoạt động.",
        () => this._win()
      );
      return effects;
    }
    if (this.selectedItem === "passwordRVND") {
      this.removeItem("passwordRVND");
      this.addItem("unlockedReport");
      this.selectedItem = "unlockedReport";
      this._pushDialogue(effects, "Excel", "File mở. #REF biến thành số tiền.", () =>
        this._win()
      );
      return effects;
    }
    if (this.selectedItem === "errorPrintout") {
      this.flags.wrongTried = true;
      this._pushDialogue(effects, "Excel", "Không phải mật khẩu. Thử ghép manh mối.", null);
      return effects;
    }
    this._pushDialogue(effects, "Excel", "Chọn mật khẩu trong túi rồi bấm nhập.", null);
    return effects;
  }

  hotspot(id) {
    if (this.flags.unlocked) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "excelLaptop":
        if (!this.has("errorPrintout")) {
          this.addItem("errorPrintout");
          this._pushDialogue(
            effects,
            "Excel",
            "Sheet khóa. Hàng 2: #REF!, #VALUE!, #NAME?, #DIV/0! — gợi ý đau tim.",
            null
          );
        }
        return effects;
      case "formulaHint":
        this._pushDialogue(
          effects,
          "Bảng",
          "Quy tắc IT: \"Lấy chữ cái sau dấu # của lỗi Excel.\"",
          null
        );
        return effects;
      case "stickyWrong":
        this.flags.wrongTried = true;
        this._pushDialogue(
          effects,
          "Note",
          "PASSWORD123 — gạch ngang và chữ \"deprecated\".",
          null
        );
        return effects;
      case "hrCalendar":
        if (!this.has("password884")) {
          this.addItem("password884");
          this._pushDialogue(
            effects,
            "Lịch",
            "Sinh nhật 8, 8, 4 tháng này. Ai đó từng dùng làm PIN…",
            null
          );
        }
        return effects;
      case "submitPass":
        return this._submitPassword();
      default:
        return effects;
    }
  }
}
