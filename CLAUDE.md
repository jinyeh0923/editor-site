# CLAUDE.md — 專案規範與背景

> 給 Claude Code / AI 助手的專案工作說明。動手改任何檔案前，先讀本檔，遵守這裡的架構與慣例。
>
> 本檔是本專案規範的**唯一來源**。Claude Code 自動讀取專案根目錄這份；claude.ai 專案則上傳同一份到知識庫。改版後只維護這份、並重新上傳覆蓋知識庫。claude.ai 指示欄只放一句「詳見知識庫 CLAUDE.md」即可，不要另外複製內容。

## 協作方式（本專案特有）

- 開發者在**另一台電腦手動改檔**，你（AI）看不到即時檔案。請給**精準的程式碼片段**，並**明確說明改哪個檔、貼在哪裡**（取代哪一段／插在哪兩行之間）。除非必要，不要叫他整支檔案重貼。
- **需要看現況才能正確修改時，先請他貼出相關檔案，不要憑記憶猜內容。** 本檔提供架構脈絡，但實際程式碼以他當下貼的為準。
- （語氣、繁中、精簡、不推薦未問到的工具等一般偏好，見開發者的 user preferences，此處不重複。）

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
├─ admin.html        後台（需登入）：分頁結構，目前有「來件」「作品」兩頁
├─ thanks.html       表單送出後的感謝頁（自帶內聯樣式，不載 core.css）
├─ 404.html          404 頁（自帶內聯樣式）
├─ _headers          安全標頭 / CSP（必須在資源根目錄）
├─ css/   core.css home.css work.css cases.css
├─ js/    app.js partials.js works.js masonry.js cases.js
├─ posters/          手動封面圖（IG 作品封面、本人照片、案例封面、服務圖…）。後台上傳的圖不在這裡，在 R2（網址 /media/…）
└─ vendors/          自架第三方套件（如 Lenis）+ README（記版本）
src/index.js          Cloudflare Worker（表單收件 + 作品 API + 圖片上傳 / 輸出 + 後台 API + 後台頁 gate）
schema.sql            D1 資料表定義（submissions、works、work_cats）
seed-works.sql        works 表的初始資料（2026-10-12 從舊版 works.js 轉出的 56 筆）
seed-work-cats.sql    work_cats 表的初始資料（原本寫死的 4 個分類 + works 裡用過的其他分類）
scripts/              gen-seed-works.cjs：從舊版 works.js 重新產生 seed
wrangler.jsonc        Cloudflare 設定
package.json          scripts: dev / deploy / db:local / db:remote
```

### 各頁載入的 CSS（每頁不同，這是刻意的拆分）

- `index.html` → core + home + work + cases（首頁有作品與案例 teaser）
- `work.html` → core + work
- `cases.html` / `case1.html` → core + cases（案例頁改為資料驅動，見 §5 `cases.js`）
- `contact.html` → core（只用共用的）
- `admin.html` → core

### Script 載入順序（有用到才載）

`works.js` →（`cases.js`，僅案例頁）→（vendors）`lenis.min.js` → `partials.js` → `app.js` → 該頁內聯 script → `masonry.js`

- `masonry.js` 只在有作品牆 `.wall` 的頁面載入（index、work）。
- `cases.js` 只在案例頁載入（cases、case1），且必須在 `works.js` 之後（要用 `workById` 取作品）。
- `partials.js` 必須在 `app.js` 之前（app.js 會操作 partials 注入的 nav/抽屜/彈窗）。
- **作品是非同步載入的**：`works.js` 只提供函式，資料要等 `loadWorks()`（fetch `/api/works`）回來才有。各頁的內聯 script 一律用 `renderWhenLoaded(el, loadWorks(), render)` 渲染，不能在載入當下直接讀 `WORKS`（那時是空陣列）。

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
- **Icon 一律用 inline SVG**（`fill="currentColor"` 繼承文字色），沿用 footer `.socials` 既有寫法。**不要引入 Remix Icon / Font Awesome 等外部圖示庫**（避免動 CSP、加載整包字型）。需要新 icon 就手寫 SVG path。
- **RWD 斷點統一 `640` / `1024`**（與 `masonry.js` 的 `colCount()` 一致）。不要再引入 760/768 等其他值；某區塊實測在這之間才破版，才另外加中間斷點。手機的 `@media` 覆蓋集中放在該 CSS 檔底部（同檔、在後）。

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

### 作品資料與卡片 → D1 `works` 表 + `works.js`

- **作品資料在 D1 的 `works` 表，由客戶在 `/admin` 的「作品」頁管理**（新增 / 編輯 / 上下架 / 排序 / 刪除）。`works.js` 不再放資料，只負責載入與渲染卡片。要改作品內容 → 用後台，不是改檔案。
- 前台從 `GET /api/works` 讀（只有上架的，順序＝後台排的）。`works.js` 提供：
  - `loadWorks()`：抓資料並填入 `window.WORKS`，回傳 Promise。同一頁只抓一次。
  - `fetchJSON(url)` / `renderWhenLoaded(el, promise, render, opts)`：「fetch 後渲染」的共用函式。失敗或空資料時在 `el` 顯示 `.data-msg` 訊息，不讓整頁壞掉；渲染後自動呼叫 `revealIn(el)` 接上進場動畫。之後案例、文案改讀 API 也用這兩支。
  - `escHTML()`：**作品內容是後台輸入的，串進 HTML 前一律跳脫**。`workCardHTML` 已全欄位處理，新增欄位時要比照。
- 每筆作品只給 `url`，程式自動判斷平台：
  - **YouTube**（youtu.be / watch?v= / shorts/）→ 縮圖自動抓 `maxresdefault.jpg`（1280×720），失敗退回 `hqdefault.jpg`，再失敗顯示佔位。
  - **Instagram**（reel/p/tv）→ **無法自動抓縮圖**（平台限制，見 §8），必須給 `poster`：客戶在後台上傳（存成 `media/works/….jpg`），或沿用開發者放進網站的 `posters/xxx.jpg`。兩種路徑都是相對於網站根目錄，前台不用分辨。
- `dur`（長度）**一律手填**（YT/IG 都無法用免費方式自動抓）。
- `views`（觀看數，選填字串如 `"239萬"`）**一律手填**——觀看數同樣無法自動抓（YT 要 Data API key、IG 無公開 API）。有填才在卡片顯示 `▶ 觀看數` 標籤（`.views`，放角落、不與 `.dur`/`.badge` 重疊）；沒填不顯示。
- 每筆作品有穩定 `id`，**建立後不可變更**，供案例頁 `cases.js` 以 `workById(id)` 參照重用卡片。後台新增時 id 可留空，伺服器用影片代碼產生（`yt-…` / `shorts-…` / `reels-…`）。
- `url` 只接受 YouTube / Instagram 連結，或空字串（帳號已關閉等情況：卡片輸出不可點的 `div`，此時要手填 `tag`）。
- `home`（0/1）：1＝出現在首頁精選 teaser。沒有 `pin` 欄位了，誰排第一由後台順序決定。
- 比例 `ratio` 不填會自動推斷（shorts/reel→9:16、YT 長片→16:9）；`tag` 不填自動標（Shorts/Reels/YouTube）。
- 卡片連結 `target="_blank" rel="noopener noreferrer"`，直接導去平台（**不要嵌 iframe**——要把流量導去客戶頻道）。
- 分類篩選（`.filter`）按鈕自動從 `WORKS` 的 `cat` 產生（不要用 `<select>`）。按鈕順序＝後台「管理分類」排的（`loadCats()` 讀 `GET /api/cats`；讀不到就照作品出現的順序）。沒有上架作品的分類不出按鈕。
- 載入更多：作品 > 16 個才啟用，一次 12 個。

### 作品牆排版 → `masonry.js`

- 真 masonry（欄高獨立、間距一致）：JS 絕對定位每張卡。
- **16:9 卡片橫跨 2 欄**（寬度 = 2 張 9:16），製造交錯感。
- **有限往前看**補洞：照 DOM 順序放卡，每一步只在接下來 `LOOKAHEAD`（3）張裡挑能放在最高位置的那張，排最前的那張最多被跳過 2 次。客戶在後台自己排順序，所以視覺順序必須貼近 DOM 順序（實測最多差 2–3 格）；不要改回全域挑卡或多種候選排列。
- 欄數（2/3/4）與斷點（640/1024）寫在 `colCount()`，間距在 `gapPx()`，要與 CSS 一致。
- 透過 `MutationObserver` 自動在「資料載入 / 篩選 / 載入更多」後重排，不用改 work.html 邏輯。牆面沒有卡片時（讀取失敗的訊息、空清單）交還一般排版，讓訊息看得到。

### 社群實操案例（資料驅動）→ `cases.js`

- 案例頁（cases.html / case1.html）**改為資料驅動**：案例內容都在 `cases.js` 的 `CASES` 陣列，新增案例 = 推一個物件，不動 HTML。
- 每個案例物件欄位：`id`、`name`（帳號名）、`handle`、`kind`（類型小標）、`tagline`（定位 slogan）、`follows`（各平台粉絲 `[{platform,value}]`，用平台 inline SVG icon 顯示）、`summary`、`highlights`（亮點 `[{icon,title,desc}]`，icon 為 key 對應內建 inline SVG）、`metrics`（數據條 `[{label,value}]`）、`logo`（選填，圓形頭像，`posters/logos/xxx.png`）、`works`（作品 id 陣列）。
- **代表作重用作品卡片**：`works` 裡的 id 透過 `works.js` 的 `workById(id)` 取出、用既有 `workCardHTML` 渲染（含 `.views` 標籤）。找不到 id 就 `console.warn` 略過，不讓整頁崩。因為要查作品，**`renderCases` 要等 `loadWorks()` 完成後才呼叫**；作品讀取失敗時案例照樣渲染，只是沒有代表作。
- 被案例引用的作品在後台刪不掉（API 回 409）。Worker 是讀 `cases.js` 的文字來判斷的，依賴目前的寫法（`name:` 在 `works:` 之前、陣列是字串字面值），大改 `cases.js` 格式後要重測。
- 空欄位（如待定案例的空 `follows`/`highlights`/`logo`）要優雅省略、不破版。
- 數字（follows / metrics）都是**手填**、集中在 `cases.js`，客戶要改就改這一個檔。

### 後台 → `admin.html`（樣式與 script 都內聯在這一支）

- **分頁結構**：上方 `#tabs` 的按鈕對應 `<section data-panel="…">`，網址 hash 記住目前分頁（`/admin#works`）。新增一個資源 = 加一顆按鈕 + 一個 `data-panel` 區塊 + 在 script 的 `PANELS` 登記載入函式（第一次切到該頁才載入）。
- **作品頁**：一張列表，每列有排序、封面、標題（可點去平台）+ id、分類、長度、觀看、狀態、操作（編輯 / 上架或下架 / 刪除）。下架的列變淡。
- **排序三種方式，都呼叫 `moveTo(id, 位置)`**：拖拉左邊的把手（拖到視窗上下緣會自動捲動）、直接改編號後按 Enter、↑↓。畫面先更新，再把整份順序送 `POST /api/admin/works/reorder` 的 `{ids}`；失敗就重抓。**觸控裝置不能拖拉**（瀏覽器原生拖放不支援），手機靠改編號或 ↑↓。
- **新增 / 編輯表單是跳窗**（原生 `<dialog id="w-dialog">`，`showModal()`）：兩者共用同一張表單，編輯時隱藏「作品 ID」欄。Esc、取消、存檔成功會關；**點背景不關**（避免誤觸弄丟輸入）。之後案例、文案的表單比照用跳窗。
- **狀態 / 分類篩選**：列表上方兩排按鈕，狀態（`#w-status`：全部 / 上架中 / 已下架）與分類（`#w-filter`），可同時用。括號內的筆數跟著另一排的選擇變（選「已下架」，分類那排就是各分類的下架筆數）。選了之後只列符合的（`inView`），編號與排序都是「列出來的這些」的順序：它們在整份順序裡佔的那幾格不變，只在那幾格裡換位置，沒列出來的不動（`moveTo` 處理）。都選「全部」排的是整份順序。
- **管理分類**：作品頁的「管理分類」開跳窗（`#c-dialog`）：新增、改名（連同底下作品一起改）、刪除（還有作品的分類刪不掉）、↑↓ 排順序（＝前台篩選按鈕的順序）。訊息顯示在跳窗內（`#c-note`）。作品表單的分類是 `<select>`，只能選已存在的分類。
- **封面圖上傳**：表單的「上傳圖片」先在瀏覽器把圖縮到長邊 1280、轉成 JPG，再送 `POST /api/admin/media?folder=works`，回來的路徑填進「封面圖」欄，按「儲存」才套用。路徑欄仍可手填 `posters/…`。上傳中鎖住「儲存」。
- **訊息位置**：表單的錯誤顯示在跳窗內（`#w-form-note`）；存檔成功與列表操作的結果顯示在列表上方（`#w-note`）。API 錯誤直接顯示伺服器回的中文 `error`。
- 送出期間用 `run()` 鎖住所有操作（`busy`），避免連點造成順序錯亂。
- 使用者與後台輸入的資料一律用 `createElement` + `textContent` 渲染，不要串 HTML 字串。

### 表單（首頁聯絡區 + contact.html，兩處要一致）

- 欄位：姓名、Email、影片類型（`<select name="video_type">`，選項白名單見 Worker）、需求內容、蜜罐 `website`（隱藏）、**個資同意 checkbox**、**Turnstile widget**。
- 個資同意：3 點說明放「最後欄位與送出鈕之間」；**未勾選前送出鈕停用且文字顯示「請同意個資說明」**，勾選後變回 `data-label` 的真實文字。邏輯在 `app.js`。
- 版面：左右兩欄 `.contact-grid`（左表單、右 `.contact-info`：email icon、社群 icon、回覆時間、適合的合作 pill 標籤）。手機自動上下堆疊。

## 6. 後端 Worker（`src/index.js`）

路由：

- `POST /api/contact`：驗證後寫入 D1。驗證項：body 大小上限、蜜罐、**個資同意必填（伺服器端再擋一次）**、長度上限（name≤100 / email≤254 / message≤5000）、Email 格式、`video_type` 白名單、**Turnstile（只有設了 `TURNSTILE_SECRET` 才驗證，沒設則略過）**。成功 303 轉址到 `/thanks`（不帶 .html，避免多跳一次轉址）。
- `GET /api/admin/submissions`：Basic Auth → 回 JSON（含 `Cache-Control:no-store`、`nosniff`）。
- `GET /api/works`：公開，只回上架的作品，依 `sort_order`，`Cache-Control: public, max-age=60`（所以後台改完，前台最多 1 分鐘才更新）。
- `/api/admin/works`（Basic Auth，寫入一律要 `Content-Type: application/json`，順便擋 CSRF）：
  - `GET`：全部作品（含下架）。
  - `POST`：新增，排在最前面。
  - `PUT /:id`：局部更新（下架只送 `{"visible":0}`）；id 不可變更。
  - `DELETE /:id`：被案例引用回 409；讀不到 `cases.js` 回 503，不放行。
  - `POST /reorder`：`{ids:[…]}` 整份順序（`sort_order` 重編 1..N，清單與資料庫對不上回 409），或 `{id, dir}` 與相鄰交換。
- `GET /api/cats`：公開，分類名稱的陣列（依 `sort_order`），快取同 `/api/works`。
- `/api/admin/cats`（Basic Auth）：分類以名稱為主鍵（`work_cats.name`，`works.cat` 存的就是名稱）。名稱可能含空白、斜線，所以**名稱一律放 JSON body，不放網址**：
  - `GET`：全部分類名稱。
  - `POST {name}`：新增，排最後。
  - `PUT {name, rename}`：改名，`work_cats` 與 `works.cat` 同一個交易一起改。
  - `DELETE {name}`：還有作品（含下架）回 409。
  - `POST /reorder {names:[…]}`：整份順序，對不上回 409。
  - 作品新增、或編輯時換分類，分類必須已存在（400）。
- `POST /api/admin/media?folder=works`（Basic Auth）：上傳圖片到 R2。body 就是圖檔，`Content-Type` 必須是 `image/jpeg` / `image/png` / `image/webp`（非簡單型別，跨站送不出來，同樣擋 CSRF）；上限 2 MB；檢查檔頭確認真的是那種圖；檔名由伺服器產生（`works/<日期>-<隨機>.jpg`）。回 `{path:"media/works/….jpg"}`。可用的資料夾列在 `MEDIA_FOLDERS`，之後案例 logo、本人照片各加一個。
- `GET /media/*`：公開，從 R2 讀圖。檔名不會重複、內容不會變，所以 `Cache-Control: immutable` 一年。
- `/admin`、`/admin.html`：Basic Auth → 用 `env.ASSETS.fetch(new URL("/admin", url))` 交出後台頁。**注意：一定要抓不帶 .html 的 `/admin`**，否則資源層會把 `/admin.html` 轉址回 `/admin` → 無限迴圈。
- 其餘 → 靜態資源。
  作品的 `poster` 只接受 `posters/…` 或 `media/…` 的圖檔路徑（`POSTER_RE`），不接受外部網址。
  **R2 的圖不會自動刪除**：作品刪除、換封面、上傳後沒儲存，舊圖都留在 R2（刻意的，避免誤刪還在用的圖）。要清就到 Cloudflare 後台手動刪。
  安全：所有寫入用參數化 `.bind()`（防 SQLi）；後台 `admin.html` 用 `textContent` 渲染使用者資料（防 XSS）；密碼比對用常數時間 `safeEqual`；`ADMIN_PASSWORD`、`TURNSTILE_SECRET` 放 secret，不進程式碼。

## 6.5 內容後台（進行中）

目標：讓客戶（薯餅）在 /admin 自己管理內容。**內容由客戶改，版型設計由開發者改**，後台不做任何版面編輯功能。

狀態：第 1 階段已實作（作品 API、後台作品頁含拖拉排序、狀態 / 分類篩選、管理分類與跳窗表單、前台改讀 API、masonry 有限往前看）；第 2 階段做了作品封面上傳（案例 logo、本人照片還沒接）；第 3–4 階段未開始。

分階段（依序做，每階段完成才開下一階段）：
1. 作品管理：works 搬進 D1，後台可新增/編輯/刪除/上下架/排序（拖拉、改編號、↑↓，見 §5「後台」）。IG 封面在後台上傳（第 2 階段），也可手填路徑。
2. R2 圖片上傳：作品封面、案例 logo、本人照片共用，經 Worker `/media/*` 同網域輸出。
3. 案例管理：cases.js 搬進 D1，代表作從作品清單勾選。
4. 文案：site_settings key-value 表，只開放白名單欄位（如關於剪輯者、stats、Showreel ID），用 Worker HTMLRewriter 伺服器端注入（保 SEO），不用前端 fetch。

設計約束：
- API 統一命名 `/api/admin/<資源>`（works / cases / settings）；公開讀取用 `/api/<資源>`。
- admin.html 做成分頁結構，每個資源一頁，新增階段 = 加一頁。
- 前台「fetch 後渲染」抽成共用函式，案例頁之後直接套用。
- 客戶要自己排序作品 → masonry.js 改為「有限往前看」（只從接下來 2–3 張挑卡補洞），盡量保持排序；不再用全域貪婪填補。
- Cloudflare 資源維持在開發者帳號，客戶只用網站後台密碼登入。

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

- R2（後台上傳的圖）：帳號要先在 Cloudflare 後台啟用 R2，再 `npx wrangler r2 bucket create editor-site-media`；`wrangler.jsonc` 的 `r2_buckets` 綁定名稱是 `MEDIA`。本機 `npm run dev` 用的是本機模擬的 R2，跟線上無關。
- `wrangler.jsonc` 的 `run_worker_first` 必須含 `["/admin", "/admin.html", "/api/*", "/media/*"]`，否則 GET 的 API 與 `/media/*` 會被 `not_found_handling:"404-page"` 當成找不到檔案、回 404，進不了 Worker。
- `works` 表第一次上線：`npm run db:remote` 建表後，再 `npx wrangler d1 execute editor-site-db --remote --file=./seed-works.sql` 匯入初始資料（`INSERT OR IGNORE`，重跑不會覆蓋後台改過的）。本機把 `--remote` 換成 `--local`。
- `work_cats` 表同理：`npm run db:remote` 建表後跑一次 `--file=./seed-work-cats.sql`。**要在部署新版 Worker 之前跑**，否則後台作品頁會讀取失敗（它同時抓作品與分類）。
- 改了 schema 後，雲端舊表若缺欄位會報 `no such column`。測試資料可直接 `DROP TABLE submissions` 再 `--file=./schema.sql` 重建；要保留資料就用 `ALTER TABLE ... ADD COLUMN`。
- **CSS/JS 快取**：`_headers` 已對 `/css/*`、`/js/*` 設 `Cache-Control: public, max-age=300, must-revalidate`。改完 CSS/JS 部署後，最多 5 分鐘使用者才拿到新版（不是 cookie 問題，是瀏覽器快取）。要更即時把 300 調小。因此不需要在 HTML 加 `?v=` 版本號。

## 8. 平台限制與已知地雷（別重蹈覆轍）

- **Cloudflare 靜態資源「檔案位置 = 網址路徑」。** `index.html`、`_headers`、`404.html` 必須在 `public/` 根目錄。把 HTML 搬進子資料夾會改變網址、破壞 `/` 首頁與 Worker 的絕對路徑引用。
- **`html_handling` 預設會把 `/x.html` 轉址成 `/x`。** Worker 內用 `env.ASSETS.fetch` 取頁面時要抓**不帶 .html** 的路徑，否則迴圈。
- **Instagram 無法自動抓縮圖/長度。** Meta 已停用相關 API，且 2025/11 起連 oEmbed 縮圖欄位都移除。IG 作品一律手放 `poster` + 手填 `dur`。
- **YouTube 長度**需 YouTube Data API key 才拿得到（免費網址只有縮圖），目前 `dur` 手填。
- **純靜態無 include。** 不要用 JS 注入 `<head>`（會 FOUC、charset/viewport 要早）。要共用 head 需導入 build step（11ty 或自寫 Node 腳本），目前刻意不做。
- **Turnstile / Stripe 等驗證/金流 SDK 不能自架**，必須從其官方網域載入；CSP 要保留 `challenges.cloudflare.com`。
- 自架某套件後，記得把對應 CDN 網域從 `_headers` 的 CSP 拿掉、收緊成 `'self'`。
- **換正式網域**時，站內寫死的絕對網址（每頁 `<head>` 的 canonical / og:url / og:image / twitter:image）要全域取代成新網域；步驟見 `DOMAIN-MIGRATION-SOP.md`（公版）與 `DOMAIN-MIGRATION-薯餅.md`（本案）。OG 分享圖 `posters/og-cover.jpg`（1200×630）需實際存在，否則分享破圖。

## 9. 客戶的接案地雷（寫文案 / 設計表單時參考）

避免吸引到：要求即時回覆、需求模糊就要報價、無修改次數上限、預算低期望高、堅持平日白天線下開會、要急件不付加急費的客戶。表單與文案可適度設定預期（如回覆時間、適合的合作類型）來篩選。

## 10. 動手前的檢查清單

1. 先讀相關檔案再改，沿用既有命名與 token。
2. 樣式放對檔（§3 判斷規則）；用到 token 不寫死色碼。
3. 任何動畫/位移都加 `prefers-reduced-motion` 例外。
4. 改 nav/footer/聯絡資訊 → 改 `partials.js`，不要在各頁複製。
5. 改案例內容 → 改 `cases.js` 的 `CASES`，不要動 HTML；代表作用作品 `id` 參照、不要重貼一份。改作品內容 → 用 `/admin` 後台，不是改檔案。
   - 新增會顯示後台輸入內容的地方 → 用 `escHTML`（前台）或 `textContent`（後台）。
6. 需要 icon → 手寫 inline SVG，不引入外部圖示庫；RWD 斷點用 640/1024。
7. 改完確認桌機/平板/手機三種寬度、`.reveal` 進場、時間碼順序、無破版。
