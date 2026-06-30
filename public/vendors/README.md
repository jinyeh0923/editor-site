# vendors — 自架第三方套件

這個資料夾放「自己下載、自己託管」的前端套件（取代 CDN）。
每次新增或更新套件，請更新下面表格。

## 目前套件

| 套件 | 版本 | 授權 | 來源 | 本資料夾的檔案 | 記錄日期 |
|---|---|---|---|---|---|
| Lenis（平滑滾軸） | 1.3.23 | MIT | https://unpkg.com/lenis@1.3.23/dist/ | `lenis.min.js`、`lenis.css` | 2026-06-20 |

- Lenis repo：https://github.com/darkroomengineering/lenis
- npm：https://www.npmjs.com/package/lenis
- 注意：套件已從 `@studio-freight/lenis` 改名為 `lenis`，請用新名稱。

## 更新套件的步驟（備忘）

1. 確認新版號（npm 或 repo releases）。
2. 重新下載對應的 dist 檔，覆蓋本資料夾舊檔（檔名維持一致，引用就不用改）。
3. 更新上表的「版本」與「記錄日期」。
4. 若有 CDN 殘留，記得同步：移除 HTML 裡的 CDN `<link>`／`<script>`，改指 `vendors/…`。
5. 檢查 `public/_headers` 的 CSP：自架後可把對應 CDN 網域（如 `https://cdn.jsdelivr.net`）從 `script-src`／`style-src` 拿掉，收緊成 `'self'`。
   - ⚠️ 例外：Turnstile 不能自架，`https://challenges.cloudflare.com` 要保留。

## 不能自架、必須留官方網域的（別放這裡）

- Cloudflare Turnstile（`challenges.cloudflare.com`）
- Stripe.js、reCAPTCHA 等金流／驗證 SDK
