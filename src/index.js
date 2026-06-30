// Cloudflare Worker 進入點。
// 1) 收表單寫進 D1（含驗證）  2) 後台資料 JSON API  3) 後台頁面 admin.html（需登入）  4) 其餘靜態檔。

const LIMITS = { name: 100, email: 254, message: 5000 };
const VIDEO_TYPES = [
  "短影音（Shorts / Reels）",
  "長片 / YouTube 影片",
  "社群短影音經營",
  "品牌 / 商業合作",
  "都想了解",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }
    if (url.pathname === "/api/admin/submissions") {
      return handleAdminData(request, env);
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

// ---- helpers ----
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
