# Why the Sonics Left Seattle

A Real History project by **Malhar Pawar** (2026).

> What was the effect of the public arena-funding dispute on the SuperSonics' departure from Seattle, 2006–2008?

An interactive research site: a two-track timeline (Seattle's response beside the owners' strategy), a causal web of seven possible causes with the evidence behind each, a "weigh it yourself" tool, a 2006–2008 vs 2026 comparison, and the MLA source list.

Built with Claude Code. Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on Vercel

1. In Vercel choose **Add New → Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Deploy. Add your own domain under **Settings → Domains**.

`vercel.json` sets security headers and caching.

## Where things live

| Path | What it is |
|---|---|
| `index.html` | Page structure and the written argument |
| `js/data.js` | **All evidence**: sources (MLA), causes, evidence cards, timeline events. Edit here to change the research. |
| `js/app.js` | Interactions: timeline, causal web, filters, weigh-it tool, theme, menu |
| `css/styles.css` | Design tokens (light and dark) and layout |
| `assets/` | Hero photo and Sonics logo |

Every evidence card is paraphrased from the source it names, and each card carries the skill it demonstrates (Historical Thinking Skills 5B and 6C), whose voice it carries, and a limitation.

## Credits

- **Photo:** "KeyArena" by Cliff from Arlington, Virginia, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:KeyArena_(2890740573).jpg), licensed [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Resized and cropped.
- **Logo:** the Seattle SuperSonics logo is a trademark of its owners and appears only for educational commentary. This project is not affiliated with or endorsed by the NBA or any team.
- **Fonts:** EB Garamond and Inter via Google Fonts (SIL Open Font License).
- Design guidance from the UI/UX Pro Max skill (editorial style, accessible chart patterns).

## Notes

The weights on the causal web are a provisional argument and will change as the research continues. The site is a first-draft version for a school project.
