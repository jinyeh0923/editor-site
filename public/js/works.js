/* 作品卡片與資料載入（首頁、作品集頁、案例頁共用）。
   作品資料在 D1 的 works 表，由後台 /admin 管理（CLAUDE.md §6.5），前台從 GET /api/works 讀：
     只回傳上架的作品，順序＝後台排的 sort_order。
   每筆欄位：
     id     唯一識別碼，建立後不可變更（cases.js 的 works[] 以它參照）
     url    作品連結，程式自動判斷平台；空字串＝不可點擊（卡片改輸出 div，不產生死連結）
              - YouTube（youtu.be / youtube.com/watch?v= / youtube.com/shorts/）→ 縮圖自動抓，免填 poster
              - Instagram（instagram.com/reel|p|tv/）→ 無法自動抓縮圖，必須給 poster
     cat    分類（見下方 WORK_CATS，自動產生作品集頁篩選按鈕）
     title / dur / views  標題、長度、觀看數，都是手填，空值不顯示
     poster 封面圖路徑（例 "posters/works/reel-1.jpg"）
     ratio  "9/16"、"16/9"、"1/1"；空值自動推斷（reel/shorts→9:16、youtube 長片→16:9）
     tag    卡片左上角標籤；空值依平台自動標（Shorts/Reels/YouTube）
     home   1＝出現在首頁的精選作品 teaser
   作品超過 16 個時，作品集頁自動改成「載入更多」（一次 12 個）。 */

/* loadWorks() 完成後才有內容；在那之前是空陣列 */
window.WORKS = [];

/* 作品集頁篩選按鈕的顯示順序。沒列到的分類（例如後台新增的）會照作品順序補在後面。 */
window.WORK_CATS = [
  "賽事紀錄與運動社群經營",
  "商業品牌短影音",
  "活動紀錄與日常",
  "個人 IP 影音製作",
];

/* ── 資料載入（fetch 後渲染）的共用函式；之後案例、文案改讀 API 也用這兩支 ── */

/* 取 JSON。同一個網址同一頁只抓一次（首頁的作品牆與案例區共用同一份）。 */
window.fetchJSON = (function () {
  var cache = {};
  return function (url) {
    if (!cache[url]) {
      cache[url] = fetch(url, { headers: { Accept: "application/json" } }).then(
        function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        },
      );
    }
    return cache[url];
  };
})();

/* 等資料到了再渲染 el。
     render(data)   成功時呼叫，負責把內容放進 el
     opts.emptyText 資料是空陣列時顯示的文字（不給就照常呼叫 render）
     opts.errorText 讀取失敗時顯示的文字
   失敗或空資料只影響這一區，不讓整頁壞掉。渲染後會接上 .reveal 進場動畫。 */
window.renderWhenLoaded = function (el, promise, render, opts) {
  opts = opts || {};
  function message(text) {
    var p = document.createElement("p");
    p.className = "data-msg";
    p.textContent = text;
    el.innerHTML = "";
    el.appendChild(p);
  }
  return promise
    .then(
      function (data) {
        if (opts.emptyText && Array.isArray(data) && !data.length) {
          message(opts.emptyText);
        } else {
          render(data);
        }
      },
      function (err) {
        console.warn("[renderWhenLoaded] 讀取失敗:", err);
        message(opts.errorText || "內容暫時無法載入，請稍後重新整理。");
      },
    )
    .then(function () {
      // app.js 還沒載入時不用管：它載入後會自己掃一次全頁的 .reveal
      if (window.revealIn) window.revealIn(el);
    });
};

/* 載入作品並填入 window.WORKS（workById 之後才查得到） */
window.loadWorks = function () {
  return window.fetchJSON("/api/works").then(function (list) {
    window.WORKS = list;
    return list;
  });
};

/* HTML 跳脫：作品內容由後台輸入，串進 HTML 前一律過這支 */
window.escHTML = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

/* 依 id 查作品，找不到回 null */
window.workById = function (id) {
  for (var i = 0; i < window.WORKS.length; i++) {
    if (window.WORKS[i].id === id) return window.WORKS[i];
  }
  return null;
};

/* 從 url 判斷平台、縮圖、比例、標籤 */
window.parseWork = function (w) {
  var url = w.url || "";
  var yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/,
  );
  var igReel = /instagram\.com\/reels?\//.test(url);
  var ig = /instagram\.com\/(reels?|p|tv)\//.test(url);

  var platform = "other",
    thumb = w.poster || "",
    thumbFallback = "",
    ratio = w.ratio,
    tag = w.tag;
  if (yt) {
    platform = "youtube";
    var isShort = url.indexOf("/shorts/") > -1;
    // 範例佔位 ID（VIDEO_ID…）不去抓縮圖，避免破圖
    var real = yt[1].indexOf("VIDEO_ID") !== 0;
    // 主圖用高解析 maxres
    thumb =
      w.poster ||
      (real
        ? "https://img.youtube.com/vi/" + yt[1] + "/maxresdefault.jpg"
        : "");
    // maxres 不存在時的退路（只有在沒給 poster、且是真實 ID 時才需要）
    thumbFallback =
      real && !w.poster
        ? "https://img.youtube.com/vi/" + yt[1] + "/hqdefault.jpg"
        : "";
    ratio = ratio || (isShort ? "9/16" : "16/9");
    tag = tag || (isShort ? "Shorts" : "YouTube");
  } else if (ig) {
    platform = "instagram";
    ratio = ratio || (igReel ? "9/16" : "1/1");
    tag = tag || (igReel ? "Reels" : "IG");
    // thumb 維持 w.poster（IG 無法自動抓）
  }
  if (!ratio) ratio = "9/16";
  return {
    platform: platform,
    href: url || "#",
    thumb: thumb,
    thumbFallback: thumbFallback,
    ratio: ratio,
    tag: tag || "影片",
  };
};

window.workCardHTML = function (w) {
  var p = window.parseWork(w);
  var rClass = p.ratio === "16/9" ? "r169" : p.ratio === "1/1" ? "r11" : "r916";
  // title / dur / views 都可留空：空值一律不輸出標籤，避免 "undefined" 與空殼元素
  // 內容來自後台輸入 → 串進 HTML 前全部跳脫
  var esc = window.escHTML;
  var title = esc(w.title || "");
  var alt = title || esc(w.cat) || "作品封面";

  var media;
  if (p.thumb) {
    var onerr = p.thumbFallback
      ? "if(this.dataset.fb){this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='grid'}else{this.dataset.fb=1;this.src='" +
        p.thumbFallback +
        "'}"
      : "this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='grid'";
    media =
      '<img src="' +
      esc(p.thumb) +
      '" alt="' +
      alt +
      '" loading="lazy" onerror="' +
      onerr +
      '"><div class="ph" style="display:none">' +
      alt +
      "</div>";
  } else {
    media =
      p.platform === "instagram"
        ? '<div class="ph">IG 作品<br>請放 poster 封面圖</div>'
        : '<div class="ph">放連結或 poster</div>';
  }

  var dur = w.dur ? '<span class="dur">' + esc(w.dur) + "</span>" : "";
  var views = w.views
    ? '<span class="views">▶ ' + esc(w.views) + "</span>"
    : "";
  // title 空 → 整個 .ov 不輸出（否則 hover 會蓋上一層空的漸層）
  var ov = title ? '<div class="ov"><h3>' + title + "</h3></div>" : "";
  // 沒有 url（例如帳號已關閉、只留封面與數據）→ 輸出 div 而非 <a href="#">，避免死連結
  var isLink = p.href && p.href !== "#";
  var open = isLink
    ? '<a class="w" href="' +
      esc(p.href) +
      '" target="_blank" rel="noopener noreferrer"'
    : '<div class="w"';
  var close = isLink ? "</a>" : "</div>";
  return (
    open +
    ' data-cat="' +
    esc(w.cat) +
    '" data-platform="' +
    p.platform +
    '">' +
    '<div class="media ' +
    rClass +
    '">' +
    media +
    '<span class="badge">' +
    esc(p.tag) +
    "</span>" +
    dur +
    views +
    ov +
    "</div>" +
    close
  );
};

/* append=true 時附加（給「載入更多」），否則整批取代 */
window.renderWork = function (el, list, append) {
  var html = list.map(window.workCardHTML).join("");
  if (append) el.insertAdjacentHTML("beforeend", html);
  else el.innerHTML = html;
};
