/* 共用互動：手機選單、捲動播放頭、進場揭露、磁吸按鈕、標題逐字、showreel、
   email 彈窗、Lenis 平滑滾軸。partials.js 已在本檔之前注入 nav/footer/modal。 */
(function(){
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var lenis = null;

  // 手機抽屜選單
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("drawer");
  var dOverlay = document.getElementById("drawer-overlay");
  function setMenu(open){
    if(!drawer) return;
    drawer.classList.toggle("open", open);
    if(dOverlay) dOverlay.classList.toggle("open", open);
    if(toggle){ toggle.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open); }
    document.body.classList.toggle("no-scroll", open);   // 鎖住背景捲動
    if(lenis){ open ? lenis.stop() : lenis.start(); }    // Lenis 也要停，否則仍可滑
  }
  if(toggle){ toggle.addEventListener("click", function(){ setMenu(!drawer.classList.contains("open")); }); }
  if(dOverlay){ dOverlay.addEventListener("click", function(){ setMenu(false); }); }
  if(drawer){
    var dClose = drawer.querySelector(".drawer-close");
    if(dClose) dClose.addEventListener("click", function(){ setMenu(false); });
    drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setMenu(false); }); });
  }
  addEventListener("keydown", function(e){ if(e.key==="Escape" && drawer && drawer.classList.contains("open")) setMenu(false); });

  // 頂端播放頭 + 回到頂部按鈕
  var scrubber = document.getElementById("scrubber");
  var topBtn = document.querySelector(".to-top");
  function onScroll(){
    var h = document.documentElement;
    if(scrubber) scrubber.style.width = (h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+"%";
    if(topBtn) topBtn.classList.toggle("show", h.scrollTop > h.clientHeight*0.6);
  }
  addEventListener("scroll", onScroll, {passive:true});
  if(topBtn){
    topBtn.addEventListener("click", function(){
      if(lenis) lenis.scrollTo(0); else window.scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  // 標題逐字
  document.querySelectorAll("#headline .word").forEach(function(w,i){ w.style.animationDelay = (.15+i*.12)+"s"; });

  // 進場揭露 + 磁吸
  if(!reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, {threshold:.12});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });
  }

  // showreel
  var reel = document.getElementById("reel");
  if(reel){
    var SHOWREEL_ID = reel.getAttribute("data-yt") || "SHOWREEL_ID";
    var playReel = function(){ if(SHOWREEL_ID==="SHOWREEL_ID") return;
      reel.innerHTML = '<iframe width="100%" height="100%" style="border:0" src="https://www.youtube.com/embed/'+SHOWREEL_ID+'?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>'; };
    reel.addEventListener("click", playReel);
    reel.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); playReel(); } });
  }

  // email 彈窗
  var modal = document.getElementById("email-modal");
  if(modal){
    var lastFocus = null;
    var open = function(email){
      if(email){
        modal.querySelector("#modal-email").textContent = email;
        modal.querySelector("#modal-mailto").href = "mailto:"+email;
      }
      modal.querySelector("#modal-copied").textContent = "";
      lastFocus = document.activeElement;
      modal.classList.add("open");
      modal.querySelector(".x").focus();
    };
    var close = function(){ modal.classList.remove("open"); if(lastFocus) lastFocus.focus(); };

    document.querySelectorAll(".js-email").forEach(function(a){
      a.addEventListener("click", function(e){ e.preventDefault(); open(a.getAttribute("data-email")); });
    });
    modal.querySelectorAll("[data-close]").forEach(function(el){ el.addEventListener("click", close); });
    addEventListener("keydown", function(e){ if(e.key==="Escape" && modal.classList.contains("open")) close(); });

    modal.querySelector("#modal-copy").addEventListener("click", function(){
      var email = modal.querySelector("#modal-email").textContent;
      var done = function(){ modal.querySelector("#modal-copied").textContent = "已複製到剪貼簿 ✓"; };
      if(navigator.clipboard){ navigator.clipboard.writeText(email).then(done).catch(done); }
      else { done(); }
    });
  }

  // 個資同意：未勾選前，送出鈕停用並顯示「請同意個資說明」
  document.querySelectorAll("form").forEach(function(form){
    var chk = form.querySelector(".consent-check");
    var btn = form.querySelector('button[type="submit"]');
    if(!chk || !btn) return;
    var label = btn.getAttribute("data-label") || btn.textContent;
    var sync = function(){
      btn.disabled = !chk.checked;
      btn.textContent = chk.checked ? label : "請同意個資說明";
    };
    chk.addEventListener("change", sync);
    sync();
  });

  // Lenis 平滑滾軸（reduced-motion 時不啟用）
  if(!reduce && window.Lenis){
    lenis = new Lenis({ duration:1.1, smoothWheel:true });
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on("scroll", onScroll);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      var id = a.getAttribute("href");
      if(id.length > 1){
        a.addEventListener("click", function(e){
          var el = document.querySelector(id);
          if(el){ e.preventDefault(); lenis.scrollTo(el, { offset:-70 }); }
        });
      }
    });
  }

  onScroll();
})();
