import {
  LEVEL02_HINTS,
  LEVEL02_INTRO,
  LEVEL02_WIN_MESSAGES,
} from "./level02Constants.js";

function defaultFlags() {
  return {
    introComplete: false,
    cardSwallowed: false,
    cardRecovered: false,
    checkedIn: false,
    usedMagnet: false,
    usedVisitorBadge: false,
    usedNameplateTrick: false,
    receptionAsked: false,
    hintIndex: 0,
    starsEarned: 0,
    nameplateTaken: false,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level02Engine {
  constructor() {
    this.reset();
  }

  reset() {
    /** @type {Set<string>} */
    this.inventory = new Set(["idCard"]);
    this.selectedItem = "idCard";
    this.flags = defaultFlags();
    /** @type {Dialogue | null} */
    this.activeDialogue = null;
    /** @type {(() => Effect[]) | null} */
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
    if (this.flags.usedNameplateTrick) return 3;
    if (this.flags.usedVisitorBadge) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
      showGuardButton: false,
      showReceptionButton: this.flags.receptionAsked || this.flags.introComplete,
      cabinetDragEnabled: false,
      nameplateDragEnabled:
        this.flags.introComplete &&
        this.flags.nameplateTaken &&
        !this.flags.checkedIn,
      dialogue: this.activeDialogue,
    };
  }

  /** @param {Effect[]} effects */
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

  /** @returns {Effect[]} */
  startLevel() {
    const effects = /** @type {Effect[]} */ ([]);
    this._pushDialogue(effects, LEVEL02_INTRO.speaker, LEVEL02_INTRO.text, () => {
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

  /** @returns {Effect[]} */
  hint() {
    const effects = /** @type {Effect[]} */ ([]);
    const hint = LEVEL02_HINTS[this.flags.hintIndex % LEVEL02_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "HR", `Gợi ý: ${hint}`, null);
    return effects;
  }

  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    this._pushDialogue(effects, "…", "Ghép gì nữa? Thẻ khách lễ tân cấp, không DIY.", null);
    return effects;
  }

  /** @returns {Effect[]} */
  _win() {
    this.flags.checkedIn = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — cảm biến bị gaslight!" : "Vào làm!";
    return [{ type: "win", stars, title, message: LEVEL02_WIN_MESSAGES[stars] }];
  }

  /** @returns {Effect[]} */
  _tryCheckIn() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.checkedIn) return effects;

    if (this.flags.usedNameplateTrick) {
      this._pushDialogue(
        effects,
        "…",
        "Cảm biến tưởng bảng tên là thẻ nhân viên. Cổng mở. Luật công ty im lặng.",
        () => this._win()
      );
      return effects;
    }

    if (this.selectedItem === "visitorBadge") {
      this.flags.usedVisitorBadge = true;
      this.removeItem("visitorBadge");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "Lễ tân",
        "Thẻ khách one-day. Đừng quên trả — à thôi, mai cũng quên.",
        () => this._win()
      );
      return effects;
    }

    if (this.selectedItem === "idCard" && this.flags.cardRecovered) {
      this.flags.usedMagnet = true;
      this.removeItem("idCard");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "…",
        "Quẹt thẻ — tít! 08:29. Sát sao như deadline.",
        () => this._win()
      );
      return effects;
    }

    if (this.selectedItem === "idCard" && !this.flags.cardSwallowed) {
      this.flags.cardSwallowed = true;
      this.removeItem("idCard");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "Máy chấm công",
        "Kẹt thẻ. Màn hình: LỖI NUỐT THẺ. (Model 2019 — quen rồi.)",
        null
      );
      return effects;
    }

    this._pushDialogue(
      effects,
      "Cổng",
      "Không thẻ, không vào. Bảo vệ nhìn bạn như nhìn Excel lỗi.",
      null
    );
    return effects;
  }

  /** @returns {Effect[]} */
  callReception() {
    const effects = /** @type {Effect[]} */ ([]);
    this.flags.receptionAsked = true;

    if (this.selectedItem === "meetingEmail") {
      if (this.has("visitorBadge")) {
        this._pushDialogue(effects, "Lễ tân", "Chị cấp thẻ rồi mà?", null);
        return effects;
      }
      this.removeItem("meetingEmail");
      this.selectedItem = null;
      this.addItem("visitorBadge");
      this._pushDialogue(
        effects,
        "Lễ tân",
        "Mail họp 8:30 với sếp — đúng giờ ghê. Đây thẻ khách tạm.",
        null
      );
      return effects;
    }

    this._pushDialogue(
      effects,
      "Lễ tân",
      "Thẻ lỗi hả? Có giấy mời họp in ra thì chị cấp thẻ khách.",
      null
    );
    return effects;
  }

  /** @param {boolean} overlapsTurnstile @returns {Effect[]} */
  nameplateDragEnd(overlapsTurnstile) {
    const effects = /** @type {Effect[]} */ ([]);
    if (!this.flags.nameplateTaken || this.flags.checkedIn) return effects;
    if (overlapsTurnstile) {
      this.flags.usedNameplateTrick = true;
      this.removeItem("nameplate");
      this.selectedItem = null;
      this._pushDialogue(
        effects,
        "…",
        "Bảng tên dính cảm biến. Cổng kêu *beep* trầm trọng.",
        null
      );
    }
    return effects;
  }

  /** @param {string} id @returns {Effect[]} */
  hotspot(id) {
    if (this.flags.checkedIn) return [];
    const effects = /** @type {Effect[]} */ ([]);

    switch (id) {
      case "turnstile":
        return this._tryCheckIn();
      case "clockMachine":
        if (this.selectedItem === "magnet" && this.flags.cardSwallowed && !this.flags.cardRecovered) {
          this.flags.cardRecovered = true;
          this.flags.usedMagnet = true;
          this.removeItem("magnet");
          this.addItem("idCard");
          this.selectedItem = "idCard";
          this._pushDialogue(
            effects,
            "…",
            "Nam châm kéo thẻ ra — kèm tiếng *schlk* đáng sợ.",
            null
          );
          return effects;
        }
        if (this.flags.cardSwallowed && !this.flags.cardRecovered) {
          this._pushDialogue(
            effects,
            "Máy chấm công",
            "Thẻ kẹt sâu bên trong. Cần thứ hút — hoặc nam châm.",
            null
          );
          return effects;
        }
        this._pushDialogue(effects, "Máy chấm công", "Màn hình chờ thẻ. Hôm nay thứ Ba.", null);
        return effects;
      case "nameBoard":
        if (!this.has("magnet")) {
          this.addItem("magnet");
          this._pushDialogue(
            effects,
            "…",
            "Nam châm dính sau bảng tên — ai cũng dùng, không ai nói.",
            null
          );
          return effects;
        }
        if (!this.flags.nameplateTaken && !this.has("nameplate")) {
          this.flags.nameplateTaken = true;
          this.addItem("nameplate");
          this._pushDialogue(
            effects,
            "…",
            "Tháo luôn bảng tên thực tập sinh cũ. Sorry Minh.",
            null
          );
          return effects;
        }
        this._pushDialogue(effects, "…", "Bảng tên trống. HR sẽ hỏi sau.", null);
        return effects;
      case "receptionDesk":
        return this.callReception();
      case "mailTray":
        if (!this.has("meetingEmail")) {
          this.addItem("meetingEmail");
          this._pushDialogue(
            effects,
            "…",
            "Bản in: \"Họp 8:30 — Sếp + Thực tập sinh mới\". Handy.",
            null
          );
          return effects;
        }
        this._pushDialogue(effects, "…", "Khay thư trống toàn brochure tuyển dụng.", null);
        return effects;
      case "rulePoster":
        this._pushDialogue(
          effects,
          "Nội quy",
          "Điều 7: Không dùng nam châm gần bảng tên. (Không ai đọc.)",
          null
        );
        return effects;
      default:
        return effects;
    }
  }
}
