/* Hero stage: a green leather basketball with gold seam inlays, built from primitives.
   It turns slowly, leans toward the cursor and rolls up and away as the page scrolls. */
import { THREE, env, addStage, clamp, damp, arrive, coarse } from "./gl.js";

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
  return { map, bump: new THREE.CanvasTexture(b) };
}

export function init() {
  const stageEl = document.querySelector(".hero-stage");
  if (!stageEl) return null;

  const scene = new THREE.Scene();
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50); camera.position.set(0, 0, 7.2);

  const key = new THREE.DirectionalLight(0xfff0d8, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.45));
  const rim = new THREE.PointLight(0xf6b800, 28, 0, 2); rim.position.set(4, -1, -3); scene.add(rim);

  const { map, bump } = leather();
  const ball = new THREE.Group(); scene.add(ball);
  ball.add(new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 2.0, roughness: 0.58, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.1 })
  ));
  const inlay = new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.38, metalness: 0.55, envMapIntensity: 1.3 });
  const ring = (R, rx, ry, px) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, 0.017, 14, 160), inlay);
    m.rotation.set(rx, ry, 0); m.position.x = px; ball.add(m);
  };
  ring(0.997, 0, 0, 0); ring(0.997, Math.PI / 2, 0, 0); ring(0.864, 0, Math.PI / 2, 0.5); ring(0.864, 0, Math.PI / 2, -0.5);

  const st = { px: 0, py: 0, spin: 0, rx: 0, ry: 0, rz: 0, y: 0, born: -1, base: 1 };
  if (!coarse) addEventListener("pointermove", (e) => { st.px = (e.clientX / innerWidth) * 2 - 1; st.py = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const hero = document.querySelector(".hero");

  return addStage({
    el: stageEl, scene, camera, margin: 120,
    onAspect(a) { st.base = clamp(a * 1.55, 0.55, 1.22); },
    update(dt, time) {
      if (st.born < 0) { st.born = time; stageEl.classList.add("ready"); }
      const a = arrive(clamp((time - st.born) / 1.7, 0, 1));
      const p = clamp(scrollY / hero.offsetHeight, 0, 1.2);
      st.spin += dt * 0.16;
      st.rx = damp(st.rx, st.py * 0.32 + p * 0.9, 3, dt);
      st.ry = damp(st.ry, st.spin + st.px * 0.55 + (1 - a) * -1.6, 3, dt);
      st.rz = damp(st.rz, p * 0.5, 3, dt);
      st.y = damp(st.y, p * 1.1, 3, dt);
      ball.rotation.set(st.rx, st.ry, st.rz);
      ball.position.y = st.y;
      ball.scale.setScalar(st.base * (0.72 + 0.28 * a) * (1 - p * 0.18));
    },
  });
}
