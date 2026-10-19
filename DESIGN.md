# Design: birkankader.com

Planning record for the 2026 redesign. Later passes read this before touching the site.

## Brief

- **Subject:** Birkan Kader (Sifa Birkan Kader), software engineer at HAVELSAN in Ankara since 2019
  (intern, candidate engineer, software engineer). Day job: map software for defense systems:
  Java/OpenGL desktop GIS, React + CesiumJS web maps, A* route planning with slope analysis,
  tactical graphics, NATO symbology. After hours: iOS apps, JetBrains plugins, AI developer tools,
  desktop apps. 49 GitHub repositories (27 public, 22 private) as of 18 October 2026.
- **Audience:** engineering leads and recruiters (GIS, defense, developer tools); colleagues who
  install Birkan’s JetBrains plugins; people who use the apps. Turkish and international.
- **Job of the site:** show depth (map software) and range (shipped side products), get contacted,
  and stay the home of the plugin repository and the app pages.
- **Assets:** GitHub avatar (a real photo), project READMEs and release metadata, App Store
  screenshots for Volflow and Vulfyn, Arcade Machine UI captures, real Ankara elevation data
  (SRTM through Mapzen terrain tiles), a 12-month GitHub contribution snapshot.
- **Languages:** English (`/`) and Turkish (`/tr/`), both written natively, never word for word.
- **Constraints:** keep Netlify (functions, `/api/*`, the `/plugins` XML feed, `purpdrop`,
  `udid.mobileconfig`); `npm run build` must still merge the plugin repository after the site
  build; no em or en dashes in visible copy; private work is described, never exposed.

## Concepts

| | A. Kader (name + material) | B. Scale (formal) | C. Restricted area (culture) |
|---|---|---|---|
| Idea | Kader is Turkish for fate. Birkan writes route planners, so the site is Ankara's real terrain and a route is computed live toward wherever you point | Scrolling is zooming: the page descends from zoom 3 (Türkiye) to zoom 19 (one desk); a scale bar is the scroll indicator | The site is a military map sheet: public work is mapped, private work appears as restricted zones |
| Anchor | The surname means fate; the day job is A* route planning with slope analysis; home is Ankara | Web map tile pyramids from the day job | Defense mapping conventions; 22 private repos |
| Layout | A working GIS sheet: contours, status bar readouts, marginalia | One long zoom column | Sheet grid with zones |
| Motion verb | plot: point, then line, then label | zoom | hatch and reveal |
| Signature | A* over SRTM elevation with a slope cost, re-planned on pointer move | continuous contour zoom | hatched zones open on hover |
| Screenshot | the name over Ankara's contours, one blue route bending through the basin to the cursor | a scale bar mid-zoom | a sheet with hatched zones |
| O / F / Fe / P | 5 / 5 / 4 / 1 | 3 / 4 / 4 / 3 | 4 / 4 / 4 / 2 |

**Pick A.** It fits the name, the profession and the place at once, and the signature is a working
algorithm, not a decoration. Steal from C: private repositories are shown as restricted zones.
Steal from B: the status bar carries a real scale.

## Concept card

```
Idea:        Kader means fate. Birkan builds route planners, so the site computes a route
             across Ankara's real terrain, live, toward wherever you point.
Metaphor:    a working GIS map sheet: contours, readouts, a plotted route, zones.
Signature:   the hero route. A* search on SRTM elevation with a slope cost, re-solved on
             pointer move (tap on touch); the search frontier blooms, then the line plots.
             Implemented as one driver module (src/motion/map/) feeding the GL contour
             layer, the 2D route layer and the status bar readouts.
Emotion:     precise and calm first, then a small "oh" when the line follows you.
Motion verb: plot. A point is placed, a line draws through it, a label sets after.
Screenshot:  "Birkan Kader" in giant type over Ankara's contour lines, one ultramarine
             route bending through the valleys from Kızılay to the cursor, live readouts
             in the status bar.
```

## Palette (survey sheet, not vintage paper)

| Role | Hex | Use |
|---|---|---|
| ground | `#ECEEE8` | survey paper: cool off-white with a grey-green cast |
| ink | `#0E110F` | plate black: text, index contours, the flood |
| muted | `#4A504B` | secondary text (7.1:1 on ground) |
| line | `rgb(14 17 15 / 0.14)` | hairlines, minor contours run at 0.18 to 0.22 |
| accent (route) | `#2236F5` | the plotted route, waypoints, focus ring, selection (6.2:1 on ground) |
| curtain | `#0E110F` | flood transition and the restricted zone ground |

Reference: modern national topo sheets (contours in neutral grey rather than sepia), the blue of a
plotted friendly route. Not cream + terracotta, not black + acid green.

Text set on the map carries a printed label's halo (`--halo`): a tight paper rim that stops the
linework short of the letters, then a soft glow. Buttons on the map are filled with paper, so a
contour never runs through a label; the scrolled header is 96% paper, so nothing smears through it.

## Type

- **Archivo** (Google, OFL, variable `wght` 100 to 900, `wdth` 62 to 125, latin + latin-ext for
  Turkish). One family, three personalities:
  - display: `wght 800`, `wdth 112`, tracking `-0.05em` at mega, `-0.03em` at xl, leading 0.86 to 0.95
  - text: `wght 400`, `wdth 100`, 16 to 18 px, leading 1.5
  - map labels: `wght 600`, `wdth 75`, uppercase, `+0.06em`, 12 to 13 px, only where a map would
    put a label (zones, spot heights, place names)
- **JetBrains Mono** (Google, OFL, 400 and 500): data only. Coordinates, versions, dates, sizes,
  URLs. It is the typeface of the IDE the plugins live in.

Scale: `--t-mega clamp(4.25rem, 0.6rem + 15.2vw, 15.5rem)`, `--t-xl clamp(2.6rem, 1.3rem + 5.2vw, 6.5rem)`,
`--t-l clamp(1.75rem, 1.25rem + 2vw, 3rem)`, `--t-m clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)`,
`--t-body clamp(1rem, 0.96rem + 0.18vw, 1.125rem)`, `--t-s 0.875rem`, `--t-xs 0.75rem`.
Numbers in tabular figures everywhere data appears.

## Grid and rhythm

- 12 columns, gutter `clamp(1rem, 0.6rem + 1.6vw, 2.5rem)`, outer margin = gutter. Phones: 4 columns.
- Hang lines: column 1, column 5, column 9. Every text block starts on one of them.
- Section rhythm moods (`--u` is 8 to 16 px): tight (4u), normal (6u), airy (8u above, 5u below),
  full viewport. Assigned per section below, never uniform. Open map between two sections stays
  about one display line tall: a full-height band of map belongs only where something happens in
  it, as in the hero and the footer. On a phone the moods close up (normal 4u, tight 3u).

## Shape

Rectangles are zones, circles are points. Radius 0 everywhere; only waypoints and markers are round.

## Motion language

- Eases: `expo.out` (entrances), `expo.inOut` (flood, page transitions), `power3.out` (UI),
  `power2.inOut` (pen strokes: lines that draw at a plotter's steady speed).
- Durations: hover 0.35 s; text line reveal 1.1 s with 0.07 s stagger (each line hinged at its
  left end, so its tilt never lifts a glyph above the mask before the reveal); route plot 0.6 to 0.9 s;
  flood 0.8 s up and 0.9 s down; loader at most 2.6 s including the drain.
- The verb in practice:
  - Nav links: a point drops before the label, then an underline draws out of it. Current page
    keeps the point and line; keyboard focus keeps to the focus ring alone, so a focused link
    never reads as a second current page. On phones the links sit too close for the point to read
    as its own, so the line alone marks the page. The mark moves to the destination as soon as the route
    sets off, before the water rises: the old line is taken up at once (0.2 s) while the new one
    draws at the usual pace, so the header never shows two current places.
  - Project rows: a waypoint drops at the row start, the title steps right, a route line draws
    across the row to a destination marker.
  - Primary buttons: the button floods from the bottom like water rising, label inverts. Outline
    buttons flood with ink, filled ones with paper, both under a route-blue waterline.
  - Back link (case studies): the arrow steps back and a route line draws in from the right.
  - Inline links in running text: underline at rest, thickens into the accent on hover.
  - Form fields: a label in the status bar's caps, the entry in mono on a paper wash over an ink
    rule. In use the rule draws out of a point as a route, the way the nav's line does.
  - Standalone links (the footer address, a case study's links) plot a route along their
    underline: a point is placed at its start, the line draws, a ring closes it at the end. In the
    About page's shipped lists, the field log's commit and tool rows and the plugin rows the whole
    row is the link and plots the work rows' route along its rule while its name steps onto it.
    Each plugin row leads to the case study that tells its story (the weekly vote runs on Arcade
    Machine's server and is told there). The "Next project" link is as wide as its words, so the
    map beside it stays the map; at rest its name sits on the column line under its label, and
    pointing at it sets a point down where the name began, the name steps off it and the route
    draws to its end.
  - A link that leaves the site carries a turned arrow that steps out the way it points: inline
    links, commit and repository rows, the shipped lists, the footer's social links. At rest the
    arrow is what tells a link from a plain row beside it.
  - Utility links that stay on the site (language, back to top): color only.
- Page transition: elevation flood. Ink fills the terrain band by band from the lowest contour up
  (leave), then drains from the peaks down (enter), with "Routing to <page>" set in the flood.
  Back and forward drain into the spot the visitor left, not the top of the page, and the page
  comes back as it was left: what is on screen is already in place, with no entrance to sit
  through. After any page change nothing under a resting pointer reacts until the pointer moves,
  so a nav item that happens to sit under it never reads as a second current page. The flood and
  the loader cover the full window: no scrollbar gutter is reserved beside them, a classic
  scrollbar stays put (nothing shifts sideways when scrolling pauses), and it turns curtain dark
  while the water is up.
- Loader: first hard load of a tab session only. The screen starts flooded. The counter is the
  water level: it tracks real work (fonts, intro images and, when it can arrive in time, the
  elevation texture) by falling from the highest
  ground on the sheet (1,860 m) to Kızılay's 871 m, then the water drains into the hero and the
  route intro plays. (The final "remove one accessory" pass cut the loader's progress bar: the
  falling water level already says how far along it is.) Only the home page holds the counter
  for a designed pause (`#loader[data-pause]`); a deep link to a case study, the contact page or
  the 404 waits for the work alone, and so does a later hard load in the same session (a reload),
  which shows the flood without the counter.
- Idle: in the hero, when the pointer rests, the route tours the project hilltops: a new search
  every few seconds, its frontier blooming before the line plots. Off screen it pauses, and it
  waits while reading text fills the screen (a new road there would only fade under the words),
  moving on again wherever the map is the subject. Under
  reduced motion: no idle, no GL, static contour map drawn once in 2D (faint under reading text
  like the live map, switched without a fade), the route re-plans on click or tap only.

## Composition plan

Home (`/`, `/tr/`): each section uses a different layout family.

```
HERO  (full viewport, map at full strength, layout family: name as image + scene)
+--------------------------------------------------------------------------------+
| o Birkan Kader                                    Work  About  Contact  [TR]   |
| SOFTWARE ENGINEER, ANKARA (kicker)                                             |
| statement, cols 1 to 5                             (o) KIZILAY 871 m           |
|                                                       \  route                 |
| Birkan                                                 (o) WHALECODE 1,099 m   |
| Kader            mega, cols 1 to 9, bottom of the sheet   +-- legend box ---+  |
|                                                          | Kader is Turkish |  |
|                                                          | for fate...      |  |
|--------------------------------------------------------------------------------|
| LAT 39.88648 N  LON 32.88760 E  ELEV 1,099 m  SLOPE 0.9%   ROUTE 5.0 km  NODES |
+--------------------------------------------------------------------------------+
  Phones: kicker, statement, name, then the legend box full width under the name. The status bar
  keeps two readouts (route length and time on foot) and a shorter scale bar, spread across the
  width, so it never runs off the screen.

SELECTED WORK  (index list, map faint, normal rhythm)
  h2 cols 1 to 8                                                        count
  ------------------------------------------------------------------------------
  # | title (t-l) cols 2 to 5 | what it is cols 6 to 8 | stack cols 9 and 10 | status 11 and 12
  ... six rows, each opens a case study. The last column says where each project stands in a few
  words (shipping, archived, the App Store version); a year column read 2026 on every row. On a
  phone the stack and the status share one line, and a long status drops below it, still right.
  The table is shy (`data-shy`): no map label prints inside its box.

DAY JOB  (asymmetric pair + facts, airy)
  h2 + paragraph cols 1 to 5            | three real figures cols 7 to 12, each label
                                          set under its number, in ink at reading size
  roles as three waypoints along a line, cols 1 to 12

FIELD LOG  (data: 12 months of contributions as an elevation profile, full width)
  h2 cols 1 to 8, total on the right
  profile chart cols 1 to 12 with named summits (what shipped at each peak)
  "Latest public commits, as I wrote them": each public repository's latest telling headline,
  in the language it was written in, beside smaller public tools

RESTRICTED AREA  (gallery wall of hatched zones, dark ground, tight)
  statement cols 1 to 7
  zones on the work index's column lines (1, 5, 9): a wide zone (cols 1 to 8) and a narrow one,
  then a narrow one and a wide one, then three narrow ones, and under them the hatched ground
  across the whole sheet: everything not described. No row leaves a hole. A wide zone sets its
  facts (stack, status, last commit) in one row like a map legend, so it never stands as an
  empty card with its facts pushed to the floor.

PLUGIN REPOSITORY  (statement + one copyable URL + three release rows, each leading to its case
  study, normal)

FOOTER  (finale, map at full)
  "Email me" mega link, the route always ends at it
  index on clean paper below the neatline: elsewhere (socials), this site (language, back to
  top), colophon. The contact page is already that invitation, so its footer is the index alone.
```

Inner pages: `/about/` (contour portrait, bio, career, tools, shipped), `/work/<slug>/` (six case studies:
title, meta, hero media, context, idea, craft frames, outcome, next project), `/contact/` (form and
direct email), `/404` ("No route found": the search exhausts the map and fails). A case study's
details are one numbered list at one size on one column line: the first holds its figure to the
right, the rest follow it down the page.

On About each section's name (Career, Tools, Shipped), and the contact form's, heads the margin
column in display type. On a wide screen it holds there while its section scrolls past, so the
column carries its title all the way down; under it the column stays open sheet with the map
showing through, the way a printed sheet keeps its margin for titles. Such a name moves against
the page, so the route planner and the knockout measure it live (`data-live`): every frame the
map draws and at every search, instead of once like the rest of the type. The lists beside them
are set in ink at reading size.

On the contact page the route runs from Kızılay to the address. On a phone Kızılay falls where
the lead would sit, so the order there is title, open map, address, then the lead under it. A case
study's head follows the same rule on a phone: title, a band of open map where Kızılay sits (43%
down the screen, the band at least 43svh less 11rem tall), then the summary and the details, so
no words ever cover the route's start and most places print in the open with their names.

Figures are recomposed for phones, never just scaled down: the WhaleCode run turns upright so its
labels keep their size, and the field log draws its own phone profile so the hatching stays
undistorted. Standard names (APP-6, MIL-STD-2525, SHA-256) carry word joiners so they never
break at a hyphen.

Focus that moves the page (Tab, or a field scrolled into view) stops clear of the fixed header and
the status bar (`scroll-padding`), so a focused control never sits under either. The header steps
aside once the page has moved a fifth of a screen down and comes back on the way up, so display
type never slides under it and shows only a cut descender below its edge.

## Genericness test

A generic model given "portfolio for a GIS engineer" lands on a dark theme with neon accents, a 3D
globe or decorative drifting topographic lines, skill bars and a vertical timeline. Changes:
- The lines are real: Ankara's elevation, and they drive a working route planner. Not decoration.
- Light survey-paper palette with one route blue, instead of dark neon.
- No skill bars or percentages. Tools are listed by where they were used.
- GitHub activity is an elevation profile with named summits, not a green heatmap.
- Private repositories are mapped as restricted zones instead of being hidden or leaked.

## Content rules

- All copy lives in `src/data/` (one file per language for UI strings, shared project records).
- No em or en dashes. No filler verbs. Sentence case. Numbers only when true.
- Private repositories: name, purpose, stack, status, last activity. Never code, never internals.
  The ones not described are only counted, and the copy never suggests what is in them beyond
  "projects still in progress, old coursework and experiments".
- The private count comes from the GitHub snapshot (`src/data/github.json`), so the restricted
  area and the field log can never disagree. A private repository created after the zones were
  written is counted in the hatched remainder until it is described.
- Dates are Ankara dates (`Europe/Istanbul`), also in `npm run github:sync`. Field log points sit
  on weekly bins, so they are labelled by month.
- Quoted commits (`npm run github:sync`): each public repository's latest headline as written,
  minus the bookkeeping. A conventional-commit prefix (`feat:`, `docs(x):`) is dropped and the
  first letter raised; a message that says nothing on its own (an initial commit, a merge, a
  version number, a single word) is skipped for the one before it; a dash becomes a colon, or a
  hyphen in a range, since the site sets no em or en dash anywhere.
- Project status follows the repository. WhaleCode was archived on 18 October 2026; its case
  study says so and gives the README's reason (the IDE agents now run parallel worktrees
  themselves), without inventing anything beyond it.
- Turkish formatting: decimal comma, percent sign first (`%0,6`), `dk` and `sa` for minutes and hours.
- Labels are set in capitals, and Turkish capitalises i as İ. English names inside a Turkish label
  (JetBrains, GitHub, IntelliJ, LinkedIn, commit) are marked `lang="en"` by `Caps.astro`, so the
  label reads JETBRAINS EKLENTİLERİ, not JETBRAİNS.

## The map, in practice

- **Strength.** The terrain is faint (0.34) under reading sections and full under `[data-map="full"]`
  (hero, case and contact heads, 404, footer), but only while such a section fills most of the
  screen: once reading text takes half of it, the contours recede under the words. The strength
  is held by the sections themselves: the shader gets their screen bands and prints full only
  over them, easing out over their last 72 px, so the end of a list just above the footer never
  sits on heavy linework. Pointing at a project lifts the whole sheet to 0.75. Labels only print
  at full strength.
- **Type is terrain.** Every box where type rests is closed to the route planner when a search
  starts: display type (`data-obstacle="glyphs"`) per glyph ink box, so a route can thread
  between the two lines of a name; other text per line box, a paragraph as one block; figures,
  images and form controls whole; a section name held in its column, live. A route set off while
  someone points at a project threads
  through the index's gutters instead of under its words. Around the type the planner keeps a
  berth one cell wide (every cell that comes within the route's paper halo of the knockout), so a
  route never runs along the edge of the lettering where smoothing would cut it into dashes; only
  its two ends may sit inside the berth, so it still lands on a link's point beside its words. An
  end buried deep in type, or a search that closes 15,000 cells (5,000 on a phone) without
  arriving, runs again over the open sheet, and that route passes under the type where it has to.
  On a phone the screen's margins are closed as well (16 px each side, at every height): type runs
  from margin to margin there, and a route sent down the edge of the screen would hug the frame
  instead of crossing the sheet. Within 48 px of either end the margins open again, so a link's
  point set on the margin line, beside its word, is reached down the margin instead of from under
  the word.
- **When type moves.** Type slides over the sheet as the page scrolls, so the plotted linework is
  knocked out under every text run and under figures, images and form controls, the way a printed
  sheet breaks its lines at the lettering. Whether type rests on a route is read every 6 px along
  the drawn line, so a line of text crossed between two corners of the route counts as well. A
  stretch caught between two blocks of type and shorter than about 100 px reads as a stray tick,
  not a road, so it is left out at any strength. Behind
  reading text a route prints only while it is whole: once type rests on it, it fades with the
  sheet, and Kızılay and its destination with it. Once the page settles (0.3 s) the route is
  checked again, the way a navigator recalculates, and quietly: no frontier, no searching readout,
  and a search that finds the same road leaves the road as it is. Where the map is the subject, a
  route that type now rests on, or one drawn around type that has since moved more than 24 px, is
  searched again around the type where it rests. Behind reading text, where a road could only
  fade under the words, a road drawn around type that has moved is laid again over the open
  sheet, so no detour around type that has scrolled away stays on the map. Kızılay or the
  destination print only with 24 px of room around them (7 px where the map is the subject); a
  stretch that ends at a printed point stays, anchored by it. A link's point rides with the page
  while the sheet barely moves, so a road to a link that has moved more than 24 px on screen is
  lifted at once (it fades in a quarter second) and the next one is plotted when the page settles;
  if the link comes back to where it was, its road comes back. The idle tour never waits on a
  link that has left the screen.
- **Sections in negative.** A section printed in negative (the restricted zones) hides the sheet
  under it, the way type does: linework, route and labels are cut away there. The planner does
  not route around it; a road crossing it simply passes under.
- **Labels.** Map labels (spot heights, origin and destination names) keep 6 px off every text
  run and off the fixed header and status bar; a spot height keeps 14 to 18 px, so it never reads
  as part of a line of text. A destination label sets right of its point, then left, then centred
  under it, and hides rather than print over type; under the point it also keeps off the arriving
  route, which it would otherwise sit across. Labels keep clear of their own route and of each
  other: Kızılay's name moves left of the point when the route sets off to the right, fading out
  on one side and in on the other, and the destination's name never prints over it. The ring
  around the destination shrinks to the room its point has, so it never closes over the type
  beside it or runs off the screen. Lists set as tables (`data-shy`: the project index, the field
  log's lists, the plugin rows, About's career, tools and shipped lists, a case study's details)
  count whole for labels, gaps included: a label in the gap between two columns would read as one
  of the table's cells. Behind reading text they count whole for a route too: one threading the
  gaps between their columns fades as if type rested on it. Where the map is the subject (a
  project pointed at) a route still threads the index's gutters. A project pointed at in the
  index is named by its own row, so its point carries no label.
- **The frontier.** The search's frontier prints its dots lighter where they come close to type,
  so the wave thins out at the lettering instead of piling up against it.
- **Text on the map, on a phone.** The words cover most of a phone's sheet, so a block of text set
  on the map (the hero statement, a case study's summary, the contact lead, the 404's two
  paragraphs) lifts off on a soft wash of paper, the way a printed sheet clears its linework
  around a label. The planner counts the whole washed block as type, so a route never ends faded
  under the wash. On wider screens the halo alone is enough.
- **The line itself.** The search walks an eight-way grid of 160 m cells, so its raw path is a
  staircase of square and diagonal steps. A straightening pass replaces up to four cells of steps
  with one straight piece wherever that walks no slower and keeps clear of type, then corner
  cutting draws it as a pen line. The reach stays short on purpose: a longer one turned routes into
  ruler lines that no longer showed they were searched.
- **Across pages.** The plotting layer persists through navigation. A route that is still on the
  map keeps its numbers in the new page's status bar, formatted for that page's language, and a
  tour stop carried over holds for its full time before the tour moves on. The 404's failed search
  ends with its page: the next page plans its own route from a zeroed bar instead of saying NO ROUTE.
- **Destinations.** Hover on a project row > route targets on the page > the 404 failure >
  the case study's own place > the pointer > a tap > an idle tour of project places. The tour
  starts at the place farthest from Kızılay, so the first route anyone sees is the longest. Places
  come from `src/data/projects.ts` and reach the driver through a small JSON island, so the case
  copy is not bundled into the script. A place (or a pointed spot) under or against type, or
  walled off from Kızılay by it, is displaced to the nearest open ground the route can reach
  (within 24 cells, with no type in the cells around it), the way a cartographer moves a symbol
  clear of a name: its point prints there, and it keeps its own name and height. A link's point
  is never moved: the route lands beside its words.
- **The closed zone.** The 404's hatched zone belongs to open ground: it fades while type slides
  over it, and steps back when the route has somewhere else to go (the "Email me" link on screen).
- **Legend.** The hero caption is a legend box (paper scrim, hairline), the way a sheet explains
  its symbols. It says what the line is and why it bends.
- **Titles are static HTML.** Page titles are not split or masked: they are painted at first
  contentful paint under the flood, and the drain reveals them. This keeps the LCP element a real
  heading at its full size.

## Loader and performance

- The loader is timed from navigation start, not from script execution: a slow script download
  does not add a second wait. The designed pause (MIN, 0.45 s) belongs to the home page's first
  load only. A page that boots after it, a deep link and a repeat load have made the visitor wait
  already (or should not), so the counter follows real progress closely, the exit starts as soon
  as the work is done while the counter runs out, and the handoff comes after 0.2 to 0.3 s instead
  of 0.34 s. Everything lands inside the 2.6 s budget (`LOADER_MAX`).
- The elevation texture (296 KB) is fetched at boot, not preloaded: a preload competed with the
  fonts and the script on slow phones. The loader waits for it only while it can still land
  before the progress cap (a boot before 1.0 s); later, the panel lifts and the map inks in after.
- Each family ships as a core subset with every character the site shows (Basic Latin; ç ö ü â î å
  and their capitals; ğ ı İ ş; quotes, primes, ellipsis, ° © ·; ← →, and ↗ in the mono), preloaded:
  Archivo 54 KB with both axes, JetBrains Mono 10 KB without its code ligatures. The rest of
  Google's latin set and latin-ext sit in files that load only for a character the core lacks
  (`unicode-range`, core declared last so it wins). Cut with fontTools' subsetter from Google
  Fonts' own files. Before this, the same text cost 133 KB of fonts. The files live in
  `src/assets/fonts`, so the build fingerprints their names and they can be cached for a year
  like the scripts; a re-cut font gets a new address instead of a stale copy.
- The About photo is not part of the page load: it is fetched when the visitor points at or
  focuses its toggle, and fades in once it can paint.
- Measured on a throttled phone (4x CPU, 1.6 Mbps, 150 ms) against a brotli server like Netlify's:
  LCP 0.7 to 1.0 s (the page title), loader gone at 1.6 to 1.7 s, CLS 0.002 at most. The skill's
  `serve.mjs` sends files uncompressed, so it reports about a second more for the same build;
  that is the raw script and styles on a slow line, not the site.
