# Using the Khabar Chakra icons in Antigravity

**Google Antigravity** (the agent-first IDE) does not have a concept of "the app's
icons" that it magically picks up. Its agent only knows what is **inside your
workspace** plus whatever your **rules** tell it. So getting Antigravity to use
this icon family is three steps:

1. **Get the files into the project** — the agent can only read files in your
   workspace (non-workspace file access is off by default).
2. **Tell the agent the icons exist** — via `AGENTS.md` (always-on rules) and/or
   a Skill that loads on demand.
3. **Prompt it to wire them in** — the agent does the integration work.

Everything needed is in this `antigravity/` folder.

---

## Quick version (5 minutes)

```bash
# 1. in your Antigravity workspace root
cp -r /path/to/khabar-chakra-branding/public ./public        # icons, logos, social, manifest

# 2. give the agent the rules
cp /path/to/khabar-chakra-branding/antigravity/copy-into-project-root/AGENTS.md ./AGENTS.md
mkdir -p .agents
cp -r /path/to/khabar-chakra-branding/antigravity/copy-into-project-root/.agents/. ./.agents/
```

Then open the agent chat and paste **`prompts/1-wire-app-icons.md`**.

> If your project **already has** an `AGENTS.md`, don't overwrite it — append the
> contents of `copy-into-project-root/AGENTS-icon-section.md` instead.

---

## Step 1 — Get the files into the workspace

Antigravity's **Agent Non-Workspace File Access** is off by default, so the agent
cannot read anything outside your project folder. Copy the assets in:

| Copy this | To your project |
|---|---|
| `public/icons/` | `public/icons/` (or your static dir) |
| `public/branding/` | `public/branding/` |
| `public/social/` | `public/social/` |
| `public/site.webmanifest` | `public/site.webmanifest` |
| `tools/kc_symbol.py`, `tools/kc_ui.py`, `tools/kc_text.py`, `tools/generate.py`, `tools/generate_ui.py` | `tools/` |

Bring `tools/` along too — that is what lets the agent *extend* the set later
(add an icon, regenerate every format) instead of faking one.

**If your framework isn't `public/`:**

| Stack | Static directory |
|---|---|
| Next.js (App Router) | `public/` for assets; favicons can also live in `app/` |
| Vite / React / SvelteKit | `public/` |
| Vue CLI / Nuxt | `public/` (`static/` in Nuxt 2) |
| Django / Flask | `static/` |
| Laravel | `public/` |
| Rails | `public/` |
| Expo / React Native | `assets/` + `app.json` icon config |

Tell the agent the mapping; the prompt file covers this.

---

## Step 2 — Tell the agent the system exists

### 2a. `AGENTS.md` — the always-on layer (recommended, most reliable)

Antigravity reads `AGENTS.md` or `GEMINI.md` at the workspace root as **Rules**,
with no frontmatter needed, and keeps them active every turn. This is the
cross-tool standard, so Cursor and Claude Code read it too.

- If you have no `AGENTS.md` → copy `copy-into-project-root/AGENTS.md`.
- If you already have one → append `copy-into-project-root/AGENTS-icon-section.md`.

Keep any single rules file **under 12,000 characters** — Antigravity enforces that
limit.

### 2b. `.agents/rules/` — modular, scope-aware rules *(optional)*

For larger projects, keep icon rules in their own file:

```
.agents/rules/icon-system.md      ← already written for you
```

**Two things to know, or it will silently do nothing:**

- Every `.md` inside `.agents/rules/` **must start with YAML frontmatter**
  declaring a valid trigger. A file with missing or malformed frontmatter is
  **silently discarded** — no error, no warning.
- Antigravity scans only the **immediate** `.md` children of `.agents/rules/`.
  Nested subfolders are ignored unless registered in `.agents/rules.json`.

The file in this pack uses `trigger: model_decision`, which means Antigravity
injects only its description up-front and the agent reads the full rule when the
task matches — cheaper than always-on for a detailed reference doc.

> **Safest path:** create it through the UI so the frontmatter is guaranteed
> correct — **Settings → Customizations → Rules → + Workspace**, name it
> `icon-system`, then paste in the body from this pack. If you'd rather do it by
> hand and the rule doesn't seem to apply, check Settings → Customizations that it
> was registered, and fall back to putting the content in `AGENTS.md`.
> `.agent/rules/` (singular) also still works — it's the legacy folder name.

### 2c. A Skill — loads only when relevant

```
.agents/skills/icon-system/SKILL.md      ← already written for you
```

Skills use **progressive disclosure**: the agent sees just the skill's
`description` and pulls in the full instructions only when your task matches —
perfect for a reference doc this size. The `description` field is required; ours
reads *"Use when adding, changing, styling, or reviewing any icon, logo, favicon,
PWA manifest, app icon, or branding asset…"*, which is what triggers it.

### 2d. A Workflow — repeatable, invoked with `/`

```
.agents/workflows/wire-icons.md          ← already written for you
```

Type `/wire-icons` in the agent chat to run the install procedure on a new
project. Workflows are just Markdown checklists — the agent runs them as steps.

---

## Step 3 — Prompt the agent

Three ready-to-paste prompts are in `prompts/`:

| File | When |
|---|---|
| `1-wire-app-icons.md` | First install: favicons, manifest, sprite, component, tokens |
| `2-build-with-icons.md` | Prefix for any UI task, so it doesn't reach for Lucide |
| `3-verify-icons.md` | Audit before release — catches foreign icons, off-brand colours, a11y gaps |

**Use `@` to hand files to the agent explicitly.** In the Agent Panel
(<kbd>Cmd/Ctrl</kbd>+<kbd>L</kbd>), `@public/icons/ui/icons.json` puts the
catalogue in context for that task. Combine with the rule file for best results.

Example opening message:

> `@public/icons/ui/icons.json` `@.agents/skills/icon-system/SKILL.md`
> Install the Khabar Chakra icon system in this project. Follow
> `/wire-icons`. Use the sprite for the web layer, create the React
> `KhabarIcon` component, and verify with a running dev server. Report anything
> that doesn't fit this stack.

---

## What actually happens to your codebase

After the wire-up, expect roughly:

| File | Change |
|---|---|
| `index.html` / `layout.tsx` / `app.html` | favicon links, manifest link, OG tags, `theme-color` |
| Root stylesheet | `.kc-icon` class + `--kc-*` brand tokens |
| `src/components/icons/KhabarIcon.jsx` | the component |
| `src/components/icons/khabar-chakra-icons.js` | icon path data |
| Bundled sprite | one request for all 78 icons |
| Existing components | foreign icons replaced with brand icons |

---

## Common mistakes to avoid

1. **Letting it add an icon library.** Agents reach for Lucide/Heroicons by
   default. Rule 1 in `AGENTS.md` exists for exactly this — and prompt 3 finds
   the ones that slipped through.
2. **Forgetting the sprite include.** `<use href="#kc-cook">` resolves to nothing
   if the sprite isn't in the document. The prompt adds it once per layout.
3. **Letting it "redraw" the app icon.** The master mark is generated from
   `tools/kc_symbol.py`. If it needs a change, regenerate — don't let the agent
   hand-edit a PNG.
4. **Editing `public/` by hand.** Those are build artefacts. Change `tools/` and
   re-run.
5. **Assuming `AGENTS.md` beats `GEMINI.md`.** Google's docs don't document a
   strict precedence order when both exist at the same level. Keep icon rules in
   **one** place — don't duplicate them across both and let them drift.
6. **Forgetting the maskable safe zone.** If the agent regenerates Android icons,
   artwork must stay inside the central 66 % circle.

---

## Does the agent have to run the generator?

No — but it's better if it can. `public/` alone is self-contained: the agent can
build the whole app without ever running Python. The generator only matters when
you need an icon that doesn't exist yet or want to change the brand colour
globally. Bring `tools/` along if you want that option; the generators need
`pip install cairosvg pillow fonttools uharfbuzz`.

---

## Files in this folder

```
antigravity/
├── ANTIGRAVITY-SETUP.md                    ← this file
├── copy-into-project-root/
│   ├── AGENTS.md                           ← full rules file (no existing AGENTS.md)
│   ├── AGENTS-icon-section.md              ← snippet to append (existing AGENTS.md)
│   └── .agents/
│       ├── rules/icon-system.md            ← modular rule (model_decision)
│       ├── skills/icon-system/SKILL.md     ← on-demand skill
│       └── workflows/wire-icons.md         ← /wire-icons workflow
└── prompts/
    ├── 1-wire-app-icons.md
    ├── 2-build-with-icons.md
    └── 3-verify-icons.md
```

*Khabar Chakra — খাবার চক্র / खाद्य चक्र — Save • Share • Sustain.*
