---
name: khabar-chakra-icons
description: Use when adding, changing, styling, or reviewing any icon, logo, favicon, PWA manifest, app icon, or branding asset in this project. Covers the Khabar Chakra brand icon system — 78 UI icons on a 24px grid, app icons, logo lockups, colour tokens, and the generators that produce them.
---

# Khabar Chakra icon system

A complete brand icon system ships with this repo. Use it; never substitute it.

## What exists

| Layer | Location | Contents |
|---|---|---|
| In-app UI icons | `public/icons/ui/` | 78 outline icons, 24 px grid, 2 px stroke, round caps |
| Sprite | `public/icons/ui/khabar-chakra-icons.svg` | all 78 as `<symbol id="kc-<name>">` |
| Catalogue | `public/icons/ui/icons.json` | name, category, tags, palette |
| React / vanilla JS | `public/icons/ui/dev/` | `KhabarIcon.jsx`, `khabar-chakra-icons.js` |
| PNG fallbacks | `public/icons/ui/png/` | `<name>-24.png`, `<name>-48.png` |
| Platform icons | `public/icons/` | master, PWA, maskable, adaptive fg/bg, favicons, iOS, mono, notification, tiles |
| Logo lockups | `public/branding/` | horizontal, stacked, light, dark, monochrome, wordmark, splash |
| Social cards | `public/social/` | OG + Twitter, 1200×630 |
| Manifest | `public/site.webmanifest` | drop-in PWA config |

## The 78 UI icons

- **lifecycle:** buy, track, store, triage, cook, consume, compost, recycle, dispose
- **food:** ingredient, recipe, meal, portion, leftover, fresh, expiring, expired, fridge, freezer, pantry, shopping-list, scan, market
- **safety:** veg-marker, nonveg-marker, allergen, plant-based, no-onion-garlic, spice
- **community:** household, family, neighbour, volunteer, ngo, verified, caterer, event-host, community, pickup, delivery, route, claim-surplus
- **impact:** meals-saved, kg-rescued, co2-avoided, water-saved, streak, badge, leaderboard, certificate, tier, goal
- **ui:** search, filter, map, location, calendar, schedule, bell, message, invite, share-arrow, qr, profile, sliders, help, star-rating
- **state:** success, warning, error, info, empty, offline, sync, loading, locked, hidden

Check `icons.json` before assuming an icon is missing.

## Usage recipes

### React
```jsx
import KhabarIcon from "@/icons/KhabarIcon";   // from public/icons/ui/dev/
<KhabarIcon name="cook" size={24} />
<KhabarIcon name="verified" size={20} color="var(--kc-green)" title="Verified NGO" />
```

### Sprite (best for plain web — one request)
```html
<svg width="24" height="24" aria-hidden="true"><use href="#kc-cook"></use></svg>
```
```css
.icon { fill: none; stroke: currentColor; stroke-width: 2;
        stroke-linecap: round; stroke-linejoin: round; }
```

### Per-icon SVG
Copy or import `public/icons/ui/<name>.svg`. It is self-contained and inherits
`currentColor`.

## Colour tokens

`--kc-teal #0B5B4E` · `--kc-green #3EA44C` · `--kc-red #E2543E` ·
`--kc-orange #F08A24` · `--kc-yellow #F5B921` · `--kc-cream #FBF7EF` ·
`--kc-ink #072A26`
On dark surfaces: teal `#1B9C82`, green `#62C86D`.

Icons inherit `currentColor`. Style with CSS `color`. No gradients, shadows,
or 3D effects. No off-brand hues.

## Adding a new icon

1. Open `tools/kc_ui.py`.
2. Add one call using the shared primitives:
   ```python
   icon("compost", "lifecycle", "decompose, soil, organic",
        ARC(12, 12, 7.4, 100, 348),
        HEAD(12, 12, 7.4, 348, 3.1),
        LEAF(9.4, 14.2, 7.2, 3.5, -52, fill="none"))
   ```
   Keep 2 px stroke, live area 3→21, round caps/joins.
3. Run `python3 tools/generate_ui.py`.
4. Review `preview/ui-icons-sheet.png` and `preview/ui-icons.html` before
   considering the task finished.

Primitives: `L(x1,y1,x2,y2)` line · `R(x,y,w,h,rx)` rect · `C(cx,cy,r)` circle ·
`DOT(cx,cy,r)` filled dot · `RAW(d)` raw path · `ARC(cx,cy,r,a0,a1)` arc ·
`HEAD(cx,cy,r,angle,size)` arrowhead · `LEAF(x,y,len,wid,angle)` leaf.

## Never do this

- Install or import another icon library, or hand-write one-off inline SVGs.
- Mix stroke widths (1.5 / 2.5) into the set.
- Put text, letters, or numbers inside a square icon.
- Replace the logo wordmark with a font — its text is already vector outlines.
- Hand-edit generated files; change `tools/` and regenerate.
- Add non-brand colours (purple, blue, pink, neon).
- Move important artwork into the outer edge of a maskable icon.

## Verify

```bash
python3 tools/generate_ui.py            # rebuild UI icon formats
python3 tools/generate.py               # rebuild app icons, logos, social
```
Then load the app and confirm icons render at the intended size, the sprite
resolves (`/icons/ui/khabar-chakra-icons.svg` → 200), and every path in
`site.webmanifest` exists.
