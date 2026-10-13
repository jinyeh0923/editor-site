# HANDOVER — 接續開發說明

> 最後更新：2026-10-13
> 這份是「下次開工前先看」的狀態紀錄。架構與程式慣例看 `CLAUDE.md`，上線前的內容清單看 `CONTENT-CHECKLIST.md`，這裡不重複。

---

## ⚠️ 開工前第一件事

```bash
git pull
```

**這個專案有兩台電腦在改：**

| 電腦 | 路徑 |
| --- | --- |
| A（筆電） | `C:\Users\User\code\editor-site` — **開發與部署一律在這台** |
| B（桌機） | `C:\Users\Meow\editor-site` — 不同步、**不再從這台部署**（程式碼是舊版，部署會蓋掉線上版） |

2026-10-07 踩過一次坑：B 電腦在 7/01–7/02 做了四個 commit 並部署上線，但 A 電腦從沒 `pull`。結果 A 的本機程式碼比線上還舊，差點直接 `deploy` 把線上較新的首頁蓋掉（首頁案例區的資料驅動改版、`home.css` 168 行樣式、`works.js` 整套 id 重新命名）。

最後是把線上檔案抓下來做三方合併才救回。**不要再讓這件事發生——動手前先 pull，收工後 commit + push。**

---

## 目前狀態（三邊同步）

| | 版本 |
| --- | --- |
| 本機 `feat/work-cats` | **`8633fe2` 管理分類 + 上架狀態篩選：還沒合併、沒 push、沒部署**（上線步驟見下方） |
| 本機 `main` | 與 `origin/main` 同步（程式最後一版是 `eee7b43`，之後只有文件更新） |
| Cloudflare 線上 | `1503cd6e-ea30-421f-937b-e13be5aa4035`（＝ `eee7b43` 的程式） |
| 回復點 | tag `pre-works-admin` → `2946117`（內容後台上線前的最後一版） |
| 已合併的分支 | `feat/works-admin`、`feat/media-upload`（都已進 `main`，留著沒刪） |

線上網址：https://editor-site.editor-vincent.workers.dev
GitHub：https://github.com/jinyeh0923/editor-site

### 內容後台已上線（比原訂 10/14 提前）

- 第 1 階段（作品管理）＋第 2 階段的作品封面上傳，都在線上，**客戶已經在用**（新增作品、排序、上傳封面）。
- 所以從現在起：**作品資料以線上 D1 為準**，本機 D1 只是 10/12 的 56 筆測試資料，兩邊不同步是正常的。
- **不要再對線上跑 `seed-works.sql`**：它是 `INSERT OR IGNORE`，不會覆蓋改過的資料，但客戶在後台刪掉的原始作品會被加回來。

### 線上的雲端資源（都在 `Lyrayeh0@gmail.com's Account`）

| 資源 | 名稱 | 內容 |
| --- | --- | --- |
| Worker | `editor-site` | 程式 + `public/` 靜態檔 |
| D1 | `editor-site-db` | `submissions`（來件）、`works`（作品）；`work_cats`（分類）待 `feat/work-cats` 上線時建立 |
| R2 | `editor-site-media` | 後台上傳的圖，目前只有 `works/` 資料夾（作品封面） |

R2 於 2026-10-13 啟用（帳號有綁付款方式，免費額度內不收費）。

---

## 2026-10-13（下午）管理分類 + 上架狀態篩選（`8633fe2`，分支 `feat/work-cats`，**尚未上線**）

客戶需求：能自己新增 / 刪除 / 修改分類；上架與下架的影片分開呈現，方便統計。

### 做了什麼
- **`work_cats` 表**（`schema.sql`）：分類以名稱為主鍵，`works.cat` 存的就是名稱，`works` 表結構沒變
- **`/api/admin/cats`**：新增、改名（連同底下作品同一個交易一起改）、刪除（還有作品回 409）、排序。名稱放 JSON body，不放網址
- **`GET /api/cats`**：公開，前台 `work.html` 篩選按鈕的順序改讀這支；`works.js` 寫死的 `WORK_CATS` 已移除
- **後台「管理分類」跳窗**（`#c-dialog`）；作品表單的分類改成 `<select>`，只能選已存在的分類
- **狀態篩選**（`#w-status`：全部 / 上架中 / 已下架），可與分類篩選併用，筆數跟著另一排變；標題旁的總數與管理分類跳窗都分開列上架 / 下架筆數
- 篩選下的排序沿用原規則（只在列出來的那幾格裡換位置），`moveTo` 從「依分類」改成「依 `inView`」

### 上線步驟（順序不能反）
```bash
git checkout main && git merge feat/work-cats
npm run db:remote
npx wrangler d1 execute editor-site-db --remote --file=./seed-work-cats.sql
npm run deploy
git push
```
- **先建表與匯入分類，再部署。** 反過來的話後台作品頁會讀取失敗（它同時抓作品與分類），前台不受影響
- `seed-work-cats.sql` 會把線上 `works` 裡用過、但不在原本 4 類裡的分類補在後面，所以客戶自己打的新分類不會掉
- 上線後確認：後台「管理分類」列得出分類、前台作品集篩選按鈕順序正確

### 測試
- API 用 Node `fetch` 跑過正常流程與該擋的情況（重複名稱、刪有作品的分類、過期的排序清單、作品指定不存在的分類、沒帶 JSON Content-Type）
- 後台與 `work.html` 用無頭 Chrome 操作過（狀態 + 分類篩選下排序、管理分類的新增 / 排序 / 改名 / 刪除、新增下架作品），跑在獨立的本機資料庫副本上
- **沒測到的**：手機 / 平板寬度下的管理分類跳窗；最後補的分類列間距 CSS（`#c-rows`、`.cnum`）沒再截圖確認

---

## 2026-10-12 ～ 10-13 這次做了什麼

規劃見 `作品後台規劃_20261012.md`，設計約束見 `CLAUDE.md` §6.5。一個晚上把第 1 階段做完並上線，再接著做了分類篩選與封面上傳。

### 1. 資料層（`575048c`）
- `schema.sql` 新增 `works` 表。比規劃多一個 `home` 欄位（首頁精選）；不存 `pin`，誰排第一由 `sort_order` 決定
- `seed-works.sql`：舊版 `works.js` 的 56 筆原樣轉入，id 不變
- `src/index.js`：`GET /api/works`（公開）與 `/api/admin/works` 的增刪改、排序
- 刪除前檢查案例引用：Worker 讀 `cases.js` 的文字判斷，被引用回 409，讀不到回 503

### 2. 後台作品頁（`079b1ce`、`56cc61c`、`706fdba`）
- `admin.html` 改分頁結構（來件 / 作品）
- 排序三種方式：拖拉把手（拖到視窗邊緣自動捲動）、直接改編號、↑↓
- 新增 / 編輯表單是跳窗（原生 `<dialog>`），點背景不關

### 3. 前台改讀 API（`835a6dc`）
- `works.js` 不再放資料，改成 `loadWorks()`；`fetchJSON` / `renderWhenLoaded` 是共用的「fetch 後渲染」
- `workCardHTML` 所有欄位過 `escHTML`
- `masonry.js` 改有限往前看（`LOOKAHEAD = 3`），視覺順序貼近後台排的順序
- API 失敗時作品牆顯示一行訊息；案例照樣顯示，只是沒有代表作

### 4. 第一次上線
- 打 tag `pre-works-admin` → 雲端 D1 套 `schema.sql`、匯入 `seed-works.sql`（56 筆）→ 合併進 `main` → 部署
- 線上驗證過：API、作品集篩選與載入更多、首頁精選、案例代表作、後台沒登入回 401

### 5. 之後追加（都已上線）
- `eb06885`：新增 4 張 IG 封面 `posters/works/reel-40` ～ `reel-43`
- `f8afdc8`：**後台分類篩選**。選了分類只列那一類，編號與排序是「分類內」的順序，不動到其他分類
- `eee7b43`：**作品封面上傳**（第 2 階段的一部分）
  - 表單「上傳圖片」：瀏覽器先把圖縮到長邊 1280、轉 JPG，再上傳到 R2
  - `POST /api/admin/media?folder=works`：驗證型別、檔頭、2 MB 上限，檔名由伺服器產生
  - `GET /media/*`：公開輸出，快取一年
  - `poster` 接受 `posters/…`（開發者放的）或 `media/…`（後台上傳的）

### 測試方式（之後可以沿用）
- API：本機 curl 跑過正常流程與各種該擋的情況
- 後台與前台：用無頭瀏覽器實際操作本機頁面（排序、分類篩選、上傳、跳窗），在一份獨立的本機資料庫副本上跑，不碰正式資料
- **沒測到的**：平板寬度的版面、實機手機上傳（尤其 iPhone 的 HEIC）、觸控裝置操作後台

---

## 2026-10-08 做了什麼

### 作品資料
- 新增 18 筆作品（38 → 56）
- 分類從 11 類重整為 **4 類**，順序由 `works.js` 的 `WORK_CATS` 定義
- 移除 `role` 欄位（全站）
- `views` 單位統一為「萬」
- `beautywiki_official` 帳號已關閉，三筆 `url` 清空

### 功能
- `works.js` `workCardHTML()`：
  - `title` / `dur` / `views` 留空不再輸出空標籤或 `"undefined"`
  - **`url` 留空 → 輸出 `<div>` 而非 `<a href="#">`**，不產生死連結
  - 移除卡片右上角的分類標籤 `.cat-tag`
- `work.html`：篩選按鈕照 `WORK_CATS` 排序、「全部」移到最後、預設選第一個分類
- `wrangler.jsonc`：寫死 `account_id`

### 圖片
- 新增 14 張封面（`reel-26` ~ `reel-39`）
- 壓縮 13 張過大的圖，4.51MB → 3.68MB

---

## 常用指令

```bash
npm run dev        # 本機 http://127.0.0.1:8787（本機的 D1 與 R2，跟線上無關）
npm run deploy     # 部署（account_id 已寫在 wrangler.jsonc）。只換程式與靜態檔，不動 D1 / R2 的資料

npm run db:local   # 本機套用 schema.sql
npm run db:remote  # 線上套用 schema.sql（CREATE TABLE IF NOT EXISTS，表已存在不做事）
npx wrangler d1 execute editor-site-db --local --file=./seed-works.sql   # 本機匯入作品初始資料（線上不要再跑）

npx wrangler login              # token 過期時（必須在真正的終端機跑，非互動環境起不來）
npx wrangler secret put ADMIN_PASSWORD
npx wrangler deployments list   # 看部署歷史
npx wrangler rollback           # 線上出問題時退回上一版（只退程式，不退資料）
```

`wrangler r2 …` 這類不讀 `wrangler.jsonc` 帳號的指令，在非互動環境要加 `CLOUDFLARE_ACCOUNT_ID=1f506a38135d78297b21c4c80f6b9020`，否則會因為有兩個帳號而報錯。

### 後台

- 網址 `/admin`，帳號固定 **`admin`**（寫在 `src/index.js` 的 `authed()`）
- 本機密碼在 `.dev.vars`
- **線上密碼是 Cloudflare secret，唯寫、無法讀取**，忘了只能 `wrangler secret put` 重設（立即生效，不用重新部署）
- 後台改完，前台最多 1 分鐘才更新（`/api/works` 快取 60 秒）
- 部署後 5 分鐘內，回訪的訪客可能拿到新 HTML 配舊 JS（`/css/*`、`/js/*` 快取 5 分鐘）

---

## 待辦

### 🔴 安全（優先）

- [ ] **確認線上 `ADMIN_PASSWORD` 已經換成強密碼** — 之前與本機開發用的是同一組弱密碼。現在客戶已在用後台，`/admin` 後面有訪客個資（姓名 / Email / 需求內容）和整個作品資料的寫入權，Basic Auth 沒有嘗試次數限制
  - 或改用 **Cloudflare Access**（Google 帳號登入、免密碼、可設定誰能存取，免費額度 50 人）

### 🟡 上線前必改（詳見 `CONTENT-CHECKLIST.md`）

- [ ] **Turnstile 還是官方測試金鑰** `1x00000000000000000000AA`（`index.html` / `contact.html` 兩處）
      — 換真實 Site Key 時要同步 `wrangler secret put TURNSTILE_SECRET`，兩者必須成對
- [ ] **首頁 showreel** `data-yt="SHOWREEL_ID"`（`index.html`）還是佔位
- [ ] **`partials.js` 的 `YT = "#"`** 還沒填真實頻道網址
      — 填好後要同步更新 `index.html` JSON-LD 的 `sameAs`
- [ ] **`index.html` 聯絡區有 2 個 `href="#"`** 的社群連結
- [ ] **`posters/og-cover.jpg` 不存在**（1200×630）— 分享到社群沒有預覽圖
- [ ] **買正式網域**後全站替換 base URL（OG canonical / sitemap），目前是 `editor-site.editor-vincent.workers.dev`

### 🟢 內容待補（現在由客戶在後台處理）

- [ ] 不少作品的長度（`dur`）留空 — 留空不會破版，只是卡片少一個標籤
- [ ] 同名作品（例如兩支「台北松仁扶輪社」、`reels-tpvl-1~3`）牆上並排會像同一支，要區分的話補副標
- [ ] 首頁 `.stats` 數字（200+ / 30+ / 1000萬+）還是佔位（要等第 4 階段才能在後台改，目前改 `index.html`）

### 🔵 可做可不做

- [ ] R2 的舊圖不會自動刪除（換封面、刪作品、上傳後沒儲存都會留著）。空間不是問題，要清就到 Cloudflare 後台手動刪，或之後做自動清理
- [ ] `work.css` 的 `.w .ov p` 已是死樣式（`role` 移除後不再輸出 `<p>`）
- [ ] `_headers` 的 CSP `script-src` 還留著 `https://cdn.jsdelivr.net`，但 Lenis 已自架，可收緊
- [ ] `works.js` 卡片上的 `data-cat` 屬性目前沒有程式讀取
- [ ] `feat/works-admin`、`feat/media-upload` 兩個分支已合併，可以刪

---

## 這個專案的地雷（`CLAUDE.md` §8 之外的補充）

### 部署

- **兩個 Cloudflare 帳號**：`Lyrayeh0@gmail.com`（專案在這）、`Tonyyeh080586@gmail.com`。`account_id` 已寫進 `wrangler.jsonc`，但**交接給客戶時要換成客戶帳號的 ID**（D1、R2 也要跟著搬）
- 非互動環境（CI / AI 工具）跑 `wrangler login` 會失敗，要在真正的終端機登入，或改用 `CLOUDFLARE_API_TOKEN`
- `npm run deploy` 偶爾在最後一步回 504，但其實已經上傳成功。**不要直接重跑**，先開線上網址確認

### 資料

- **作品在線上 D1，不在檔案裡。** 要看線上現況用 `/admin` 或 `GET /api/works`；本機資料庫是舊的測試資料
- **作品的 `id` 是 `cases.js` 的外鍵**，建立後不可變更。被案例引用的作品在後台刪不掉（409）
- 刪除檢查靠 `cases.js` 目前的排版（`name:` 在 `works:` 之前、陣列是字串字面值）。大改 `cases.js` 格式後要重測刪除被引用的作品是否仍回 409
- **IG 連結會失效**（帳號關閉、貼文刪除）。遇到就在後台把連結清空，卡片會自動變成不可點，封面與觀看數保留。記得補「左上角標籤」（沒有連結判不出平台）
- IG 分享連結的 `?stkn=` 是會過期的 token，貼進後台前先清掉
- 新作品會排到最前面（也是該分類的第 1 個），要調位置用後台排序
- Windows 的 curl 用 `-d '…中文…'` 會以 cp950 送出，存進去變亂碼。測中文要用 UTF-8 檔案：`--data-binary @body.json`。瀏覽器 `fetch` 不受影響

### 後台

- **觸控裝置不能拖拉排序**（瀏覽器原生拖放不支援），手機用改編號或 ↑↓
- 選了狀態或分類時的編號是「列出來的這些」的順序，不是整份順序；首頁精選與作品集「全部」的順序要兩排都切到「全部」排
- 分類改名、刪除、排序都在「管理分類」；作品表單只能選已存在的分類。沒有上架作品的分類不會出現在前台
- 上傳的圖一律被轉成 JPG、長邊最多 1280；透明背景會被墊成深色

### 本機開發

- 用 AI 工具開關 dev server 時，只結束佔用連接埠的程序不夠，`wrangler` 主程序會留在背景。收工時確認沒有殘留的 `node` / `workerd` 程序

### 版面

- `masonry.js` 是有限往前看：照順序放卡，每一步只在接下來 3 張裡挑，視覺順序最多和後台順序差 2–3 格。不要改回全域挑卡
- 新增分類後若名稱很長，注意卡片上的絕對定位標籤會不會互相重疊，也看一下後台分類按鈕列與前台篩選列的換行

---

## 下次可以接著做的

### 內容後台（規劃見 `作品後台規劃_20261012.md`）

- [x] 第 1 階段：作品管理 — 已上線
- [ ] 第 2 階段：R2 圖片上傳 — **作品封面已上線**；案例 logo、本人照片還沒接（等第 3、4 階段要用時在 `MEDIA_FOLDERS` 加資料夾）
- [ ] 第 3 階段：案例管理（`cases.js` 搬進 D1，代表作從作品清單勾選）。做完後刪除檢查改成直接查資料庫
- [ ] 第 4 階段：文案（`site_settings`，白名單欄位，HTMLRewriter 注入）。開工前先跟客戶列出要開放的欄位

### 等客戶回饋

- 10/15 原訂給客戶測試，實際上客戶 10/13 就開始用了。收集他用後台的問題（手機操作、上傳、排序）再決定要不要調整

### 文件

- [ ] `CLAUDE.md` 改過了（§2、§5、§6、§6.5、§7），**要重新上傳覆蓋 claude.ai 專案知識庫那一份**

### 其他

1. 確認 admin 密碼已換（或接 Cloudflare Access）
2. 把上面 🟡 那批佔位內容補完
