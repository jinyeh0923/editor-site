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
     dur    長度，手填（YT/IG 都無法用免費方式自動抓，留空就不顯示）
     poster 封面圖路徑，IG/其他必給（例 "posters/works/reel-1.jpg"）；YouTube 可不給
     ratio  選填，"9/16" 或 "16/9"；不填會自動推斷（reel/shorts→9:16、youtube 長片→16:9）
     tag    選填，卡片左上角標籤；不填會依平台自動標（Shorts/Reels/YouTube）
     pin    選填，true＝固定排在牆面第一張（masonry 會把它提到最前）
     views  選填，觀看數字串（例 "239萬"、"75.2萬"），無法程式自動抓，從平台手填；留空就不顯示
   作品超過 16 個時，作品集頁自動改成「載入更多」（一次 12 個）。 */
window.WORKS = [
  // TPVL 元年紀實
  {
    id: "tpvl-beginning",
    url: "https://youtu.be/V-dbC-vt16g",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL 元年紀實 THE BEGINNING",
    dur: "12:12",
    views: "1.4萬",
    pin: true, // 固定排在牆面第一張（見 masonry.js）
  },
  // 初日 胰島素阻抗
  {
    id: "cofit-interview",
    url: "https://www.youtube.com/shorts/SyJSq47zidg",
    cat: "商業品牌短影音",
    title: "初日會客室Cofit",
    dur: "1:23",
    views: "21.9萬",
    home: true,
  },
  // 律師
  {
    id: "lawyer-deserter",
    url: "https://www.youtube.com/shorts/IgZ48m34akU",
    cat: "個人 IP 影音製作",
    title: "筑鈞律師 - 逃兵案件分析",
    dur: "0:38",
    views: "68.5萬",
    home: true,
  },
  // 日本職業球員 - 粉絲見面會
  {
    id: "volleyball-fanmeet",
    url: "https://youtu.be/okUNlGans7Q",
    cat: "賽事紀錄與運動社群經營",
    title: "日本職業球員 - 粉絲見面會",
    dur: "2:46",
    views: "2044",
  },
  // 旅遊瞭望台
  {
    id: "travel-lookout",
    url: "https://www.youtube.com/shorts/LWtX8NwveMA",
    cat: "商業品牌短影音",
    title: "旅遊瞭望台",
    dur: "0:58",
    views: "1628",
  },
  // TPVL - 元年熱身賽（台日交流）
  {
    id: "tpvl-warmup",
    url: "https://youtu.be/xFJDLayVvbs",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL - 元年熱身賽（台日交流）",
    dur: "3:31",
    views: "1.2萬",
    home: true,
  },
  // TPVL - 桃園主場開箱
  {
    id: "tpvl-taoyuan",
    url: "https://youtu.be/WzsdOpVRD7g",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL - 桃園主場開箱",
    dur: "3:44",
    views: "1749",
  },
  // reel 教學-網紅合作
  {
    id: "reel-edu-1",
    url: "https://www.instagram.com/reels/DCRJu0_yPYv/",
    cat: "賽事紀錄與運動社群經營",
    title: "網紅合作",
    dur: "0:48",
    poster: "posters/works/reel-1.jpg",
    views: "150萬",
  },
  // reel 教學-網紅合作
  {
    id: "reel-edu-2",
    url: "https://www.instagram.com/reel/DG2geERTsik/",
    cat: "賽事紀錄與運動社群經營",
    title: "網紅合作",
    dur: "0:55",
    poster: "posters/works/reel-2.jpg",
    views: "230萬",
    home: true,
  },
  // 律師
  {
    id: "lawyer-case",
    url: "https://youtu.be/wS2CF9RukmM",
    cat: "個人 IP 影音製作",
    title: "筑鈞律師 - 法律案件分析",
    dur: "15:03",
    views: "4.6萬",
  },
  // reel 迷因-慢動作挑戰
  {
    id: "reel-meme-1",
    url: "https://www.instagram.com/reels/DGAlT_UTpyb/",
    cat: "賽事紀錄與運動社群經營",
    title: "慢動作挑戰",
    dur: "0:44",
    poster: "posters/works/reel-3.jpg",
    views: "200萬",
    home: true,
  },
  // reel 迷因挑戰 - 排球技巧
  {
    id: "reel-volleyball-meme",
    url: "https://www.instagram.com/reel/DClu_ZQSp55/",
    cat: "賽事紀錄與運動社群經營",
    title: "排球技巧",
    dur: "0:29",
    poster: "posters/works/reel-4.jpg",
    views: "290萬",
  },
  // 律師 雙人採訪
  {
    id: "lawyer-duo",
    url: "https://youtu.be/vBPgKX1M4QQ",
    cat: "個人 IP 影音製作",
    title: "雙人棚內訪談",
    dur: "25:39",
    views: "2.3萬",
  },
  // 道明排球隊 - 謝師宴回顧
  {
    id: "daoming-volleyball",
    url: "https://youtu.be/1xXXi1T0VBk",
    cat: "賽事紀錄與運動社群經營",
    title: "道明排球隊 - 謝師宴回顧",
    dur: "9:07",
    views: "140",
  },
  // 律師
  {
    id: "lawyer-legal",
    url: "https://youtu.be/aAbyGuubSd4",
    cat: "個人 IP 影音製作",
    title: "筑鈞律師 - 法律解析",
    dur: "15:15",
    views: "4.6萬",
  },
  // reel 教學 - 技巧示範
  {
    id: "reel-skill",
    url: "https://www.instagram.com/reels/C_c5VhPBnGL/",
    cat: "賽事紀錄與運動社群經營",
    title: "技巧示範",
    dur: "0:33",
    poster: "posters/works/reel-5.jpg",
    views: "150萬",
  },
  // reel 戰術分析 - 賽事剪輯
  {
    id: "reel-v-lab1",
    url: "https://www.instagram.com/reel/CvetsKir7u8/",
    cat: "賽事紀錄與運動社群經營",
    title: "戰術分析 - 賽事剪輯",
    dur: "0:33",
    poster: "posters/works/reel-6.jpg",
    views: "240萬",
    home: true,
  },
  // reel 探店主題
  {
    id: "reel-pet",
    url: "https://www.instagram.com/reels/C8KOn3HSup1/",
    cat: "活動紀錄與日常",
    title: "寵物公仔製作",
    dur: "0:33",
    poster: "posters/works/reel-7.jpg",
    views: "150萬",
    home: true,
  },
  // reel 探店主題
  {
    id: "reel-bookfair",
    url: "https://www.instagram.com/reels/DUcGtGQEuKr/",
    cat: "商業品牌短影音",
    title: "書展攤位導覽",
    dur: "0:33",
    poster: "posters/works/reel-8.jpg",
    views: "1.9萬",
  },
  // reel Vlog
  {
    id: "reel-dog-1",
    url: "https://www.instagram.com/reel/C7ynRE5SIIH/",
    cat: "活動紀錄與日常",
    title: "狗狗紀錄",
    dur: "0:33",
    poster: "posters/works/reel-9.jpg",
    views: "12.1萬",
  },
  // reel Vlog
  {
    id: "reel-dog-2",
    url: "https://www.instagram.com/reel/C7g120OyGB9/",
    cat: "活動紀錄與日常",
    title: "狗狗生活紀錄",
    dur: "0:33",
    poster: "posters/works/reel-10.jpg",
    views: "32.1萬",
  },
  // reel Vlog
  {
    id: "reel-ebook-travel",
    url: "https://www.instagram.com/reel/DMCNOwFzMgS/",
    cat: "商業品牌短影音",
    title: "帶著電子書去旅遊",
    dur: "0:33",
    poster: "posters/works/reel-11.jpg",
    views: "9308",
  },
  // reel Vlog
  {
    id: "reel-kobo",
    url: "https://www.instagram.com/reel/DTFwl4qkuwe/",
    cat: "商業品牌短影音",
    title: "樂天Kobo 電子書",
    dur: "0:33",
    poster: "posters/works/reel-12.jpg",
    views: "1.2萬",
    home: true,
  },
  // reel 人物專訪
  {
    id: "reel-dis",
    url: "https://www.instagram.com/reels/DKZeBAYTzCN/",
    cat: "賽事紀錄與運動社群經營",
    title: "DIS球隊專訪",
    dur: "0:33",
    poster: "posters/works/reel-13.jpg",
    views: "5.1萬",
    home: true,
  },
  // reel 訪談
  {
    id: "reel-kobo-author",
    url: "https://www.instagram.com/reels/DMfkqSdzybM/",
    cat: "商業品牌短影音",
    title: "Kobo電子書 - 作者專訪",
    dur: "0:33",
    poster: "posters/works/reel-14.jpg",
    views: "1.4萬",
  },
  // reel 資訊分享（Beautywiki 帳號已關閉 → 無 url，卡片只顯示封面與觀看數、不可點擊）
  {
    id: "reel-info",
    url: "",
    cat: "商業品牌短影音",
    title: "番號即將揭曉｜優質推薦：小笠原祐子",
    dur: "0:33",
    poster: "posters/works/reel-15.jpg",
    tag: "Reels", // 無 url 無法自動判平台，手動標
    views: "110萬",
  },
  // reel 採訪
  {
    id: "reel-actress",
    url: "https://www.instagram.com/reel/C0bqRnXB_3J/",
    cat: "商業品牌短影音",
    title: "女優採訪",
    dur: "0:33",
    poster: "posters/works/reel-16.jpg",
    views: "52.6萬",
  },
  // reel 活動
  {
    id: "reel-tenga",
    url: "https://www.instagram.com/reels/DFumm-sBqdV/",
    cat: "活動紀錄與日常",
    title: "TENGA 城隍廟",
    dur: "0:33",
    poster: "posters/works/reel-17.jpg",
    views: "2.6萬",
  },
  // reel 活動
  {
    id: "reel-atl",
    url: "https://www.instagram.com/reel/DL7MmcTzrXw/",
    cat: "賽事紀錄與運動社群經營",
    title: "ATL 代表隊甄選",
    dur: "0:33",
    poster: "posters/works/reel-18.jpg",
    views: "5.8萬",
  },
  // reel 活動
  {
    id: "reel-kids",
    url: "https://www.instagram.com/reels/DIi08wZTWW0/",
    cat: "賽事紀錄與運動社群經營",
    title: "親子活動",
    dur: "0:33",
    poster: "posters/works/reel-19.jpg",
    views: "1.2萬",
  },
  // reel 活動
  {
    id: "reel-presser",
    url: "https://www.instagram.com/reels/DMFXU9TBF4o/",
    cat: "活動紀錄與日常",
    title: "球隊記者會 花絮",
    dur: "0:33",
    poster: "posters/works/reel-20.jpg",
    views: "1.6萬",
  },
  // reel 活動
  {
    id: "reel-volleyball-event",
    url: "https://www.instagram.com/reels/DKMRipVT9Xf/",
    cat: "賽事紀錄與運動社群經營",
    title: "排球賽事 紀錄",
    dur: "0:33",
    poster: "posters/works/reel-21.jpg",
    views: "2.2萬",
  },
  // reel 探店主題
  {
    id: "reel-atl-npc",
    url: "https://www.instagram.com/reel/DBtConoyaFO/",
    cat: "活動紀錄與日常",
    title: "ATL - NPC入場",
    dur: "0:33",
    poster: "posters/works/reel-22.jpg",
    views: "90.2萬",
  },
  // reel 教學
  {
    id: "reel-defense",
    url: "https://www.instagram.com/reels/DA5l6omy_Gt/",
    cat: "賽事紀錄與運動社群經營",
    title: "排球防守技巧 TIP 3｜前撲滑行緩衝",
    dur: "0:33",
    poster: "posters/works/reel-23.jpg",
    views: "120萬",
  },
  // reel 教學
  {
    id: "reel-v-lab2",
    url: "https://www.instagram.com/reel/Cz8XLNuSruS/",
    cat: "賽事紀錄與運動社群經營",
    title: "舉球",
    dur: "0:33",
    poster: "posters/works/reel-24.jpg",
    views: "100萬",
  },
  // reel 教學
  {
    id: "reel-v-lab3",
    url: "https://www.instagram.com/reel/CzDpr4OSV9Q/",
    cat: "賽事紀錄與運動社群經營",
    title: "舉球戰術",
    dur: "0:33",
    poster: "posters/works/reel-25.jpg",
    views: "160萬",
  },

  /* ── 以下為待補內容：title / dur / views 留空（卡片會自動不顯示該欄）
       要上首頁精選的加 home: true ── */

  // reel 運動
  {
    id: "reel-sport-1",
    url: "https://www.instagram.com/reel/DZHnA2ahTol/",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL 職排聯賽｜賽事高光與年度紀錄片",
    dur: "",
    poster: "posters/works/reel-26.jpg",
    views: "6.6萬",
  },
  // reel 運動
  {
    id: "reel-sport-2",
    url: "https://www.instagram.com/reel/DZHYTyQx7vV/",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL 職排聯賽｜賽事高光與年度紀錄片",
    dur: "",
    poster: "posters/works/reel-27.jpg",
    views: "16.8萬",
  },
  // reel 運動
  {
    id: "reel-sport-3",
    url: "https://www.instagram.com/reel/DO2d0t7EW8B/",
    cat: "賽事紀錄與運動社群經營",
    title: "TPVL 職排聯賽｜賽事高光與年度紀錄片",
    dur: "",
    poster: "posters/works/reel-28.jpg",
    views: "22.8萬",
  },
  // reel Vlog
  {
    id: "reel-vlog-1",
    url: "https://www.instagram.com/reel/Ddq39QsyO_7/",
    cat: "商業品牌短影音",
    title: "樂天 Kobo 閱讀器｜產品情境短影音",
    dur: "",
    poster: "posters/works/reel-29.jpg",
    views: "1.7萬",
  },
  // reel 業配短影音
  {
    id: "reel-ad-1",
    url: "https://www.instagram.com/reel/DVis8ZZkRuT/",
    cat: "個人 IP 影音製作",
    title: "筑鈞律師｜個人 IP 社群長短影音製作",
    dur: "",
    poster: "posters/works/reel-30.jpg",
    views: "6.7萬",
  },
  // reel 業配短影音
  {
    id: "reel-ad-2",
    url: "https://www.instagram.com/reel/Dc3Muq6jXFt/",
    cat: "個人 IP 影音製作",
    title: "美食家的自學之路｜社群短影音製作",
    dur: "",
    poster: "posters/works/reel-31.jpg",
    views: "33.3萬",
  },
  // reel 業配短影音
  {
    id: "reel-ad-3",
    url: "https://www.instagram.com/reel/DaVDVmThdIs/",
    cat: "個人 IP 影音製作",
    title: "是姍姍 不是珊珊｜社群短影音製作",
    dur: "",
    poster: "posters/works/reel-32.jpg",
    views: "4萬",
  },
  // reel 業配短影音
  {
    id: "reel-ad-4",
    url: "https://www.instagram.com/reel/DaxdsqLvb0g/",
    cat: "商業品牌短影音",
    title: "富特士多Footd_Store｜產品店鋪形象短片",
    dur: "",
    poster: "posters/works/reel-33.jpg",
    views: "8995",
  },
  // reel 業配短影音
  {
    id: "reel-ad-5",
    url: "https://www.instagram.com/reel/DZZAEy4RRTr/",
    cat: "商業品牌短影音",
    title: "富特士多Footd_Store｜產品店鋪形象短片",
    dur: "",
    poster: "posters/works/reel-34.jpg",
    views: "5551",
  },
  // reel 風景
  {
    id: "reel-scenic-1",
    url: "https://www.instagram.com/reel/Dbx_yMvtXoB/",
    cat: "商業品牌短影音",
    title: "My Japan Tour｜沉浸觀光短影音",
    dur: "",
    poster: "posters/works/reel-35.jpg",
    views: "551",
  },
  // reel 風景
  {
    id: "reel-scenic-2",
    url: "https://www.instagram.com/reel/DccstdMPCBQ/",
    cat: "商業品牌短影音",
    title: "My Japan Tour｜沉浸觀光短影音",
    dur: "",
    poster: "posters/works/reel-36.jpg",
    views: "457",
  },
  // reel 風景
  {
    id: "reel-scenic-3",
    url: "https://www.instagram.com/reel/DahczZQAlAi/",
    cat: "商業品牌短影音",
    title: "My Japan Tour｜沉浸觀光短影音",
    dur: "",
    poster: "posters/works/reel-37.jpg",
    views: "317",
  },

  // 台北松仁扶輪社
  {
    id: "rotary-songren-1",
    url: "https://youtu.be/cBnoYXcRUvs",
    cat: "活動紀錄與日常",
    title: "台北松仁扶輪社",
    dur: "",
    views: "",
  },
  // 台北松仁扶輪社
  {
    id: "rotary-songren-2",
    url: "https://youtu.be/fdtmavRzKVg",
    cat: "活動紀錄與日常",
    title: "台北松仁扶輪社",
    dur: "",
    views: "",
  },
  // reel 台北伊斯特排球隊
  {
    id: "reel-east",
    url: "https://www.instagram.com/reel/DPGOhinj4Yt/",
    cat: "活動紀錄與日常",
    title: "台北伊斯特排球隊",
    dur: "",
    poster: "posters/works/reel-38.jpg",
    views: "3.5萬",
  },
  // 筑鈞律師
  {
    id: "lawyer-shorts",
    url: "https://www.youtube.com/shorts/679511BdHnA",
    cat: "個人 IP 影音製作",
    title: "筑鈞律師",
    dur: "",
    views: "1114",
  },
  // reel 吃這個好不好
  {
    id: "reel-food",
    url: "https://www.instagram.com/reel/DWWmO-lAGBe/",
    cat: "個人 IP 影音製作",
    title: "吃這個好不好",
    dur: "",
    poster: "posters/works/reel-39.jpg",
    views: "15.4萬",
  },

  /* ── 汽車（Go車誌）固定排在最後 ── */
  // Go車誌 - 車主訪談
  {
    id: "gocar-interview",
    url: "https://youtu.be/4a_o4VAYATc&t=53s",
    cat: "個人 IP 影音製作",
    title: "Go車誌 - 車主訪談",
    dur: "26:29",
    views: "26萬",
    home: true,
  },
  // Go車誌 - 新車試駕
  {
    id: "gocar-testdrive",
    url: "https://youtu.be/Ei_MBgnKHy8",
    cat: "個人 IP 影音製作",
    title: "Go車誌 - 新車試駕",
    dur: "14:10",
    views: "7.9萬",
  },
  // Go車誌 - 車用品開箱
  {
    id: "gocar-unbox",
    url: "https://youtu.be/ZmOGYXnYh-k",
    cat: "個人 IP 影音製作",
    title: "Go車誌 - 車用品開箱",
    dur: "8:51",
    views: "16萬",
  },
];

/* 作品集頁篩選按鈕的顯示順序。沒列到的分類會照 WORKS 出現順序補在後面，
   所以新增分類時忘了加這裡也不會消失。 */
window.WORK_CATS = [
  "賽事紀錄與運動社群經營",
  "商業品牌短影音",
  "活動紀錄與日常",
  "個人 IP 影音製作",
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
  // title / dur / views 都可留空：空值一律不輸出標籤，避免 "undefined" 與空殼元素
  var title = w.title || "";
  var alt = title || w.cat || "作品封面";

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

  var dur = w.dur ? '<span class="dur">' + w.dur + "</span>" : "";
  var views = w.views ? '<span class="views">▶ ' + w.views + "</span>" : "";
  // title 空 → 整個 .ov 不輸出（否則 hover 會蓋上一層空的漸層）
  var ov = title ? '<div class="ov"><h3>' + title + "</h3></div>" : "";
  // 沒有 url（例如帳號已關閉、只留封面與數據）→ 輸出 div 而非 <a href="#">，避免死連結
  var isLink = p.href && p.href !== "#";
  var open = isLink
    ? '<a class="w" href="' +
      p.href +
      '" target="_blank" rel="noopener noreferrer"'
    : '<div class="w"';
  var pin = w.pin ? ' data-pin="1"' : "";
  var close = isLink ? "</a>" : "</div>";
  return (
    open +
    pin +
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
