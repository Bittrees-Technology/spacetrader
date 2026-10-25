from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'Local/guide-catalogue'
class Review(HTMLParser):
    def __init__(self,text):
        super().__init__();self.text=[];self.ids=[];self.topics=[];self.groups=[];self.tables=0;self.heads=0;self.links=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if a.get('class')=='guide-topic':self.topics.append(a)
        if a.get('class')=='guide-category-group':self.groups.append(a)
        if tag=='table':self.tables+=1
        if tag=='thead':self.heads+=1
        if tag=='th':assert a.get('scope') in ['col','row']
        if tag=='a' and a.get('href','').startswith('#'):self.links.append(a['href'][1:])
    def handle_data(self,data):self.text.append(data)

source=(SITE/'index.html').read_text();review=Review(source);manifest=json.loads((SITE/'reference-manifest.json').read_text())
assert len(review.topics)==len(manifest['topics'])==67
assert len(review.groups)==8
assert len(review.ids)==len(set(review.ids))
assert all(key in review.ids for key in review.links)
assert review.tables==review.heads and review.tables>3
assert len(re.findall('<h2>',source))==8
assert not re.search(r'\bfiction(?:al)?\b|imagined situations|present-day technology',' '.join(review.text),re.I)
assert 'Continue remains beside a response' not in source and '“Go on” reads the rest' not in source
assert 'Clearing site data removes that progress' in source
assert 'View the full production recipe table' in source
mapping={r['title']:r['category'] for r in manifest['topics']}
assert mapping['Diplomatic missions']=='Work & people'
assert mapping['Station storage limits']=='Trade & freight'
assert mapping['Regional access']=='Travel & stations'
assert 'source snapshots' not in ' '.join(review.text)
print(f'PASS Guide readability: {len(review.topics)} topics, eight categories, {review.tables} accessible tables, valid contents links and no fiction disclaimers or obsolete response controls.')
