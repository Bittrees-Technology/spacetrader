"""Public catalogue transport. Approved source data and calculation modules stay intact."""
import hashlib
import json


def compact(value):
    return json.dumps(value, separators=(',', ':'), ensure_ascii=False)


def package(goods, write):
    snapshot_items = sorted({r['item'] for r in goods['dailyPriceSnapshots']['rows']})
    statistics = []
    for offset in range(0, len(snapshot_items), 8):
        items = snapshot_items[offset:offset + 8]
        subset = set(items)
        chunk = {'quotePairOutcomes': {key: value for key, value in goods['quotePairOutcomes'].items() if key in subset},
                 'dailyPriceSnapshots': {**goods['dailyPriceSnapshots'], 'rows': [r for r in goods['dailyPriceSnapshots']['rows'] if r['item'] in subset]}}
        data = compact(chunk)
        url = '/goods/data/statistics.' + hashlib.sha256(data.encode()).hexdigest()[:16] + '.json'
        write(url.lstrip('/'), data)
        statistics.append({'url': url, 'items': items, 'bytes': len(data.encode())})
    rows = goods['rows']
    columns = list(dict.fromkeys(key for row in rows for key in row))
    values, indexes = [], []
    for key in columns:
        dictionary, entries, refs = {}, [], []
        for row in rows:
            if key not in row:
                refs.append(-1)
                continue
            identity = json.dumps(row[key], sort_keys=True, separators=(',', ':'), ensure_ascii=False)
            if identity not in dictionary:
                dictionary[identity] = len(entries)
                entries.append(row[key])
            refs.append(dictionary[identity])
        values.append(entries)
        indexes.append(refs)
    payload = {'format': 'goods-columns-v1', 'rowCount': len(rows), 'columns': columns, 'values': values, 'indexes': indexes,
               'approval': goods['approval'], 'periodDays': goods['periodDays'], 'statistics': statistics}
    encoded = compact(payload)
    url = '/goods/data/catalogue.' + hashlib.sha256(encoded.encode()).hexdigest()[:16] + '.json'
    write(url.lstrip('/'), encoded)
    return {'indexURL': url, 'indexBytes': len(encoded.encode()), 'rowCount': len(rows), 'statistics': statistics}


def adapt(source, index_url, worker_url):
    def replace(old, new):
        nonlocal source
        if source.count(old) != 1:
            raise ValueError('Review public catalogue adapter: ' + old[:90])
        source = source.replace(old, new)
    replace("const params=new URLSearchParams(location.search)", "let summaryRequest=0;const goodsData=SpacetraderCatalogueData.create(" + json.dumps(index_url) + ',' + json.dumps(worker_url) + ");\nconst params=new URLSearchParams(location.search)")
    replace('function filter(){', 'async function filter(){\n const request=++summaryRequest;')
    replace('visible=summary?SpacetraderGoodsView.aggregateItems(rows,quotePairOutcomes,dailyPriceSnapshots):rows;', '''if(summary){
  cancelAnimationFrame(renderFrame);renderFrame=0;renderToken++;renderColumns();$('rows').replaceChildren();hideCurveTooltip();$('results').setAttribute('aria-busy','true');$('export').disabled=true;$('empty').hidden=true;$('error').hidden=true;$('summary-retry').hidden=true;$('status').textContent='Loading item summaries…';
  try{const result=await goodsData.summary(rows);if(request!==summaryRequest)return;visible=result;}
  catch(error){if(request!==summaryRequest)return;$('error').textContent=error.message;$('error').hidden=false;$('summary-retry').hidden=false;$('results').setAttribute('aria-busy','false');$('status').textContent='Item summary unavailable';return;}
 }else visible=rows;
 $('error').hidden=true;$('summary-retry').hidden=true;$('export').disabled=false;''')
    replace("const r=await fetch('/goods/data/goods.json');if(!r.ok)throw Error('Goods data could not be loaded. Reload to try again.');const value=await r.json();", "$('export').disabled=true;const value=await goodsData.load();")
    replace("$('reset').onclick=", "$('summary-retry').onclick=()=>filter();\n$('reset').onclick=")
    return source
