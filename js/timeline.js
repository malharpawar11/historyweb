/* Timeline stage: the camera travels a curved path along a gold date spine, Oct 2006 to Jul 2008.
   Seattle's events sit left, the owners' right, shared events on the spine. Every card is the real HTML
   card, projected to its place in depth, so text stays selectable and readable.
   Six milestones get more scroll, a larger card and a domino that tips as the camera passes. */
import { THREE, env, addStage, clamp, damp, fall, coarse } from "./gl.js";
import { makeDomino } from "./dominoes.js";

const smooth = (f) => f * f * (3 - 2 * f);

export function init(DATA, api) {
  const pin = document.querySelector(".tl3d-pin");
  const stageEl = document.getElementById("tl-stage");
  const host = document.getElementById("tl-cards");
  const ol = document.getElementById("tl");
  const ruler = document.getElementById("tl-ruler");
  const hint = document.getElementById("tl-hint");
  if (!pin || !stageEl || !host || !ol) return null;

  const events = DATA.EVENTS, N = events.length;
  host.appendChild(ol); ol.classList.add("tl-3d");
  const rows = Array.from(ol.children);

  /* ---- path: a gentle S through the floor plane ---- */
  const pts = [[0, 0], [5, -9], [-3, -19], [6, -29], [-2, -40], [5, -50], [0, -61], [-4, -72], [2, -84]].map(([x, z]) => new THREE.Vector3(x, 0.05, z));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  const L = curve.getLength();

  /* ---- where each event sits along the path, and how much scroll each stretch gets ---- */
  const sw = []; for (let k = 0; k < N - 1; k++) sw.push(1 + (events[k + 1].ms ? 0.55 : 0));
  const cum = [0]; sw.forEach((w) => cum.push(cum[cum.length - 1] + w));
  const total = cum[N - 1];
  const T0 = 0.08, T1 = 0.92, PAD = 0.035;
  const t = cum.map((c) => T0 + (T1 - T0) * (c / total));                 // path position of each event
  const pAt = cum.map((c) => PAD + (1 - 2 * PAD) * (c / total));          // scroll progress of each event
  const uOfP = (p) => {
    const q = clamp((p - PAD) / (1 - 2 * PAD), 0, 1) * total;
    let k = 0; while (k < N - 2 && q > cum[k + 1]) k++;
    return t[k] + (t[k + 1] - t[k]) * smooth(clamp((q - cum[k]) / sw[k], 0, 1));
  };

  /* ---- scene ---- */
  const BG = 0x04251a;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 9, 36);
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);

  scene.add(new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.55));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
  const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 0.5; sc.far = 40;
  sun.shadow.radius = 4; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const rimLight = new THREE.PointLight(0xf6b800, 14, 0, 2); scene.add(rimLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 130), new THREE.MeshStandardMaterial({ color: 0x063b26, roughness: 0.85, metalness: 0, envMapIntensity: 0.25 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -40); floor.receiveShadow = true; scene.add(floor);

  // the lane: a ribbon along the path, with a gold spine down the middle
  {
    const M = 260, pos = [], idx = [];
    for (let j = 0; j <= M; j++) {
      const P = curve.getPointAt(j / M), tg = curve.getTangentAt(j / M), rx = -tg.z, rz = tg.x;
      pos.push(P.x + rx * 1.25, 0.012, P.z + rz * 1.25, P.x - rx * 1.25, 0.012, P.z - rz * 1.25);
      if (j < M) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const lane = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x0c4f33, roughness: 0.7, envMapIntensity: 0.3, side: THREE.DoubleSide }));
    lane.receiveShadow = true; scene.add(lane);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 420, 0.032, 8, false), new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.4, metalness: 0.5, emissive: 0x3a2a00, envMapIntensity: 1.2 })));
  }

  // dust that gives the air some depth
  {
    const n = coarse ? 220 : 420, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const P = curve.getPointAt(Math.random()); p[i * 3] = P.x + (Math.random() - 0.5) * 16; p[i * 3 + 1] = Math.random() * 6; p[i * 3 + 2] = P.z + (Math.random() - 0.5) * 16; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf6d36a, size: 0.05, transparent: true, opacity: 0.45, sizeAttenuation: true, depthWrite: false })));
  }

  /* ---- events: tick, stem, node, and a domino at each milestone ---- */
  const NODE = { city: 0xeef1ea, owners: 0x1a7a50, both: 0xf6b800 };
  const anchors = [], dominoes = [];
  let ordinal = 0;
  events.forEach((ev, i) => {
    const P = curve.getPointAt(t[i]), tg = curve.getTangentAt(t[i]);
    const right = new THREE.Vector3(-tg.z, 0, tg.x);
    const phi = Math.atan2(-tg.z, tg.x);
    const lateral = ev.track === "city" ? -2.1 : ev.track === "owners" ? 2.1 : 0;
    const anchor = P.clone().addScaledVector(right, lateral); anchor.y = ev.track === "both" ? 2.0 : 1.1;
    anchors.push(anchor);

    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 2.5), new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.4, metalness: 0.5, emissive: 0x2a1f00 }));
    tick.position.set(P.x, 0.03, P.z); tick.rotation.y = phi; scene.add(tick);

    const stemGeo = new THREE.BufferGeometry(); stemGeo.setAttribute("position", new THREE.Float32BufferAttribute([P.x, 0.05, P.z, anchor.x, anchor.y, anchor.z], 3));
    scene.add(new THREE.Line(stemGeo, new THREE.LineBasicMaterial({ color: 0xa8c0b2, transparent: true, opacity: 0.55 })));
    const r = ev.ms ? 0.2 : 0.12;
    const node = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshStandardMaterial({ color: NODE[ev.track], roughness: 0.35, metalness: 0.1, envMapIntensity: 1.1, emissive: ev.track === "both" ? 0x3a2a00 : 0x000000 }));
    node.position.copy(anchor); scene.add(node);

    if (ev.ms) {
      ordinal++;
      const g = new THREE.Group(); g.position.set(P.x, 0, P.z); g.rotation.y = phi; g.scale.setScalar(0.85);
      const d = makeDomino(ev, ordinal); g.add(d.pivot); scene.add(g);
      dominoes.push({ i, pivot: d.pivot });
    }
  });

  /* ---- progress, camera, cards ---- */
  const st = { p: 0, target: 0, u: t[0], cur: 0 };
  const v = new THREE.Vector3(), cv = new THREE.Vector3(), look = new THREE.Vector3();
  const behind = 6.6 / L, ahead = 3.4 / L;

  function place(u, time, rect) {
    const a = curve.getPointAt(clamp(u - behind, 0, 1)); a.y = 2.9 + Math.sin(time * 0.35) * 0.06;
    a.x += Math.sin(time * 0.27) * 0.14;
    camera.position.copy(a);
    curve.getPointAt(clamp(u + ahead, 0, 1), look); look.y = 0.9;
    camera.lookAt(look);
    camera.updateMatrixWorld();
    const f = curve.getPointAt(clamp(u + 1.5 / L, 0, 1));
    sun.position.set(f.x - 3.5, 8, f.z + 5); sun.target.position.set(f.x + 0.5, 0, f.z - 1); sun.target.updateMatrixWorld();
    rimLight.position.set(f.x + 4, 2.4, f.z - 7);
    const w = rect.width, h = rect.height, narrow = w < 760;
    let best = 0, bestD = 1e9;
    rows.forEach((row, i) => {
      const du = (u - t[i]) * L;                       // metres along the path, negative = still ahead
      if (Math.abs(du) < bestD) { bestD = Math.abs(du); best = i; }
      cv.copy(anchors[i]).applyMatrix4(camera.matrixWorldInverse);
      const inFront = cv.z < -1.2;
      const fadeFar = clamp(1 - Math.max(0, -du - 3.2) / 7.5, 0, 1);
      const fadePast = clamp(1 - Math.max(0, du - 0.8) / 2.4, 0, 1);
      const o = inFront ? Math.min(fadeFar, fadePast) : 0;
      if (o < 0.02) { if (!row._off) { row.style.visibility = "hidden"; row.style.pointerEvents = "none"; row._off = true; } return; }
      row._off = false; row.style.visibility = "visible";
      v.copy(anchors[i]).project(camera);
      let x = (v.x * 0.5 + 0.5) * w; let y = (-v.y * 0.5 + 0.5) * h;
      if (narrow) x = w / 2 + (x - w / 2) * 0.25;
      const d = -cv.z, s = clamp(8.2 / d, 0.2, 0.98) * (events[i].ms ? 1.06 : 1) * (narrow ? 0.9 : 1);
      // keep the whole card on screen, clear of the heading block and the ruler
      const hw = (row.offsetWidth * s) / 2 + 16, hh = (row.offsetHeight * s) / 2 + 12;
      x = clamp(x, hw, w - hw); y = clamp(y, hh + 70, h - hh - 64);
      if (!narrow && x - hw < 470 && y - hh < 250) y = 250 + hh; else if (narrow && y - hh < 120) y = 120 + hh;   // stay below the heading block
      row.style.opacity = o.toFixed(3);
      row.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) scale(" + s.toFixed(3) + ")";
      row.style.zIndex = String(Math.round(2000 / d));
      row.style.pointerEvents = o > 0.7 && s > 0.6 ? "auto" : "none";
    });
    return best;
  }

  const stage = addStage({
    el: stageEl, scene, camera, margin: 200,
    update(dt, time, rect) {
      st.p = damp(st.p, st.target, 6, dt);
      st.u = uOfP(st.p);
      const u = st.u;
      dominoes.forEach((d) => {
        const f = fall(clamp((u - (t[d.i] - 0.9 / L)) / (2.8 / L), 0, 1));
        d.pivot.rotation.z = -f * 1.5;
      });
      const best = place(u, time, rect);
      if (best !== st.cur) {
        st.cur = best;
        if (ruler) Array.from(ruler.children).forEach((li, k) => li.firstChild.setAttribute("aria-current", k === best ? "true" : "false"));
      }
      if (hint) hint.classList.toggle("gone", st.p > 0.02);
    },
  });

  /* ---- ruler: every event is a button, so the timeline works by keyboard too ---- */
  if (ruler) {
    ruler.innerHTML = "";
    events.forEach((ev, i) => {
      const li = document.createElement("li");
      li.className = ev.ms ? "ms" : "";
      const b = document.createElement("button");
      b.type = "button"; b.textContent = ev.date; b.setAttribute("aria-label", "Go to " + ev.date + ": " + ev.title);
      b.addEventListener("click", () => api.goTo(pAt[i]));
      li.appendChild(b); ruler.appendChild(li);
    });
  }

  /* ---- scroll: pin the stage and drive progress ---- */
  const trigger = api.ScrollTrigger.create({
    trigger: "#timeline", start: "top 64", end: () => "+=" + Math.round(innerHeight * total * (coarse ? 0.46 : 0.52)),
    pin: ".tl3d-pin", pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate: (self) => { st.target = self.progress; },
  });
  // let other code jump to a given progress
  api.goTo = (p) => { const y = trigger.start + (trigger.end - trigger.start) * p; if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: "smooth" }); };

  st.p = st.target = 0;
  if (/[?&]debug\b/.test(location.search)) window.__tl = { snap(p) { st.p = st.target = p; }, pAt, t, L, N };   // deterministic frames for capture
  return { stage, trigger, N };
}
