-- work_cats 的初始資料：建表後跑一次（INSERT OR IGNORE，重跑不會覆蓋後台改過的）。
-- 前 4 筆是原本寫死在 works.js WORK_CATS 的順序；最後一句把 works 裡其他用過的分類補在後面。
INSERT OR IGNORE INTO work_cats (name, sort_order) VALUES
  ('賽事紀錄與運動社群經營', 1),
  ('商業品牌短影音', 2),
  ('活動紀錄與日常', 3),
  ('個人 IP 影音製作', 4);

INSERT OR IGNORE INTO work_cats (name, sort_order)
  SELECT cat, 1000 + MIN(sort_order) FROM works GROUP BY cat;
