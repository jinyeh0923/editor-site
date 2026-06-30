# 薯餅 — 短影音剪輯作品集

自由接案短影音剪輯師「葉書銘（薯餅）」的個人作品集網站。短影音剪輯 × 社群短影音經營，作品以 **IG Reels（9:16）** 為主、穿插 **YouTube 長片（16:9）**。靜態前端 + 表單寫入 D1 + `/admin` 後台檢視，零月費、允許商業用途。

> 開發/維護前先讀 **`PROJECT-KNOWLEDGE.md`**（架構、慣例、設計系統、平台地雷）與 **`CONTENT-CHECKLIST.md`**（上線前要填的真實內容）。本 README 專管**安裝與部署**。

## 技術
純手寫 HTML / CSS / JS（**無框架、無 build step**）＋ Cloudflare Workers + D1 + 靜態資源（Wrangler 部署）。平滑滾軸用自架 Lenis（`public/vendors/`）。字體 Noto Sans TC + JetBrains Mono。

## 頁面
- `index.html` 首頁（hero / 關於 / 經營流程 / 精選作品 / 案例 / 服務 / 數據 / 聯絡）
- `work.html` 作品集（分類篩選 + masonry + 載入更多）
- `cases.html` 社群實操案例（`case1.html` 為 featured 變體）
- `contact.html` 獨立聯絡頁
- `admin.html` 表單後台（需登入）

## 目錄
```
public/   前端（html / css/ / js/ / posters/ / vendors/ / _headers）
src/      Cloudflare Worker（表單收件 + 後台 API + 後台頁 gate）
schema.sql  wrangler.jsonc  package.json
PROJECT-KNOWLEDGE.md  README.md  CONTENT-CHECKLIST.md
```

---

## 安裝前
- 在個人筆電上做。
- 需要 Node.js：先確認 `node -v` 有東西。
- 一個 Cloudflare 帳號（免費、不用信用卡）。

## 安裝步驟

### 0. 取得程式碼（建議）
把這包丟到 GitHub 的 **private repo**，當備份兼版控。

### 1. 裝 wrangler（裝在專案內，不要全域）並登入
```bash
cd editor-site
npm install -D wrangler   # 版本鎖進 package-lock.json
npx wrangler login        # 開瀏覽器授權
```

### 2. 建資料庫，並把 id 貼進設定
```bash
npx wrangler d1 create editor-site-db
```
把印出來的 `database_id` 貼進 `wrangler.jsonc`（這個**不是機密**，可以進 git）。

### 3. 建資料表（本機 + 雲端各一次）
```bash
npm run db:local
npm run db:remote
```
`--local` 是測試用本機 DB、`--remote` 才是正式雲端那顆。**忘記跑 remote，上線後表單一送就噴錯。**

### 4. 設後台密碼
```bash
# 本機測試用：在專案根目錄建 .dev.vars，寫一行：
#   ADMIN_PASSWORD=你的密碼
# （.dev.vars 已被 .gitignore 擋住，不會進 git）

# 正式雲端用：
npx wrangler secret put ADMIN_PASSWORD
```

### 5.（可選）啟用 Turnstile 防灌表單
```bash
# 1) Cloudflare 後台 → Turnstile 建 widget，取得 Site Key + Secret
# 2) index.html、contact.html 的 data-sitekey 換成真實 Site Key（兩處）
# 3) 設 Secret：
npx wrangler secret put TURNSTILE_SECRET
```
⚠️ Site Key 與 Secret **要一起換**，只設一邊會擋掉所有送出。沒設 `TURNSTILE_SECRET` 前，Worker 會略過驗證、表單照常可送。

### 6. 本地測試
```bash
npm run dev
```
開 http://localhost:8787 填表 → http://localhost:8787/admin 看資料（帳號 `admin` + 你設的密碼）。

### 7. 部署上線
```bash
npm run deploy
```
給你 `https://editor-site.xxx.workers.dev`。後台在 `/admin`，每筆有 mailto 連結可直接回信。

---

## 注意事項（踩過的雷）
- **機密不進 git**：`.gitignore` 已擋掉 `.dev.vars`、`.wrangler`、`node_modules`，別手動把密碼推上去。
- **記得跑 `db:remote`**：只跑 local 的話，上線後表單會噴錯。
- **兩顆 D1 別搞混**：`dev` 用的是本機那顆（只拿來測）；雲端那顆才是唯一的正式資料。
- **`run_worker_first` 要含 `["/admin","/admin.html","/api/*"]`**：少了 `/api/*`，GET 的後台 API 會被 `not_found_handling` 攔成 404、進不了 Worker。
- **schema 欄位要對齊**：雲端舊表若缺欄位（如 `video_type`、`status`）會報 `no such column`。測試資料可 `DROP TABLE submissions` 再 `--file=./schema.sql` 重建；要保留資料用 `ALTER TABLE ... ADD COLUMN`。
- **後台轉址迴圈**：Worker 取後台頁要抓不帶 `.html` 的 `/admin`（細節見 `PROJECT-KNOWLEDGE.md`）。

## 文件分工
- **README.md（本檔）**：安裝、部署、維運。
- **PROJECT-KNOWLEDGE.md**：架構、檔案結構、CSS 拆分、共用元件、Worker 路由、設計系統、平台地雷。
- **CONTENT-CHECKLIST.md**：上線前把佔位內容換成真實內容的逐項清單。

## 之後 / 升級
- **`/admin` 升級**：可改用 Cloudflare Access（Zero Trust 免費），email 驗證碼保護，不用自己維護 Basic Auth 密碼。
- **build step / 框架**：**目前刻意不用**——純手寫、無 build step（共用 `<head>` 等需求若未來真的需要，再評估導入 11ty 或自寫 Node 腳本，屆時把 `wrangler.jsonc` 的 `assets.directory` 改指輸出資料夾）。除非有明確理由，維持現狀。

## 授權 / 歸屬
最終網域與 Cloudflare 帳號建議建在客戶名下，開發者以成員身分協作。第三方套件授權與版本見 `public/vendors/README.md`。
