"""Public search metadata; no voyage state or player-specific data."""
from html import escape
import hashlib
import json
import re

ORIGIN = 'https://captain.bittrees.org'
PAGES = {
    'index.html': ('/', 'Spacetrader — Free Browser Space Trading Game',
                   'Play Spacetrader, a free single-player space trading game. Trade goods, build a fleet and explore the solar system. No download or wallet required.'),
    'play/index.html': ('/play/', 'Play Spacetrader — Space Trading Browser Game',
                        'Create your captain and play Spacetrader in your browser. Trade cargo, explore stations and grow your fleet, with progress saved on this device.'),
    'guide/index.html': ('/guide/', 'Spacetrader Guide — Trading, Ships & Voyages',
                         'Learn how to play Spacetrader: trade goods, plan voyages, manage ships, use station services and build your captain’s career.'),
    'characters/index.html': ('/characters/', 'Spacetrader Characters — Captains & Station Crews',
                              'Explore Spacetrader’s human, alien and robot character designs and station roster. Browse species, occupations and the people you meet at each port.'),
    'ships/index.html': ('/ships/', 'Spacetrader Ships — Cargo, Fittings & Upgrades',
                         'Compare Spacetrader ship classes, cargo space, weapons and upgrades. Inspect 3D hulls and configurations to plan your next trading ship.'),
    'goods/index.html': ('/goods/', 'Spacetrader Goods — Markets, Supply & Prices',
                         'Browse Spacetrader goods, station supply and demand, cargo requirements and reference price ranges. Compare markets and plan your next trade.'),
    'goods/curves.html': ('/goods/curves', 'Spacetrader Pricing Curves — Stock & Trade Calculator',
                          'Explore Spacetrader’s stock-based pricing curves. Set station reserves, ship and shipment size to compare buy and sell prices across the curve.'),
    'goods/formulas.html': ('/goods/formulas', 'Spacetrader Pricing Formulas — Goods & Exchange Quotes',
                            'Understand Spacetrader’s pricing equations, bid–ask spreads, inventory curves and daily price distributions with worked reference examples.'),
    'goods/mechanics.html': ('/goods/mechanics', 'Spacetrader Trading Mechanics — Supply & Production',
                             'Learn how Spacetrader station stock, production inputs, consumption, cargo capacity and freight affect trading opportunities.'),
}


def decorate(text, name):
    path, title, description = PAGES[name]
    url = ORIGIN + path
    text = re.sub(r'<title>.*?</title>', '<title>' + escape(title) + '</title>', text, count=1, flags=re.S)
    # Exactly one title, description and canonical in the original response.
    text = re.sub(r'<meta\b[^>]*\bname=["\'](?:description|robots)["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'<link\b[^>]*\brel=["\'](?:icon|shortcut icon|apple-touch-icon|canonical|manifest)["\'][^>]*>', '', text, flags=re.I)
    common = [
        ('name', 'description', description), ('name', 'robots', 'index,follow,max-image-preview:large'),
        ('property', 'og:site_name', 'Spacetrader'), ('property', 'og:type', 'website'),
        ('property', 'og:title', title), ('property', 'og:description', description),
        ('property', 'og:url', url), ('property', 'og:locale', 'en_US'),
        ('property', 'og:image', ORIGIN + '/social/spacetrader.png'),
        ('property', 'og:image:width', '1200'), ('property', 'og:image:height', '630'),
        ('property', 'og:image:alt', 'Spacetrader: a single-player space trading game'),
        ('name', 'twitter:card', 'summary_large_image'), ('name', 'twitter:title', title),
        ('name', 'twitter:description', description), ('name', 'twitter:image', ORIGIN + '/social/spacetrader.png'),
        ('name', 'twitter:image:alt', 'Spacetrader: a single-player space trading game'),
    ]
    tags = ''.join('<meta ' + kind + '="' + key + '" content="' + escape(value, quote=True) + '">' for kind, key, value in common)
    tags += '<link rel="canonical" href="' + url + '">'
    tags += '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">'
    tags += '<link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">'
    tags += '<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">'
    tags += '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">'
    tags += '<link rel="manifest" href="/site.webmanifest">'
    graph = [
        {'@type': 'WebPage', '@id': url + '#page', 'url': url, 'name': title, 'description': description,
         'isPartOf': {'@id': ORIGIN + '/#website'}, 'about': {'@id': ORIGIN + '/#game'}, 'inLanguage': 'en'},
    ]
    if path == '/':
        graph += [
            {'@type': 'WebSite', '@id': ORIGIN + '/#website', 'url': ORIGIN + '/', 'name': 'Spacetrader', 'inLanguage': 'en'},
            {'@type': 'VideoGame', '@id': ORIGIN + '/#game', 'name': 'Spacetrader', 'url': ORIGIN + '/play/',
             'description': description, 'image': ORIGIN + '/social/spacetrader.png', 'genre': ['Space trading', 'Simulation', 'Strategy'],
             'gamePlatform': 'Web browser', 'playMode': 'https://schema.org/SinglePlayer', 'isAccessibleForFree': True,
             'applicationCategory': 'GameApplication', 'operatingSystem': 'Web browser', 'inLanguage': 'en'},
        ]
    else:
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Spacetrader', 'item': ORIGIN + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': title.split(' — ')[0], 'item': url},
        ]})
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    tags += '<script type="application/ld+json">' + data + '</script>'
    return text.replace('</head>', tags + '</head>'), hashlib.sha256(data.encode()).digest()


def sitemap():
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        '<url><loc>' + ORIGIN + path + '</loc></url>\n' for path, _, _ in PAGES.values()) + '</urlset>\n'
