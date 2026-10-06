import {
  LEVEL01_HINTS,
  LEVEL01_INTRO,
  LEVEL01_WIN_MESSAGES,
} from "./level01Constants.js";

function defaultFlags() {
  return {
    drawerOpen: false,
    cabinetOpen: false,
    guardCalled: false,
    paperLoaded: false,
    printed: false,
    usedFakeGuard: false,
    usedKeyPath: false,
    usedCabinetDrag: false,
    introComplete: false,
    hintIndex: 0,
    starsEarned: 0,
  };
}

/** @typedef {{ speaker: string, text: string }} Dialogue */
/** @typedef {{ type: 'dialogue', dialogue: Dialogue } | { type: 'win', stars: number, title: string, message: string }} Effect */

export class Level01Engine {
  constructor() {
    this.reset();
  }

  reset() {
    /** @type {Set<string>} */
    this.inventory = new Set();
    this.selectedItem = null;
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
    if (this.flags.usedCabinetDrag) return 3;
    if (this.flags.usedKeyPath && !this.flags.usedFakeGuard) return 2;
    return 1;
  }

  getSnapshot() {
    return {
      inventory: [...this.inventory],
      selectedItem: this.selectedItem,
      flags: { ...this.flags },
      showGuardButton: this.flags.guardCalled,
      cabinetDragEnabled: this.flags.introComplete && this.has("document") && !this.flags.printed,
      dialogue: this.activeDialogue,
    };
  }

  /** @param {Effect[]} effects */
  _pushDialogue(effects, speaker, text, after) {
    this.activeDialogue = { speaker, text };
    effects.push({ type: "dialogue", dialogue: this.activeDialogue });
    if (after) this._afterDialogue = after;
  }

  /** @returns {Effect[]} */
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
    this._pushDialogue(effects, LEVEL01_INTRO.speaker, LEVEL01_INTRO.text, () => {
      this.flags.introComplete = true;
      return [];
    });
    return effects;
  }

  /** @returns {Effect[]} */
  selectItem(id) {
    if (id && !this.has(id)) return [];
    this.selectedItem = this.selectedItem === id ? null : id;
    return [];
  }

  /** @returns {Effect[]} */
  hint() {
    const effects = /** @type {Effect[]} */ ([]);
    const hint = LEVEL01_HINTS[this.flags.hintIndex % LEVEL01_HINTS.length];
    this.flags.hintIndex += 1;
    this._pushDialogue(effects, "Sếp", `Gợi ý: ${hint}`, null);
    return effects;
  }

  /** @returns {Effect[]} */
  combine() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.has("note") && this.has("pen")) {
      this.removeItem("note");
      this.removeItem("pen");
      this.addItem("fakeConfirm");
      this.selectedItem = "fakeConfirm";
      this._pushDialogue(
        effects,
        "…",
        'Viết vội: "XÁC NHẬN ĐÃ IN — P.KD". Chữ xấu = chân thật.',
        null
      );
      return effects;
    }
    this._pushDialogue(effects, "…", "Ghép không ra gì. Giống họp chiều thứ Sáu.", null);
    return effects;
  }

  /** @returns {Effect[]} */
  callGuard() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem === "fakeConfirm") {
      return this._showFakeToGuard(effects);
    }
    this._pushDialogue(effects, "Bảo vệ", "Có giấy xác nhận in không? Đưa anh xem.", null);
    return effects;
  }

  /** @param {Effect[]} effects @returns {Effect[]} */
  _showFakeToGuard(effects) {
    if (this.selectedItem !== "fakeConfirm") {
      this._pushDialogue(effects, "Bảo vệ", "Bạn cần gì? Đừng đưa tay không.", null);
      return effects;
    }
    this.flags.usedFakeGuard = true;
    this.flags.cabinetOpen = true;
    this.removeItem("fakeConfirm");
    this.selectedItem = null;
    this._pushDialogue(
      effects,
      "Bảo vệ",
      "Ừ, có dấu rồi. Vào lấy giấy đi — anh không check máy in đâu.",
      () => {
        this.addItem("paper");
        return [{ type: "dialogue", dialogue: { speaker: "…", text: "Bảo vệ gật. Giấy trong tay. Đạo đức nghề nghiệp… tạm nghỉ." } }];
      }
    );
    return effects;
  }

  /** @returns {Effect[]} */
  _win() {
    this.flags.printed = true;
    const stars = this.calcStars();
    this.flags.starsEarned = Math.max(this.flags.starsEarned, stars);
    const title = stars === 3 ? "Ba sao — hợp lý vô lý!" : "Xong việc!";
    return [{ type: "win", stars, title, message: LEVEL01_WIN_MESSAGES[stars] }];
  }

  /** @returns {Effect[]} */
  tryPrint() {
    const effects = /** @type {Effect[]} */ ([]);
    if (!this.has("document")) {
      this._pushDialogue(effects, "…", "Máy in: Không có file. Sếp giao tài liệu đâu rồi?", null);
      return effects;
    }
    if (this.flags.usedCabinetDrag) {
      this._pushDialogue(effects, "…", "Máy hút giấy thẳng từ tủ. In xong. Luật vật lý nghỉ phép.", () => this._win());
      return effects;
    }
    if (!this.flags.paperLoaded) {
      this._pushDialogue(effects, "…", "Máy in: Hết giấy. (Thật ra là chưa ai nạp.)", null);
      return effects;
    }
    this.removeItem("document");
    this._pushDialogue(effects, "…", "In xong 1 bản. Mùi mực nóng — mùi deadline.", () => this._win());
    return effects;
  }

  /** @returns {Effect[]} */
  loadPrinter() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.selectedItem !== "paper") {
      this._pushDialogue(effects, "…", "Máy in: Nạp giấy A4 vào khay — nếu bạn có.", null);
      return effects;
    }
    this.removeItem("paper");
    this.selectedItem = null;
    this.flags.paperLoaded = true;
    this._pushDialogue(effects, "…", "Giấy vào khay. Đèn đỏ tắt. Hy vọng le lói.", null);
    return effects;
  }

  /** @returns {Effect[]} */
  openDrawer() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.drawerOpen) {
      this._pushDialogue(effects, "…", "Ngăn kéo đã mở. Chìa nằm im.", null);
      return effects;
    }
    if (this.selectedItem === "ruler") {
      this.flags.drawerOpen = true;
      this.flags.usedKeyPath = true;
      this.addItem("key");
      this.removeItem("ruler");
      this.selectedItem = null;
      this._pushDialogue(effects, "…", "Thước kẹp hóa ra đòn bẩy. Chìa tủ rơi ra.", null);
      return effects;
    }
    this._pushDialogue(effects, "…", "Ngăn kéo kẹt. Cần cạy — thứ gì cứng vừa vặn.", null);
    return effects;
  }

  /** @returns {Effect[]} */
  interactCabinet() {
    const effects = /** @type {Effect[]} */ ([]);
    if (this.flags.cabinetOpen) {
      if (!this.has("paper")) {
        this.addItem("paper");
        this._pushDialogue(effects, "…", "Lấy một rim giấy. Tủ kêu cót két như kêu uất.", null);
      } else {
        this._pushDialogue(effects, "…", "Chỉ còn bụi giấy.", null);
      }
      return effects;
    }
    if (this.selectedItem === "key") {
      this.flags.cabinetOpen = true;
      this.flags.usedKeyPath = true;
      this.removeItem("key");
      this.selectedItem = null;
      this._pushDialogue(effects, "…", "Chìa đúng. Tủ mở — quy trình bypass thành công.", null);
      return effects;
    }
    if (!this.flags.guardCalled) {
      this.flags.guardCalled = true;
      this._pushDialogue(
        effects,
        "Bảo vệ",
        "Mở tủ giấy cần giấy xác nhận đã in. Công ty quy định, anh chỉ làm đúng luật.",
        null
      );
      return effects;
    }
    if (this.selectedItem === "fakeConfirm") {
      return this._showFakeToGuard(effects);
    }
    this._pushDialogue(effects, "Bảo vệ", "Giấy xác nhận đâu? Không có thì anh không mở.", null);
    return effects;
  }

  /** @param {boolean} overlapsPrinter @returns {Effect[]} */
  cabinetDragEnd(overlapsPrinter) {
    const effects = /** @type {Effect[]} */ ([]);
    if (!this.flags.introComplete || !this.has("document") || this.flags.printed) return effects;
    if (overlapsPrinter) {
      this.flags.usedCabinetDrag = true;
      this.flags.paperLoaded = true;
      this._pushDialogue(effects, "…", "Tủ chạm máy in. Giấy tự nhiên được — đừng hỏi.", null);
    }
    return effects;
  }

  /** @param {string} id @returns {Effect[]} */
  hotspot(id) {
    if (this.flags.printed) return [];
    const effects = /** @type {Effect[]} */ ([]);
    switch (id) {
      case "desk":
        if (!this.has("document")) {
          this.addItem("document");
          this._pushDialogue(effects, "…", "Hợp đồng cần in. Sếp nói 5 phút — classic.", null);
        } else {
          this._pushDialogue(effects, "…", "Bàn bừa bộn kiểu quen thuộc.", null);
        }
        return effects;
      case "note":
        if (!this.has("note") && !this.has("fakeConfirm")) {
          this.addItem("note");
          this._pushDialogue(effects, "…", 'Note vàng: "Nhớ in HĐ trước họp." Ai cũng quên.', null);
        }
        return effects;
      case "pen":
        if (!this.has("pen")) {
          this.addItem("pen");
          this._pushDialogue(effects, "…", "Bút hết mực một nửa — đủ ký tên giả.", null);
        }
        return effects;
      case "ruler":
        if (!this.has("ruler") && !this.flags.drawerOpen) {
          this.addItem("ruler");
          this._pushDialogue(effects, "…", "Thước kẹp giấy. Văn phòng không thiếu vũ khí cận chiến.", null);
        }
        return effects;
      case "drawer":
        return this.openDrawer();
      case "cabinet":
        return this.interactCabinet();
      case "printer":
        if (this.selectedItem === "paper") return this.loadPrinter();
        return this.tryPrint();
      default:
        return effects;
    }
  }
}
