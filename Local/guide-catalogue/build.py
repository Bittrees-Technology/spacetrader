from pathlib import Path
from html.parser import HTMLParser
import html,re,json,hashlib,sys
site=Path(__file__).parent;root=site.parents[1];source=(site/'fragment.html').read_text()
class Blocks(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=False);self.depth=0;self.start=0;self.blocks=[];self.offsets=[0]
  for line in source.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
 def pos(self):
  line,col=self.getpos();return self.offsets[line-1]+col
 def handle_starttag(self,tag,attrs):
  if self.depth==0:self.start=self.pos()
  if tag not in {'br','hr','img','input','meta','link','wbr'}:self.depth+=1
 def handle_endtag(self,tag):
  self.depth-=1
  if self.depth==0:self.blocks.append(source[self.start:source.index('>',self.pos())+1])
p=Blocks();p.feed(source);assert p.depth==0
categories=['Getting started','Travel & stations','Ships & fleet','Trade & freight','Work & people','Banking & property','Captain & records','World & science']
def category(title):
 overrides={'Establishment controls':'Travel & stations','Regional access':'Travel & stations','Raids during a voyage':'Travel & stations','Diplomatic missions':'Work & people','Receiving inquiries & dated leads':'Work & people','Talking with travelling specialists':'Work & people','Station storage limits':'Trade & freight','Freight dispatch and receiving needs':'Trade & freight','Raw resources and local processing':'Trade & freight'}
 if title in overrides:return overrides[title]
 if re.search('Your first|Reference catalogues',title):return categories[0]
 if re.search('Station locations|Powered travel|Planning route fuel|Orbit|Propellant|Establishments|Navigation learning',title):return categories[1]
 if re.search('Fleet|Ship upgrade|Dry dock|Hull batches|Accounting lots',title,re.I):return categories[2]
 if re.search('Station inventory|Trading seasons|Freight payment|Customs|Goods & exchange|Trading work|Production recovery',title):return categories[3]
 if re.search('Bounties|Work fees|Station coordination|Patrol|Station liberation|Finite blockades|Conversation|Named travelling|Relics|Medical|Continuing personal|Correspondence and professional',title):return categories[4]
 if re.search('Warehouses|Leasing|Credit|Deposits|Bank credit|Bank rate|Home base',title):return categories[5]
 if re.search('Character growth|Journal|Reputation|Progress|Audio',title):return categories[6]
 return categories[7]
rows=[];ids=set()
for block in p.blocks:
 match=re.search(r'<h3>(.*?)</h3>',block,re.S);assert match,block[:100]
 title=html.unescape(re.sub('<[^>]+>','',match.group(1)));slug=re.sub('[^a-z0-9]+','-',title.lower()).strip('-')
 while slug in ids:slug+='-more'
 ids.add(slug);group=category(title);body=block[block.index('>')+1:block.rfind('</')]
 body=body.replace(match.group(0),'<!--TOPIC-HEADING-->',1)
 body=re.sub(r'<details\b[^>]*>','<section class="guide-subsection">',body).replace('</details>','</section>');body=re.sub(r'<summary\b[^>]*>','<h3>',body).replace('</summary>','</h3>')
 body=re.sub(r'<h([1-6])([^>]*)>(.*?)</h\1>',lambda m:'<h'+str(max(4,int(m[1])))+m[2]+'>'+m[3]+'</h'+str(max(4,int(m[1])))+'>',body,flags=re.S)
 body=body.replace('<!--TOPIC-HEADING-->','<h3>'+match.group(1)+'</h3>')
 repeated='The map advances with your ship’s calendar, without an independent animation clock. Moon surface marks face their parent to show tidal locking. Cloud patterns and surface geography are not simulated. Navigation uses a simplified route model; this chart is an approximation rather than a precision ephemeris.'
 if title=='Orbit & rotation details':
  body=body.replace(repeated,'')
  body=body.replace('</h3>','</h3><p>The chart advances with your ship’s calendar. Moon surface marks face their parent to show tidal locking; orbital values below provide a common reference for route planning.</p>',1)
 def format_table(m):
  def scope_headers(part,scope):return re.sub(r'<th\b(?![^>]*\bscope=)([^>]*)>',lambda h:'<th scope="'+scope+'"'+h[1]+'>',part)
  table=re.sub(r'<thead\b.*?</thead>',lambda part:scope_headers(part[0],'col'),m[0],flags=re.S)
  table=re.sub(r'<tbody\b.*?</tbody>',lambda part:scope_headers(part[0],'row'),table,flags=re.S)
  table=scope_headers(table,'col')
  wrapped='<div class="guide-table" role="region" tabindex="0" aria-label="'+html.escape(title,quote=True)+' reference table">'+table+'</div>'
  if table.count('<tr')>80:return '<details class="guide-reference"><summary>View the full production recipe table</summary>'+wrapped+'</details>'
  return wrapped
 body=re.sub(r'<table\b.*?</table>',format_table,body,flags=re.S)
 body=re.sub(r'<p>\s*</p>','',body)
 rows.append({'id':slug,'title':title,'category':group,'html':'<section class="guide-topic" id="'+slug+'" data-category="'+html.escape(group,quote=True)+'">'+body+'</section>'})
rows.sort(key=lambda r:categories.index(r['category']))
nav=''.join('<div class="guide-nav-group" data-group="'+html.escape(c,quote=True)+'"><h3>'+html.escape(c)+'</h3>'+''.join('<a href="#'+r['id']+'">'+html.escape(r['title'])+'</a>' for r in rows if r['category']==c)+'</div>' for c in categories)
content=''.join('<section class="guide-category-group" data-category="'+html.escape(c,quote=True)+'"><h2>'+html.escape(c)+'</h2>'+''.join(r['html'] for r in rows if r['category']==c)+'</section>' for c in categories)
sys.path.insert(0,str(root/'Local'))
from catalogue_shell import header as reference_header
header=reference_header('guide')
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c1d28"><title>Spacetrader · Guide</title><link rel="stylesheet" href="/guide.css"><link rel="stylesheet" href="/catalogue-shell.css"><script defer src="/guide.js"></script></head><body><a class="skip" href="#guide-content">Skip to guide</a><div class="catalogue-shell">'''+header+'''</div><main><header class="guide-heading"><h1>Game guide</h1><p>Plan a voyage, manage your fleet and find your way around station life.</p></header><section class="guide-tools" aria-label="Find guide topics"><label for="guide-search">Search the guide<input id="guide-search" type="search" placeholder="Freight, licences, crew, interest…" autocomplete="off"></label><label for="guide-category">Topic<select id="guide-category"><option value="">All topics</option>'''+''.join('<option>'+html.escape(c)+'</option>' for c in categories)+'''</select></label><button id="guide-clear">Clear filters</button></section><p id="guide-status" role="status">'''+str(len(rows))+''' topics</p><div class="guide-layout"><details class="guide-contents" open><summary>Guide contents</summary><nav class="guide-index" aria-label="Guide contents">'''+nav+'''</nav></details><article id="guide-content"><p id="guide-empty" hidden>No topics match. Try another word or clear the filters.</p>'''+content+'''</article></div></main></body></html>'''
(site/'index.html').write_text(page)
manifest=json.loads((site/'reference-manifest.json').read_text());manifest.update({'indexSHA256':hashlib.sha256(page.encode()).hexdigest(),'builderSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'headerSHA256':hashlib.sha256((root/'Local/catalogue_shell.py').read_bytes()).hexdigest(),'topics':[{k:r[k] for k in ['id','title','category']} for r in rows]});(site/'reference-manifest.json').write_text(json.dumps(manifest,indent=2));print(f'Static Guide built: {len(rows)} topics, {len(categories)} categories.')
