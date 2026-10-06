/**
 * Smoke: engine màn 1–8 khởi tạo được.
 * Autoplay UI: nút ▶ trên app hoặc exp://127.0.0.1:8081/--/?autoplay=levelN
 */
import {
  Level01Engine,
  Level02Engine,
  Level03Engine,
  Level04Engine,
  Level05Engine,
  Level06Engine,
  Level07Engine,
  Level08Engine,
} from "../shared/src/index.js";

const list = [
  [1, Level01Engine],
  [2, Level02Engine],
  [3, Level03Engine],
  [4, Level04Engine],
  [5, Level05Engine],
  [6, Level06Engine],
  [7, Level07Engine],
  [8, Level08Engine],
];

for (const [id, Engine] of list) {
  const e = new Engine();
  const fx = e.startLevel();
  console.log(`Màn ${id}: intro dialogue`, fx[0]?.type === "dialogue");
}

console.log("OK — 8 engine. Chạy autoplay trên sim: bấm ▶ N trên HUD dev.");
