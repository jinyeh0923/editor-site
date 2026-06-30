(function () {
  function colCount(wall) {
    var w = innerWidth;
    if (wall && wall.dataset.cols && w >= 1024) return parseInt(wall.dataset.cols, 10);
    return w >= 1024 ? 4 : w >= 640 ? 3 : 2;
  }
  function gapPx() {
    return Math.max(12, Math.min(18, innerWidth * 0.014));
  }

  // 純模擬：不碰 DOM，只回傳 {placements, heights}
  function simulate(cards, cols, g) {
    var heights = new Array(cols).fill(0);
    var remaining = cards.slice();
    var placements = [];
    while (remaining.length) {
      var pick = 0, pickTop = Infinity, pickCol = 0;
      for (var k = 0; k < remaining.length; k++) {
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
      var card = remaining.splice(pick, 1)[0];
      var sp2 = +card.dataset.span, h = card.offsetHeight;
      placements.push({ card: card, col: pickCol, top: pickTop });
      var nh = pickTop + h + g;
      heights[pickCol] = nh;
      if (sp2 === 2) heights[pickCol + 1] = nh;
    }
    return { placements: placements, heights: heights };
  }

  // 分數 = 最高欄 − 最矮欄，越小越平衡
  function balance(heights) {
    return Math.max.apply(null, heights) - Math.min.apply(null, heights);
  }

  // 交錯合併兩個陣列 [a0,b0,a1,b1,...]
  function interleave(a, b) {
    var out = [], i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length) out.push(a[i++]);
      if (j < b.length) out.push(b[j++]);
    }
    return out;
  }

  function layout(wall) {
    var cards = [].slice.call(wall.children).filter(function (el) {
      return el.classList.contains("w") && getComputedStyle(el).display !== "none";
    });
    if (!cards.length) { wall.style.height = "0px"; return; }

    var cols = colCount(wall), g = gapPx();
    var colW = (wall.clientWidth - g * (cols - 1)) / cols;

    // pass 1：先設好寬度，讓瀏覽器算出各卡高度（16:9 跨 2 欄）
    cards.forEach(function (card) {
      var span = Math.min(card.querySelector(".media.r169") ? 2 : 1, cols);
      card.style.position = "absolute";
      card.style.width = (span === 2 ? colW * 2 + g : colW) + "px";
      card.dataset.span = span;
    });

    // pass 2：準備多種排列候選，選分數最好的
    var narrow = cards.filter(function (c) { return +c.dataset.span === 1; });
    var wide   = cards.filter(function (c) { return +c.dataset.span !== 1; });
    var asc    = cards.slice().sort(function (a, b) { return a.offsetHeight - b.offsetHeight; });
    var desc   = cards.slice().sort(function (a, b) { return b.offsetHeight - a.offsetHeight; });
    // 高矮交替（不重複）：最高、最矮、次高、次矮…
    var alt = (function () {
      var s = desc.slice(), out = [], lo = s.length - 1, hi = 0;
      while (hi <= lo) {
        out.push(s[hi++]);
        if (hi <= lo) out.push(s[lo--]);
      }
      return out;
    })();

    var candidates = [
      cards,                       // 原始順序
      interleave(wide, narrow),    // 寬卡先
      interleave(narrow, wide),    // 窄卡先
      asc,                         // 矮卡先
      desc,                        // 高卡先
      alt,                         // 高矮交替（不重複）
    ];

    var best = null;
    candidates.forEach(function (order) {
      var result = simulate(order, cols, g);
      var s = balance(result.heights);
      if (!best || s < best.score) {
        best = { score: s, placements: result.placements, heights: result.heights };
      }
    });

    // 套用最佳排列
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
