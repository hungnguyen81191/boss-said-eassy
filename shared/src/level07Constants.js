export const LEVEL07_ITEM_DEFS = {
  errorPrintout: { id: "errorPrintout", name: "Sheet lỗi", icon: "📊" },
  passwordRVND: { id: "passwordRVND", name: "Mật khẩu RVND", icon: "🔐" },
  password884: { id: "password884", name: "Mật khẩu 884", icon: "🔢" },
  unlockedReport: { id: "unlockedReport", name: "Báo cáo", icon: "📈" },
};

export const LEVEL07_HINTS = [
  "Excel báo lỗi — đôi khi lỗi là manh mối.",
  "Sticky \"PASSWORD123\" do intern 2020 viết.",
  "HR calendar toàn sinh nhật — không phải lúc nào cũng vô dụng.",
  "Chữ cái đầu của #REF #VALUE…",
];

export const LEVEL07_HOTSPOTS = [
  { id: "excelLaptop", label: "File Excel", left: 40, top: 50, width: 26, height: 30 },
  { id: "formulaHint", label: "Bảng công thức", left: 68, top: 28, width: 18, height: 22 },
  { id: "stickyWrong", label: "Note sai", left: 22, top: 58, width: 10, height: 10 },
  { id: "hrCalendar", label: "Lịch sinh nhật", left: 8, top: 24, width: 16, height: 28 },
  { id: "submitPass", label: "Nhập mật khẩu", left: 52, top: 68, width: 14, height: 12 },
];

export const LEVEL07_WIN_MESSAGES = {
  1: "RVND mở file. Doanh thu sống lại — như hy vọng Q4.",
  2: "Không thử PASSWORD123 một lần nào. Rare W.",
  3: "884 từ sinh nhật — sai nhưng backdoor intern vẫn chạy.",
};

export const LEVEL07_INTRO = {
  speaker: "Sếp",
  text: "Khôi phục báo cáo doanh thu. File khóa mật khẩu. Anh gửi rồi — trong… từ đó. Dễ mà.",
};
