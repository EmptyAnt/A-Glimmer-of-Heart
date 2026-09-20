# -*- coding: utf-8 -*-
"""
寸心 · 美术资产生成器
程序化生成全套 SVG 插画：5 体态立绘 + 9 表情贴片 + 45 场景背景
统一画风：温暖手绘扁平风（治愈系），与游戏 UI 米色/暖橘协调
用法：python tools/gen-assets.py
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')

# ---------- 调色板 ----------
C = {
    'cream': '#f7efe2', 'warm': '#f5e3cb', 'night': '#3d4560', 'dusk': '#4d5370',
    'wood': '#d9b98f', 'woodD': '#b99670', 'orange': '#e0995f', 'green': '#a8c09a',
    'greenD': '#7ea06f', 'blue': '#93aec6', 'blueD': '#6f8dab', 'red': '#d97b66',
    'skin': '#f7dcc3', 'hair': '#423d36', 'glow': '#ffd9a0', 'white': '#fffdf8',
    'ink': '#4a4238', 'pink': '#f2c9c0', 'pinkD': '#e8a49b', 'tile': '#e9f0f2',
    'night2': '#2c3450', 'gold': '#e8c67a', 'teal': '#7fb3ae',
}


def svg(w, h, body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">'
            '<defs>%s</defs>%s</svg>' % (w, h, defs, body))


def save(dir_name, name, content):
    d = os.path.join(OUT, dir_name)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(content)


# ============================================================
# 一、人物立绘（200x240，chibi 比例）
# ============================================================

SHADOW = '<ellipse cx="100" cy="226" rx="62" ry="10" fill="rgba(0,0,0,0.08)"/>'
BLUSH = '<ellipse cx="72" cy="94" rx="9" ry="5" fill="%s"/>' \
        '<ellipse cx="128" cy="94" rx="9" ry="5" fill="%s"/>' % (C['pink'], C['pink'])


def pose_xinshenger():
    """新生儿：裹在包被里的皱巴巴婴儿，闭眼"""
    body = SHADOW + (
        '<ellipse cx="100" cy="178" rx="88" ry="42" fill="%s"/>'  # 包被主体
        '<path d="M28,168 q30,-14 60,0 M60,190 q30,-14 60,0 M100,206 q30,-14 60,0" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55"/>'
        '<path d="M28,168 q72,-30 144,0 l0,-8 q-72,-30 -144,0 z" fill="%s"/>'  # 包被翻边
        '<circle cx="100" cy="102" r="46" fill="%s"/>'  # 头
        '<path d="M92,58 q10,-12 20,-2 q-6,4 -4,10" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'  # 发旋
        '<path d="M80,104 q7,-7 14,0 M108,104 q7,-7 14,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'  # 闭眼
        '<circle cx="101" cy="118" r="3" fill="%s"/>'  # 鼻
        '<path d="M92,126 q9,6 18,0" stroke="%s" stroke-width="3" fill="none" stroke-linecap="round"/>'
    ) % (C['white'], C['woodD'], '#f0e2ce', C['skin'], C['hair'], C['ink'], C['ink'], C['pinkD'])
    return svg(200, 240, body)


def pose_yinger(outfit_color='#a8c3d9'):
    """婴儿：坐着，连体衣"""
    body = SHADOW + (
        '<rect x="58" y="188" width="34" height="26" rx="13" fill="%s"/>'  # 腿
        '<rect x="108" y="188" width="34" height="26" rx="13" fill="%s"/>'
        '<ellipse cx="75" cy="216" rx="19" ry="8" fill="%s"/>'
        '<ellipse cx="125" cy="216" rx="19" ry="8" fill="%s"/>'
        '<rect x="55" y="128" width="90" height="72" rx="30" fill="%s"/>'  # 连体衣
        '<circle cx="100" cy="158" r="4" fill="%s"/><circle cx="100" cy="176" r="4" fill="%s"/>'
        '<rect x="38" y="140" width="22" height="52" rx="11" fill="%s"/>'  # 手臂
        '<rect x="140" y="140" width="22" height="52" rx="11" fill="%s"/>'
        '<circle cx="100" cy="92" r="50" fill="%s"/>'  # 头
        '<path d="M62,74 q38,-30 76,0 q-6,-16 -38,-16 q-32,0 -38,16z" fill="%s"/>'  # 稀疏头发
        '<circle cx="82" cy="96" r="5" fill="%s"/><circle cx="118" cy="96" r="5" fill="%s"/>'
        '<path d="M90,112 q10,8 20,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="70" cy="106" rx="8" ry="5" fill="%s"/><ellipse cx="130" cy="106" rx="8" ry="5" fill="%s"/>'
    ) % (outfit_color, outfit_color, C['skin'], C['skin'], outfit_color, C['white'],
         C['white'], outfit_color, outfit_color, C['skin'], C['hair'],
         C['ink'], C['ink'], C['pinkD'], C['pink'], C['pink'])
    return svg(200, 240, body)


def pose_youer():
    """幼儿：站立，背带裤，呆毛"""
    body = SHADOW + (
        '<rect x="72" y="196" width="22" height="30" rx="10" fill="%s"/>'  # 腿
        '<rect x="106" y="196" width="22" height="30" rx="10" fill="%s"/>'
        '<ellipse cx="83" cy="228" rx="15" ry="7" fill="%s"/>'
        '<ellipse cx="117" cy="228" rx="15" ry="7" fill="%s"/>'
        '<rect x="60" y="128" width="80" height="76" rx="24" fill="%s"/>'  # 背带裤
        '<rect x="72" y="112" width="12" height="26" rx="5" fill="%s"/>'
        '<rect x="116" y="112" width="12" height="26" rx="5" fill="%s"/>'
        '<rect x="46" y="132" width="20" height="54" rx="10" fill="%s"/>'  # 手臂张开
        '<rect x="134" y="132" width="20" height="54" rx="10" fill="%s"/>'
        '<circle cx="100" cy="82" r="48" fill="%s"/>'
        '<path d="M96,32 q6,-14 16,-8 q-8,2 -6,10z" fill="%s"/>'  # 呆毛
        '<path d="M56,70 q44,-36 88,0 q-10,-24 -44,-24 q-34,0 -44,24z" fill="%s"/>'
        '<circle cx="82" cy="88" r="5.5" fill="%s"/><circle cx="118" cy="88" r="5.5" fill="%s"/>'
        '<path d="M90,104 q10,9 20,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="66" cy="98" rx="9" ry="5.5" fill="%s"/><ellipse cx="134" cy="98" rx="9" ry="5.5" fill="%s"/>'
    ) % (C['skin'], C['skin'], C['orange'], C['orange'], '#7ea06f', '#7ea06f',
         C['skin'], C['skin'], C['skin'], C['hair'], C['hair'], C['hair'],
         C['ink'], C['ink'], C['pinkD'], C['pink'], C['pink'])
    return svg(200, 240, body)


def pose_shaonian(uniform='#fffdf8', collar=C['red'], pants='#3f4a63'):
    """少年：校服小学生"""
    body = SHADOW + (
        '<rect x="76" y="182" width="18" height="44" rx="8" fill="%s"/>'  # 腿
        '<rect x="106" y="182" width="18" height="44" rx="8" fill="%s"/>'
        '<ellipse cx="85" cy="228" rx="14" ry="6" fill="%s"/>'
        '<ellipse cx="115" cy="228" rx="14" ry="6" fill="%s"/>'
        '<rect x="62" y="118" width="76" height="70" rx="18" fill="%s"/>'  # 上衣
        '<path d="M100,118 l-14,16 14,10 14,-10z" fill="%s"/>'  # 领口
        '<rect x="46" y="126" width="18" height="52" rx="9" fill="%s"/>'
        '<rect x="136" y="126" width="18" height="52" rx="9" fill="%s"/>'
        '<path d="M84,118 q16,10 32,0 l0,10 q-16,8 -32,0z" fill="%s"/>'  # 红领巾
        '<circle cx="100" cy="76" r="44" fill="%s"/>'
        '<path d="M58,66 q42,-34 84,0 q2,-10 -8,-16 q-24,-16 -52,-6 q-20,8 -24,22z" fill="%s"/>'
        '<circle cx="83" cy="82" r="5" fill="%s"/><circle cx="117" cy="82" r="5" fill="%s"/>'
        '<path d="M91,96 q9,7 18,0" stroke="%s" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="68" cy="92" rx="8" ry="5" fill="%s"/><ellipse cx="132" cy="92" rx="8" ry="5" fill="%s"/>'
    ) % (pants, pants, C['ink'], C['ink'], uniform, collar, uniform, uniform,
         collar, C['skin'], C['hair'], C['ink'], C['ink'], C['pinkD'], C['pink'], C['pink'])
    return svg(200, 240, body)


def pose_qingnian(jacket='#6f8dab', tee=C['white'], pants='#4a5570'):
    """青年：休闲装"""
    body = SHADOW + (
        '<rect x="74" y="178" width="20" height="50" rx="9" fill="%s"/>'
        '<rect x="106" y="178" width="20" height="50" rx="9" fill="%s"/>'
        '<ellipse cx="84" cy="230" rx="15" ry="6" fill="%s"/>'
        '<ellipse cx="116" cy="230" rx="15" ry="6" fill="%s"/>'
        '<rect x="60" y="112" width="80" height="74" rx="20" fill="%s"/>'  # 外套
        '<path d="M100,112 l0,74" stroke="rgba(0,0,0,0.12)" stroke-width="3"/>'
        '<rect x="84" y="112" width="32" height="50" rx="10" fill="%s"/>'  # 内搭
        '<rect x="42" y="120" width="20" height="58" rx="10" fill="%s"/>'
        '<rect x="138" y="120" width="20" height="58" rx="10" fill="%s"/>'
        '<circle cx="100" cy="72" r="42" fill="%s"/>'
        '<path d="M60,64 q40,-36 80,0 q4,-12 -6,-18 q-26,-18 -54,-6 q-18,8 -20,24z" fill="%s"/>'
        '<circle cx="84" cy="78" r="5" fill="%s"/><circle cx="116" cy="78" r="5" fill="%s"/>'
        '<path d="M92,92 q8,6 16,0" stroke="%s" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="66" cy="88" rx="8" ry="5" fill="%s"/><ellipse cx="134" cy="88" rx="8" ry="5" fill="%s"/>'
    ) % (pants, pants, C['ink'], C['ink'], jacket, tee, jacket, jacket,
         C['skin'], C['hair'], C['ink'], C['ink'], C['pinkD'], C['pink'], C['pink'])
    return svg(200, 240, body)


# ============================================================
# 二、表情贴片（100x100 圆形情绪气泡）
# ============================================================

def expr_base(extra=''):
    return ('<circle cx="50" cy="50" r="44" fill="#f9ead0" stroke="%s" stroke-width="4"/>'
            '<ellipse cx="33" cy="60" rx="7" ry="4.5" fill="%s"/>'
            '<ellipse cx="67" cy="60" rx="7" ry="4.5" fill="%s"/>%s'
            ) % (C['orange'], C['pink'], C['pink'], extra)


def expr(maker):
    return svg(100, 100, expr_base(maker))


EXPRS = {
    '平静': '<circle cx="36" cy="44" r="4.5" fill="%s"/><circle cx="64" cy="44" r="4.5" fill="%s"/>'
           '<path d="M38,66 q12,9 24,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           % (C['ink'], C['ink'], C['ink']),
    '熟睡': '<path d="M30,44 q6,6 12,0 M58,44 q6,6 12,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<path d="M40,66 q10,7 20,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<text x="72" y="26" font-size="16" fill="%s" font-family="sans-serif" font-weight="bold">z</text>'
           '<text x="82" y="16" font-size="11" fill="%s" font-family="sans-serif">z</text>'
           % (C['ink'], C['ink'], C['blueD'], C['blueD']),
    '大哭': '<path d="M30,40 q6,-8 12,0 M58,40 q6,-8 12,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<ellipse cx="50" cy="62" rx="9" ry="11" fill="%s"/>'
           '<path d="M28,52 q-6,10 2,16 M72,52 q6,10 -2,16" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>'
           % (C['ink'], '#5a7fa8', '#5a7fa8'),
    '哭': '<circle cx="36" cy="44" r="4.5" fill="%s"/><circle cx="64" cy="44" r="4.5" fill="%s"/>'
         '<path d="M38,68 q12,-8 24,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
         '<path d="M64,50 q6,10 0,14 q-6,-4 0,-14" fill="%s"/>'
         % (C['ink'], C['ink'], C['ink'], '#5a7fa8'),
    '委屈': '<path d="M32,42 q5,-6 10,-1 M58,41 q5,-6 10,-1" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<path d="M39,70 q11,-9 22,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<path d="M30,52 q-4,8 1,12 M70,52 q4,8 -1,12" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           % (C['ink'], C['ink'], '#5a7fa8'),
    '笑': '<path d="M30,42 q6,-8 12,0 M58,42 q6,-8 12,0" stroke="%s" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
         '<path d="M34,60 q16,16 32,0 q-4,14 -16,14 q-12,0 -16,-14z" fill="%s"/>'
         % (C['ink'], C['ink']),
    '生气': '<path d="M28,36 l14,7 M72,36 l-14,7" stroke="%s" stroke-width="4.5" stroke-linecap="round"/>'
           '<circle cx="37" cy="50" r="4.5" fill="%s"/><circle cx="63" cy="50" r="4.5" fill="%s"/>'
           '<path d="M38,68 q12,-8 24,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           % (C['ink'], C['ink'], C['ink'], C['ink']),
    '专注': '<path d="M31,42 l12,3 M69,42 l-12,3" stroke="%s" stroke-width="4" stroke-linecap="round"/>'
           '<circle cx="38" cy="50" r="4" fill="%s"/><circle cx="62" cy="50" r="4" fill="%s"/>'
           '<rect x="40" y="66" width="20" height="4" rx="2" fill="%s"/>'
           % (C['ink'], C['ink'], C['ink'], C['ink']),
    '不适': '<path d="M32,44 q5,-6 10,0 M58,44 q5,-6 10,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<path d="M38,64 q6,-6 12,0 q6,6 12,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>'
           '<circle cx="74" cy="26" r="9" fill="%s"/><rect x="71" y="26" width="6" height="14" rx="3" fill="#c9d6db"/>'
           % (C['ink'], C['ink'], '#7fb3ae'),
}


# ============================================================
# 三、场景背景板（800x500）
# ============================================================

GLOW_DEFS = ('<radialGradient id="glow"><stop offset="0%%" stop-color="%s" stop-opacity="0.55"/>'
             '<stop offset="100%%" stop-color="%s" stop-opacity="0"/></radialGradient>'
             % (C['glow'], C['glow']))
NIGHT_DEFS = ('<radialGradient id="moonlite"><stop offset="0%%" stop-color="#aebdd8" stop-opacity="0.35"/>'
              '<stop offset="100%%" stop-color="#aebdd8" stop-opacity="0"/></radialGradient>')


def room(wall, floor, extra_base=''):
    return ('<rect width="800" height="350" fill="%s"/>'
            '<rect y="350" width="800" height="150" fill="%s"/>'
            '<rect y="344" width="800" height="8" fill="rgba(0,0,0,0.07)"/>%s'
            ) % (wall, floor, extra_base)


def window_rect(x, y, w, h, sky, frame=C['white'], bars=True):
    b = ''
    if bars:
        b = ('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="6"/>'
             '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="6"/>'
             ) % (x + w / 2, y, x + w / 2, y + h, frame, x, y + h / 2, x + w, y + h / 2, frame)
    return '<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="%s" stroke="%s" stroke-width="8"/>%s' \
           % (x, y, w, h, sky, frame, b)


def sofa(x, y, c):
    return ('<rect x="%d" y="%d" width="230" height="86" rx="16" fill="%s"/>'
            '<rect x="%d" y="%d" width="96" height="52" rx="12" fill="%s" opacity="0.85"/>'
            '<rect x="%d" y="%d" width="96" height="52" rx="12" fill="%s" opacity="0.85"/>'
            '<rect x="%d" y="%d" width="34" height="120" rx="14" fill="%s"/>'
            '<rect x="%d" y="%d" width="34" height="120" rx="14" fill="%s"/>'
            ) % (x, y, c, x + 18, y - 32, c, x + 118, y - 32, c,
                 x - 18, y - 18, c, x + 216, y - 18, c)


def lamp(x, y, on=True, r=170):
    if not on:
        return ('<rect x="%d" y="%d" width="10" height="120" rx="5" fill="%s"/>'
                '<path d="M%d,%d l-34,26 h68z" fill="%s"/>'
                ) % (x - 5, y, C['woodD'], x, y - 26, C['dusk'])
    return ('<circle cx="%d" cy="%d" r="%d" fill="url(#glow)"/>'
            '<rect x="%d" y="%d" width="10" height="120" rx="5" fill="%s"/>'
            '<path d="M%d,%d l-36,28 h72z" fill="%s"/>'
            '<circle cx="%d" cy="%d" r="10" fill="%s"/>'
            ) % (x, y - 20, r, x - 5, y, C['woodD'], x, y - 28, C['orange'], x, y - 28, C['glow'])


def framed_pics(x, y, n=2):
    out = ''
    for k in range(n):
        out += ('<rect x="%d" y="%d" width="52" height="42" rx="4" fill="%s" stroke="%s" stroke-width="4"/>'
                '<circle cx="%d" cy="%d" r="8" fill="%s"/>'
                ) % (x + k * 70, y, C['white'], C['woodD'], x + 26 + k * 70, y + 21,
                     ['#a8c09a', '#93aec6', '#e0995f'][k % 3])
    return out


def plant(x, y, s=1.0):
    return ('<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="%s"/>'
            '<path d="M%d,%d q-26,-34 -6,-56 q22,16 6,56z" fill="%s"/>'
            '<path d="M%d,%d q26,-30 8,-54 q-24,14 -8,54z" fill="%s"/>'
            ) % (x, y, 46 * s, 44 * s, C['orange'],
                 x + 23 * s, y - 2, C['greenD'], x + 23 * s, y - 2, C['green'])


def bed_hospital(x, y):
    return ('<rect x="%d" y="%d" width="200" height="20" rx="6" fill="%s"/>'
            '<rect x="%d" y="%d" width="200" height="34" rx="10" fill="%s"/>'
            '<rect x="%d" y="%d" width="14" height="70" fill="%s"/>'
            '<rect x="%d" y="%d" width="14" height="70" fill="%s"/>'
            '<rect x="%d" y="%d" width="90" height="26" rx="8" fill="%s"/>'
            ) % (x, y, C['woodD'], x, y - 22, C['white'], x + 6, y + 20, C['ink'],
                 x + 180, y + 20, C['ink'], x + 8, y - 40, C['blue'])


SCENES = {}

SCENES['产房'] = room('#f2e4e4', '#d8c4c4', bed_hospital(80, 330)) + \
    '<circle cx="600" cy="180" r="140" fill="url(#glow)"/>' + \
    '<rect x="540" y="240" width="130" height="60" rx="14" fill="%s"/>' % C['white'] + \
    '<rect x="556" y="220" width="98" height="34" rx="12" fill="#f7e8ea"/>' + \
    '<rect x="120" y="120" width="90" height="26" rx="6" fill="#e8d5d5"/>' + \
    '<circle cx="640" cy="140" r="46" fill="#f7d7d7"/>' + GLOW_DEFS

SCENES['家中'] = room(C['cream'], C['wood']) + \
    window_rect(90, 70, 170, 130, '#cfe3ee') + \
    '<path d="M96,70 q10,64 0,130 M250,70 q-10,64 0,130" stroke="#e8b98a" stroke-width="10" fill="none"/>' + \
    framed_pics(560, 90, 2) + sofa(430, 300, '#d98a6a') + \
    plant(120, 380) + '<rect x="700" y="380" width="70" height="60" rx="6" fill="#b99670"/>'

SCENES['医院'] = room('#e6efec', '#cfdedd') + \
    '<rect x="70" y="60" width="60" height="180" rx="4" fill="%s"/>' % C['white'] + \
    ''.join('<line x1="70" y1="%d" x2="130" y2="%d" stroke="#c3d6d2" stroke-width="3"/>' % (y, y)
            for y in (100, 140, 180, 220)) + \
    bed_hospital(220, 330) + \
    '<rect x="560" y="200" width="12" height="150" fill="%s"/>' % C['ink'] + \
    '<path d="M566,200 l-24,44 h48z" fill="#f2d5d5"/>' + \
    '<rect x="650" y="290" width="110" height="70" rx="8" fill="%s"/>' % C['white']

SCENES['商场'] = ('<rect width="800" height="500" fill="#f3e9dc"/>') + \
    ''.join('<rect x="%d" y="%d" width="560" height="14" rx="4" fill="%s"/>' % (120, y, '#e0cbb2')
            for y in (140, 230, 320)) + \
    ''.join('<rect x="%d" y="%d" width="46" height="58" rx="6" fill="%s"/>' % (140 + k * 72, y - 62,
            ['#e8a464', '#a8c09a', '#93aec6', '#d97b66', '#e8c67a'][(k + yi) % 5])
            for yi, y in enumerate((200, 290, 380)) for k in range(7)) + \
    '<rect x="0" y="430" width="800" height="70" fill="#efe3d2"/>'

SCENES['家中·深夜'] = room(C['night'], '#333b52', '') + \
    lamp(620, 300, True, 190) + \
    '<rect x="90" y="70" width="150" height="110" rx="4" fill="#2c3450" stroke="#556080" stroke-width="6"/>' + \
    ''.join('<circle cx="%d" cy="%d" r="3" fill="#dfe6f5"/>' % (130 + k * 26, 100 + (k % 3) * 22)
            for k in range(5)) + \
    sofa(180, 320, '#5a5f7d') + plant(560, 396, 0.9) + GLOW_DEFS

SCENES['家中·凌晨'] = ('<rect width="800" height="500" fill="%s"/>' % C['night2']) + NIGHT_DEFS + \
    '<circle cx="640" cy="110" r="42" fill="#e8ecf5"/><circle cx="626" cy="100" r="38" fill="%s"/>' % C['night2'] + \
    '<circle cx="640" cy="110" r="170" fill="url(#moonlite)"/>' + \
    window_rect(80, 60, 160, 120, '#232a42', '#556080') + \
    sofa(400, 330, '#4c5474') + \
    '<circle cx="220" cy="330" r="120" fill="url(#glow)" opacity="0.35"/>' + \
    lamp(220, 340, True, 120)

SCENES['家中·厨房'] = ('<rect width="800" height="360" fill="%s"/>' % C['tile']) + \
    ''.join('<line x1="%d" y1="0" x2="%d" y2="360" stroke="#d7e2e5" stroke-width="3"/>' % (x, x)
            for x in range(80, 800, 110)) + \
    ''.join('<line x1="0" y1="%d" x2="800" y2="%d" stroke="#d7e2e5" stroke-width="3"/>' % (y, y)
            for y in (90, 180, 270)) + \
    '<rect y="360" width="800" height="140" fill="%s"/>' % C['woodD'] + \
    '<rect x="480" y="120" width="220" height="90" rx="10" fill="%s"/>' % C['ink'] + \
    '<rect x="300" y="330" width="260" height="30" fill="#8899a6"/>' + \
    '<rect x="330" y="360" width="60" height="20" rx="4" fill="#5a6673"/><rect x="430" y="360" width="60" height="20" rx="4" fill="#5a6673"/>' + \
    '<ellipse cx="410" cy="322" rx="70" ry="18" fill="%s"/>' % C['ink'] + \
    '<path d="M380,300 q10,-40 0,-70 M420,300 q-10,-45 0,-80 M450,305 q8,-35 0,-60" stroke="#e6eef0" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8"/>'

SCENES['家中·清晨'] = room('#f9edd8', C['wood']) + \
    '<rect width="800" height="500" fill="url(#glow)" opacity="0.5"/>' + GLOW_DEFS + \
    window_rect(430, 60, 220, 160, '#ffe9bd') + \
    '<path d="M446,220 L560,80 l40,0 l-90,140z" fill="#fff3d6" opacity="0.75"/>' + \
    sofa(120, 310, '#d98a6a') + plant(680, 390)

SCENES['酒店'] = ('<rect width="800" height="500" fill="#4a3540"/>') + \
    '<circle cx="400" cy="90" r="60" fill="url(#glow)"/><circle cx="400" cy="90" r="26" fill="%s"/>' % C['gold'] + \
    ''.join('<line x1="%d" y1="104" x2="%d" y2="150" stroke="%s" stroke-width="3"/>' % (x, x - 14, C['gold'])
            for x in (356, 400, 444)) + \
    '<ellipse cx="400" cy="400" rx="230" ry="70" fill="#8f4b56"/>' + \
    '<ellipse cx="400" cy="392" rx="230" ry="62" fill="#b25e6a"/>' + \
    '<ellipse cx="400" cy="390" rx="150" ry="40" fill="%s"/>' % C['white'] + GLOW_DEFS

SCENES['亲戚家'] = room('#efe6d2', '#d3b995') + \
    '<rect x="100" y="300" width="300" height="90" rx="14" fill="#8a6a48"/>' + \
    '<rect x="100" y="280" width="300" height="34" rx="10" fill="#a3805a"/>' + \
    '<ellipse cx="250" cy="282" rx="70" ry="16" fill="#c9a86f"/>' + \
    '<circle cx="220" cy="272" r="16" fill="#d97b66"/><circle cx="252" cy="268" r="16" fill="#e8c67a"/><circle cx="282" cy="274" r="16" fill="#a8c09a"/>' + \
    framed_pics(520, 90, 2) + plant(660, 380)

SCENES['超市'] = ('<rect width="800" height="500" fill="#f3ece0"/>') + \
    ''.join('<rect x="60" y="%d" width="680" height="16" rx="6" fill="%s"/>' % (y, '#dcc8ae')
            for y in (170, 270, 370)) + \
    ''.join('<rect x="%d" y="%d" width="56" height="64" rx="8" fill="%s"/>' % (90 + k * 90, y - 68,
            ['#e8a464', '#a8c09a', '#93aec6', '#d97b66', '#7fb3ae'][(k + row) % 5])
            for row, y in enumerate((238, 338, 438)) for k in range(7)) + \
    '<rect y="440" width="800" height="60" fill="#efe6d6"/>'

SCENES['公园'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<circle cx="660" cy="90" r="46" fill="#ffe9bd"/>' + \
    '<rect y="300" width="800" height="200" fill="#a8c09a"/>' + \
    '<path d="M0,380 q400,-40 800,20 l0,100 l-800,0z" fill="#c2b287"/>' + \
    '<rect x="150" y="240" width="14" height="110" fill="#8a6a48"/>' + \
    '<circle cx="157" cy="210" r="62" fill="%s"/><circle cx="110" cy="240" r="44" fill="#8db07e"/><circle cx="205" cy="245" r="40" fill="#8db07e"/>' % C['green'] + \
    '<path d="M480,350 a90,90 0 0 1 180,0z" fill="#d97b66"/>' + \
    '<rect x="480" y="350" width="180" height="14" rx="7" fill="%s"/>' % C['orange'] + \
    '<rect x="556" y="364" width="12" height="60" fill="%s"/>' % C['woodD']

SCENES['客厅'] = room(C['cream'], C['wood']) + \
    '<rect x="240" y="90" width="300" height="170" rx="10" fill="%s" stroke="%s" stroke-width="10"/>' % (C['night'], '#8a6a48') + \
    '<circle cx="300" cy="300" r="26" fill="' + C['orange'] + '"/><circle cx="360" cy="330" r="20" fill="#93aec6"/><rect x="420" y="290" width="70" height="46" rx="10" fill="#e8c67a"/>' + \
    sofa(560, 300, '#d98a6a') + plant(90, 386, 0.85)

SCENES['餐桌'] = room('#f5e8d5', C['wood']) + \
    '<ellipse cx="400" cy="360" rx="320" ry="110" fill="%s"/>' % C['woodD'] + \
    '<ellipse cx="400" cy="345" rx="300" ry="95" fill="#e8c88f"/>' + \
    '<ellipse cx="280" cy="330" rx="86" ry="30" fill="%s"/>' % C['white'] + \
    '<circle cx="270" cy="322" r="14" fill="#d97b66"/><circle cx="298" cy="318" r="12" fill="#a8c09a"/>' + \
    '<ellipse cx="500" cy="340" rx="70" ry="26" fill="#8fb4d0"/>' + \
    '<rect x="386" y="300" width="28" height="40" rx="8" fill="#d97b66"/>'

SCENES['幼儿园门口'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<circle cx="140" cy="80" r="40" fill="#ffe9bd"/>' + \
    '<rect y="300" width="800" height="200" fill="#c2b287"/>' + \
    '<rect x="120" y="180" width="560" height="130" rx="16" fill="#f2b8a0"/>' + \
    '<rect x="120" y="180" width="560" height="34" rx="14" fill="#e0995f"/>' + \
    ''.join('<circle cx="%d" cy="197" r="9" fill="%s"/>' % (170 + k * 46, ['#fffdf8', '#ffe9bd'][k % 2])
            for k in range(11)) + \
    '<path d="M600,310 a80,80 0 0 1 160,0z" fill="#93aec6"/>' + \
    '<circle cx="260" cy="150" r="34" fill="#a8c09a"/><circle cx="520" cy="145" r="30" fill="#f2b8a0"/>'

SCENES['幼儿园'] = room('#fdeee0', '#e8c88f') + \
    ''.join('<rect x="%d" y="300" width="90" height="70" rx="10" fill="%s" stroke="%s" stroke-width="6"/>'
            % (90 + k * 120, ['#f2b8a0', '#a8d0c0', '#f4d98a'][k % 3], C['white']) for k in range(5)) + \
    '<rect x="60" y="120" width="240" height="110" rx="8" fill="%s" stroke="%s" stroke-width="8"/>' % (C['white'], C['woodD']) + \
    ''.join('<rect x="%d" y="%d" width="44" height="56" rx="4" fill="%s"/>' % (80 + k * 56, 136,
            ['#93aec6', '#f2b8a0', '#a8c09a'][k % 3]) for k in range(4)) + \
    plant(700, 380)

SCENES['礼堂'] = ('<rect width="800" height="500" fill="#3a2f3c"/>') + \
    '<path d="M100,120 L100,420 M700,120 L700,420 M100,120 q300,90 600,0" stroke="%s" stroke-width="16" fill="none"/>' % '#a34a56' + \
    '<path d="M100,120 q300,90 600,0 l0,60 q-300,-80 -600,0z" fill="#c25560"/>' + \
    '<rect x="240" y="240" width="320" height="180" fill="#4a3b4a"/>' + \
    ''.join('<circle cx="%d" cy="80" r="12" fill="%s"/>' % (200 + k * 130, C['gold']) for k in range(4)) + \
    '<rect x="300" y="420" width="200" height="80" fill="#5a4a5a"/>'

SCENES['小学门口'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<rect y="300" width="800" height="200" fill="#c2b287"/>' + \
    '<rect x="90" y="150" width="620" height="130" fill="#e8d9c0"/>' + \
    '<rect x="90" y="120" width="620" height="40" rx="8" fill="%s"/>' % C['red'] + \
    '<text x="400" y="149" text-anchor="middle" font-size="26" fill="%s" font-family="sans-serif" font-weight="bold">实验小学</text>' % C['white'] + \
    '<rect x="360" y="190" width="80" height="90" fill="#7ea06f"/>' + \
    '<rect x="150" y="190" width="14" height="90" fill="#8a6a48"/><rect x="636" y="190" width="14" height="90" fill="#8a6a48"/>' + \
    '<circle cx="157" cy="120" r="0" fill="none"/>'

SCENES['家中·书桌'] = room('#f5e8d5', C['wood']) + \
    window_rect(90, 50, 150, 110, '#cfe3ee') + \
    '<rect x="420" y="270" width="300" height="24" rx="6" fill="%s"/>' % C['woodD'] + \
    '<rect x="440" y="294" width="20" height="120" fill="#8a6a48"/><rect x="680" y="294" width="20" height="120" fill="#8a6a48"/>' + \
    '<rect x="560" y="180" width="10" height="90" fill="%s"/>' % C['ink'] + \
    '<path d="M540,180 h50 l14,26 h-78z" fill="%s"/>' % C['orange'] + \
    '<circle cx="565" cy="172" r="90" fill="url(#glow)"/>' + \
    ''.join('<rect x="%d" y="246" width="34" height="24" rx="3" fill="%s"/>' % (460 + k * 42,
            ['#d97b66', '#93aec6', '#a8c09a'][k % 3]) for k in range(3)) + GLOW_DEFS

SCENES['教室'] = room('#eef0e4', '#c9b58e') + \
    '<rect x="150" y="70" width="500" height="160" rx="6" fill="#3f5a44" stroke="%s" stroke-width="10"/>' % C['woodD'] + \
    '<path d="M200,150 l80,-40 M300,180 l120,-70" stroke="%s" stroke-width="4" opacity="0.5"/>' % C['white'] + \
    ''.join('<rect x="%d" y="300" width="130" height="18" rx="5" fill="%s"/>' % (90 + k * 200, C['woodD'])
            for k in range(3)) + \
    ''.join('<rect x="%d" y="318" width="14" height="60" fill="#8a6a48"/>' % (104 + k * 200) for k in range(3))

SCENES['操场'] = ('<rect width="800" height="280" fill="#cfe3ee"/>') + \
    '<circle cx="120" cy="80" r="36" fill="#ffe9bd"/>' + \
    '<rect y="280" width="800" height="60" fill="#7ea06f"/>' + \
    '<path d="M0,340 h800 v40 h-800z" fill="#c96f4a"/>' + \
    ''.join('<rect x="%d" y="352" width="60" height="14" rx="4" fill="%s"/>' % (30 + k * 130, C['white'])
            for k in range(6)) + \
    '<rect x="600" y="170" width="14" height="120" fill="%s"/>' % C['ink'] + \
    '<rect x="600" y="170" width="110" height="80" rx="4" fill="none" stroke="%s" stroke-width="10"/>' % C['white'] + \
    plant(90, 396, 0.9)

SCENES['中学门口'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<rect y="300" width="800" height="200" fill="#c2b287"/>' + \
    '<rect x="80" y="130" width="640" height="150" fill="#d8cbb2"/>' + \
    '<rect x="80" y="100" width="640" height="44" rx="6" fill="#48749f"/>' + \
    '<text x="400" y="131" text-anchor="middle" font-size="26" fill="%s" font-family="sans-serif" font-weight="bold">第一中学</text>' % C['white'] + \
    '<rect x="350" y="174" width="100" height="106" fill="#5a6673"/>' + \
    ''.join('<circle cx="%d" cy="270" r="26" stroke="#5a6673" stroke-width="6" fill="none"/>' % (160 + k * 40)
            for k in range(4))

SCENES['家中·走廊'] = room('#efe3d0', '#d3b995') + \
    '<rect x="300" y="60" width="220" height="330" rx="8" fill="#c9a86f"/>' + \
    '<rect x="318" y="78" width="184" height="294" fill="#b8935f"/>' + \
    '<circle cx="480" cy="230" r="7" fill="%s"/>' % C['gold'] + \
    framed_pics(80, 100, 2) + plant(660, 386, 0.9)

SCENES['理发店'] = room('#e9eef0', '#cfd8db') + \
    '<rect x="180" y="100" width="200" height="150" rx="12" fill="#bcd0d6" stroke="%s" stroke-width="8"/>' % C['ink'] + \
    '<rect x="260" y="280" width="90" height="140" rx="12" fill="%s"/>' % C['red'] + \
    '<rect x="250" y="260" width="110" height="30" rx="10" fill="#a85560"/>' + \
    '<rect x="560" y="120" width="24" height="240" fill="%s"/>' % C['white'] + \
    ''.join('<path d="M572,%d l24,18 l-24,18" stroke="%s" stroke-width="8" fill="none"/>' % (y, c)
            for y, c in zip(range(130, 340, 52), (C['red'], C['white'], C['blue'], C['red'])))

SCENES['球场'] = ('<rect width="800" height="280" fill="#cfe3ee"/>') + \
    '<rect y="280" width="800" height="220" fill="#c98d5e"/>' + \
    '<path d="M300,340 a260,60 0 0 1 400,0z" fill="#d99a6a" opacity="0.7"/>' + \
    '<rect x="620" y="120" width="12" height="190" fill="%s"/>' % C['ink'] + \
    '<circle cx="626" cy="120" r="34" stroke="%s" stroke-width="8" fill="none"/>' % C['white'] + \
    '<circle cx="200" cy="200" r="22" fill="#e0995f"/>' + \
    '<path d="M188,190 l24,20 M212,190 l-24,20" stroke="%s" stroke-width="3"/>' % C['ink']

SCENES['考场'] = room('#eef0e4', '#c9b58e') + \
    '<rect x="200" y="60" width="400" height="60" rx="8" fill="%s"/>' % C['red'] + \
    '<text x="400" y="100" text-anchor="middle" font-size="28" fill="%s" font-family="sans-serif" font-weight="bold">诚信考试 光荣做人</text>' % C['white'] + \
    ''.join('<rect x="%d" y="%d" width="120" height="16" rx="4" fill="%s"/>' % (x, y, C['woodD'])
            for x, y in ((120, 240), (340, 240), (560, 240), (120, 360), (340, 360), (560, 360)))

SCENES['高中门口'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<rect y="300" width="800" height="200" fill="#c2b287"/>' + \
    '<rect x="60" y="90" width="680" height="190" fill="#d8cbb2"/>' + \
    '<rect x="60" y="60" width="680" height="50" rx="6" fill="#3f5a44"/>' + \
    '<text x="400" y="95" text-anchor="middle" font-size="28" fill="%s" font-family="sans-serif" font-weight="bold">厚德博学 追求卓越</text>' % C['white'] + \
    '<rect x="340" y="140" width="120" height="140" fill="#5a6673"/>' + \
    '<rect x="90" y="140" width="16" height="140" fill="#8a6a48"/><rect x="694" y="140" width="16" height="140" fill="#8a6a48"/>'

SCENES['家中·餐桌'] = SCENES['餐桌']

SCENES['画室'] = room('#f2ead8', '#d9c1a0') + \
    '<rect x="120" y="140" width="10" height="200" fill="%s"/>' % C['woodD'] + \
    '<rect x="120" y="140" width="130" height="90" fill="%s" stroke="%s" stroke-width="6"/>' % (C['white'], C['woodD']) + \
    '<path d="M150,200 q30,-50 60,0 q-30,30 -60,0z" fill="#93aec6"/>' + \
    '<circle cx="240" cy="150" r="30" fill="%s"/>' % C['white'] + \
    '<ellipse cx="240" cy="185" rx="24" ry="12" fill="#e0cbb2"/>' + \
    ''.join('<rect x="%d" y="330" width="14" height="60" fill="%s"/>' % (520 + k * 60, c)
            for k, c in enumerate((C['red'], C['orange'], C['green'], C['blue']))) + plant(90, 390)

SCENES['医院·走廊'] = room('#e6efec', '#cfdedd') + \
    '<rect x="80" y="300" width="300" height="26" rx="8" fill="#bcd0d6"/>' + \
    '<rect x="100" y="326" width="16" height="60" fill="#9db6b2"/><rect x="340" y="326" width="16" height="60" fill="#9db6b2"/>' + \
    '<rect x="520" y="80" width="14" height="280" fill="%s"/>' % C['ink'] + \
    '<path d="M527,80 l-30,50 h60z" fill="#f2d5d5"/>' + \
    '<rect x="600" y="70" width="160" height="120" rx="4" fill="%s"/>' % C['white'] + \
    '<text x="680" y="145" text-anchor="middle" font-size="40" fill="%s" font-family="sans-serif">+</text>' % C['red']

SCENES['校园'] = ('<rect width="800" height="280" fill="#cfe3ee"/>') + \
    '<rect y="280" width="800" height="220" fill="#c2b287"/>' + \
    '<path d="M300,500 q-20,-220 90,-260" stroke="#8a6a48" stroke-width="18" fill="none"/>' + \
    ''.join('<circle cx="%d" cy="%d" r="%d" fill="%s"/>' % (410 + dx, 200 + dy, r, c)
            for dx, dy, r, c in ((-50, -10, 60, C['green']), (30, -30, 55, C['green']), (90, 10, 45, '#8db07e'))) + \
    '<rect x="560" y="120" width="200" height="180" rx="8" fill="#e8d9c0" stroke="%s" stroke-width="10"/>' % C['woodD'] + \
    ''.join('<rect x="%d" y="%d" width="34" height="46" fill="%s"/>' % (580 + k * 52, 150, '#93aec6')
            for k in range(3))

SCENES['教室·倒计时'] = room('#eef0e4', '#c9b58e') + \
    '<rect x="140" y="70" width="520" height="170" rx="6" fill="#3f5a44" stroke="%s" stroke-width="10"/>' % C['woodD'] + \
    '<text x="400" y="140" text-anchor="middle" font-size="42" fill="%s" font-family="sans-serif" font-weight="bold">距离高考还有</text>' % C['white'] + \
    '<text x="400" y="205" text-anchor="middle" font-size="52" fill="%s" font-family="sans-serif" font-weight="bold">100 天</text>' % C['gold'] + \
    ''.join('<rect x="%d" y="310" width="130" height="18" rx="5" fill="%s"/>' % (100 + k * 200, C['woodD'])
            for k in range(3))

SCENES['考场外'] = ('<rect width="800" height="300" fill="#cfe3ee"/>') + \
    '<rect y="300" width="800" height="200" fill="#c2b287"/>' + \
    '<rect x="100" y="120" width="600" height="160" fill="#e8d9c0"/>' + \
    '<rect x="100" y="90" width="600" height="44" rx="6" fill="#3f5a44"/>' + \
    '<text x="400" y="121" text-anchor="middle" font-size="24" fill="%s" font-family="sans-serif" font-weight="bold">高考考点</text>' % C['white'] + \
    ''.join('<circle cx="%d" cy="330" r="20" fill="%s"/>' % (150 + k * 100, c)
            for k, c in enumerate((C['blue'], C['red'], C['green'], C['orange'], '#e8c67a', C['pinkD'], C['teal']))) + \
    '<rect y="310" width="800" height="8" fill="rgba(0,0,0,0.08)"/>'

SCENES['家门口'] = room('#efe3d0', '#c2b287') + \
    '<rect x="240" y="80" width="300" height="330" rx="10" fill="#c9a86f"/>' + \
    '<rect x="262" y="100" width="256" height="290" fill="#b8935f"/>' + \
    '<rect x="440" y="240" width="12" height="42" rx="5" fill="%s"/>' % C['gold'] + \
    '<rect x="140" y="330" width="80" height="90" rx="8" fill="#9db6b2"/>' + \
    plant(120, 380, 0.8)

SCENES['火车站'] = ('<rect width="800" height="260" fill="#cfe3ee"/>') + \
    '<circle cx="120" cy="70" r="32" fill="#ffe9bd"/>' + \
    '<rect y="260" width="800" height="60" fill="#9aa4ad"/>' + \
    '<rect y="320" width="800" height="180" fill="%s"/>' % '#8a929b' + \
    '<rect x="60" y="150" width="680" height="120" rx="16" fill="#d8dde2"/>' + \
    ''.join('<rect x="%d" y="176" width="70" height="56" rx="8" fill="%s"/>' % (90 + k * 104, '#7fa8c9')
            for k in range(6)) + \
    '<rect x="60" y="250" width="680" height="24" rx="10" fill="%s"/>' % C['red'] + \
    '<rect y="252" width="800" height="6" fill="#e8c67a"/>'

SCENES['宿舍'] = room('#e9eef0', '#cfd8db') + \
    '<rect x="90" y="90" width="240" height="26" rx="6" fill="%s"/>' % C['woodD'] + \
    '<rect x="90" y="240" width="240" height="26" rx="6" fill="%s"/>' % C['woodD'] + \
    '<rect x="90" y="116" width="240" height="124" fill="#dce8f0"/>' + \
    '<rect x="90" y="266" width="240" height="130" fill="#dce8f0"/>' + \
    '<rect x="106" y="132" width="90" height="50" rx="6" fill="#93aec6"/><rect x="106" y="282" width="90" height="50" rx="6" fill="#f2b8a0"/>' + \
    '<rect x="440" y="140" width="240" height="290" rx="8" fill="%s" stroke="%s" stroke-width="8"/>' % (C['white'], C['woodD']) + \
    '<rect x="470" y="170" width="180" height="110" rx="6" fill="#a8c3d9"/>' + \
    plant(730, 396, 0.8)

SCENES['银行App'] = ('<rect width="800" height="500" fill="#e9eef0"/>') + \
    '<rect x="290" y="30" width="220" height="440" rx="30" fill="%s" stroke="%s" stroke-width="6"/>' % (C['white'], C['ink']) + \
    '<rect x="306" y="60" width="188" height="120" rx="14" fill="#48749f"/>' + \
    '<text x="400" y="110" text-anchor="middle" font-size="22" fill="%s" font-family="sans-serif">余额</text>' % '#cfe3ee' + \
    '<text x="400" y="150" text-anchor="middle" font-size="30" fill="%s" font-family="sans-serif" font-weight="bold">¥ 8,888.00</text>' % C['white'] + \
    ''.join('<rect x="312" y="%d" width="176" height="52" rx="10" fill="#eef3f6"/>' % y for y in (200, 270, 340, 410)) + \
    ''.join('<circle cx="340" cy="%d" r="14" fill="%s"/>' % (y + 26, c)
            for y, c in zip((200, 270, 340, 410), (C['orange'], C['green'], C['blue'], C['red'])))

SCENES['视频通话'] = ('<rect width="800" height="500" fill="#3d4560"/>') + \
    '<rect x="240" y="30" width="320" height="440" rx="26" fill="%s" stroke="%s" stroke-width="6"/>' % (C['white'], C['ink']) + \
    '<rect x="258" y="60" width="284" height="340" rx="10" fill="%s"/>' % '#dce8f0' + \
    '<circle cx="400" cy="200" r="66" fill="%s"/>' % C['skin'] + \
    '<path d="M352,186 q48,-40 96,0 q-4,-26 -48,-26 q-44,0 -48,26z" fill="%s"/>' % C['hair'] + \
    '<circle cx="380" cy="204" r="5" fill="%s"/><circle cx="420" cy="204" r="5" fill="%s"/>' % (C['ink'], C['ink']) + \
    '<path d="M388,224 q12,9 24,0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>' % C['ink'] + \
    '<circle cx="520" cy="360" r="40" fill="%s"/>' % C['skin'] + \
    '<circle cx="508" cy="354" r="4" fill="%s"/><circle cx="532" cy="354" r="4" fill="%s"/>' % (C['ink'], C['ink']) + \
    '<circle cx="400" cy="430" r="26" fill="#d95f5f"/>'

SCENES['图书馆'] = room('#f2ead8', '#d9c1a0') + \
    ''.join('<rect x="%d" y="110" width="240" height="270" rx="6" fill="%s" stroke="%s" stroke-width="8"/>' % (x, C['white'], C['woodD'])
            for x in (70, 500)) + \
    ''.join('<rect x="%d" y="%d" width="220" height="12" fill="%s"/>' % (80, y, C['woodD'])
            for x, ys in ((80, (170, 240, 310)), (510, (170, 240, 310))) for y in ys) + \
    ''.join('<rect x="%d" y="%d" width="18" height="44" fill="%s"/>' % (90 + k * 26, y - 44,
            ['#d97b66', '#93aec6', '#a8c09a', '#e8c67a'][(k + yi) % 4])
            for yi, ys in enumerate(((170, 240, 310), (170, 240, 310))) for yi2, y in enumerate(ys) for k in range(8)) + \
    '<rect x="330" y="330" width="180" height="20" rx="6" fill="%s"/>' % C['woodD']

SCENES['大学礼堂'] = ('<rect width="800" height="500" fill="#31404e"/>') + \
    '<rect x="200" y="60" width="400" height="300" rx="10" fill="#26404d"/>' + \
    ''.join('<rect x="%d" y="80" width="70" height="200" rx="6" fill="%s"/>' % (220 + k * 96, '#3d5a6e')
            for k in range(4)) + \
    '<circle cx="400" cy="70" r="34" fill="url(#glow)"/><circle cx="400" cy="70" r="14" fill="%s"/>' % C['gold'] + GLOW_DEFS + \
    '<rect y="420" width="800" height="80" fill="#243240"/>'

SCENES['写字楼'] = ('<rect width="800" height="500" fill="#cfe3ee"/>') + \
    '<rect x="140" y="60" width="240" height="440" fill="#8fa8bd"/>' + \
    ''.join('<rect x="%d" y="%d" width="30" height="34" fill="#c3d6e2"/>' % (152 + (k % 6) * 38, 80 + (k // 6) * 46)
            for k in range(30)) + \
    '<rect x="420" y="140" width="200" height="360" fill="#a8bccd"/>' + \
    ''.join('<rect x="%d" y="%d" width="26" height="30" fill="#d5e2ec"/>' % (432 + (k % 5) * 36, 156 + (k // 5) * 44)
            for k in range(20)) + \
    '<rect y="460" width="800" height="40" fill="#c2b287"/>'

SCENES['出租屋'] = room('#f4ede2', '#d9c9b2') + \
    window_rect(110, 60, 140, 110, '#cfe3ee') + \
    '<rect x="420" y="240" width="280" height="70" rx="10" fill="#c9a86f"/>' + \
    '<rect x="440" y="200" width="90" height="46" rx="10" fill="%s"/>' % '#8f9aa8' + \
    '<rect x="150" y="330" width="70" height="60" rx="6" fill="#9db6b2"/>' + \
    '<path d="M185,332 q-20,-28 -4,-46 q16,12 4,46z" fill="%s"/><path d="M185,332 q20,-26 6,-44 q-18,12 -6,44z" fill="%s"/>' % (C['greenD'], C['green']) + \
    framed_pics(600, 80, 1)

SCENES['餐厅'] = room('#4a3b3f', '#5a4a4e') + \
    '<ellipse cx="400" cy="370" rx="300" ry="100" fill="#8f4b56"/>' + \
    '<ellipse cx="400" cy="362" rx="300" ry="92" fill="#b25e6a"/>' + \
    '<ellipse cx="400" cy="358" rx="180" ry="52" fill="%s"/>' % C['white'] + \
    '<circle cx="400" cy="80" r="44" fill="url(#glow)"/><circle cx="400" cy="80" r="18" fill="%s"/>' % C['gold'] + GLOW_DEFS + \
    ''.join('<circle cx="%d" cy="352" r="12" fill="%s"/>' % (340 + k * 40, [C['red'], C['green'], '#e8c67a'][k % 3])
            for k in range(3))

SCENES['银行'] = room('#eef1f4', '#cfd8db') + \
    '<rect x="100" y="290" width="600" height="30" rx="6" fill="#a8bccd"/>' + \
    '<rect x="100" y="320" width="600" height="90" fill="#c3d6e2"/>' + \
    ''.join('<rect x="%d" y="240" width="90" height="50" rx="8" fill="%s"/>' % (140 + k * 130, '#48749f')
            for k in range(4)) + \
    '<rect x="300" y="100" width="200" height="80" rx="8" fill="%s"/>' % C['white'] + \
    '<text x="400" y="152" text-anchor="middle" font-size="30" fill="%s" font-family="sans-serif" font-weight="bold">¥</text>' % '#48749f'

SCENES['婚礼现场'] = ('<rect width="800" height="500" fill="#3a2f3c"/>') + \
    '<path d="M140,480 L140,140 a260,140 0 0 1 520,0 L660,480" stroke="%s" stroke-width="14" fill="none"/>' % '#e8b98a' + \
    ''.join('<circle cx="%d" cy="%d" r="16" fill="%s"/><circle cx="%d" cy="%d" r="10" fill="%s"/>'
            % (x, y, C['pink'], x + 12, y - 14, C['white'])
            for x, y in ((150, 400), (150, 300), (150, 200), (650, 400), (650, 300), (650, 200))) + \
    '<circle cx="400" cy="60" r="90" fill="url(#glow)"/>' + \
    ''.join('<circle cx="%d" cy="%d" r="6" fill="%s"/>' % (300 + k * 50, 90 + (k % 2) * 26, C['gold'])
            for k in range(5)) + \
    '<rect y="430" width="800" height="70" fill="#4a3b4a"/>' + GLOW_DEFS


# ============================================================
# 输出
# ============================================================

def main():
    # 立绘
    save('poses', '新生儿', pose_xinshenger())
    save('poses', '婴儿', pose_yinger())
    save('poses', '幼儿', pose_youer())
    save('poses', '少年', pose_shaonian())
    save('poses', '青年', pose_qingnian())
    # 服装差分（高频组合）
    save('poses', '少年-高中校服', pose_shaonian(uniform='#e8f0f4', collar='#48749f', pants='#31404e'))
    save('poses', '青年-正装', pose_qingnian(jacket='#3f4a63', tee=C['white'], pants='#2c3450'))
    save('poses', '青年-学位服', pose_qingnian(jacket='#2c2c34', tee='#3a3a44', pants='#2c2c34'))
    save('poses', '青年-礼服', pose_qingnian(jacket='#4a3b4a', tee=C['white'], pants='#2c2c34'))

    # 表情
    for name, body in EXPRS.items():
        save('exprs', name, expr(body))

    # 场景（包 svg 外壳；含光晕的场景已在 body 内自带 GLOW_DEFS/NIGHT_DEFS）
    for name, body in SCENES.items():
        defs = GLOW_DEFS if 'url(#glow)' in body and 'GLOW' not in name else ''
        wrapped = svg(800, 500, body, defs)
        # 夜景的月晕渐变也要带上
        if 'url(#moonlite)' in body:
            wrapped = wrapped.replace('<defs>' + defs, '<defs>' + defs + NIGHT_DEFS)
        save('scenes', name, wrapped)

    print('poses: 5 + 4 服装差分')
    print('exprs: %d' % len(EXPRS))
    print('scenes: %d' % len(SCENES))
    missing = ['婴儿', '包被']


if __name__ == '__main__':
    main()
