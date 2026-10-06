import * as Linking from "expo-linking";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LevelScreen } from "./src/components/LevelScreen";
import { OnboardingModal } from "./src/components/OnboardingModal";
import { SettingsModal } from "./src/components/SettingsModal";
import { LEVELS } from "./src/game/levelRegistry";
import {
  loadProgress,
  saveLevelStars,
  saveUnlockedLevel,
  setOnboardingDone,
} from "./src/storage/progressStorage";

export default function App() {
  const [ready, setReady] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevelId, setUnlockedLevelId] = useState(1);
  const [starsByLevel, setStarsByLevel] = useState<Record<number, number>>({});
  const [screenKey, setScreenKey] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadProgress().then((p) => {
      setUnlockedLevelId(p.unlockedLevelId);
      setStarsByLevel(p.starsByLevel);
      setShowOnboarding(!p.onboardingDone);
      setReady(true);
    });
  }, []);

  const startAutoplay = useCallback((levelId: number) => {
    setUnlockedLevelId(LEVELS.length);
    setCurrentLevelId(levelId);
    setScreenKey((k) => k + 1);
    setAutoplayActive(true);
  }, []);

  useEffect(() => {
    if (!__DEV__) return;
    let mounted = true;
    let sub: { remove: () => void } | undefined;
    import("./src/dev/simAutoplay").then(({ parseAutoplayLevelFromUrl }) => {
      if (!mounted) return;
      const handle = (url: string | null) => {
        const levelId = parseAutoplayLevelFromUrl(url);
        if (levelId) startAutoplay(levelId);
      };
      Linking.getInitialURL().then(handle);
      sub = Linking.addEventListener("url", ({ url }) => handle(url));
    });
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [startAutoplay]);

  const config = useMemo(
    () => LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0],
    [currentLevelId]
  );

  const totalStars = useMemo(
    () => Object.values(starsByLevel).reduce((a, b) => a + b, 0),
    [starsByLevel]
  );

  const onWin = useCallback(
    (stars: number) => {
      const nextUnlock = Math.max(unlockedLevelId, currentLevelId + 1);
      setUnlockedLevelId(nextUnlock);
      saveUnlockedLevel(nextUnlock);
      setStarsByLevel((prev) => {
        const best = Math.max(prev[currentLevelId] ?? 0, stars);
        if (best === prev[currentLevelId]) return prev;
        const next = { ...prev, [currentLevelId]: best };
        saveLevelStars(currentLevelId, best);
        return next;
      });
    },
    [currentLevelId, unlockedLevelId]
  );

  const replayLevel = () => {
    setScreenKey((k) => k + 1);
  };

  const finishOnboarding = async () => {
    await setOnboardingDone();
    setShowOnboarding(false);
  };

  const hasNext = currentLevelId < LEVELS.length;

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff6b4a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Sếp Bảo Là Dễ</Text>
          <View style={styles.topRight}>
            <Text style={styles.starCount}>★ {totalStars}</Text>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => setShowSettings(true)}
              accessibilityLabel="Cài đặt"
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {__DEV__ && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.qaBar}
            contentContainerStyle={styles.qaContent}
          >
            {LEVELS.map((level) => (
              <Pressable
                key={level.id}
                style={styles.qaBtn}
                onPress={() => startAutoplay(level.id)}
              >
                <Text style={styles.qaText}>▶ {level.id}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelTabs}
        >
          {LEVELS.map((level) => {
            const locked = level.id > unlockedLevelId;
            const active = level.id === currentLevelId;
            const stars = starsByLevel[level.id] ?? 0;
            return (
              <Pressable
                key={level.id}
                disabled={locked}
                style={[
                  styles.tab,
                  active && styles.tabActive,
                  locked && styles.tabLocked,
                ]}
                onPress={() => {
                  setCurrentLevelId(level.id);
                  setScreenKey((k) => k + 1);
                  setAutoplayActive(false);
                }}
              >
                <Text style={styles.tabText}>
                  {level.id}. {level.subtitle}
                  {locked ? " 🔒" : stars > 0 ? ` · ${"★".repeat(stars)}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <LevelScreen
          key={`${config.id}-${screenKey}`}
          config={config}
          onWin={onWin}
          onReplay={replayLevel}
          autoplay={autoplayActive}
          onAutoplayDone={() => setAutoplayActive(false)}
          bestStars={starsByLevel[config.id] ?? 0}
        />

        {hasNext && unlockedLevelId > currentLevelId && (
          <Pressable
            style={styles.nextBanner}
            onPress={() => {
              setCurrentLevelId((id) => id + 1);
              setScreenKey((k) => k + 1);
              setAutoplayActive(false);
            }}
          >
            <Text style={styles.nextText}>Màn tiếp theo →</Text>
          </Pressable>
        )}
      </View>

      <OnboardingModal
        visible={showOnboarding}
        step={onboardingStep}
        onNext={() => setOnboardingStep((s) => s + 1)}
        onDone={finishOnboarding}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        totalStars={totalStars}
        onProgressCleared={() => {
          setUnlockedLevelId(1);
          setStarsByLevel({});
          setCurrentLevelId(1);
          setScreenKey((k) => k + 1);
          setShowOnboarding(true);
          setOnboardingStep(0);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#1a1f2e",
    alignItems: "center",
    justifyContent: "center",
  },
  root: {
    flex: 1,
    backgroundColor: "#1a1f2e",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
  },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 960,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  topTitle: {
    color: "#ffd166",
    fontWeight: "800",
    fontSize: 16,
  },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  starCount: { color: "#ffd166", fontWeight: "700" },
  settingsBtn: { padding: 6 },
  settingsIcon: { fontSize: 22 },
  qaBar: { maxHeight: 44 },
  qaContent: { gap: 6, paddingHorizontal: 8 },
  qaBtn: {
    backgroundColor: "#2d6a4f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qaText: { color: "#d8f3dc", fontWeight: "800", fontSize: 12 },
  levelTabs: {
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#333a52",
  },
  tabActive: { backgroundColor: "#ff6b4a" },
  tabLocked: { opacity: 0.45 },
  tabText: { color: "#f0f4ff", fontWeight: "600", fontSize: 13 },
  nextBanner: {
    marginHorizontal: 8,
    marginBottom: 12,
    backgroundColor: "#ffd166",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nextText: { color: "#1a1020", fontWeight: "800" },
});
