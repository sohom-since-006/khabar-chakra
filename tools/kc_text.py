"""
Khabar Chakra — text → vector-outline engine.
=============================================

Converts the brand name (Bengali / Devanagari / Latin) into plain SVG path
data using HarfBuzz shaping + fontTools outlines, so the logo files contain
**no font dependency at all** — they render identically everywhere.

Requires the fonts in tools/fonts (downloaded from Google Fonts, OFL).
"""

import os
import uharfbuzz as hb
from fontTools.ttLib import TTFont as FTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")

FONT_FILES = {
    "bengali": os.path.join(FONTS, "NotoSansBengali-VF.ttf"),
    "devanagari": os.path.join(FONTS, "NotoSansDevanagari-VF.ttf"),
    "latin": os.path.join(FONTS, "Manrope-VF.ttf"),
}


class Shaper:
    """shapes + outlines a single font, optionally at a variable instance"""

    def __init__(self, kind, weight=600, width=100):
        path = FONT_FILES[kind]
        self.kind = kind
        self.data = open(path, "rb").read()
        self.face = hb.Face(self.data)
        self.font = hb.Font(self.face)
        self.tt = FTFont(path, fontNumber=0)
        variations = {}
        if "fvar" in self.tt:
            for axis in self.tt["fvar"].axes:
                if axis.axisTag == "wght":
                    variations["wght"] = weight
                elif axis.axisTag == "wdth":
                    variations["wdth"] = width
            if variations:
                from fontTools.varLib.instancer import instantiateVariableFont
                self.tt = instantiateVariableFont(self.tt, variations,
                                                  inplace=False,
                                                  updateFontNames=False)
                self.font.set_variations(variations)
        self.upem = self.tt["head"].unitsPerEm
        self.glyphset = self.tt.getGlyphSet()

    def draw(self, text, size, x=0.0, y=0.0, tracking=0.0, features=None,
             align="left"):
        """returns (svg path data, advance width in px).

        x,y = baseline start.  tracking is in em (e.g. 0.08 = 8%).
        align: left | center | right  (measured on the resulting advance).
        """
        self.font.scale = (size, size)
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, features or {})
        infos, positions = buf.glyph_infos, buf.glyph_positions

        # measure (so align="center"/"right" works for every script)
        clusters = [i.cluster for i in infos]
        n_gaps = max(len(set(clusters)) - 1, 0)
        total = sum(p.x_advance for p in positions) + tracking * size * n_gaps
        shift = {"left": 0.0, "center": -total / 2.0, "right": -total}[align]
        cx = x + shift
        cy = y

        out = []
        scale = size / self.upem
        prev_cluster = None
        for info, pos in zip(infos, positions):
            gname = self.tt.getGlyphName(info.codepoint)
            pen = SVGPathPen(self.glyphset)
            tx = cx + pos.x_offset
            ty = cy - pos.y_offset
            tpen = TransformPen(pen, Transform(scale, 0, 0, -scale, tx, ty))
            try:
                self.glyphset[gname].draw(tpen)
            except KeyError:
                pass
            d = pen.getCommands()
            if d:
                out.append(d)
            if prev_cluster is not None and info.cluster != prev_cluster:
                cx += tracking * size
            prev_cluster = info.cluster
            cx += pos.x_advance
            cy -= pos.y_advance
        return " ".join(out), total

    def path_element(self, text, size, x=0, y=0, tracking=0.0, fill="#000",
                     features=None, align="left", opacity=None):
        d, _ = self.draw(text, size, x, y, tracking, features, align)
        extra = f' opacity="{opacity}"' if opacity is not None else ""
        return f'<path d="{d}" fill="{fill}"{extra}/>'

    def text_width(self, text, size, tracking=0.0, features=None):
        """advance width in px at `size`, including letter tracking"""
        self.font.scale = (size, size)
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, features or {})
        adv = sum(p.x_advance for p in buf.glyph_positions)
        clusters = len({i.cluster for i in buf.glyph_infos})
        return adv + tracking * size * max(clusters - 1, 0)
