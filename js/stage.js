/* 3D and scroll-driven motion, loaded lazily on top of a page that already works without it.
   Hero: a green leather basketball with gold seam inlays.
   Chain: eight dominoes, one per event, tipped by scroll.
   Everything is built from primitives in code. No downloaded models. */
import * as THREE from "../vendor/three.min.js";

const html = document.documentElement;
const coarse = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
const MAX_DPR = coarse ? 1.5 : 1.75;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

/* Hand-tuned easing: CSS-style cubic beziers. */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-5) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    return sy(t);
  };
}
const arrive = bezier(0.16, 1, 0.3, 1);   // confident arrival
const fall = bezier(0.7, 0, 0.84, 0);     // gravity: slow start, hard finish

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error("failed to load " + src));
    document.head.appendChild(s);
  });
}

/* A tiny environment scene of softboxes, baked to a reflection map. This is the custom lighting. */
function makeEnvironment(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 16), new THREE.MeshBasicMaterial({ color: 0x04251a, side: THREE.DoubleSide })));
  const panel = (w, h, rgb, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb[0], rgb[1], rgb[2]), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(9, 6, [5.0, 4.5, 3.6], [-6, 6, 6]);     // key: large warm softbox, upper left
  panel(3, 10, [3.6, 2.5, 0.3], [8, 2, -6]);    // rim: tall gold strip, behind right
  panel(12, 3, [0.7, 1.0, 0.8], [0, -5, 5]);    // fill: low green-white bounce
  panel(2, 8, [2.0, 2.3, 2.1], [-9, 1, -3]);    // kicker: cool edge, left
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.04);
  pm.dispose();
  s.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  return rt.texture;
}

/* Keep frame time honest on a school laptop: step the pixel ratio down if frames run long. */
function perfGuard(renderer, resize) {
  let slow = 0, frames = 0, ratio = Math.min(devicePixelRatio, MAX_DPR);
  return (dt) => {
    frames++;
    slow += dt > 0.026 ? 1 : 0;
    if (frames === 45) {
      if (slow > 30 && ratio > 1) { ratio = Math.max(1, ratio - 0.25); renderer.setPixelRatio(ratio); resize(); }
      slow = 0; frames = 0;
    }
  };
}

/* Run a render loop only while its element is on screen and the tab is visible. */
function visibleLoop(el, tick) {
  let raf = 0, running = false, last = 0, inView = false;
  const frame = (t) => { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; tick(dt, t / 1000); };
  const sync = () => {
    const want = inView && !document.hidden;
    if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); }
  };
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; sync(); }, { rootMargin: "80px" }).observe(el);
  document.addEventListener("visibilitychange", sync);
  return { once: () => tick(0.016, performance.now() / 1000) };
}

/* ================================== HERO BALL ================================== */
function leather() {
  const w = 1024, h = 512;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = "#0f5b3a"; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 220; i++) {
    x.fillStyle = "rgba(" + (Math.random() < 0.5 ? "0,0,0" : "255,255,255") + "," + (0.012 + Math.random() * 0.02) + ")";
    x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 24 + Math.random() * 70, 0, 6.283); x.fill();
  }
  const b = document.createElement("canvas"); b.width = w; b.height = h;
  const y = b.getContext("2d");
  y.fillStyle = "#7a7a7a"; y.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    const px = Math.random() * w, py = Math.random() * h, r = 2.4 + Math.random() * 1.8;
    const g = y.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, "rgba(255,255,255,0.6)"); g.addColorStop(1, "rgba(122,122,122,0)");
    y.fillStyle = g; y.beginPath(); y.arc(px, py, r, 0, 6.283); y.fill();
  }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(b);
  return { map, bump };
}

function heroScene() {
  const stage = document.querySelector(".hero-stage");
  const canvas = document.getElementById("hero-canvas");
  if (!stage || !canvas) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_DPR));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50); camera.position.set(0, 0, 7.2);

  const key = new THREE.DirectionalLight(0xfff0d8, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const sky = new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.45); scene.add(sky);
  const rim = new THREE.PointLight(0xf6b800, 28, 0, 2); rim.position.set(4, -1, -3); scene.add(rim);

  const { map, bump } = leather();
  const ball = new THREE.Group(); scene.add(ball);
  const skin = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 2.0, roughness: 0.58, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.1 })
  );
  ball.add(skin);
  const inlay = new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.38, metalness: 0.55, envMapIntensity: 1.3 });
  const ring = (R, rx, ry, px) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, 0.017, 14, 160), inlay);
    m.rotation.set(rx, ry, 0); m.position.x = px; ball.add(m);
  };
  ring(0.997, 0, 0, 0);                    // meridian
  ring(0.997, Math.PI / 2, 0, 0);          // equator
  ring(0.864, 0, Math.PI / 2, 0.5);        // side channel, right
  ring(0.864, 0, Math.PI / 2, -0.5);       // side channel, left

  const state = { px: 0, py: 0, spin: 0, rx: 0, ry: 0, rz: 0, y: 0, born: 0, started: false };
  const pointer = (e) => { state.px = (e.clientX / innerWidth) * 2 - 1; state.py = (e.clientY / innerHeight) * 2 - 1; };
  if (!coarse) addEventListener("pointermove", pointer, { passive: true });

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    state.base = clamp((w / h) * 1.55, 0.55, 1.22);
  };
  new ResizeObserver(resize).observe(stage); resize();
  const guard = perfGuard(renderer, resize);

  const heroH = () => document.querySelector(".hero").offsetHeight;
  const tick = (dt, time) => {
    if (!state.started) { state.started = true; state.born = time; stage.classList.add("ready"); }
    const age = clamp((time - state.born) / 1.7, 0, 1), a = arrive(age);
    const p = clamp(scrollY / heroH(), 0, 1.2);
    state.spin += dt * 0.16;
    const tx = state.py * 0.32 + p * 0.9, ty = state.spin + state.px * 0.55 + (1 - a) * -1.6, tz = p * 0.5;
    state.rx = damp(state.rx, tx, 3, dt); state.ry = damp(state.ry, ty, 3, dt); state.rz = damp(state.rz, tz, 3, dt);
    state.y = damp(state.y, p * 1.1, 3, dt);
    ball.rotation.set(state.rx, state.ry, state.rz);
    ball.position.y = state.y;
    ball.scale.setScalar(state.base * (0.72 + 0.28 * a) * (1 - p * 0.18));
    renderer.render(scene, camera);
    guard(dt);
  };
  const loop = visibleLoop(stage, tick);
  canvas.addEventListener("webglcontextlost", () => { stage.classList.remove("ready"); }, false);
  loop.once();
  return { stage };
}

/* ================================= DOMINO CHAIN ================================= */
const T = 0.3, H = 1.7, D = 1.0, S = 1.1;       // thickness, height, width, spacing
const THETA = 1.12, THETA_LAST = 1.46;           // resting lean, last domino lies almost flat

/* Smallest angle the next domino must have so that this one (at angle th) does not pass through it. */
function push(th) {
  const px = H * Math.sin(th), py = H * Math.cos(th), dx = px - S, R = Math.hypot(py, dx);
  if (R <= T) return 1.5;
  return Math.max(0, Math.atan2(dx, py) + Math.asin(T / R));
}

const PIPS = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]], 8: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
};
const PALETTE = {
  city:   { body: 0x1a7a50, ink: "#f3e6b0" },
  owners: { body: 0xf6b800, ink: "#0a1a11" },
  both:   { body: 0xeef1ea, ink: "#063b26" },
};

function parseDate(str) {
  const m = str.match(/^([A-Za-z]+)\.?\s*(?:\d{1,2},\s*)?(\d{4})$/) || str.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return [str, ""];
  return m.length === 4 ? [m[1].slice(0, 3) + " " + m[2], m[3]] : [m[1].slice(0, 3), m[2]];
}

function dominoFace(ev, index, ink) {
  const w = 340, h = 580;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = ink; x.textAlign = "center"; x.textBaseline = "alphabetic";
  const [top, year] = parseDate(ev.date);
  x.font = '800 64px "Big Shoulders Display", "Arial Narrow", sans-serif';
  x.fillText(top.toUpperCase(), w / 2, 120);
  x.font = '900 150px "Big Shoulders Display", "Arial Narrow", sans-serif';
  x.fillText(year, w / 2, 255);
  x.fillRect(34, h / 2 - 5, w - 68, 10);
  const cell = 74, gx = w / 2 - cell, gy = h / 2 + 30;
  (PIPS[index + 1] || []).forEach(([cx, cy]) => { x.beginPath(); x.arc(gx + cx * cell, gy + 26 + cy * cell * 0.92, 22, 0, 6.283); x.fill(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function chainScene(D_, ctl) {
  const section = document.getElementById("chain");
  const canvas = document.getElementById("chain-canvas");
  const N = D_.CHAIN.length;
  const events = D_.CHAIN.map((i) => D_.EVENTS[i]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_DPR));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;   // default PCF filtering; softness comes from shadow.radius

  const BG = 0x04251a;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 9, 24);
  scene.environment = makeEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
  const sc = sun.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 6; sc.bottom = -6; sc.near = 0.5; sc.far = 30;
  sun.shadow.radius = 4; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.5));
  const rimLight = new THREE.PointLight(0xf6b800, 10, 0, 2); scene.add(rimLight);

  const fade = document.createElement("canvas"); fade.width = fade.height = 256;
  { const g = fade.getContext("2d"), r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "#fff"); r.addColorStop(0.55, "#bbb"); r.addColorStop(1, "#000"); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 15), new THREE.MeshStandardMaterial({ color: 0x0a4a30, roughness: 0.72, metalness: 0, envMapIntensity: 0.35, transparent: true, alphaMap: new THREE.CanvasTexture(fade) }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const bodyGeo = new THREE.RoundedBoxGeometry(T, H, D, 4, 0.05);
  const faceGeo = new THREE.PlaneGeometry(D * 0.86, H * 0.9);
  const dominoes = [];

  const build = () => {
    events.forEach((ev, i) => {
      const pal = PALETTE[ev.track] || PALETTE.both;
      const pivot = new THREE.Group();
      pivot.position.set(i * S + T / 2, 0, 0);
      const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: pal.body, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 1.0 }));
      body.position.set(-T / 2, H / 2, 0); body.castShadow = true; body.receiveShadow = true;
      pivot.add(body);
      const tex = dominoFace(ev, i, pal.ink);
      const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.45, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const front = new THREE.Mesh(faceGeo, mat); front.rotation.y = Math.PI / 2; front.position.set(T / 2 + 0.002, 0, 0);
      const back = new THREE.Mesh(faceGeo, mat); back.rotation.y = -Math.PI / 2; back.position.set(-T / 2 - 0.002, 0, 0);
      body.add(front, back);
      scene.add(pivot);
      dominoes.push({ pivot, body, lift: 0, theta: 0 });
    });
  };

  const view = { x: 0.5, aspect: 1 };
  const place = () => {
    const far = clamp(1.05 / view.aspect, 1, 2.1);
    camera.position.set(view.x - 4.4 * far, 3.0 * far + 0.2, 5.9 * far);
    camera.lookAt(view.x + 1.0, 0.8, 0);
    floor.position.x = view.x + 1.5;
    sun.position.set(view.x - 3, 7, 5); sun.target.position.set(view.x + 1, 0, 0); sun.target.updateMatrixWorld();
    rimLight.position.set(view.x + 5, 2.5, -3.5);
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); view.aspect = w / h; camera.aspect = view.aspect; camera.updateProjectionMatrix(); place();
  };
  new ResizeObserver(resize).observe(canvas); resize();
  const guard = perfGuard(renderer, resize);

  /* hover: a standing domino lifts a little */
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let hover = -1;
  canvas.addEventListener("pointermove", (e) => {
    if (coarse) return;
    const r = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(dominoes.map((d) => d.body), false);
    hover = hits.length ? dominoes.findIndex((d) => d.body === hits[0].object) : -1;
    canvas.style.cursor = hover >= 0 && dominoes[hover].theta < 0.05 ? "pointer" : "";
  }, { passive: true });
  canvas.addEventListener("pointerleave", () => { hover = -1; canvas.style.cursor = ""; });

  /* progress -> free fall angles; the contact solver keeps dominoes from passing through each other */
  const START = 0.04, GAP = 0.105, DUR = 0.16;
  const free = (p, i) => (i === N - 1 ? THETA_LAST : THETA) * fall(clamp((p - (START + i * GAP)) / DUR, 0, 1));
  const state = { p: 0, target: 0, focus: 0.5, ready: false };
  let lastEvent = -1;
  const el = { box: document.getElementById("chain-event"), count: document.getElementById("ce-count"), date: document.getElementById("ce-date"), title: document.getElementById("ce-title"), text: document.getElementById("ce-text"), src: document.getElementById("ce-src"), hint: document.getElementById("chain-hint") };
  const fill = (i) => {
    const ev = events[i];
    const cites = ev.src.map((id) => D_.SOURCES[id].short.split(",")[0].replace(/^Associated Press.*/, "Associated Press")).filter((v, k, a) => a.indexOf(v) === k).join(", ");
    el.count.textContent = "Event " + (i + 1) + " of " + N;
    el.date.textContent = ev.date; el.title.textContent = ev.title; el.text.textContent = ev.text; el.src.textContent = "Source: " + cites + ".";
  };
  const setEvent = (i, instant) => {
    if (i === lastEvent) return; lastEvent = i;
    if (instant) { fill(i); return; }
    el.box.classList.add("swap");
    setTimeout(() => { fill(i); el.box.classList.remove("swap"); }, 170);
  };

  const tick = (dt) => {
    state.p = damp(state.p, state.target, 6, dt);
    const p = state.p;
    const th = dominoes.map((_, i) => free(p, i));
    for (let i = 0; i < N - 1; i++) th[i + 1] = Math.max(th[i + 1], push(th[i]));
    let fallen = 0;
    dominoes.forEach((d, i) => {
      d.theta = th[i];
      fallen += clamp(th[i] / (i === N - 1 ? THETA_LAST : THETA), 0, 1);
      const target = i === hover && th[i] < 0.05 ? 0.07 : 0;
      d.lift = damp(d.lift, target, 10, dt);
      d.pivot.rotation.z = -th[i]; d.pivot.position.y = d.lift;
    });
    // camera follows the falling front, slightly ahead of it
    const front = Math.min(N - 1, fallen) * S;
    state.focus = damp(state.focus, 0.5 + front * 0.94, 2.6, dt);
    view.x = state.focus; place();

    let idx = 0;
    for (let i = 0; i < N; i++) if (p >= START + i * GAP - 0.035) idx = i;
    setEvent(idx);
    el.hint.classList.toggle("gone", p > 0.03);
    renderer.render(scene, camera);
    guard(dt);
  };

  const loop = visibleLoop(canvas, tick);
  canvas.addEventListener("webglcontextlost", ctl.lost, false);
  return {
    init() { build(); setEvent(0, true); resize(); loop.once(); section.classList.add("ready"); },
    setProgress(v) { state.target = v; },
  };
}

/* ==================================== START ==================================== */
export async function start(DATA) {
  await loadScript("vendor/gsap.min.js");
  await Promise.all([loadScript("vendor/ScrollTrigger.min.js"), loadScript("vendor/lenis.min.js")]);
  const { gsap, ScrollTrigger, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* smooth scrolling */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  try { await Promise.all([document.fonts.load('900 150px "Big Shoulders Display"'), document.fonts.load('800 64px "Big Shoulders Display"')]); } catch (e) { /* fall back to the stack */ }

  /* hero entrance: one authored moment */
  const spans = gsap.utils.toArray(".hero h1 .ln > span");
  gsap.set(spans, { y: 0, yPercent: 108 });   // y:0 overrides the pixel value GSAP would read from the CSS pre-state
  html.classList.remove("pre-motion");
  gsap.to(spans, { yPercent: 0, y: 0, duration: 1.3, ease: (x) => arrive(x), stagger: 0.09, delay: 0.1 });
  gsap.fromTo([".hero-q", ".hero-by", ".hero-actions"], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: (x) => arrive(x), stagger: 0.1, delay: 0.55 });

  let lost = false;
  const onLost = () => {
    if (lost) return; lost = true;
    html.classList.add("no-3d"); html.classList.remove("has-3d");
    const cta = document.querySelector(".hero-actions .btn"); if (cta) { cta.setAttribute("href", "#timeline"); cta.textContent = "Follow the timeline"; }
    ScrollTrigger.getAll().forEach((s) => s.kill());
    document.querySelector(".hero-stage")?.classList.remove("ready");
    ScrollTrigger.refresh();
  };

  try { heroScene(); } catch (e) { console.warn("hero scene unavailable", e); }

  /* domino chain: pinned, driven by scroll */
  let chain = null, chainBuilt = false;
  try {
    chain = chainScene(DATA, { lost: onLost });
    const mobile = innerWidth < 860;
    const navH = 64;
    ScrollTrigger.create({
      trigger: "#chain", start: "top " + navH, end: () => "+=" + Math.round(innerHeight * DATA.CHAIN.length * (mobile ? 0.62 : 0.74)),
      pin: ".chain-pin", pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => chain.setProgress(self.progress),
    });
    const near = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !chainBuilt) { chainBuilt = true; chain.init(); near.disconnect(); }
    }, { rootMargin: "140% 0px" });
    near.observe(document.getElementById("chain"));
  } catch (e) { console.warn("chain scene unavailable", e); onLost(); }

  /* parallax photo band: the second small moment */
  gsap.fromTo("#band .band-frame img", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: "#band", start: "top bottom", end: "bottom top", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 600);
}
