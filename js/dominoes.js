/* Rounded dominoes with engraved dates and pips, drawn to canvas textures.
   Green = Seattle's side, gold = the owners', ivory = shared events. */
import { THREE } from "./gl.js";

export const T = 0.3, H = 1.7, D = 1.0;

const PIPS = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]], 8: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
};
export const PALETTE = {
  city:   { body: 0x1a7a50, ink: "#f3e6b0" },
  owners: { body: 0xf6b800, ink: "#0a1a11" },
  both:   { body: 0xeef1ea, ink: "#063b26" },
};

function parseDate(str) {
  const m = str.match(/^([A-Za-z]+)\.?\s*(?:\d{1,2},\s*)?(\d{4})$/);
  return m ? [m[1].slice(0, 3), m[2]] : [str, ""];
}

function face(ev, count, ink) {
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
  (PIPS[count] || []).forEach(([cx, cy]) => { x.beginPath(); x.arc(gx + cx * cell, gy + 26 + cy * cell * 0.92, 22, 0, 6.283); x.fill(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

let bodyGeo = null, faceGeo = null;

/* Returns { pivot, body }. The pivot sits on the front-bottom edge so rotating it about Z tips the domino toward +X. */
export function makeDomino(ev, count) {
  bodyGeo = bodyGeo || new THREE.RoundedBoxGeometry(T, H, D, 4, 0.05);
  faceGeo = faceGeo || new THREE.PlaneGeometry(D * 0.86, H * 0.9);
  const pal = PALETTE[ev.track] || PALETTE.both;
  const pivot = new THREE.Group();
  pivot.position.set(T / 2, 0, 0);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: pal.body, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 1.0 }));
  body.position.set(-T / 2, H / 2, 0); body.castShadow = true; body.receiveShadow = true;
  pivot.add(body);
  const mat = new THREE.MeshStandardMaterial({ map: face(ev, count, pal.ink), transparent: true, roughness: 0.45, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const front = new THREE.Mesh(faceGeo, mat); front.rotation.y = Math.PI / 2; front.position.set(T / 2 + 0.002, 0, 0);
  const back = new THREE.Mesh(faceGeo, mat); back.rotation.y = -Math.PI / 2; back.position.set(-T / 2 - 0.002, 0, 0);
  body.add(front, back);
  return { pivot, body };
}
