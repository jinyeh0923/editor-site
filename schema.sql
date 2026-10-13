-- 訪客表單資料表
CREATE TABLE IF NOT EXISTS submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  video_type TEXT,                          -- 影片類型（表單下拉選單）
  status     TEXT NOT NULL DEFAULT 'new',  -- new / read / replied，之後做標記用
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at);

-- 作品資料表（內容後台第 1 階段，見 CLAUDE.md §6.5）
CREATE TABLE IF NOT EXISTS works (
  id         TEXT PRIMARY KEY,              -- 不可變更：cases 以 workById(id) 參照
  url        TEXT NOT NULL DEFAULT '',      -- 空字串＝不可點擊（帳號已關閉等），否則只允許 YouTube / Instagram
  cat        TEXT NOT NULL,                 -- 分類（作品集頁篩選按鈕）
  title      TEXT,
  role       TEXT,
  dur        TEXT,                          -- 長度，手填
  views      TEXT,                          -- 觀看數，手填
  poster     TEXT,                          -- 封面路徑（IG 必給）
  ratio      TEXT,                          -- 9/16、16/9、1/1；NULL＝前台自動推斷
  tag        TEXT,                          -- NULL＝前台依平台自動標
  home       INTEGER NOT NULL DEFAULT 0,    -- 1＝出現在首頁精選 teaser
  sort_order INTEGER NOT NULL,              -- 小的排前面；↑↓ 交換相鄰兩筆
  visible    INTEGER NOT NULL DEFAULT 1,    -- 0＝下架
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_works_sort_order ON works (sort_order);

-- 作品分類（後台「管理分類」）。works.cat 存的是這裡的 name，改名時兩張表一起改
CREATE TABLE IF NOT EXISTS work_cats (
  name       TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL               -- 小的排前面＝作品集頁篩選按鈕的順序
);
