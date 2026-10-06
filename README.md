# Sếp Bảo Là Dễ

Puzzle văn phòng — **một codebase TypeScript (Expo)** cho **iOS, Android và Web**.

Logic màn chơi nằm trong `shared/` (`@sep-bao-la-de/game`); UI trong `mobile/`.

## Cấu trúc

```
sep-bao-la-de/
├── shared/              # Engine màn 1 & 2 (JS thuần)
├── mobile/              # Expo React Native + React Native Web
│   └── src/
│       ├── components/LevelScreen.tsx
│       └── game/levelRegistry.ts
└── design/              # GDD từng màn
```

## Cài & chạy

```bash
cd sep-bao-la-de
npm install
```

| Lệnh | Mục đích |
|------|----------|
| `npm run web` | Trình duyệt (Metro + React Native Web) |
| `npm start` | Expo Dev Tools (QR cho Expo Go) |
| `npm run ios` / `npm run android` | Simulator / thiết bị |

Web: sau `npm run web`, mở URL Metro hiển thị (thường **http://localhost:8081**).

## Màn chơi (8 màn — một ngày đi làm)

| # | Tên | Tóm tắt |
|---|-----|--------|
| 1 | In tài liệu | Giấy giả / chìa / kéo tủ |
| 2 | Quẹt thẻ 8:30 | Nam châm / thẻ khách / bảng tên |
| 3 | Pha cà phê | Lịch khách / note / 3in1 |
| 4 | In 20 bản | Cáp IT / socola / kéo phone |
| 5 | Mail Tuấn | Planning / alias |
| 6 | Họp online | Background ảo / blur / cây che cam |
| 7 | Cứu Excel | RVND / 884 |
| 8 | Về 18:00 | Việc giả / đồng hồ / robot |

GDD: [design/LEVEL-01.md](design/LEVEL-01.md) … [LEVEL-08.md](design/LEVEL-08.md).

## Thêm màn

1. `shared/src/levelXXConstants.js` + `levelXXEngine.js`  
2. Export trong `shared/src/index.js`  
3. Thêm entry trong `mobile/src/game/levelRegistry.ts`

## Submit store

Checklist: [store/SUBMIT-CHECKLIST.md](store/SUBMIT-CHECKLIST.md) · Privacy: [docs/privacy-policy.md](docs/privacy-policy.md) · Listing nháp: [store/LISTING.md](store/LISTING.md)

```bash
cd mobile && npm install
npm run eas:login    # lần đầu — không cần cài eas global
npm run eas:init     # ghi projectId vào app.json
npm run build:ios
```
