export const LEVEL06_ITEM_DEFS = {
  bgCurtain: { id: "bgCurtain", name: "Rèm phòng họp", icon: "🪟" },
  bgPoster: { id: "bgPoster", name: "Poster công ty", icon: "🖼️" },
  bgPlant: { id: "bgPlant", name: "Cây giả", icon: "🪴" },
  virtualBg: { id: "virtualBg", name: "Background ảo", icon: "🎭" },
};

export const LEVEL06_HINTS = [
  "Pantry lộ qua camera — sếp không cần biết gu cà phê.",
  "Background Zoom ghép từ đồ thật quanh công ty.",
  "Note trên laptop: blur che tội.",
  "Cây che camera = professional.",
];

export const LEVEL06_HOTSPOTS = [
  { id: "laptop", label: "Laptop họp", left: 38, top: 48, width: 24, height: 28 },
  { id: "curtain", label: "Rèm phòng họp", left: 6, top: 22, width: 18, height: 40 },
  { id: "poster", label: "Poster", left: 72, top: 18, width: 18, height: 28 },
  { id: "plant", label: "Cây giả", left: 82, top: 55, width: 12, height: 28 },
  { id: "sticky", label: "Note laptop", left: 42, top: 42, width: 8, height: 8 },
  { id: "joinBtn", label: "Tham gia họp", left: 48, top: 72, width: 16, height: 12 },
];

export const LEVEL06_WIN_MESSAGES = {
  1: "Background ghép ba lớp. Sếp tưởng em ở phòng họp.",
  2: "Chỉ poster + blur — IT gọi là tối ưu băng thông.",
  3: "Cây che hết cam. Pro là che khuyết điểm.",
};

export const LEVEL06_INTRO = {
  speaker: "Sếp",
  text: "Họp online 5 phút. Bật cam — em đang ở pantry? Không sao, nhìn professional là được. Dễ mà.",
};
