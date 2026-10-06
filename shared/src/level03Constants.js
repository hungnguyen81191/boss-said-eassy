export const LEVEL03_ITEM_DEFS = {
  cup: { id: "cup", name: "Ly", icon: "☕" },
  coffeeDone: { id: "coffeeDone", name: "Cà phê xong", icon: "🥤" },
  instantSachet: { id: "instantSachet", name: "Gói 3in1", icon: "📦" },
  fakeLatte: { id: "fakeLatte", name: "\"Latte\"", icon: "🧋" },
};

export const LEVEL03_HINTS = [
  "Gu sếp không nằm trong lời sếp nói.",
  "Lịch họp biết sếp uống gì hơn sếp.",
  "Note trên tủ lạnh ai cũng viết — ai cũng tin.",
  "3in1 + tự tin = specialty.",
];

export const LEVEL03_HOTSPOTS = [
  { id: "calendar", label: "Lịch pantry", left: 72, top: 18, width: 22, height: 28 },
  { id: "fridgeNote", label: "Note tủ lạnh", left: 48, top: 42, width: 10, height: 12 },
  { id: "cupShelf", label: "Ly", left: 18, top: 55, width: 12, height: 14 },
  { id: "machine", label: "Máy pha", left: 28, top: 38, width: 20, height: 30 },
  { id: "sugar", label: "Đường", left: 38, top: 52, width: 8, height: 10 },
  { id: "instantShelf", label: "Gói instant", left: 8, top: 68, width: 10, height: 12 },
  { id: "boss", label: "Bàn sếp", left: 78, top: 58, width: 18, height: 28 },
];

export const LEVEL03_WIN_MESSAGES = {
  1: "Khách 10h — không đường. Sếp gật như gật OK KPI.",
  2: "Đọc note tủ lạnh, không cần lịch. Pro pantry.",
  3: "3in1 dán mác specialty. Sếp uống — không hỏi.",
};

export const LEVEL03_INTRO = {
  speaker: "Sếp",
  text: "Pha cà phê mang qua phòng anh. Họp khách 10h — gu anh thế nào nhỉ… à em tự biết. Dễ mà.",
};
