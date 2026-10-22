/* Causes stage: a draggable 3D force graph of the seven causes around "Sonics leave".
   Layout by d3-force-3d, drawn with my own materials on the shared renderer.
   Drag the background to rotate. Pull a circle and it springs back. Hover lights a node and its links.
   Click, Enter or a link from elsewhere flies the camera to a cause and opens its evidence.
   Labels are real HTML buttons, so Tab and Enter work. */
import { THREE, env, addStage, clamp, damp, coarse } from "./gl.js";
import * as d3 from "../vendor/d3-force-3d.min.js";

const COLORS = { PCE: 0xeef1ea, WXT: 0xf6b800, ARC: 0x2d7a57 };
const LABEL_INK = { PCE: "#0a1a11", WXT: "#0a1a11", ARC: "#ffffff" };

export function init(DATA, api) {
  const stageEl = document.getElementById("graph-stage");
  const labelsEl = document.getElementById("graph-labels");
  if (!stageEl || !labelsEl) return null;

  const causes = DATA.CAUSES;
  const ORDER = ["keyarena", "attendance", "i91", "state", "owners", "okc", "nba"];
  const rOf = (w) => (0.42 + w * 0.012) * (coarse ? 1.22 : 1);

  /* ---- nodes, anchors and links ---- */
  const hub = { id: "hub", r: 0.8, fx: 0, fy: 0, fz: 0, x: 0, y: 0, z: 0, ax: 0, ay: 0, az: 0 };
  const zOf = { PCE: 1.25, WXT: -1.25, ARC: 0 };   // theme sets depth, so the legend reads in 3D too
  const byId = {};
  const nodes = [hub];
  ORDER.forEach((id, i) => {
    const c = causes.find((x) => x.id === id);
    const a = ((-90 + (i * 360) / ORDER.length) * Math.PI) / 180;
    const n = { id, c, r: rOf(c.weight), ax: (coarse ? 2.8 : 3.3) * Math.cos(a), ay: (coarse ? 3.1 : 2.7) * Math.sin(a), az: zOf[c.theme] };
    n.x = n.ax; n.y = n.ay; n.z = n.az;
    byId[id] = n; nodes.push(n);
  });
  byId.hub = hub;
  const spokes = ORDER.map((id) => ({ source: "hub", target: id }));
  const arrows = [];
  causes.forEach((c) => c.links.forEach((l) => arrows.push({ from: c.id, to: l.to })));

  const sim = d3.forceSimulation(nodes, 3)
    .force("link", d3.forceLink(spokes).id((d) => d.id).distance(3.4).strength(0.22))
    .force("charge", d3.forceManyBody().strength(-0.6).distanceMax(5))
    .force("collide", d3.forceCollide((d) => d.r + 0.3))
    .force("x", d3.forceX((d) => d.ax).strength(0.22))
    .force("y", d3.forceY((d) => d.ay).strength(0.22))
    .force("z", d3.forceZ((d) => d.az).strength(0.22))
    .alphaDecay(0.035).velocityDecay(0.32).stop();
  for (let i = 0; i < 160; i++) sim.tick();
  sim.alpha(0);
  if (location.search.includes("debug")) window.__graph = { nodes, spokes, sim, get stage() { return stage; } };

  /* ---- scene ---- */
  const scene = new THREE.Scene();
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  scene.add(new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.6));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.4); key.position.set(-4, 5, 6); scene.add(key);
  const rimL = new THREE.PointLight(0xf6b800, 22, 0, 2); rimL.position.set(5, -2, -4); scene.add(rimL);
  const group = new THREE.Group(); scene.add(group);

  const meshes = {};
  nodes.forEach((n) => {
    const isHub = n.id === "hub";
    const mat = new THREE.MeshPhysicalMaterial({
      color: isHub ? 0x063b26 : COLORS[n.c.theme], roughness: isHub ? 0.4 : 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.28,
      envMapIntensity: 1.1, emissive: 0x000000,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(n.r, 48, 32), mat);
    m.userData.id = n.id; group.add(m); meshes[n.id] = m;
    if (isHub) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(n.r * 1.12, 0.035, 12, 96), new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.35, metalness: 0.6, emissive: 0x2a1f00 }));
      m.add(ring);
    }
  });

  // spokes: thin cylinders from the hub
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
  const spokeMeshes = spokes.map((s) => {
    const mesh = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: 0xa8c0b2, transparent: true, opacity: 0.3, depthWrite: false }));
    const idOf = (v) => (typeof v === "object" ? v.id : v);   // d3's link force swaps ids for node objects
    mesh.userData = { a: idOf(s.source), b: idOf(s.target) }; group.add(mesh); return mesh;
  });
  // arrows: marching gold dashes plus a cone head
  const dashGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.16, 6);
  const coneGeo = new THREE.ConeGeometry(0.1, 0.3, 14);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xf6b800, transparent: true });
  const arrowObjs = arrows.map((a) => {
    const dashes = []; for (let k = 0; k < 24; k++) { const d = new THREE.Mesh(dashGeo, arrowMat); d.visible = false; group.add(d); dashes.push(d); }
    const head = new THREE.Mesh(coneGeo, arrowMat); group.add(head);
    return { ...a, dashes, head };
  });
  // selection ring
  const selRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 10, 72), new THREE.MeshBasicMaterial({ color: 0xf6b800 }));
  selRing.visible = false; group.add(selRing);

  // dust
  {
    const n = coarse ? 120 : 260, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 16; p[i * 3 + 1] = (Math.random() - 0.5) * 11; p[i * 3 + 2] = (Math.random() - 0.5) * 12; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    group.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xf6d36a, size: 0.045, transparent: true, opacity: 0.4, depthWrite: false })));
  }

  /* ---- HTML labels: the nodes' accessible, keyboard-reachable face ---- */
  const labels = {};
  ORDER.forEach((id) => {
    const n = byId[id];
    const b = document.createElement("button");
    b.type = "button"; b.className = "gnode"; b.dataset.id = id;
    b.setAttribute("aria-label", n.c.name + ", my weight " + n.c.weight + " out of 100. " + DATA.THEMES[n.c.theme] + ".");
    b.style.color = LABEL_INK[n.c.theme];
    b.textContent = n.c.short;
    b.addEventListener("click", () => select(id));
    b.addEventListener("focus", () => { hover = id; focusOn(id, false); });
    b.addEventListener("blur", () => { if (hover === id) hover = null; });
    labelsEl.appendChild(b); labels[id] = b;
  });
  const hubLabel = document.createElement("span"); hubLabel.className = "ghub"; hubLabel.innerHTML = "<b>Sonics leave</b><i>July 2008</i>"; hubLabel.setAttribute("aria-hidden", "true");
  labelsEl.appendChild(hubLabel);

  /* ---- state ---- */
  const HOME = coarse ? 16.2 : 18.6;   // camera distance that fits the whole web
  let hover = null, selected = null, focusTarget = null, dist = HOME, distT = HOME;
  const st = { vyaw: 0, vpitch: 0, interacting: false, idleFor: 0, drag: null };
  const hl = {}; nodes.forEach((n) => { hl[n.id] = { glow: 0, scale: 1 }; });
  const neighbors = (id) => {
    const s = new Set([id]);
    if (id === "hub") ORDER.forEach((x) => s.add(x)); else { s.add("hub"); arrows.forEach((a) => { if (a.from === id) s.add(a.to); if (a.to === id) s.add(a.from); }); }
    return s;
  };

  function select(id) { window.__selectCause ? window.__selectCause(id) : focusOn(id, true); }
  function focusOn(id, fly) {
    selected = fly ? id : selected;
    const n = byId[id]; if (!n) return;
    focusTarget = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(n.x, n.y, n.z).normalize(), new THREE.Vector3(0, 0, 1));
    distT = 14; st.idleFor = 0;
  }
  document.addEventListener("cause-select", (e) => { selected = e.detail.id; focusOn(e.detail.id, true); });

  /* ---- pointer: rotate the graph, pull a node, hover ---- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3();
  const pick = (e) => {
    const r = stageEl.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(meshes), false);
    return hits.length ? hits[0] : null;
  };
  const onMove = (e) => {
    if (st.drag) return;
    const h = pick(e); const id = h ? h.object.userData.id : null;
    if (id !== hover) { hover = id; stageEl.style.cursor = id && id !== "hub" ? "pointer" : "grab"; }
  };
  stageEl.addEventListener("pointermove", onMove);
  stageEl.addEventListener("pointerleave", () => { if (!st.drag) { hover = null; stageEl.style.cursor = ""; } });
  stageEl.addEventListener("pointerdown", (e) => {
    stageEl.setPointerCapture(e.pointerId);
    const h = pick(e);
    st.interacting = true; st.idleFor = 0; focusTarget = null; distT = HOME;
    st.drag = { id: h && h.object.userData.id !== "hub" ? h.object.userData.id : null, x: e.clientX, y: e.clientY, moved: 0, lx: e.clientX, ly: e.clientY };
    if (st.drag.id) {
      const n = byId[st.drag.id]; st.drag.plane = group.localToWorld(new THREE.Vector3(n.x, n.y, n.z));
      sim.alphaTarget(0.25).restart().stop();
    }
    stageEl.style.cursor = "grabbing";
  });
  stageEl.addEventListener("pointermove", (e) => {
    const d = st.drag; if (!d) return;
    d.moved += Math.abs(e.clientX - d.lx) + Math.abs(e.clientY - d.ly);
    if (d.id && d.moved > 6) {
      // pull the node on a plane facing the camera
      const r = stageEl.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const nrm = camera.getWorldDirection(tmp2).clone();
      const denom = ray.ray.direction.dot(nrm);
      if (Math.abs(denom) > 1e-4) {
        const tt = tmp.copy(d.plane).sub(ray.ray.origin).dot(nrm) / denom;
        const w = ray.ray.origin.clone().addScaledVector(ray.ray.direction, tt);
        group.worldToLocal(w);
        const n = byId[d.id]; n.fx = w.x; n.fy = w.y; n.fz = w.z;
      }
    } else if (!d.id) {
      const dx = e.clientX - d.lx, dy = e.clientY - d.ly;
      st.vyaw = dx * 0.0042; st.vpitch = dy * 0.0042;
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.0062);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.0062));
      group.quaternion.premultiply(q);
    }
    d.lx = e.clientX; d.ly = e.clientY;
  });
  const end = (e) => {
    const d = st.drag; if (!d) return;
    if (d.id) {
      const n = byId[d.id]; n.fx = null; n.fy = null; n.fz = null;       // let go: the anchor force springs it back
      sim.alphaTarget(0).alpha(0.7);
      if (d.moved < 6) select(d.id);
    }
    st.drag = null; st.interacting = false; stageEl.style.cursor = hover ? "pointer" : "grab";
  };
  stageEl.addEventListener("pointerup", end); stageEl.addEventListener("pointercancel", end);

  /* ---- per frame ---- */
  const proj = new THREE.Vector3(), cam = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const orient = (mesh, a, b, radius) => {
    tmp3.subVectors(b, a); const len = tmp3.length();
    mesh.position.copy(a).addScaledVector(tmp3, 0.5);
    mesh.quaternion.setFromUnitVectors(up, tmp3.normalize());
    mesh.scale.set(radius, len, radius);
  };

  const stage = addStage({
    el: stageEl, scene, camera, margin: 120,
    onAspect(a) { st.fit = clamp(1 / Math.min(1, a * 1.02), 1, 1.6); },
    update(dt, time, rect) {
      if (sim.alpha() > sim.alphaMin() || st.drag) sim.tick();
      // orientation: focus on a cause, or inertia, or a slow drift
      if (focusTarget && !st.drag) {
        group.quaternion.slerp(focusTarget, 1 - Math.exp(-4.2 * dt));
        st.vyaw = st.vpitch = 0;
      } else if (!st.drag) {
        if (Math.abs(st.vyaw) + Math.abs(st.vpitch) > 1e-4) {
          const q = new THREE.Quaternion().setFromAxisAngle(up, st.vyaw);
          q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), st.vpitch));
          group.quaternion.premultiply(q);
          st.vyaw *= Math.exp(-3.2 * dt); st.vpitch *= Math.exp(-3.2 * dt);
        } else {
          st.idleFor += dt;
          if (st.idleFor > 1.5 && !hover && !selected) group.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(up, dt * 0.07));
        }
      }
      dist = damp(dist, distT * (st.fit || 1), 3, dt);
      camera.position.set(0, 0.4, dist); camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      // node meshes, highlight state
      const live = hover || selected, nb = live ? neighbors(live) : null;
      nodes.forEach((n) => {
        const m = meshes[n.id]; m.position.set(n.x, n.y, n.z);
        const h = hl[n.id];
        const on = n.id === hover || n.id === selected;
        h.glow = damp(h.glow, on ? 1 : 0, 10, dt); h.scale = damp(h.scale, on ? 1.1 : 1, 10, dt);
        m.scale.setScalar(h.scale);
        m.material.emissive.setRGB(0.32 * h.glow, 0.22 * h.glow, 0.0);
        m.material.opacity = 1; m.material.transparent = false;
        if (nb && !nb.has(n.id)) { m.material.transparent = true; m.material.opacity = 0.35; }
      });
      // links
      spokeMeshes.forEach((s) => {
        orient(s, meshes[s.userData.a].position, meshes[s.userData.b].position, 0.018);
        const lit = !nb || (nb.has(s.userData.a) && nb.has(s.userData.b) && (live === s.userData.a || live === s.userData.b));
        s.material.opacity = damp(s.material.opacity, lit ? (nb ? 0.8 : 0.3) : 0.08, 10, dt);
      });
      arrowObjs.forEach((ar) => {
        const A = meshes[ar.from].position, B = meshes[ar.to].position;
        const ra = byId[ar.from].r * 1.05, rb = byId[ar.to].r * 1.1;
        tmp.subVectors(B, A); const len = tmp.length(), dir = tmp.clone().normalize();
        const s0 = ra, s1 = len - rb - 0.3, span = Math.max(0.01, s1 - s0), step = 0.3;
        const off = (time * 0.35) % step;
        ar.dashes.forEach((d, k) => {
          const s = s0 + off + k * step;
          if (s > s1) { d.visible = false; return; }
          d.visible = true; d.position.copy(A).addScaledVector(dir, s); d.quaternion.setFromUnitVectors(up, dir);
        });
        ar.head.position.copy(A).addScaledVector(dir, len - rb - 0.15); ar.head.quaternion.setFromUnitVectors(up, dir);
        const lit = !nb || live === ar.from || live === ar.to;
        arrowMat.opacity = 1;
        ar.dashes.forEach((d) => (d.scale.y = lit ? 1 : 0.6));
        ar._lit = lit;
      });
      if (selected) { selRing.visible = true; const m = meshes[selected]; selRing.position.copy(m.position); selRing.scale.setScalar(byId[selected].r * 1.28); selRing.lookAt(camera.position); }
      else selRing.visible = false;

      // labels follow the nodes
      group.updateMatrixWorld(true);
      const w = rect.width, h = rect.height, hf = Math.tan((camera.fov * Math.PI) / 360);
      ORDER.concat("hub").forEach((id) => {
        const m = meshes[id], n = byId[id];
        m.getWorldPosition(proj);
        cam.copy(proj).applyMatrix4(camera.matrixWorldInverse);
        const d = -cam.z;
        proj.project(camera);
        const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
        const px = (n.r * h) / (2 * hf * d) * 2 * (id === "hub" ? 1 : hl[id].scale);
        const el = id === "hub" ? hubLabel : labels[id];
        el.style.width = el.style.height = px.toFixed(1) + "px";
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%)";
        let L = 5;
        if (id !== "hub") {   // small circles get the one-word label
          const want = px < 84 ? n.c.tiny : n.c.short;
          if (labels[id].textContent !== want) labels[id].textContent = want;
          L = Math.max(...want.split(/\s+/).map((w) => w.length));
        }
        el.style.fontSize = Math.max(10, Math.min(clamp(px * 0.2, 11, 17), (px * 0.84) / (L * 0.64))).toFixed(1) + "px";
        el.style.zIndex = String(Math.round(1000 / d));
        const dim = nb && !nb.has(id);
        el.style.opacity = id === "hub" ? "1" : (dim ? 0.4 : clamp(1.4 - (d - 7) * 0.06, 0.7, 1)).toFixed(2);
      });
    },
  });
  return { stage, focusOn };
}
