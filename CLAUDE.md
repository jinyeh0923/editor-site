# CLAUDE.md — 專案規範與背景

> 給 Claude Code / AI 助手的專案工作說明。動手改任何檔案前，先讀本檔，遵守這裡的架構與慣例。

## 0. 這是什麼專案

自由接案**短影音剪輯師「葉書銘（暱稱 薯餅）」**的個人作品集網站（台灣）。

定位重點：他不只是「剪片」，而是做**社群短影音經營**——選題企劃 → 腳本節奏 → 剪輯包裝 → 上架與數據複盤。作品以 **Instagram Reels（9:16 直式）** 為主，穿插 **YouTube 長片（16:9）**。文案與設計都要扣住「幫頻道把內容做起來」，不是單純接案剪輯。

語氣：專業、直接、不浮誇。介面為**深色電影感**。

## 1. 技術架構（重要：無前端框架）

- **純手寫 HTML / CSS / JS，沒有任何前端框架、沒有 build step。** 改的就是最終檔案。
- 後端：**Cloudflare Workers + D1（SQLite）+ 靜態資源**，用 Wrangler 部署。
- 平滑滾軸：**Lenis**（自架於 `public/vendors/`，見該資料夾 README 記錄的版本）。
- 字體：Noto Sans TC（900/700/500/400）+ JetBrains Mono，透過 Google Fonts 載入。

不要引入 React/Vue/Tailwind/打包工具。要加第三方套件，下載放 `public/vendors/` 自架，並更新 `vendors/README.md` 的版本表。

## 2. 檔案結構（`public/` 是靜態資源根目錄）

```
public/
├─ index.html        首頁 landing（data-page="home"）
├─ work.html         作品集（data-page="work"）
├─ cases.html        社群實操案例（data-page="cases"）
├─ case1.html        案例頁的 featured 變體（第一個案例做成直式大海報）
├─ contact.html      獨立聯絡頁（data-page="contact"）
├─ admin.html        後台表單檢視（需登入，設計過的深色頁）
├─ thanks.html       表單送出後的感謝頁（自帶內聯樣式，不載 core.css）
├─ 404.html          404 頁（自帶內聯樣式）
├─ _headers          安全標頭 / CSP（必須在資源根目錄）
├─ css/   core.css home.css work.css cases.css
├─ js/    app.js partials.js works.js masonry.js
├─ posters/          手動封面圖（IG 作品封面、本人照片、案例封面、服務圖…）
└─ vendors/          自架第三方套件（如 Lenis）+ README（記版本）
src/index.js          Cloudflare Worker（表單收件 + 後台 API + 後台頁 gate）
schema.sql            D1 資料表定義
wrangler.jsonc        Cloudflare 設定
package.json          scripts: dev / deploy / db:local / db:remote
```

### 各頁載入的 CSS（每頁不同，這是刻意的拆分）
- `index.html` → core + home + work + cases（首頁有作品與案例 teaser）
- `work.html` → core + work
- `cases.html` / `case1.html` → core + cases
- `contact.html` → core（只用共用的）
- `admin.html` → core

### Script 載入順序（有用到才載）
`works.js` →（vendors）`lenis.min.js` → `partials.js` → `app.js` → 該頁內聯 script → `masonry.js`
- `masonry.js` 只在有作品牆 `.wall` 的頁面載入（index、work）。
- `partials.js` 必須在 `app.js` 之前（app.js 會操作 partials 注入的 nav/抽屜/彈窗）。

## 3. CSS 拆分原則（改樣式前必讀）

- **`core.css`＝共用外殼＋共用元件**：tokens(:root)、base、nav、footer、手機抽屜 `.drawer`、email 彈窗 `.modal`、`.to-top`、按鈕（`.cta`/`.ghost`/`button[type=submit]`/`select`）、表單控制項、`.aboutme`、個資同意 `.consent*`、`.socials`、`.reveal`、`.sec`/`.sec-head`/`.phead`、聯絡兩欄 `.contact-grid`/`.contact-info`/`.ci-*`。**每頁都載，要放第一個。**
- **`home.css`**：首頁專用（hero/showreel/跑馬燈/`.flow`/`.svc`/`.stats`）。
- **`work.css`**：作品牆（`.filter`/`.wall`/`.w`/`.loadmore`）。首頁 teaser 也用，所以 index 也載。
- **`cases.css`**：案例卡 `.case` / `.case.featured`。
- **判斷規則**：只有一頁用 → 放該頁的檔；兩頁以上用 → 放 `core.css`。
- **cascade 順序**：core 一定先載；reduced-motion 的覆蓋規則要放在「被覆蓋選擇器的同一個檔案、且在其後」，不要拆到 core 去覆蓋 home/work 的選擇器（會因載入順序失效）。

## 4. 設計系統（用 token，不要寫死色碼）

```
--bg:#0B0B0D  --bg-2:#141417  --line:#26262C
--ink:#F5F2EC  --muted:#97979F  --muted-2:#5C5C64
--accent:#FF8A3D（琥珀橘）  --on-accent:#0B0B0D
--r:10px  --pill:999px  --maxw:1280px
--f: Noto Sans TC   --fm: JetBrains Mono
```
- 標題 `font-weight:900`；mono 字體用在標籤、時間碼、次要資訊。
- 視覺母題：**時間碼**（每段 `.tc` 開頭 `00:00 — 標題`）、masonry、不對稱電影感。
- 卡片互動統一：hover `translateY(-4px)` + 邊框轉 `--accent` +（圖）微放大；點擊 `:active` 微縮。**所有位移/縮放/動畫都要尊重 `prefers-reduced-motion`**（關閉）。
- 不用 emoji、不用白底亮色；保持深色。

## 5. 共用元件與行為

### nav / footer / email 彈窗 / 手機抽屜 → 由 `partials.js` 注入
- 每頁只放掛載點 `<div id="site-nav"></div>`、`<div id="site-footer"></div>`，並在 `<body data-page="home|work|cases|contact">` 標明頁別（決定 nav active 與 CTA 行為）。
- **要改 email、YouTube、Instagram 連結 → 改 `partials.js` 最上面的 `EMAIL` / `YT` / `IG` 三個變數**（全站同步）。
- footer 版權年份自動（`new Date().getFullYear()`），不要寫死。
- 社群用單色 SVG icon（`.socials`），email 在 footer 顯示為文字，點了開 email 彈窗。

### 手機選單＝左側抽屜（`.drawer`）
- 放在 body 層級（不要塞進 `.nav`，因為 `.nav` 有 `backdrop-filter` 會變成 fixed 子元素的定位基準，導致定位錯亂）。
- 100dvh、`width:min(76vw,300px)`、背景深色半透明 overlay；開啟時 `body.no-scroll` **且** 呼叫 `lenis.stop()`（只鎖 body 不夠，Lenis 接管捲動）。

### email 連結 → 置中彈窗
- 連結加 `class="js-email" data-email="..."`，`app.js` 會攔截、開深色毛玻璃背景的置中彈窗（複製地址 / 開郵件 App）。

### 作品資料與卡片 → `works.js`
- 每筆作品只給 `url`，程式自動判斷平台：
  - **YouTube**（youtu.be / watch?v= / shorts/）→ 縮圖自動抓 `maxresdefault.jpg`（1280×720），失敗退回 `hqdefault.jpg`，再失敗顯示佔位。
  - **Instagram**（reel/p/tv）→ **無法自動抓縮圖**（平台限制，見 §8），必須給 `poster:"posters/xxx.jpg"`。
- `dur`（長度）**一律手填**（YT/IG 都無法用免費方式自動抓）。
- `views`（觀看數）選填，字串，例 `"239萬"`、`"75.2萬"`；**無法程式自動抓**（YT 需 Data API key、IG 無公開 API），從平台頁面手動填入；留空則卡片不顯示標籤。
- 比例 `ratio` 不填會自動推斷（shorts/reel→9:16、YT 長片→16:9）；`tag` 不填自動標（Shorts/Reels/YouTube）。
- 卡片連結 `target="_blank" rel="noopener noreferrer"`，直接導去平台（**不要嵌 iframe**——要把流量導去客戶頻道）。
- 分類篩選（`.filter`）按鈕自動從 `WORKS` 的 `cat` 產生（不要用 `<select>`）。
- 載入更多：作品 > 16 個才啟用，一次 12 個。

### 作品牆排版 → `masonry.js`
- 真 masonry（欄高獨立、間距一致）：JS 絕對定位每張卡。
- **16:9 卡片橫跨 2 欄**（寬度 = 2 張 9:16），製造交錯感。
- 用 `grid-auto-flow:dense` 式的貪婪填補（每輪挑能放在最低位置的卡），填掉跨欄造成的空洞，**代價是視覺順序會重排**（DOM/無障礙順序不變）。
- 欄數（2/3/4）與斷點（640/1024）寫在 `colCount()`，間距在 `gapPx()`，要與 CSS 一致。
- 透過 `MutationObserver` 自動在「篩選 / 載入更多」後重排，不用改 work.html 邏輯。

### 表單（首頁聯絡區 + contact.html，兩處要一致）
- 欄位：姓名、Email、影片類型（`<select name="video_type">`，選項白名單見 Worker）、需求內容、蜜罐 `website`（隱藏）、**個資同意 checkbox**、**Turnstile widget**。
- 個資同意：3 點說明放「最後欄位與送出鈕之間」；**未勾選前送出鈕停用且文字顯示「請同意個資說明」**，勾選後變回 `data-label` 的真實文字。邏輯在 `app.js`。
- 版面：左右兩欄 `.contact-grid`（左表單、右 `.contact-info`：email icon、社群 icon、回覆時間、適合的合作 pill 標籤）。手機自動上下堆疊。

## 6. 後端 Worker（`src/index.js`）

路由：
- `POST /api/contact`：驗證後寫入 D1。驗證項：body 大小上限、蜜罐、**個資同意必填（伺服器端再擋一次）**、長度上限（name≤100 / email≤254 / message≤5000）、Email 格式、`video_type` 白名單、**Turnstile（只有設了 `TURNSTILE_SECRET` 才驗證，沒設則略過）**。成功 303 轉址到 `/thanks`（不帶 .html，避免多跳一次轉址）。
- `GET /api/admin/submissions`：Basic Auth → 回 JSON（含 `Cache-Control:no-store`、`nosniff`）。
- `/admin`、`/admin.html`：Basic Auth → 用 `env.ASSETS.fetch(new URL("/admin", url))` 交出後台頁。**注意：一定要抓不帶 .html 的 `/admin`**，否則資源層會把 `/admin.html` 轉址回 `/admin` → 無限迴圈。
- 其餘 → 靜態資源。

安全：所有寫入用參數化 `.bind()`（防 SQLi）；後台 `admin.html` 用 `textContent` 渲染使用者資料（防 XSS）；密碼比對用常數時間 `safeEqual`；`ADMIN_PASSWORD`、`TURNSTILE_SECRET` 放 secret，不進程式碼。

## 7. 部署（Cloudflare）

```
npm install -D wrangler
npx wrangler login
npx wrangler d1 create editor-site-db      # 把 database_id 貼進 wrangler.jsonc
npm run db:local && npm run db:remote       # 套用 schema.sql
# 設定密碼（後台）
npx wrangler secret put ADMIN_PASSWORD
# 啟用 Turnstile 時才需要
npx wrangler secret put TURNSTILE_SECRET
npm run deploy
```
- `wrangler.jsonc` 的 `run_worker_first` 必須含 `["/admin", "/admin.html", "/api/*"]`，否則 GET 的 API 會被 `not_found_handling:"404-page"` 當成找不到檔案、回 404，進不了 Worker。
- 改了 schema 後，雲端舊表若缺欄位會報 `no such column`。測試資料可直接 `DROP TABLE submissions` 再 `--file=./schema.sql` 重建；要保留資料就用 `ALTER TABLE ... ADD COLUMN`。

## 8. 平台限制與已知地雷（別重蹈覆轍）

- **Cloudflare 靜態資源「檔案位置 = 網址路徑」。** `index.html`、`_headers`、`404.html` 必須在 `public/` 根目錄。把 HTML 搬進子資料夾會改變網址、破壞 `/` 首頁與 Worker 的絕對路徑引用。
- **`html_handling` 預設會把 `/x.html` 轉址成 `/x`。** Worker 內用 `env.ASSETS.fetch` 取頁面時要抓**不帶 .html** 的路徑，否則迴圈。
- **Instagram 無法自動抓縮圖/長度。** Meta 已停用相關 API，且 2025/11 起連 oEmbed 縮圖欄位都移除。IG 作品一律手放 `poster` + 手填 `dur`。
- **YouTube 長度**需 YouTube Data API key 才拿得到（免費網址只有縮圖），目前 `dur` 手填。
- **純靜態無 include。** 不要用 JS 注入 `<head>`（會 FOUC、charset/viewport 要早）。要共用 head 需導入 build step（11ty 或自寫 Node 腳本），目前刻意不做。
- **Turnstile / Stripe 等驗證/金流 SDK 不能自架**，必須從其官方網域載入；CSP 要保留 `challenges.cloudflare.com`。
- 自架某套件後，記得把對應 CDN 網域從 `_headers` 的 CSP 拿掉、收緊成 `'self'`。

## 9. 客戶的接案地雷（寫文案 / 設計表單時參考）

避免吸引到：要求即時回覆、需求模糊就要報價、無修改次數上限、預算低期望高、堅持平日白天線下開會、要急件不付加急費的客戶。表單與文案可適度設定預期（如回覆時間、適合的合作類型）來篩選。

## 10. 動手前的檢查清單
1. 先讀相關檔案再改，沿用既有命名與 token。
2. 樣式放對檔（§3 判斷規則）；用到 token 不寫死色碼。
3. 任何動畫/位移都加 `prefers-reduced-motion` 例外。
4. 改 nav/footer/聯絡資訊 → 改 `partials.js`，不要在各頁複製。
5. 改完確認桌機/平板/手機三種寬度、`.reveal` 進場、時間碼順序、無破版。
