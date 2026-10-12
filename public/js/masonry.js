(function () {
  function colCount(wall) {
    var w = innerWidth;
    if (wall && wall.dataset.cols && w >= 1024) return parseInt(wall.dataset.cols, 10);
    return w >= 1024 ? 4 : w >= 640 ? 3 : 2;
  }
  function gapPx() {
    return Math.max(12, Math.min(18, innerWidth * 0.014));
  }

  // 一次最多往後看幾張卡來補洞。客戶在後台自己排順序，所以不能像以前全域挑卡
  // （會把順序整個打亂）；只在接下來這幾張裡挑，視覺順序與後台順序最多差幾格。
  var LOOKAHEAD = 3;

  // 依 DOM 順序放卡：每一步在接下來 LOOKAHEAD 張裡，挑能放在最高位置的那張（同高取順序在前的）。
  // 排最前面的那張最多被跳過 LOOKAHEAD-1 次，之後強制放，避免寬卡一直被往後擠。
  // 純計算，不碰 DOM，回傳 {placements, heights}
  function place(cards, cols, g) {
    var heights = new Array(cols).fill(0);
    var remaining = cards.slice();
    var placements = [];
    var skipped = 0; // remaining[0] 已經被跳過幾次
    while (remaining.length) {
      var win = skipped >= LOOKAHEAD - 1 ? 1 : Math.min(LOOKAHEAD, remaining.length);
      var pick = 0, pickTop = Infinity, pickCol = 0;
      for (var k = 0; k < win; k++) {
        var sp = +remaining[k].dataset.span, c, top;
        if (sp === 1) {
          c = 0;
          for (var i = 1; i < cols; i++) if (heights[i] < heights[c]) c = i;
          top = heights[c];
        } else {
          c = 0;
          var best = Infinity;
          for (var j = 0; j < cols - 1; j++) {
            var t = Math.max(heights[j], heights[j + 1]);
            if (t < best) { best = t; c = j; }
          }
          top = best;
        }
        if (top < pickTop - 0.5) { pickTop = top; pick = k; pickCol = c; }
      }
      skipped = pick === 0 ? 0 : skipped + 1;
      var card = remaining.splice(pick, 1)[0];
      var sp2 = +card.dataset.span, h = card.offsetHeight;
      placements.push({ card: card, col: pickCol, top: pickTop });
      var nh = pickTop + h + g;
      heights[pickCol] = nh;
      if (sp2 === 2) heights[pickCol + 1] = nh;
    }
    return { placements: placements, heights: heights };
  }

  function layout(wall) {
    var cards = [].slice.call(wall.children).filter(function (el) {
      return el.classList.contains("w") && getComputedStyle(el).display !== "none";
    });
    // 沒有卡片（資料還沒到、讀取失敗的訊息、空清單）→ 交還一般排版，讓訊息文字看得到
    if (!cards.length) { wall.style.height = ""; wall.style.visibility = "visible"; return; }

    var cols = colCount(wall), g = gapPx();
    var colW = (wall.clientWidth - g * (cols - 1)) / cols;

    // pass 1：先設好寬度，讓瀏覽器算出各卡高度（16:9 跨 2 欄）
    cards.forEach(function (card) {
      var span = Math.min(card.querySelector(".media.r169") ? 2 : 1, cols);
      card.style.position = "absolute";
      card.style.width = (span === 2 ? colW * 2 + g : colW) + "px";
      card.dataset.span = span;
    });

    // pass 2：照順序放卡（有限往前看補洞）
    var best = place(cards, cols, g);

    // 套用排列
    best.placements.forEach(function (p) {
      p.card.style.left = p.col * (colW + g) + "px";
      p.card.style.top = p.top + "px";
    });

    wall.style.position = "relative";
    wall.style.height = Math.max.apply(null, best.heights) - g + "px";
    wall.style.visibility = "visible";
  }

  function init() {
    document.querySelectorAll(".wall").forEach(function (wall) {
      var raf;
      var relayout = function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { layout(wall); });
      };
      relayout();
      new MutationObserver(relayout).observe(wall, { childList: true });
      wall.addEventListener("load", relayout, true);
      addEventListener("resize", relayout);
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
