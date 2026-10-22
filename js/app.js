/* Why the Sonics Left Seattle: content interactions.
   The page is complete without the 3D layer. stage.js (3D and scroll motion) is loaded lazily on top. */
(function () {
  "use strict";
  const D = window.DATA;
  const html = document.documentElement;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const reduceMotion = html.classList.contains("rm");
  const BY_ID = Object.fromEntries(D.CAUSES.map((c) => [c.id, c]));

  /* Smooth scroll that works with or without Lenis. */
  function scrollToEl(el) {
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -(64 + 16), duration: 1.3 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !window.__lenis) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    history.replaceState(null, "", id);
  });

  /* ------------------------------ lite mode ------------------------------ */
  /* Turns off every 3D scene and all scroll motion and shows the clean 2D page. Remembered in this browser. */
  const liteBtn = $("#lite-btn");
  if (liteBtn) {
    const on = html.classList.contains("lite"), auto = !on && html.classList.contains("no-3d");
    liteBtn.setAttribute("aria-pressed", String(on || auto));
    if (on) liteBtn.textContent = "Lite mode: on";
    else if (auto) {
      const why = html.classList.contains("rm") ? "reduced motion is on" : html.classList.contains("no-gl") ? "3D is not available here" : "on for this view";
      liteBtn.textContent = "Lite mode: on"; liteBtn.title = "Lite mode is on because " + why + "."; liteBtn.disabled = true;
    }
    liteBtn.addEventListener("click", () => {
      try { localStorage.setItem("lite", on ? "0" : "1"); } catch (e) { /* private mode: nothing to remember */ }
      location.reload();
    });
  }

  /* ---------------------------- mobile menu ---------------------------- */
  const menu = $("#menu"), menuBtn = $("#menu-btn");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ------------------------------ scroll spy ------------------------------ */
  if ("IntersectionObserver" in window) {
    const links = $$("#menu a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  /* --------------------- images: one source of truth --------------------- */
  const IMG = Object.fromEntries((D.IMAGES || []).map((i) => [i.id, i]));
  const shortAuthor = (a) => a.replace(/ from .*$/, "");
  function buildImage(fig) {
    const m = IMG[fig.dataset.img]; if (!m) return;
    const duo = fig.dataset.variant === "duo" && m.duo;
    const base = "assets/img/" + m.id + (duo ? "-duo" : "");
    const src = m.widths.map((w) => base + "-" + w + ".webp " + w + "w").join(", ");
    const big = Math.max.apply(null, m.widths);
    fig.innerHTML =
      '<img src="' + base + "-" + big + '.webp" srcset="' + src + '" sizes="' + esc(fig.dataset.sizes || "100vw") + '" width="' + m.w + '" height="' + m.h + '" loading="' + (fig.closest("#tl") ? "eager" : "lazy") + '" decoding="async" alt="' + esc(m.alt) + '">' +
      "<figcaption>" + esc(m.caption) + ' <span class="credit">Photo: ' + esc(shortAuthor(m.author)) + ", " +
      '<a href="' + esc(m.licenseUrl) + '" target="_blank" rel="noopener">' + esc(m.license) + '</a>, via <a href="' + esc(m.page) + '" target="_blank" rel="noopener">Wikimedia Commons</a>.</span></figcaption>';
  }
  $$("[data-img]").forEach(buildImage);

  /* ------------------------------- timeline ------------------------------- */
  const TRACK = { city: "Seattle and Washington", owners: "The owners", both: "Both sides" };
  const tl = $("#tl");
  D.EVENTS.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "tl-row" + (ev.track === "both" ? " is-both" : "") + (ev.ms ? " ms" : "");
    const cites = ev.src.map((id) => D.SOURCES[id].short.split(",")[0].replace(/^Associated Press.*/, "Associated Press")).filter((v, i, a) => a.indexOf(v) === i).join(", ");
    li.innerHTML =
      '<span class="tl-date">' + esc(ev.date) + "</span>" +
      '<div class="tl-card ' + ev.track + '">' +
        (ev.media && ev.media.img ? '<figure data-img="' + ev.media.img + '" data-variant="duo" data-sizes="360px"></figure>' : "") +
        (ev.media && ev.media.num ? '<p class="tl-num"><b>' + esc(ev.media.num) + "</b><span>" + esc(ev.media.cap) + "</span></p>" : "") +
        "<h3>" + esc(ev.title) + "</h3>" +
        "<p>" + esc(ev.text) + "</p>" +
        '<p class="track">Track: ' + TRACK[ev.track] + ". Source: " + esc(cites) + ".</p>" +
        '<button type="button" class="go" data-node="' + ev.node + '">Open the cause: ' + esc(BY_ID[ev.node].name) + "</button>" +
      "</div>";
    li.querySelector(".tl-card").addEventListener("click", (e) => { if (!e.target.closest("button")) select(ev.node, true); });
    li.querySelector("button").addEventListener("click", () => select(ev.node, true));
    tl.appendChild(li);
  });
  $$("#tl [data-img]").forEach(buildImage);

  /* ------------------------------ causal web ------------------------------ */
  const NS = "http://www.w3.org/2000/svg";
  const svg = $("#web");
  const CX = 340, CY = 270, RX = 262, RY = 205;
  const ORDER = ["keyarena", "attendance", "i91", "state", "owners", "okc", "nba"];
  const radius = (w) => 30 + w * 0.95;
  ORDER.forEach((id, i) => {
    const c = BY_ID[id];
    const a = ((-90 + (i * 360) / ORDER.length) * Math.PI) / 180;
    c.x = CX + RX * Math.cos(a); c.y = CY + RY * Math.sin(a); c.r = radius(c.weight);
  });
  function mk(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  const defs = mk("defs", {}, svg);
  const marker = mk("marker", { id: "arr", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto" }, defs);
  mk("path", { d: "M0 0 L10 5 L0 10 z", fill: "#f6b800" }, marker);
  const gSpokes = mk("g", {}, svg), gArrows = mk("g", {}, svg), gNodes = mk("g", {}, svg), gHub = mk("g", {}, svg);
  D.CAUSES.forEach((c) => mk("line", { class: "spoke", x1: c.x, y1: c.y, x2: CX, y2: CY, "stroke-width": 1 + c.weight / 5 }, gSpokes));
  mk("circle", { class: "hub", cx: CX, cy: CY, r: 58 }, gHub);
  mk("text", { class: "hub-t", x: CX, y: CY - 2 }, gHub).textContent = "Sonics leave";
  mk("text", { class: "hub-s", x: CX, y: CY + 18 }, gHub).textContent = "July 2008";
  D.CAUSES.forEach((c) => {
    const g = mk("g", { class: "node " + c.theme, tabindex: "0", role: "button", "aria-label": c.name + ", my weight " + c.weight + " out of 100. " + D.THEMES[c.theme] + ".", "data-id": c.id }, gNodes);
    mk("circle", { class: "body", cx: c.x, cy: c.y, r: c.r }, g);
    mk("text", { x: c.x, y: c.y + 5, "font-size": c.r > 48 ? 15 : 13, "data-full": c.short, "data-tiny": c.tiny }, g).textContent = c.short;
    g.addEventListener("click", () => select(c.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(c.id); } });
  });
  const narrow = window.matchMedia("(max-width: 640px)");
  const labelMode = () => $$(".node text").forEach((t) => { t.textContent = narrow.matches ? t.dataset.tiny : t.dataset.full; });
  labelMode();
  if (narrow.addEventListener) narrow.addEventListener("change", labelMode);

  const webChips = $("#web-chips");
  webChips.innerHTML = ORDER.map((id) => '<button type="button" class="chip" aria-pressed="false" data-chip="' + id + '">' + esc(BY_ID[id].name) + "</button>").join("");
  $$("[data-chip]", webChips).forEach((b) => b.addEventListener("click", () => select(b.dataset.chip)));

  function drawArrows(id) {
    gArrows.innerHTML = "";
    const s = BY_ID[id];
    s.links.forEach((l) => {
      const t = BY_ID[l.to];
      const dx = t.x - s.x, dy = t.y - s.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      mk("line", { class: "arrow-line", x1: s.x + ux * (s.r + 6), y1: s.y + uy * (s.r + 6), x2: t.x - ux * (t.r + 10), y2: t.y - uy * (t.r + 10), "marker-end": "url(#arr)" }, gArrows);
    });
  }

  /* ----------------------------- detail panel ----------------------------- */
  const detail = $("#detail");
  detail.setAttribute("tabindex", "-1");
  let current = null, lens = "all";

  function select(id, fromTimeline) {
    current = id;
    $$(".node").forEach((n) => n.classList.toggle("sel", n.dataset.id === id));
    $$("[data-chip]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.chip === id)));
    drawArrows(id);
    render();
    document.dispatchEvent(new CustomEvent("cause-select", { detail: { id } }));   // the 3D graph flies to it
    if (fromTimeline) {
      scrollToEl($("#causes"));
      setTimeout(() => detail.focus({ preventScroll: true }), reduceMotion ? 0 : 900);
    }
  }

  window.__selectCause = select;

  function render() {
    if (!current) {
      detail.innerHTML =
        "<h3>Start anywhere</h3>" +
        '<p class="sum">Select a circle on the web, or begin with one of these.</p>' +
        '<div class="chips" style="margin-top:16px">' +
        ORDER.map((id) => '<button class="chip" type="button" data-go="' + id + '">' + esc(BY_ID[id].name) + "</button>").join("") +
        "</div>" +
        '<h4>How to read it</h4><p class="empty">Bigger circles carry more weight in my current argument. Each evidence card says whose voice it carries and what limits it, so you can judge how far to trust it. Dashed arrows are connections I am arguing for.</p>';
      $$("[data-go]", detail).forEach((b) => b.addEventListener("click", () => select(b.dataset.go)));
      return;
    }
    const c = BY_ID[current];
    const voices = [["all", "All sources"]].concat(Object.entries(D.VOICES));
    const matching = c.evidence.filter((e) => lens === "all" || e.voice === lens).length;
    detail.innerHTML =
      "<h3>" + esc(c.name) + "</h3>" +
      '<p class="meta">Theme: ' + esc(D.THEMES[c.theme]) + ". When: " + esc(c.when) + ".</p>" +
      '<p class="sum">' + esc(c.summary) + "</p>" +
      '<div class="weight-row"><span>My working weight, provisional</span><span><b>' + c.weight + "</b> out of 100</span></div>" +
      '<div class="meter" aria-hidden="true"><i style="width:' + Math.min(100, c.weight * 2.5) + '%"></i></div>' +
      "<h4>Evidence: " + matching + " of " + c.evidence.length + " cards match this voice</h4>" +
      '<div class="chips" role="group" aria-label="Filter evidence by whose voice it carries">' +
      voices.map((v) => '<button class="chip" type="button" aria-pressed="' + (lens === v[0]) + '" data-lens="' + v[0] + '">' + esc(v[1]) + "</button>").join("") +
      "</div>" +
      c.evidence.map((e) => {
        const s = D.SOURCES[e.src], on = lens === "all" || e.voice === lens;
        return '<article class="ev' + (on ? "" : " dim") + '">' +
          '<div class="ev-head"><a href="#src-' + e.src + '">' + esc(s.short) + "</a> <span>" + esc(e.when) + "</span></div>" +
          "<p>" + esc(e.text) + "</p>" +
          '<p class="lim"><b>Limit.</b> ' + esc(e.limit) + "</p>" +
          '<p class="tags">Skill ' + e.hts + ". Voice: " + esc(D.VOICES[e.voice]) + ".</p>" +
          "</article>";
      }).join("") +
      (c.links.length
        ? '<h4>How it connects, my argument</h4><ul class="links">' +
          c.links.map((l) => '<li><button type="button" data-go="' + l.to + '">' + esc(BY_ID[l.to].name) + "</button>: " + esc(l.label) + "</li>").join("") +
          "</ul>"
        : '<h4>How it connects</h4><p class="empty">This one is the final permission, so it pushes on nothing else in my web.</p>');
    $$("[data-lens]", detail).forEach((b) => b.addEventListener("click", () => { lens = b.dataset.lens; render(); }));
    $$("[data-go]", detail).forEach((b) => b.addEventListener("click", () => select(b.dataset.go)));
  }

  $("#list-body").innerHTML = D.CAUSES.slice().sort((a, b) => b.weight - a.weight).map((c) =>
    "<tr><td>" + esc(c.name) + '</td><td class="tabular">' + c.weight + "</td><td>" + esc(D.THEMES[c.theme]) + "</td><td>" +
    (c.links.length ? c.links.map((l) => esc(BY_ID[l.to].name)).join(", ") : "Nothing (final permission)") + "</td></tr>").join("");

  /* --------------------------- weigh it yourself --------------------------- */
  const slidersEl = $("#sliders"), totalEl = $("#total"), compareBtn = $("#compare"), cmp = $("#cmp");
  const mine = Object.fromEntries(D.CAUSES.map((c) => [c.id, c.weight]));
  const yours = Object.fromEntries(D.CAUSES.map((c) => [c.id, 0]));
  const stackEl = $("#stack"), stackN = $("#stack-n"), stackHint = $("#stack-hint");
  slidersEl.innerHTML = ORDER.map((id) =>
    '<div class="sl"><label for="s_' + id + '"><span><i class="sw ' + BY_ID[id].theme + '" aria-hidden="true"></i>' + esc(BY_ID[id].name) + '</span><output id="v_' + id + '" for="s_' + id + '">0</output></label>' +
    '<input id="s_' + id + '" type="range" min="0" max="100" step="1" value="0"></div>').join("");
  /* the 100-point stack: one block per cause, resized live; whatever is unspent stays an open slot */
  stackEl.innerHTML = ORDER.map((id) => '<i class="blk ' + BY_ID[id].theme + '" data-id="' + id + '" style="flex-grow:0"><span>' + esc(BY_ID[id].tiny) + "</span></i>").join("") + '<i class="blk rest" style="flex-grow:100"></i>';
  const blocks = Object.fromEntries(ORDER.map((id) => [id, stackEl.querySelector('[data-id="' + id + '"]')]));
  const restBlk = stackEl.querySelector(".rest");
  const total = () => Object.values(yours).reduce((a, b) => a + b, 0);
  let lastT = 0;
  function refresh() {
    const t = total();
    totalEl.textContent = "Points used: " + t + " / 100" + (t > 100 ? " (over by " + (t - 100) + ")" : t < 100 && t > 0 ? " (" + (100 - t) + " left)" : "");
    totalEl.classList.toggle("bad", t > 100);
    compareBtn.disabled = t !== 100;
    cmp.innerHTML = "";
    ORDER.forEach((id) => { blocks[id].style.flexGrow = yours[id]; blocks[id].classList.toggle("thin", yours[id] < 9); });
    restBlk.style.flexGrow = Math.max(0, 100 - t);
    stackEl.classList.toggle("over", t > 100);
    stackEl.classList.toggle("full", t === 100);
    stackN.textContent = t;
    if (t !== lastT) { stackN.classList.remove("tick"); void stackN.offsetWidth; stackN.classList.add("tick"); lastT = t; }
    stackHint.textContent = t > 100 ? "Over by " + (t - 100) + ". Take some back." : t === 100 ? "All 100 placed. Compare with mine." : t === 0 ? "Slide a bar to place a block." : (100 - t) + " points still to place.";
  }
  ORDER.forEach((id) => $("#s_" + id).addEventListener("input", (e) => { yours[id] = +e.target.value; $("#v_" + id).textContent = yours[id]; refresh(); }));
  compareBtn.addEventListener("click", () => {
    const order = ORDER.slice().sort((a, b) => mine[b] - mine[a]);
    const rows = order.map((id) => {
      const diff = yours[id] - mine[id];
      const note = diff === 0 ? "same" : diff > 0 ? "you gave " + diff + " more" : "you gave " + -diff + " fewer";
      return '<div class="cmp-row"><span>' + esc(BY_ID[id].name) + '</span><span class="pair" aria-hidden="true"><i class="y" data-w="' + yours[id] + '"></i><i class="m" data-w="' + mine[id] + '"></i></span><span class="tabular">' + yours[id] + " vs " + mine[id] + ", " + note + "</span></div>";
    }).join("");
    const moved = order.reduce((a, id) => a + Math.abs(yours[id] - mine[id]), 0) / 2;
    const gap = order.slice().sort((a, b) => Math.abs(yours[b] - mine[b]) - Math.abs(yours[a] - mine[a]))[0];
    const gapTxt = Math.abs(yours[gap] - mine[gap]) === 0 ? "Your split matches mine." : "To match my split you would move " + moved + " of the 100 points. The biggest gap is " + BY_ID[gap].name.toLowerCase() + ".";
    cmp.innerHTML = '<p class="cmp-sum">' + esc(gapTxt) + '</p><p class="cmp-key">Black bars are yours, green bars are mine. No split is the right one. The useful question is what evidence would move it.</p>' + rows;
    const bars = cmp.querySelectorAll(".pair i");   // grow from zero, one row after another
    bars.forEach((b, i) => { b.style.transitionDelay = Math.floor(i / 2) * 60 + "ms"; });
    requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach((b) => { b.style.width = Math.min(100, b.dataset.w * 2.5) + "%"; })));
  });
  $("#reset").addEventListener("click", () => {
    ORDER.forEach((id) => { yours[id] = 0; $("#s_" + id).value = 0; $("#v_" + id).textContent = 0; });
    refresh();
  });
  refresh();

  /* -------------------------------- sources -------------------------------- */
  const SRC_ORDER = ["ap_bulletin", "ap_stern", "ap_settle", "ap_leg07", "balko", "booth", "brunner07", "brunner08", "seattlecenter", "eide", "horsefeathers", "kershner", "licata", "nba26", "fox13", "sleeper", "fos"];
  const uses = {};
  D.CAUSES.forEach((c) => c.evidence.forEach((e) => { uses[e.src] = (uses[e.src] || 0) + 1; }));
  $("#src-list").innerHTML = SRC_ORDER.map((id) => {
    const s = D.SOURCES[id], n = uses[id] || 0;
    return '<li class="src" id="src-' + id + '"><p class="mla">' + s.mla + "</p>" +
      '<p class="src-meta"><span>' + esc(s.kind) + "</span><span>" +
      (n ? "Used on " + n + (n === 1 ? " card" : " cards") : "Used in the timeline or comparison") + "</span>" +
      '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">Open the source</a></p></li>';
  }).join("");

  /* image credits: one line per image, from the same data the captions use */
  const clist = $("#credit-list");
  if (clist) {
    const rows = (D.IMAGES || []).map((m) => '<li><span>' + esc(m.title.replace(/\.(jpg|png)$/i, "").replace(/ \(\d{6,}\)$/, "")) + "</span> " + esc(shortAuthor(m.author)) + ', <a href="' + esc(m.licenseUrl) + '" target="_blank" rel="noopener">' + esc(m.license) + '</a>, <a href="' + esc(m.page) + '" target="_blank" rel="noopener">source</a>.</li>');
    clist.innerHTML = rows.join("");
  }

  render();

  /* Without the 3D chain, the hero button points at the timeline instead. */
  function pointCtaAtTimeline() {
    const cta = $(".hero-actions .btn");
    if (cta) { cta.setAttribute("href", "#timeline"); cta.textContent = "Follow the timeline"; }
  }
  if (html.classList.contains("no-3d")) {
    pointCtaAtTimeline();
    const a = $("#timeline"), b = $("#timeline-flat");     // the flat list takes over the #timeline anchor
    if (a && b) { a.id = "timeline-3d"; b.id = "timeline"; }
  }

  /* ------------------------- 3D layer, loaded lazily ------------------------- */
  if (html.classList.contains("has-3d")) {
    const go = () => import("./stage.js").then((m) => m.start(D)).catch((err) => {
      console.warn("3D layer failed to load; the page stays fully readable.", err);
      html.classList.remove("has-3d", "pre-motion"); html.classList.add("no-3d"); pointCtaAtTimeline();
      import("./stage.js").then((m) => m.flatTimeline && m.flatTimeline());
    });
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    window.addEventListener("load", () => idle(go, { timeout: 1500 }));
    // If scripts never arrive, never leave the headline hidden.
    setTimeout(() => html.classList.remove("pre-motion"), 4500);
  }
})();
