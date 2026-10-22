/* Answer scene: one pinned screen, five beats.
   Behind the text, two doors slide shut. Their faces are real photographs: Seattle City Hall (the city's route)
   and the Washington Legislative Building (the state's route). Through the gap between them, a gold light and
   the Oklahoma City arena. A ball rolls toward the gap. The words, figures and citations are plain HTML.
   Below 900px wide, or with no WebGL, the flat layout stays. */
import { THREE, env, addStage, clamp, damp, arrive, wake } from "./gl.js";

const DOOR_W = 3.3, DOOR_H = 5.8, DOOR_T = 0.34, GAP = 0.5;
const CLOSED = GAP / 2 + DOOR_W / 2, OPEN = CLOSED + 4.5;

const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

export function init(DATA, api) {
  const section = document.getElementById("argument");
  const stageEl = document.getElementById("ans-stage");
  if (!section || !stageEl || innerWidth < 900) return false;
  const { gsap, ScrollTrigger } = api;

  /* ---- scene ---- */
  const scene = new THREE.Scene();
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0.2, 10.5);
  scene.add(new THREE.HemisphereLight(0xcfe9dc, 0x04251a, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.6); key.position.set(-5, 6, 8); scene.add(key);
  const glow = new THREE.PointLight(0xf6b800, 0, 0, 2); glow.position.set(0, 0, -1.2); scene.add(glow);

  const loader = new THREE.TextureLoader();
  const tex = (name) => { const t = loader.load("assets/img/" + name + "-duo-800.webp", wake); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  // backdrop: the Oklahoma City arena, dim, behind everything
  const backTex = tex("ford-center");
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.4), new THREE.MeshBasicMaterial({ map: backTex, color: 0x6f7f76 }));
  back.position.set(0, 0.1, -3); scene.add(back);
  // lit exit: a tall gold strip in the gap
  const exitMat = new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0 });
  const exit = new THREE.Mesh(new THREE.PlaneGeometry(GAP * 1.6, DOOR_H), exitMat);
  exit.position.set(0, 0, -1.4); scene.add(exit);
  // light spilling through the gap onto the floor
  const spillMat = new THREE.MeshBasicMaterial({ color: 0xf6b800, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(GAP * 2.4, 7), spillMat);
  spill.rotation.x = -Math.PI / 2; spill.position.set(0, -DOOR_H / 2 + 0.012, 3.4); scene.add(spill);
  // floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), new THREE.MeshStandardMaterial({ color: 0x04251a, roughness: 0.42, metalness: 0.3, envMapIntensity: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -DOOR_H / 2, 2); scene.add(floor);

  // doors: green body, gold edge, photo face
  const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0x063b26, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf6b800, roughness: 0.32, metalness: 0.7, envMapIntensity: 1.2 });
  function door(name, side) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_T), edgeMat);
    g.add(body);
    const t = tex(name);
    t.repeat.set(0.4, 1); t.offset.set(0.3, 0);        // centre crop of the landscape photo
    const face = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W - 0.3, DOOR_H - 0.3), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0, envMapIntensity: 0.5 }));
    face.position.z = DOOR_T / 2 + 0.003; g.add(face);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, DOOR_H, 0.16), goldMat);        // gold meeting edge
    bar.position.set(-side * (DOOR_W / 2 - 0.05), 0, DOOR_T / 2 + 0.05); g.add(bar);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12), goldMat);
    handle.position.set(-side * (DOOR_W / 2 - 0.4), 0, DOOR_T / 2 + 0.18); g.add(handle);
    g.position.set(side * OPEN, 0, 0);
    scene.add(g);
    return g;
  }
  const doorL = door("city-hall", -1), doorR = door("legislative-building", 1);

  // the ball: gold leather, dark seams
  const ball = new THREE.Group();
  const bm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0xf6b800, roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.4, envMapIntensity: 1 }));
  ball.add(bm);
  const seamMat = new THREE.MeshStandardMaterial({ color: 0x0a1a11, roughness: 0.7 });
  [0, Math.PI / 2].forEach((r) => { const s = new THREE.Mesh(new THREE.TorusGeometry(0.502, 0.012, 8, 64), seamMat); s.rotation.y = r; ball.add(s); });
  const sEq = new THREE.Mesh(new THREE.TorusGeometry(0.502, 0.012, 8, 64), seamMat); sEq.rotation.x = Math.PI / 2; ball.add(sEq);
  ball.position.set(0, -DOOR_H / 2 + 0.5, 6); scene.add(ball);

  /* ---- scroll-driven state ---- */
  const S = { doorL: 0, doorR: 0, ball: 0, lit: 0 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  stageEl.parentElement.addEventListener("pointermove", (e) => {
    const r = stageEl.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  });

  const stage = addStage({
    el: stageEl, scene, camera, margin: 120,
    update(dt, time) {
      pointer.x = damp(pointer.x, pointer.tx, 3, dt); pointer.y = damp(pointer.y, pointer.ty, 3, dt);
      camera.position.x = pointer.x * 0.5; camera.position.y = 0.25 - pointer.y * 0.25;
      camera.lookAt(0, 0, 0);
      doorL.position.x = -(OPEN + (CLOSED - OPEN) * arrive(S.doorL));
      doorR.position.x = OPEN + (CLOSED - OPEN) * arrive(S.doorR);
      const b = smooth(S.ball);
      ball.position.z = 6 + (1.4 - 6) * b;
      ball.position.y = -DOOR_H / 2 + 0.5 + Math.abs(Math.sin(b * 13)) * 0.45 * (1 - b);
      ball.position.x = Math.sin(b * 5) * 0.18 * (1 - b);
      ball.rotation.x = -b * 26;
      ball.scale.setScalar(1);
      const lit = smooth(S.lit);
      exitMat.opacity = 0.85 * lit; spillMat.opacity = 0.55 * lit; glow.intensity = 55 * lit;
      back.material.color.setScalar(0.42 + 0.58 * lit);
    },
  });
  stage.onFail = () => flat();

  /* ---- the credit line, from the same data the figures use ---- */
  const IMG = Object.fromEntries((DATA.IMAGES || []).map((i) => [i.id, i]));
  const who = (a) => a.replace(/ from .*$/, "");
  const cr = (id, label) => { const m = IMG[id]; return m ? label + ": " + who(m.author) + ', <a href="' + m.licenseUrl + '" target="_blank" rel="noopener">' + m.license + '</a>, <a href="' + m.page + '" target="_blank" rel="noopener">Wikimedia Commons</a>' : ""; };
  document.getElementById("ans-credit").innerHTML = "Photos on the scene, cropped and tinted green and gold. " + [cr("city-hall", "Left door, Seattle City Hall"), cr("legislative-building", "Right door, Washington Legislative Building"), cr("ford-center", "Backdrop, Oklahoma City arena")].filter(Boolean).join(". ") + ".";

  /* ---- the five beats on one pinned timeline ---- */
  const q = (s) => gsap.utils.toArray(s, section);
  const beats = q(".beat"), stats = q(".stat"), notes = q(".claims > div");
  const route = section.querySelector("#route"), routeLine = section.querySelector("#route-line");
  const len = routeLine.getTotalLength();
  gsap.set(routeLine, { strokeDasharray: "14 12", strokeDashoffset: 0 });
  section.classList.add("ans-3d");
  gsap.set(beats, { opacity: 0, y: 26 });
  gsap.set([...stats, ...notes], { opacity: 0, y: 18 });
  gsap.set(route, { opacity: 0 });

  const E = (x) => arrive(x);
  const show = (tl, el, at, d = 0.7) => tl.to(el, { opacity: 1, y: 0, duration: d, ease: E }, at);
  const hide = (tl, el, at, d = 0.45) => tl.to(el, { opacity: 0, y: -18, duration: d, ease: "power2.in" }, at);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: section.querySelector(".ans-pin"), start: "top top", end: () => "+=" + Math.round(innerHeight * 6.2), pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
  });
  // beat 1: the answer
  show(tl, beats[0], 0.1);
  // beat 2: both routes close
  hide(tl, beats[0], 1.2); show(tl, beats[1], 1.45, 0.8);
  tl.to(S, { doorL: 1, duration: 0.9 }, 1.7).to(S, { doorR: 1, duration: 0.9 }, 2.8);
  show(tl, stats[0], 2.0, 0.6); show(tl, stats[1], 3.1, 0.6);
  // beat 3: Oklahoma City, and the vote
  hide(tl, beats[1], 4.3); show(tl, beats[2], 4.55, 0.8);
  tl.to(stageEl, { opacity: 0.12, duration: 0.5 }, 4.4).to(route, { opacity: 1, duration: 0.6 }, 4.6)
    .fromTo(routeLine, { strokeDashoffset: len }, { strokeDashoffset: 0, strokeDasharray: len, duration: 1.1 }, 4.9)
    .set(routeLine, { strokeDasharray: "14 12" }, 6.0);
  show(tl, stats[2], 5.2, 0.6);
  // beat 4: the pull quote, the ball rolls to the lit exit
  hide(tl, beats[2], 6.5); hide(tl, route, 6.4); tl.to(stageEl, { opacity: 1, duration: 0.5 }, 6.5);
  show(tl, beats[3], 6.9, 0.8);
  tl.to(S, { ball: 1, duration: 1.8 }, 6.9).to(S, { lit: 1, duration: 1.2 }, 7.4);
  // beat 5: what else matters, and the three notes
  hide(tl, beats[3], 8.9); hide(tl, stats, 8.8); show(tl, beats[4], 9.15, 0.8);
  show(tl, notes[0], 9.5, 0.6); show(tl, notes[1], 9.95, 0.6); show(tl, notes[2], 10.4, 0.6);
  tl.to({}, { duration: 0.8 }, 11.0);   // a short rest on the last frame

  /* ---- lite mode / failure: back to the flat layout ---- */
  function flat() {
    tl.scrollTrigger && tl.scrollTrigger.kill(true); tl.kill();
    section.classList.remove("ans-3d");
    gsap.set([...beats, ...stats, ...notes, route, stageEl], { clearProps: "all" });
    const sp = section.querySelector(".pin-spacer"); void sp;
    ScrollTrigger.refresh();
  }
  return { stage, flat };
}
