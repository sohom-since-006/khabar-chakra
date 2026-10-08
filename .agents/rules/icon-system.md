---
description: Khabar Chakra icon system. Activates when touching icons, logos, favicons, PWA manifest, app icons, or any UI component that displays an icon. Enforces using the existing 78-icon set and brand colour tokens instead of adding another icon library.
trigger: model_decision
---

# Icon system rule

This project ships a complete icon system in `public/icons/`. Treat it as the
only source of icons and branding.

1. **Do not add an icon library.** No Font Awesome, Heroicons, Lucide, Material
   Icons, Feather, Bootstrap Icons, or hand-drawn inline SVG paths.
2. **Use `public/icons/ui/`** for in-app icons (78 icons, 24 px grid, 2 px stroke).
   Sprite: `public/icons/ui/khabar-chakra-icons.svg`, symbol ids `#kc-<name>`.
   Catalogue with categories and tags: `public/icons/ui/icons.json`.
   React: `KhabarIcon` from `public/icons/ui/dev/KhabarIcon.jsx`.
3. **Use brand colour tokens only** — teal `#0B5B4E`, green `#3EA44C`, cream
   `#FBF7EF`, ink `#072A26`; on dark surfaces teal `#1B9C82`, green `#62C86D`.
   Icons inherit `currentColor`: style with CSS `color`, never a hard-coded fill.
   No gradients, shadows, or off-brand hues.
4. **Sizes:** 24 px by default, 20–24 in lists, 48–64 for empty states. Never
   below 20 px without a text label. Decorative icons get `aria-hidden="true"`.
5. **Missing an icon?** Add it to `tools/kc_ui.py` with the existing primitives
   and run `python3 tools/generate_ui.py`. Do not improvise a one-off glyph.
6. **No text inside any square icon** — no letters, numbers, or script.
7. **App icons, logo, manifest:** use `public/icons/`, `public/branding/`,
   `public/site.webmanifest` as-is. Never redraw the mark, never replace the
   wordmark with a font (its text is already vector outlines).

Full details and code recipes: see the `khabar-chakra-icons` skill in
`.agents/skills/icon-system/SKILL.md`.
