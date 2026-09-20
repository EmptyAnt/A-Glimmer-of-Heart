# -*- coding: utf-8 -*-
"""寸心 · 场景氛围图生成器 v4：高饱和、有内容、能看清的插画场景"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'scenes')


def svg(w, h, body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + str(w) + ' ' + str(h) + '">'
            '<defs>' + defs + '</defs>' + body + '</svg>')


def lg(gid, stops, vertical=True):
    s = ''.join('<stop offset="' + str(o) + '%" stop-color="' + c + '"/>' for c, o in stops)
    if vertical:
        return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' + s + '</linearGradient>'
    return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0">' + s + '</linearGradient>'


def rg(gid, color, inner=0.85):
    return ('<radialGradient id="' + gid + '">'
            '<stop offset="0%" stop-color="' + color + '" stop-opacity="' + str(inner) + '"/>'
            '<stop offset="45%" stop-color="' + color + '" stop-opacity="' + str(inner * 0.45) + '"/>'
            '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></radialGradient>')


def glow(x, y, r, gid='glow'):
    return '<circle cx="' + str(x) + '" cy="' + str(y) + '" r="' + str(r) + '" fill="url(#' + gid + ')"/>'


def vig(op=0.32):
    return ('<radialGradient id="vig"><stop offset="48%" stop-color="#000" stop-opacity="0"/>'
            '<stop offset="100%" stop-color="#000" stop-opacity="' + str(op) + '"/></radialGradient>'
            '<rect width="800" height="500" fill="url(#vig)"/>')


def save(name, body, defs=''):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg(800, 500, body, defs))


def bed(x, y, w=340, blanket='#e8a0a0', blanket_d='#d4838a', frame='#7a5c40'):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="' + str(w) + '" height="26" rx="8" fill="' + frame + '"/>'
            + '<rect x="' + str(x + 6) + '" y="' + str(y - 34) + '" width="' + str(w - 12)
            + '" height="40" rx="12" fill="#fffdf8"/>'
            + '<rect x="' + str(x + 6) + '" y="' + str(y - 34) + '" width="' + str(w - 12)
            + '" height="18" rx="9" fill="' + blanket + '"/>'
            + '<ellipse cx="' + str(x + 52) + '" cy="' + str(y - 30) + '" rx="40" ry="14" fill="#fffdf8"/>'
            + '<rect x="' + str(x + 14) + '" y="' + str(y + 26) + '" width="14" height="46" fill="' + frame + '"/>'
            + '<rect x="' + str(x + w - 28) + '" y="' + str(y + 26) + '" width="14" height="46" fill="' + frame + '"/>')


def window_view(x, y, w, h, sky1, sky2, moon=False, stars=True, city=True):
    gid = 'wv' + str(x) + str(w)
    defs = lg(gid, [(sky1, 0), (sky2, 100)])
    body = ('<rect x="' + str(x) + '" y="' + str(y) + '" width="' + str(w) + '" height="' + str(h)
            + '" rx="4" fill="url(#' + gid + ')" stroke="#fffdf8" stroke-width="10"/>'
            + '<line x1="' + str(x + w // 2) + '" y1="' + str(y) + '" x2="' + str(x + w // 2) + '" y2="'
            + str(y + h) + '" stroke="#fffdf8" stroke-width="7"/>')
    if stars:
        for k in range(6):
            sx, sy = x + 18 + (k * 47) % (w - 40), y + 14 + (k * 29) % (h // 2)
            body += '<circle cx="' + str(sx) + '" cy="' + str(sy) + '" r="2.6" fill="#fff8e0"/>'
    if moon:
        body += ('<circle cx="' + str(x + w - 34) + '" cy="' + str(y + 34) + '" r="20" fill="#fff4cf"/>'
                 + '<circle cx="' + str(x + w - 42) + '" cy="' + str(y + 28) + '" r="17" fill="url(#' + gid + ')"/>')
    if city:
        body += ('<rect x="' + str(x + 8) + '" y="' + str(y + h - 46) + '" width="' + str(w - 16)
                 + '" height="40" fill="#3a3448"/>'
                 + '<rect x="' + str(x + 14) + '" y="' + str(y + h - 78) + '" width="26" height="72" fill="#443d52"/>'
                 + '<rect x="' + str(x + w - 66) + '" y="' + str(y + h - 64) + '" width="30" height="58" fill="#443d52"/>'
                 + ''.join('<rect x="' + str(x + 18 + k * 22) + '" y="' + str(y + h - 40)
                           + '" width="7" height="9" fill="#ffd9a0" opacity="0.85"/>' for k in range(4)))
    return defs, body


def curtain(x, y, w, h, c='#d9a06f', cd='#c98a5f'):
    return ('<path d="M' + str(x) + ',' + str(y) + ' q26,' + str(int(h * 0.38)) + ' 4,' + str(h)
            + ' l' + str(w) + ',0 q-22,-' + str(int(h * 0.38)) + ' -4,-' + str(h) + ' z" fill="' + c + '"/>'
            + '<rect x="' + str(x - 8) + '" y="' + str(y - 8) + '" width="' + str(w + 16)
            + '" height="12" rx="5" fill="' + cd + '"/>')


def plant(x, y, s=1.0):
    return ('<rect x="' + str(int(x)) + '" y="' + str(int(y)) + '" width="' + str(int(46 * s))
            + '" height="' + str(int(42 * s)) + '" rx="7" fill="#b5624e"/>'
            + '<path d="M' + str(int(x + 23 * s)) + ',' + str(int(y))
            + ' q-30,-38 -5,-62 q24,16 5,62z" fill="#4a6b52"/>'
            + '<path d="M' + str(int(x + 23 * s)) + ',' + str(int(y))
            + ' q28,-34 7,-58 q-26,14 -7,58z" fill="#5d8266"/>')


def framed(x, y, n=2):
    out = ''
    for k in range(n):
        out += ('<rect x="' + str(x + k * 78) + '" y="' + str(y) + '" width="58" height="46" rx="4" '
                'fill="#fffdf8" stroke="#8a6a48" stroke-width="5"/>'
                + '<circle cx="' + str(x + 29 + k * 78) + '" cy="' + str(y + 23) + '" r="9" '
                'fill="' + ('#7ea06f' if k % 2 == 0 else '#93aec6') + '"/>')
    return out


def baby_sil(x, y, s=1.0, color='#4a4238'):
    return ('<circle cx="' + str(x) + '" cy="' + str(y) + '" r="' + str(int(16 * s)) + '" fill="' + color + '"/>'
            + '<ellipse cx="' + str(x) + '" cy="' + str(y + int(20 * s)) + '" rx="' + str(int(24 * s))
            + '" ry="' + str(int(13 * s)) + '" fill="' + color + '"/>')


def sofa_big(x, y, c='#c98a6a'):
    cd = '#b87a5c'
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="300" height="96" rx="18" fill="' + c + '"/>'
            + '<rect x="' + str(x + 20) + '" y="' + str(y - 36) + '" width="120" height="58" rx="14" fill="' + cd + '"/>'
            + '<rect x="' + str(x + 158) + '" y="' + str(y - 36) + '" width="120" height="58" rx="14" fill="' + cd + '"/>'
            + '<rect x="' + str(x - 20) + '" y="' + str(y - 20) + '" width="38" height="120" rx="16" fill="' + c + '"/>'
            + '<rect x="' + str(x + 282) + '" y="' + str(y - 20) + '" width="38" height="120" rx="16" fill="' + c + '"/>'
            + '<rect x="' + str(x + 34) + '" y="' + str(y - 30) + '" width="50" height="40" rx="10" fill="#e8c67a"/>')


def sofa_sil():
    return ('<rect x="380" y="290" width="240" height="86" rx="16" fill="#3a3f5c"/>'
            '<rect x="396" y="252" width="98" height="52" rx="12" fill="#43486a"/>'
            '<rect x="504" y="252" width="98" height="52" rx="12" fill="#43486a"/>')


def city_from_window(x, y):
    out = '<rect x="' + str(x) + '" y="' + str(y + 34) + '" width="170" height="56" fill="#1c2236"/>'
    for k, bx in enumerate((x + 6, x + 52, x + 96, x + 136)):
        bh = 34 + (k * 13) % 22
        out += ('<rect x="' + str(bx) + '" y="' + str(y + 90 - bh) + '" width="30" height="'
                + str(bh) + '" fill="#242c44"/>'
                + '<rect x="' + str(bx + 9) + '" y="' + str(y + 98 - bh) + '" width="7" height="9" '
                'fill="#ffd9a0" opacity="0.8"/>')
    return out


def bed_sil(x, y):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="220" height="20" rx="6" fill="#a08050"/>'
            + '<rect x="' + str(x) + '" y="' + str(y - 24) + '" width="220" height="36" rx="10" fill="#fffdf8"/>'
            + '<rect x="' + str(x + 8) + '" y="' + str(y + 20) + '" width="14" height="76" fill="#2a2622"/>'
            + '<rect x="' + str(x + 198) + '" y="' + str(y + 20) + '" width="14" height="76" fill="#2a2622"/>'
            + '<rect x="' + str(x + 8) + '" y="' + str(y - 38) + '" width="100" height="28" rx="8" fill="#93aec6"/>')


def slide_sil(x, y):
    return ('<rect x="' + str(x) + '" y="' + str(y - 80) + '" width="12" height="90" fill="#2a3030"/>'
            + '<rect x="' + str(x + 78) + '" y="' + str(y - 80) + '" width="12" height="90" fill="#2a3030"/>'
            + '<path d="M' + str(x + 6) + ',' + str(y - 78) + ' L' + str(x + 84) + ',' + str(y + 6)
            + ' l14,4 l-70,88z" fill="#3a4a50"/>'
            + '<rect x="' + str(x - 40) + '" y="' + str(y + 12) + '" width="86" height="12" rx="6" fill="#2a3030"/>')


def goal_sil(x, y):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="12" height="130" fill="#2a2622"/>'
            + '<rect x="' + str(x + 150) + '" y="' + str(y) + '" width="12" height="130" fill="#2a2622"/>'
            + '<rect x="' + str(x) + '" y="' + str(y) + '" width="162" height="12" fill="#2a2622"/>')


def train(y):
    body = '<rect x="30" y="' + str(y) + '" width="740" height="110" rx="14" fill="#43545c"/>'
    for k in range(6):
        body += ('<rect x="' + str(60 + k * 118) + '" y="' + str(y + 22) + '" width="76" height="52" '
                 'rx="8" fill="#8fb4d0"/>')
    body += '<rect x="30" y="' + str(y + 88) + '" width="740" height="16" rx="8" fill="#c96f5a"/>'
    return body


def steam(x, y):
    return ('<g opacity="0.55" stroke="#eef4f2" stroke-width="7" fill="none" stroke-linecap="round">'
            '<path d="M' + str(x) + ',' + str(y) + ' q10,-32 0,-62 q-8,-26 6,-44"/>'
            '<path d="M' + str(x + 34) + ',' + str(y - 8) + ' q-8,-28 2,-54"/>'
            '</g>')


def gate_full(label, color):
    d = lg('sky', [('#cfe3ee', 0), ('#f0e0c5', 100)])
    b = ('<rect width="800" height="300" fill="url(#sky)"/>'
         + '<circle cx="660" cy="90" r="36" fill="#ffe9bd"/>'
         + '<rect y="300" width="800" height="200" fill="#c2b287"/>'
         + '<rect x="60" y="100" width="680" height="210" fill="#d8cbb2"/>'
         + '<rect x="60" y="60" width="680" height="54" rx="6" fill="' + color + '"/>'
         + '<text x="400" y="98" text-anchor="middle" font-size="30" fill="#fffdf8" '
         'font-family="sans-serif" font-weight="bold">' + label + '</text>'
         + '<rect x="345" y="154" width="110" height="156" fill="#5a6673"/>'
         + '<rect x="90" y="154" width="18" height="156" fill="#8a6a48"/>'
         + '<rect x="692" y="154" width="18" height="156" fill="#8a6a48"/>'
         + plant(120, 372) + plant(620, 372)
         + vignette(0.24))
    return b, d


def classroom_full(line1, line2=None):
    d = lg('wall', [('#eef0e4', 0), ('#dce4d4', 100)])
    b = ('<rect width="800" height="420" fill="url(#wall)"/>'
         + '<rect y="420" width="800" height="80" fill="#c9b58e"/>'
         + '<rect x="150" y="80" width="500" height="180" rx="8" fill="#33503f" stroke="#a08050" stroke-width="12"/>')
    if line2:
        b += ('<text x="400" y="150" text-anchor="middle" font-size="38" fill="#fffdf8" '
              'font-family="sans-serif" font-weight="bold">' + line1 + '</text>'
              + '<text x="400" y="215" text-anchor="middle" font-size="48" fill="#e8c67a" '
              'font-family="sans-serif" font-weight="bold">' + line2 + '</text>')
    else:
        b += ('<text x="400" y="170" text-anchor="middle" font-size="42" fill="#fffdf8" '
              'font-family="sans-serif" font-weight="bold">' + line1 + '</text>')
    for x, y in ((90, 330), (330, 330), (570, 330), (90, 420), (330, 420), (570, 420)):
        b += ('<rect x="' + str(x) + '" y="' + str(y) + '" width="140" height="18" rx="5" fill="#b99670"/>'
              + '<rect x="' + str(x + 12) + '" y="' + str(y + 18) + '" width="14" height="50" fill="#8a6a48"/>'
              + '<rect x="' + str(x + 114) + '" y="' + str(y + 18) + '" width="14" height="50" fill="#8a6a48"/>')
    b += vig()
    return b, d


def stage_full(wall):
    body = ('<rect width="800" height="500" fill="' + wall + '"/>'
            + '<path d="M80,80 L80,450 M720,80 L720,450 M80,80 q320,120 640,0" '
            'stroke="#8a3a48" stroke-width="22" fill="none"/>'
            + '<path d="M80,80 q320,120 640,0 l0,80 q-320,-110 -640,0z" fill="#b25460"/>'
            + ''.join('<path d="M' + str(140 + k * 160) + ',60 l20,54 l-20,54 l-20,-54z" fill="#7a4a56"/>'
                      for k in range(4))
            + '<rect x="230" y="260" width="340" height="200" fill="#43364a"/>'
            + ''.join('<circle cx="' + str(180 + k * 148) + '" cy="60" r="14" fill="' + C['gold'] + '"/>'
                      for k in range(4))
            + glow(400, 60, 130, 'stageglow')
            + '<rect y="450" width="800" height="50" fill="#241f28"/>'
            + vignette(0.32))
    defs = rad_grad('stageglow', C['gold'], 0.5)
    return body, defs


def shelves_full():
    d = lg('wall', [('#f5eee2', 0), ('#e8dcc8', 100)])
    b = '<rect width="800" height="500" fill="url(#wall)"/>'
    for y in (160, 264, 368):
        b += '<rect x="50" y="' + str(y) + '" width="700" height="18" rx="7" fill="#dcc8ae"/>'
    colors = ['#e8a464', '#a8c09a', '#93aec6', '#d97b66', '#e8c67a', '#7fb3ae']
    for row, y in enumerate((226, 330, 434)):
        for k in range(7):
            b += ('<rect x="' + str(80 + k * 94) + '" y="' + str(y - 70) + '" width="60" height="66" '
                  'rx="8" fill="' + colors[(k + row) % 6] + '"/>'
                  + '<rect x="' + str(88 + k * 94) + '" y="' + str(y - 62) + '" width="20" height="30" '
                  'rx="4" fill="#fffdf8" opacity="0.4"/>')
    b += '<rect y="450" width="800" height="50" fill="#efe6d6"/>'
    return b, d


def dining_full():
    d = lg('wall', [('#f5e8d5', 0), ('#e8d0b0', 100)])
    b = ('<rect width="800" height="420" fill="url(#wall)"/>'
         + '<rect y="420" width="800" height="80" fill="#c8a678"/>'
         + '<ellipse cx="400" cy="420" rx="380" ry="130" fill="#a08050"/>'
         + '<ellipse cx="400" cy="398" rx="350" ry="115" fill="#e8c88f"/>'
         + '<ellipse cx="255" cy="368" rx="98" ry="34" fill="#fffdf8"/>'
         + '<circle cx="244" cy="358" r="16" fill="#c96f5a"/><circle cx="276" cy="352" r="13" fill="#7ea06f"/>'
         + '<ellipse cx="530" cy="372" rx="80" ry="30" fill="#8fb4d0"/>'
         + '<ellipse cx="395" cy="396" rx="64" ry="22" fill="#f2d5d5"/>'
         + steam(388, 388) + steam(520, 362)
         + '<rect x="90" y="60" width="620" height="34" rx="6" fill="rgba(255,253,248,0.5)"/>'
         + vignette(0.2))
    return b, d


S = {}



def add(name, body, defs=''):
    S[name] = svg(800, 500, body, defs)

d = lg('wall', [('#f6dcdc', 0), ('#eebcbe', 100)]) + lg('floor', [('#e3c8c8', 0), ('#d3b0b2', 100)]) + rg('lamp', '#ffe9c9', 0.9)
b = ('<rect width="800" height="360" fill="url(#wall)"/>'
     + '<rect y="360" width="800" height="140" fill="url(#floor)"/>'
     + '<rect y="352" width="800" height="10" fill="rgba(0,0,0,0.10)"/>')
# 窗外夜景（月亮+星星+城市）
wdefs, wbody = window_view(70, 60, 220, 170, '#2c3450', '#4a5378', moon=True)
d += wdefs
b += wbody
b += ('<rect x="330" y="120" width="150" height="34" rx="6" fill="#f0d8d8"/>'
     + '<text x="405" y="144" text-anchor="middle" font-size="22" fill="#b07a7a" font-family="sans-serif">产房</text>')
b += glow(600, 210, 190, 'lamp')
b += bed(90, 330, 360, '#f2c0c8', '#dfa0ac')
b += ('<rect x="560" y="230" width="120" height="84" rx="16" fill="#fffdf8"/>'
     + '<rect x="574" y="206" width="92" height="36" rx="12" fill="#f0dde0"/>')
b += baby_sil(620, 238, 0.9)
b += ('<rect x="560" y="314" width="120" height="16" rx="6" fill="#c9a0a2"/>'
     + '<rect x="584" y="330" width="12" height="80" fill="#fffdf8"/>'
     + '<rect x="706" y="330" width="12" height="80" fill="#fffdf8"/>')
b += ('<rect x="700" y="180" width="14" height="190" fill="#5a5464"/>'
     + '<path d="M707,180 l-30,48 h60z" fill="#f2d5d5"/>')
b += ('<rect x="640" y="300" width="60" height="40" rx="6" fill="#efe0e0"/>')
b += vig()
add('产房', b, d)


def lin_night():
    return lg('nightsky', [('#1c2340', 0), ('#2c3450', 100)])
