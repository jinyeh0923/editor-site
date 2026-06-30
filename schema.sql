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
