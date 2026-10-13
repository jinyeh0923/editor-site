// Cloudflare Worker 進入點。
// 1) 收表單寫進 D1（含驗證）  2) 後台資料 JSON API  3) 後台頁面 admin.html（需登入）
// 4) 作品 works、作品分類 cats：公開讀取 + 後台增刪改排序  5) 圖片 media：後台上傳到 R2、/media/* 公開讀取
// 6) 其餘靜態檔。

const LIMITS = { name: 100, email: 254, message: 5000 };
const VIDEO_TYPES = [
  "短影音（Shorts / Reels）",
  "長片 / YouTube 影片",
  "社群短影音經營",
  "品牌 / 商業合作",
  "都想了解",
];

const WORK_LIMITS = { url: 300, cat: 40, title: 120, role: 60, dur: 12, views: 20, poster: 200, ratio: 5, tag: 20 };
const WORK_RATIOS = ["9/16", "16/9", "1/1"];
const WORK_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
// posters/＝開發者放進網站的圖檔；media/＝後台上傳到 R2 的圖
const POSTER_RE = /^(posters|media)\/[\w\-./]+\.(jpe?g|png|webp|avif)$/i;

// 圖片上傳（R2）。後台會先在瀏覽器縮圖再送，正常只有一兩百 KB。
const MEDIA_MAX = 2 * 1024 * 1024;
const MEDIA_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MEDIA_FOLDERS = ["works"]; // 之後案例 logo、本人照片各加一個資料夾
const MEDIA_KEY_RE = /^[a-z]+\/[A-Za-z0-9-]+\.(jpg|png|webp)$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }
    if (url.pathname === "/api/admin/submissions") {
      return handleAdminData(request, env);
    }
    // 內容後台（CLAUDE.md §6.5）：公開讀取 /api/<資源>，後台 /api/admin/<資源>
    if (url.pathname === "/api/works") {
      return handlePublicWorks(request, env);
    }
    if (url.pathname === "/api/admin/works" || url.pathname.startsWith("/api/admin/works/")) {
      return handleAdminWorks(request, env, url);
    }
    if (url.pathname === "/api/cats") {
      return handlePublicCats(request, env);
    }
    if (url.pathname === "/api/admin/cats" || url.pathname === "/api/admin/cats/reorder") {
      return handleAdminCats(request, env, url);
    }
    if (url.pathname === "/api/admin/media") {
      return handleAdminMedia(request, env, url);
    }
    if (url.pathname.startsWith("/media/")) {
      return handleMedia(request, env, url);
    }
    // 後台頁面：先過 Basic Auth，再交出設計好的 admin.html
    // 注意：要抓「不帶 .html」的 /admin，否則資源層會把 /admin.html 轉址回 /admin → 無限迴圈
    if (url.pathname === "/admin" || url.pathname === "/admin.html") {
      if (!authed(request, env)) return needAuth();
      return env.ASSETS.fetch(new Request(new URL("/admin", url), request));
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  // 擋過大的 body（DoS / 灌爆）
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 64 * 1024) return new Response("payload too large", { status: 413 });

  let form;
  try { form = await request.formData(); }
  catch { return new Response("bad request", { status: 400 }); }

  // 蜜罐：機器人才會填這個隱藏欄位。中了就假裝成功、直接丟掉。
  if (form.get("website")) {
    return Response.redirect(new URL("/thanks", request.url), 303);
  }
  // 個資同意（前端會擋，伺服器端再擋一次，避免繞過）
  if (!form.get("consent")) {
    return new Response("需先同意個資說明", { status: 400 });
  }

  // Turnstile 防灌：只有設了 TURNSTILE_SECRET 才啟用；沒設前略過，不影響現況。
  if (env.TURNSTILE_SECRET) {
    const token = (form.get("cf-turnstile-response") || "").toString();
    const ok = await verifyTurnstile(token, env.TURNSTILE_SECRET, request.headers.get("CF-Connecting-IP"));
    if (!ok) return new Response("驗證失敗，請重新整理再送出一次", { status: 403 });
  }

  const name = clip(form.get("name"), LIMITS.name);
  const email = clip(form.get("email"), LIMITS.email);
  const message = clip(form.get("message"), LIMITS.message);
  let videoType = (form.get("video_type") || "").toString().trim();
  if (!VIDEO_TYPES.includes(videoType)) videoType = ""; // 不在白名單就清空

  if (!name || !email || !message) {
    return new Response("缺少必填欄位", { status: 400 });
  }
  if (!isEmail(email)) {
    return new Response("Email 格式不正確", { status: 400 });
  }

  // 參數化查詢（.bind）→ 不可能 SQL injection
  await env.DB.prepare(
    "INSERT INTO submissions (name, email, message, video_type, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(name, email, message, videoType, new Date().toISOString()).run();

  return Response.redirect(new URL("/thanks", request.url), 303);
}

async function handleAdminData(request, env) {
  if (!authed(request, env)) return needAuth();
  const { results } = await env.DB.prepare(
    "SELECT id, name, email, message, video_type, status, created_at FROM submissions ORDER BY created_at DESC"
  ).all();
  return Response.json(results, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

// ---- 作品 works ----
async function handlePublicWorks(request, env) {
  if (request.method !== "GET") return json({ error: "method not allowed" }, 405);
  const { results } = await env.DB.prepare(
    "SELECT id, url, cat, title, role, dur, views, poster, ratio, tag, home FROM works WHERE visible = 1 ORDER BY sort_order, id"
  ).all();
  return Response.json(results, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function handleAdminWorks(request, env, url) {
  if (!authed(request, env)) return needAuth();
  const method = request.method;
  // /api/admin/works → ""；/api/admin/works/<id> → "<id>"
  let rest;
  try { rest = decodeURIComponent(url.pathname.slice("/api/admin/works".length).replace(/^\//, "")); }
  catch { return json({ error: "bad request" }, 400); }

  if (rest === "") {
    if (method === "GET") return listWorks(env);
    if (method === "POST") return createWork(request, env);
    return json({ error: "method not allowed" }, 405);
  }
  if (rest === "reorder") {
    if (method === "POST") return reorderWork(request, env);
    return json({ error: "method not allowed" }, 405);
  }
  if (!WORK_ID_RE.test(rest)) return json({ error: "找不到這筆作品" }, 404);
  if (method === "PUT") return updateWork(request, env, rest);
  if (method === "DELETE") return deleteWork(request, env, rest);
  return json({ error: "method not allowed" }, 405);
}

async function listWorks(env) {
  const { results } = await env.DB.prepare("SELECT * FROM works ORDER BY sort_order, id").all();
  return json(results);
}

async function createWork(request, env) {
  const body = await readJson(request);
  if (body.error) return json({ error: body.error }, body.status);

  const v = validateWork(body.data, {});
  if (v.error) return json({ error: v.error }, 400);
  const w = v.work;
  if (!(await catExists(env, w.cat))) return json({ error: "沒有這個分類，請先到「管理分類」新增：" + w.cat }, 400);

  let id = body.data.id == null ? "" : String(body.data.id).trim();
  if (!id) id = idFromUrl(w.url);
  if (!id) return json({ error: "沒有連結的作品必須自己填 id" }, 400);
  // "reorder" 是 /api/admin/works/reorder 的路徑，不能當 id
  if (!WORK_ID_RE.test(id) || id === "reorder") {
    return json({ error: "id 只能用英數、連字號、底線，最多 64 字" }, 400);
  }

  const dup = await env.DB.prepare("SELECT id FROM works WHERE id = ?").bind(id).first();
  if (dup) return json({ error: "這個 id 已經存在：" + id }, 409);

  // 新作品排最前面：目前最小的 sort_order 再減 1
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO works (id, url, cat, title, role, dur, views, poster, ratio, tag, home, sort_order, visible, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MIN(sort_order), 1) - 1 FROM works), ?, ?, ?)`
  ).bind(id, w.url, w.cat, w.title, w.role, w.dur, w.views, w.poster, w.ratio, w.tag, w.home, w.visible, now, now).run();

  return json(await env.DB.prepare("SELECT * FROM works WHERE id = ?").bind(id).first(), 201);
}

// 只更新有送來的欄位（例如下架只送 { visible: 0 }）；id 不可變更
async function updateWork(request, env, id) {
  const body = await readJson(request);
  if (body.error) return json({ error: body.error }, body.status);
  if (body.data.id != null && String(body.data.id) !== id) {
    return json({ error: "id 不可變更" }, 400);
  }

  const cur = await env.DB.prepare("SELECT * FROM works WHERE id = ?").bind(id).first();
  if (!cur) return json({ error: "找不到這筆作品" }, 404);

  const v = validateWork(body.data, cur);
  if (v.error) return json({ error: v.error }, 400);
  const w = v.work;
  // 只在換分類時檢查（下架等局部更新不用多查一次）
  if (w.cat !== cur.cat && !(await catExists(env, w.cat))) {
    return json({ error: "沒有這個分類，請先到「管理分類」新增：" + w.cat }, 400);
  }

  await env.DB.prepare(
    `UPDATE works SET url = ?, cat = ?, title = ?, role = ?, dur = ?, views = ?, poster = ?, ratio = ?, tag = ?,
     home = ?, visible = ?, updated_at = ? WHERE id = ?`
  ).bind(w.url, w.cat, w.title, w.role, w.dur, w.views, w.poster, w.ratio, w.tag, w.home, w.visible, new Date().toISOString(), id).run();

  return json(await env.DB.prepare("SELECT * FROM works WHERE id = ?").bind(id).first());
}

async function deleteWork(request, env, id) {
  const cur = await env.DB.prepare("SELECT id FROM works WHERE id = ?").bind(id).first();
  if (!cur) return json({ error: "找不到這筆作品" }, 404);

  // 被案例當代表作的作品不能刪（否則案例頁會少一張卡）
  const refs = await caseRefs(request, env);
  if (!refs) return json({ error: "無法確認案例引用（讀不到或解析不了 cases.js），為安全起見不刪除" }, 503);
  const usedBy = refs.filter((c) => c.works.includes(id)).map((c) => c.name);
  if (usedBy.length) {
    return json({ error: "這筆作品被案例使用中，請先從案例移除：" + usedBy.join("、"), cases: usedBy }, 409);
  }

  await env.DB.prepare("DELETE FROM works WHERE id = ?").bind(id).run();
  return json({ ok: true, id });
}

// 案例目前還在前端的 public/js/cases.js（第 3 階段搬進 D1 後，這裡改成直接查詢）。
// 做法：讀檔案文字，抓每個 `works: [...]` 與它前面最近的 `name: "..."`。
// 依賴 cases.js 現有寫法（name 在 works 之前、陣列是字串字面值）；被註解掉的 id 也算引用（偏保守）。
// 讀不到或一個都解析不出來 → 回 null，由呼叫端擋下刪除。
async function caseRefs(request, env) {
  let text;
  try {
    const r = await env.ASSETS.fetch(new Request(new URL("/js/cases.js", request.url)));
    if (!r.ok) return null;
    text = await r.text();
  } catch {
    return null;
  }
  const refs = [];
  const re = /\bworks:\s*\[([^\]]*)\]/g;
  let m, from = 0;
  while ((m = re.exec(text))) {
    const names = [...text.slice(from, m.index).matchAll(/\bname:\s*(["'])(.*?)\1/g)];
    refs.push({
      name: names.length ? names[names.length - 1][2] : "（未命名案例）",
      works: [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]),
    });
    from = re.lastIndex;
  }
  return refs.length ? refs : null;
}

// 排序，兩種用法：
//   { ids: [...] }       拖拉 / 指定編號：送整份順序，sort_order 重編成 1..N
//   { id, dir: "up"|"down" }  ↑↓：與相鄰那筆交換 sort_order（相鄰＝後台列表的順序，含已下架的）
async function reorderWork(request, env) {
  const body = await readJson(request, 256 * 1024); // 整份 id 清單，作品多時會超過預設上限
  if (body.error) return json({ error: body.error }, body.status);
  if (body.data.ids !== undefined) return reorderAll(env, body.data.ids);
  const id = String(body.data.id || "");
  const dir = body.data.dir;
  if (dir !== "up" && dir !== "down") return json({ error: "dir 必須是 up 或 down" }, 400);

  const cur = await env.DB.prepare("SELECT id, sort_order FROM works WHERE id = ?").bind(id).first();
  if (!cur) return json({ error: "找不到這筆作品" }, 404);

  const other = await env.DB.prepare(
    dir === "up"
      ? "SELECT id, sort_order FROM works WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1"
      : "SELECT id, sort_order FROM works WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1"
  ).bind(cur.sort_order).first();
  if (!other) return json({ ok: true, moved: false }); // 已經在最前 / 最後

  // batch＝同一個交易，不會只換到一半
  const now = new Date().toISOString();
  const set = "UPDATE works SET sort_order = ?, updated_at = ? WHERE id = ?";
  await env.DB.batch([
    env.DB.prepare(set).bind(other.sort_order, now, cur.id),
    env.DB.prepare(set).bind(cur.sort_order, now, other.id),
  ]);
  return json({ ok: true, moved: true, swapped_with: other.id });
}

// ids 必須剛好是目前全部作品（不多不少、不重複）。對不上代表後台列表是舊的
// （例如另一個分頁剛新增或刪除過），回 409 讓前端重新整理，不要用舊清單蓋掉順序。
async function reorderAll(env, ids) {
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
    return json({ error: "ids 必須是作品 id 的陣列" }, 400);
  }
  const { results } = await env.DB.prepare("SELECT id, sort_order FROM works").all();
  const current = new Map(results.map((r) => [r.id, r.sort_order]));
  const stale = ids.length !== current.size || new Set(ids).size !== ids.length || ids.some((x) => !current.has(x));
  if (stale) return json({ error: "作品清單已經變動，請重新整理後再排序" }, 409);

  // 只更新位置真的有變的；batch＝同一個交易
  const now = new Date().toISOString();
  const stmts = [];
  ids.forEach((id, i) => {
    if (current.get(id) !== i + 1) {
      stmts.push(env.DB.prepare("UPDATE works SET sort_order = ?, updated_at = ? WHERE id = ?").bind(i + 1, now, id));
    }
  });
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true, changed: stmts.length });
}

// 把送來的欄位疊在現有資料（新增時為空物件）上再整筆驗證
function validateWork(input, cur) {
  const pick = (k) => (input[k] !== undefined ? input[k] : cur[k]);
  const w = {};
  for (const k of ["url", "cat", "title", "role", "dur", "views", "poster", "ratio", "tag"]) {
    const raw = pick(k);
    const s = raw == null ? "" : String(raw).trim();
    if (s.length > WORK_LIMITS[k]) return { error: k + " 太長（上限 " + WORK_LIMITS[k] + " 字）" };
    w[k] = s;
  }
  if (!w.cat) return { error: "缺少分類 cat" };
  if (w.url && !parseWorkUrl(w.url)) return { error: "url 只接受 YouTube 或 Instagram 的作品連結（https）" };
  if (w.poster && (!POSTER_RE.test(w.poster) || w.poster.includes(".."))) {
    return { error: "封面必須是上傳的圖片，或 posters/ 底下的圖檔路徑" };
  }
  if (w.ratio && !WORK_RATIOS.includes(w.ratio)) return { error: "ratio 只能是 " + WORK_RATIOS.join("、") };

  for (const k of ["home", "visible"]) {
    const raw = pick(k);
    const def = k === "visible" ? 1 : 0;
    if (raw === undefined || raw === null) w[k] = def;
    else if (raw === true || raw === 1) w[k] = 1;
    else if (raw === false || raw === 0) w[k] = 0;
    else return { error: k + " 只能是 0 / 1" };
  }
  // url 是 NOT NULL（空字串＝不可點擊）；其他選填欄位空的存 NULL
  for (const k of ["title", "role", "dur", "views", "poster", "ratio", "tag"]) {
    if (!w[k]) w[k] = null;
  }
  return { work: w };
}

// 只認 https 的 YouTube / Instagram 作品連結，回傳平台與影片代碼；不符回 null
// （比對規則與 public/js/works.js 的 parseWork 一致）
function parseWorkUrl(s) {
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www|m)\./, "");
  let m;
  if (host === "youtu.be") {
    m = u.pathname.match(/^\/([\w-]{6,})/);
    return m ? { prefix: "yt", code: m[1] } : null;
  }
  if (host === "youtube.com") {
    if ((m = u.pathname.match(/^\/shorts\/([\w-]{6,})/))) return { prefix: "shorts", code: m[1] };
    if ((m = u.pathname.match(/^\/embed\/([\w-]{6,})/))) return { prefix: "yt", code: m[1] };
    const vid = u.pathname === "/watch" ? u.searchParams.get("v") || "" : "";
    return /^[\w-]{6,}$/.test(vid) ? { prefix: "yt", code: vid } : null;
  }
  if (host === "instagram.com") {
    m = u.pathname.match(/^\/(reels?|p|tv)\/([\w-]+)/);
    return m ? { prefix: m[1] === "p" || m[1] === "tv" ? "ig" : "reels", code: m[2] } : null;
  }
  return null;
}
// 沒填 id 時用影片代碼產生（同一支影片重複新增會撞 id 被擋下）
function idFromUrl(s) {
  const p = s ? parseWorkUrl(s) : null;
  return p ? p.prefix + "-" + p.code : "";
}

// ---- 作品分類 work_cats ----
// 分類以名稱為主鍵，works.cat 存的就是名稱；改名時兩張表一起改。
// 名稱可能含空白、斜線等字元，所以寫入一律把名稱放在 JSON body，不放在網址路徑。
async function handlePublicCats(request, env) {
  if (request.method !== "GET") return json({ error: "method not allowed" }, 405);
  const { results } = await env.DB.prepare("SELECT name FROM work_cats ORDER BY sort_order, name").all();
  return Response.json(results.map((r) => r.name), {
    headers: {
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function handleAdminCats(request, env, url) {
  if (!authed(request, env)) return needAuth();
  const method = request.method;
  if (url.pathname.endsWith("/reorder")) {
    if (method === "POST") return reorderCats(request, env);
    return json({ error: "method not allowed" }, 405);
  }
  if (method === "GET") {
    const { results } = await env.DB.prepare("SELECT name FROM work_cats ORDER BY sort_order, name").all();
    return json(results.map((r) => r.name));
  }
  if (method !== "POST" && method !== "PUT" && method !== "DELETE") {
    return json({ error: "method not allowed" }, 405);
  }
  const body = await readJson(request);
  if (body.error) return json({ error: body.error }, body.status);
  const name = catName(body.data.name);
  if (!name) return json({ error: "分類名稱必填，最多 " + WORK_LIMITS.cat + " 字" }, 400);

  if (method === "POST") {
    if (await catExists(env, name)) return json({ error: "這個分類已經存在：" + name }, 409);
    // 新分類排最後面
    await env.DB.prepare(
      "INSERT INTO work_cats (name, sort_order) VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM work_cats))"
    ).bind(name).run();
    return json({ ok: true, name }, 201);
  }

  if (!(await catExists(env, name))) return json({ error: "找不到這個分類：" + name }, 404);

  if (method === "PUT") {
    const to = catName(body.data.rename);
    if (!to) return json({ error: "新名稱必填，最多 " + WORK_LIMITS.cat + " 字" }, 400);
    if (to === name) return json({ ok: true, name });
    if (await catExists(env, to)) return json({ error: "這個分類名稱已經有了：" + to }, 409);
    // batch＝同一個交易：分類與底下的作品一起改名
    await env.DB.batch([
      env.DB.prepare("UPDATE work_cats SET name = ? WHERE name = ?").bind(to, name),
      env.DB.prepare("UPDATE works SET cat = ?, updated_at = ? WHERE cat = ?").bind(to, new Date().toISOString(), name),
    ]);
    return json({ ok: true, name: to });
  }

  // DELETE：還有作品（含已下架）的分類不能刪，避免作品變成沒有分類
  const used = await env.DB.prepare("SELECT COUNT(*) AS n FROM works WHERE cat = ?").bind(name).first();
  if (used.n) {
    return json({ error: "「" + name + "」還有 " + used.n + " 筆作品（含已下架），請先把作品改到其他分類" }, 409);
  }
  await env.DB.prepare("DELETE FROM work_cats WHERE name = ?").bind(name).run();
  return json({ ok: true, name });
}

// names 必須剛好是目前全部分類；對不上代表後台畫面是舊的，回 409
async function reorderCats(request, env) {
  const body = await readJson(request);
  if (body.error) return json({ error: body.error }, body.status);
  const names = body.data.names;
  if (!Array.isArray(names) || names.some((x) => typeof x !== "string")) {
    return json({ error: "names 必須是分類名稱的陣列" }, 400);
  }
  const { results } = await env.DB.prepare("SELECT name FROM work_cats").all();
  const current = new Set(results.map((r) => r.name));
  const stale = names.length !== current.size || new Set(names).size !== names.length || names.some((x) => !current.has(x));
  if (stale) return json({ error: "分類清單已經變動，請重新整理後再排序" }, 409);
  if (names.length) {
    await env.DB.batch(names.map((n, i) => env.DB.prepare("UPDATE work_cats SET sort_order = ? WHERE name = ?").bind(i + 1, n)));
  }
  return json({ ok: true });
}

function catName(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s && s.length <= WORK_LIMITS.cat ? s : "";
}
async function catExists(env, name) {
  return !!(await env.DB.prepare("SELECT name FROM work_cats WHERE name = ?").bind(name).first());
}

// ---- 圖片 media（R2）----
// 公開讀取。檔名是上傳時隨機產生的、內容不會變，所以可以長期快取。
async function handleMedia(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("method not allowed", { status: 405 });
  }
  const key = url.pathname.slice("/media/".length);
  const obj = env.MEDIA && MEDIA_KEY_RE.test(key) ? await env.MEDIA.get(key) : null;
  if (!obj) return new Response("not found", { status: 404 });
  return new Response(request.method === "HEAD" ? null : obj.body, {
    headers: {
      "Content-Type": (obj.httpMetadata && obj.httpMetadata.contentType) || "application/octet-stream",
      "Content-Length": String(obj.size),
      "ETag": obj.httpEtag,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// 上傳：POST /api/admin/media?folder=works，body 就是圖檔本身，Content-Type 是圖片型別。
// 圖片型別跟 application/json 一樣不是「簡單型別」，跨站送不出來（會先被 CORS preflight 擋下），所以同樣擋得住 CSRF。
// 檔名由伺服器產生（不採用使用者的檔名）；回傳的 path 直接存進作品的 poster。
async function handleAdminMedia(request, env, url) {
  if (!authed(request, env)) return needAuth();
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!env.MEDIA) return json({ error: "圖片上傳尚未啟用（沒有 R2）" }, 503);

  const folder = url.searchParams.get("folder") || "";
  if (!MEDIA_FOLDERS.includes(folder)) return json({ error: "folder 不正確" }, 400);
  const type = (request.headers.get("content-type") || "").toLowerCase().split(";")[0].trim();
  const ext = MEDIA_TYPES[type];
  if (!ext) return json({ error: "只接受 JPG、PNG、WebP 圖片" }, 415);
  if (Number(request.headers.get("content-length") || 0) > MEDIA_MAX) {
    return json({ error: "圖片太大（上限 2 MB）" }, 413);
  }

  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: "沒有收到圖片" }, 400);
  if (buf.byteLength > MEDIA_MAX) return json({ error: "圖片太大（上限 2 MB）" }, 413);
  // 內容必須真的是宣告的那種圖檔（看檔頭），不能只信 Content-Type
  if (sniffImage(new Uint8Array(buf.slice(0, 12))) !== type) {
    return json({ error: "檔案內容不是有效的 JPG、PNG、WebP 圖片" }, 400);
  }

  const rand = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const key = folder + "/" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + rand + "." + ext;
  await env.MEDIA.put(key, buf, { httpMetadata: { contentType: type } });
  return json({ path: "media/" + key, size: buf.byteLength }, 201);
}
function sniffImage(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  const s = String.fromCharCode(...b);
  if (s.slice(0, 4) === "RIFF" && s.slice(8, 12) === "WEBP") return "image/webp";
  return "";
}

// ---- helpers ----
function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
// 後台寫入一律收 JSON。要求 Content-Type 是 application/json：
// 跨站表單送不出這個型別（會先被 CORS preflight 擋下），順便防 CSRF。
async function readJson(request, maxBytes = 16 * 1024) {
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    return { error: "Content-Type 必須是 application/json", status: 415 };
  }
  const len = Number(request.headers.get("content-length") || 0);
  if (len > maxBytes) return { error: "payload too large", status: 413 };
  let data;
  try { data = await request.json(); }
  catch { return { error: "JSON 格式錯誤", status: 400 }; }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "JSON 格式錯誤", status: 400 };
  }
  return { data };
}
async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = await r.json();
    return data.success === true;
  } catch {
    return false;
  }
}
function clip(v, max) {
  return (v || "").toString().trim().slice(0, max);
}
function isEmail(s) {
  return s.length <= LIMITS.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}
function authed(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const got = request.headers.get("Authorization") || "";
  const want = "Basic " + btoa("admin:" + env.ADMIN_PASSWORD);
  return safeEqual(got, want);
}
function needAuth() {
  return new Response("需要登入", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"' },
  });
}
// 常數時間比較，降低時序攻擊（猜密碼）的可行性
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
