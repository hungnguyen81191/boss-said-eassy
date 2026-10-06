export const LEVEL01_ITEM_DEFS = {
  document: { id: "document", name: "Hợp đồng", icon: "📄" },
  note: { id: "note", name: "Note vàng", icon: "📝" },
  pen: { id: "pen", name: "Bút", icon: "🖊️" },
  fakeConfirm: { id: "fakeConfirm", name: "Xác nhận in (?)", icon: "📋" },
  ruler: { id: "ruler", name: "Thước kẹp", icon: "📏" },
  key: { id: "key", name: "Chìa tủ", icon: "🔑" },
  paper: { id: "paper", name: "Giấy A4", icon: "📃" },
};

export const LEVEL01_HINTS = [
  "Sếp bảo dễ — có nghĩa là không dễ.",
  "Bảo vệ tin giấy hơn tin bạn.",
  "Thử đọc… cái gì cũng được trên bàn.",
  "In không cần giấy nếu mang cả tủ đi.",
];

export const LEVEL01_HOTSPOTS = [
  { id: "desk", label: "Bàn làm việc", left: 8, top: 52, width: 22, height: 28 },
  { id: "printer", label: "Máy in", left: 62, top: 48, width: 18, height: 32 },
  { id: "cabinet", label: "Tủ giấy", left: 82, top: 35, width: 14, height: 45 },
  { id: "drawer", label: "Ngăn kéo", left: 28, top: 68, width: 12, height: 14 },
  { id: "note", label: "Giấy note", left: 18, top: 58, width: 6, height: 8 },
  { id: "pen", label: "Bút", left: 24, top: 56, width: 5, height: 6 },
  { id: "ruler", label: "Thước kẹp", left: 33, top: 54, width: 7, height: 5 },
];

export const LEVEL01_WIN_MESSAGES = {
  1: "Em in được rồi. Kiểu… văn phòng đúng quy trình.",
  2: "Không cần thuyết phục bảo vệ. Sếp không biết nhưng anh biết.",
  3: "Em không giải quyết vấn đề — em chuyển tủ sang máy in.",
};

export const LEVEL01_INTRO = {
  speaker: "Sếp",
  text: "In giúp anh cái hợp đồng này. PDF anh gửi rồi — à không, giấy trên bàn. Việc dễ mà.",
};
