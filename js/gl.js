/* One persistent WebGL renderer for the whole page.
   A single fixed canvas sits behind the page text. Each 3D area is a "stage": a DOM element
   whose rectangle the renderer draws into with a scissor (the three.js webgl_multiple_elements idea).
   Stages that are off-screen are not drawn. When none are on screen the loop stops. */
import * as THREE from "../vendor/three.min.js";
export { THREE };

export const coarse = matchMedia("(pointer: coarse)").matches || innerWidth < 760;
export const MAX_DPR = coarse ? 1.5 : 1.75;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

/* Shared easing. arrive = things appearing, fall = things dropping. */
export function bezier(x1, y1, x2, y2) {
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
export const arrive = bezier(0.16, 1, 0.3, 1);
export const fall = bezier(0.7, 0, 0.84, 0);

let renderer = null, canvas = null, W = 0, H = 0, ratio = 1;
export let env = null;
const stages = [];
let raf = 0, running = false, last = 0, idle = 0, slow = 0, frames = 0;
const listeners = { lost: [] };

/* A tiny scene of softboxes baked to a reflection map. The custom lighting every scene shares. */
function makeEnvironment() {
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

function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setPixelRatio(ratio);
  renderer.setSize(W, H, false);
}

export function init() {
  if (renderer) return renderer;
  canvas = document.createElement("canvas");
  canvas.id = "gl"; canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  ratio = Math.min(devicePixelRatio, MAX_DPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  resize();
  env = makeEnvironment();
  let rz = 0;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { resize(); wake(); }, 120); });
  addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", wake);
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); listeners.lost.forEach((f) => f()); });
  return renderer;
}

export const getRenderer = () => renderer;
export const onLost = (f) => listeners.lost.push(f);

/* stage = { el, scene, camera, update(dt, time, rect), margin, enabled } */
export function addStage(stage) {
  stage.enabled = stage.enabled !== false;
  stage._aspect = 0;
  stages.push(stage);
  wake();
  return stage;
}
export function removeStage(stage) { const i = stages.indexOf(stage); if (i >= 0) stages.splice(i, 1); }

export function wake() {
  if (running || !renderer || document.hidden) return;
  running = true; last = performance.now(); idle = 0;
  raf = requestAnimationFrame(frame);
}
function stop() { running = false; cancelAnimationFrame(raf); }

function frame(t) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
  if (document.hidden) { stop(); return; }

  const vis = [];
  for (const s of stages) {
    if (!s.enabled) continue;
    const r = s.el.getBoundingClientRect(), m = s.margin ?? 60;
    if (r.width < 2 || r.height < 2 || r.bottom < -m || r.top > H + m) { s.visible = false; continue; }
    s.visible = true; vis.push([s, r]);
  }
  if (!vis.length) { if (++idle > 24) stop(); return; }
  idle = 0;

  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, W, H);
  renderer.clear();
  renderer.setScissorTest(true);
  for (const [s, r] of vis) {
    const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
    if (x1 <= x0 || y1 <= y0) continue;
    renderer.setViewport(r.left, H - r.bottom, r.width, r.height);
    renderer.setScissor(x0, H - y1, x1 - x0, y1 - y0);
    const a = r.width / r.height;
    if (Math.abs(a - s._aspect) > 1e-4) { s._aspect = a; s.camera.aspect = a; s.camera.updateProjectionMatrix(); s.onAspect && s.onAspect(a, r); }
    try {
      s.update && s.update(dt, t / 1000, r);
      renderer.render(s.scene, s.camera);
    } catch (err) {
      // one broken stage must never stop the others
      s._errors = (s._errors || 0) + 1;
      if (s._errors === 1) console.error("3D stage failed:", s.el.id || s.el.className, err);
      if (s._errors >= 5) { s.enabled = false; s.onFail && s.onFail(err); }
    }
  }

  // keep frame time honest on a school laptop: step the pixel ratio down if frames run long
  frames++; if (dt > 0.026) slow++;
  if (frames === 45) {
    if (slow > 30 && ratio > 1) { ratio = Math.max(1, ratio - 0.25); resize(); }
    slow = 0; frames = 0;
  }
}

/* A stage is "on screen" for other code that wants to know. */
export const visibleStages = () => stages.filter((s) => s.visible);
