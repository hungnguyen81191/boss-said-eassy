#!/usr/bin/env node
/**
 * Kiểm tra placeholder còn lại trước khi build production.
 * Exit 1 nếu còn mục bắt buộc phải sửa tay.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appJson = JSON.parse(
  readFileSync(join(root, "mobile/app.json"), "utf8")
);
const extra = appJson.expo.extra ?? {};
const issues = [];

if (String(extra.privacyPolicyUrl ?? "").includes("REPLACE_OWNER")) {
  issues.push("app.json extra.privacyPolicyUrl — thay REPLACE_OWNER bằng GitHub user/org thật");
}
const projectId = String(extra.eas?.projectId ?? "");
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuid.test(projectId)) {
  issues.push(
    "app.json extra.eas.projectId — chạy `cd mobile && npm run eas:init` (xóa placeholder cũ nếu có)"
  );
}
if (String(appJson.expo.owner ?? "").includes("REPLACE")) {
  issues.push("app.json owner — điền tài khoản Expo");
}
const privacy = readFileSync(join(root, "docs/privacy-policy.md"), "utf8");
if (privacy.includes("support@example.com")) {
  issues.push("docs/privacy-policy.md — đổi email liên hệ");
}

console.log("Sếp Bảo Là Dễ — pre-submit check\n");
if (issues.length === 0) {
  console.log("OK: không còn placeholder bắt buộc trong repo (vẫn cần icon 1024, screenshot, tài khoản dev).");
  process.exit(0);
}
console.log("Còn " + issues.length + " mục cần sửa:\n");
issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
console.log("\nXem store/SUBMIT-CHECKLIST.md");
process.exit(1);
