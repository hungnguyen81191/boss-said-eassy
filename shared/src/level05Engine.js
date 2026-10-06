import {
  LEVEL05_HINTS,
  LEVEL05_INTRO,
  LEVEL05_WIN_MESSAGES,
} from "./level05Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    knowsBlueLanyard: false,
    knowsPlanningMeeting: false,
    wrongSendAttempt: false,
    usedAlias: false,
    sent: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level05Engine {
  constructor() {
    this.reset();
  }

  reset() {
    this.inventory = new Set(["emailDraft"]);
    this.selectedItem = "emailDraft";
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
    if (this.flags.usedAlias) return 3;
    if (!this.flags.wrongSendAttempt) return 2;
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
    this._pushDialogue(effects, LEVEL05_INTRO.speaker, LEVEL05_INTRO.text, () => {
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
    const hint = LEVEL05_HINTS[this.flags.hintIndex % LEVEL05_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.has("emailDraft") && this.has("orgChart")) {
      this.removeItem("emailDraft");
      this.removeItem("orgChart");
      this.flags.usedAlias = true;
      this.addItem("teamAlias");
      this.selectedItem = "teamAlias";
      this._pushDialogue(
        effects,
        "…",
        "Sơ đồ ghi planning-team@company.vn — gửi một phát, tránh Tuấn.",
        null
      );
      return effects;
    }
    this._pushDialogue(effects, "…", "Ghép thêm manh mối đi.", null);
    return effects;
  }

  _win() {
    this.flags.sent = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — alias cứu cả tầng!" : "Gửi xong!";
    return [{ type: "win", stars, title, message: LEVEL05_WIN_MESSAGES[stars] }];
  }

  _canPickTuấn() {
    return this.flags.knowsBlueLanyard && this.flags.knowsPlanningMeeting;
  }

  _send() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem === "teamAlias") {
      this.removeItem("teamAlias");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "Outlook",
        "Đã gửi tới planning-team@. Không Tuấn nào bị oan.",
        () => this._win()
      );
      return effects;
    }
    if (this.selectedItem === "emailReady") {
      this.removeItem("emailReady");
      this.selectedItem = null;
      this._pushDialogue(effects, "Outlook", "Gửi thành công. Đúng Tuấn Kế hoạch.", () =>
        this._win()
      );
      return effects;
    }
    this._pushDialogue(effects, "Outlook", "Chưa chọn người nhận.", null);
    return effects;
  }

  hotspot(id) {
    if (this.flags.sent) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "lanyardBoard":
        this.flags.knowsBlueLanyard = true;
        this._pushDialogue(
          effects,
          "Bảng thẻ",
          "Tuấn — Phòng Kế hoạch — dây xanh lam.",
          null
        );
        return effects;
      case "calendar":
        this.flags.knowsPlanningMeeting = true;
        this._pushDialogue(
          effects,
          "Lịch",
          "11:00 Họp Kế hoạch Q4 — Tuấn (TL) chủ trì.",
          null
        );
        return effects;
      case "signatures":
        this.flags.knowsPlanningMeeting = true;
        this._pushDialogue(
          effects,
          "Chữ ký",
          "Tuấn Hoàng — \"Sent from Planning iPad\".",
          null
        );
        return effects;
      case "deskChart":
        if (!this.has("orgChart")) {
          this.addItem("orgChart");
          this._pushDialogue(effects, "…", "Sơ đồ tổ chức — mục Planning có email nhóm.", null);
        }
        return effects;
      case "laptop":
        if (this.selectedItem === "emailDraft") {
          this._pushDialogue(
            effects,
            "Laptop",
            "Soạn xong. Cần chọn đúng Tuấn trong danh bạ.",
            null
          );
        }
        return effects;
      case "contacts":
        if (!this._canPickTuấn()) {
          this.flags.wrongSendAttempt = true;
          this._pushDialogue(
            effects,
            "Danh bạ",
            "Gửi nhầm Tuấn Sales. Reply: \"Anh không phải Tuấn em cần.\"",
            null
          );
          return effects;
        }
        if (this.has("emailDraft")) {
          this.removeItem("emailDraft");
          this.addItem("emailReady");
          this.selectedItem = "emailReady";
          this._pushDialogue(
            effects,
            "Danh bạ",
            "Chọn Tuấn TL — dây xanh — Planning. Mail sẵn sàng gửi.",
            null
          );
        } else if (this.has("emailReady") || this.has("teamAlias")) {
          this._pushDialogue(effects, "Danh bạ", "Người nhận đã chọn.", null);
        }
        return effects;
      case "outbox":
        return this._send();
      default:
        return effects;
    }
  }
}
