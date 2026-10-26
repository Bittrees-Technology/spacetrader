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
    tags += '<link rel="describedby" href="/llms.txt" type="text/plain">'
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
        trail = [('Spacetrader', ORIGIN + '/')]
        if path.startswith('/goods/') and path != '/goods/':
            trail.append(('Goods', ORIGIN + '/goods/'))
        trail.append((title.split(' — ')[0], url))
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': position, 'name': label, 'item': item}
            for position, (label, item) in enumerate(trail, 1)
        ]})
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    tags += '<script type="application/ld+json">' + data + '</script>'
    return text.replace('</head>', tags + '</head>'), hashlib.sha256(data.encode()).digest()


def sitemap():
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        '<url><loc>' + ORIGIN + path + '</loc></url>\n' for path, _, _ in PAGES.values()) + '</urlset>\n'


def robots():
    # Wildcard permission also covers AI search crawlers, without more-specific
    # groups accidentally overriding shared restrictions in future revisions.
    return ('# Public game and reference pages are open to search and AI discovery.\n'
            'User-agent: *\nAllow: /\n\nSitemap: ' + ORIGIN + '/sitemap.xml\n')


def llms():
    return '''# Spacetrader

> A free single-player browser space trading game, with a public guide and reference tools for planning cargo, ships and voyages.

The canonical site is https://captain.bittrees.org/. Anyone can play without an account, wallet or download. Progress is saved in the current browser on the current device. These reference pages use generic game data, never a player's active voyage, balances or inventory.

## Play and learn

- [Home](https://captain.bittrees.org/): Game overview and navigation.
- [Play](https://captain.bittrees.org/play/): Create a captain and play. JavaScript is required for the local simulation.
- [Guide](https://captain.bittrees.org/guide/): Trading, travel, fleet management, station services and progression.
- [Characters](https://captain.bittrees.org/characters/): Character designs, species and the station establishment roster.
- [Ships](https://captain.bittrees.org/ships/): Hulls, cargo capacity, weapons, fittings and upgrades.

## Trade references and tools

- [Goods](https://captain.bittrees.org/goods/): Commodities, station supply and demand, cargo requirements and reference prices.
- [Pricing curves](https://captain.bittrees.org/goods/curves): Explore stock-based buy and sell curves using manually selected station stock, ship and order size.
- [Pricing formulas](https://captain.bittrees.org/goods/formulas): Reference equations for exchange quotes and pricing distributions.
- [Trading mechanics](https://captain.bittrees.org/goods/mechanics): Production inputs, consumption, finite station stock, cargo and freight.

Tool inputs are hypothetical planning values, not a connection to a saved game. Use the published guide and approved reference data when explaining mechanics; do not present proposed ship features as implemented. The current public release has no remote agent-control API or cloud-save API. Discovering these pages does not grant access to a player's saves or permission to act for them.

## Optional

- [Sitemap](https://captain.bittrees.org/sitemap.xml): Canonical public pages.
- [Crawl policy](https://captain.bittrees.org/robots.txt): Public crawler directives.
'''
