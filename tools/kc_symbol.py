"""
Khabar Chakra — master symbol geometry engine.
==============================================

Single source of truth for the brand mark.  Every icon in the family
(app icon, maskable, favicon, monochrome, notification, dark/light, logo)
is generated from the shapes defined here, so geometry can never drift
between versions (see "Consistency" rule).

Canvas: 1024 x 1024 (all coordinates below are in that space).
Mark:   food bowl  +  circular lifecycle arrow  +  leaves  +  food accents.

Everything is pure vector / flat: no gradients, no shadows, no text.
"""

import math

# --------------------------------------------------------------------------
# Canvas + geometry constants
# --------------------------------------------------------------------------
CANVAS = 1024
C = CANVAS / 2.0            # 512 — optical centre

# --- circular lifecycle ring -------------------------------------------------
RING_R = 316.0              # centre-line radius
RING_SW = 84.0              # stroke width
HEAD_LEN = 112.0            # arrowhead length (along the arc)
HEAD_HW = 62.0              # arrowhead half width
# arc A (teal): 196° -> 330°   |   arc B (green): 16° -> 150°   (degrees, y-down)
ARCS = ((196.0, 330.0), (16.0, 150.0))

# --- bowl --------------------------------------------------------------------
RIM_Y = 470.0
RIM_RX = 208.0
RIM_RY = 44.0
BOWL_BOTTOM = 730.0
FOOT = (424.0, 714.0, 176.0, 36.0, 18.0)     # x, y, w, h, rx
LIP_SW = 12.0                                 # lighter "far rim" highlight

# --- food mound (khichuri / rice) -------------------------------------------
MOUND = (512.0, 450.0, 180.0, 70.0)           # cx, cy, rx, ry
TOMATO = (620.0, 392.0, 55.0)                 # cx, cy, r
CARROT = ((428.0, 364.0), (540.0, 386.0), (476.0, 456.0))   # reserved for full logo

# --- leaves ------------------------------------------------------------------
LEAF_BIG  = (452.0, 470.0, -112.0, 188.0, 92.0)    # x, y, angle, length, width
LEAF_SML  = (522.0, 482.0,  -78.0, 140.0, 68.0)
LEAF_MICRO = (456.0, 456.0, -112.0, 152.0, 78.0)

# --- micro ring (favicon / 16-48 px) ----------------------------------------
M_RING_R = 300.0
M_RING_SW = 116.0
M_ARCS = ((198.0, 332.0), (14.0, 148.0))
M_RIM_Y, M_RIM_RX, M_RIM_RY, M_BOTTOM = 452.0, 176.0, 38.0, 690.0
M_FOOT = (426.0, 672.0, 172.0, 34.0, 17.0)
M_HEAD_LEN, M_HEAD_HW = 92.0, 78.0

# --- tiny ring (16 px favicon: boldest possible reading) --------------------
T_RING_R = 288.0
T_RING_SW = 132.0
T_ARCS = ((200.0, 336.0), (18.0, 152.0))
T_RIM_Y, T_RIM_RX, T_RIM_RY, T_BOTTOM = 448.0, 202.0, 46.0, 692.0
T_FOOT = (414.0, 674.0, 196.0, 42.0, 21.0)
T_HEAD_LEN, T_HEAD_HW = 104.0, 86.0
LEAF_TINY = (470.0, 452.0, -106.0, 168.0, 96.0)


# --------------------------------------------------------------------------
# Palette  ("Market Fresh")
# --------------------------------------------------------------------------
PALETTE = {
    "teal":        "#0B5B4E",   # deep teal — bowl, ring, primary
    "teal_deep":   "#08453B",   # bowl base / foot
    "teal_soft":   "#127A66",   # ring highlight on light bg
    "teal_bright": "#1B9C82",   # ring on dark backgrounds
    "green":       "#3EA44C",   # leaf green — sustainability
    "green_deep":  "#2C7A3B",   # second leaf / veins
    "green_light": "#62C86D",   # green on dark backgrounds
    "red":         "#E2543E",   # tomato
    "red_leaf":    "#3FA34D",
    "orange":      "#F08A24",   # carrot
    "yellow":      "#F5B921",   # food mound / golden accent
    "cream":       "#FBF7EF",   # light background (warm off-white)
    "cream_deep":  "#F2EBDD",   # subtle light background layer
    "ink":         "#072A26",   # dark background (near-black teal)
    "ink_soft":    "#0A3831",   # dark background layer
    "white":       "#FFFFFF",
}

# colour sets per theme -------------------------------------------------------
THEMES = {
    "light": {
        "ring_a": "teal", "ring_b": "green",
        "bowl": "teal", "foot": "teal_deep", "lip": "teal_soft",
        "mound": "yellow", "tomato": "red", "carrot": "orange",
        "leaf": "green", "leaf2": "green_deep", "leaf_vein": "green_deep",
        "leaf2_vein": "green",
    },
    "dark": {
        "ring_a": "teal_bright", "ring_b": "green_light",
        "bowl": "teal_soft", "foot": "green", "lip": "green_light",
        "mound": "yellow", "tomato": "red", "carrot": "orange",
        "leaf": "green_light", "leaf2": "green", "leaf_vein": "green",
        "leaf2_vein": "green_light",
    },
    "white": {
        "ring_a": "white", "ring_b": "white",
        "bowl": "white", "foot": "white", "lip": "white",
        "mound": "white", "tomato": "white", "carrot": "white",
        "leaf": "white", "leaf2": "white", "leaf_vein": "white",
        "leaf2_vein": "white",
    },
    "mono": {
        "ring_a": "mono", "ring_b": "mono",
        "bowl": "mono", "foot": "mono", "lip": "mono",
        "mound": "mono", "tomato": "mono", "carrot": "mono",
        "leaf": "mono", "leaf2": "mono", "leaf_vein": "mono",
        "leaf2_vein": "mono",
    },
}


# --------------------------------------------------------------------------
# tiny vector helpers
# --------------------------------------------------------------------------
def polar(a_deg, r, cx=C, cy=C):
    a = math.radians(a_deg)
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def _n(v):
    """compact number formatting"""
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s else "0"


def pt(p):
    return f"{_n(p[0])},{_n(p[1])}"


def arc_path(a0, a1, r, cx=C, cy=C):
    """circular arc, clockwise (increasing angle in this y-down space)"""
    x0, y0 = polar(a0, r, cx, cy)
    x1, y1 = polar(a1, r, cx, cy)
    large = 1 if abs(a1 - a0) > 180 else 0
    sweep = 1 if a1 > a0 else 0
    return f"M{_n(x0)},{_n(y0)} A{_n(r)},{_n(r)} 0 {large} {sweep} {_n(x1)},{_n(y1)}"


def rounded_poly(pts, r):
    """closed polygon with rounded corners"""
    n = len(pts)
    corner = []
    for i in range(n):
        p_prev, p, p_next = pts[i - 1], pts[i], pts[(i + 1) % n]
        v1 = _unit(_sub(p_prev, p))
        v2 = _unit(_sub(p_next, p))
        rr = min(r, _dist(p_prev, p) / 2.0, _dist(p_next, p) / 2.0)
        corner.append((_add(p, _mul(v1, rr)), _add(p, _mul(v2, rr)), p))
    d = f"M{pt(corner[0][0])}"
    for i in range(n):
        a, b, p = corner[i]
        d += f"L{pt(a)}Q{pt(p)} {pt(b)}"
        d += f"L{pt(corner[(i + 1) % n][0])}"
    return d + "Z"


def leaf_path(L, W, curl=0.0):
    """leaf in local space: base (0,0) -> tip (L,0); full, rounded belly and
    a softly pointed tip (classic botanical almond)."""
    c1 = 0.42 * L + curl * L
    c2 = 0.42 * L - curl * L
    k = 0.30 * W          # short handle that keeps the tip pointed but not sharp
    return (f"M0,0C{_n(c1)},{_n(-W * 1.12)} {_n(L - k)},{_n(-W * 0.94)} {_n(L)},0"
            f"C{_n(L - k)},{_n(W * 0.94)} {_n(c2)},{_n(W * 1.12)} 0,0Z")


def leaf(x, y, angle, L, W, curl=0.0, fill="#000", vein=True, vein_color=None):
    g = f'<g transform="translate({_n(x)},{_n(y)}) rotate({_n(angle)})">'
    g += f'<path d="{leaf_path(L, W, curl)}" fill="{fill}"/>'
    if vein:
        g += (f'<path d="M{_n(0.16 * L)},0L{_n(0.86 * L)},0" stroke="{vein_color}" '
              f'stroke-width="{_n(W * 0.13)}" stroke-linecap="round" fill="none" '
              f'opacity="0.55"/>')
    return g + "</g>"


def _add(a, b): return (a[0] + b[0], a[1] + b[1])
def _sub(a, b): return (a[0] - b[0], a[1] - b[1])
def _mul(a, k): return (a[0] * k, a[1] * k)
def _dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
def _unit(a):
    d = math.hypot(*a) or 1.0
    return (a[0] / d, a[1] / d)


# --------------------------------------------------------------------------
# mark parts
# --------------------------------------------------------------------------
def ring(ring_r, ring_sw, arcs, col_a, col_b, head_len, head_hw):
    """two curved arrows forming the lifecycle loop"""
    out = []
    for (a0, a1), fill in zip(arcs, (col_a, col_b)):
        d_deg = math.degrees(head_len / ring_r)
        stroke_end = a1 - d_deg
        # arc body: round cap at the tail, flat (butt) cut where the head sits
        tail = a0 - math.degrees((ring_sw / 2.0) / ring_r)
        out.append(f'<path d="{arc_path(tail, stroke_end, ring_r)}" fill="none" '
                   f'stroke="{fill}" stroke-width="{_n(ring_sw)}" '
                   f'stroke-linecap="round"/>')
        # arrowhead: triangle from base plane to tip, radial half-width head_hw
        tip = polar(a1, ring_r)
        base = polar(a1 - d_deg, ring_r)
        nx, ny = math.cos(math.radians(a1)), math.sin(math.radians(a1))
        p2 = (base[0] + nx * head_hw, base[1] + ny * head_hw)
        p3 = (base[0] - nx * head_hw, base[1] - ny * head_hw)
        out.append(f'<path d="M{pt(tip)}L{pt(p2)}L{pt(p3)}Z" fill="{fill}" '
                   f'stroke="{fill}" stroke-width="18" stroke-linejoin="round"/>')
    return "".join(out)


def bowl(rim_y, rim_rx, rim_ry, bottom, foot, col_bowl, col_foot, col_lip, lip=True):
    """bowl: body (concave near-rim) + base foot + rim highlight"""
    lx, rx = C - rim_rx, C + rim_rx
    depth = bottom - rim_y
    d = (f"M{_n(lx)},{_n(rim_y)}"
         f"C{_n(lx + 0.02 * rim_rx)},{_n(rim_y + 0.62 * depth)}"
         f" {_n(C - 0.56 * rim_rx)},{_n(bottom)} {_n(C)},{_n(bottom)}"
         f"C{_n(C + 0.56 * rim_rx)},{_n(bottom)}"
         f" {_n(rx - 0.02 * rim_rx)},{_n(rim_y + 0.62 * depth)} {_n(rx)},{_n(rim_y)}"
         f"A{_n(rim_rx)},{_n(rim_ry)} 0 0 1 {_n(lx)},{_n(rim_y)}Z")
    g = [f'<path d="{d}" fill="{col_bowl}"/>']
    if lip:
        g.append(f'<path d="M{_n(rx)},{_n(rim_y)}'
                 f'A{_n(rim_rx)},{_n(rim_ry)} 0 0 1 {_n(lx)},{_n(rim_y)}" '
                 f'fill="none" stroke="{col_lip}" stroke-width="{_n(LIP_SW)}" '
                 f'opacity="0.75"/>')
    fx, fy, fw, fh, fr = foot
    g.append(f'<rect x="{_n(fx)}" y="{_n(fy)}" width="{_n(fw)}" height="{_n(fh)}" '
             f'rx="{_n(fr)}" fill="{col_foot}"/>')
    return "".join(g)


def tomato(cx, cy, r, col, leaf_col, micro=False):
    g = [f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{_n(r)}" fill="{col}"/>']
    if not micro:
        for a, L, W in ((-146, 30, 15), (-34, 30, 15), (-90, 26, 13)):
            g.append(leaf(cx, cy - r * 0.86, a, L, W, fill=leaf_col, vein=False))
        g.append(f'<rect x="{_n(cx - 4)}" y="{_n(cy - r - 16)}" width="8" height="20" '
                 f'rx="4" fill="{leaf_col}"/>')
    return "".join(g)


def carrot(pts, col, leaf_col, r_corner=22, greens=True):
    g = [f'<path d="{rounded_poly(pts, r_corner)}" fill="{col}"/>']
    if greens:
        bx, by = pts[0][0] - 4, pts[0][1] - 6
        for a, L, W in ((-118, 40, 16), (-88, 46, 17), (-62, 38, 15)):
            g.append(leaf(bx, by, a, L, W, fill=leaf_col, vein=False))
    return "".join(g)


# --------------------------------------------------------------------------
# symbol builders
# --------------------------------------------------------------------------
def symbol(variant="full", theme="light", scale=1.0, dx=0.0, dy=0.0):
    """the full brand mark in a 1024 grid (no background)."""
    t = THEMES[theme]
    col = lambda k: {"mono": "#000", "white": "#FFFFFF"}.get(t[k]) or PALETTE[t[k]]
    mono = theme in ("mono", "white")
    out = []

    if variant in ("full", "simple"):
        # leaves grow out of the bowl (behind it)
        out.append(leaf(*LEAF_BIG, fill=col("leaf"), vein=not mono,
                        vein_color=col("leaf_vein")))
        out.append(leaf(*LEAF_SML, fill=col("leaf"), vein=not mono,
                        vein_color=col("leaf_vein")))
        # leaves grow up out of the bowl (behind the bowl, in front of the food)
        leaves = (leaf(*LEAF_BIG, fill=col("leaf"), vein=not mono,
                       vein_color=col("leaf_vein"))
                  + leaf(*LEAF_SML, fill=col("leaf2"), vein=not mono,
                         vein_color=col("leaf2_vein")))
        # food mound inside the bowl
        mound = (f'<ellipse cx="{_n(MOUND[0])}" cy="{_n(MOUND[1])}" '
                 f'rx="{_n(MOUND[2])}" ry="{_n(MOUND[3])}" fill="{col("mound")}"/>')
        if mono:
            # knock a soft gap around the leaves so the silhouette stays
            # readable in a single colour (the tomato drops out entirely)
            gaps = ""
            for (lx, ly, la, LL, LW) in (LEAF_BIG, LEAF_SML):
                gaps += (f'<g transform="translate({_n(lx)},{_n(ly)}) rotate({_n(la)})">'
                         f'<path d="M-14,0L{_n(LL + 14)},0" stroke="#000" '
                         f'stroke-width="{_n(2 * LW + 44)}" stroke-linecap="round" '
                         f'fill="none"/></g>')
            mound = (f'<mask id="kcGap" maskUnits="userSpaceOnUse" x="0" y="0" '
                     f'width="{CANVAS}" height="{CANVAS}">'
                     f'<rect x="0" y="0" width="{CANVAS}" height="{CANVAS}" fill="#fff"/>'
                     f'{gaps}</mask><g mask="url(#kcGap)">{mound}</g>')
        out.append(mound + leaves)
        if not mono:
            out.append(tomato(*TOMATO, col("tomato"), col("leaf")))
        out.append(bowl(RIM_Y, RIM_RX, RIM_RY, BOWL_BOTTOM, FOOT,
                        col("bowl"), col("foot"), col("lip")))
        out.append(ring(RING_R, RING_SW, ARCS, col("ring_a"), col("ring_b"),
                        HEAD_LEN, HEAD_HW))

    elif variant == "tiny":
        out.append(leaf(*LEAF_TINY, fill=col("leaf"), vein=False))
        out.append(bowl(T_RIM_Y, T_RIM_RX, T_RIM_RY, T_BOTTOM, T_FOOT,
                        col("bowl"), col("foot"), col("lip"), lip=not mono))
        out.append(ring(T_RING_R, T_RING_SW, T_ARCS, col("ring_a"),
                        col("ring_b"), T_HEAD_LEN, T_HEAD_HW))

    elif variant == "micro":
        out.append(leaf(*LEAF_MICRO, fill=col("leaf"), vein=False))
        out.append(bowl(M_RIM_Y, M_RIM_RX, M_RIM_RY, M_BOTTOM, M_FOOT,
                        col("bowl"), col("foot"), col("lip"), lip=not mono))
        out.append(ring(M_RING_R, M_RING_SW, M_ARCS, col("ring_a"),
                        col("ring_b"), M_HEAD_LEN, M_HEAD_HW))

    else:
        raise ValueError(variant)

    inner = "".join(out)
    if scale != 1.0 or dx or dy:
        inner = (f'<g transform="translate({_n(C)},{_n(C)}) scale({_n(scale)}) '
                 f'translate({_n(dx - C)},{_n(dy - C)})">{inner}</g>')
    else:
        inner = f"<g>{inner}</g>"
    return inner


def icon_svg(variant="full", theme="light", size=CANVAS, bg=None,
             scale=1.0, radius=0, include_bg=True, pad_ratio=0.0,
             title="Khabar Chakra"):
    """square icon document. bg=None -> transparent."""
    inner_scale = scale * (1.0 - 2.0 * pad_ratio)
    layers = []
    if include_bg and bg:
        r = "" if not radius else f' rx="{_n(radius)}"'
        layers.append(f'<rect x="0" y="0" width="{CANVAS}" height="{CANVAS}"{r} fill="{bg}"/>')
    layers.append(symbol(variant=variant, theme=theme, scale=inner_scale))
    body = "".join(layers)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{_n(size)}" '
            f'height="{_n(size)}" viewBox="0 0 {CANVAS} {CANVAS}" role="img" '
            f'aria-label="{title} icon">'
            f'<title>{title}</title>{body}</svg>')


def bg_color(theme):
    if theme == "dark":
        return PALETTE["ink"]
    if theme == "mono":
        return None
    return PALETTE["cream"]
