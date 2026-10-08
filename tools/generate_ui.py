"""
Khabar Chakra — UI icon set generator.
=====================================

Builds every deliverable for the in-app icon family from tools/kc_ui.py:
individual SVGs, a usage sprite, a JSON catalogue, a React component, PNG
raster sets, a contact sheet, and an interactive HTML gallery.

Run:  python3 tools/generate_ui.py
"""

import html
import json
import os
import sys

import cairosvg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import kc_symbol as K          # noqa: E402
import kc_ui as U              # noqa: E402

OUT = os.path.join(ROOT, "public", "icons", "ui")
PNG = os.path.join(OUT, "png")
DEV = os.path.join(OUT, "dev")
PREV = os.path.join(ROOT, "preview")
for d in (OUT, PNG, DEV, PREV):
    os.makedirs(d, exist_ok=True)

TEAL = K.PALETTE["teal"]
GREEN = K.PALETTE["green"]
CREAM = K.PALETTE["cream"]
INK = K.PALETTE["ink"]

written = []


def note(path):
    written.append(os.path.relpath(path, ROOT))


# ---------------------------------------------------------------------------
def build_svgs():
    for name in U.ICONS:
        p = os.path.join(OUT, f"{name}.svg")
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(U.icon_svg(name))
        note(p)


def build_sprite():
    """one file, <symbol> per icon — best for web performance"""
    syms = []
    for name, ic in U.ICONS.items():
        syms.append(
            f'<symbol id="kc-{name}" viewBox="0 0 {U.GRID} {U.GRID}">'
            f'<title>{name.replace("-", " ")}</title>'
            f'{U.STROKE_OPEN.format(color="currentColor")}{ic["body"]}'
            f'{U.STROKE_CLOSE}</symbol>')
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" '
           'aria-hidden="true">'
           '<defs>' + "".join(syms) + '</defs></svg>')
    p = os.path.join(OUT, "khabar-chakra-icons.svg")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(svg)
    note(p)


def build_catalogue():
    cat = {
        "name": "Khabar Chakra UI icons",
        "version": "1.0",
        "grid": 24,
        "stroke": 2,
        "strokeLinecap": "round",
        "strokeLinejoin": "round",
        "liveArea": [3, 3, 21, 21],
        "palette": {"teal": TEAL, "green": GREEN},
        "icons": [
            {"name": n,
             "category": ic["category"],
             "tags": [t.strip() for t in ic["tags"].split(",")],
             "file": f"{n}.svg",
             "sprite": f"#kc-{n}"}
            for n, ic in U.ICONS.items()
        ],
    }
    p = os.path.join(OUT, "icons.json")
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(cat, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    note(p)

    # framework-agnostic JS module
    js = ["/* Khabar Chakra UI icons — generated, do not edit by hand.",
          "   Usage:  kcIcon('cook', 24, 'currentColor')  →  SVG string",
          "   Or use the sprite:  <svg><use href=\"khabar-chakra-icons.svg#kc-cook\"/></svg> */",
          "export const KC_ICONS = {"]
    for name in U.ICONS:
        js.append(f"  {json.dumps(name)}: {json.dumps(U.body(name))},")
    js.append("};")
    js.append("""export const KC_META = {
  grid: 24, stroke: 2, strokeLinecap: "round", strokeLinejoin: "round",
};

export function kcIcon(name, size = 24, color = "currentColor", title) {
  const body = KC_ICONS[name];
  if (!body) throw new Error(`Unknown Khabar icon: ${name}`);
  const label = title || name.replace(/-/g, " ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" aria-label="${label}"><title>${label}</title><g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

export const kcIconNames = Object.keys(KC_ICONS);
export default kcIcon;
""")
    p = os.path.join(DEV, "khabar-chakra-icons.js")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write("\n".join(js))
    note(p)

    # React wrapper
    jsx = '''/**
 * KhabarIcon — React component for the Khabar Chakra UI icon set.
 * Generated. Do not edit by hand; edit tools/kc_ui.py and regenerate.
 *
 *   <KhabarIcon name="cook" size={24} />
 *   <KhabarIcon name="verified" size={20} color="#0B5B4E" />
 *
 * Needs khabar-chakra-icons.js alongside it.
 */
import React from "react";
import { KC_ICONS } from "./khabar-chakra-icons";

export default function KhabarIcon({
  name, size = 24, color = "currentColor", title, className, style, ...rest
}) {
  const body = KC_ICONS[name];
  if (!body) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[KhabarIcon] unknown icon "${name}"`);
    }
    return null;
  }
  const label = title || name.replace(/-/g, " ");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={className}
      style={style}
      {...rest}
    >
      <title>{label}</title>
      <g
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </svg>
  );
}

export const KhabarIconNames = Object.keys(KC_ICONS);
'''
    p = os.path.join(DEV, "KhabarIcon.jsx")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(jsx)
    note(p)


def build_pngs(sizes=(24, 48)):
    for name in U.ICONS:
        for s in sizes:
            svg = U.icon_svg(name, size=s, color=TEAL)
            p = os.path.join(PNG, f"{name}-{s}.png")
            cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=p,
                             output_width=s, output_height=s)
            note(p)


# ---------------------------------------------------------------------------
def build_contact_sheet():
    """48 px grid + a magnified legibility strip, for review"""
    try:
        f = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
        f_sm = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    except Exception:
        f = f_sm = ImageFont.load_default()

    groups = list(U.categories().items())
    cols = 8
    cell, pad, lab = 76, 12, 30
    W = pad + cols * (cell + pad)
    row_h = cell + lab + 14
    rows_total = sum((len(names) + cols - 1) // cols for _, names in groups)
    head = 58 + len(groups) * 34
    H = head + rows_total * row_h + pad

    sheet = Image.new("RGB", (W, H), "#F7F4EC")
    dr = ImageDraw.Draw(sheet)
    dr.text((pad, 18), "Khabar Chakra — in-app UI icon set", fill="#123B33", font=f)
    dr.text((pad, 38), f"{len(U.ICONS)} icons · 24 px grid · 2 px stroke · round caps",
            fill="#5A6B64", font=f_sm)

    y = 62
    for cat, names in groups:
        dr.text((pad, y + 8), U.CATEGORY_LABEL.get(cat, cat).upper(),
                fill=GREEN, font=f)
        y += 34
        x = pad
        for i, name in enumerate(names):
            if i and i % cols == 0:
                x = pad
                y += row_h
            svg = U.icon_svg(name, size=96, color=TEAL)
            tmp = "/tmp/_ui_tile.png"
            cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=tmp,
                             output_width=cell, output_height=cell,
                             background_color="#FFFFFF")
            sheet.paste(Image.open(tmp).convert("RGB"), (x, y))
            dr.rectangle([x, y, x + cell, y + cell], outline="#E2DACB", width=1)
            tw = dr.textlength(name, font=f_sm)
            dr.text((x + (cell - tw) / 2, y + cell + 5), name, fill="#44554E",
                    font=f_sm)
            x += cell + pad
        y += row_h
    p = os.path.join(PREV, "ui-icons-sheet.png")
    sheet.save(p)
    note(p)

    # size strip: one representative icon per category at 16/24/32/48 px
    reps = ["buy", "cook", "leftover", "verified", "meals-saved", "search",
            "success", "loading"]
    sizes = [16, 20, 24, 32, 48]
    cw, ch = 96, 96
    W2 = 40 + len(sizes) * cw
    H2 = 70 + len(reps) * (ch + 22)
    strip = Image.new("RGB", (W2, H2), "#F7F4EC")
    d2 = ImageDraw.Draw(strip)
    d2.text((20, 18), "Size test — real pixel sizes, magnified x4", fill="#123B33",
            font=f)
    x = 40
    for s in sizes:
        d2.text((x, 46), f"{s}px", fill="#5A6B64", font=f_sm)
        x += cw
    y = 70
    for name in reps:
        d2.text((20, y + 38), name, fill="#44554E", font=f_sm)
        x = 40
        for s in sizes:
            svg = U.icon_svg(name, size=s, color=TEAL)
            tmp = f"/tmp/_ui_{name}_{s}.png"
            cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=tmp,
                             output_width=s, output_height=s)
            im = Image.open(tmp).convert("RGB").resize((ch, ch), Image.NEAREST)
            strip.paste(im, (x, y))
            x += cw
        y += ch + 22
    p = os.path.join(PREV, "ui-icons-sizes.png")
    strip.save(p)
    note(p)


def build_gallery():
    """interactive single-file gallery (no external resources)"""
    groups = U.categories()
    cards = []
    for cat, names in groups.items():
        cells = []
        for name in names:
            svg = U.icon_svg(name, size=24, color="currentColor")
            cells.append(
                f'<button class="card" data-name="{name}" '
                f'data-tags="{html.escape(U.ICONS[name]["tags"])}" '
                f'title="{name} — {html.escape(U.ICONS[name]["tags"])}">'
                f'<span class="ico" data-icon="{name}">{svg}</span>'
                f'<code>{name}</code></button>')
        cards.append(
            f'<section class="group" data-cat="{cat}">'
            f'<h2>{U.CATEGORY_LABEL.get(cat, cat)} '
            f'<span class="count">({len(names)})</span></h2>'
            f'<div class="grid">{"".join(cells)}</div></section>')

    page = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Khabar Chakra — UI icon set</title>
<style>
  :root {{
    --ink:#072A26; --teal:#0B5B4E; --green:#3EA44C; --cream:#FBF7EF;
    --line:#E2DACB; --muted:#5A6B64; --bg:#F7F4EC; --card:#FFFFFF; --fg:#123B33;
  }}
  body.dark {{
    --bg:#072A26; --card:#0C352E; --fg:#E8F3EF; --muted:#93B5AC;
    --line:#17453C; --teal:#5FD0B4; --green:#62C86D;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--fg);
    font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
  header {{ position:sticky; top:0; z-index:5; background:var(--bg);
    border-bottom:1px solid var(--line); padding:20px 26px 16px; }}
  h1 {{ margin:0 0 2px; font-size:19px; color:var(--teal); letter-spacing:-.01em; }}
  .sub {{ color:var(--muted); font-size:13px; }}
  .controls {{ display:flex; flex-wrap:wrap; gap:12px; align-items:center;
    margin-top:14px; }}
  input[type=search] {{ flex:1 1 240px; max-width:340px; padding:9px 13px;
    border:1px solid var(--line); border-radius:9px; background:var(--card);
    color:var(--fg); font-size:14px; }}
  .ctl {{ display:flex; align-items:center; gap:7px; font-size:13px; color:var(--muted); }}
  input[type=range] {{ width:120px; accent-color:var(--green); }}
  button.tgl {{ padding:8px 14px; border:1px solid var(--line); border-radius:9px;
    background:var(--card); color:var(--fg); cursor:pointer; font-size:13px; }}
  button.tgl:hover {{ border-color:var(--green); }}
  main {{ padding:22px 26px 90px; max-width:1180px; }}
  h2 {{ font-size:12px; letter-spacing:.10em; text-transform:uppercase;
    color:var(--green); margin:30px 0 12px; font-weight:700; }}
  h2:first-child {{ margin-top:6px; }}
  .count {{ color:var(--muted); font-weight:400; letter-spacing:0; }}
  .grid {{ display:grid; gap:10px;
    grid-template-columns:repeat(auto-fill,minmax(122px,1fr)); }}
  .card {{ display:flex; flex-direction:column; align-items:center; gap:9px;
    padding:16px 8px 12px; background:var(--card); border:1px solid var(--line);
    border-radius:13px; cursor:pointer; color:var(--teal); font:inherit;
    transition:transform .12s, border-color .12s; }}
  .card:hover {{ transform:translateY(-2px); border-color:var(--green); }}
  .card.off {{ display:none; }}
  .ico {{ display:block; line-height:0; }}
  .ico svg {{ display:block; }}
  code {{ font-size:10.5px; color:var(--muted); word-break:break-word;
    text-align:center; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }}
  .toast {{ position:fixed; left:50%; bottom:26px; transform:translateX(-50%);
    background:var(--teal); color:#fff; padding:10px 18px; border-radius:10px;
    font-size:13px; opacity:0; transition:opacity .2s; pointer-events:none; }}
  .toast.on {{ opacity:1; }}
</style></head><body>
<header>
  <h1>Khabar Chakra — in-app UI icon set</h1>
  <div class="sub">{len(U.ICONS)} icons · 24 px grid · 2 px stroke · round caps &amp;
    joins · colour inherits from <code>currentColor</code></div>
  <div class="controls">
    <input type="search" id="q" placeholder="Search name or tag (e.g. donate, expiry, ngo)">
    <label class="ctl">Size <input type="range" id="size" min="16" max="64"
      step="4" value="32"><span id="sizeVal">32 px</span></label>
    <button class="tgl" id="theme">Dark background</button>
  </div>
</header>
<main id="main">{"".join(cards)}</main>
<div class="toast" id="toast">Copied</div>
<script>
  var main = document.getElementById('main');
  var icons = [].slice.call(document.querySelectorAll('.card .ico'));
  function setSize(px) {{
    icons.forEach(function (el) {{
      var svg = el.querySelector('svg');
      svg.setAttribute('width', px); svg.setAttribute('height', px);
    }});
  }}
  document.getElementById('size').addEventListener('input', function (e) {{
    setSize(e.target.value);
    document.getElementById('sizeVal').textContent = e.target.value + ' px';
  }});
  document.getElementById('q').addEventListener('input', function (e) {{
    var q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.card').forEach(function (c) {{
      var hit = !q || c.dataset.name.indexOf(q) > -1 ||
                c.dataset.tags.toLowerCase().indexOf(q) > -1;
      c.classList.toggle('off', !hit);
    }});
    document.querySelectorAll('.group').forEach(function (g) {{
      var any = g.querySelectorAll('.card:not(.off)').length > 0;
      g.style.display = any ? '' : 'none';
    }});
  }});
  document.getElementById('theme').addEventListener('click', function (e) {{
    document.body.classList.toggle('dark');
    e.target.textContent = document.body.classList.contains('dark')
      ? 'Light background' : 'Dark background';
  }});
  function toast(msg) {{
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('on');
    setTimeout(function () {{ t.classList.remove('on'); }}, 1400);
  }}
  document.querySelectorAll('.card').forEach(function (c) {{
    c.addEventListener('click', function () {{
      var s = '<KhabarIcon name="' + c.dataset.name + '" size={{24}} />';
      navigator.clipboard && navigator.clipboard.writeText(s);
      toast('Copied: ' + s);
    }});
  }});
  setSize(32);
</script></body></html>"""
    p = os.path.join(PREV, "ui-icons.html")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(page)
    note(p)


# ---------------------------------------------------------------------------
def main():
    build_svgs()
    build_sprite()
    build_catalogue()
    build_pngs()
    build_contact_sheet()
    build_gallery()
    print(f"{len(written)} files written · {len(U.ICONS)} icons")
    print("categories:")
    for cat, names in U.categories().items():
        print(f"  {cat:10s} {len(names):2d}  {', '.join(names[:6])}"
              + (" …" if len(names) > 6 else ""))


if __name__ == "__main__":
    main()
