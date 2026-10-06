export const LEVEL02_ITEM_DEFS = {
  idCard: { id: "idCard", name: "Thẻ NV", icon: "🪪" },
  magnet: { id: "magnet", name: "Nam châm", icon: "🧲" },
  nameplate: { id: "nameplate", name: "Bảng tên", icon: "📛" },
  meetingEmail: { id: "meetingEmail", name: "Mail họp", icon: "✉️" },
  visitorBadge: { id: "visitorBadge", name: "Thẻ khách", icon: "🏷️" },
};

export const LEVEL02_HINTS = [
  "Máy chấm công nuốt thẻ — không nuốt lý do đi muộn.",
  "Bảng tên lễ tân có thứ hay hơn tên.",
  "Lễ tân cần bằng chứng bạn có việc thật.",
  "Cảm biến quẹt thẻ… cũng cảm ứng được với kim loại.",
];

export const LEVEL02_HOTSPOTS = [
  { id: "turnstile", label: "Cổng quẹt thẻ", left: 55, top: 38, width: 22, height: 45 },
  { id: "clockMachine", label: "Máy chấm công", left: 52, top: 42, width: 12, height: 18 },
  { id: "nameBoard", label: "Bảng tên lễ tân", left: 8, top: 28, width: 20, height: 35 },
  { id: "receptionDesk", label: "Quầy lễ tân", left: 12, top: 58, width: 18, height: 22 },
  { id: "mailTray", label: "Khay thư in", left: 32, top: 62, width: 14, height: 14 },
  { id: "rulePoster", label: "Nội quy", left: 78, top: 22, width: 16, height: 28 },
];

export const LEVEL02_WIN_MESSAGES = {
  1: "Quẹt thẻ thành công. KPI sống sót thêm một ngày.",
  2: "Vào bằng thẻ khách — pro đi cửa phụ.",
  3: "Bảng tên qua cổng. HR sẽ hỏi, nhưng không phải hôm nay.",
};

export const LEVEL02_INTRO = {
  speaker: "HR",
  text: "8:30 quẹt thẻ cổng nhé. Đi muộn trừ KPI. Việc dễ mà — đúng không?",
};
