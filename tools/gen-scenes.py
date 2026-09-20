# -*- coding: utf-8 -*-
"""
寸心 · 场景氛围图生成器 v3（干净重写版）
风格：氛围光影插画——渐变天空/墙面 + 剪影 + 光源光晕 + 暗角
用法：python tools/gen-scenes.py
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'scenes')

def save(name, content):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(content)


C = {
    'cream': '#f7efe2', 'warm': '#f5e3cb', 'night': '#3d4560', 'night2': '#2c3450',
    'wood': '#c8a678', 'woodD': '#a08050', 'ink': '#2a2622',
    'orange': '#e0995f', 'gold': '#e8c67a', 'red': '#c96f5a',
    'green': '#a8c09a', 'greenD': '#55735c', 'blue': '#93aec6',
    'teal': '#7fb3ae', 'pink': '#f2c9c0', 'pinkD': '#e8a49b',
    'glow': '#ffd9a0', 'white': '#fffdf8',
}


def svg(w, h, body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + str(w) + ' ' + str(h) + '">'
            '<defs>' + defs + '</defs>' + body + '</svg>')


def lin_grad(gid, stops):
    s = ''.join('<stop offset="' + str(o) + '%" stop-color="' + c + '"/>' for c, o in stops)
    return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' + s + '</linearGradient>'


def rad_grad(gid, color, inner=0.6):
    return ('<radialGradient id="' + gid + '">'
            '<stop offset="0%" stop-color="' + color + '" stop-opacity="' + str(inner) + '"/>'
            '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>'
            '</radialGradient>')


def glow(x, y, r, gid='glow'):
    return '<circle cx="' + str(x) + '" cy="' + str(y) + '" r="' + str(r) + '" fill="url(#' + gid + ')"/>'


def vignette(op=0.26):
    return ('<radialGradient id="vig"><stop offset="55%" stop-color="#000" stop-opacity="0"/>'
            '<stop offset="100%" stop-color="#000" stop-opacity="' + str(op) + '"/></radialGradient>'
            '<rect width="800" height="500" fill="url(#vig)"/>')


def room(wall_stops, floor):
    return (lin_grad('wall', wall_stops)
            + '<rect width="800" height="360" fill="url(#wall)"/>'
            + '<rect y="360" width="800" height="140" fill="' + floor + '"/>'
            + '<rect y="352" width="800" height="10" fill="rgba(0,0,0,0.08)"/>')


def window(x, y, w, h, sky, frame='#fffdf8'):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="' + str(w) + '" height="' + str(h)
            + '" rx="4" fill="' + sky + '" stroke="' + frame + '" stroke-width="9"/>'
            + '<line x1="' + str(x + w // 2) + '" y1="' + str(y) + '" x2="' + str(x + w // 2)
            + '" y2="' + str(y + h) + '" stroke="' + frame + '" stroke-width="7"/>'
            + '<line x1="' + str(x) + '" y1="' + str(y + h // 2) + '" x2="' + str(x + w) + '" y2="'
            + str(y + h // 2) + '" stroke="' + frame + '" stroke-width="7"/>')


def moon_in(x, y, w, h):
    return ('<circle cx="' + str(x + w - 42) + '" cy="' + str(y + 44) + '" r="22" fill="#e8ecf5"/>'
            + '<circle cx="' + str(x + w - 50) + '" cy="' + str(y + 38) + '" r="19" fill="#1c2340"/>')


def stars(w, h, n=6):
    out = ''
    for k in range(n):
        cx = 40 + (k * 97) % (w - 60)
        cy = 30 + (k * 53) % (h - 60)
        out += '<circle cx="' + str(cx) + '" cy="' + str(cy) + '" r="2.5" fill="#dfe6f5"/>'
    return out


def plant(x, y, s=1.0):
    w = str(int(44 * s))
    h = str(int(42 * s))
    cx = str(x + int(22 * s))
    cy = str(y)
    return ('<rect x="' + cx + '" y="' + cy + '" width="' + w + '" height="' + h + '" rx="6" fill="#c96f5a"/>'
            + '<path d="M' + cx + ',' + cy + ' q-24,-32 -4,-54 q20,14 4,54z" fill="#55735c"/>'
            + '<path d="M' + cx + ',' + cy + ' q24,-30 6,-52 q-22,12 -6,52z" fill="#6f9464"/>')


def pics(x, y, n=2):
    out = ''
    for k in range(n):
        out += ('<rect x="' + str(x + k * 74) + '" y="' + str(y) + '" width="54" height="44" rx="4" '
                'fill="#fffdf8" stroke="#a08050" stroke-width="4"/>'
                + '<circle cx="' + str(x + 27 + k * 74) + '" cy="' + str(y + 22) + '" r="8" fill="'
                + (C['green'] if k % 2 == 0 else C['blue']) + '"/>')
    return out


def sofa(x, y, c):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="240" height="86" rx="16" fill="' + c + '"/>'
            + '<rect x="' + str(x + 16) + '" y="' + str(y - 32) + '" width="100" height="52" rx="12" fill="' + c + '" opacity="0.85"/>'
            + '<rect x="' + str(x + 124) + '" y="' + str(y - 32) + '" width="100" height="52" rx="12" fill="' + c + '" opacity="0.85"/>')


def bed_hospital(x, y):
    return ('<rect x="' + str(x) + '" y="' + str(y) + '" width="220" height="20" rx="6" fill="#a08050"/>'
            + '<rect x="' + str(x) + '" y="' + str(y - 24) + '" width="220" height="36" rx="10" fill="#fffdf8"/>'
            + '<rect x="' + str(x + 8) + '" y="' + str(y + 20) + '" width="14" height="76" fill="#2a2622"/>'
            + '<rect x="' + str(x + 198) + '" y="' + str(y + 20) + '" width="14" height="76" fill="#2a2622"/>'
            + '<rect x="' + str(x + 8) + '" y="' + str(y - 38) + '" width="100" height="28" rx="8" fill="#93aec6"/>')


def tree(x, y, s=1.0):
    return ('<rect x="' + str(x - 6 * s) + '" y="' + str(y - 24 * s) + '" width="' + str(12 * s)
            + '" height="' + str(100 * s) + '" fill="#2a3030"/>'
            + '<circle cx="' + str(x) + '" cy="' + str(y - 62 * s) + '" r="' + str(46 * s) + '" fill="#2f3d33"/>'
            + '<circle cx="' + str(x - 34 * s) + '" cy="' + str(y - 34 * s) + '" r="' + str(32 * s) + '" fill="#33403a"/>'
            + '<circle cx="' + str(x + 34 * s) + '" cy="' + str(y - 36 * s) + '" r="' + str(34 * s) + '" fill="#2f3d33"/>')


def slide(x, y):
    return ('<rect x="' + str(x) + '" y="' + str(y - 80) + '" width="12" height="90" fill="#2a3030"/>'
            + '<rect x="' + str(x + 78) + '" y="' + str(y - 80) + '" width="12" height="90" fill="#2a3030"/>'
            + '<path d="M' + str(x + 6) + ',' + str(y - 78) + ' L' + str(x + 84) + ',' + str(y + 6)
            + ' l14,4 l-70,88z" fill="#3a4a50"/>'
            + '<rect x="' + str(x - 40) + '" y="' + str(y + 12) + '" width="86" height="12" rx="6" fill="#2a3030"/>')


def goal(x, y):
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


def gate(label, color):
    body = (lin_grad('sky', [('#cfe3ee', 0), ('#f0e0c5', 100)])
            + '<rect width="800" height="300" fill="url(#sky)"/>'
            + '<rect y="300" width="800" height="200" fill="#c2b287"/>'
            + '<rect x="70" y="140" width="660" height="140" fill="#d8cbb2"/>'
            + '<rect x="70" y="104" width="660" height="48" rx="6" fill="' + color + '"/>'
            + '<text x="400" y="138" text-anchor="middle" font-size="28" fill="#fffdf8" '
            'font-family="sans-serif" font-weight="bold">' + label + '</text>'
            + '<rect x="352" y="152" width="96" height="128" fill="#5a6673"/>'
            + '<rect x="104" y="152" width="16" height="128" fill="#8a6a48"/>'
            + '<rect x="680" y="152" width="16" height="128" fill="#8a6a48"/>'
            + vignette(0.2))
    return body


def classroom(line1, line2=None):
    body = (lin_grad('wall', [('#eef0e4', 0), ('#dde4d4', 100)])
            + '<rect width="800" height="500" fill="url(#wall)"/>'
            + '<rect y="400" width="800" height="100" fill="#c9b58e"/>'
            + '<rect x="150" y="80" width="500" height="170" rx="6" fill="#3f5a44" stroke="#a08050" stroke-width="10"/>'
            + '<text x="400" y="150" text-anchor="middle" font-size="40" fill="#fffdf8" '
            'font-family="sans-serif" font-weight="bold">' + line1 + '</text>')
    if line2:
        body += ('<text x="400" y="210" text-anchor="middle" font-size="46" fill="#e8c67a" '
                 'font-family="sans-serif" font-weight="bold">' + line2 + '</text>')
    for x, y in ((100, 300), (330, 300), (560, 300), (100, 400), (330, 400), (560, 400)):
        body += '<rect x="' + str(x) + '" y="' + str(y) + '" width="130" height="16" rx="5" fill="#a08050"/>'
    body += vignette(0.22)
    defs = lin_grad('wall', [('#eef0e4', 0), ('#dde4d4', 100)])
    return body, defs


def stage(wall):
    body = ('<rect width="800" height="500" fill="' + wall + '"/>'
            + '<path d="M90,90 L90,440 M710,90 L710,440 M90,90 q310,110 620,0" '
            'stroke="#a34a56" stroke-width="18" fill="none"/>'
            + '<path d="M90,90 q310,110 620,0 l0,70 q-310,-100 -620,0z" fill="#c25560"/>'
            + '<rect x="240" y="250" width="320" height="190" fill="#4a3b4a"/>'
            + ''.join('<circle cx="' + str(200 + k * 133) + '" cy="70" r="13" fill="' + C['gold'] + '"/>'
                      for k in range(4))
            + '<rect y="440" width="800" height="60" fill="#241f28"/>'
            + vignette(0.3))
    defs = rad_grad('glow', C['gold'], 0.5)
    return body, defs


def shelves():
    body = (lin_grad('wall', [('#f3ece0', 0), ('#e8dcc8', 100)])
            + '<rect width="800" height="500" fill="url(#wall)"/>')
    for y in (170, 270, 370):
        body += '<rect x="60" y="' + str(y) + '" width="680" height="16" rx="6" fill="#dcc8ae"/>'
    colors = ['#e8a464', '#a8c09a', '#93aec6', '#d97b66', '#e8c67a']
    for row, y in enumerate((236, 336, 436)):
        for k in range(7):
            body += ('<rect x="' + str(90 + k * 90) + '" y="' + str(y - 66) + '" width="56" height="62" '
                     'rx="8" fill="' + colors[(k + row) % 5] + '"/>')
    body += '<rect y="440" width="800" height="60" fill="#efe6d6"/>'
    defs = lin_grad('wall', [('#f3ece0', 0), ('#e8dcc8', 100)])
    return body, defs


S = {}


def add(name, body, defs=''):
    S[name] = svg(800, 500, body, defs)


WARM_WALL = [('#f7efe2', 0), ('#f0ddc0', 100)]
NIGHT_WALL = [('#232a42', 0), ('#2c3450', 100)]

b = (room(WARM_WALL, C['wood'])
     + window(90, 70, 180, 140, '#cfe3ee')
     + '<circle cx="230" cy="105" r="20" fill="#ffe9bd"/>'
     + '<path d="M96,70 q14,70 0,140 M266,70 q-14,70 0,140" stroke="#d9a06f" stroke-width="12" fill="none"/>'
     + pics(560, 96, 2)
     + sofa(470, 300, '#c98a6a')
     + plant(120, 396)
     + vignette(0.22))
add('家中', b, lin_grad('wall', WARM_WALL) + rad_grad('glow', C['glow'], 0.35))

b = (room(NIGHT_WALL, '#232a42')
     + window(90, 70, 180, 140, '#1c2340', '#556080')
     + moon_in(90, 70, 180, 140)
     + ''.join('<circle cx="' + str(130 + k * 34) + '" cy="' + str(100 + (k % 3) * 24)
               + '" r="2.5" fill="#dfe6f5"/>' for k in range(5))
     + glow(600, 240, 210)
     + '<rect x="560" y="264" width="12" height="110" rx="5" fill="#8a6a48"/>'
     + '<path d="M540,264 l52,0 l-16,-34 h-20z" fill="#e0995f"/>'
     + '<circle cx="566" cy="256" r="9" fill="#ffd9a0"/>'
     + sofa(380, 300, '#3a3f5c')
     + vignette(0.34))
add('家中·深夜', b, lin_grad('wall', NIGHT_WALL) + rad_grad('glow', C['glow'], 0.55))

DAWN_SKY = [('#151b30', 0), ('#232a42', 55), ('#3a3f5c', 100)]
b = (lin_grad('sky', DAWN_SKY)
     + '<rect width="800" height="500" fill="url(#sky)"/>'
     + window(90, 70, 180, 140, '#1a2136', '#4c5570')
     + moon_in(90, 70, 180, 140)
     + '<polygon points="120,80 260,80 200,300 60,300" fill="#aebdd8" opacity="0.10"/>'
     + sofa(380, 310, '#4c5474')
     + glow(620, 300, 120)
     + '<rect x="616" y="306" width="8" height="70" rx="4" fill="#8a6a48"/>'
     + '<circle cx="620" cy="300" r="8" fill="#ffd9a0"/>'
     + vignette(0.32))
add('家中·凌晨', b, lin_grad('sky', DAWN_SKY) + rad_grad('glow', C['glow'], 0.4))

TILE = [('#e9f0f2', 0), ('#d5dee1', 100)]
b = (lin_grad('tile', TILE)
     + '<rect width="800" height="360" fill="url(#tile)"/>'
     + ''.join('<line x1="' + str(x) + '" y1="0" x2="' + str(x) + '" y2="360" stroke="#d7e2e5" stroke-width="3"/>'
               for x in range(80, 800, 110))
     + ''.join('<line x1="0" y1="' + str(y) + '" x2="800" y2="' + str(y) + '" stroke="#d7e2e5" stroke-width="3"/>'
               for y in (90, 180, 270))
     + '<rect y="360" width="800" height="140" fill="#8a929b"/>'
     + '<rect x="480" y="110" width="230" height="96" rx="10" fill="#3d4560"/>'
     + '<rect x="300" y="322" width="270" height="38" rx="6" fill="#8899a6"/>'
     + '<ellipse cx="420" cy="318" rx="74" ry="16" fill="#2a2622"/>'
     + steam(390, 306) + steam(452, 298)
     + glow(660, 300, 90)
     + vignette(0.2))
add('家中·厨房', b, lin_grad('tile', TILE) + rad_grad('glow', C['glow'], 0.5))

MORNING_SKY = [('#f9edd8', 0), ('#f5dcb2', 100)]
b = (lin_grad('sky', MORNING_SKY)
     + '<rect width="800" height="500" fill="url(#sky)"/>'
     + window(430, 60, 230, 170, '#ffe9bd')
     + '<polygon points="450,70 640,70 520,420 300,420" fill="#fff3d6" opacity="0.55"/>'
     + sofa(120, 300, '#c98a6a')
     + plant(120, 396)
     + ''.join('<circle cx="' + str(300 + k * 67) + '" cy="' + str(200 + (k * 37) % 160)
               + '" r="5" fill="#fff3d6" opacity="0.9"/>' for k in range(9))
     + vignette(0.18))
add('家中·清晨', b, lin_grad('sky', MORNING_SKY) + rad_grad('glow', '#fff3d6', 0.55))

DESK_WALL = [('#f2e6d2', 0), ('#e8d4b8', 100)]
b = (lin_grad('wall', DESK_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="380" width="800" height="120" fill="#c8a678"/>'
     + '<rect x="430" y="290" width="300" height="26" rx="6" fill="#a08050"/>'
     + '<rect x="452" y="316" width="20" height="120" fill="#8a6a48"/>'
     + '<rect x="690" y="316" width="20" height="120" fill="#8a6a48"/>'
     + glow(500, 230, 150)
     + '<rect x="560" y="196" width="10" height="94" fill="#2a2622"/>'
     + '<path d="M536,196 h58 l16,30 h-90z" fill="#e0995f"/>'
     + ''.join('<rect x="' + str(450 + k * 44) + '" y="266" width="36" height="26" rx="3" fill="'
               + ['#c96f5a', '#93aec6', '#7ea06f'][k % 3] + '"/>' for k in range(3))
     + ''.join('<rect x="' + str(200 + k * 36) + '" y="210" width="30" height="80" fill="'
               + ['#a8c3d9', '#f2b8a0', '#e8c67a'][k % 3] + '"/>' for k in range(3))
     + vignette(0.2))
add('家中·书桌', b, lin_grad('wall', DESK_WALL) + rad_grad('glow', C['glow'], 0.65))

HALL_WALL = [('#e8d4b8', 0), ('#d0b080', 100)]
b = (lin_grad('wall', HALL_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="400" width="800" height="100" fill="#b99670"/>'
     + '<rect x="290" y="70" width="230" height="360" rx="8" fill="#c9a86f"/>'
     + '<rect x="308" y="88" width="194" height="324" fill="#b8935f"/>'
     + '<circle cx="470" cy="250" r="7" fill="#e8c67a"/>'
     + '<polygon points="640,420 800,300 800,500 620,500" fill="#fff3d6" opacity="0.45"/>'
     + pics(80, 110, 2)
     + vignette(0.22))
add('家中·走廊', b, lin_grad('wall', HALL_WALL))

DINING_WALL = [('#f5e8d5', 0), ('#e8d0b0', 100)]
b = (lin_grad('wall', DINING_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<ellipse cx="400" cy="400" rx="360" ry="130" fill="#a08050"/>'
     + '<ellipse cx="400" cy="382" rx="330" ry="110" fill="#e8c88f"/>'
     + '<ellipse cx="270" cy="352" rx="92" ry="32" fill="#fffdf8"/>'
     + '<circle cx="258" cy="344" r="15" fill="#c96f5a"/><circle cx="288" cy="338" r="12" fill="#7ea06f"/>'
     + '<ellipse cx="520" cy="356" rx="76" ry="28" fill="#8fb4d0"/>'
     + '<ellipse cx="400" cy="378" rx="60" ry="20" fill="#f2d5d5"/>'
     + steam(396, 372) + steam(510, 348)
     + glow(400, 90, 110)
     + vignette(0.2))
add('家中·餐桌', b, lin_grad('wall', DINING_WALL) + rad_grad('glow', C['glow'], 0.4))

HOSP_WALL = [('#e2ecec', 0), ('#d0e0de', 100)]
b = (lin_grad('wall', HOSP_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="380" width="800" height="120" fill="#c3d6d2"/>'
     + '<rect x="70" y="60" width="56" height="190" rx="4" fill="#fffdf8"/>'
     + ''.join('<line x1="70" y1="' + str(y) + '" x2="126" y2="' + str(y)
               + '" stroke="#c3d6d2" stroke-width="4"/>' for y in (110, 155, 200))
     + bed_hospital(230, 340)
     + '<rect x="560" y="190" width="12" height="180" fill="#4a4238"/>'
     + '<path d="M566,190 l-26,46 h52z" fill="#f2d5d5"/>'
     + '<rect x="620" y="310" width="130" height="80" rx="8" fill="#fffdf8"/>'
     + vignette(0.24))
add('医院', b, lin_grad('wall', HOSP_WALL))

b = (lin_grad('floor', [('#d5dee1', 0), ('#b8c8cc', 100)])
     + '<rect width="800" height="500" fill="url(#floor)"/>'
     + '<polygon points="250,60 550,60 700,470 100,470" fill="#c9d8da"/>'
     + '<polygon points="320,80 480,80 560,470 240,470" fill="#dce8ea"/>'
     + '<rect x="80" y="310" width="240" height="26" rx="8" fill="#bcd0d6"/>'
     + '<rect x="96" y="336" width="16" height="70" fill="#9db6b2"/>'
     + '<rect x="340" y="336" width="16" height="70" fill="#9db6b2"/>'
     + '<rect x="560" y="90" width="14" height="330" fill="#4a4238"/>'
     + '<path d="M567,90 l-32,54 h64z" fill="#f2d5d5"/>'
     + '<rect x="620" y="80" width="150" height="110" rx="4" fill="#fffdf8"/>'
     + '<text x="695" y="150" text-anchor="middle" font-size="44" fill="#c96f5a" '
     'font-family="sans-serif" font-weight="bold">+</text>'
     + vignette(0.3))
add('医院·走廊', b, lin_grad('floor', [('#d5dee1', 0), ('#b8c8cc', 100)]))

BIRTH_WALL = [('#f2e4e4', 0), ('#ecd2d4', 100)]
b = (lin_grad('wall', BIRTH_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="380" width="800" height="120" fill="#d8c4c4"/>'
     + glow(590, 210, 170)
     + '<rect x="480" y="252" width="150" height="64" rx="16" fill="#fffdf8"/>'
     + '<rect x="498" y="230" width="114" height="38" rx="13" fill="#f7e8ea"/>'
     + '<rect x="90" y="300" width="210" height="22" rx="6" fill="#a08050"/>'
     + '<rect x="96" y="276" width="198" height="36" rx="10" fill="#fffdf8"/>'
     + '<rect x="120" y="150" width="100" height="28" rx="6" fill="#e8d5d5"/>'
     + '<circle cx="640" cy="150" r="52" fill="#f7d7d7"/>'
     + '<circle cx="640" cy="150" r="26" fill="#fff0f0"/>'
     + vignette(0.2))
add('产房', b, lin_grad('wall', BIRTH_WALL) + rad_grad('glow', C['pink'], 0.6))

DUSK = [('#f7c98a', 0), ('#e89a72', 55), ('#b06a72', 100)]
b = (lin_grad('sky', DUSK)
     + '<rect width="800" height="300" fill="url(#sky)"/>'
     + '<circle cx="620" cy="170" r="52" fill="#ffe9bd"/>'
     + '<rect y="300" width="800" height="200" fill="#4a5a48"/>'
     + '<path d="M0,390 q400,-50 800,10 l0,100 l-800,0z" fill="#3a4838"/>'
     + tree(180, 330, 1.4) + tree(560, 310, 1.1) + tree(700, 350, 1.6)
     + slide(380, 350)
     + vignette(0.26))
add('公园', b, lin_grad('sky', DUSK))

PLAY_SKY = [('#8a9ec6', 0), ('#c9a88f', 70), ('#e0a878', 100)]
b = (lin_grad('sky', PLAY_SKY)
     + '<rect width="800" height="280" fill="url(#sky)"/>'
     + '<circle cx="150" cy="200" r="40" fill="#f4c98a"/>'
     + '<rect y="280" width="800" height="52" fill="#5a7355"/>'
     + '<rect y="332" width="800" height="168" fill="#a05a42"/>'
     + ''.join('<rect x="' + str(24 + k * 128) + '" y="346" width="64" height="14" rx="4" fill="#e8d9c0"/>'
               for k in range(6))
     + goal(580, 220)
     + vignette(0.24))
add('操场', b, lin_grad('sky', PLAY_SKY))

COURT_SKY = [('#1c2340', 0), ('#3d4560', 100)]
b = (lin_grad('sky', COURT_SKY)
     + '<rect width="800" height="260" fill="url(#sky)"/>'
     + '<rect y="260" width="800" height="240" fill="#3a4a50"/>'
     + '<path d="M240,320 a320,80 0 0 1 440,0z" fill="#43545c" opacity="0.8"/>'
     + glow(660, 130, 130)
     + '<rect x="652" y="140" width="12" height="200" fill="#1c2340"/>'
     + '<circle cx="658" cy="140" r="36" stroke="#dfe6f5" stroke-width="8" fill="none"/>'
     + '<circle cx="240" cy="330" r="20" fill="#e0995f"/>'
     + '<path d="M228,320 l24,20 M252,320 l-24,20" stroke="#1c2340" stroke-width="3"/>'
     + vignette(0.3))
add('球场', b, lin_grad('sky', COURT_SKY) + rad_grad('glow', C['glow'], 0.5))

CAMPUS_SKY = [('#cfe3ee', 0), ('#f0e0c5', 100)]
b = (lin_grad('sky', CAMPUS_SKY)
     + '<rect width="800" height="280" fill="url(#sky)"/>'
     + '<rect y="280" width="800" height="220" fill="#b8a280"/>'
     + '<rect x="560" y="120" width="220" height="200" rx="8" fill="#e0d0b5" stroke="#a08050" stroke-width="10"/>'
     + ''.join('<rect x="' + str(582 + k * 52) + '" y="150" width="36" height="52" fill="#93aec6"/>'
               for k in range(3))
     + tree(180, 320, 1.5) + tree(420, 340, 1.2)
     + '<rect y="470" width="800" height="30" fill="#a08a68"/>'
     + vignette(0.2))
add('校园', b, lin_grad('sky', CAMPUS_SKY))

STATION_SKY = [('#f7c98a', 0), ('#e0a878', 100)]
b = (lin_grad('sky', STATION_SKY)
     + '<rect width="800" height="260" fill="url(#sky)"/>'
     + '<circle cx="660" cy="90" r="40" fill="#ffe9bd"/>'
     + '<rect y="260" width="800" height="54" fill="#9aa4ad"/>'
     + '<rect y="314" width="800" height="186" fill="#7a848d"/>'
     + train(150)
     + '<rect y="248" width="800" height="14" fill="#e8c67a"/>'
     + vignette(0.22))
add('火车站', b, lin_grad('sky', STATION_SKY))

add('小学门口', gate('实验小学', C['red']))
add('中学门口', gate('第一中学', '#48749f'))
add('高中门口', gate('厚德博学 · 追求卓越', '#3f5a44'))

b, d = classroom('好好学习，天天向上')
add('教室', b, d)
b, d = classroom('距离高考还有', '100 天')
add('教室·倒计时', b, d)
b, d = classroom('诚信考试', '光荣做人')
add('考场', b, d)

EXAM_SKY = [('#cfe3ee', 0), ('#f0e0c5', 100)]
b = (lin_grad('sky', EXAM_SKY)
     + '<rect width="800" height="300" fill="url(#sky)"/>'
     + '<rect y="300" width="800" height="200" fill="#c2b287"/>'
     + '<rect x="100" y="110" width="600" height="170" fill="#e8d9c0"/>'
     + '<rect x="100" y="80" width="600" height="46" rx="6" fill="#3f5a44"/>'
     + '<text x="400" y="113" text-anchor="middle" font-size="26" fill="#fffdf8" '
     'font-family="sans-serif" font-weight="bold">高考考点</text>'
     + ''.join('<circle cx="' + str(150 + k * 100) + '" cy="342" r="19" fill="' + c + '"/>'
               for k, c in enumerate((C['blue'], C['red'], C['green'], C['orange'],
                                      '#e8c67a', C['pinkD'], C['teal'])))
     + '<rect y="314" width="800" height="8" fill="rgba(0,0,0,0.08)"/>'
     + vignette(0.24))
add('考场外', b, lin_grad('sky', EXAM_SKY))


# ---- 客厅 / 餐桌 / 幼儿园 ----

b = (room(WARM_WALL, C['wood'])
     + '<rect x="240" y="90" width="300" height="170" rx="10" fill="#3d4560" stroke="#8a6a48" stroke-width="10"/>'
     + '<circle cx="300" cy="300" r="26" fill="' + C['orange'] + '"/>'
     + '<circle cx="360" cy="330" r="20" fill="' + C['blue'] + '"/>'
     + '<rect x="420" y="290" width="70" height="46" rx="10" fill="#e8c67a"/>'
     + sofa(560, 300, '#c98a6a')
     + plant(90, 386, 0.85)
     + vignette(0.2))
add('客厅', b, lin_grad('wall', WARM_WALL))

b = (lin_grad('wall', [('#f5e8d5', 0), ('#e8d0b0', 100)])
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<ellipse cx="400" cy="400" rx="360" ry="130" fill="#a08050"/>'
     + '<ellipse cx="400" cy="382" rx="330" ry="110" fill="#e8c88f"/>'
     + '<ellipse cx="270" cy="352" rx="92" ry="32" fill="#fffdf8"/>'
     + '<circle cx="258" cy="344" r="15" fill="#c96f5a"/><circle cx="288" cy="338" r="12" fill="#7ea06f"/>'
     + '<ellipse cx="520" cy="356" rx="76" ry="28" fill="#8fb4d0"/>'
     + steam(396, 372) + steam(510, 348)
     + vignette(0.2))
add('餐桌', b, lin_grad('wall', [('#f5e8d5', 0), ('#e8d0b0', 100)]))

b = (lin_grad('sky', [('#cfe3ee', 0), ('#ffe9bd', 100)])
     + '<rect width="800" height="300" fill="url(#sky)"/>'
     + '<rect y="300" width="800" height="200" fill="#c2b287"/>'
     + '<rect x="120" y="180" width="560" height="130" rx="16" fill="#f2b8a0"/>'
     + '<rect x="120" y="180" width="560" height="34" rx="14" fill="#e0995f"/>'
     + ''.join('<circle cx="' + str(170 + k * 46) + '" cy="197" r="9" fill="'
               + ('#fffdf8' if k % 2 == 0 else '#ffe9bd') + '"/>' for k in range(11))
     + '<path d="M600,310 a80,80 0 0 1 160,0z" fill="#93aec6"/>'
     + '<circle cx="260" cy="150" r="34" fill="#a8c09a"/><circle cx="520" cy="145" r="30" fill="#f2b8a0"/>'
     + vignette(0.18))
add('幼儿园门口', b, lin_grad('sky', [('#cfe3ee', 0), ('#ffe9bd', 100)]))

b = (lin_grad('wall', [('#fdeee0', 0), ('#e8c88f', 100)])
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="430" width="800" height="70" fill="#c2b287"/>'
     + ''.join('<rect x="' + str(90 + k * 120) + '" y="300" width="90" height="70" rx="10" fill="'
               + ['#f2b8a0', '#a8d0c0', '#f4d98a'][k % 3] + '" stroke="#fffdf8" stroke-width="6"/>'
               for k in range(5))
     + '<rect x="60" y="120" width="240" height="110" rx="8" fill="#fffdf8" stroke="#a08050" stroke-width="8"/>'
     + ''.join('<rect x="' + str(80 + k * 56) + '" y="136" width="44" height="56" rx="4" fill="'
               + ['#93aec6', '#f2b8a0', '#a8c09a'][k % 3] + '"/>' for k in range(4))
     + plant(700, 380)
     + vignette(0.18))
add('幼儿园', b, lin_grad('wall', [('#fdeee0', 0), ('#e8c88f', 100)]))

b = (room(HALL_WALL, '#b99670')
     + '<rect x="240" y="70" width="300" height="360" rx="10" fill="#c9a86f"/>'
     + '<rect x="262" y="92" width="262" height="320" fill="#b8935f"/>'
     + '<rect x="452" y="248" width="12" height="42" rx="5" fill="#e8c67a"/>'
     + '<polygon points="274,412 536,412 620,500 180,500" fill="#fff3d6" opacity="0.4"/>'
     + '<rect x="130" y="340" width="84" height="92" rx="8" fill="#9db6b2"/>'
     + vignette(0.26))
add('家门口', b, lin_grad('wall', HALL_WALL))


b, d = stage('#3a2f3c')
add('礼堂', b, d)
b, d = stage('#31404e')
add('大学礼堂', b, d)

WED_WALL = '#3a2f3c'
b = ('<rect width="800" height="500" fill="' + WED_WALL + '"/>'
     + '<path d="M130,480 L130,150 a270,150 0 0 1 540,0 L670,480" stroke="#e8b98a" '
     'stroke-width="15" fill="none"/>'
     + ''.join('<circle cx="' + str(x) + '" cy="' + str(y) + '" r="15" fill="' + C['pink'] + '"/>'
               + '<circle cx="' + str(x + 11) + '" cy="' + str(y - 13) + '" r="9" fill="' + C['white'] + '"/>'
               for x, y in ((140, 420), (140, 310), (140, 210), (660, 420), (660, 310), (660, 210)))
     + glow(400, 70, 110)
     + ''.join('<circle cx="' + str(290 + k * 55) + '" cy="' + str(90 + (k % 2) * 26)
               + '" r="6" fill="' + C['gold'] + '"/>' for k in range(5))
     + '<rect y="440" width="800" height="60" fill="#241f28"/>'
     + vignette(0.3))
add('婚礼现场', b, rad_grad('glow', C['gold'], 0.5))

b, d = shelves()
add('商场', b, d)
add('超市', b, d)

VISIT_WALL = [('#efe6d2', 0), ('#e0d0b5', 100)]
b = (lin_grad('wall', VISIT_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="390" width="800" height="110" fill="#c8a678"/>'
     + '<rect x="100" y="300" width="310" height="94" rx="14" fill="#8a6a48"/>'
     + '<rect x="100" y="276" width="310" height="38" rx="10" fill="#a3805a"/>'
     + '<ellipse cx="255" cy="278" rx="74" ry="17" fill="#d9c9a8"/>'
     + '<circle cx="222" cy="268" r="16" fill="#c96f5a"/><circle cx="256" cy="262" r="16" fill="#e8c67a"/>'
     + '<circle cx="290" cy="270" r="16" fill="#7ea06f"/>'
     + pics(520, 100, 2)
     + plant(660, 386)
     + vignette(0.22))
add('亲戚家', b, lin_grad('wall', VISIT_WALL))

HOTEL_WALL = [('#4a3540', 0), ('#3a2c36', 100)]
b = (lin_grad('wall', HOTEL_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + glow(400, 90, 160)
     + '<circle cx="400" cy="90" r="30" fill="#e8c67a"/>'
     + ''.join('<line x1="' + str(x) + '" y1="106" x2="' + str(x - 16) + '" y2="150" '
               'stroke="#e8c67a" stroke-width="3"/>' for x in (352, 400, 448))
     + '<ellipse cx="400" cy="400" rx="250" ry="80" fill="#8f4b56"/>'
     + '<ellipse cx="400" cy="392" rx="250" ry="72" fill="#b25e6a"/>'
     + '<ellipse cx="400" cy="388" rx="160" ry="46" fill="#fffdf8"/>'
     + vignette(0.3))
add('酒店', b, lin_grad('wall', HOTEL_WALL) + rad_grad('glow', C['glow'], 0.55))

REST_WALL = [('#4a3b3f', 0), ('#382d31', 100)]
b = (lin_grad('wall', REST_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + glow(400, 80, 150)
     + '<circle cx="400" cy="80" r="26" fill="#e8c67a"/>'
     + '<ellipse cx="400" cy="380" rx="310" ry="105" fill="#8f4b56"/>'
     + '<ellipse cx="400" cy="372" rx="310" ry="97" fill="#b25e6a"/>'
     + '<ellipse cx="400" cy="368" rx="190" ry="55" fill="#fffdf8"/>'
     + ''.join('<circle cx="' + str(336 + k * 42) + '" cy="360" r="12" fill="'
               + [C['red'], C['green'], '#e8c67a'][k % 3] + '"/>' for k in range(3))
     + vignette(0.28))
add('餐厅', b, lin_grad('wall', REST_WALL) + rad_grad('glow', C['glow'], 0.55))

DORM_WALL = [('#dfe6ea', 0), ('#c8d4da', 100)]
b = (lin_grad('wall', DORM_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="440" width="800" height="60" fill="#b8c4ca"/>'
     + '<rect x="90" y="110" width="250" height="24" rx="6" fill="#a08050"/>'
     + '<rect x="90" y="252" width="250" height="24" rx="6" fill="#a08050"/>'
     + '<rect x="90" y="134" width="250" height="118" fill="#dce8f0"/>'
     + '<rect x="90" y="276" width="250" height="164" fill="#dce8f0"/>'
     + '<rect x="110" y="152" width="100" height="54" rx="6" fill="#93aec6"/>'
     + '<rect x="110" y="294" width="100" height="54" rx="6" fill="#f2b8a0"/>'
     + '<rect x="440" y="150" width="260" height="290" rx="8" fill="#fffdf8" stroke="#a08050" stroke-width="8"/>'
     + '<rect x="470" y="185" width="200" height="115" rx="6" fill="#a8c3d9"/>'
     + plant(730, 400, 0.85)
     + vignette(0.2))
add('宿舍', b, lin_grad('wall', DORM_WALL))

b = ('<rect width="800" height="500" fill="#e9eef0"/>'
     + '<rect x="280" y="20" width="240" height="460" rx="32" fill="#fffdf8" stroke="#2a2622" stroke-width="7"/>'
     + '<rect x="298" y="55" width="204" height="130" rx="16" fill="#48749f"/>'
     + '<text x="400" y="112" text-anchor="middle" font-size="24" fill="#cfe3ee" font-family="sans-serif">余额</text>'
     + '<text x="400" y="156" text-anchor="middle" font-size="32" fill="#fffdf8" '
     'font-family="sans-serif" font-weight="bold">¥ 8,888.00</text>'
     + ''.join('<rect x="312" y="' + str(y) + '" width="176" height="52" rx="10" fill="#eef3f6"/>'
               for y in (210, 285, 360))
     + ''.join('<circle cx="340" cy="' + str(y + 26) + '" r="14" fill="' + c + '"/>'
               for y, c in zip((210, 285, 360), (C['orange'], C['green'], C['blue']))))
add('银行App', b)

CALL_WALL = [('#3d4560', 0), ('#2c3450', 100)]
b = (lin_grad('wall', CALL_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect x="230" y="30" width="340" height="440" rx="28" fill="#fffdf8" stroke="#2a2622" stroke-width="7"/>'
     + '<rect x="250" y="62" width="300" height="350" rx="12" fill="#dce8f0"/>'
     + '<circle cx="400" cy="210" r="72" fill="#f7dcc3"/>'
     + '<path d="M346,194 q54,-44 108,0 q-4,-28 -54,-28 q-50,0 -54,28z" fill="#423d36"/>'
     + '<circle cx="378" cy="214" r="5.5" fill="#2a2622"/><circle cx="422" cy="214" r="5.5" fill="#2a2622"/>'
     + '<path d="M386,236 q14,10 28,0" stroke="#2a2622" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
     + '<circle cx="512" cy="372" r="44" fill="#f7dcc3"/>'
     + '<circle cx="499" cy="365" r="4.5" fill="#2a2622"/><circle cx="525" cy="365" r="4.5" fill="#2a2622"/>'
     + '<circle cx="400" cy="436" r="27" fill="#d95f5f"/>'
     + vignette(0.26))
add('视频通话', b, lin_grad('wall', CALL_WALL))

LIB_WALL = [('#f2ead8', 0), ('#e5d5ba', 100)]
b = (lin_grad('wall', LIB_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + ''.join('<rect x="' + str(x) + '" y="100" width="250" height="290" rx="6" fill="#fffdf8" '
               'stroke="#a08050" stroke-width="8"/>' for x in (70, 480))
     + ''.join('<rect x="' + str(x + 10) + '" y="' + str(y) + '" width="230" height="12" fill="#a08050"/>'
               for x, ys in ((70, (168, 246, 324)), (480, (168, 246, 324))) for y in ys)
     + ''.join('<rect x="' + str(x + 14 + k * 27) + '" y="' + str(y - 46) + '" width="20" height="46" fill="'
               + ['#c96f5a', '#93aec6', '#7ea06f', '#e8c67a'][(k + row) % 4] + '"/>'
               for x, ys in ((70, (168, 246, 324)), (480, (168, 246, 324)))
               for row, y in enumerate(ys) for k in range(8))
     + '<rect x="330" y="340" width="190" height="22" rx="6" fill="#a08050"/>'
     + vignette(0.18))
add('图书馆', b, lin_grad('wall', LIB_WALL))

OFFICE_SKY = [('#cfe3ee', 0), ('#e8f0f2', 100)]
b = (lin_grad('sky', OFFICE_SKY)
     + '<rect width="800" height="500" fill="url(#sky)"/>'
     + '<rect x="150" y="50" width="260" height="450" fill="#8fa8bd"/>'
     + ''.join('<rect x="' + str(162 + (k % 6) * 40) + '" y="' + str(70 + (k // 6) * 48)
               + '" width="32" height="36" fill="#d5e2ec"/>' for k in range(30))
     + '<rect x="440" y="130" width="220" height="370" fill="#a8bccd"/>'
     + ''.join('<rect x="' + str(452 + (k % 5) * 38) + '" y="' + str(148 + (k // 5) * 46)
               + '" width="28" height="32" fill="#d5e2ec"/>' for k in range(20))
     + '<rect y="460" width="800" height="40" fill="#c2b287"/>'
     + vignette(0.18))
add('写字楼', b, lin_grad('sky', OFFICE_SKY))

RENT_WALL = [('#f4ede2', 0), ('#e8dcc8', 100)]
b = (lin_grad('wall', RENT_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="400" width="800" height="100" fill="#d9c9b2"/>'
     + window(110, 60, 140, 110, '#cfe3ee')
     + '<rect x="420" y="240" width="280" height="70" rx="12" fill="#c9a86f"/>'
     + '<rect x="440" y="200" width="90" height="46" rx="10" fill="#8f9aa8"/>'
     + '<rect x="140" y="330" width="70" height="60" rx="6" fill="#9db6b2"/>'
     + plant(140, 330, 0.9)
     + pics(600, 90, 1)
     + vignette(0.2))
add('出租屋', b, lin_grad('wall', RENT_WALL))

BANK_WALL = [('#eef1f4', 0), ('#dfe6ea', 100)]
b = (lin_grad('wall', BANK_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="380" width="800" height="120" fill="#c3d6e2"/>'
     + '<rect x="100" y="290" width="600" height="30" rx="6" fill="#a8bccd"/>'
     + '<rect x="100" y="324" width="600" height="90" fill="#c3d6e2"/>'
     + ''.join('<rect x="' + str(140 + k * 130) + '" y="240" width="92" height="52" rx="8" fill="#48749f"/>'
               for k in range(4))
     + '<rect x="300" y="100" width="200" height="84" rx="8" fill="#fffdf8"/>'
     + '<text x="400" y="154" text-anchor="middle" font-size="34" fill="#48749f" '
     'font-family="sans-serif" font-weight="bold">¥</text>'
     + vignette(0.18))
add('银行', b, lin_grad('wall', BANK_WALL))

ART_WALL = [('#f2ead8', 0), ('#e5d5ba', 100)]
b = (lin_grad('wall', ART_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="400" width="800" height="100" fill="#d9c1a0"/>'
     + '<rect x="140" y="150" width="12" height="210" fill="#a08050"/>'
     + '<rect x="140" y="150" width="140" height="96" fill="#fffdf8" stroke="#a08050" stroke-width="6"/>'
     + '<path d="M172,216 q34,-56 68,0 q-34,34 -68,0z" fill="#93aec6"/>'
     + '<circle cx="270" cy="160" r="30" fill="#fffdf8"/>'
     + '<ellipse cx="270" cy="198" rx="26" ry="13" fill="#e0cbb2"/>'
     + ''.join('<rect x="' + str(520 + k * 60) + '" y="336" width="14" height="64" fill="' + c + '"/>'
               for k, c in enumerate((C['red'], C['orange'], C['green'], C['blue'])))
     + window(100, 60, 140, 110, '#cfe3ee')
     + vignette(0.2))
add('画室', b, lin_grad('wall', ART_WALL))

BARBER_WALL = [('#e9eef0', 0), ('#d8e0e3', 100)]
b = (lin_grad('wall', BARBER_WALL)
     + '<rect width="800" height="500" fill="url(#wall)"/>'
     + '<rect y="420" width="800" height="80" fill="#c3ccd0"/>'
     + '<rect x="180" y="90" width="210" height="160" rx="12" fill="#bcd0d6" stroke="#2a2622" stroke-width="8"/>'
     + '<rect x="270" y="290" width="100" height="150" rx="12" fill="#b25e6a"/>'
     + '<rect x="258" y="268" width="124" height="32" rx="10" fill="#a85560"/>'
     + '<rect x="580" y="110" width="26" height="250" fill="#fffdf8"/>'
     + ''.join('<path d="M593,' + str(y) + ' l26,20 l-26,20" stroke="' + c + '" stroke-width="9" fill="none"/>'
               for y, c in zip(range(120, 350, 46), (C['red'], C['white'], C['blue'], C['red'], C['white'])))
     + vignette(0.2))
add('理发店', b, lin_grad('wall', BARBER_WALL))


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    for name, content in S.items():
        save(name, content)
    print('scenes: %d 张氛围背景生成完毕' % len(S))


if __name__ == '__main__':
    main()
