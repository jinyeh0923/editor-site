# HANDOVER — 接續開發說明

> 最後更新：2026-10-08
> 這份是「下次開工前先看」的狀態紀錄。架構與程式慣例看 `CLAUDE.md`，上線前的內容清單看 `CONTENT-CHECKLIST.md`，這裡不重複。

---

## ⚠️ 開工前第一件事

```bash
git pull
```

**這個專案有兩台電腦在改：**

| 電腦 | 路徑 |
| --- | --- |
| A | `C:\Users\User\code\editor-site`（本機） |
| B | `C:\Users\Meow\editor-site` |

2026-10-07 踩過一次坑：B 電腦在 7/01–7/02 做了四個 commit 並部署上線，但 A 電腦從沒 `pull`。結果 A 的本機程式碼比線上還舊，差點直接 `deploy` 把線上較新的首頁蓋掉（首頁案例區的資料驅動改版、`home.css` 168 行樣式、`works.js` 整套 id 重新命名）。

最後是把線上檔案抓下來做三方合併才救回。**不要再讓這件事發生——動手前先 pull，收工後 commit + push。**

---

## 目前狀態（三邊同步）

| | 版本 |
| --- | --- |
| 本機 `main` | `a3c4794` |
| GitHub `origin/main` | `a3c4794`（同步） |
| Cloudflare 線上 | `c144f3c4-32bb-430e-9fd1-ad59cb25e9af` |

線上網址：https://editor-site.editor-vincent.workers.dev
GitHub：https://github.com/jinyeh0923/editor-site

工作目錄乾淨，線上與本機 `public/` 逐字元一致。

### 資料統計

```
作品     56 筆（可點 53 / 不可點 3 / 首頁精選 10）
  賽事紀錄與運動社群經營   21
  商業品牌短影音          14
  活動紀錄與日常           9
  個人 IP 影音製作        12
封面圖   39 張 / 3.68 MB（全部 9:16、全部 <150KB）
案例     3 則（case-attackline / case-vlab / case-beauty）
```

---

## 2026-10-08 這次做了什麼

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
- `masonry.js`：支援 `data-pin`，把置頂卡提到每個排列候選最前面
- `work.html`：篩選按鈕照 `WORK_CATS` 排序、「全部」移到最後、預設選第一個分類
- `wrangler.jsonc`：寫死 `account_id`

### 圖片
- 新增 14 張封面（`reel-26` ~ `reel-39`）
- 壓縮 13 張過大的圖，4.51MB → 3.68MB

---

## 常用指令

```bash
npm run dev        # 本機 http://127.0.0.1:8787
npm run deploy     # 部署（account_id 已寫在 wrangler.jsonc，不用再帶環境變數）

npm run db:local   # 本機套用 schema.sql
npm run db:remote  # 線上套用 schema.sql

npx wrangler login              # token 過期時（必須在真正的終端機跑，非互動環境起不來）
npx wrangler secret put ADMIN_PASSWORD
npx wrangler deployments list   # 看部署歷史
```

### 後台

- 網址 `/admin`，帳號固定 **`admin`**（寫死在 `src/index.js:117`）
- 本機密碼在 `.dev.vars`
- **線上密碼是 Cloudflare secret，唯寫、無法讀取**，忘了只能 `wrangler secret put` 重設（立即生效，不用重新部署）

---

## 待辦

### 🔴 安全（優先）

- [ ] **換掉線上 `ADMIN_PASSWORD`** — 目前與本機開發用的是同一組弱密碼。`/admin` 後面是 D1 裡的訪客個資（姓名 / Email / 需求內容），Basic Auth 沒有嘗試次數限制
  - 或改用 **Cloudflare Access**（Google 帳號登入、免密碼、可設定誰能存取，免費額度 50 人）

### 🟡 上線前必改（詳見 `CONTENT-CHECKLIST.md`）

- [ ] **Turnstile 還是官方測試金鑰** `1x00000000000000000000AA`（`index.html` / `contact.html` 兩處）
      — 換真實 Site Key 時要同步 `wrangler secret put TURNSTILE_SECRET`，兩者必須成對
- [ ] **首頁 showreel** `data-yt="SHOWREEL_ID"`（`index.html:65`）還是佔位
- [ ] **`partials.js` 的 `YT = "#"`** 還沒填真實頻道網址
      — 填好後要同步更新 `index.html` JSON-LD 的 `sameAs`
- [ ] **`index.html` 聯絡區有 2 個 `href="#"`** 的社群連結
- [ ] **`posters/og-cover.jpg` 不存在**（1200×630）— 分享到社群沒有預覽圖
- [ ] **買正式網域**後全站替換 base URL（OG canonical / sitemap），目前是 `editor-site.editor-vincent.workers.dev`

### 🟢 內容待補

- [ ] **17 筆 `dur`（長度）留空**（新增的 18 筆裡除了 `yt-tpvl-3` 之外全部）— 留空不會破版，只是卡片少一個標籤
- [ ] `yt-rotary-1` / `yt-rotary-2` 標題都是「台北松仁扶輪社」，`reels-tpvl-1~3` 與 `reels-myjapantour-1~3` 也各自同名 — 牆上並排會像同一支，要區分的話補副標
- [ ] 首頁 `.stats` 數字（200+ / 30+ / 1000萬+）還是佔位

### 🔵 可做可不做

- [ ] `work.css` 的 `.w .ov p` 已是死樣式（`role` 移除後不再輸出 `<p>`）
- [ ] `_headers` 的 CSP `script-src` 還留著 `https://cdn.jsdelivr.net`，但 Lenis 已自架，可收緊
- [ ] `works.js` 卡片上的 `data-cat` 屬性目前沒有程式讀取（篩選用的是按鈕自己的 `data-cat`）

---

## 這個專案的地雷（`CLAUDE.md` §8 之外的補充）

### 部署

- **兩個 Cloudflare 帳號**：`Lyrayeh0@gmail.com`（專案在這）、`Tonyyeh080586@gmail.com`。`account_id` 已寫進 `wrangler.jsonc`，但**交接給客戶時要換成客戶帳號的 ID**
- 非互動環境（CI / AI 工具）跑 `wrangler login` 會失敗，要在真正的終端機登入，或改用 `CLOUDFLARE_API_TOKEN`

### 資料

- **`works.js` 的 `id` 是 `cases.js` 的外鍵**。改 id 一定要同步 `cases.js` 的 `works: [...]`，否則案例頁的代表作品會整區消失（只會 `console.warn`，畫面無聲壞掉）
- id 命名採頻道前綴制：`yt-` 橫式長片、`shorts-` 直式 Shorts、`reels-` IG Reels，後面接頻道/帳號 + 流水號。新增作品照這個慣例，表在 `works.js` 檔頭
- **IG 連結會失效**（帳號關閉、貼文刪除）。遇到就把 `url` 設為 `""`，卡片會自動變成不可點的 `div`，封面與觀看數保留。記得補 `tag`（沒有 url 判不出平台，會標成「影片」）
- IG 分享連結的 `?stkn=` 是會過期的 token，存進 `works.js` 前先清掉

### 版面

- `masonry.js` 會試 6 種排列候選挑欄高最平衡的，**DOM 順序 ≠ 視覺順序**。要固定某張卡在左上角，用 `pin: true`
- 新增分類後若名稱很長，注意卡片上的絕對定位標籤會不會互相重疊（之前 `.cat-tag` 就撞到左上角的 `.badge`，後來整個拿掉了）

---

## 下次可以接著做的

1. **換掉 admin 密碼**（或接 Cloudflare Access）— 最優先
2. 把上面 🟡 那批佔位內容補完，就能交給客戶看了
3. 補 `dur` 與重複標題
