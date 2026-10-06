import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const STEPS = [
  {
    title: "Chào thực tập sinh!",
    body: "Mỗi màn sếp bảo \"dễ thôi\" — thực ra là giải đố văn phòng. Bấm đồ trong cảnh, ghép vật phẩm, đọc manh mối.",
  },
  {
    title: "Ba cách thắng",
    body: "★ làm đúng quy trình · ★★ tối ưu · ★★★ cách ngớ ngẩn mà hợp lý. Săn đủ sao để khoe.",
  },
  {
    title: "Sẵn sàng đi làm",
    body: "Tiến trình lưu trên máy. Không cần tài khoản. Bắt đầu màn 1 — in tài liệu cho sếp.",
  },
];

type Props = {
  visible: boolean;
  step: number;
  onNext: () => void;
  onDone: () => void;
};

export function OnboardingModal({ visible, step, onNext, onDone }: Props) {
  const content = STEPS[step];
  const isLast = step >= STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.step}>
            {step + 1}/{STEPS.length}
          </Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.body}>{content.body}</Text>
          <Pressable style={styles.btn} onPress={isLast ? onDone : onNext}>
            <Text style={styles.btnText}>{isLast ? "Bắt đầu" : "Tiếp"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#252b3d",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#ffd166",
  },
  step: { color: "#9aa5c4", marginBottom: 8, fontSize: 12 },
  title: {
    color: "#ffd166",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  body: { color: "#f0f4ff", lineHeight: 22, marginBottom: 20 },
  btn: {
    backgroundColor: "#ff6b4a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  btnText: { color: "#1a1020", fontWeight: "800", fontSize: 16 },
});
