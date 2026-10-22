/* Why the Sonics Left Seattle · interactions. Vanilla JS, no build step. */
(function () {
  "use strict";
  const D = window.DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BY_ID = Object.fromEntries(D.CAUSES.map((c) => [c.id, c]));
  const safe = (fn) => { try { return fn(); } catch (e) { return null; } };

  /* ------------------------------ theme ------------------------------ */
  $("#theme").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    safe(() => localStorage.setItem("theme", next));
  });

  /* ---------------------------- mobile menu ---------------------------- */
  const menu = $("#menu"), menuBtn = $("#menu-btn");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close the section menu" : "Open the section menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ------------------------ scroll spy + reveal ------------------------ */
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

    const rev = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); rev.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((r) => rev.observe(r));
  } else {
    $$(".reveal").forEach((r) => r.classList.add("in"));
  }

  /* ------------------------------ dominoes ------------------------------ */
  const domRow = $("#dominoes"), domMsg = $("#dom-msg"), domGo = $("#dom-go"), domReset = $("#dom-reset");
  D.DOMINOES.forEach((label, i) => {
    const w = document.createElement("div");
    w.className = "dom-wrap";
    w.innerHTML = '<div class="dom"><b>' + (i + 1) + "</b></div><span>" + esc(label) + "</span>";
    domRow.appendChild(w);
  });
  let domTimers = [];
  domGo.addEventListener("click", () => {
    domGo.disabled = true;
    const doms = $$(".dom", domRow);
    doms.forEach((d, i) => {
      const t = setTimeout(() => {
        d.classList.add("fall");
        if (i === doms.length - 1) {
          domMsg.innerHTML = "<strong>That is the story I started with.</strong> Each cause falls on the next, so every step looks inevitable. But the evidence doesn’t work like that. Causes overlapped, pushed on each other, and some may have mattered less than they seem. Let’s take the dominoes apart.";
          domReset.hidden = false;
          domReset.focus();
        }
      }, reduceMotion ? 0 : i * 260);
      domTimers.push(t);
    });
  });
  domReset.addEventListener("click", () => {
    domTimers.forEach(clearTimeout); domTimers = [];
    $$(".dom", domRow).forEach((d) => d.classList.remove("fall"));
    domMsg.textContent = "Tip the first domino to watch the chain fall.";
    domReset.hidden = true; domGo.disabled = false; domGo.focus();
  });

  /* ------------------------------ timeline ------------------------------ */
  const TRACK = { city: "Seattle and Washington", owners: "The owners", both: "Both sides" };
  const tl = $("#tl");
  D.EVENTS.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "tl-row" + (ev.track === "both" ? " is-both" : "");
    const cites = ev.src.map((id) => D.SOURCES[id].short.split(",")[0].replace(/^Associated Press.*/, "Associated Press")).filter((v, i, a) => a.indexOf(v) === i).join(" · ");
    li.innerHTML =
      '<span class="tl-date">' + esc(ev.date) + "</span>" +
      '<div class="tl-card ' + ev.track + '">' +
        '<span class="tag">' + TRACK[ev.track] + "</span>" +
        "<h3>" + esc(ev.title) + "</h3>" +
        "<p>" + esc(ev.text) + "</p>" +
        '<p class="src-note">Source: ' + esc(cites) + "</p>" +
        '<button type="button" class="go" data-node="' + ev.node + '">See the cause: ' + esc(BY_ID[ev.node].name) + " →</button>" +
      "</div>";
    li.querySelector(".tl-card").addEventListener("click", (e) => { if (!e.target.closest("button")) select(ev.node, true); });
    li.querySelector("button").addEventListener("click", () => select(ev.node, true));
    tl.appendChild(li);
  });

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
  mk("path", { d: "M0 0 L10 5 L0 10 z", style: "fill:var(--arrow)" }, marker);
  const gSpokes = mk("g", {}, svg), gArrows = mk("g", {}, svg), gNodes = mk("g", {}, svg), gHub = mk("g", {}, svg);
  D.CAUSES.forEach((c) => mk("line", { class: "spoke", x1: c.x, y1: c.y, x2: CX, y2: CY, "stroke-width": 1 + c.weight / 5 }, gSpokes));
  mk("circle", { class: "hub", cx: CX, cy: CY, r: 56 }, gHub);
  mk("text", { class: "hub-t", x: CX, y: CY - 3 }, gHub).textContent = "Sonics leave";
  mk("text", { class: "hub-s", x: CX, y: CY + 15 }, gHub).textContent = "July 2008";

  D.CAUSES.forEach((c) => {
    const g = mk("g", { class: "node " + c.theme, tabindex: "0", role: "button", "aria-label": c.name + ", my weight " + c.weight + " out of 100. " + D.THEMES[c.theme] + ".", "data-id": c.id }, gNodes);
    mk("circle", { class: "body", cx: c.x, cy: c.y, r: c.r }, g);
    const label = mk("text", { x: c.x, y: c.y + 5, "font-size": c.r > 48 ? 14 : 12.5, "data-full": c.short, "data-tiny": c.tiny }, g);
    label.textContent = c.short;
    g.addEventListener("click", () => select(c.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(c.id); } });
  });

  // On narrow screens the SVG is scaled down, so use shorter labels (CSS enlarges them).
  const narrow = window.matchMedia("(max-width: 640px)");
  function labelMode() { $$(".node text").forEach((t) => { t.textContent = narrow.matches ? t.dataset.tiny : t.dataset.full; }); }
  labelMode();
  if (narrow.addEventListener) narrow.addEventListener("change", labelMode);

  // Tap-friendly list of causes under the web (shown on small screens by CSS).
  const webChips = $("#web-chips");
  webChips.innerHTML = ORDER.map((id) => '<button type="button" class="chip" aria-pressed="false" data-chip="' + id + '">' + esc(BY_ID[id].name) + "</button>").join("");
  $$("[data-chip]", webChips).forEach((b) => b.addEventListener("click", () => select(b.dataset.chip)));

  function drawArrows(id) {
    gArrows.innerHTML = "";
    const s = BY_ID[id];
    s.links.forEach((l) => {
      const t = BY_ID[l.to];
      const dx = t.x - s.x, dy = t.y - s.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      mk("line", { class: "arrow-line", x1: s.x + ux * (s.r + 5), y1: s.y + uy * (s.r + 5), x2: t.x - ux * (t.r + 9), y2: t.y - uy * (t.r + 9), "marker-end": "url(#arr)" }, gArrows);
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
    if (fromTimeline) {
      $("#causes").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setTimeout(() => detail.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
    }
  }

  function render() {
    if (!current) {
      detail.innerHTML =
        "<h3>Start anywhere</h3>" +
        '<p class="sum">Select a circle on the web, or begin with one of these:</p>' +
        '<div class="chips" style="margin-top:12px">' +
        ORDER.map((id) => '<button class="chip" type="button" data-go="' + id + '">' + esc(BY_ID[id].name) + "</button>").join("") +
        "</div>" +
        '<h4>How to read it</h4><p class="empty ui" style="font-size:.95rem;line-height:1.55">Bigger circles carry more weight in my current argument. Each evidence card says whose voice it carries and what limits it, so you can judge how far to trust it. Dashed arrows are connections I am arguing for.</p>';
      $$("[data-go]", detail).forEach((b) => b.addEventListener("click", () => select(b.dataset.go)));
      return;
    }
    const c = BY_ID[current];
    const voices = [["all", "All sources"]].concat(Object.entries(D.VOICES));
    const matching = c.evidence.filter((e) => lens === "all" || e.voice === lens).length;
    detail.innerHTML =
      "<h3>" + esc(c.name) + "</h3>" +
      '<div class="meta"><span class="pill">' + esc(D.THEMES[c.theme]) + '</span><span class="pill gold">' + esc(c.when) + "</span></div>" +
      '<p class="sum">' + esc(c.summary) + "</p>" +
      '<div class="weight-row"><span>My working weight <em>(provisional)</em></span><span><b>' + c.weight + "</b> / 100</span></div>" +
      '<div class="meter" aria-hidden="true"><i style="width:' + Math.min(100, c.weight * 2.5) + '%"></i></div>' +
      "<h4>Evidence · " + matching + " of " + c.evidence.length + " cards match this voice</h4>" +
      '<div class="chips" role="group" aria-label="Filter evidence by whose voice it carries">' +
      voices.map((v) => '<button class="chip" type="button" aria-pressed="' + (lens === v[0]) + '" data-lens="' + v[0] + '">' + esc(v[1]) + "</button>").join("") +
      "</div>" +
      c.evidence.map((e) => {
        const s = D.SOURCES[e.src], on = lens === "all" || e.voice === lens;
        return '<article class="ev' + (on ? "" : " dim") + '">' +
          '<div class="ev-head"><a href="#src-' + e.src + '">' + esc(s.short) + "</a><span>· " + esc(e.when) + "</span></div>" +
          "<p>" + esc(e.text) + "</p>" +
          '<div class="lim"><b>Limit:</b> ' + esc(e.limit) + "</div>" +
          '<div class="tags"><span class="pill gold">Skill ' + e.hts + '</span><span class="pill line">Voice: ' + esc(D.VOICES[e.voice]) + "</span></div>" +
          "</article>";
      }).join("") +
      (c.links.length
        ? '<h4>How it connects · my argument</h4><ul class="links">' +
          c.links.map((l) => '<li>→ <button type="button" data-go="' + l.to + '">' + esc(BY_ID[l.to].name) + "</button>: " + esc(l.label) + "</li>").join("") +
          "</ul>"
        : '<h4>How it connects</h4><p class="empty">This one is the final permission, so it pushes on nothing else in my web.</p>');
    $$("[data-lens]", detail).forEach((b) => b.addEventListener("click", () => { lens = b.dataset.lens; render(); }));
    $$("[data-go]", detail).forEach((b) => b.addEventListener("click", () => select(b.dataset.go)));
  }

  /* list alternative */
  $("#list-body").innerHTML = D.CAUSES.slice().sort((a, b) => b.weight - a.weight).map((c) =>
    "<tr><td>" + esc(c.name) + '</td><td class="tabular">' + c.weight + "</td><td>" + esc(D.THEMES[c.theme]) + "</td><td>" +
    (c.links.length ? c.links.map((l) => esc(BY_ID[l.to].name)).join(", ") : "Nothing (final permission)") + "</td></tr>").join("");

  /* --------------------------- weigh it yourself --------------------------- */
  const slidersEl = $("#sliders"), totalEl = $("#total"), compareBtn = $("#compare"), cmp = $("#cmp");
  const mine = Object.fromEntries(D.CAUSES.map((c) => [c.id, c.weight]));
  const yours = Object.fromEntries(D.CAUSES.map((c) => [c.id, 0]));
  slidersEl.innerHTML = ORDER.map((id) =>
    '<div class="sl"><label for="s_' + id + '"><span>' + esc(BY_ID[id].name) + '</span><output id="v_' + id + '" for="s_' + id + '">0</output></label>' +
    '<input id="s_' + id + '" type="range" min="0" max="100" step="1" value="0"></div>').join("");
  const total = () => Object.values(yours).reduce((a, b) => a + b, 0);
  function refresh() {
    const t = total();
    totalEl.textContent = "Points used: " + t + " / 100" + (t > 100 ? " (over by " + (t - 100) + ")" : t < 100 && t > 0 ? " (" + (100 - t) + " left)" : "");
    totalEl.classList.toggle("bad", t > 100);
    compareBtn.disabled = t !== 100;
    cmp.innerHTML = "";
  }
  ORDER.forEach((id) => {
    $("#s_" + id).addEventListener("input", (e) => { yours[id] = +e.target.value; $("#v_" + id).textContent = yours[id]; refresh(); });
  });
  compareBtn.addEventListener("click", () => {
    const rows = ORDER.slice().sort((a, b) => mine[b] - mine[a]).map((id) => {
      const diff = yours[id] - mine[id];
      const note = diff === 0 ? "same" : diff > 0 ? "you gave " + diff + " more" : "you gave " + -diff + " fewer";
      return '<div class="cmp-row"><span>' + esc(BY_ID[id].name) + '</span><span class="pair" aria-hidden="true"><i class="y" style="width:' + yours[id] + '%"></i><i class="m" style="width:' + mine[id] + '%"></i></span><span class="tabular">' + yours[id] + " vs " + mine[id] + " · " + note + "</span></div>";
    }).join("");
    cmp.innerHTML = '<p class="cmp-key"><b class="y">Yours</b> <b class="m">Mine</b> No weighting is the right one. The question is what evidence would move it.</p>' + rows;
  });
  $("#reset").addEventListener("click", () => {
    ORDER.forEach((id) => { yours[id] = 0; $("#s_" + id).value = 0; $("#v_" + id).textContent = 0; });
    refresh();
  });

  /* -------------------------------- sources -------------------------------- */
  const SRC_ORDER = ["ap_bulletin", "ap_stern", "ap_settle", "ap_leg07", "balko", "booth", "brunner07", "brunner08", "seattlecenter", "eide", "horsefeathers", "kershner", "licata", "nba26", "fox13", "sleeper", "fos"];
  const uses = {};
  D.CAUSES.forEach((c) => c.evidence.forEach((e) => { uses[e.src] = (uses[e.src] || 0) + 1; }));
  $("#src-list").innerHTML = SRC_ORDER.map((id) => {
    const s = D.SOURCES[id], n = uses[id] || 0;
    return '<li class="card src" id="src-' + id + '"><p class="mla">' + s.mla + "</p>" +
      '<div class="src-meta"><span class="pill gold">' + esc(s.kind) + "</span>" +
      (n ? '<span class="pill line">Used on ' + n + (n === 1 ? " card" : " cards") + "</span>" : '<span class="pill line">Used in the timeline or comparison</span>') +
      '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">Open the source ↗</a></div></li>';
  }).join("");

  render();
})();
