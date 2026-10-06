# QA autoplay (chỉ `__DEV__`)

## Trên simulator / Expo Go

Thanh xanh **▶ 1 … ▶ 8** trên cùng — bấm để tự chơi màn đó (luồng 1★).

Hoặc deep link (reload app trước nếu cần):

```bash
# Màn 1–8
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/?autoplay=level3"
```

## Script engine (không UI)

```bash
node scripts/play-level01.mjs
```

## Luồng autoplay tóm tắt

| Màn | 1★ autoplay |
|-----|-------------|
| 1 | Giấy giả → bảo vệ → in |
| 2 | Nuốt thẻ → nam châm → quẹt lại |
| 3 | Lịch → ly → pha → sếp |
| 4 | In lỗi → cáp → Wi‑Fi → đổi cáp → in |
| 5 | Bảng thẻ + lịch → danh bạ → gửi |
| 6 | 3 lớp BG → ghép → tham gia họp |
| 7 | Excel → ghép RVND → nhập pass |
| 8 | Mail gấp giả → cửa ra |

Log Metro: `[QA autoplay] …`
