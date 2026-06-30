# 上線前內容清單（上傳到專案知識庫）

目前站上多為佔位內容（範例 ID、示意數據、example.com）。對客戶正式上線前逐項換成真實內容。

## 必填

### 作品（js/works.js 的 WORKS）

- [ ] 每筆換真實 `url`（YouTube 或 Instagram reel 連結）
- [ ] IG 作品：放 `poster:"posters/檔名.jpg"`（截 Reel 封面 9:16）—IG 無法自動抓縮圖
- [ ] 每筆 `dur`（長度）手填；`cat`/`title`/`role` 確認
- [ ] 移除範例筆數、補真實作品（>16 筆自動啟用載入更多）

### 圖片（posters/）

- [ ] 本人照片（首頁「關於剪輯者」，4:5 直式）
- [ ] 案例封面（cases/case1，9:16）
- [ ] IG 作品封面（對應 works.js 的 poster）

### 聯絡資訊（js/partials.js 最上面）

- [ ] `EMAIL` / `YT` / `IG` 換真實值；各處 tonyyeh080586@gmail.com、`#` 連結一併確認

### 首頁其他

- [ ] Showreel：`.reel` 的 `data-yt="影片ID"`
- [ ] 「關於剪輯者」文案照客戶口吻
- [ ] `.stats` 數字（佔位 200+/30+/1000萬+）換真實

### 案例（cases.html / case1.html）

- [ ] 標題/挑戰/做法換真實
- [ ] 成效數字目前標「示意」—上線前換真實或拿掉

## 啟用 Turnstile

- [ ] Cloudflare 後台建 widget，取得 Site Key + Secret
- [ ] index.html、contact.html 的 `data-sitekey` 換真實 Site Key（兩處）
- [ ] `wrangler secret put TURNSTILE_SECRET`
- [ ] ⚠️ Site Key 與 Secret 要一起換

## 帳號 / 網域

- [ ] 申請正式網域（年費為客戶成本）
- [ ] 網域與 Cloudflare 帳號建在客戶名下，開發者以成員協作
- [ ] 設定強度足夠的 ADMIN_PASSWORD（或改用 Cloudflare Access）
- [ ] **買網域後，全站搜尋替換 base URL（OG canonical / sitemap）**
      目前值：`https://editor-site.editor-vincent.workers.dev`
      搜尋範圍：index / work / cases / case1 / contact 的 `<head>`，以及 `sitemap.xml`

## SEO / 分享卡片

- [ ] 補 `posters/og-cover.jpg`（1200×630，深色背景，含薯餅名稱與定位文字）— OG 分享預覽圖
- [ ] 確認並修改各頁標 `[待客戶確認]` 的 `<title>` 與 `<meta description>` / OG / Twitter 文案
      （index / work / cases / case1 / contact 五頁）
- [ ] `partials.js` 的 `YT` 補上真實 YouTube 頻道網址後，
      同步更新 `index.html` JSON-LD 的 `sameAs` 加入 YT 連結

## 上線前最後檢查

- [ ] 桌機/平板/手機三寬度正常
- [ ] 實際送一筆表單，確認 /admin 看得到
- [ ] 手機抽屜、email 彈窗、篩選、載入更多、masonry 都正常
- [ ] DevTools→Network 確認 \_headers 安全標頭生效
