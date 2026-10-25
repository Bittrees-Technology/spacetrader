#!/usr/bin/env python3
"""Recreate the committed public icons and share card with local Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent / 'assets'
ROOT.mkdir(exist_ok=True)
SPACE, BRASS, PAPER, MIST = '#101f2c', '#d5ae68', '#e4e9e9', '#afc4ce'


def icon(size):
    scale = 8
    im = Image.new('RGBA', (96 * scale, 96 * scale))
    d = ImageDraw.Draw(im)
    def box(v):return tuple(x * scale for x in v)
    d.rounded_rectangle(box((0, 0, 96, 96)), radius=21 * scale, fill=SPACE)
    d.ellipse(box((22, 31, 66, 75)), outline=BRASS, width=5 * scale)
    # The orbital approach and pointed freighter are legible at tab-icon size.
    points = []
    for i in range(81):
        t = i / 80
        x = (1-t)**3*17 + 3*(1-t)**2*t*2 + 3*(1-t)*t*t*52 + t**3*81
        y = (1-t)**3*70 + 3*(1-t)**2*t*44 + 3*(1-t)*t*t*15 + t**3*32
        points.append((x*scale, y*scale))
    d.line(points, fill=MIST, width=4 * scale, joint='curve')
    d.polygon([(x*scale,y*scale) for x,y in [(73,14),(85,48),(71,40),(58,45)]], fill=BRASS, outline=SPACE, width=3*scale)
    d.ellipse(box((38,47,50,59)), fill=BRASS)
    return im.resize((size,size), Image.Resampling.LANCZOS)


for name, size in [('favicon-96.png',96),('apple-touch-icon.png',180),('icon-192.png',192),('icon-512.png',512)]:
    icon(size).save(ROOT / name, optimize=True)
icon(256).save(ROOT / 'favicon.ico', sizes=[(16,16),(32,32),(48,48)])

card = Image.new('RGB', (1200,630), SPACE)
d = ImageDraw.Draw(card)
serif = '/System/Library/Fonts/Supplemental/Georgia.ttf'
sans = '/System/Library/Fonts/Supplemental/Arial.ttf'
card.paste(icon(110), (68,58), icon(110))
d.text((68,215), 'Spacetrader', font=ImageFont.truetype(serif,90), fill=PAPER)
d.text((72,340), 'Make your living among the planets.', font=ImageFont.truetype(sans,31), fill=MIST)
d.text((72,417), 'A single-player space trading game', font=ImageFont.truetype(sans,25), fill=MIST)
d.rounded_rectangle((72,500,330,559),radius=5,fill=BRASS)
d.text((97,515), 'Play in your browser',font=ImageFont.truetype(sans,23),fill=SPACE)
for r in [68,128,188,245]:
    d.ellipse((945-r,280-r*.79,945+r,280+r*.79),outline='#3a5261',width=2)
d.ellipse((926,261,964,299),fill=BRASS)
d.ellipse((1043,195,1059,211),fill=MIST)
d.ellipse((781,382,801,402),fill='#cb8d72')
d.text((817,553), 'captain.bittrees.org',font=ImageFont.truetype(sans,24),fill=MIST)
card.save(ROOT / 'spacetrader-social.png',optimize=True)
print('Created spacecraft icons and 1200 × 630 share image.')
