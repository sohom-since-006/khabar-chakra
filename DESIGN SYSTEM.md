# DESIGN SYSTEM — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final draft, usable directly** · Supersedes v1.0 and "Update v1.1".
> Depends on PRD v1.1, TRD v1.1. Feeds ARCHITECTURE, SECURITY, TESTING, CODE_STYLE, AGENTS. Binding decisions: AGENTS.md §2 (D18 Hindi removed from logo, D19 palette, D24 fonts and map).
> **Cost rule:** all fonts, icons and tools are free/open-licence (OFL, MIT, CC0). Record licences in `docs/THIRD_PARTY.md`.

## 0. What changed since v1.0
Hindi removed from the logo · new palette **"Market Fresh"**, designed for the website and independent of the logo colours · verified badge recoloured · cursive accent colour rules · map styling for West Bengal · all code removed (tokens are tables).

## 1. Principles
| # | Principle | In practice |
|---|-----------|-------------|
| 1 | **Fresh** | Bright natural colour, generous space, rounded shapes; food and nature first |
| 2 | **Friendly** | Warm voice, a little handwriting, a smiling bowl mascot; no guilt or fear |
| 3 | **Fair (accessible)** | Strong contrast, big touch targets, no meaning by colour alone, motion that can be switched off |
| 4 | **Fast** | Live visuals degrade automatically on weak phones; content never waits for animation |
| 5 | **Trustworthy** | Plain words, visible rules, honest badges, clear time limits |
| 6 | **Local** | English, Bengali and Hindi from the start of the design; ₹, DD/MM/YYYY; Indian veg/non-veg marks |
Playful on marketing pages; calm and plain on decision screens (listing, contact, documents, admin).

## 2. Brand
### 2.1 Logo
Mark: smiling dark-green bowl with tomato, greens, carrot and yellow grain inside two cycle arrows, leaves on top, yellow sparks. Lockup: mark → **খাবার চক্র** → **KHABAR CHAKRA** → tagline **Save • Share • Sustain**. **No Hindi line (D18).**
- Hindi appears only as translated UI text; the Hindi name is **खाना चक्र**.
- Files to produce: full lockup (light), full lockup (dark mode), mark only, app icons (192, 512, maskable 512), social card 1200×630 — none with Hindi.
- Trace the supplied bitmap to SVG (free: Inkscape → Trace Bitmap), delete the Hindi line, clean by hand, build the dark variant.
- Rules: mark-only below ~120 px wide; never dark-green on dark-green (use the dark variant or a light pill); app icon keeps a light background and the mark inside the central 80%; clear space = height of the top leaf; no stretching, outlines, shadows or recolouring outside the supplied variants. The name and logo are not covered by the code licence.
- The logo keeps its own colours; it always sits on a white/cream pill or the dark variant, so it never clashes with the site palette.

### 2.2 Voice
Warm, concrete, local, never guilt-tripping.
| Do | Don't |
|----|-------|
| "Your milk expires tomorrow. Consider using it today." | "You're wasting food!" |
| "Use this today and save about ₹40." (only when computed) | "Save the planet!" |
| "This listing has ended. Thank you for sharing!" | "Listing expired." |
| "You decide whether the food is safe to accept." | "This food is safe." |
| "Documents reviewed by Khabar Chakra." | "Trusted by the government." |
Sample copy (goes in the message files): landing headline "Good food deserves a second chance." (two words in the cursive accent) · "From your fridge to the wedding hall — keep food out of the bin." · "Weddings end. The food doesn't have to go to waste." · empty inventory "Nothing here yet. Add your first item and we'll keep an eye on it." · camera denied "No problem. You can upload a photo or type the details instead." · cooked food "Cooked food is best picked up within a few hours. You decide whether it's safe to accept." · pickup code "Show this code to the person collecting the food."

## 3. Colour — "Market Fresh"
### 3.1 Idea
A fresh-market look: mint-tinted white, **bold Basil green** for action and trust, **Mango yellow** for energy, **Chilli red** for urgency only, **Blueberry blue** for neutral information; a deep **moss night** with glowing accents in dark mode. Proportion: **60% neutrals · 30% Basil · 10% Mango/Chilli/Blueberry**.

### 3.2 Ramps (✔ = approved for text or small UI; the rest are fills, illustration, large graphics)
| Basil (primary green) | Hex | Note |
|---|---|---|
| 50 / 100 / 200 / 300 | F0FAF2 / E4F5E8 / C6EBD0 / 94D8A8 | washes, chip background, illustration |
| 400 ✔ | 34B45B | dark-mode primary |
| 500 ✔ | 27A04A | rings and graphics (≥ 3:1 on light) |
| 600 | 0F8A40 | large text/graphics only (≈ 4.4:1) |
| 700 ✔ | 0B6E3C | **primary**, links |
| 800 ✔ | 07502A | focus ring, chip text, dark brand bands |
| 900 ✔ | 053B20 | text on Mango |

| Mango (yellow) | Hex | Note |
|---|---|---|
| 50 / 100 / 300 | FFF9E5 / FFF3CC / FFD966 | wash, "soon" chip, illustration |
| 500 ✔ | FFC93C | **accent fill**; never text on light |
| 700 ✔ | B97A00 | ring/graphic on light |
| 800 ✔ | 5A3A00 | text on the "soon" chip |

| Chilli (red-orange) | Hex | Note |
|---|---|---|
| 50 / 100 / 300 | FEF3F0 / FDE7E1 / F7A08D | wash, "expiring" chip, illustration |
| 400 ✔ | FF7A63 | dark-mode danger |
| 500 | F2552C | illustration only |
| 600 ✔ | D6381F | **danger/urgent** (white text OK) |
| 800 ✔ | 8B2412 | text on the "expiring" chip |

| Blueberry (information) | Hex |
|---|---|
| 100 / 300 ✔ (dark) / 700 ✔ | E6EEFA / 8FB4F2 / 2457A6 |

### 3.3 Semantic tokens (components use these names only; no hex codes in components)
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| bg | FAFDF6 | 0A1912 | Page background |
| bg-sunken | EEF5E8 | 07120D | Sections, wells |
| surface | FFFFFF | 12281D | Cards, dialogs |
| surface-2 | — | 1A382A | Raised/hover (dark) |
| border | DDE6D5 | white 12% | Decorative dividers |
| border-input | 6F7F66 | 7E9486 | Input and outline borders |
| text | 14251B | F2F5EA | Body |
| text-muted | 4A5D52 | B4C5B8 | Secondary |
| primary / hover / on-primary | 0B6E3C / 085A31 / FFFFFF | 34B45B / 4CC472 / 06140D | Main button |
| accent / hover / on-accent | FFC93C / F2B91F / 053B20 | FFC93C / FFD966 / 053B20 | Highlight call-to-action |
| link | 0B6E3C | 6FD58A | Links (underlined) |
| danger / on-danger | D6381F / FFFFFF | FF7A63 / 06140D | Errors, destructive |
| info / info-bg | 2457A6 / E6EEFA | 8FB4F2 / blue 14% | Tips, notes |
| focus-ring | 07502A | FFC93C | 3 px outline, 2 px offset |
| fresh bg / fg / ring | E4F5E8 / 07502A / 27A04A | green 16% / A8E8BB / 34B45B | Fresh status |
| soon bg / fg / ring | FFF3CC / 5A3A00 / B97A00 | yellow 16% / FFE08A / FFC93C | Use-soon status |
| expiring bg / fg / ring | FDE7E1 / 8B2412 / D6381F | red 18% / FFB3A3 / FF7A63 | Expiring/expired status |
| hero gradient | mint → page → pale mango | surface → page → olive tint | Landing hero (text sits on opaque cards) |
Shadows: light = soft green-tinted; dark = a 1 px translucent border instead. Radii, spacing, motion and z-index tokens are in §5 and §7.

### 3.4 Hand-checked contrast (the CI script TC-A11Y-004 is the final authority)
**Light:** text on page ≈ 15.6:1 · muted ≈ 6.9 · white on Basil 700 ≈ 6.3 · Basil 700 on page ≈ 6.2 · Basil 900 on Mango ≈ 8.3 · white on Chilli 600 ≈ 4.7 · Chilli 600 on page ≈ 4.6 · Blueberry 700 ≈ 6.8 · focus ring ≈ 9.3 · input border ≈ 4.2 · chip text ≈ 8.5 / 9.3 / 7.5 (fresh/soon/expiring) · rings ≈ 3.3 / 3.5 / 4.6. ❌ Mango on page ≈ 1.5 (never text). ⚠ Basil 600 on white ≈ 4.4 (large only).
**Dark:** text ≈ 16.4 (page) / 14.1 (surface) · muted ≈ 10.0 / 8.6 · Basil 400 on page ≈ 6.7 · on-primary ≈ 7.0 · Mango on page ≈ 11.8 · danger ≈ 7.1 / 6.1 · input border ≈ 4.8.

### 3.5 Usage rules
1. Primary button: Basil 700 + white (light), Basil 400 + near-black (dark); one per view.
2. Accent button: Mango + Basil 900 text, for the single most inviting action.
3. Never use Mango, Basil 300–500 or Chilli 500 as text or hairlines on light backgrounds.
4. Status is always colour + icon + text.
5. Chilli only for urgency and errors; Blueberry only for neutral information.
6. Brand bands (hero strip, footer): Basil 800 with white text and Mango accent text (≈ 6.2:1).
7. Text never sits directly on a gradient; use an opaque surface.
8. Never recolour photos, user content or the logo.

### 3.6 Cursive accent colours
| Where | Colour | Contrast |
|---|---|---|
| Light page or card | Basil 700 or text | ≈ 6.2 / 15.6 |
| Light page, urgent flourish | Chilli 600, 28 px or larger | ≈ 4.6 |
| Basil 800 band | Mango, 28 px or larger | ≈ 6.2 |
| Basil 700 panel | White (Mango only ≈ 4.1, avoid) | ≈ 6.3 |
| Dark page or card | Mango or link colour | ≈ 11.8 / ≥ 8 |

### 3.7 Charts, map, 3D
- **Charts:** order Basil 700 → Mango (dark outline) → Chilli 600 → Blueberry 700 → neutral; always patterns, direct labels and a data table.
- **Map pins:** Event = Mango with dark icon · Home = Basil 700 with white icon · Swap = Blueberry 700 with white icon · Organisations/authorities/caterers = Basil 800 with Mango ring; time-left ring uses status colours; user dot = Blueberry 700 with white halo.
- **3D scene:** light = hero gradient sky with Basil, Mango, Chilli, Blueberry objects; dark = moss-night gradient with Mango fireflies.

## 4. Typography
### 4.1 Pairing (cursive handwriting + normal)
| Role | Font |
|------|------|
| **Cursive accent (sparingly)** | **Caveat**, weight 700 |
| **Normal (headings, body, UI)** | **Nunito** |
| Bengali body / accent | Hind Siliguri / Atma |
| Hindi body / accent | Hind / Kalam |
Caveat and Nunito have **no Bengali or Devanagari letters**, so the accent font switches per language. All fonts are open-licence, self-hosted through the framework's font optimisation (no runtime requests to Google), swap loading; Bengali/Hindi families load only on those locales. Optional swap: Dancing Script (formal, joined-up cursive) in place of Caveat if the team prefers it after trying both on the landing hero.

### 4.2 Accent rules
Allowed: taglines, one or two highlighted words in a heading, friendly callouts, ribbons ("Use This First"), the footer tagline, empty-state captions. Not allowed: body text, form labels, buttons, errors, tables, legal text, admin screens, anything over about 8 words. Size ≥ 24 px (≥ 28 px when coloured Chilli or Mango); weight 600–700; at most one accent phrase per viewport in the app and two on the landing page; purely visual.

### 4.3 Scale (Nunito)
| Token | Mobile | Desktop | Weight | Line height |
|-------|--------|---------|--------|-------------|
| Display (landing hero) | 40 | 60 | 800 | 1.1 |
| H1 | 32 | 44 | 800 | 1.15 |
| H2 | 26 | 34 | 700 | 1.2 |
| H3 | 22 | 26 | 700 | 1.25 |
| H4 | 18 | 20 | 700 | 1.3 |
| Body large | 18 | 18 | 400 | 1.6 |
| **Body** | **16** | **16** | 400 | 1.6 |
| Small | 14 | 14 | 400–600 | 1.5 |
| Caption (non-essential only) | 12 | 12 | 600 | 1.4 |
| Accent (Caveat) | 24 | 32–40 | 600–700 | 1.1 |
Use fluid sizing for headings; line length 65–75 characters. Bengali/Devanagari: line height 1.7, body 17 px where possible, no letter-spacing, no uppercase transforms. Tabular figures for countdowns, quantities, tables. Text must reflow at 200% zoom; never fix heights on text containers.

## 5. Layout, Spacing, Shape
- **Breakpoints (mobile first):** 360 (4 columns, 16 gutter, 16 margin) · 480 · 768 (8 columns, 24 gutter) · 1024 (12 columns) · 1280 (max content 1200; app 1280). Respect device safe-area insets.
- **Spacing (4 px base):** 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Card padding 16/24; section padding 48/80.
- **Radius:** controls 12 · cards 20 · sheets/dialogs 24 · chips and avatars pill.
- **Elevation / z-index:** header 20 · bottom bar 30 · popovers and tooltips 40 · dialogs and sheets 50 · toasts 60 · full-screen camera 70.

## 6. Icons, Illustration, Mascot
- **UI icons:** Lucide (MIT), 24 px grid, 1.75 px stroke, rounded; icon-only controls have accessible names.
- **Custom flat icons:** food categories (packaged, vegetables, fruits, meat/fish/egg, dairy, grains/pulses, bread/bakery, cooked, beverages, other) and waste types.
- **Emoji** are decoration only (marketing, FAQ headings, empty states), never the only carrier of meaning.
- **Veg / non-veg marks:** the standard Indian food-label marks — green circle in a green square for veg, brown triangle in a brown square for non-veg (different shapes, so not colour alone) — plus a distinct egg label and text for screen readers. *Verify the current official specification before final art.*
- **Illustration:** flat vector, rounded shapes, no outlines, 2–3 tones from the ramps; self-made or open-licence. Scenes needed: empty inventory, nothing nearby, no notifications, camera denied, offline, 404, verification pending, window ended, pickup completed, wedding hall/event, compost/recycle.
- **Mascot (the smiling bowl):** states happy, thinking, cheering, sleepy, searching, "oops" (never sad about waste); at most one per screen; hidden in admin; decorative `alt` empty; name to be decided (check meanings in Bengali and Hindi).
- **Photos:** 4:3 crop, blur placeholder, no filters, location data stripped.

## 7. Motion
Purposeful, short, gentle; always has a reduced version.
| Token | Value | Use |
|-------|-------|-----|
| fast / base / slow / hero | 120 / 200 / 320 / 600–900 ms | hover / accordion, tooltip / sheets, dialogs / landing reveals, chart draw-in |
| ease | soft ease-out (fast start, gentle stop) | default |
| spring | stiffness 300, damping 24 | confirmations |
Patterns: press scale 0.97 · card hover lift 4 px (pointer devices, no hover-only info) · scroll reveal fade + 16 px rise once, 60 ms stagger · page cross-fade 200 ms · freshness ring draws in 600 ms · counters and charts ≤ 900 ms once · countdown updates once a minute (seconds only in the last 60 s) · badge shine one 1.2 s sweep · toasts slide 8 px, auto-dismiss 5 s (pause on hover/focus) · mascot bob ≤ 6 px on landing and empty states only.
**Reduced motion** (OS setting or the in-app "Reduce animations", which can only reduce): 3D background → static illustrated background · parallax and scroll-linked camera off · reveals, bobbing, shine, count-up → instant or ≤ 100 ms fade · springs → plain fades · nothing auto-plays.

## 8. Live Background
**Concept:** a living food garden — soft gradient sky, floating tomato, carrot, greens, banana, onion and bowl, drifting leaves; reacts to cursor and scroll. Decorative only, hidden from assistive technology, never behind text without an opaque surface.
| Tier | What | When |
|------|------|------|
| **T2 Full 3D** | three.js scene | Capable device, motion allowed, **landing page only** |
| **T1 Light** | CSS/SVG floating art and soft gradient blobs | Inside the app by default; landing fallback |
| **T0 Static** | Illustrated gradient, no motion | Reduced motion, data saver, low-end device, 3D unavailable |
**Selection:** T0 if reduced motion, "Reduce animations", data saver or no 3D support; T1 if low memory (≤ 2 GB), few CPU cores (≤ 4), low GPU tier, battery saver or slow connection; otherwise T2 on the landing page and T1 elsewhere. **FPS watchdog:** if the 2-second average falls below 30 fps (24 on phones) drop one tier for the session; pause when off-screen or the tab is hidden; on 3D context loss fall back to T1.
**T2 spec:** 8–12 rounded low-poly food models plus ≈ 40 instanced leaves/sparks · ≤ 3,000 triangles per model, ≤ 40,000 total · simple materials with vertex colours, at most one 512² atlas · compressed glTF ≤ 1.5 MB total, chunk ≤ 500 KB gz · hemisphere light + one soft directional light, no real-time shadows or heavy effects · pointer parallax ≤ ±12°, auto-rotation ≤ 8°/s, scroll-linked camera across hero → loop → events · pixel ratio capped (desktop 1.5, mobile 1.25), anti-aliasing on desktop only, render on demand when idle · targets 60 fps desktop, 30 fps mobile · static hero image from the same scene for T0.
**Models:** make in Blender (free) or use CC0/CC-BY packs (verify each licence), simplify, recolour to the palette, compress; record in `THIRD_PARTY.md`.
**In-app (T1):** slow gradient blobs (Basil/Mango at 6–10%) and a few faint floating vegetables at page edges; content always on opaque cards; off on forms, documents and admin.

## 9. Components
Every component: keyboard operable, visible focus, correct ARIA, light + dark, all states (default, hover, focus, active, disabled, loading, error), visual snapshots in tests. Built on Radix primitives via shadcn/ui, styled with the tokens.

### 9.1 Buttons
| Variant | Light | Dark | Use |
|---------|-------|------|-----|
| Primary | Basil 700, white text | Basil 400, near-black | One main action per view |
| Accent | Mango, Basil 900 text | same | Landing and "List food" |
| Secondary | White, Basil 700 border and text | Surface, Basil 400 border and text | Secondary |
| Ghost | Transparent, Basil 700 text | Page text | Tertiary |
| Danger | Chilli 600, white | Danger colour, near-black | Cancel/delete |
Heights 36 / 44 / 52 (44 minimum on touch); label 16/600; loading keeps width and sets busy state; a disabled button that blocks a task explains why nearby.

### 9.2 Form fields
Label above (never placeholder-only); helper text below; errors with icon and an alert role on submit; height 48, radius 12, border token, focus ring; native pickers for dates and times on mobile; password field with show/hide, strength hint and caps-lock hint; phone with +91 prefix and numeric keyboard; **photo uploader** with 1–4 slots, reorder, remove with confirmation, progress, "photo required" message; switches, checkboxes and radios with 44 px hit areas; the listing **consent** is a large labelled card whose sentence is generated from the chosen window ("Your number and pin will be visible to logged-in users until 9:30 pm").

### 9.3 Freshness chip, ring, risk
Chip: icon + text + tint ("Fresh", "Use soon", "Expiring", "Expired"). Ring: 40 px with the score in the centre; text alternative such as "Freshness 55 out of 100, consume soon". Waste-risk: three-step bar (Low · Medium · High) with labels.

### 9.4 Inventory card
Thumbnail (4:3, 72 px), name, quantity and storage icon, chip + ring, optional "Use This First" ribbon in the cursive accent, quick actions (Cook, Share, Done) in an overflow menu on mobile. Raw meat/fish/egg cards show **no Share action**. Swipe actions always have button equivalents.

### 9.5 Listing card
Cover photo (4:3) · title · kind tag (Event/Home/Swap) · veg/non-veg mark · "Feeds about N people" · distance (from the public pin) · countdown · verified badge if any · area label. The whole card is one link; badge and favourite stay separately focusable. Ending-soon text uses Chilli with words, never colour only.

### 9.6 Verified badge (signature component)
**Look:** a green **leaf-shaped seal with a white tick**: the leaf runs diagonally with a short stem at the lower-left; fill is a gradient from Basil 500 (top-left) to Basil 700 (bottom-right); outline Basil 800, about 1.2 px; tick stroke about 2.2 px with round ends. Deliberately **not** a round blue or grey tick. Tick-on-fill contrast ≥ 3.3:1. Sizes: 16 (inline), 20 (cards), 28 (headers). Dark mode: the outline switches to a light mint at about 70% so the edge shows on dark surfaces.
**Behaviour:** a focusable, tappable button with an accessible name; the tooltip opens on **hover (150 ms delay), keyboard focus and tap**; closes on blur, outside tap or Esc; never traps focus. Tooltip: dark Basil background, light text 14 px, max width 240, arrow, linked to the badge for screen readers.
| Kind | Tooltip title | Second line (all kinds) |
|------|---------------|-------------------------|
| NGO / organisation | Verified NGO | Documents reviewed by Khabar Chakra. |
| Caterer | Verified Caterer | same |
| Banquet hall | Verified Banquet Hall | same |
| Trusted authority | Verified Trusted Authority | same |
The Help Centre explains: verification means documents were reviewed; it is not a food-safety guarantee. The shine plays once and is removed under reduced motion. The badge is rendered only from the server-verified approved status.

### 9.7 Countdown
"Ends in 2 h 15 m" / "Ends in 12 min" / "Ending now"; localised units; absolute end time on hover or long-press; the full sentence is the accessible label; announcements only at 60, 15, 5 and 1 minutes; colour shifts normal → soon (≤ 60 min) → red (≤ 15 min), always with words.

### 9.8 Map and pins (West Bengal focus)
- Rounded map container with attribution always visible; marker clustering; kind-shaped pins (Event star-burst, Home house, Swap arrows, Organisation heart-leaf) with a countdown ring; selected pin opens a bottom sheet (mobile) or side panel (desktop).
- **Exact vs approximate:** approximate listings appear as a translucent circle of about 150 m, not a point.
- A **List view** toggle shows the same data so keyboard and screen-reader users never need the map.
- Default centre **Asansol**; outside West Bengal a friendly note ("We're focused on West Bengal for now"). Bengali place names when the language is Bengali and a name exists.
- "Open in Maps" button for directions (no routing service). Dark tiles from the provider's dark style or a tile-only filter fallback; markers keep contrast. Reduced motion: markers jump instead of flying.

### 9.9 FAQ accordion
Each question is a real button inside a heading, with expanded state and a linked panel; plus/minus icon; height animates 200 ms (instant when reduced); several items may stay open; search box, category chips and "Expand all / Collapse all" above; each item has a copyable deep link; content present in server-rendered HTML; the whole row is clickable with a visible focus ring; test marker `faq-trigger`.

### 9.10 Navigation
- **Mobile bottom bar** (64 px + safe area): Home · My Food · **＋ Add** (raised centre button, Mango) · Available · Profile. ＋ opens a sheet: Take a photo · Upload from gallery · Scan barcode · Type it in.
- **Desktop top bar:** logo, Available Food, My Food, Recipes, Waste Guide, Impact, Help; right side: language, theme, Reduce animations, notifications, profile menu.
- **Profile menu:** Profile, Settings, Security, Language, Help, Log out, plus **Admin** only for server-verified admins.
- First focusable element is a skip-to-content link.

### 9.11 Footer
Columns: Product · Help (FAQ, Help Centre, Contact) · Legal (Terms, Privacy, Food-safety disclaimer, Community guidelines) · language switcher. A cursive tagline. A "Technical support: Coming soon" line in the Help column. **Last line: "Made by The S-QUAD"**, where *The S-QUAD* links to the Team page. No personal phone or email. Light: Basil 800 band with white text and Mango tagline; dark: sunken surface with Mango tagline.

### 9.12 Other components
| Component | Key specs |
|-----------|-----------|
| Dialog / bottom sheet | 24 px radius, focus trap, Esc/swipe to close, focus returns, 50% dark backdrop |
| Toast | Top on desktop, above the bar on mobile; status role, alert role for errors |
| Tabs / segmented control | 44 px targets, arrow-key navigation |
| Filter chips | Toggle buttons; selected shows a check icon, not just colour |
| Skeletons | Match final layout; shimmer 1.4 s (static when reduced) |
| Empty states | Mascot or scene, one sentence, one clear action |
| Stepper | Listing wizard Food → Photos → Place and time → Confirm; current step marked |
| Pickup code | Large digits (48 px), copy button, "Show this to the collector" |
| Admin table | Sticky header, 48 px rows, sortable, keyboard row actions |
| Charts | Patterns, labels, table alternative, draw-in animation |
| Avatars | Photo or initials on brand colours (contrast checked) |

## 10. Page Patterns
**Landing (Phase 1):** 1 hero (display headline with cursive accent, sub-headline, two buttons *Start free* (accent) and *See food near me* (secondary), live background, mascot) · 2 the loop (Scan → Track → Rescue → Recycle with a scroll-linked cycle line) · 3 events ("Weddings end. The food doesn't have to go to waste." — pre-announce → surplus → pickup code) · 4 how sharing works (window slider visual, who sees what) · 5 verified partners (only real approved ones; hidden until some exist) · 6 waste guide and recipes teasers · 7 impact counters (real numbers only; before launch "We're just getting started") · 8 install as app · 9 FAQ preview (five questions) · 10 final call-to-action and footer.
**App shell:** header or bottom bar, content with max width, optional right panel on desktop; light background tier; consistent toast position.
**Key screens:** Add food (full-screen camera, 72 px capture button, retake / use photo, graceful denied-permission card) · Confirm (photo on top, per-field confidence "Looks right / Please check / Couldn't read", low-confidence fields first, Save needs them viewed) · My Food (Use This First shelf, filters) · Available Food (desktop split, mobile List/Map toggle, default *Ending soonest*) · Listing detail (carousel, countdown, "Show contact" with explanation that it is logged and limited, safety tips, Report/Block) · Create listing (4 steps, sticky progress, window slider, live consent sentence) · Pickup (donor sees code, recipient enters it, cheering mascot) · Dashboard · Help / FAQ / Contact · **Team page** (name, college, story, four member cards with name, title, bio — plain text names, no photos or contact details unless supplied later) · Organisation application (stepper with per-kind document list and upload status) · **Admin** (calm and dense, no animation or mascot: queue, case view with document viewer and "mark reviewed", checklist, decision form with reason, claim indicator, approvals, audit timeline).

## 11. Accessibility (design level)
WCAG 2.1 AA minimum; body text far above AA · body ≥ 16 px; touch targets ≥ 44 px with ≥ 8 px gaps · focus ring 3 px, 2 px offset, dark Basil on light and Mango on dark, on every interactive element · never colour alone (status, veg/non-veg shapes, chart patterns) · every image has alt or empty alt; 3D canvas and floating art hidden from assistive tech · visible labels, programmatic errors, logical order · language attribute per page · works at 320 px and 200% zoom · camera and map have keyboard/non-visual alternatives · nothing flashes more than 3 times a second; all motion can be reduced.

## 12. Internationalisation
Design for +40% text length (no fixed-width buttons) · per-language fonts as in §4, accent font per language, no uppercase for Bengali/Devanagari · all three launch languages are left-to-right, but use logical spacing so right-to-left could follow · ₹ with Indian digit grouping, DD/MM/YYYY, 12-hour time · single "full name" field; address as free text + map pin · no text baked into images · language switcher names each language in its own script: English · বাংলা · हिन्दी.

## 13. Charts
Recharts; rounded bars, 3 px lines, direct value labels; palette order per §3.7 with patterns; colour-blind safe; draw-in ≤ 900 ms once (skipped when reduced); caption, units and a "View as table" alternative; one-line plain insight on dashboard cards ("You rescued 3.5 kg this month — about 9 meals"); an "ⓘ How is this calculated?" popover with the formula; CO₂e shows "approximately" and its source once chosen.

## 14. Assets
Favicon (icon + 32 px + 180 px touch icon) · PWA icons 192, 512, maskable 512 · social image 1200×630 · illustrations optimised SVG ≤ 30 KB · raster in modern formats with responsive sizes, hero fallback ≤ 150 KB · 3D per §8 · fonts self-hosted subsets · avoid animation libraries beyond the CSS/Framer Motion stack · names in kebab-case (empty-inventory, food-tomato).

## 15. Implementation Notes (for developers and AI agents)
Build the design tokens first (colour, type, spacing, radius, motion, z-index) as a single stylesheet; no hex codes in components. Shared components: VerifiedBadge (by kind), FreshnessChip, Countdown, ListingCard, FaqAccordion, LiveBackground (chooses the tier), Mascot (by state). Theme: class-based with a no-flash script. Motion: one shared hook returns none / reduced / full from the OS setting, the in-app toggle and the FPS watchdog; components never read the media query themselves. A contrast script asserts every pair in both themes. Storybook is optional.

## 16. Design Quality Checklist (per screen)
- [ ] Semantic tokens only; works in light and dark.
- [ ] Contrast script green; focus visible; targets ≥ 44 px.
- [ ] Status never by colour alone; veg/non-veg differ by shape.
- [ ] Cursive accent used at most once or twice, never for functional text.
- [ ] Fits +40% text and 200% zoom.
- [ ] Motion has a reduced version; background is decorative and tiered.
- [ ] Copy follows the voice rules; no safety guarantees.
- [ ] Privacy: contacts and locations shown only where rules allow; consent sentence accurate.
- [ ] No fake numbers or partners.
- [ ] Performance budgets respected.

## 17. Open Design Items
| ID | Item | Needed by |
|----|------|-----------|
| DS-1 | Trace logo to SVG without the Hindi line; dark lockup | Phase 1 |
| DS-2 | Create or choose 3D food models and the illustration set; record licences | Phase 1 |
| DS-3 | Mascot name and expressions (check meanings in Bengali and Hindi) | Phase 1 |
| DS-4 | Confirm the official veg/non-veg/egg mark specification | Phase 2 |
| DS-5 | Pick the free map-tile provider and a dark style | Phase 4 |
| DS-6 | Decide on Storybook | Phase 1 |
| DS-7 | Team photos/links only if the team supplies them | Phase 1 |
| DS-8 | Native-reader review of Bengali/Hindi typography | Phase 6 |
| DS-9 | Compare Caveat with Dancing Script on the hero (optional) | Phase 1 |

---
*End of DESIGN SYSTEM v1.1.*