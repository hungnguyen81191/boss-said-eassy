import * as Application from "expo-application";
import Constants from "expo-constants";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { clearProgressForDev } from "../storage/progressStorage";

type Props = {
  visible: boolean;
  onClose: () => void;
  totalStars: number;
  onProgressCleared?: () => void;
};

function privacyUrl(): string {
  const extra = Constants.expoConfig?.extra as
    | { privacyPolicyUrl?: string }
    | undefined;
  return (
    extra?.privacyPolicyUrl ??
    "https://raw.githubusercontent.com/hungnguyen81191/sep-bao-la-de/main/docs/privacy-policy.md"
  );
}

export function SettingsModal({
  visible,
  onClose,
  totalStars,
  onProgressCleared,
}: Props) {
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    "1.0.0";
  const build =
    Application.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    "1";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Cài đặt</Text>
          <Text style={styles.row}>Phiên bản {version} ({build})</Text>
          <Text style={styles.row}>Tổng sao: {totalStars}</Text>
          <Text style={styles.note}>
            Game offline — không thu thập dữ liệu cá nhân. Xem chính sách quyền riêng tư.
          </Text>
          <Pressable
            style={styles.linkBtn}
            onPress={() => Linking.openURL(privacyUrl())}
          >
            <Text style={styles.linkText}>Chính sách quyền riêng tư</Text>
          </Pressable>
          {__DEV__ && (
            <Pressable
              style={styles.dangerBtn}
              onPress={async () => {
                await clearProgressForDev();
                onProgressCleared?.();
                onClose();
              }}
            >
              <Text style={styles.dangerText}>Xóa tiến trình (dev)</Text>
            </Pressable>
          )}
          <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#252b3d",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    color: "#ffd166",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  row: { color: "#f0f4ff", marginBottom: 8 },
  note: { color: "#9aa5c4", fontSize: 13, lineHeight: 20, marginVertical: 12 },
  linkBtn: { paddingVertical: 12 },
  linkText: { color: "#7eb8ff", fontWeight: "600" },
  dangerBtn: {
    marginTop: 8,
    paddingVertical: 10,
  },
  dangerText: { color: "#ff6b4a", fontSize: 13 },
  btn: {
    marginTop: 16,
    backgroundColor: "#333a52",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  btnText: { color: "#f0f4ff", fontWeight: "700" },
});
