import { Level01Engine } from "../shared/src/index.js";

const engine = new Level01Engine();
const log = (step, text) => console.log(`[${step}] ${text}`);

function run(fn) {
  return fn();
}

function dismissAll() {
  /** @type {import('../shared/src/level01Engine.js').Level01Engine extends infer _ ? { type: 'win', stars: number, message: string } | null : never} */
  let win = null;
  while (engine.activeDialogue) {
    const more = engine.dismissDialogue();
    for (const e of more) {
      if (e.type === "win") win = e;
    }
  }
  return win;
}

log("1", "Bắt đầu màn 1 — luồng ★ (giấy giả + bảo vệ)");
run(() => engine.startLevel());
log("1a", `Sếp: ${engine.activeDialogue?.text?.slice(0, 50)}…`);
dismissAll();

run(() => engine.hotspot("desk"));
dismissAll();
log("2", "Nhặt hợp đồng");

run(() => engine.hotspot("note"));
run(() => engine.hotspot("pen"));
dismissAll();
log("3", "Note + bút");

run(() => engine.combine());
dismissAll();
log("4", "Ghép → giấy xác nhận giả");

run(() => engine.hotspot("cabinet"));
dismissAll();
log("5", "Tủ → gặp bảo vệ");

if (engine.selectedItem !== "fakeConfirm") engine.selectItem("fakeConfirm");
run(() => engine.callGuard());
dismissAll();
log("6", "Bảo vệ → giấy A4");

engine.selectItem("paper");
run(() => engine.hotspot("printer"));
dismissAll();
log("7", "Nạp giấy");

engine.selectItem("document");
run(() => engine.hotspot("printer"));
const win = dismissAll();
log("8", `Thắng: ${win?.stars ?? "?"}★ — ${win?.message ?? "chưa win"}`);
