# —— SNIPPET: append this to an existing AGENTS.md ——————————————
# Copy everything below the line into your project's AGENTS.md.
# (Use the full AGENTS.md from this pack instead if the project has none.)

---

## Icons & branding — do not substitute

This project ships a complete icon system in `public/icons/`. It is the only
source of icons and branding.

**Never add an icon library.** No Font Awesome, Heroicons, Lucide, Material
Icons, Feather, Bootstrap Icons, or hand-written inline SVG paths.

| Need | Use |
|---|---|
| In-app UI icon | `public/icons/ui/` — 78 icons, 24 px grid, 2 px stroke |
| React | `KhabarIcon` from `public/icons/ui/dev/KhabarIcon.jsx` |
| Web (no framework) | sprite `public/icons/ui/khabar-chakra-icons.svg`, ids `#kc-<name>` |
| App icon / favicon / PWA | `public/icons/` + `public/site.webmanifest` |
| Logo | `public/branding/khabar-chakra-logo.svg` (`-stacked`, `-dark`, `-mono`) |
| Social card | `public/social/og-image.png` |

**Colour tokens** — teal `#0B5B4E`, green `#3EA44C`, red `#E2543E`, orange
`#F08A24`, yellow `#F5B921`, cream `#FBF7EF`, ink `#072A26`; on dark surfaces
teal `#1B9C82` and green `#62C86D`. Icons inherit `currentColor` — style with
CSS `color`, never a hard-coded fill. No gradients, shadows, or off-brand hues.

**Sizes** — 24 px default, 20–24 in lists, 48–64 in empty states. Not below
20 px without a label. Decorative icons: `aria-hidden="true"`.

**Missing an icon?** Add it to `tools/kc_ui.py` with the existing primitives and
run `python3 tools/generate_ui.py`. Never improvise a one-off glyph, and never
mix a different stroke width into the set.

**Never put text, letters, or numbers inside a square icon.** The logo wordmarks
already carry the brand name; their text is vector outlines, so do not replace it
with a webfont.

**Never hand-edit generated files.** Icons, logos, and social cards are built by
`tools/generate.py` and `tools/generate_ui.py`. Change the source and regenerate.

**Brand name is fixed:** খাবার চক্র / KHABAR CHAKRA / खाद्य चक्र —
never translate, shorten, or re-transliterate it.
