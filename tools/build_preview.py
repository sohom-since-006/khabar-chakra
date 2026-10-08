"""
Build a fully self-contained HTML sheet showing every Khabar Chakra icon.

Everything is inlined (SVGs as markup, no external files, no network) so the
page renders identically in a browser, in an offline sandbox, or in a preview
pane.  Also validates that each inlined SVG is well-formed XML.

Run:  python3 tools/build_preview.py
"""

import html as _html
import os
import sys
import xml.dom.minidom as md

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import kc_symbol as K          # noqa: E402
import kc_ui as U              # noqa: E402

P = K.PALETTE
PUB = os.path.join(ROOT, "public")
OUT = os.path.join(ROOT, "khabar-chakra", "icon-preview.html")


def svg_inline(path, cls="", max_w=None):
    """read an SVG file, validate it, return inline markup"""
    with open(path, encoding="utf-8") as fh:
        s = fh.read().strip()
    md.parseString(s)                       # raises if malformed
    s = s.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>", "")
    if cls:
        s = s.replace("<svg ", f'<svg class="{cls}" ', 1)
    if max_w:
        s = s.replace("<svg ", f'<svg style="max-width:{max_w}" ', 1)
    return s


def tile(label, markup, note="", cls="tile"):
    return (f'<figure class="{cls}"><div class="art">{markup}</div>'
            f'<figcaption><strong>{label}</strong>'
            f'{f"<span>{note}</span>" if note else ""}</figcaption></figure>')


def build():
    # ---------------------------------------------------------------- app icons
    app = [
        ("Master 1024", "icons/icon.svg", "light cream plate"),
        ("Dark", "icons/icon-dark.svg", "#072A26 plate"),
        ("Light", "icons/icon-light.svg", "white plate"),
        ("Transparent", "icons/icon-transparent.svg", "no background"),
        ("Maskable", "icons/icon-maskable.svg", "66% safe zone"),
        ("Monochrome", "icons/icon-monochrome.svg", "single colour"),
        ("Micro", "icons/icon-micro.svg", "24–48 px build"),
        ("Tiny / favicon", "icons/favicon-16.svg", "16 px build"),
        ("Notification", "icons/notification-icon.svg", "flat white"),
        ("Tile — teal", "icons/icon-tile-teal.svg", "#08453B"),
        ("Tile — white", "icons/icon-tile-white.svg", "#FFFFFF"),
        ("Tile — green", "icons/icon-tile-green.svg", "#2C7A3B"),
    ]
    app_tiles = "".join(
        tile(lbl, svg_inline(os.path.join(PUB, p), max_w="150px"), note)
        for lbl, p, note in app)

    fg = svg_inline(os.path.join(PUB, "icons/icon-foreground.svg"), max_w="130px")
    bg = svg_inline(os.path.join(PUB, "icons/icon-background.svg"), max_w="130px")
    adaptive = (tile("Adaptive — foreground", fg, "transparent symbol layer")
                + tile("Adaptive — background", bg, "colour layer"))

    # ------------------------------------------------------------------- logos
    logos = [
        ("Horizontal", "branding/khabar-chakra-logo.svg", "primary lockup", "520px"),
        ("Stacked", "branding/khabar-chakra-logo-stacked.svg",
         "all three scripts", "300px"),
        ("Monochrome", "branding/khabar-chakra-logo-monochrome.svg",
         "one colour", "520px"),
        ("Wordmark", "branding/khabar-chakra-wordmark.svg",
         "text only", "330px"),
        ("Splash", "branding/splash-logo.svg", "app launch", "300px"),
        ("Mark", "branding/khabar-chakra-mark.svg", "symbol only", "160px"),
    ]
    logo_tiles = "".join(
        tile(lbl, svg_inline(os.path.join(PUB, p), max_w=mw), note, "tile logo")
        for lbl, p, note, mw in logos)
    logo_dark = tile(
        "Horizontal — dark background",
        svg_inline(os.path.join(PUB, "branding/khabar-chakra-logo-dark.svg"),
                   max_w="520px"),
        "#072A26", "tile logo on-dark")
    og = tile("Social card 1200×630",
              svg_inline(os.path.join(PUB, "social/og-image.svg"), max_w="620px"),
              "Open Graph / Twitter", "tile logo wide")

    # --------------------------------------------------------------- UI icons
    groups = U.categories()
    sections = []
    for cat, names in groups.items():
        cells = []
        for n in names:
            cells.append(
                f'<div class="cell"><span class="ico">{U.icon_svg(n)}</span>'
                f'<code>{n}</code></div>')
        sections.append(
            f'<section class="grp"><h3>{_html.escape(U.CATEGORY_LABEL.get(cat, cat))}'
            f'<span class="n">{len(names)}</span></h3>'
            f'<div class="cells">{"".join(cells)}</div></section>')
    ui_sections = "".join(sections)

    swatches = "".join(
        f'<div class="sw"><span style="background:{P[k]}"></span>'
        f'<code>{P[k]}</code><em>{label}</em></div>'
        for k, label in (("teal", "primary"), ("green", "sustainability"),
                         ("red", "tomato"), ("orange", "carrot"),
                         ("yellow", "food mound"), ("cream", "light bg"),
                         ("ink", "dark bg")))

    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Khabar Chakra — icon pack</title>
<style>
  :root {{ --teal:#0B5B4E; --green:#3EA44C; --cream:#FBF7EF; --ink:#072A26;
           --bg:#F7F4EC; --card:#FFFFFF; --fg:#123B33; --muted:#5A6B64;
           --line:#E2DACB; --plate:#FBF7EF; }}
  body.dark {{ --bg:#072A26; --card:#0C352E; --fg:#E8F3EF; --muted:#93B5AC;
               --line:#17453C; --plate:#0C352E; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--fg);
    font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
  header {{ padding:34px 30px 20px; border-bottom:1px solid var(--line); }}
  h1 {{ margin:0 0 4px; font-size:23px; color:var(--teal); letter-spacing:-.01em; }}
  body.dark h1 {{ color:#5FD0B4; }}
  .tag {{ color:var(--muted); font-size:13.5px; }}
  .ctl {{ position:fixed; right:20px; bottom:20px; z-index:9; display:flex;
    gap:10px; align-items:center; background:var(--card);
    border:1px solid var(--line); border-radius:12px; padding:10px 14px;
    box-shadow:0 6px 24px rgba(0,0,0,.10); font-size:13px; color:var(--muted); }}
  .ctl input[type=range] {{ width:110px; accent-color:var(--green); }}
  .ctl button {{ border:1px solid var(--line); background:transparent;
    color:var(--fg); border-radius:8px; padding:6px 11px; cursor:pointer;
    font:inherit; font-size:12.5px; }}
  .ctl button:hover {{ border-color:var(--green); }}
  main {{ padding:8px 30px 130px; max-width:1240px; }}
  h2 {{ font-size:13px; letter-spacing:.09em; text-transform:uppercase;
    color:var(--green); margin:38px 0 6px; font-weight:700; }}
  h2 span {{ color:var(--muted); font-weight:400; letter-spacing:0;
    text-transform:none; font-size:12.5px; margin-left:8px; }}
  .grid {{ display:grid; gap:14px;
    grid-template-columns:repeat(auto-fill,minmax(178px,1fr)); }}
  .grid.logos {{ grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }}
  .tile {{ margin:0; background:var(--card); border:1px solid var(--line);
    border-radius:14px; overflow:hidden; }}
  .tile .art {{ background:var(--plate); display:flex; align-items:center;
    justify-content:center; padding:20px; min-height:158px; }}
  .tile .art svg {{ width:100%; height:auto; max-height:180px; }}
  .tile.logo .art {{ min-height:120px; padding:24px 18px; }}
  .tile.wide {{ grid-column:1 / -1; }}
  .tile.on-dark .art {{ background:#072A26; }}
  figcaption {{ padding:12px 15px 14px; font-size:12.5px;
    border-top:1px solid var(--line); }}
  figcaption strong {{ display:block; font-size:13px; }}
  figcaption span {{ color:var(--muted); font-size:11.5px; }}
  .grp {{ margin-top:26px; }}
  .grp h3 {{ font-size:12.5px; margin:0 0 12px; color:var(--muted);
    font-weight:600; letter-spacing:.02em; }}
  .grp h3 .n {{ color:var(--green); margin-left:8px; font-weight:700; }}
  .cells {{ display:grid; gap:10px;
    grid-template-columns:repeat(auto-fill,minmax(104px,1fr)); }}
  .cell {{ background:var(--card); border:1px solid var(--line);
    border-radius:12px; padding:14px 6px 10px; text-align:center;
    color:var(--teal); display:flex; flex-direction:column;
    align-items:center; gap:9px; }}
  body.dark .cell {{ color:#5FD0B4; }}
  .ico {{ line-height:0; }}
  .ico svg {{ width:26px; height:26px; }}
  .cell code {{ font-size:10px; color:var(--muted); word-break:break-word;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }}
  .sws {{ display:grid; gap:10px; margin-top:14px;
    grid-template-columns:repeat(auto-fill,minmax(152px,1fr)); }}
  .sw {{ background:var(--card); border:1px solid var(--line); border-radius:11px;
    padding:10px 12px; display:flex; align-items:center; gap:10px; }}
  .sw span {{ width:26px; height:26px; border-radius:7px; flex:none;
    border:1px solid rgba(0,0,0,.16); }}
  .sw code {{ font-size:11px; }}
  .sw em {{ font-size:11px; color:var(--muted); font-style:normal; margin-left:auto; }}
  footer {{ color:var(--muted); font-size:12.5px; padding:30px 0 0;
    border-top:1px solid var(--line); margin-top:44px; }}
</style></head><body>
<header>
  <h1>Khabar Chakra — icon pack</h1>
  <div class="tag">খাবার চক্র / खाद्य चक्र · Save • Share • Sustain ·
    78 UI icons · {len(app) + len(logos) + 3} brand assets ·
    24 px grid · 2 px stroke</div>
</header>
<main>
  <h2>App icon<span>every platform variant, one master symbol</span></h2>
  <div class="grid">{app_tiles}{adaptive}</div>

  <h2>Logo lockups<span>text converted to vector outlines — no font required</span></h2>
  <div class="grid logos">{logo_tiles}{logo_dark}{og}</div>

  <h2>Colour — “Market Fresh”<span>teal + green dominate, food colours are accents</span></h2>
  <div class="sws">{swatches}</div>

  <h2>In-app UI icons<span>{len(U.ICONS)} icons, grouped by category</span></h2>
  {ui_sections}

  <footer>
    Every asset on this page is inlined — no external files, no network needed.
    Files live in <code>public/</code>. Edit the master geometry in
    <code>tools/kc_symbol.py</code> (brand mark) or <code>tools/kc_ui.py</code>
    (UI icons) and re-run the generators.
  </footer>
</main>
<div class="ctl">
  <label for="sz">Size</label>
  <input type="range" id="sz" min="16" max="56" step="2" value="26">
  <span id="szv">26 px</span>
  <button id="th">Dark</button>
</div>
<script>
  var sz = document.getElementById('sz');
  function apply(px) {{
    document.querySelectorAll('.ico svg').forEach(function (s) {{
      s.setAttribute('width', px); s.setAttribute('height', px);
    }});
    document.getElementById('szv').textContent = px + ' px';
  }}
  sz.addEventListener('input', function (e) {{ apply(e.target.value); }});
  document.getElementById('th').addEventListener('click', function (e) {{
    document.body.classList.toggle('dark');
    e.target.textContent = document.body.classList.contains('dark')
      ? 'Light' : 'Dark';
  }});
</script>
</body></html>"""

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"wrote {os.path.relpath(OUT, ROOT)}  ({len(html)/1024:.0f} KB)")
    print(f"  {len(app) + 2} app-icon tiles · {len(logos) + 2} logo tiles · "
          f"{len(U.ICONS)} UI icons · all SVGs validated")


if __name__ == "__main__":
    build()
