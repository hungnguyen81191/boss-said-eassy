import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  unlockedLevelId: "@sepbaolade/unlockedLevelId",
  starsByLevel: "@sepbaolade/starsByLevel",
  onboardingDone: "@sepbaolade/onboardingDone",
} as const;

export type SavedProgress = {
  unlockedLevelId: number;
  starsByLevel: Record<number, number>;
  onboardingDone: boolean;
};

const DEFAULT: SavedProgress = {
  unlockedLevelId: 1,
  starsByLevel: {},
  onboardingDone: false,
};

export async function loadProgress(): Promise<SavedProgress> {
  try {
    const [unlocked, starsJson, onboarding] = await Promise.all([
      AsyncStorage.getItem(KEYS.unlockedLevelId),
      AsyncStorage.getItem(KEYS.starsByLevel),
      AsyncStorage.getItem(KEYS.onboardingDone),
    ]);
    return {
      unlockedLevelId: unlocked ? Number(unlocked) : 1,
      starsByLevel: starsJson ? JSON.parse(starsJson) : {},
      onboardingDone: onboarding === "1",
    };
  } catch {
    return { ...DEFAULT };
  }
}

export async function saveUnlockedLevel(levelId: number) {
  await AsyncStorage.setItem(KEYS.unlockedLevelId, String(levelId));
}

export async function saveLevelStars(levelId: number, stars: number) {
  const raw = await AsyncStorage.getItem(KEYS.starsByLevel);
  const map: Record<number, number> = raw ? JSON.parse(raw) : {};
  map[levelId] = Math.max(map[levelId] ?? 0, stars);
  await AsyncStorage.setItem(KEYS.starsByLevel, JSON.stringify(map));
}

export async function setOnboardingDone() {
  await AsyncStorage.setItem(KEYS.onboardingDone, "1");
}

export async function clearProgressForDev() {
  if (!__DEV__) return;
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
