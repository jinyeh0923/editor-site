/* 共用 nav / footer / email 彈窗。改一次、全站同步。
   每頁 <body data-page="home|work|cases|contact"> 決定 active 與 CTA 行為。
   email 地址、社群連結改這裡即可。 */
(function () {
  var EMAIL = "tonyyeh080586@gmail.com";
  var YT = "#";
  var IG = "https://www.instagram.com/tonyyeh080586/";

  var page = document.body.getAttribute("data-page") || "";
  var ctaHref =
    page === "home"
      ? "#contact"
      : page === "contact"
        ? "#form"
        : "contact.html";

  var links = [
    { href: "work.html", key: "work", label: "作品集" },
    { href: "cases.html", key: "cases", label: "社群實操案例" },
  ];
  var menu = links
    .map(function (l) {
      return (
        '<a href="' +
        l.href +
        '"' +
        (l.key === page ? ' class="active"' : "") +
        ">" +
        l.label +
        "</a>"
      );
    })
    .join("");

  // nav
  var navMount = document.getElementById("site-nav");
  if (navMount) {
    navMount.outerHTML =
      '<nav class="nav"><div class="nav-inner">' +
      '<div class="brand"><a href="index.html">薯餅<span class="dot">.</span></a></div>' +
      '<div class="nav-right">' +
      '<div class="nav-menu" id="menu">' +
      menu +
      "</div>" +
      '<a class="cta" href="' +
      ctaHref +
      '">合作邀約</a>' +
      '<button class="nav-toggle" aria-label="選單" aria-expanded="false"><span></span><span></span><span></span></button>' +
      "</div>" +
      "</div></nav>";
  }

  // 社群 icon（單色，hover 變強調色）
  var ICONS = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7L4 7v1l8 5 8-5V7l-8 5Z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.2-.25 1.8-.42 2.2a3.7 3.7 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.05-1.8-.25-2.2-.42a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.2.25-1.8.42-2.2.22-.6.5-1 .9-1.4.4-.4.8-.68 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.32-.43.17-.74.37-1.06.7-.32.31-.52.62-.7 1.05-.12.3-.28.8-.32 1.7C3.2 9 3.2 9.4 3.2 12s0 3 .07 4.1c.04.9.2 1.4.32 1.7.17.43.37.74.7 1.06.31.32.62.52 1.05.7.3.12.8.28 1.7.32 1.2.06 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.32.43-.17.74-.37 1.06-.7.32-.31.52-.62.7-1.05.12-.3.28-.8.32-1.7.06-1.2.07-1.6.07-4.7s0-3-.07-4.1c-.04-.9-.2-1.4-.32-1.7a2.8 2.8 0 0 0-.7-1.06 2.8 2.8 0 0 0-1.05-.7c-.3-.12-.8-.28-1.7-.32C15.5 4 15.1 4 12 4Zm0 3.05A4.95 4.95 0 1 1 7.05 12 4.95 4.95 0 0 1 12 7.05Zm0 1.8A3.15 3.15 0 1 0 15.15 12 3.15 3.15 0 0 0 12 8.85Zm5.15-3.3a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z"/></svg>',
  };

  // footer（含自動年份版權）
  var year = new Date().getFullYear();
  var footMount = document.getElementById("site-footer");
  if (footMount) {
    footMount.outerHTML =
      '<footer><div class="wrap foot">' +
      "<span>© " +
      year +
      " 葉書銘（薯餅）. All rights reserved.</span>" +
      '<span class="foot-right">' +
      '<a class="js-email" data-email="' +
      EMAIL +
      '" href="mailto:' +
      EMAIL +
      '">' +
      EMAIL +
      "</a>" +
      '<span class="socials">' +
      '<a href="' +
      YT +
      '" target="_blank" rel="noopener noreferrer" aria-label="YouTube">' +
      ICONS.yt +
      "</a>" +
      '<a href="' +
      IG +
      '" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
      ICONS.ig +
      "</a>" +
      "</span>" +
      "</span>" +
      "</div></footer>";
  }

  // email 彈窗（注入一次，全站共用）
  var modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "email-modal";
  modal.innerHTML =
    '<div class="backdrop" data-close></div>' +
    '<div class="box" role="dialog" aria-modal="true" aria-label="寫信給我">' +
    '<button class="x" data-close aria-label="關閉">&times;</button>' +
    '<div class="lbl">寫信給我</div>' +
    "<h3>葉書銘（薯餅）</h3>" +
    '<div class="mailrow"><code id="modal-email">' +
    EMAIL +
    "</code></div>" +
    '<div class="acts">' +
    '<a class="primary" id="modal-mailto" href="mailto:' +
    EMAIL +
    '">用郵件 App 開啟</a>' +
    '<button id="modal-copy" type="button">複製地址</button>' +
    "</div>" +
    '<div class="copied" id="modal-copied"></div>' +
    "</div>";
  document.body.appendChild(modal);

  // 手機抽屜選單（body 層級，沿用同一份 menu）
  var dOverlay = document.createElement("div");
  dOverlay.className = "drawer-overlay";
  dOverlay.id = "drawer-overlay";
  document.body.appendChild(dOverlay);

  var drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.id = "drawer";
  drawer.innerHTML =
    '<button class="drawer-close" aria-label="關閉選單">&times;</button>' +
    menu +
    '<a class="cta" href="' +
    ctaHref +
    '">合作邀約</a>';
  document.body.appendChild(drawer);

  // 回到頂部 懸浮按鈕
  var top = document.createElement("button");
  top.className = "to-top";
  top.setAttribute("aria-label", "回到頂部");
  top.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z"/></svg>';
  document.body.appendChild(top);
})();
