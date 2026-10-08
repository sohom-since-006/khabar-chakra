"""
Khabar Chakra — in-app UI icon set.
==================================

A stroke-based icon family on a 24 px grid, drawn to match the visual
language of the master brand mark: 2 px strokes, round caps and joins,
generous negative space, positive tone.

Conventions
-----------
grid          24 x 24
live area     3 .. 21  (key square 16x16, key circle r = 8)
stroke        2 px, currentColor, round cap + round join
corner radius 2.2-3 (small), 1.2-1.5 (inner details)
file name     kebab-case, semantic not literal ("pickup", not "truck")

Every icon is emitted as `stroke="currentColor"` so it inherits text colour
in an app.  Raster exports substitute a concrete colour at build time.
"""

import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import kc_symbol as K          # palette reuse  # noqa: E402

GRID = 24
SW = 2.0
TEAL = K.PALETTE["teal"]


# ---------------------------------------------------------------------------
# primitives  (every one returns an <path>/<circle>/<rect> string)
# ---------------------------------------------------------------------------
def L(x1, y1, x2, y2, **kw):
    return f'<path d="M{_n(x1)} {_n(y1)}L{_n(x2)} {_n(y2)}"{_attrs(kw)}/>'


def PL(*pts, close=False, **kw):
    d = "M" + " ".join(f"{_n(x)} {_n(y)}" for x, y in pts) + ("Z" if close else "")
    return f'<path d="{d}"{_attrs(kw)}/>'


def R(x, y, w, h, rx=0, **kw):
    r = f' rx="{_n(rx)}"' if rx else ""
    return (f'<rect x="{_n(x)}" y="{_n(y)}" width="{_n(w)}" height="{_n(h)}"{r}'
            f'{_attrs(kw)}/>')


def C(cx, cy, r, **kw):
    return f'<circle cx="{_n(cx)}" cy="{_n(cy)}" r="{_n(r)}"{_attrs(kw)}/>'


def DOT(cx, cy, r, **kw):
    """filled dot"""
    return C(cx, cy, r, fill="currentColor", stroke="none", **kw)


def RAW(d, **kw):
    return f'<path d="{d}"{_attrs(kw)}/>'


def polar(a, r, cx=12.0, cy=12.0):
    a = math.radians(a)
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def ARC(cx, cy, r, a0, a1, **kw):
    """clockwise arc, angles in degrees (screen space, y down)"""
    x0, y0 = polar(a0, r, cx, cy)
    x1, y1 = polar(a1, r, cx, cy)
    large = 1 if abs(a1 - a0) > 180 else 0
    sweep = 1 if a1 > a0 else 0
    return RAW(f"M{_n(x0)} {_n(y0)}A{_n(r)} {_n(r)} 0 {large} {sweep} "
               f"{_n(x1)} {_n(y1)}", **kw)


def HEAD(cx, cy, r, angle, size=3.0, **kw):
    """arrowhead whose tip sits on the circle at `angle`, pointing clockwise"""
    tip = polar(angle, r, cx, cy)
    b1 = polar(angle - 50, size, *tip)
    b2 = polar(angle - 130, size, *tip)
    return RAW(f"M{_n(b1[0])} {_n(b1[1])}L{_n(tip[0])} {_n(tip[1])}"
               f"L{_n(b2[0])} {_n(b2[1])}", **kw)


def LEAF(x, y, length, width, angle=0.0, **kw):
    """small leaf, base at (x,y) pointing along `angle` degrees"""
    l, w = length, width
    c1, c2, k = 0.42 * l, 0.42 * l, 0.30 * w
    d = (f"M0 0C{_n(c1)} {_n(-w * 1.12)} {_n(l - k)} {_n(-w * 0.94)} {_n(l)} 0"
         f"C{_n(l - k)} {_n(w * 0.94)} {_n(c2)} {_n(w * 1.12)} 0 0Z")
    return RAW(d, transform=f"translate({_n(x)},{_n(y)}) rotate({_n(angle)})", **kw)


def _attrs(kw):
    out = ""
    for k, v in kw.items():
        out += f' {k.replace("_", "-")}="{v}"'
    return out


def _n(v):
    s = f"{float(v):.2f}".rstrip("0").rstrip(".")
    return s if s else "0"


# ---------------------------------------------------------------------------
# the icon set
# ---------------------------------------------------------------------------
ICONS = {}


def icon(name, category, tags, *parts):
    ICONS[name] = {
        "category": category,
        "tags": tags,
        "body": "".join(parts),
    }


# ============================== LIFECYCLE =================================
icon("buy", "lifecycle", "purchase, shop, grocery, basket",
     RAW("M4.4 10.4h15.2l-1.5 8.1a2 2 0 0 1-2 1.6H7.9a2 2 0 0 1-2-1.6z"),
     RAW("M8.2 10.4a3.8 3.8 0 0 1 7.6 0"),
     L(10.2, 12.9, 10, 19.4),
     L(13.8, 12.9, 14, 19.4))

icon("track", "lifecycle", "progress, monitor, gauge, status",
     ARC(12, 15, 7.8, 180, 360),
     L(12, 15, 16.4, 10.6),
     DOT(12, 15, 1.6))

icon("store", "lifecycle", "keep, container, box, save",
     R(4.4, 7.4, 15.2, 12.2, 2.4),
     L(4.4, 11.4, 19.6, 11.4),
     L(9.8, 14.8, 14.2, 14.8))

icon("consume", "lifecycle", "eat, meal, plate, finished",
     C(12, 12.4, 5.4),
     RAW("M4.5 3.6v4.1a2 2 0 0 0 4 0V3.6"),
     L(6.5, 9.8, 6.5, 20.4),
     RAW("M19.5 3.6c1.3 2.6 1.3 5.4 0 8"),
     L(19.5, 11.6, 19.5, 20.4))

icon("cook", "lifecycle", "cooking, pot, stove, prepare",
     R(4.5, 11, 15, 8.5, 2.4),
     L(3.4, 11, 20.6, 11),
     RAW("M9.6 4c-.9 1.1-.9 2.1 0 3.2"),
     RAW("M14.4 4c-.9 1.1-.9 2.1 0 3.2"))

icon("share", "lifecycle", "give, distribute, network, send",
     L(8.6, 10.9, 15.4, 7.1),
     L(8.6, 13.1, 15.4, 16.9),
     DOT(6.4, 12, 2.3),
     DOT(17.6, 6, 2.3),
     DOT(17.6, 18, 2.3))

icon("donate", "lifecycle", "give, charity, heart, help",
     RAW("M12 16.6c-5.6-3.7-6.8-6-5.7-7.9 1.2-2.1 4.3-1.9 5.7.2 1.4-2.1 4.5-2.3 5.7-.2 1.1 1.9-.1 4.2-5.7 7.9z"),
     RAW("M4 17.6c0 1.9 3.4 3.4 8 3.4s8-1.5 8-3.4"))

icon("reuse", "lifecycle", "again, leftover, cycle, repeat",
     ARC(12, 12, 7.2, 198, 336),
     HEAD(12, 12, 7.2, 336),
     ARC(12, 12, 7.2, 18, 156),
     HEAD(12, 12, 7.2, 156))

icon("recycle", "lifecycle", "recycling, sustainable, circular",
     ARC(12, 12, 7.4, 100, 348),
     HEAD(12, 12, 7.4, 348, 3.1),
     LEAF(9.4, 14.2, 7.2, 3.5, -52, fill="none"))

icon("dispose", "lifecycle", "bin, discard, waste, responsible",
     L(4, 7.2, 20, 7.2),
     RAW("M9.6 7.2V5.6a1.4 1.4 0 0 1 1.4-1.4h2a1.4 1.4 0 0 1 1.4 1.4v1.6"),
     RAW("M6.4 7.2l.85 12.2a2 2 0 0 0 2 1.9h5.5a2 2 0 0 0 2-1.9L17.6 7.2"),
     RAW("M10.2 13.2l1.5 1.5 2.6-2.9"))

# ================================ FOOD ====================================
icon("ingredient", "food", "carrot, vegetable, raw, produce",
     RAW("M9.4 6.8h5.2l-1.9 12.6a.75.75 0 0 1-1.4 0z"),
     RAW("M10.8 6.4C9.9 4.9 8.9 3.9 7.9 3.4"),
     L(12, 6.3, 12, 3.1),
     RAW("M13.2 6.4c.9-1.5 1.9-2.5 2.9-3"))

icon("recipe", "food", "book, instructions, method, cookbook",
     R(4.5, 4, 15, 16, 2.2),
     L(8.8, 4.2, 8.8, 19.8),
     L(11.6, 9, 16.6, 9),
     L(11.6, 12.4, 16.6, 12.4),
     L(11.6, 15.8, 14.6, 15.8))

icon("meal", "food", "dish, cloche, serve, lunch",
     ARC(12, 15, 7.6, 180, 360),
     DOT(12, 7.4, 1.15),
     L(3.2, 17.6, 20.8, 17.6))

icon("portion", "food", "serving, measure, scoop, split a portion",
     RAW("M7.4 8.4h8.4v8.4a3.4 3.4 0 0 1-3.4 3.4h-1.6a3.4 3.4 0 0 1-3.4-3.4z"),
     RAW("M15.8 11h1.4a2.3 2.3 0 0 1 0 4.6h-1.4"),
     L(9.6, 12, 11.2, 12),
     L(9.6, 14.6, 11.2, 14.6))

icon("leftover", "food", "tiffin, container, saved, box",
     R(4, 6.4, 16, 3, 1.5),
     R(5.6, 9.4, 12.8, 9.6, 2.2))

icon("fresh", "food", "new, leaf, just cooked, quality",
     RAW("M19.6 4.4c-9.4.4-14 4.8-14 10.8 0 2.4 1.6 4 4 4 6 0 10.4-4.6 10-14.8z"),
     RAW("M17.2 6.8c-3.1 2.1-5.9 5.1-7.8 8.9"))

icon("expiring", "food", "soon, clock, deadline, urgent",
     C(12, 12, 7.6),
     RAW("M12 7.6V12l3.2 2"))

icon("expired", "food", "past, spoiled, date, alert",
     R(4, 5.6, 16, 14.4, 2.2),
     L(4, 10.4, 20, 10.4),
     L(8, 3.8, 8, 7.2),
     L(16, 3.8, 16, 7.2),
     RAW("M9.8 13.8l4.4 4.4"),
     RAW("M14.2 13.8l-4.4 4.4"))

icon("fridge", "food", "cold, storage, appliance",
     R(5.5, 3.4, 13, 17.2, 2.4),
     L(5.5, 10.6, 18.5, 10.6),
     L(8.4, 6, 8.4, 8.4),
     L(8.4, 12.6, 8.4, 15))

icon("freezer", "food", "frozen, snowflake, cold store",
     L(12, 3.4, 12, 20.6),
     RAW("M4.6 7.7l14.8 8.6"),
     RAW("M19.4 7.7L4.6 16.3"))

icon("pantry", "food", "shelf, jars, store cupboard, stock",
     L(3.4, 19.4, 20.6, 19.4),
     R(5.0, 12.0, 4.6, 7.4, 1.5),
     R(5.6, 10.2, 3.4, 1.9, 0.7),
     R(9.8, 8.6, 4.6, 10.8, 1.5),
     R(10.4, 6.8, 3.4, 1.9, 0.7),
     R(14.6, 12.6, 4.6, 6.8, 1.5),
     R(15.2, 10.8, 3.4, 1.9, 0.7))

icon("shopping-list", "food", "grocery, checklist, plan, buy list",
     R(6, 4.6, 12, 15.6, 2.2),
     RAW("M9.6 2.8h4.8a1 1 0 0 1 1 1v1.5H8.6V3.8a1 1 0 0 1 1-1z"),
     L(9.2, 10.6, 14.8, 10.6),
     L(9.2, 13.9, 14.8, 13.9),
     L(9.2, 17.2, 12.4, 17.2))

icon("scan", "food", "barcode, label, qr, add item",
     RAW("M4 8.4V6a2 2 0 0 1 2-2h2.4"),
     RAW("M15.6 4H18a2 2 0 0 1 2 2v2.4"),
     RAW("M20 15.6V18a2 2 0 0 1-2 2h-2.4"),
     RAW("M8.4 20H6a2 2 0 0 1-2-2v-2.4"),
     L(8.4, 9.6, 8.4, 14.4),
     L(10.8, 9.6, 10.8, 14.4),
     L(13.2, 9.6, 13.2, 14.4),
     L(15.6, 9.6, 15.6, 14.4))

icon("market", "food", "bazaar, shop, stall, vendor",
     R(3.6, 4.4, 16.8, 4.6, 1.2),
     L(5.6, 9, 5.6, 19.6),
     L(18.4, 9, 18.4, 19.6),
     L(3.6, 15.2, 20.4, 15.2))

# ============================ DIET & SAFETY ================================
icon("veg-marker", "safety", "vegetarian, green dot, india",
     R(4, 4, 16, 16, 3),
     DOT(12, 12, 3.3))

icon("nonveg-marker", "safety", "non vegetarian, red, india",
     R(4, 4, 16, 16, 3),
     f'<path d="M12 8.5L15.6 14.9H8.4Z" fill="currentColor" stroke="none"/>')

icon("allergen", "safety", "nut, peanut, allergy, contains",
     C(8.7, 8.7, 3.7),
     C(15.3, 15.5, 3.0),
     L(10.9, 10.9, 13.6, 13.8))

icon("plant-based", "safety", "vegan, leaf, vegetarian option",
     C(12, 12, 7.8),
     RAW("M16.8 7.2c-5.2.2-7.8 2.7-7.8 6 0 1.4.9 2.3 2.3 2.3 3.3 0 5.7-2.6 5.5-8.3z"))

icon("no-onion-garlic", "safety", "jain, satvik, restriction, avoid",
     RAW("M12 4.6c0 2-5.8 4.4-5.8 9.2a5.8 5.8 0 0 0 11.6 0c0-4.8-5.8-7.2-5.8-9.2z"),
     L(4.4, 4.4, 19.6, 19.6))

icon("spice", "safety", "chilli, hot, flavour, level",
     RAW("M11.6 8.8c-2.4 3.4-2 8 1.2 10.2 2 1.4 4.5.8 5.4-1.3.8-1.9-.2-4-2.2-4.5-1.3-.3-2.2.4-2.3-.9-.1-1.4-.6-2.4-2.1-3.5z"),
     RAW("M11.2 8.7C10.6 7 11 5.5 12.3 4.5"))

# ============================== COMMUNITY ==================================
icon("household", "community", "home, family, kitchen, my place",
     RAW("M3.4 11.4L12 3.8l8.6 7.6"),
     RAW("M6 9.6v10h12v-10"),
     RAW("M12 16.4c-2.6-1.7-3.2-2.8-2.7-3.7.55-.95 2-.85 2.7.1.7-.95 2.15-1.05 2.7-.1.5.9-.1 2-2.7 3.7z"))

icon("family", "community", "people, group, home",
     C(9, 8, 2.7),
     RAW("M4.4 19.6a4.6 4.6 0 0 1 9.2 0"),
     C(16.8, 10.2, 2.1),
     RAW("M13.4 19.6a3.6 3.6 0 0 1 7.2 0"))

icon("neighbour", "community", "next door, local, nearby, houses",
     RAW("M3 12.6L8 8.6l5 4"),
     RAW("M4.8 11.6v8h6.4v-8"),
     RAW("M12.6 20.2V11l4.4-3.5 4.4 3.5v9.2"),
     RAW("M15 20.2v-4.6h4v4.6"))

icon("volunteer", "community", "helper, donate time, person, heart",
     C(9.2, 7.6, 2.9),
     RAW("M4.2 19.8a5 5 0 0 1 10 0"),
     RAW("M18.2 13.4c-2.3-1.5-2.8-2.5-2.4-3.3.5-.85 1.8-.75 2.4.1.6-.85 1.9-.95 2.4-.1.4.8-.1 1.8-2.4 3.3z"))

icon("ngo", "community", "organisation, partner, building, verified partner",
     R(5.6, 8.6, 12.8, 11, 1.8),
     L(3.6, 8.6, 20.4, 8.6),
     RAW("M12 8.6V3.6h5.4l-1.7 2.5 1.7 2.5H12"),
     RAW("M10.4 19.6v-4.2h3.2v4.2"))

icon("verified", "community", "trusted, shield, approved, check",
     RAW("M12 3.2l7 2.6v5.4c0 4.6-3.4 8.2-7 9.6-3.6-1.4-7-5-7-9.6V5.8z"),
     RAW("M8.9 11.9l2.2 2.2 4-4.4"))

icon("caterer", "community", "chef, commercial, event food, kitchen",
     RAW("M7.6 12.4A3.6 3.6 0 1 1 9.3 5.8a3.9 3.9 0 0 1 5.4 0 3.6 3.6 0 1 1 1.7 6.6v7.2h-8.8z"),
     L(7.6, 16.4, 16.4, 16.4))

icon("event-host", "community", "party, function, gathering, date",
     R(4, 5.6, 16, 14.4, 2.2),
     L(4, 10.4, 20, 10.4),
     L(8, 3.8, 8, 7.2),
     L(16, 3.8, 16, 7.2),
     f'<path d="M12 12.4l1.15 2.35 2.6.38-1.88 1.83.44 2.58L12 18.32l-2.31 1.22.44-2.58-1.88-1.83 2.6-.38z" fill="currentColor" stroke="none"/>')

icon("community", "community", "people, group, together, shared",
     C(6.4, 9.4, 2.4),
     C(12, 7.4, 2.4),
     C(17.6, 9.4, 2.4),
     ARC(12, 20.6, 9.2, 190, 350))

icon("pickup", "community", "collect, van, logistics, transport",
     R(2.6, 8, 11.6, 9.4, 2),
     RAW("M14.2 17.4V9.8h3.2l3.4 3.8v3.8"),
     C(7, 19.4, 2),
     C(17, 19.4, 2))

icon("delivery", "community", "bicycle, rider, courier, drop off",
     C(6, 16.6, 3.1),
     C(18, 16.6, 3.1),
     RAW("M6 16.6l4.4-6.8h4.6l3 6.8"),
     L(9.2, 9.2, 11.4, 9.2),
     L(10.4, 9.8, 10.4, 9.4),
     RAW("M15 9.8l1.4-1.6"),
     L(15.6, 8.2, 17.8, 8.2))

icon("route", "community", "path, distance, journey, pickup route",
     RAW("M5 19.2c3.2-2.8 4.4-7.8 7.6-10.4S17.8 6 19.6 5.4",
         stroke_dasharray="3.2 3"),
     DOT(5, 19.2, 1.9),
     DOT(19.6, 5.4, 1.9))

icon("claim-surplus", "community", "take, package, available, box",
     RAW("M3.6 8.2L12 4l8.4 4.2v7.6L12 20l-8.4-4.2z"),
     RAW("M3.6 8.2l8.4 4.2 8.4-4.2"),
     L(12, 12.4, 12, 20),
     RAW("M7.6 13.2l1.5 1.5 2.3-2.5"))

# =============================== IMPACT ====================================
icon("meals-saved", "impact", "rescued, served, achievement",
     ARC(12, 14.4, 7.4, 0, 180),
     L(4.2, 14.4, 19.8, 14.4),
     RAW("M9.4 8.6l1.9 1.9 3.5-3.9"))

icon("kg-rescued", "impact", "weight, kilos, measured, impact",
     L(7.8, 12, 16.2, 12),
     R(3.4, 8.2, 3.4, 7.6, 1.5),
     R(7.6, 9.6, 2.6, 4.8, 1.1),
     R(17.2, 8.2, 3.4, 7.6, 1.5),
     R(13.8, 9.6, 2.6, 4.8, 1.1))

icon("co2-avoided", "impact", "emissions, carbon, climate, reduced",
     RAW("M6.6 18.2h8.2a3.5 3.5 0 0 0 .4-6.95 4.9 4.9 0 0 0-9.5-1.05A3.35 3.35 0 0 0 6.6 18.2z"),
     LEAF(13.6, 15.4, 7.4, 3.7, -48, fill="currentColor"))

icon("water-saved", "impact", "drop, conservation, resource",
     RAW("M12 3.4C12 3.4 5.6 10.6 5.6 14.8a6.4 6.4 0 0 0 12.8 0C18.4 10.6 12 3.4 12 3.4z"))

icon("streak", "impact", "flame, habit, daily, consistency",
     RAW("M12 3.4C9 7.8 8 9.8 8 12.4a4 4 0 0 0 8 0c0-2.6-1-4.6-4-9z"),
     RAW("M12 11.4c-1.2 1.6-1.7 2.4-1.7 3.5a1.7 1.7 0 0 0 3.4 0c0-1.1-.5-1.9-1.7-3.5z"))

icon("badge", "impact", "award, medal, achievement, reward",
     C(12, 9.4, 5.6),
     DOT(12, 9.4, 1.9),
     RAW("M8.7 14.2L7.2 20.8l4.8-2.3 4.8 2.3-1.5-6.6"))

icon("leaderboard", "impact", "ranking, top, community, standings",
     R(4, 13.6, 4.2, 6.8, 1.2),
     R(9.9, 9.6, 4.2, 10.8, 1.2),
     R(15.8, 15.6, 4.2, 4.8, 1.2))

icon("certificate", "impact", "recognition, document, proof, award",
     R(4.6, 3.4, 13, 13.6, 1.8),
     L(7.6, 7.4, 14.6, 7.4),
     L(7.6, 10.4, 14.6, 10.4),
     L(7.6, 13.4, 11.6, 13.4),
     C(17.2, 17.6, 2.7),
     RAW("M15.7 19.8l-.9 2.8 2.4-1.2 2.4 1.2-.9-2.8"))

icon("tier", "impact", "level, upgrade, progress, ranking",
     RAW("M4.6 11.4L12 5.6l7.4 5.8"),
     RAW("M4.6 16.4L12 10.6l7.4 5.8"),
     RAW("M4.6 21.4L12 15.6l7.4 5.8"))

icon("goal", "impact", "target, objective, milestone, aim",
     C(12, 12, 7.8),
     C(12, 12, 4.4),
     DOT(12, 12, 1.8))

# ============================= CORE UI =====================================
icon("search", "ui", "find, lookup, magnifier",
     C(11, 11, 6.2),
     L(15.6, 15.6, 20.2, 20.2))

icon("filter", "ui", "refine, narrow, options, funnel",
     RAW("M3.4 5.4h17.2l-6.6 7.6v6.4l-4 2.2v-8.6z"))

icon("map", "ui", "location, area, region, view map",
     RAW("M3.6 7l5.4-2.6 6 2.6 5.4-2.6v12.6l-5.4 2.6-6-2.6-5.4 2.6z"),
     L(9, 4.6, 9, 17),
     L(15, 7, 15, 19.6))

icon("location", "ui", "pin, place, here, address",
     RAW("M12 20.8s7-7.3 7-11.2a7 7 0 0 0-14 0c0 3.9 7 11.2 7 11.2z"),
     C(12, 9.5, 2.6))

icon("calendar", "ui", "date, schedule, month, plan",
     R(4, 5.6, 16, 14.4, 2.2),
     L(4, 10.4, 20, 10.4),
     L(8, 3.8, 8, 7.2),
     L(16, 3.8, 16, 7.2),
     DOT(8.4, 14, 1.15),
     DOT(12, 14, 1.15),
     DOT(15.6, 14, 1.15),
     DOT(8.4, 17.4, 1.15),
     DOT(12, 17.4, 1.15))

icon("schedule", "ui", "time, when, plan, reminder",
     R(4, 5.6, 16, 14.4, 2.2),
     L(4, 10.4, 20, 10.4),
     L(8, 3.8, 8, 7.2),
     L(16, 3.8, 16, 7.2),
     C(12, 15.4, 3.2),
     RAW("M12 13.6v1.9l1.5 1.1"))

icon("bell", "ui", "notify, alert, push, announcement",
     RAW("M18.2 16.4H5.8c1-1.2 1.6-2.7 1.6-5.3 0-2.9 2-5 4.6-5s4.6 2.1 4.6 5c0 2.6.6 4.1 1.6 5.3z"),
     RAW("M10.2 19.2a1.9 1.9 0 0 0 3.6 0"),
     L(12, 3.4, 12, 6.1))

icon("message", "ui", "chat, talk, comment, support",
     R(3.4, 4.4, 17.2, 12.6, 2.6),
     RAW("M8.4 17.2v4l4.2-4"))

icon("invite", "ui", "add person, refer, bring, member",
     C(9.6, 7.6, 3),
     RAW("M4.2 19.8a5.4 5.4 0 0 1 10.8 0"),
     L(18.6, 7.6, 18.6, 13),
     L(15.9, 10.3, 21.3, 10.3))

icon("share-arrow", "ui", "send, export, forward, upload",
     L(12, 3.6, 12, 14),
     RAW("M8.2 7.2L12 3.4l3.8 3.8"),
     RAW("M8 8.6H6.4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H16"))

icon("qr", "ui", "code, scan to donate, poster, quick",
     R(4, 4, 6, 6, 1.5),
     R(14, 4, 6, 6, 1.5),
     R(4, 14, 6, 6, 1.5),
     L(14.4, 14.4, 17.6, 14.4),
     L(20, 14.4, 20, 17.6),
     L(14.4, 17.6, 14.4, 20),
     L(17.6, 20, 20, 20))

icon("profile", "ui", "account, user, me, avatar",
     C(12, 8.8, 3.6),
     RAW("M5.2 20.2a6.8 6.8 0 0 1 13.6 0"))

icon("sliders", "ui", "settings, preferences, adjust, configure",
     L(3.6, 7.4, 20.4, 7.4),
     L(3.6, 12.4, 20.4, 12.4),
     L(3.6, 17.4, 20.4, 17.4),
     C(9, 7.4, 2.1),
     C(15, 12.4, 2.1),
     C(7.6, 17.4, 2.1))

icon("help", "ui", "question, support, faq, how to",
     C(12, 12, 7.8),
     RAW("M9.6 9.6a2.5 2.5 0 0 1 4.9.6c0 1.7-2.4 2-2.4 3.5"),
     DOT(12, 16.6, 1.05))

icon("star-rating", "ui", "favourite, rate, review, quality",
     RAW("M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z"))

# ============================== STATES =====================================
icon("success", "state", "done, ok, complete, confirmed",
     C(12, 12, 7.8),
     RAW("M8.6 12.1l2.4 2.4 4.4-4.8"))

icon("warning", "state", "caution, attention, risk",
     RAW("M12 4.2L21 19.4H3z"),
     L(12, 9.6, 12, 13.8),
     DOT(12, 16.6, 1.05))

icon("error", "state", "failed, problem, wrong, invalid",
     C(12, 12, 7.8),
     RAW("M9.4 9.4l5.2 5.2"),
     RAW("M14.6 9.4l-5.2 5.2"))

icon("info", "state", "note, details, about, hint",
     C(12, 12, 7.8),
     L(12, 11.2, 12, 16.4),
     DOT(12, 8.2, 1.05))

icon("empty", "state", "no results, nothing here, blank, none",
     R(4, 4, 16, 16, 3, stroke_dasharray="3.4 3"))

icon("offline", "state", "no network, disconnected, cloud off",
     RAW("M7 18.4h9.4a3.75 3.75 0 0 0 .4-7.45 5.25 5.25 0 0 0-10.2-1.1A3.6 3.6 0 0 0 7 18.4z"),
     L(4.4, 4.4, 19.6, 19.6))

icon("sync", "state", "refresh, update, reload, loading data",
     ARC(12, 12, 6.6, 200, 340),
     HEAD(12, 12, 6.6, 340, 2.8),
     ARC(12, 12, 6.6, 20, 160),
     HEAD(12, 12, 6.6, 160, 2.8))

icon("loading", "state", "spinner, please wait, busy, processing",
     ARC(12, 12, 7.6, 80, 350))

icon("locked", "state", "private, secure, restricted, no access",
     R(5, 10.4, 14, 9.6, 2.2),
     RAW("M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6"),
     DOT(12, 15.2, 1.3))

icon("hidden", "state", "hide, invisible, eye off, privacy",
     RAW("M2.6 12s3.7-6 9.4-6 9.4 6 9.4 6-3.7 6-9.4 6-9.4-6-9.4-6z"),
     C(12, 12, 2.8),
     L(4.4, 4.4, 19.6, 19.6))


# ---------------------------------------------------------------------------
# rendering
# ---------------------------------------------------------------------------
STROKE_OPEN = (f'<g fill="none" stroke="{{color}}" stroke-width="{_n(SW)}" '
               f'stroke-linecap="round" stroke-linejoin="round">')
STROKE_CLOSE = "</g>"


def icon_svg(name, size=GRID, color="currentColor", title=None,
             extra_class=""):
    """standalone icon document"""
    ic = ICONS[name]
    t = title or name.replace("-", " ").title()
    cls = f' class="{extra_class}"' if extra_class else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" '
            f'height="{size}" viewBox="0 0 {GRID} {GRID}"{cls} role="img" '
            f'aria-label="{t}"><title>{t}</title>'
            f'{STROKE_OPEN.format(color=color)}{ic["body"]}{STROKE_CLOSE}</svg>')


def body(name):
    return ICONS[name]["body"]


def categories():
    out = {}
    for name, ic in ICONS.items():
        out.setdefault(ic["category"], []).append(name)
    return out


CATEGORY_LABEL = {
    "lifecycle": "Lifecycle (Buy → Dispose responsibly)",
    "food": "Food & pantry",
    "safety": "Diet & food safety",
    "community": "Community & logistics",
    "impact": "Impact & gamification",
    "ui": "Core UI",
    "state": "States & feedback",
}
