/* Orchestrator for the 3D and scroll-motion layer. Loaded lazily on top of a page that already works without it.
   One shared motion system: Lenis smooth scroll driving GSAP ScrollTrigger, two easings, one heading reveal.
   One shared WebGL renderer (gl.js); each 3D area is a stage that draws only while it is on screen. */
const html = document.documentElement;

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error("failed to load " + src));
    document.head.appendChild(s);
  });
}

/* The 3D timeline failed or was turned off: put the same cards back in the flat list. */
export function flatTimeline() {
  html.classList.add("tl-flat-mode");
  const ol = document.getElementById("tl"), wrap = document.querySelector("#timeline-flat .wrap");
  if (ol && wrap && !wrap.contains(ol)) { ol.classList.remove("tl-3d"); ol.removeAttribute("style"); Array.from(ol.children).forEach((r) => r.removeAttribute("style")); wrap.appendChild(ol); }
  const a = document.getElementById("timeline"), b = document.getElementById("timeline-flat");
  if (a && b) { a.id = "timeline-3d"; b.id = "timeline"; }
}

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

  const gl = await import("./gl.js");
  const { arrive } = gl;

  /* hero entrance: one authored moment */
  const spans = gsap.utils.toArray(".hero h1 .ln > span");
  gsap.set(spans, { y: 0, yPercent: 108 });   // y:0 overrides the pixel value GSAP would read from the CSS pre-state
  html.classList.remove("pre-motion");
  gsap.to(spans, { yPercent: 0, y: 0, duration: 1.3, ease: (x) => arrive(x), stagger: 0.09, delay: 0.1 });
  gsap.fromTo([".hero-q", ".hero-by", ".hero-actions"], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: (x) => arrive(x), stagger: 0.1, delay: 0.55 });

  /* the one reveal every section uses: heading wipes up, the lede follows */
  gsap.utils.toArray("main h2").forEach((h) => {
    if (h.closest(".hero")) return;
    const lead = h.nextElementSibling && h.nextElementSibling.classList.contains("lead") ? h.nextElementSibling : null;
    gsap.set(h, { clipPath: "inset(0 0 100% 0)", yPercent: 16 });
    if (lead) gsap.set(lead, { opacity: 0, y: 14 });
    ScrollTrigger.create({
      trigger: h.closest(".tl3d") || h, start: h.closest(".tl3d") ? "top 80%" : "top 90%", once: true,   // pinned headings reveal when their section arrives
      onEnter: () => {
        gsap.to(h, { clipPath: "inset(0 0 0% 0)", yPercent: 0, duration: 1.05, ease: (x) => arrive(x), clearProps: "clipPath,transform" });
        if (lead) gsap.to(lead, { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: (x) => arrive(x), clearProps: "opacity,transform" });
      },
    });
  });

  /* one shared renderer for every stage; if it fails, everything falls back to the flat page */
  let lost = false;
  const onLost = () => {
    if (lost) return; lost = true;
    html.classList.add("no-3d"); html.classList.remove("has-3d");
    ScrollTrigger.getAll().forEach((s) => s.kill());
    flatTimeline();
    document.querySelector(".hero-stage")?.classList.remove("ready");
    const cta = document.querySelector(".hero-actions .btn"); if (cta) cta.textContent = "Follow the timeline";
    ScrollTrigger.refresh();
  };
  try {
    gl.init(); gl.onLost(onLost);
    (await import("./hero.js")).init();
  } catch (e) { console.warn("3D renderer unavailable", e); onLost(); return; }

  const api = { gsap, ScrollTrigger, lenis, goTo: null };
  window.__stageApi = api;

  /* the timeline stage */
  try { (await import("./timeline.js")).init(DATA, api); }
  catch (e) { console.warn("3D timeline unavailable, using the flat list", e); flatTimeline(); }

  /* the causes graph */
  try { (await import("./graph.js")).init(DATA, api); }
  catch (e) { console.warn("3D graph unavailable, using the flat web", e); html.classList.add("graph-flat"); }

  /* parallax photo band: a small moment, same easing */
  gsap.fromTo("#band .band-frame img", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: "#band", start: "top bottom", end: "bottom top", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 700);
}
