# START HERE — Khabar Chakra icon pack for Antigravity

**খাবার চক্র / खाद्य चक्र · Save • Share • Sustain**

This zip is built to be extracted **directly into your Antigravity workspace
root**. After unzipping there is nothing to rearrange — the agent will find the
rules and the icons at the paths it already looks in.

---

## Install (one command)

```bash
# from your project root
unzip khabar-chakra-icons-antigravity.zip
```

Then open the workspace in Antigravity and paste, in the agent chat:

```
@public/icons/ui/icons.json
Install the Khabar Chakra icon system in this project. Follow /wire-icons.
Report anything that does not fit this stack.
```

That's it. `AGENTS.md` is picked up automatically at session start, the
`/wire-icons` workflow walks the agent through the install, and the skill loads
itself when the agent touches anything icon-related.

---

## What you get

| | |
|---|---|
| **78 in-app UI icons** | 24 px grid, 2 px stroke, round caps — SVG, sprite, JSON, React, PNG |
| **45 app-icon assets** | master, PWA, maskable, Android adaptive fg/bg, favicons, iOS, mono, notification, colour tiles |
| **23 logo files** | horizontal, stacked, light, dark, monochrome, wordmark, splash — Bengali, Devanagari and Latin text as vector outlines |
| **3 social cards** | OG + Twitter 1200×630 |
| **Antigravity setup** | rules, skill, workflow, prompts |
| **Generators** | rebuild everything from one geometry file |

---

## Folder map

```
├── AGENTS.md                    ← Antigravity rules (read automatically)
├── .agents/
│   ├── rules/icon-system.md     ← modular rule (model_decision trigger)
│   ├── skills/icon-system/      ← skill, loads on demand
│   │   └── SKILL.md
│   └── workflows/wire-icons.md  ← type /wire-icons in chat
├── public/                      ← SHIP THESE — all icons at their final paths
│   ├── site.webmanifest
│   ├── icons/                   ← app icons, favicons, maskable, adaptive, iOS…
│   │   └── ui/                  ← 78 UI icons + sprite + icons.json + dev/
│   ├── branding/                ← logo lockups
│   └── social/                  ← OG / Twitter cards
├── tools/                       ← optional: rebuild or extend the set
└── docs/
    ├── icon-preview.html        ← ★ open this — every icon on one page
    ├── ANTIGRAVITY-SETUP.md     ← full setup guide, gotchas, prompt library
    ├── AGENTS-icon-section.md   ← snippet if you already have an AGENTS.md
    └── preview/                 ← QA sheets (family, size test, maskable proof)
```

---

## Look at it first

Open **`docs/icon-preview.html`** in a browser. It is fully self-contained (no
network, no external files) and shows:

- every app-icon variant side by side
- all logo lockups, including the dark and monochrome versions
- the colour palette
- all 78 UI icons, grouped, with a **size slider (16–56 px)** and a **dark-mode
  toggle** so you can check small-size legibility yourself

---

## If your project does not use `public/`

| Stack | Put `public/` contents in |
|---|---|
| Next.js · Vite · Vue · SvelteKit · Laravel · Rails | `public/` |
| Nuxt 2 | `static/` |
| Django · Flask | `static/` |
| Expo / React Native | `assets/` (+ icon config in `app.json`) |

Then tell the agent the mapping — prompt 1 in `docs/ANTIGRAVITY-SETUP.md` handles
this explicitly.

---

## ⚠️ Already have an `AGENTS.md`?

**Do not overwrite it.** Restore yours, then append the icon rules from
`docs/AGENTS-icon-section.md`. Keep it in one file — Google has not documented a
precedence order between `AGENTS.md` and `GEMINI.md` at the same level, so
duplicating rules across both is how they drift apart.

---

## Using the icons in code

**React**
```jsx
import KhabarIcon from "@/components/icons/KhabarIcon";   // copy from public/icons/ui/dev/
<KhabarIcon name="cook" size={24} />
```

**Plain web — sprite, one request**
```html
<svg width="24" height="24" aria-hidden="true"><use href="#kc-cook"></use></svg>
```
```css
.kc-icon { fill:none; stroke:currentColor; stroke-width:2;
           stroke-linecap:round; stroke-linejoin:round; }
```

**Everywhere else** — use `public/icons/ui/<name>.svg` directly; each file is
self-contained and inherits `currentColor`.

**Find an icon** — `public/icons/ui/icons.json` lists all 78 with categories and
tags. Or just search `docs/icon-preview.html`.

---

## Colour — “Market Fresh”

| Token | Hex | Use |
|---|---|---|
| `--kc-teal` | `#0B5B4E` | primary — icons, text, ring |
| `--kc-green` | `#3EA44C` | leaf, active/selected |
| `--kc-red` | `#E2543E` | tomato accent |
| `--kc-orange` | `#F08A24` | carrot accent |
| `--kc-yellow` | `#F5B921` | food mound |
| `--kc-cream` | `#FBF7EF` | light background |
| `--kc-ink` | `#072A26` | dark background |

On dark surfaces use teal `#1B9C82` and green `#62C86D`.
Icons inherit `currentColor` — style with CSS `color`, never a hard-coded fill.

---

## Extending the set

Need an icon that isn't there? Add it to `tools/kc_ui.py` and regenerate —
**do not** hand-draw a one-off SVG in a component.

```bash
pip install cairosvg pillow fonttools uharfbuzz
python3 tools/generate_ui.py    # UI icons → SVG, sprite, JSON, JS, React, PNG, sheets
python3 tools/generate.py       # app icons, logos, social cards
python3 tools/build_preview.py  # rebuild docs/icon-preview.html
```

Change a brand colour in `tools/kc_symbol.py` → re-run → **every** asset updates
with identical geometry. That is what keeps the family consistent.

---

## Verified before packaging

| Check | Result |
|---|---|
| Sprite symbols | 78 / 78, all `viewBox="0 0 24 24"` |
| Catalogue ↔ sprite parity | no missing ids |
| `khabar-chakra-icons.js` | valid ESM; `kcIcon()` emits well-formed SVG |
| Every SVG well-formed XML | yes |
| `favicon.ico` | multi-size 16 / 32 / 48 |
| PNG dimensions | correct for every platform slot |
| Antigravity rules files | all under the 12,000-character limit |
| Preview page | self-contained, 0 raw `&`, 100 inline SVGs |

*Khabar Chakra — Save • Share • Sustain.*
