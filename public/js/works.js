/* 作品資料（首頁與作品集頁共用）。
   每筆給「url」＝該作品在平台上的連結，程式自動判斷平台：
     - YouTube（youtu.be / youtube.com/watch?v= / youtube.com/shorts/）→ 縮圖自動抓，免填 poster。
     - Instagram（instagram.com/reel|p|tv/）→ 無法自動抓縮圖（Meta 已關閉，見 README）→ 請給 poster。
     - 其他平台 → 請給 poster。
   欄位說明：
     id     唯一識別碼（給 cases.js 的 works[] 參照用）
     url    必填，作品連結
     cat    分類（自動產生作品集頁篩選按鈕）
     title  標題
     role   你負責的部分
     dur    長度，手填（YT/IG 都無法用免費方式自動抓，留空就不顯示）
     poster 封面圖路徑，IG/其他必給（例 "posters/works/reel-1.jpg"）；YouTube 可不給
     ratio  選填，"9/16" 或 "16/9"；不填會自動推斷（reel/shorts→9:16、youtube 長片→16:9）
     tag    選填，卡片左上角標籤；不填會依平台自動標（Shorts/Reels/YouTube）
     views  選填，觀看數字串（例 "239萬"、"75.2萬"），無法程式自動抓，從平台手填；留空就不顯示
   作品超過 16 個時，作品集頁自動改成「載入更多」（一次 12 個）。 */
window.WORKS = [
  // 初日 胰島素阻抗
  {
    id: "cofit-interview",
    url: "https://www.youtube.com/shorts/SyJSq47zidg",
    cat: "訪談",
    title: "初日會客室Cofit",
    role: "剪輯·字幕",
    dur: "1:23",
    views: "21.9萬",
    home: true,
  },
  // 日本職業球員 - 粉絲見面會
  {
    id: "volleyball-fanmeet",
    url: "https://youtu.be/okUNlGans7Q",
    cat: "運動",
    title: "日本職業球員 - 粉絲見面會",
    role: "拍攝·剪輯",
    dur: "2:46",
    views: "2044",
  },
  // 旅遊瞭望台
  {
    id: "travel-lookout",
    url: "https://www.youtube.com/shorts/LWtX8NwveMA",
    cat: "訪談",
    title: "旅遊瞭望台",
    role: "剪輯",
    dur: "0:58",
    views: "1628",
  },
  // TPVL - 元年熱身賽（台日交流）
  {
    id: "tpvl-warmup",
    url: "https://youtu.be/xFJDLayVvbs",
    cat: "運動",
    title: "TPVL - 元年熱身賽（台日交流）",
    role: "拍攝·剪輯",
    dur: "3:31",
    views: "1.2萬",
    home: true,
  },
  // TPVL - 桃園主場開箱
  {
    id: "tpvl-taoyuan",
    url: "https://youtu.be/WzsdOpVRD7g",
    cat: "運動",
    title: "TPVL - 桃園主場開箱",
    role: "拍攝·剪輯",
    dur: "3:44",
    views: "1749",
  },
  // reel 教學-網紅合作
  {
    id: "reel-edu-1",
    url: "https://www.instagram.com/reels/DCRJu0_yPYv/",
    cat: "教學",
    title: "網紅合作",
    role: "剪輯·字幕",
    dur: "0:48",
    poster: "posters/works/reel-1.jpg",
    views: "1.5百萬",
  },
  // reel 教學-網紅合作
  {
    id: "reel-edu-2",
    url: "https://www.instagram.com/reel/DG2geERTsik/",
    cat: "教學",
    title: "網紅合作",
    role: "剪輯·字幕",
    dur: "0:55",
    poster: "posters/works/reel-2.jpg",
    views: "2.3百萬",
    home: true,
  },
  // 律師
  {
    id: "lawyer-deserter",
    url: "https://www.youtube.com/shorts/IgZ48m34akU",
    cat: "談話主題",
    title: "筑鈞律師 - 逃兵案件分析",
    role: "剪輯·調光",
    dur: "0:38",
    views: "68.5萬",
    home: true,
  },
  // 律師
  {
    id: "lawyer-case",
    url: "https://youtu.be/wS2CF9RukmM",
    cat: "談話主題",
    title: "筑鈞律師 - 法律案件分析",
    role: "剪輯·調光",
    dur: "15:03",
    views: "4.6 萬",
  },
  // reel 戰術分析 - 賽事剪輯
  {
    id: "reel-v-lab1",
    url: "https://www.instagram.com/reel/CvetsKir7u8/",
    cat: "資訊分享",
    title: "戰術分析 - 賽事剪輯",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-6.jpg",
    views: "2.4百萬",
    home: true,
  },
  // reel 探店主題
  {
    id: "reel-pet",
    url: "https://www.instagram.com/reels/C8KOn3HSup1/",
    cat: "探店主題",
    title: "寵物公仔製作",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-7.jpg",
    views: "1.5百萬",
    home: true,
  },
  // reel 迷因-慢動作挑戰
  {
    id: "reel-meme-1",
    url: "https://www.instagram.com/reels/DGAlT_UTpyb/",
    cat: "迷因",
    title: "慢動作挑戰",
    role: "剪輯·字卡",
    dur: "0:44",
    poster: "posters/works/reel-3.jpg",
    views: "2百萬",
    home: true,
  },
  // reel 迷因挑戰 - 排球技巧
  {
    id: "reel-volleyball-meme",
    url: "https://www.instagram.com/reel/DClu_ZQSp55/",
    cat: "迷因",
    title: "排球技巧",
    role: "剪輯·字幕",
    dur: "0:29",
    poster: "posters/works/reel-4.jpg",
    views: "2.9百萬",
  },
  // Go車誌 - 車主訪談
  {
    id: "gocar-interview",
    url: "https://youtu.be/4a_o4VAYATc&t=53s",
    cat: "訪談",
    title: "Go車誌 - 車主訪談",
    role: "剪輯·字幕",
    dur: "26:29",
    views: "26萬",
    home: true,
  },
  // Go車誌 - 新車試駕
  {
    id: "gocar-testdrive",
    url: "https://youtu.be/Ei_MBgnKHy8",
    cat: "開箱",
    title: "Go車誌 - 新車試駕",
    role: "剪輯·字幕",
    dur: "14:10",
    views: "7.9萬",
  },
  // Go車誌 - 車用品開箱
  {
    id: "gocar-unbox",
    url: "https://youtu.be/ZmOGYXnYh-k",
    cat: "開箱",
    title: "Go車誌 - 車用品開箱",
    role: "剪輯·字幕",
    dur: "8:51",
    views: "16萬",
  },
  // 律師 雙人採訪
  {
    id: "lawyer-duo",
    url: "https://youtu.be/vBPgKX1M4QQ",
    cat: "訪談",
    title: "雙人棚內訪談",
    role: "剪輯·字幕",
    dur: "25:39",
    views: "2.3萬",
  },
  // 道明排球隊 - 謝師宴回顧
  {
    id: "daoming-volleyball",
    url: "https://youtu.be/1xXXi1T0VBk",
    cat: "訪談",
    title: "道明排球隊 - 謝師宴回顧",
    role: "剪輯·字幕",
    dur: "9:07",
    views: "140",
  },
  // 律師
  {
    id: "lawyer-legal",
    url: "https://youtu.be/aAbyGuubSd4",
    cat: "談話主題",
    title: "筑鈞律師 - 法律解析",
    role: "剪輯·字幕",
    dur: "15:15",
    views: "4.6萬",
  },
  // reel 教學 - 技巧示範
  {
    id: "reel-skill",
    url: "https://www.instagram.com/reels/C_c5VhPBnGL/",
    cat: "教學",
    title: "技巧示範",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-5.jpg",
    views: "1.5百萬",
  },
  // reel 探店主題
  {
    id: "reel-bookfair",
    url: "https://www.instagram.com/reels/DUcGtGQEuKr/",
    cat: "探店主題",
    title: "書展攤位導覽",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-8.jpg",
    views: "1.9萬",
  },
  // reel Vlog
  {
    id: "reel-dog-1",
    url: "https://www.instagram.com/reel/C7ynRE5SIIH/",
    cat: "Vlog",
    title: "狗狗紀錄",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-9.jpg",
    views: "12.1萬",
  },
  // reel Vlog
  {
    id: "reel-dog-2",
    url: "https://www.instagram.com/reel/C7g120OyGB9/",
    cat: "Vlog",
    title: "狗狗生活紀錄",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-10.jpg",
    views: "32.1萬",
  },
  // reel Vlog
  {
    id: "reel-ebook-travel",
    url: "https://www.instagram.com/reel/DMCNOwFzMgS/",
    cat: "Vlog",
    title: "帶著電子書去旅遊",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-11.jpg",
    views: "9308",
  },
  // reel Vlog
  {
    id: "reel-kobo",
    url: "https://www.instagram.com/reel/DTFwl4qkuwe/",
    cat: "Vlog",
    title: "樂天Kobo 電子書",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-12.jpg",
    views: "1.2萬",
    home: true,
  },
  // reel 人物專訪
  {
    id: "reel-dis",
    url: "https://www.instagram.com/reels/DKZeBAYTzCN/",
    cat: "訪談",
    title: "DIS球隊專訪",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-13.jpg",
    views: "5.1萬",
    home: true,
  },
  // reel 訪談
  {
    id: "reel-kobo-author",
    url: "https://www.instagram.com/reels/DMfkqSdzybM/",
    cat: "訪談",
    title: "Kobo電子書 - 作者專訪",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-14.jpg",
    views: "1.4萬",
  },
  // reel 資訊分享
  {
    id: "reel-info",
    url: "https://www.instagram.com/reels/DMfkqSdzybM/",
    cat: "資訊分享",
    title: "番號",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-15.jpg",
    views: "1.1百萬",
  },
  // reel 採訪
  {
    id: "reel-actress",
    url: "https://www.instagram.com/reel/C0bqRnXB_3J/",
    cat: "採訪",
    title: "女優採訪",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-16.jpg",
    views: "52.6萬",
  },
  // reel 活動
  {
    id: "reel-tenga",
    url: "https://www.instagram.com/reels/DFumm-sBqdV/",
    cat: "活動",
    title: "TENGA 城隍廟",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-17.jpg",
    views: "2.6萬",
  },
  // reel 活動
  {
    id: "reel-atl",
    url: "https://www.instagram.com/reel/DL7MmcTzrXw/",
    cat: "活動",
    title: "ATL 代表隊甄選",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-18.jpg",
    views: "5.8萬",
  },
  // reel 活動
  {
    id: "reel-kids",
    url: "https://www.instagram.com/reels/DIi08wZTWW0/",
    cat: "活動",
    title: "親子活動",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-19.jpg",
    views: "1.2萬",
  },
  // reel 活動
  {
    id: "reel-presser",
    url: "https://www.instagram.com/reels/DMFXU9TBF4o/",
    cat: "活動",
    title: "球隊記者會 花絮",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-20.jpg",
    views: "1.6萬",
  },
  // reel 活動
  {
    id: "reel-volleyball-event",
    url: "https://www.instagram.com/reels/DKMRipVT9Xf/",
    cat: "活動",
    title: "排球賽事 紀錄",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-21.jpg",
    views: "2.2萬",
  },
  // reel 探店主題
  {
    id: "reel-atl-npc",
    url: "https://www.instagram.com/reel/DBtConoyaFO/",
    cat: "探店主題",
    title: "ATL - NPC入場",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-22.jpg",
    views: "90.2萬",
  },
  // reel 教學
  {
    id: "reel-defense",
    url: "https://www.instagram.com/reel/DL7MmcTzrXw/",
    cat: "教學",
    title: "防守技巧",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-23.jpg",
    views: "1.2百萬",
  },
  // reel 教學
  {
    id: "reel-v-lab2",
    url: "https://www.instagram.com/reel/Cz8XLNuSruS/",
    cat: "資訊分享",
    title: "舉球",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-24.jpg",
    views: "1.0百萬",
  },
  // reel 教學
  {
    id: "reel-v-lab3",
    url: "https://www.instagram.com/reel/CzDpr4OSV9Q/",
    cat: "資訊分享",
    title: "舉球戰術",
    role: "剪輯·字卡",
    dur: "0:33",
    poster: "posters/works/reel-25.jpg",
    views: "1.6百萬",
  },
];

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

  var media;
  if (p.thumb) {
    var onerr = p.thumbFallback
      ? "if(this.dataset.fb){this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='grid'}else{this.dataset.fb=1;this.src='" +
        p.thumbFallback +
        "'}"
      : "this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='grid'";
    media =
      '<img src="' +
      p.thumb +
      '" alt="' +
      w.title +
      '" loading="lazy" onerror="' +
      onerr +
      '"><div class="ph" style="display:none">' +
      w.title +
      "</div>";
  } else {
    media =
      p.platform === "instagram"
        ? '<div class="ph">IG 作品<br>請放 poster 封面圖</div>'
        : '<div class="ph">放連結或 poster</div>';
  }

  var dur = w.dur ? '<span class="dur">' + w.dur + "</span>" : "";
  var views = w.views ? '<span class="views">▶ ' + w.views + "</span>" : "";
  var ext =
    p.href && p.href !== "#" ? 'target="_blank" rel="noopener noreferrer"' : "";
  return (
    '<a class="w" href="' +
    p.href +
    '" ' +
    ext +
    ' data-cat="' +
    w.cat +
    '" data-platform="' +
    p.platform +
    '">' +
    '<div class="media ' +
    rClass +
    '">' +
    media +
    '<span class="badge">' +
    p.tag +
    "</span>" +
    (w.cat ? '<span class="cat-tag">' + w.cat + "</span>" : "") +
    dur +
    views +
    '<div class="ov"><h3>' +
    w.title +
    "</h3><p>" +
    w.role +
    "</p></div>" +
    "</div></a>"
  );
};

/* append=true 時附加（給「載入更多」），否則整批取代 */
window.renderWork = function (el, list, append) {
  var html = list.map(window.workCardHTML).join("");
  if (append) el.insertAdjacentHTML("beforeend", html);
  else el.innerHTML = html;
};
