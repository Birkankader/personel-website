# birkankader.com

Personal site of Birkan Kader, software engineer in Ankara. Kader is Turkish for fate; the site is
Ankara's real terrain, and a route planner (A* with a slope cost, on SRTM elevation data) draws a
route across it toward wherever you point. English at `/`, Turkish at `/tr/`.

The design record (concept, palette, type, grid, motion, map rules) is in [DESIGN.md](DESIGN.md).

## Stack

- [Astro](https://astro.build) 7, static output, with the client router for page transitions
- GSAP (ScrollTrigger, SplitText) and Lenis for motion and scroll, on one ticker
- OGL (WebGL2) for the contour layer and the flood transition, with a 2D canvas fallback
- Plain CSS with tokens in `src/styles/tokens.css`; Archivo and JetBrains Mono, self-hosted

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # site into dist/, then merges the JetBrains plugin repository feed
npm run check        # astro check (types)
npm test             # plugin repository merge tests
```

Data refreshers (outputs are committed):

```bash
npm run terrain                                # elevation texture from Mapzen terrain tiles, plus
                                               # src/data/terrain.json (bounds, spot heights, Kızılay's height)
GITHUB_TOKEN=<token> npm run github:sync       # field log snapshot in src/data/github.json
node scripts/portrait.mjs <photo>              # contour portrait for the About page
```

`github:sync` needs a token that can read private repositories. Private repositories only
contribute counts; their names and commit messages never leave the script. Public commit
headlines are quoted as written, minus conventional-commit prefixes and dashes; messages that say
nothing on their own (an initial commit, a merge, a version number, one word) are skipped.

## Content

- `src/data/site.ts`: every UI string, English and Turkish, written separately
- `src/data/projects.ts`: the six case studies
- `src/data/restricted.ts`: private repositories, described without code (the count comes from
  the GitHub snapshot)
- `src/data/plugins.ts`: plugin repository rows

No em or en dashes in visible copy.

## Contact form

The form posts to EmailJS. Set these in `.env` locally and in the Netlify environment:

| Variable | Description |
|----------|-------------|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |

Without them the page still offers the email address.

## Deploy

Netlify builds `main` with `npm run build` and publishes `dist/` (see `netlify.toml`). The
JetBrains plugin feed stays at `/plugins/updatePlugins.xml`, and `/api/*` goes to
`netlify/functions`.
