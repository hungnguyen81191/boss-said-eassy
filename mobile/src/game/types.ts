import type { ImageSourcePropType } from "react-native";

export type GameEffect =
  | { type: "dialogue"; dialogue: { speaker: string; text: string } }
  | { type: "win"; stars: number; title: string; message: string };

export type HotspotDef = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ItemDef = { id: string; name: string; icon: string };

export type LevelSnapshot = {
  inventory: string[];
  selectedItem: string | null;
  showGuardButton?: boolean;
  showReceptionButton?: boolean;
  showItButton?: boolean;
  cabinetDragEnabled?: boolean;
  nameplateDragEnabled?: boolean;
  phoneDragEnabled?: boolean;
  plantDragEnabled?: boolean;
  vacuumDragEnabled?: boolean;
  dialogue: { speaker: string; text: string } | null;
};

export interface LevelEngine {
  activeDialogue: { speaker: string; text: string } | null;
  reset(): void;
  getSnapshot(): LevelSnapshot;
  startLevel(): GameEffect[];
  hotspot(id: string): GameEffect[];
  selectItem(id: string | null): GameEffect[];
  hint(): GameEffect[];
  combine(): GameEffect[];
  dismissDialogue(): GameEffect[];
  callGuard?(): GameEffect[];
  callReception?(): GameEffect[];
  callIt?(): GameEffect[];
  cabinetDragEnd?(overlap: boolean): GameEffect[];
  nameplateDragEnd?(overlap: boolean): GameEffect[];
  phoneDragEnd?(overlap: boolean): GameEffect[];
  plantDragEnd?(overlap: boolean): GameEffect[];
  vacuumDragEnd?(overlap: boolean): GameEffect[];
}

export type DragConfig = {
  targetHotspotId: string;
  initial: { left: number; top: number };
  widthPct: number;
  heightPct: number;
  enabled: (snap: LevelSnapshot) => boolean;
  onDrop: (engine: LevelEngine, overlap: boolean) => GameEffect[];
};

export type LevelConfig = {
  id: number;
  title: string;
  subtitle: string;
  background: ImageSourcePropType;
  portrait: ImageSourcePropType;
  itemDefs: Record<string, ItemDef>;
  hotspots: HotspotDef[];
  createEngine: () => LevelEngine;
  drag?: DragConfig;
  hasCombine?: boolean;
};
