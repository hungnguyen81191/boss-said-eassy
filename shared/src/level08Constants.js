export const LEVEL08_ITEM_DEFS = {
  fakeUrgent: { id: "fakeUrgent", name: "Việc gấp giả", icon: "🔥" },
  ladder: { id: "ladder", name: "Thang chữ A", icon: "🪜" },
  vacuum: { id: "vacuum", name: "Robot hút bụi", icon: "🤖" },
};

export const LEVEL08_HINTS = [
  "17:59 sếp luôn nhớ em còn sống.",
  "Đồng hồ treo không sync với điện thoại.",
  "Robot hút bụi không đọc KPI.",
  "Việc gấp giả — email thật nhưng deadline giả.",
];

export const LEVEL08_HOTSPOTS = [
  { id: "laptop", label: "Laptop", left: 28, top: 52, width: 22, height: 26 },
  { id: "bossDoor", label: "Cửa ra", left: 78, top: 32, width: 18, height: 50 },
  { id: "wallClock", label: "Đồng hồ tường", left: 58, top: 12, width: 12, height: 16 },
  { id: "storage", label: "Kho đồ", left: 6, top: 48, width: 14, height: 22 },
  { id: "breaker", label: "Aptomat", left: 48, top: 62, width: 10, height: 14 },
  { id: "vacuumDock", label: "Robot dock", left: 38, top: 68, width: 12, height: 14 },
];

export const LEVEL08_WIN_MESSAGES = {
  1: "Sếp chạy đi họp gấp giả. Em ra cửa lúc 18:00 — hero.",
  2: "Đồng hồ nhanh 10 phút. Sếp: \"Ồ trễ rồi, mai gặp.\"",
  3: "Robot làm sập aptomat. Tối — nhưng đúng giờ.",
};

export const LEVEL08_INTRO = {
  speaker: "Sếp",
  text: "17:59 — nhắc em: 18:00 về nhé. À gửi thêm báo cáo… thôi mai đi. Dễ mà.",
};
