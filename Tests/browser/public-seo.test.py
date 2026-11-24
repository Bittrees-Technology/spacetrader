#!/usr/bin/env python3
"""Crawl every public HTML page and verify the release's SEO contract."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from urllib.robotparser import RobotFileParser
import base64
import hashlib
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'Web'))
import seo
STATIC = ROOT / 'Web/.vercel/output/static'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta, self.links, self.ids, self.schemas, self.texts = [], [], set(), [], []
        self.title, self.h1, self.in_title, self.in_schema, self.ignored = '', 0, False, False, False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, 'Duplicate ID ' + attrs['id']
            self.ids.add(attrs['id'])
        if tag == 'meta':self.meta.append(attrs)
        if tag in ['a', 'link', 'img', 'script']:
            self.links.append((tag, attrs))
        if tag == 'h1':self.h1 += 1
        if tag == 'title' and not self.title:self.in_title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':self.in_schema = True
        if tag in ['script', 'style']:self.ignored = True

    def handle_endtag(self, tag):
        if tag == 'title':self.in_title = False
        if tag in ['script', 'style']:self.ignored = False
        if tag == 'script':self.in_schema = False

    def handle_data(self, text):
        if self.in_title:self.title += text
        if self.in_schema:self.schemas.append(text)
        if not self.ignored:self.texts.append(text)


pages = {name: Page((STATIC / name).read_text()) for name in seo.PAGES}
titles, descriptions, link_count = set(), set(), 0
broken_fragments = []
config = json.loads((STATIC.parent / 'config.json').read_text())
public_headers = next(route['headers'] for route in config['routes'] if route['src'] == '/(.*)')
for name, page in pages.items():
    url, expected_title, description = seo.PAGES[name]
    policies = [r['headers']['Content-Security-Policy'] for r in config['routes']
                if 'Content-Security-Policy' in r.get('headers', {}) and re.fullmatch(r['src'], url)]
    assert len(policies) == 1, url
    csp = policies[0]
    consent_tags = [a for t,a in page.links if t == 'script' and a.get('data-google-analytics-only') == 'true']
    assert bool(consent_tags) == (url in ['/', '/guide/']), url
    assert ('https://www.googletagmanager.com/gtag/' in csp) == bool(consent_tags), url
    assert ('frame-src https://insights.bittrees.org/analytics-preferences.html' in csp) == bool(consent_tags), url
    assert page.title == expected_title, name
    assert page.title not in titles and description not in descriptions, name
    titles.add(page.title);descriptions.add(description)
    assert page.h1 == 1, (name, page.h1)
    desc = [m.get('content') for m in page.meta if m.get('name') == 'description']
    assert desc == [description], name
    assert 65 <= len(description) <= 180, name
    assert [a['href'] for t,a in page.links if a.get('rel') == 'canonical'] == [seo.ORIGIN + url], name
    assert any(m.get('property') == 'og:url' and m['content'] == seo.ORIGIN + url for m in page.meta), name
    assert any(m.get('name') == 'twitter:card' and m['content'] == 'summary_large_image' for m in page.meta), name
    assert any(a.get('href') == '/favicon.svg' for _,a in page.links), name
    assert [a.get('href') for _,a in page.links if a.get('rel') == 'describedby'] == ['/llms.txt'], name
    assert len(page.schemas) == 1, name
    graph = json.loads(page.schemas[0])
    assert graph['@context'] == 'https://schema.org'
    if url.startswith('/goods/') and url != '/goods/':
        crumbs = next(node for node in graph['@graph'] if node['@type'] == 'BreadcrumbList')['itemListElement']
        assert [item['item'] for item in crumbs] == [seo.ORIGIN + '/', seo.ORIGIN + '/goods/', seo.ORIGIN + url], name
        assert [item['position'] for item in crumbs] == [1, 2, 3], name
    digest = base64.b64encode(hashlib.sha256(page.schemas[0].encode()).digest()).decode()
    assert "'sha256-" + digest + "'" in csp, name
    assert 'aggregateRating' not in page.schemas[0] and 'reviewRating' not in page.schemas[0]
    for tag, attrs in page.links:
        link = attrs.get('href') if tag in ['a','link'] else attrs.get('src')
        if not link:continue
        split = urlsplit(link)
        if split.scheme or split.netloc:
            assert 'localhost' not in split.netloc and '127.0.0.1' not in split.netloc
            continue
        path = split.path or url
        if not path.startswith('/'):
            path = url.rsplit('/',1)[0] + '/' + path
        if path == '/':target = 'index.html'
        elif path.endswith('/'):target = path.lstrip('/') + 'index.html'
        elif path in ['/goods/curves','/goods/formulas','/goods/mechanics']:target = path.lstrip('/') + '.html'
        else:target = path.lstrip('/')
        assert (STATIC / target).is_file(), (name, link, target)
        if split.fragment and target in pages:
            if unquote(split.fragment) not in pages[target].ids:broken_fragments.append((name,link))
        link_count += 1
    assert len(' '.join(page.texts).split()) >= 30, name
assert not broken_fragments, broken_fragments

doc = ET.fromstring((STATIC / 'sitemap.xml').read_text())
locations = [e.text for e in doc.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert set(locations) == {seo.ORIGIN + p for p,_,_ in seo.PAGES.values()}
assert len(locations) == len(seo.PAGES)
assert 'Sitemap: ' + seo.ORIGIN + '/sitemap.xml' in (STATIC / 'robots.txt').read_text()
robots = RobotFileParser()
robots.parse((STATIC / 'robots.txt').read_text().splitlines())
for bot in ['Googlebot', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User']:
    for url in locations + [seo.ORIGIN + '/llms.txt']:
        assert robots.can_fetch(bot, url), (bot, url)
discovery = (STATIC / 'llms.txt').read_text()
discovery_urls = re.findall(r'\]\((https://[^)]+)\)', discovery)
assert len(discovery_urls) == len(set(discovery_urls))
assert set(discovery_urls) == set(locations) | {seo.ORIGIN + '/sitemap.xml', seo.ORIGIN + '/robots.txt'}
assert 'localhost' not in discovery and '127.0.0.1' not in discovery
assert 'Account saves are private and require sign-in' in discovery
assert not robots.can_fetch('OAI-SearchBot',seo.ORIGIN+'/api/voyage')
assert not robots.can_fetch('Googlebot',seo.ORIGIN+'/api/ledger')
for name,size in [('favicon-96.png',96),('apple-touch-icon.png',180),('icon-192.png',192),('icon-512.png',512)]:
    data=(STATIC/name).read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n';assert struct.unpack('>II',data[16:24])==(size,size),name
assert struct.unpack('>II',(STATIC/'social/spacetrader.png').read_bytes()[16:24])==(1200,630)
assert (STATIC/'favicon.ico').read_bytes()[:4]==b'\x00\x00\x01\x00'
assert json.loads((STATIC/'site.webmanifest').read_text())['display']=='browser'
assert 'name="robots" content="noindex"' in (STATIC/'404.html').read_text()
print(f'PASS SEO: {len(pages)} pages, {link_count} internal links/assets, unique metadata, canonical sitemap, schema hashes and all favicon/share image dimensions.')
