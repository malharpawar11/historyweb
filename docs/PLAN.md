# Plan: one designed experience, top to Sources

## What I read first
- **Apple (AirPods Pro page):** 13 pinned screens, one idea per screen, a huge headline over the visual, about a viewport and a half of scroll per beat. It scrubs video, not WebGL. Idea taken: pin the Answer and the Timeline, one beat at a time.
- **Lusion:** one fixed full-screen WebGL canvas behind real HTML text, Lenis on top. Idea taken: a single persistent renderer for the whole page.
- **Resn (Corn) and Bruno Simon:** both are heavy single-canvas worlds that would not finish loading in my preview, so I could not read their code or DOM. Idea taken from Bruno Simon: the UI stays plain HTML over the canvas, and interaction is the point (drag, hover, prompts).
- **The Pudding:** I only reached the index, not an essay. Idea taken: the argument stays in text and numbers, the visuals support it.
- **three.js `webgl_multiple_elements`:** one renderer drawing into scissored rectangles that follow DOM elements. This is how one canvas serves every section.
- **3d-force-graph (basic, highlight, click-to-focus, fix-dragged-nodes) and d3-force-3d:** hover highlights a node and its links, click flies the camera to a node, dragged nodes get pinned (`fx/fy/fz`). I use d3-force-3d directly and render the nodes myself, so I control materials and the single shared renderer.
- **Lenis, GSAP ScrollTrigger docs:** Lenis drives ScrollTrigger through the GSAP ticker. Already in place.

## Whole page
- One fixed canvas, one renderer. Each 3D area is a stage: a DOM rectangle the renderer draws into. Off-screen stages are not drawn. At most two stages are on screen at once.
- All text, quotes, citations and links stay HTML and sit above the canvas.
- One motion system: Lenis, ScrollTrigger, two easings (`arrive` for things appearing, `fall` for things dropping), one heading reveal reused in every section.
- **Lite mode** toggle in the nav, remembered in `localStorage`. It turns off all 3D and heavy motion and shows the flat 2D page. Reduced motion and no-WebGL give the same result.

## Section by section

| Section | Treatment |
|---|---|
| **Hero and Question** | The leather basketball stays, moved to the shared renderer. Question gets the 2006 Sonics game photo in a green and gold duotone, with caption and credit, plus one large number (41 years) with its citation. |
| **Timeline** | A 3D journey. The camera follows a curved path along a gold date spine. Seattle events sit left, owners' events right, shared events on the spine, same color logic. Each event is the existing HTML card, projected to its place in depth. Six milestones (Initiative 91, the Legislature not voting, the final home game, the NBA vote, the trial, the settlement) get more scroll time, a larger card and a domino that tips as the camera passes. "Open the cause" still selects the cause. The flat two-column list is the fallback. The separate domino-chain section is folded into this. |
| **Causes** | A draggable 3D force graph. Nodes are sized by my weights and colored by theme. Dashed arrows are kept. Drag rotates, nodes can be pulled and spring back, hover highlights a node and its links, click flies the camera and opens the evidence panel. Labels are real buttons, so Tab and Enter work. A gentle idle drift. The SVG web stays as the fallback. |
| **Weigh it** | Physical, not 3D. A live stacked bar shows the 100 points. Segments resize with springs as sliders move, the counter rolls, and the comparison bars animate in one after another. |
| **Answer** | A pinned scene with a 3D set behind the text: two tall doors that slide shut (the city route, then the state route), then a gold ball and a lit exit at the back. Five beats appear in order: the headline, the first paragraph, the second paragraph, the gold pull quote, then the three side notes. Licensed photos crossfade behind in duotone (City Hall, Legislative Building, Ford Center). Key figures set large with citations: 74%, $300 million, 28 to 2. |
| **Now** | The KeyArena band stays. Add a three-image strip, 1962 Coliseum interior, KeyArena 2018, Climate Pledge Arena 2022, with captions. Table rows and the status list reveal as they scroll in. |
| **Sources** | Clean, no 3D. Add an image credits list under the MLA entries. |

## Images (all licensed, all recorded in IMAGE_CREDITS.md)
Seattle City Hall (CC0), KeyArena 2018 aerial (CC0), blank US map (CC0, used for a designed Seattle to Oklahoma City route), 2006 Sonics photo, 1962 Coliseum interior and the existing KeyArena photo (CC BY 2.0), Legislative Building and Climate Pledge Arena (CC BY-SA 4.0), Ford Center (CC BY-SA 2.5). Share-alike images carry their license on the cropped and duotone versions too. No stock photos, no generated images. I did not find usable licensed photos of the owners, the trial or the lawsuit, so those milestones use type and 3D instead.

## Performance and access
Lazy-load all 3D, pixel ratio capped at 1.75 (1.5 on phones) with automatic step-down, shadow maps 1024 (512 on phones), images as webp in two sizes, offscreen stages not rendered. Everything 3D has a keyboard path. Contrast stays at AA or better. Focus rings stay visible.

## Build order, one commit each
1. Images and credits. 2. Shared renderer and motion system. 3. Hero and Question. 4. Timeline. 5. Causes. 6. Weigh it. 7. Answer. 8. Now and Sources. 9. Lite mode and fallbacks. 10. Audit.
