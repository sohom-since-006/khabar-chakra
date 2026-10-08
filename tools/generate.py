"""
Khabar Chakra — full icon & branding asset generator.
=====================================================

One master symbol (kc_symbol.py) -> every asset in the family.
Geometry is never re-drawn per size; every file is derived from the same
vector source, which is what guarantees consistency across the set.

Run:  python3 tools/generate.py
"""

import os
import re
import shutil
import sys

import cairosvg
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import kc_symbol as K          # noqa: E402
import kc_text as T            # noqa: E402

ICONS = os.path.join(ROOT, "public", "icons")
BRAND = os.path.join(ROOT, "public", "branding")
SOCIAL = os.path.join(ROOT, "public", "social")
PREV = os.path.join(ROOT, "preview")
for d in (ICONS, BRAND, SOCIAL, PREV):
    os.makedirs(d, exist_ok=True)

P = K.PALETTE
CREAM, INK = P["cream"], P["ink"]
TEAL, GREEN, GREEN_D, YELLOW = P["teal"], P["green"], P["green_deep"], P["yellow"]

written = []


# ---------------------------------------------------------------------------
def save_svg(path, svg):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(svg)
    written.append(os.path.relpath(path, ROOT))


def _viewbox(svg):
    m = re.search(r'viewBox="([\d.\s-]+)"', svg)
    x0, y0, w, h = (float(v) for v in m.group(1).split())
    return w, h


def png_from_svg(svg, path, size, bg=None, keep_alpha=None):
    """rasterise at `size` = target WIDTH; height follows the SVG's own
    aspect ratio (icons are square, social cards and logos are not)."""
    vw, vh = _viewbox(svg)
    width = int(round(size))
    height = int(round(size * vh / vw))
    kwargs = {"output_width": width, "output_height": height}
    if bg:
        kwargs["background_color"] = bg
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=path, **kwargs)
    if keep_alpha is not None and not keep_alpha:
        img = Image.open(path).convert("RGBA")
        flat = Image.new("RGBA", img.size, bg or CREAM)
        flat.alpha_composite(img)
        flat.convert("RGB").save(path)
    written.append(os.path.relpath(path, ROOT))


def icon(variant="full", theme="light", bg=None, pad=0.0, radius=0):
    return K.icon_svg(variant=variant, theme=theme, bg=bg, pad_ratio=pad,
                      radius=radius)


# ===========================================================================
# 1. ICONS
# ===========================================================================
def build_icons():
    # ---- master + PWA ----------------------------------------------------
    master = icon("full", "light", CREAM)
    save_svg(os.path.join(ICONS, "icon.svg"), master)
    png_from_svg(master, os.path.join(ICONS, "icon-1024.png"), 1024, CREAM)
    png_from_svg(master, os.path.join(ICONS, "icon-512.png"), 512, CREAM)
    png_from_svg(master, os.path.join(ICONS, "icon-192.png"), 192, CREAM)

    # ---- favicons (micro geometry — survives 16 px) ----------------------
    micro = icon("micro", "light", CREAM)
    save_svg(os.path.join(ICONS, "favicon.svg"), micro)
    save_svg(os.path.join(ICONS, "icon-micro.svg"), micro)
    png_from_svg(micro, os.path.join(ICONS, "favicon-32.png"), 32, CREAM)
    png_from_svg(micro, os.path.join(ICONS, "favicon-48.png"), 48, CREAM)
    # 16 px gets an even bolder variant so it survives a browser tab
    tiny = icon("tiny", "light", CREAM)
    save_svg(os.path.join(ICONS, "favicon-16.svg"), tiny)
    png_from_svg(tiny, os.path.join(ICONS, "favicon-16.png"), 16, CREAM)
    ico_path = os.path.join(ICONS, "favicon.ico")
    imgs = [Image.open(os.path.join(ICONS, f"favicon-{px}.png")).convert("RGBA")
            for px in (48, 32, 16)]
    imgs[0].save(ico_path, format="ICO", sizes=[(48, 48), (32, 32), (16, 16)])
    written.append(os.path.relpath(ico_path, ROOT))

    # ---- maskable (Android / PWA adaptive) -------------------------------
    mask_bg = icon("full", "light", CREAM, pad=0.0)
    mask_fg = K.icon_svg(variant="full", theme="light", bg=None, pad_ratio=0.0)
    # foreground SVG = symbol only, scaled into the 66 % safe zone
    fg_core = K.symbol(variant="full", theme="light", scale=0.66)
    fg_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" '
              f'viewBox="0 0 1024 1024"><title>Khabar Chakra adaptive foreground'
              f'</title><g transform="translate(512,512) scale(0.66) '
              f'translate(-512,-512)">{K.symbol(variant="full", theme="light")}</g></svg>')
    bg_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" '
              f'viewBox="0 0 1024 1024"><title>Khabar Chakra adaptive background'
              f'</title><rect width="1024" height="1024" fill="{CREAM}"/>'
              f'<circle cx="512" cy="512" r="470" fill="{P["cream_deep"]}" '
              f'opacity="0.55"/></svg>')
    save_svg(os.path.join(ICONS, "icon-foreground.svg"), fg_svg)
    save_svg(os.path.join(ICONS, "icon-background.svg"), bg_svg)
    png_from_svg(fg_svg, os.path.join(ICONS, "icon-foreground-512.png"), 512, CREAM)
    png_from_svg(bg_svg, os.path.join(ICONS, "icon-background-512.png"), 512, CREAM)

    maskable = icon("full", "light", CREAM, pad=0.12)
    png_from_svg(maskable, os.path.join(ICONS, "icon-512-maskable.png"), 512, CREAM)
    png_from_svg(maskable, os.path.join(ICONS, "icon-192-maskable.png"), 192, CREAM)
    save_svg(os.path.join(ICONS, "icon-maskable.svg"), maskable)

    # ---- Apple -----------------------------------------------------------
    apple = icon("full", "light", CREAM, pad=0.07)
    png_from_svg(apple, os.path.join(ICONS, "apple-touch-icon.png"), 180, CREAM,
                 keep_alpha=False)
    png_from_svg(apple, os.path.join(ICONS, "apple-touch-icon-1024.png"), 1024,
                 CREAM, keep_alpha=False)

    # ---- monochrome (boldest geometry reads best in one flat colour) -----
    mono = icon("micro", "mono", None)
    save_svg(os.path.join(ICONS, "icon-monochrome.svg"), mono)
    png_from_svg(mono, os.path.join(ICONS, "icon-monochrome-512.png"), 512)
    mono_bowl = icon("micro", "mono", None)
    save_svg(os.path.join(ICONS, "icon-monochrome-micro.svg"), mono_bowl)

    # ---- dark / light backgrounds ----------------------------------------
    dark = icon("full", "dark", INK)
    save_svg(os.path.join(ICONS, "icon-dark.svg"), dark)
    png_from_svg(dark, os.path.join(ICONS, "icon-dark-512.png"), 512, INK)
    light = icon("full", "light", P["white"])
    save_svg(os.path.join(ICONS, "icon-light.svg"), light)
    png_from_svg(light, os.path.join(ICONS, "icon-light-512.png"), 512, P["white"])
    trans = icon("full", "light", None)
    save_svg(os.path.join(ICONS, "icon-transparent.svg"), trans)
    png_from_svg(trans, os.path.join(ICONS, "icon-transparent-512.png"), 512)

    # ---- notification (white, flat, no colour-dependent detail) ----------
    notif = K.icon_svg(variant="micro", theme="white", bg=None)
    save_svg(os.path.join(ICONS, "notification-icon.svg"), notif)
    png_from_svg(notif, os.path.join(ICONS, "notification-icon-256.png"), 256)

    # ---- theme-colour tiles (dark-theme mark on a brand-coloured plate) ---
    tile_teal = icon("full", "dark", P["teal_deep"])
    save_svg(os.path.join(ICONS, "icon-tile-teal.svg"), tile_teal)
    png_from_svg(tile_teal, os.path.join(ICONS, "icon-tile-teal-512.png"), 512,
                 P["teal_deep"])
    tile_white = icon("full", "light", P["white"])
    save_svg(os.path.join(ICONS, "icon-tile-white.svg"), tile_white)
    png_from_svg(tile_white, os.path.join(ICONS, "icon-tile-white-512.png"), 512,
                 P["white"])
    tile_green = icon("full", "dark", GREEN_D)
    save_svg(os.path.join(ICONS, "icon-tile-green.svg"), tile_green)
    png_from_svg(tile_green, os.path.join(ICONS, "icon-tile-green-512.png"), 512,
                 GREEN_D)


# ===========================================================================
# 2. LOGO LOCKUPS  (text converted to outlines — no font files needed)
# ===========================================================================
LAT = T.Shaper("latin", weight=800)
LAT6 = T.Shaper("latin", weight=600)
BEN = T.Shaper("bengali", weight=700)
DEV = T.Shaper("devanagari", weight=600)

TAGLINE = "Save  •  Share  •  Sustain"


def mark_block(size, x, y, theme="light"):
    s = size / 1024.0
    return (f'<g transform="translate({K._n(x)},{K._n(y)}) scale({K._n(s)})">'
            f'{K.symbol(variant="full", theme=theme)}</g>'), size


def horizontal_logo(theme="light", bg=None, transparent=False):
    """mark + wordmark side by side"""
    ink_col = {"light": TEAL, "dark": "#FFFFFF", "mono": "#000000"}[theme]
    sub_col = {"light": GREEN_D, "dark": P["green_light"], "mono": "#000000"}[theme]
    W, H = 1680, 520
    mark_s = 400
    mx, my = 40, (H - mark_s) / 2
    mark, _ = mark_block(mark_s, mx, my, theme)
    tx = mx + mark_s + 70

    ben_size, lat_size, tag_size = 132, 104, 50
    ben_w = BEN.text_width("খাবার চক্র", ben_size)
    lat_w = LAT.text_width("KHABAR CHAKRA", lat_size, tracking=0.06)
    tag_w = LAT6.text_width(TAGLINE, tag_size, tracking=0.05)
    block_w = max(ben_w, lat_w, tag_w)

    total_w = tx + block_w + 40
    # recentre using real text metrics
    shift = (W - total_w) / 2.0
    mx += shift
    tx += shift
    mark, _ = mark_block(mark_s, mx, my, theme)

    y_ben, y_lat, y_tag = 208, 322, 424
    parts = [
        mark,
        BEN.path_element("খাবার চক্র", ben_size, x=tx, y=y_ben, fill=ink_col),
        LAT.path_element("KHABAR CHAKRA", lat_size, x=tx, y=y_lat,
                         tracking=0.06, fill=ink_col),
        LAT6.path_element(TAGLINE, tag_size, x=tx, y=y_tag, tracking=0.05,
                          fill=sub_col),
    ]
    rect = "" if transparent else (
        f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else
        f'<rect width="{W}" height="{H}" fill="{CREAM}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}" role="img" aria-label="Khabar Chakra — '
            f'Save, Share, Sustain">{rect}{"".join(parts)}</svg>')


def stacked_logo(theme="light", bg=None, transparent=False):
    """mark above the full tri-script wordmark + tagline"""
    ink_col = {"light": TEAL, "dark": "#FFFFFF", "mono": "#000000"}[theme]
    sub_col = {"light": GREEN_D, "dark": P["green_light"], "mono": "#000000"}[theme]
    W, H = 1240, 1500
    mark_s = 560
    mark, _ = mark_block(mark_s, (W - mark_s) / 2, 40, theme)
    cx = W / 2.0
    parts = [
        mark,
        BEN.path_element("খাবার চক্র", 176, x=cx, y=930, fill=ink_col,
                         align="center"),
        LAT.path_element("KHABAR CHAKRA", 116, x=cx, y=1100, tracking=0.10,
                         fill=ink_col, align="center"),
        DEV.path_element("खाद्य चक्र", 104, x=cx, y=1240, fill=sub_col,
                         align="center"),
        LAT6.path_element(TAGLINE, 58, x=cx, y=1382, tracking=0.05,
                          fill=sub_col, align="center"),
    ]
    rect = "" if transparent else f'<rect width="{W}" height="{H}" fill="{bg or CREAM}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}" role="img" aria-label="Khabar Chakra brand '
            f'logo">{rect}{"".join(parts)}</svg>')


def wordmark_only(theme="light"):
    ink_col = {"light": TEAL, "dark": "#FFFFFF", "mono": "#000000"}[theme]
    sub_col = {"light": GREEN_D, "dark": P["green_light"], "mono": "#000000"}[theme]
    W, H = 1000, 420
    parts = [
        BEN.path_element("খাবার চক্র", 150, x=W / 2, y=170, fill=ink_col,
                         align="center"),
        LAT.path_element("KHABAR CHAKRA", 92, x=W / 2, y=300, tracking=0.10,
                         fill=ink_col, align="center"),
        LAT6.path_element(TAGLINE, 46, x=W / 2, y=390, tracking=0.05,
                          fill=sub_col, align="center"),
    ]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}" role="img" aria-label="Khabar Chakra">{"" .join(parts)}</svg>')


def splash_logo():
    """app-launch splash: mark + single-line wordmark, transparent"""
    W, H = 1200, 1200
    mark_s = 620
    parts = [
        mark_block(mark_s, (W - mark_s) / 2, 150)[0],
        LAT.path_element("KHABAR CHAKRA", 96, x=W / 2, y=960, tracking=0.12,
                         fill=TEAL, align="center"),
        BEN.path_element("খাবার চক্র", 84, x=W / 2, y=1070, fill=GREEN_D,
                         align="center"),
    ]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}" role="img" aria-label="Khabar Chakra splash">'
            f'{"".join(parts)}</svg>')


def web_manifest():
    """ready-to-ship PWA manifest"""
    import json
    manifest = {
        "name": "Khabar Chakra — Save • Share • Sustain",
        "short_name": "Khabar Chakra",
        "description": "Community food-lifecycle platform: track, cook, share "
                       "and donate surplus food.",
        "start_url": "/",
        "display": "standalone",
        "background_color": CREAM,
        "theme_color": TEAL,
        "icons": [
            {"src": "/icons/icon-192.png", "sizes": "192x192",
             "type": "image/png", "purpose": "any"},
            {"src": "/icons/icon-512.png", "sizes": "512x512",
             "type": "image/png", "purpose": "any"},
            {"src": "/icons/icon-192-maskable.png", "sizes": "192x192",
             "type": "image/png", "purpose": "maskable"},
            {"src": "/icons/icon-512-maskable.png", "sizes": "512x512",
             "type": "image/png", "purpose": "maskable"},
            {"src": "/icons/favicon.svg", "sizes": "any",
             "type": "image/svg+xml", "purpose": "any"},
            {"src": "/icons/icon-monochrome.svg", "sizes": "any",
             "type": "image/svg+xml", "purpose": "monochrome"},
        ],
    }
    path = os.path.join(ROOT, "public", "site.webmanifest")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    written.append(os.path.relpath(path, ROOT))


def build_branding():
    # horizontal
    save_svg(os.path.join(BRAND, "khabar-chakra-logo.svg"),
             horizontal_logo("light"))
    png_from_svg(horizontal_logo("light"), os.path.join(BRAND, "khabar-chakra-logo.png"),
                 1680, CREAM)
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-horizontal.svg"),
             horizontal_logo("light"))
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-horizontal-transparent.svg"),
             horizontal_logo("light", transparent=True))
    png_from_svg(horizontal_logo("light", transparent=True),
                 os.path.join(BRAND, "khabar-chakra-logo-horizontal-transparent.png"),
                 1680)

    # stacked (the full brand logo: all three scripts + tagline)
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-stacked.svg"),
             stacked_logo("light"))
    png_from_svg(stacked_logo("light"),
                 os.path.join(BRAND, "khabar-chakra-logo-stacked.png"), 1240, CREAM)

    # light / dark / mono
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-light.svg"),
             horizontal_logo("light"))
    png_from_svg(horizontal_logo("light"),
                 os.path.join(BRAND, "khabar-chakra-logo-light.png"), 1680, CREAM)
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-dark.svg"),
             horizontal_logo("dark", bg=INK))
    png_from_svg(horizontal_logo("dark", bg=INK),
                 os.path.join(BRAND, "khabar-chakra-logo-dark.png"), 1680, INK)
    save_svg(os.path.join(BRAND, "khabar-chakra-logo-monochrome.svg"),
             horizontal_logo("mono", transparent=True))
    png_from_svg(horizontal_logo("mono", transparent=True),
                 os.path.join(BRAND, "khabar-chakra-logo-monochrome.png"), 1680)

    # wordmark + splash
    save_svg(os.path.join(BRAND, "khabar-chakra-wordmark.svg"), wordmark_only("light"))
    png_from_svg(wordmark_only("light"),
                 os.path.join(BRAND, "khabar-chakra-wordmark.png"), 1000)
    save_svg(os.path.join(BRAND, "splash-logo.svg"), splash_logo())
    png_from_svg(splash_logo(), os.path.join(BRAND, "splash-logo.png"), 1200)

    # mark only, three themes
    save_svg(os.path.join(BRAND, "khabar-chakra-mark.svg"),
             K.icon_svg(variant="full", theme="light", bg=None))
    png_from_svg(K.icon_svg(variant="full", theme="light", bg=None),
                 os.path.join(BRAND, "khabar-chakra-mark.png"), 1024)
    save_svg(os.path.join(BRAND, "khabar-chakra-mark-monochrome.svg"),
             K.icon_svg(variant="micro", theme="mono", bg=None))


# ===========================================================================
# 3. SOCIAL
# ===========================================================================
def _fit(shaper, text, target_w, tracking=0.0, base=100.0, features=None):
    """font size that makes `text` exactly `target_w` wide"""
    w = shaper.text_width(text, base, tracking=tracking, features=features)
    return base * (target_w / w)


def og_image():
    """1200 x 630 social card — dark, lifecycle motif, tri-script brand"""
    W, H = 1200, 630
    mark_s = 330
    mx, my = 84, (H - mark_s) / 2 + 6
    tx = mx + mark_s + 74
    col_w = W - tx - 86          # width available for the text column

    lat_size = _fit(LAT, "KHABAR CHAKRA", col_w, tracking=0.10)
    ben_size = _fit(BEN, "খাবার চক্র", col_w * 0.62)
    tag_size = _fit(LAT6, TAGLINE, col_w * 0.80, tracking=0.06)

    parts = [
        f'<rect width="{W}" height="{H}" fill="{INK}"/>',
        # lifecycle arcs echoed faintly in the background, kept clear of the type
        f'<circle cx="1150" cy="150" r="230" fill="none" stroke="{P["teal_bright"]}" '
        f'stroke-width="30" opacity="0.10"/>',
        f'<circle cx="1180" cy="590" r="180" fill="none" stroke="{GREEN}" '
        f'stroke-width="30" opacity="0.10"/>',
        f'<circle cx="60" cy="640" r="150" fill="none" stroke="{GREEN}" '
        f'stroke-width="30" opacity="0.08"/>',
        mark_block(mark_s, mx, my, "dark")[0],
        LAT.path_element("KHABAR CHAKRA", lat_size, x=tx, y=252, tracking=0.10,
                         fill="#FFFFFF"),
        BEN.path_element("খাবার চক্র", ben_size, x=tx, y=344, fill=P["green_light"]),
        f'<rect x="{tx}" y="{378}" width="{col_w * 0.34:.0f}" height="4" rx="2" '
        f'fill="{GREEN}" opacity="0.7"/>',
        LAT6.path_element(TAGLINE, tag_size, x=tx, y=448, tracking=0.06,
                          fill="#D7EBE4"),
        LAT6.path_element("Community food-lifecycle platform", 27, x=tx, y=500,
                          tracking=0.01, fill="#8FB8AE"),
    ]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
           f'viewBox="0 0 {W} {H}" role="img" aria-label="Khabar Chakra — '
           f'Save, Share, Sustain">{"".join(parts)}</svg>')
    save_svg(os.path.join(SOCIAL, "og-image.svg"), svg)
    png_from_svg(svg, os.path.join(SOCIAL, "og-image.png"), 1200, INK)
    png_from_svg(svg, os.path.join(SOCIAL, "twitter-card.png"), 1200, INK)
    return svg


# ===========================================================================
# 4. PREVIEW SHEETS  (for humans, not for shipping)
# ===========================================================================
def previews(og_svg):
    def render(svg, path, w, h, bg=None):
        if bg:
            cairosvg.svg2png(bytestring=svg.encode(), write_to=path,
                             output_width=w, output_height=h,
                             background_color=bg)
        else:
            cairosvg.svg2png(bytestring=svg.encode(), write_to=path,
                             output_width=w, output_height=h)

    # icon family sheet
    fam = [("icon-1024", icon("full", "light", CREAM)),
           ("icon-512", icon("full", "light", CREAM)),
           ("icon-192", icon("full", "light", CREAM)),
           ("maskable", icon("full", "light", CREAM, pad=0.12)),
           ("apple-touch", icon("full", "light", CREAM, pad=0.07)),
           ("favicon 48", icon("micro", "light", CREAM)),
           ("favicon 32", icon("micro", "light", CREAM)),
           ("favicon 16", icon("tiny", "light", CREAM)),
           ("dark", icon("full", "dark", INK)),
           ("light", icon("full", "light", P["white"])),
           ("monochrome", icon("micro", "mono", None)),
           ("notification", K.icon_svg(variant="micro", theme="white", bg=None))]
    tiles, pad, label_h = [], 24, 34
    cell = 300
    cols = 6
    rows = 2
    W = cols * (cell + pad) + pad
    Hh = rows * (cell + pad + label_h) + pad
    from PIL import ImageDraw, ImageFont
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
    except Exception:
        f = ImageFont.load_default()
    sheet = Image.new("RGB", (W, Hh), "#EFE9DC")
    dr = ImageDraw.Draw(sheet)
    for i, (name, svg) in enumerate(fam):
        col, row = i % cols, i // cols
        x = pad + col * (cell + pad)
        y = pad + row * (cell + pad + label_h)
        p = f"/tmp/_tile_{i}.png"
        bg = INK if name == "dark" else (None if name == "monochrome" else CREAM)
        if name == "notification":
            bg = "#20303a"
        if name == "monochrome":
            bg = "#EFE9DC"
        render(svg, p, cell, cell, bg)
        sheet.paste(Image.open(p).convert("RGB"), (x, y))
        dr.rectangle([x, y, x + cell, y + cell], outline="#D8D0BF", width=2)
        dr.text((x + 4, y + cell + 6), name, fill="#4A5B54", font=f)
    sheet.save(os.path.join(PREV, "icon-family.png"))
    written.append(os.path.relpath(os.path.join(PREV, "icon-family.png"), ROOT))

    # size test: 16 -> 256 at real pixel sizes, then zoomed with nearest neighbour
    sizes = [16, 24, 32, 48, 64, 96, 128, 256]
    strip = Image.new("RGB", (sum(sizes) + 16 * (len(sizes) + 1), 300), "#EFE9DC")
    x = 16
    for s in sizes:
        p = f"/tmp/_s_{s}.png"
        render(icon("micro" if s <= 48 else "full", "light", CREAM), p, s, s, CREAM)
        strip.paste(Image.open(p).convert("RGB"), (x, 16))
        dr2 = ImageDraw.Draw(strip)
        dr2.text((x, 20 + 260), str(s), fill="#4A5B54", font=f)
        x += s + 16
    strip.save(os.path.join(PREV, "size-test.png"))
    written.append(os.path.relpath(os.path.join(PREV, "size-test.png"), ROOT))

    # zoomed favicon check (real pixel sizes, nearest-neighbour magnified)
    from PIL import ImageDraw
    zooms = []
    for s_px in (16, 32, 48):
        p = f"/tmp/_z_{s_px}.png"
        render(icon("tiny" if s_px == 16 else "micro", "light", CREAM), p,
               s_px, s_px, CREAM)
        zooms.append((s_px, Image.open(p).convert("RGB").resize(
            (s_px * 8, s_px * 8), Image.NEAREST)))
    gap, top, bottom, side = 34, 46, 46, 40
    W = side * 2 + sum(z.size[0] for _, z in zooms) + gap * (len(zooms) - 1)
    Hh = top + max(z.size[1] for _, z in zooms) + bottom
    sheet = Image.new("RGB", (W, Hh), "#EFE9DC")
    dr = ImageDraw.Draw(sheet)
    dr.text((side, 16), "Favicon legibility — real pixels, magnified 8x (nearest "
                        "neighbour)", fill="#3C4A44", font=f)
    x = side
    for s_px, img in zooms:
        sheet.paste(img, (x, top))
        dr.text((x, top + img.size[1] + 10), f"{s_px}px", fill="#4A5B54", font=f)
        x += img.size[0] + gap
    sheet.save(os.path.join(PREV, "favicon-legibility.png"))
    written.append(os.path.relpath(os.path.join(PREV, "favicon-legibility.png"), ROOT))

    # maskable crop test — circle / squircle / rounded square, Android style
    mask_png = "/tmp/_maskable.png"
    render(icon("full", "light", CREAM, pad=0.12), mask_png, 432, 432, CREAM)
    base = Image.open(mask_png).convert("RGB")
    tests = []
    for label, mask in (("circle 66%", "circle"), ("squircle", "squircle"),
                        ("rounded sq.", "rounded")):
        m = Image.new("L", (432, 432), 0)
        d = ImageDraw.Draw(m)
        if mask == "circle":
            d.ellipse([432 * 0.17, 432 * 0.17, 432 * 0.83, 432 * 0.83], fill=255)
        elif mask == "squircle":
            d.ellipse([10, 10, 422, 422], fill=255)
            d.rectangle([60, 10, 372, 422], fill=255)
            d.rectangle([10, 60, 422, 372], fill=255)
        else:
            d.rounded_rectangle([6, 6, 426, 426], radius=96, fill=255)
        t = Image.new("RGB", (432, 432), "#EFE9DC")
        t.paste(base, (0, 0), m)
        tests.append((label, t))
    sheet = Image.new("RGB", (3 * 432 + 4 * 30, 432 + 90), "#EFE9DC")
    dr3 = ImageDraw.Draw(sheet)
    dr3.text((30, 16), "Maskable safe-zone test (Android adaptive masks)",
             fill="#3C4A44", font=f)
    x = 30
    for label, t in tests:
        sheet.paste(t, (x, 46))
        dr3.text((x, 46 + 432 + 8), label, fill="#4A5B54", font=f)
        x += 432 + 30
    sheet.save(os.path.join(PREV, "maskable-test.png"))
    written.append(os.path.relpath(os.path.join(PREV, "maskable-test.png"), ROOT))

    # logo family sheet
    logos = [("logo horizontal", horizontal_logo("light")),
             ("logo stacked", stacked_logo("light")),
             ("logo dark", horizontal_logo("dark", bg=INK)),
             ("logo monochrome", horizontal_logo("mono", transparent=True)),
             ("splash", splash_logo())]
    tiles = []
    for name, svg in logos:
        p = f"/tmp/_lg_{name.replace(' ', '_')}.png"
        bg = INK if "dark" in name else "#EFE9DC"
        render(svg, p, 1500, None if False else 900, bg)
        tiles.append((name, p))
    widths = [Image.open(p).size[0] for _, p in tiles]
    maxw = max(widths) + 60
    total_h = sum(Image.open(p).size[1] + 60 for _, p in tiles) + 30
    sheet = Image.new("RGB", (maxw, total_h), "#EFE9DC")
    y = 20
    for (name, p) in tiles:
        im = Image.open(p).convert("RGB")
        sheet.paste(im, (30, y))
        ImageDraw.Draw(sheet).text((30, y + im.size[1] + 8), name, fill="#4A5B54", font=f)
        y += im.size[1] + 60
    sheet.save(os.path.join(PREV, "logo-family.png"))
    written.append(os.path.relpath(os.path.join(PREV, "logo-family.png"), ROOT))

    # social preview copy
    render(og_svg, os.path.join(PREV, "og-image-preview.png"), 1200, 630, INK)
    written.append(os.path.relpath(os.path.join(PREV, "og-image-preview.png"), ROOT))


# ===========================================================================
def main():
    build_icons()
    build_branding()
    web_manifest()
    og_svg = og_image()
    previews(og_svg)
    print(f"{len(written)} files written")
    for w in sorted(written):
        print("  ", w)


if __name__ == "__main__":
    main()
