#!/usr/bin/env python3
"""Build the static trading reference solely from reviewed public inputs."""
from pathlib import Path
import hashlib,html,json,re,sys

SITE=Path(__file__).resolve().parent;ROOT=SITE.parents[1]
sha=lambda data:hashlib.sha256(data).hexdigest()
def render():
 pointer=json.loads((ROOT/'Balance/current.json').read_bytes())
 assert re.fullmatch(r'approved-v[1-9][0-9]*/manifest.json',pointer['manifest'])
 base=ROOT/'Balance'/Path(pointer['manifest']).parent;approved=json.loads((base/'manifest.json').read_bytes())
 assert pointer['revision']==approved['revision']
 payload=(base/'formulas.json').read_bytes();assert sha(payload)==approved['files']['formulas.json']
 data=json.loads(payload);assert data['engineSHA256']==approved['engineSHA256']
 sys.path.insert(0,str(ROOT/'Local'))
 from catalogue_shell import header
 template=(SITE/'mechanics-template.html').read_text()
 values={'SPREAD_ROWS':''.join('<tr><th scope="row">'+html.escape(k)+'</th><td>'+format(v*100,'g')+'%</td></tr>' for k,v in data['exchange']['rules']['spreads'].items()),'FREIGHT_ROWS':''.join('<tr><th scope="row">'+html.escape(t['name'])+'</th><td>'+str(t['units'])+' / '+format(t['units']*.25,'g')+' t</td>'+''.join('<td>'+str(t[k])+'</td>' for k in ['products','level','access','ships'])+'</tr>' for t in data['freight']['tiers']),'RECOVERY_DAYS':str(data['blockades']['recoveryRules']['days']),**{key:format(data['freight']['rewardRules'][field]*100,'g') for key,field in [('BASE_SHARE','baseProfitShare'),('RISK_SHARE','riskProfitShare'),('URGENCY_SHARE','urgencyProfitShare'),('DURATION_SHARE','durationProfitShare'),('HANDLING_SHARE','handlingProfitShare'),('PROFIT_CAP','maximumProfitShare')]},'PERIOD':format(approved['periodDays'],',')}
 values.update(UNLOCK_BATCH=str(data['commodityDiscovery']['rules']['maxPerRelease']),UNLOCK_SPACING=str(data['commodityDiscovery']['rules']['commerceBetweenReleases']))
 names={g['name']:g['name'] for g in data['commodities']}
 # Public process IDs and coefficients come only from the approved formulas snapshot.
 product_names={row['id']:row['name'] for row in json.loads((base/'goods.json').read_bytes()).get('items',[]) if 'id' in row}
 product_names.update({row['item']:row['product'] for row in json.loads((base/'goods.json').read_bytes())['rows']})
 stations={row['port']:row['station'] for row in json.loads((base/'goods.json').read_bytes())['rows']}
 def goods_list(values):return ', '.join(html.escape(product_names.get(k,k))+' '+format(v,'.4g') for k,v in values.items()) or 'Primary collection'
 values['PROCESS_ROWS']=''.join('<tr><th scope="row">'+html.escape(stations[p['port']])+' · '+html.escape(product_names.get(p['good'],p['good']))+('</th><td>')+html.escape(p['tier']+' / '+p['kind'])+'</td><td>'+goods_list(p['inputs'])+'</td><td>'+goods_list(p['outputs'])+'</td><td>'+format(p['waste'],'.4g')+'</td><td>'+format(p['capacity'],'.3f')+'</td></tr>' for p in data['industrialPlan']['processes'])
 content=template
 for key,value in values.items():content=content.replace('{{'+key+'}}',value)
 assert '{{' not in content
 sections=re.findall(r'<section id="([^"]+)">.*?<h2>(.*?)</h2>',content,re.S)
 navigation='<nav class="formula-nav" aria-label="Trading sections"><span>On this page</span>'+''.join('<a href="#'+key+'">'+html.escape(re.sub('<[^>]+>','',title))+'</a>' for key,title in sections)+'</nav>'
 source='Approved economy '+html.escape(pointer['revision'])+' · '+str(approved['counts']['exchangeGoods'])+' exchange goods · '+str(approved['counts']['stations'])+' stations. Generic reference; no player data.'
 page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c1d28"><title>Spacetrader · Trading mechanics</title><link rel="stylesheet" href="/catalogue.css"><link rel="stylesheet" href="/catalogue-shell.css"><link rel="stylesheet" href="/formulas.css"><link rel="stylesheet" href="/mechanics.css"></head><body class="formula-page mechanics-page"><a class="skip" href="#mechanics-content">Skip to trading mechanics</a><div class="catalogue-shell">'+header('goods')+'</div><main><div class="page-heading"><div><h1>Trading mechanics</h1><p>How supply, your trades and client work shape the market.</p></div><div class="page-heading-actions"><a class="button-link" href="/formulas">Pricing formulas</a><a class="button-link" href="/">Back to goods</a></div></div><div class="formula-layout">'+navigation+'<article id="mechanics-content" class="formula-content">'+content+'<section id="reference-source"><p>'+source+'</p></section></article></div></main></body></html>'
 fragment=re.sub(r'<section id="[^"]+">','<section class="guide-subsection">',content)
 fragment=re.sub(r'<div class="section-number">.*?</div>','',fragment)
 fragment=fragment.replace('<h2>','<h3>').replace('</h2>','</h3>')
 manifest={'mode':'reference','revision':pointer['revision'],'engineSHA256':data['engineSHA256'],'inputs':{'formulas':sha(payload),'template':sha(template.encode()),'styles':sha((SITE/'mechanics.css').read_bytes()),'builder':sha(Path(__file__).read_bytes()),'header':sha((ROOT/'Local/catalogue_shell.py').read_bytes())},'sections':[key for key,_ in sections],'outputs':{'mechanics.html':sha(page.encode()),'mechanics-fragment.html':sha(fragment.encode())}}
 return {'mechanics.html':page,'mechanics-fragment.html':fragment,'mechanics-manifest.json':json.dumps(manifest,indent=2)+'\n'}
if __name__=='__main__':
 files=render()
 for name,text in files.items():
  if '--check' in sys.argv:assert (SITE/name).read_text()==text,'Refresh the reviewed goods mechanics reference: '+name
  else:(SITE/name).write_text(text)
 print('Goods mechanics '+('verified' if '--check' in sys.argv else 'built')+': 8 sections from the approved public economy; no player data.')
