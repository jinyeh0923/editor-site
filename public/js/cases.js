/* 社群實操案例資料。
   案例欄位（選填欄位空值或空陣列時不顯示任何 HTML）：
     id       唯一識別碼
     featured true → case1.html 用強調版式
     logo     logo 圖片路徑（選填）
     name     客戶帳號名稱
     handle   社群帳號（選填）
     kind     頻道定位標籤（mono 小標）
     tagline  定位 slogan（選填）
     follows  [{platform, value}]  platform: "IG"/"YT"/"FB"/"TikTok"
     summary  一句話描述（選填）
     highlights [{icon, title, desc}]  icon: "talk"/"target"/"growth"/"views"（選填）
     metrics  [{label, value}]（選填）
     works    works.js 的 id 陣列（找不到時 console.warn 略過）
*/
window.CASES = [
  {
    id: "case-attackline",
    featured: true,
    logo: "posters/logos/attackline.jpg",
    name: "ATTACKLINE 三米線",
    handle: "@atlsanmixian",
    kind: "運動頻道 · YouTube + IG Reels",
    tagline: "每週分享實用排球技巧",
    follows: [
      { platform: "IG", value: "1.7萬" },
      { platform: "FB", value: "8K" },
    ],
    summary: "排球教學、迷因、技術挑戰，創造社群話題。",
    highlights: [
      {
        icon: "talk",
        title: "創造社群話題",
        desc: "NPC 場館開箱，udn、ETtoday 等多家主流媒體轉發分享。",
      },
      {
        icon: "target",
        title: "精準定位",
        desc: "合作執行 2 個月粉絲增長 1 萬+，短影音第 3 支即破百萬觀看。",
      },
    ],
    metrics: [
      { label: "粉絲增長", value: "1萬+" },
      { label: "單支最高", value: "239萬" },
      { label: "破百萬支數", value: "3支" },
    ],
    works: ["reel-volleyball-meme", "reel-meme-1", "reel-atl-npc"],
  },
  {
    id: "case-vlab",
    logo: "posters/logos/vlab.jpg",
    name: "排球實驗室",
    handle: "@volleyball_lab_1997",
    kind: "運動頻道 · IG Reels + Shorts",
    tagline: "30 秒學習排球技巧",
    follows: [
      { platform: "IG", value: "2.6萬" },
      { platform: "TikTok", value: "5K" },
      { platform: "YT", value: "1K" },
    ],
    summary: "排球賽事精華、戰術分析短片。",
    highlights: [
      { icon: "growth", title: "快速漲粉", desc: "創立首月粉絲數突破 1 萬+。" },
      {
        icon: "views",
        title: "穩定流量",
        desc: "短片平均觀看 40 萬～50 萬次。",
      },
    ],
    metrics: [
      { label: "創立首月粉絲", value: "1萬+" },
      { label: "單支最高", value: "245萬" },
      { label: "平均觀看", value: "40-50萬" },
    ],
    works: ["reel-v-lab1", "reel-v-lab3", "reel-v-lab2"],
  },
  {
    id: "case-tbd",
    name: "（待定）",
    kind: "訪談節目 · YouTube Shorts",
    tagline: "",
    follows: [],
    summary: "內容待補。",
    highlights: [],
    metrics: [],
    works: [],
  },
];

/* ── opts.featuredFirst: true → 第一個 case.featured 用 case-block--featured 版式 ── */
window.renderCases = function (el, opts) {
  opts = opts || {};

  /* 平台 icon（fill="currentColor"，沿用 partials.js 的 ig/yt SVG） */
  var PLATFORM_ICONS = {
    IG: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.2-.25 1.8-.42 2.2a3.7 3.7 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.05-1.8-.25-2.2-.42a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.2.25-1.8.42-2.2.22-.6.5-1 .9-1.4.4-.4.8-.68 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.32-.43.17-.74.37-1.06.7-.32.31-.52.62-.7 1.05-.12.3-.28.8-.32 1.7C3.2 9 3.2 9.4 3.2 12s0 3 .07 4.1c.04.9.2 1.4.32 1.7.17.43.37.74.7 1.06.31.32.62.52 1.05.7.3.12.8.28 1.7.32 1.2.06 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.32.43-.17.74-.37 1.06-.7.32-.31.52-.62.7-1.05.12-.3.28-.8.32-1.7.06-1.2.07-1.6.07-4.7s0-3-.07-4.1c-.04-.9-.2-1.4-.32-1.7a2.8 2.8 0 0 0-.7-1.06 2.8 2.8 0 0 0-1.05-.7c-.3-.12-.8-.28-1.7-.32C15.5 4 15.1 4 12 4Zm0 3.05A4.95 4.95 0 1 1 7.05 12 4.95 4.95 0 0 1 12 7.05Zm0 1.8A3.15 3.15 0 1 0 15.15 12 3.15 3.15 0 0 0 12 8.85Zm5.15-3.3a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z"/></svg>',
    YT: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"/></svg>',
    FB: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    TikTok:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.69a8.16 8.16 0 0 0 4.77 1.52V7.77a4.85 4.85 0 0 1-1-.08z"/></svg>',
  };

  /* highlight icon（stroke，currentColor = var(--accent) 由 CSS 設定） */
  var HIGHLIGHT_ICONS = {
    talk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    target:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    growth:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    views:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  };

  var html = window.CASES.map(function (c, i) {
    var isFeatured = !!(opts.featuredFirst && i === 0 && c.featured);

    /* 頂部：logo（選填）+ kind + name/handle */
    var logoHtml = c.logo
      ? '<img class="cb-logo" src="' +
        c.logo +
        '" alt="' +
        (c.name || "") +
        ' logo" loading="lazy" onerror="this.style.display=\'none\'">'
      : "";
    var topHtml =
      '<div class="cb-top">' +
      logoHtml +
      '<div class="cb-top-info">' +
      '<div class="cb-meta">' +
      (c.kind || "") +
      "</div>" +
      '<div class="cb-header">' +
      "<h3>" +
      (c.name || "") +
      "</h3>" +
      (c.handle ? '<span class="cb-handle">' + c.handle + "</span>" : "") +
      "</div>" +
      "</div>" +
      "</div>";

    /* 定位 slogan */
    var taglineHtml = c.tagline
      ? '<p class="cb-tagline">' + c.tagline + "</p>"
      : "";

    /* 粉絲平台（icon + 數值） */
    var followsHtml = "";
    if (c.follows && c.follows.length) {
      followsHtml =
        '<div class="cb-follows">' +
        c.follows
          .map(function (f) {
            var icon = PLATFORM_ICONS[f.platform] || f.platform;
            return (
              '<span class="cb-follow">' +
              icon +
              "<em>" +
              f.value +
              "</em>" +
              "</span>"
            );
          })
          .join("") +
        "</div>";
    }

    /* 一句話簡介 */
    var summaryHtml = c.summary
      ? '<p class="cb-summary">' + c.summary + "</p>"
      : "";

    /* 亮點卡片（icon + 標題 + 說明） */
    var highlightsHtml = "";
    if (c.highlights && c.highlights.length) {
      highlightsHtml =
        '<div class="cb-highlights">' +
        c.highlights
          .map(function (h) {
            var icon =
              h.icon && HIGHLIGHT_ICONS[h.icon]
                ? '<span class="h-icon">' + HIGHLIGHT_ICONS[h.icon] + "</span>"
                : "";
            return (
              '<div class="cb-highlight">' +
              icon +
              '<div class="h-title">' +
              h.title +
              "</div>" +
              '<p class="h-desc">' +
              h.desc +
              "</p>" +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    }

    /* 數據條 */
    var metricsHtml = "";
    if (c.metrics && c.metrics.length) {
      metricsHtml =
        '<div class="results">' +
        c.metrics
          .map(function (m) {
            return (
              "<div>" +
              '<div class="num"><em>' +
              m.value +
              "</em></div>" +
              '<div class="cap">' +
              m.label +
              "</div>" +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    }

    /* 代表作品 */
    var worksHtml = "";
    if (c.works && c.works.length) {
      var cards = c.works
        .map(function (id) {
          var w = window.workById(id);
          if (!w) {
            console.warn("[cases.js] 找不到 work id:", id);
            return "";
          }
          return window.workCardHTML(w);
        })
        .join("");
      if (cards) {
        worksHtml =
          '<p class="case-works-label">代表作品</p>' +
          '<div class="case-works">' +
          cards +
          "</div>";
      }
    }

    return (
      '<article class="case-block' +
      (isFeatured ? " case-block--featured" : "") +
      ' reveal">' +
      topHtml +
      taglineHtml +
      followsHtml +
      summaryHtml +
      highlightsHtml +
      metricsHtml +
      worksHtml +
      "</article>"
    );
  }).join("");

  el.innerHTML = html;
};
