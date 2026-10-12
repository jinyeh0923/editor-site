// 用法：node gen-seed.cjs <works.js> <輸出 .sql>
const fs = require("fs");
const vm = require("vm");
const [, , src, out] = process.argv;

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(src, "utf8"), sandbox);
const works = sandbox.window.WORKS;

const q = (v) => (v === undefined || v === null || v === "" ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'");
const now = new Date().toISOString();
const cols = "id, url, cat, title, role, dur, views, poster, ratio, tag, home, sort_order, visible, created_at, updated_at";

const ids = new Set();
const lines = works.map((w, i) => {
  if (ids.has(w.id)) throw new Error("重複 id: " + w.id);
  ids.add(w.id);
  const vals = [
    q(w.id),
    "'" + String(w.url || "").replace(/'/g, "''") + "'", // url 為 NOT NULL，空字串照存
    q(w.cat), q(w.title), q(w.role), q(w.dur), q(w.views), q(w.poster), q(w.ratio), q(w.tag),
    w.home ? 1 : 0,
    i + 1,
    1,
    q(now), q(now),
  ];
  return `INSERT OR IGNORE INTO works (${cols}) VALUES (${vals.join(", ")});`;
});

const header = [
  "-- works 初始資料：由 public/js/works.js 的 WORKS 原樣轉出（id 不變，sort_order 照陣列順序）。",
  "-- INSERT OR IGNORE：重跑不會覆蓋後台已修改的資料。",
  "-- 套用（本機）：npx wrangler d1 execute editor-site-db --local --file=./seed-works.sql",
  "",
];
fs.writeFileSync(out, header.concat(lines).join("\n") + "\n");
console.log("works:", works.length, "home:", works.filter((w) => w.home).length, "empty url:", works.filter((w) => !w.url).length);
