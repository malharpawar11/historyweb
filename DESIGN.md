# Design

One system for the whole site. Every section uses these tokens and rules.

## Direction
A museum-exhibit feel: big condensed athletic type, real objects in 3D, solid fields of Sonics green with one gold accent, and quiet paper-colored reading sections. Boldness is spent where the argument is: the hero ball, the timeline journey, the cause graph and the answer scene. Text stays still and readable on top of all of it.

Sonics-era source material: the team's lettering was a tall, slab-influenced athletic face on a deep green and gold, so the display face is a condensed athletic grotesque and the colors are the team's own.

## Type
- **Display:** Big Shoulders Display, 700 to 900. Headlines, dates, the footer wordmark. Tracking -0.01em, leading 0.88 to 0.95.
- **Text and UI:** Newsreader (optical size), 400 to 600. Body 19px at 1.55, measure 62ch. UI labels 15px at 500.
- Two families only. No Inter, Roboto, Arial or system sans. No monospace.
- Scale: 15, 19, 24, 34, 56 to 80 (fluid), 88 to 152 (hero, fluid).

## Color
| Role | Token | Value |
|---|---|---|
| Field, deep Sonics green | `--field` | `#063B26` |
| Field, darker (3D scenes, web) | `--field-deep` | `#04251A` |
| Paper (reading sections) | `--paper` | `#EEF1EA` |
| Paper, one tone step down | `--paper-2` | `#E0E7DC` |
| Ink | `--ink` | `#0A1A11` |
| Ink, secondary | `--ink-2` | `#33433A` |
| Text on field | `--on-field` | `#EDF2EC` |
| Secondary on field | `--on-field-2` | `#A8C0B2` |
| Accent, Sonics gold | `--gold` | `#F6B800` |
| Mid green (data only) | `--green-mid` | `#2D7A57` |

Gold is the only accent. It fills actions, highlights and data. It is never used as text on paper (it fails contrast). Surfaces separate by tone step, not by borders or shadows.

## Shape and depth
Square corners everywhere except data circles. No shadows at rest. No gradients except a neutral scrim over a photo. No glass.

## Layout
Left-aligned. Each section has its own composition: split hero, asymmetric question, pinned scene, central-spine timeline, sticky web with a panel, two-column weigh, photo band, plain list. Section gaps 120 to 200px on desktop. Equal outer margins.

## Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for arrivals, `cubic-bezier(0.7, 0, 0.84, 0)` for things falling.
- One motion system: Lenis into ScrollTrigger, two easings (`arrive` for things appearing, `fall` for things dropping), one heading reveal reused in every section. Authored moments: the hero ball, the pinned timeline, the draggable cause graph, the live weigh-it stack, the pinned answer scene, one parallax band, and the table rows in Now.
- Lite mode turns all of it off and is remembered.
- Feedback only elsewhere: hover, press, focus, selection.
- `prefers-reduced-motion`: no smooth scrolling, no pinning, no 3D animation. A static hero image and a plain timeline.

## 3D
Built from primitives in code, no downloaded models. One fixed canvas, one renderer, four stages (hero, timeline, causes, answer). A green leather basketball with gold seam inlays, rounded dominoes with engraved dates, spheres sized by weight in the cause graph, and two doors faced with licensed photos in the answer scene. Custom softbox lighting through a small environment scene. Pixel ratio capped, rendering paused off-screen, three.js loaded lazily.

## Components
- Buttons: square, one gold fill, ink text.
- Chips: square, tone step when off, green when on.
- Cards: only where content is a unit (evidence). One level, no nesting.
- Focus: 3px gold outline on dark fields, 3px ink outline on paper.
