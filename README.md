# Why the Sonics Left Seattle

A Real History project by **Malhar Pawar** (2026).

> What was the effect of the public arena-funding dispute on the SuperSonics' departure from Seattle, 2006–2008?

One page, designed top to bottom: a 3D basketball hero, a pinned 3D timeline that follows a curved date spine, a draggable 3D web of seven causes with the evidence behind each, a "weigh it yourself" tool with a live 100-point stack, a pinned five-beat answer, a 2006–2008 vs 2026 comparison, and the MLA source list with image credits.

Built with Claude Code. Plain HTML, CSS and JavaScript. No framework, no build step.

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Useful query strings:

| URL | What it does |
|---|---|
| `/?static` | Forces the no-3D version, to test or demo the fallback |
| `/?debug` | Exposes `window.__tl` (timeline) and `window.__graph` (causes) for screenshots and tests |

## Deploy on Vercel

1. In Vercel choose **Add New → Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Deploy. Add your own domain under **Settings → Domains**.

`vercel.json` sets security headers and caching.

## How the page works

**One renderer.** A single fixed canvas (`#gl`) sits behind the page text. Each 3D area is a *stage*, a DOM rectangle the renderer draws into with a scissor (the three.js `webgl_multiple_elements` idea, and the same single-canvas approach Lusion uses). Off-screen stages are not drawn, and when none is on screen the loop stops and the canvas is cleared. A broken stage is switched off on its own and falls back to its flat version.

**One motion system.** Lenis drives GSAP ScrollTrigger. Two easings (`arrive` for things appearing, `fall` for things dropping) and one heading reveal are reused in every section. All text, quotes, citations and links stay real HTML above the canvas.

| Section | What it is |
|---|---|
| Hero | Green leather basketball with gold seam inlays, reacts to the cursor and to scroll. |
| Question | Duotone 2006 Sonics photo, one large number (41 years), the key definitions. |
| Timeline | Pinned 3D scene. The camera follows a curved path along a gold date spine. Seattle events on one side, the owners' on the other, shared events in the middle. Each event is its real HTML card, projected into depth. Six milestones get a domino, a larger card and more scroll. A ruler of date buttons gives keyboard access. |
| Causes | Draggable 3D force graph (d3-force-3d layout, custom three.js materials). Nodes sized by weight, colored by theme. Drag rotates, a pulled node springs back, hover lights a node and its links, click flies the camera and opens the evidence. Labels are real buttons, so Tab and Enter work. "View the web as a list" stays. |
| Weigh it | A stack of colored blocks resizes live as the sliders move, the count rolls, comparison bars grow in one after another. |
| Answer | Pinned scene, five beats. Two doors faced with Seattle City Hall and the Legislative Building slide shut, a gold ball rolls toward the lit gap, a Seattle to Oklahoma City route draws in. Figures and the three side notes appear in sequence. |
| Now | KeyArena band, three-photo strip (1962, 2018, 2022), comparison table and status list that ease in. |
| Sources | MLA entries and a credit line for every image. No 3D. |

### Lite mode, fallbacks and performance

- **Lite mode** (button in the nav, remembered in this browser) turns off every 3D scene and all scroll motion and shows the clean 2D page.
- No WebGL, reduced motion, data saver, `?static` or a screen narrower than 900px for the Answer scene: the flat layout of the same content.
- The 3D layer loads lazily after the page is readable. Gzipped: three.js 144 KB (tree-shaken), d3-force-3d 9, GSAP 28, ScrollTrigger 18, Lenis 5, page scripts about 30.
- Pixel ratio is capped at 1.75 (1.5 on phones) and steps down automatically if frames run long. Shadow maps are 1024 (512 on phones). Images are WebP in two sizes.

### Rebuilding the vendored three.js
`vendor/three.min.js` is three.js tree-shaken to the classes this site uses (the list is in the entry file below).

```bash
npm install three esbuild
# entry file: export { WebGLRenderer, Scene, TextureLoader, ... } from "three"; plus RoundedBoxGeometry from three/examples
npx esbuild three-entry.js --bundle --minify --format=esm --target=es2020 --outfile=vendor/three.min.js
```

## Where things live

| Path | What it is |
|---|---|
| `index.html` | Page structure and the written argument |
| `js/data.js` | **All evidence**: sources (MLA), causes, evidence cards, timeline events |
| `js/images.js` | Image captions, alt text, licenses (mirrors `IMAGE_CREDITS.md`) |
| `js/app.js` | Content interactions: timeline cards, causal web, filters, weigh-it, credits, lite mode, menu |
| `js/stage.js` | Orchestrator for motion and 3D (lazy loaded) |
| `js/gl.js` | The shared renderer, stages, easings, lighting |
| `js/hero.js`, `js/timeline.js`, `js/dominoes.js`, `js/graph.js`, `js/answer.js` | One file per 3D area |
| `css/styles.css` | Tokens and layout |
| `assets/img/` | Licensed photos as WebP (plain, duotone, 800 and 1600 wide) |
| `docs/PLAN.md` | The plan this pass followed |
| `PRODUCT.md`, `DESIGN.md` | What the site is for and the design system |
| `IMAGE_CREDITS.md` | Source URL, author, license and retrieval date for every image |

Every evidence card is paraphrased from the source it names and carries the thinking skill it demonstrates (5B or 6C), whose voice it carries, and a limitation.

## Credits

- **Images:** all from Wikimedia Commons under the license shown on the page and in `IMAGE_CREDITS.md`. No stock or generated images.
- **Logo:** the Seattle SuperSonics logo is a trademark of its owners and appears only for educational commentary. This project is not affiliated with or endorsed by the NBA or any team.
- **Fonts:** Big Shoulders Display and Newsreader via Google Fonts (SIL Open Font License).
- **Libraries:** [three.js](https://threejs.org) (MIT), [d3-force-3d](https://github.com/vasturiano/d3-force-3d) (MIT), [GSAP and ScrollTrigger](https://gsap.com) (GreenSock standard license), [Lenis](https://lenis.darkroom.engineering) (MIT).
- Design guidance from the avoid-ai-design and Impeccable rule sets, and UI/UX Pro Max.

## Notes

The weights on the causal web are a provisional argument and will change as the research continues. The site is a first-draft version for a school project.
