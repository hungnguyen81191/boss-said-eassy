# Checklist submit store

## Đã làm trong repo

- [x] Lưu tiến trình local (màn mở khóa, sao, onboarding)
- [x] Onboarding 3 bước lần đầu
- [x] Màn Cài đặt + link privacy + phiên bản
- [x] QA autoplay / thanh dev chỉ `__DEV__` (không có trong production build)
- [x] Dynamic import dev autoplay (giảm rủi ro bundle dev)
- [x] `eas.json` profile development / preview / production
- [x] `app.json` v1.0.0, buildNumber, encryption export, newArchEnabled
- [x] Privacy policy (`docs/privacy-policy.md`)
- [x] Nháp listing (`store/LISTING.md`)
- [x] Ghi chú reviewer (`store/REVIEW-NOTES.md`)
- [x] Hướng dẫn asset (`store/ASSETS.md`)
- [x] `npm run check:submit` — báo placeholder còn lại

## Bạn cần làm (không tự động được)

- [ ] **Icon 1024×1024** PNG thật (thay file `mobile/assets/icon.png`)
- [ ] **Screenshot** 6.7" + iPad (nếu hỗ trợ tablet) / Android phone
- [ ] EAS CLI (trong repo): `cd mobile && npm install && npm run eas:login && npm run eas:init`
- [ ] Sửa `extra.privacyPolicyUrl` và email trong `docs/privacy-policy.md`
- [ ] Sửa `owner` trong `app.json` (tài khoản Expo)
- [ ] `eas build --profile production --platform all`
- [ ] TestFlight / internal testing 1–2 tuần
- [ ] Tài khoản Apple Developer ($99/năm) + Google Play ($25 một lần)
- [ ] Điền `eas.json` submit: Apple ID, ASC App ID, Google service account
- [ ] (Khuyến nghị) Thêm 10–15 màn hoặc Season 2 để tránh cảm giác demo quá ngắn

## Lệnh build

```bash
cd sep-bao-la-de/mobile
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Sau khi submit

- Theo dõi review note Apple (4.2 Minimum Functionality nếu bị hỏi — nhấn mạnh 8 màn × 3 sao, offline complete game)
