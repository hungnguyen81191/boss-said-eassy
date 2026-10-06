import type { GameEffect, LevelEngine } from "../game/types";

export type AutoplayRun = {
  apply: (effects: GameEffect[]) => void;
  run: (fn: () => GameEffect[]) => void;
  stepDelay?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function dismissAll(
  engine: LevelEngine,
  apply: (effects: GameEffect[]) => void,
  stepDelay: number
) {
  while (engine.activeDialogue) {
    apply(engine.dismissDialogue());
    await sleep(stepDelay);
  }
}

function ensureSelect(engine: LevelEngine, id: string) {
  const cur = engine.getSnapshot().selectedItem;
  if (cur !== id) {
    if (cur) engine.selectItem(cur);
    engine.selectItem(id);
  }
}

async function introDone(
  engine: LevelEngine,
  apply: (effects: GameEffect[]) => void,
  stepDelay: number
) {
  await sleep(stepDelay);
  await dismissAll(engine, apply, stepDelay);
}

/** Màn 1 — 1★ giấy giả + bảo vệ */
export async function autoplayLevel1(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 1");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("desk"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("note"));
  run(() => engine.hotspot("pen"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.combine());
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("cabinet"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "fakeConfirm");
  run(() => engine.callGuard!());
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "paper");
  run(() => engine.hotspot("printer"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "document");
  run(() => engine.hotspot("printer"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 1 xong");
}

/** Màn 2 — 1★ nam châm */
export async function autoplayLevel2(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 2");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("turnstile"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("nameBoard"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "magnet");
  run(() => engine.hotspot("clockMachine"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "idCard");
  run(() => engine.hotspot("turnstile"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 2 xong");
}

/** Màn 3 — 1★ lịch + pha đen */
export async function autoplayLevel3(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 3");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("calendar"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("cupShelf"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "cup");
  run(() => engine.hotspot("machine"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "coffeeDone");
  run(() => engine.hotspot("boss"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 3 xong");
}

/** Màn 4 — 1★ cáp lén */
export async function autoplayLevel4(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 4");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("printer"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("drawer"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("wifiPoster"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "spareCable");
  run(() => engine.hotspot("itDesk"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("printer"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 4 xong");
}

/** Màn 5 — 1★ đúng Tuấn */
export async function autoplayLevel5(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 5");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("lanyardBoard"));
  run(() => engine.hotspot("calendar"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("contacts"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "emailReady");
  run(() => engine.hotspot("outbox"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 5 xong");
}

/** Màn 6 — 1★ background 3 lớp */
export async function autoplayLevel6(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 6");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("curtain"));
  run(() => engine.hotspot("poster"));
  run(() => engine.hotspot("plant"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.combine());
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("joinBtn"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 6 xong");
}

/** Màn 7 — 1★ RVND */
export async function autoplayLevel7(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 7");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("excelLaptop"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.combine());
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "passwordRVND");
  run(() => engine.hotspot("submitPass"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 7 xong");
}

/** Màn 8 — 1★ việc gấp giả */
export async function autoplayLevel8(
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  console.log("[QA autoplay] Màn 8");
  await introDone(engine, apply, stepDelay);

  run(() => engine.hotspot("laptop"));
  await dismissAll(engine, apply, stepDelay);
  ensureSelect(engine, "fakeUrgent");
  run(() => engine.hotspot("laptop"));
  await dismissAll(engine, apply, stepDelay);
  run(() => engine.hotspot("bossDoor"));
  await dismissAll(engine, apply, stepDelay);
  console.log("[QA autoplay] Màn 8 xong");
}

const RUNNERS: Record<
  number,
  (
    engine: LevelEngine,
    apply: AutoplayRun["apply"],
    run: AutoplayRun["run"],
    stepDelay: number
  ) => Promise<void>
> = {
  1: autoplayLevel1,
  2: autoplayLevel2,
  3: autoplayLevel3,
  4: autoplayLevel4,
  5: autoplayLevel5,
  6: autoplayLevel6,
  7: autoplayLevel7,
  8: autoplayLevel8,
};

export async function runAutoplayForLevel(
  levelId: number,
  engine: LevelEngine,
  apply: AutoplayRun["apply"],
  run: AutoplayRun["run"],
  stepDelay = 500
) {
  const fn = RUNNERS[levelId];
  if (!fn) {
    console.warn("[QA autoplay] Chưa có màn", levelId);
    return;
  }
  await fn(engine, apply, run, stepDelay);
}

export function parseAutoplayLevelFromUrl(url: string | null): number | null {
  if (!url) return null;
  const m =
    url.match(/[?&]autoplay=level(\d+)/i) ||
    url.match(/autoplay.*level(\d+)/i) ||
    url.match(/level(\d+).*autoplay/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 8 ? n : null;
}
