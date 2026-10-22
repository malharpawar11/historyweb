# Why the Sonics Left Seattle

A Real History project by **Malhar Pawar** (2026).

> What was the effect of the public arena-funding dispute on the SuperSonics' departure from Seattle, 2006–2008?

A research site with a 3D basketball hero, a scroll-driven chain of eight dominoes (one per event), a two-track timeline, a causal web of seven possible causes with the evidence behind each, a "weigh it yourself" tool, a 2006–2008 vs 2026 comparison, and the MLA source list.

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
| `/?debug` | Exposes `window.__chain.snap(p)` to render the domino scene at an exact scroll progress (used for screenshots) |

## Deploy on Vercel

1. In Vercel choose **Add New → Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Deploy. Add your own domain under **Settings → Domains**.

`vercel.json` sets security headers and caching.

## How the 3D works

- **Hero:** a green leather basketball built from a sphere, a canvas-drawn leather and bump texture, and four gold torus seam inlays. It reacts slowly to the cursor and to scroll.
- **Chain:** eight rounded dominoes with engraved dates and pips drawn to canvas textures. Dominoes are green for Seattle's side, gold for the owners', ivory for shared events. Scroll tips them one after another, a small contact solver keeps them from passing through each other, and the camera backs away at the end to show the whole fallen chain.
- **Lighting:** a tiny scene of softboxes baked to a reflection map, plus a key light with shadows and a gold rim light.
- **Motion:** GSAP + ScrollTrigger drive the headline entrance, the pinned scene and one parallax photo band. Lenis smooths scrolling. Easing is hand-tuned cubic beziers, not defaults.
- No downloaded models. Everything is made in code.

### Fallbacks and performance
- The page is complete without any of it. The 3D layer loads lazily after the page is readable (about 200 KB gzipped: three.js 141, GSAP 28, ScrollTrigger 18, Lenis 5, scene code 8).
- No WebGL, reduced motion, data saver or `?static`: a flat basketball, no pinned scene, the plain two-track timeline, native scrolling.
- Pixel ratio is capped at 1.75 (1.5 on phones) and steps down automatically if frames run long. Rendering pauses when a canvas is off-screen or the tab is hidden. Shadow maps are 1024 (512 on phones).

### Rebuilding the vendored three.js
`vendor/three.min.js` is three.js tree-shaken to the classes this site uses.

```bash
npm install three esbuild
# entry file: export { WebGLRenderer, Scene, ... } from "three"; plus RoundedBoxGeometry from three/examples
npx esbuild three-entry.js --bundle --minify --format=esm --target=es2020 --outfile=vendor/three.min.js
```

## Where things live

| Path | What it is |
|---|---|
| `index.html` | Page structure and the written argument |
| `js/data.js` | **All evidence**: sources (MLA), causes, evidence cards, timeline events, which events become dominoes |
| `js/app.js` | Content interactions: timeline, causal web, filters, weigh-it tool, menu |
| `js/stage.js` | The 3D scenes and scroll motion (lazy loaded) |
| `css/styles.css` | Tokens and layout |
| `vendor/` | three.js (bundled), GSAP, ScrollTrigger, Lenis |
| `PRODUCT.md`, `DESIGN.md` | What the site is for and the design system |

Every evidence card is paraphrased from the source it names and carries the thinking skill it demonstrates (5B or 6C), whose voice it carries, and a limitation.

## Credits

- **Photo:** "KeyArena" by Cliff from Arlington, Virginia, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:KeyArena_(2890740573).jpg), licensed [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Resized and cropped.
- **Logo:** the Seattle SuperSonics logo is a trademark of its owners and appears only for educational commentary. This project is not affiliated with or endorsed by the NBA or any team.
- **Fonts:** Big Shoulders Display and Newsreader via Google Fonts (SIL Open Font License).
- **Libraries:** [three.js](https://threejs.org) (MIT), [GSAP and ScrollTrigger](https://gsap.com) (GreenSock standard license), [Lenis](https://lenis.darkroom.engineering) (MIT).
- Design guidance from the avoid-ai-design and Impeccable rule sets, and UI/UX Pro Max.

## Notes

The weights on the causal web are a provisional argument and will change as the research continues. The site is a first-draft version for a school project.
