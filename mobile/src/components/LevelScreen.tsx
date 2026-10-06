import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { GameEffect, LevelConfig, LevelEngine } from "../game/types";

type Props = {
  config: LevelConfig;
  onWin: (stars: number) => void;
  onReplay: () => void;
  autoplay?: boolean;
  onAutoplayDone?: () => void;
  bestStars?: number;
};

export function LevelScreen({
  config,
  onWin,
  onReplay,
  autoplay: runAutoplay,
  onAutoplayDone,
  bestStars = 0,
}: Props) {
  const engine = useRef<LevelEngine>(config.createEngine()).current;
  const [tick, setTick] = useState(0);
  const [win, setWin] = useState<Extract<GameEffect, { type: "win" }> | null>(
    null
  );
  const { width: windowWidth } = useWindowDimensions();
  const maxStageWidth = Platform.OS === "web" ? Math.min(windowWidth, 920) : windowWidth;
  const sceneWidth = maxStageWidth - 16;
  const sceneHeight = sceneWidth * (9 / 16);

  const dragPos = useRef({ left: 0.5, top: 0.35 });

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const applyEffects = useCallback(
    (effects: GameEffect[]) => {
      for (const e of effects) {
        if (e.type === "win") {
          setWin(e);
          onWin(e.stars);
        }
      }
      refresh();
    },
    [onWin, refresh]
  );

  const run = useCallback(
    (fn: () => GameEffect[]) => {
      applyEffects(fn());
    },
    [applyEffects]
  );

  const snap = useMemo(() => engine.getSnapshot(), [engine, tick]);

  const targetRect = useMemo(() => {
    const id = config.drag?.targetHotspotId;
    if (!id) return null;
    const p = config.hotspots.find((h) => h.id === id);
    if (!p) return null;
    return {
      left: (p.left / 100) * sceneWidth,
      top: (p.top / 100) * sceneHeight,
      width: (p.width / 100) * sceneWidth,
      height: (p.height / 100) * sceneHeight,
    };
  }, [config.drag?.targetHotspotId, config.hotspots, sceneWidth, sceneHeight]);

  const dragEnabled = config.drag?.enabled(snap) ?? false;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        config.drag?.enabled(engine.getSnapshot()) ?? false,
      onPanResponderMove: (_, g) => {
        if (!config.drag) return;
        const left = (dragPos.current.left * sceneWidth + g.dx) / sceneWidth;
        const top = (dragPos.current.top * sceneHeight + g.dy) / sceneHeight;
        dragPos.current.left = Math.min(0.85, Math.max(0.05, left));
        dragPos.current.top = Math.min(0.75, Math.max(0.08, top));
        refresh();
      },
      onPanResponderRelease: () => {
        if (!config.drag || !targetRect) return;
        const w = (config.drag.widthPct / 100) * sceneWidth;
        const h = (config.drag.heightPct / 100) * sceneHeight;
        const cabLeft = dragPos.current.left * sceneWidth;
        const cabTop = dragPos.current.top * sceneHeight;
        const overlap =
          cabLeft < targetRect.left + targetRect.width &&
          cabLeft + w > targetRect.left &&
          cabTop < targetRect.top + targetRect.height &&
          cabTop + h > targetRect.top;
        run(() => config.drag!.onDrop(engine, overlap));
      },
    })
  ).current;

  const autoplayStarted = useRef(false);

  useEffect(() => {
    engine.reset();
    autoplayStarted.current = false;
    if (config.drag) {
      dragPos.current.left = config.drag.initial.left;
      dragPos.current.top = config.drag.initial.top;
    }
    setWin(null);
    run(() => engine.startLevel());
  }, [config.id, engine, run, config.drag]);

  useEffect(() => {
    if (!__DEV__ || !runAutoplay || autoplayStarted.current) {
      return;
    }
    autoplayStarted.current = true;
    let cancelled = false;
    (async () => {
      const { runAutoplayForLevel } = await import("../dev/simAutoplay");
      await runAutoplayForLevel(config.id, engine, applyEffects, run, 520);
      if (!cancelled) onAutoplayDone?.();
    })();
    return () => {
      cancelled = true;
    };
  }, [runAutoplay, config.id, engine, applyEffects, run, onAutoplayDone]);

  const onDismissDialogue = () => {
    applyEffects(engine.dismissDialogue());
  };

  const starsEarned = win?.stars ?? bestStars;

  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.sub}>
            {config.title} · {config.subtitle}
          </Text>
        </View>
        <View style={styles.starRow}>
          {[1, 2, 3].map((n) => (
            <Text
              key={n}
              style={[styles.star, n <= starsEarned && styles.starOn]}
            >
              ★
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.scene, { width: sceneWidth, height: sceneHeight }]}>
        <ImageBackground
          source={config.background}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {config.hotspots.map((spot) => (
          <Pressable
            key={spot.id}
            style={[
              styles.hotspot,
              {
                left: `${spot.left}%`,
                top: `${spot.top}%`,
                width: `${spot.width}%`,
                height: `${spot.height}%`,
              },
            ]}
            onPress={() => run(() => engine.hotspot(spot.id))}
            accessibilityLabel={spot.label}
          />
        ))}
        {dragEnabled && config.drag && (
          <View
            {...pan.panHandlers}
            style={[
              styles.dragHandle,
              {
                left: `${dragPos.current.left * 100}%`,
                top: `${dragPos.current.top * 100}%`,
                width: `${config.drag.widthPct}%`,
                height: `${config.drag.heightPct}%`,
              },
            ]}
          />
        )}
      </View>

      <ScrollView
        horizontal
        style={styles.invBar}
        contentContainerStyle={styles.invContent}
      >
        {snap.inventory.map((id) => {
          const def = config.itemDefs[id];
          if (!def) return null;
          const selected = snap.selectedItem === id;
          return (
            <Pressable
              key={id}
              style={[styles.invItem, selected && styles.invSelected]}
              onPress={() => {
                if (snap.selectedItem === id) return;
                engine.selectItem(id);
                refresh();
              }}
            >
              <Text style={styles.invIcon}>{def.icon}</Text>
              <Text style={styles.invLabel}>{def.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolBtn} onPress={() => run(() => engine.hint())}>
          <Text style={styles.toolText}>Gợi ý</Text>
        </Pressable>
        {config.hasCombine !== false && (
          <Pressable
            style={styles.toolBtn}
            onPress={() => run(() => engine.combine())}
          >
            <Text style={styles.toolText}>Ghép đồ</Text>
          </Pressable>
        )}
        {snap.showGuardButton && engine.callGuard && (
          <Pressable
            style={styles.toolBtn}
            onPress={() => run(() => engine.callGuard!())}
          >
            <Text style={styles.toolText}>Bảo vệ</Text>
          </Pressable>
        )}
        {snap.showReceptionButton && engine.callReception && (
          <Pressable
            style={styles.toolBtn}
            onPress={() => run(() => engine.callReception!())}
          >
            <Text style={styles.toolText}>Lễ tân</Text>
          </Pressable>
        )}
        {snap.showItButton && engine.callIt && (
          <Pressable
            style={styles.toolBtn}
            onPress={() => run(() => engine.callIt!())}
          >
            <Text style={styles.toolText}>Gọi IT</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={!!snap.dialogue && !win} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.dialogueCard}>
            <Image source={config.portrait} style={styles.portrait} />
            <Text style={styles.speaker}>{snap.dialogue?.speaker}</Text>
            <Text style={styles.line}>{snap.dialogue?.text}</Text>
            <Pressable style={styles.primaryBtn} onPress={onDismissDialogue}>
              <Text style={styles.primaryBtnText}>Tiếp</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!win} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.dialogueCard}>
            <Text style={styles.winTitle}>{win?.title}</Text>
            <Text style={styles.line}>{win?.message}</Text>
            <View style={styles.starRow}>
              {[1, 2, 3].map((n) => (
                <Text
                  key={n}
                  style={[
                    styles.starBig,
                    n <= (win?.stars ?? 0) && styles.starOn,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
            <Pressable style={styles.primaryBtn} onPress={onReplay}>
              <Text style={styles.primaryBtnText}>Chơi lại màn này</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 8 },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  logo: { color: "#ffd166", fontWeight: "800", fontSize: 16 },
  sub: { color: "#9aa5c4", fontSize: 12 },
  starRow: { flexDirection: "row", gap: 4 },
  star: { color: "#3d4460", fontSize: 20 },
  starOn: { color: "#ffd166" },
  starBig: { color: "#3d4460", fontSize: 36 },
  scene: {
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0d1018",
  },
  hotspot: {
    position: "absolute",
    backgroundColor: "rgba(255,209,102,0.08)",
  },
  dragHandle: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#ff6b4a",
    borderRadius: 8,
    backgroundColor: "rgba(255,107,74,0.15)",
  },
  invBar: { maxHeight: 88, marginTop: 8 },
  invContent: { gap: 8, paddingVertical: 4 },
  invItem: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#404868",
    backgroundColor: "#1e2436",
    alignItems: "center",
    justifyContent: "center",
  },
  invSelected: { borderColor: "#ffd166" },
  invIcon: { fontSize: 24 },
  invLabel: { fontSize: 9, color: "#9aa5c4", marginTop: 2 },
  toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 12 },
  toolBtn: {
    flexGrow: 1,
    minWidth: "30%",
    backgroundColor: "#333a52",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  toolText: { color: "#f0f4ff", fontWeight: "600" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
    padding: 16,
  },
  dialogueCard: {
    backgroundColor: "#252b3d",
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: "#ff6b4a",
  },
  portrait: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ffd166",
  },
  speaker: { color: "#ffd166", fontWeight: "800", marginBottom: 4 },
  line: { color: "#f0f4ff", lineHeight: 22, marginBottom: 12 },
  winTitle: {
    color: "#ffd166",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: "#ff6b4a",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: { color: "#1a1020", fontWeight: "700" },
});
