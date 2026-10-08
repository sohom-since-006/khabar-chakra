# /wire-icons — install the Khabar Chakra icon system into the app

Run this workflow once per project, after copying `public/` into the workspace.
Follow the steps in order and report what changed.

## 1. Confirm the assets are present

Check for these paths. If any are missing, stop and say exactly which one.

- `public/icons/` (master, PWA, maskable, adaptive fg/bg, favicons, iOS, mono, notification)
- `public/icons/ui/` (`khabar-chakra-icons.svg`, `icons.json`, per-icon SVGs)
- `public/branding/` (logo lockups)
- `public/social/` (OG + Twitter cards)
- `public/site.webmanifest`

If the framework does not use `public/`, place them in the framework's static
directory (`static/`, `assets/`, `app/` for Next.js favicons, etc.) and record
the mapping you used.

## 2. Wire the favicons and PWA manifest

Insert into the document head (or the framework's metadata API):

```html
<link rel="icon" href="/icons/favicon.ico" sizes="any">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0B5B4E">
```

Also set the social tags:

```html
<meta property="og:title" content="Khabar Chakra — Save • Share • Sustain">
<meta property="og:image" content="/social/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

## 3. Load the UI icon sprite once

Add the sprite near the end of `<body>` so `<use href="#kc-…">` resolves:

```html
<svg style="display:none" aria-hidden="true"><use href="/icons/ui/khabar-chakra-icons.svg"></use></svg>
```

In a bundler (Vite, Next, webpack) prefer importing the sprite file as a URL and
injecting it, or copy its `<symbol>` list into the root layout.

Then add the base CSS:

```css
.kc-icon { fill: none; stroke: currentColor; stroke-width: 2;
           stroke-linecap: round; stroke-linejoin: round; }
```

## 4. Provide an icon component

- **React** — copy `public/icons/ui/dev/KhabarIcon.jsx` and
  `khabar-chakra-icons.js` into `src/components/icons/` and import from there.
- **Vue/Svelte/vanilla** — use `kcIcon(name, size, color, title)` from
  `khabar-chakra-icons.js`, or the sprite.
- **Other stacks** — read `icons.json` and the per-icon SVGs; the geometry is
  framework-agnostic.

## 5. Add the brand tokens

```css
:root {
  --kc-teal:#0B5B4E; --kc-teal-deep:#08453B; --kc-teal-bright:#1B9C82;
  --kc-green:#3EA44C; --kc-green-deep:#2C7A3B; --kc-green-light:#62C86D;
  --kc-red:#E2543E; --kc-orange:#F08A24; --kc-yellow:#F5B921;
  --kc-cream:#FBF7EF; --kc-ink:#072A26;
}
```

## 6. Fix any existing icons

Replace every icon you find that comes from another library with the closest
Khabar Chakra icon. If there is no close match, say so and add it to
`tools/kc_ui.py` rather than drawing a one-off.

## 7. Verify (do not skip)

1. Build/run the dev server.
2. Confirm no request 404s for `/icons/...` or `/site.webmanifest`.
3. Confirm each replaced icon renders at its intended size and colour.
4. Confirm `site.webmanifest` is valid JSON and every `icons[].src` resolves.
5. Report: files changed, icons replaced, anything still unmatched.
