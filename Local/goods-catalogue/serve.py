#!/usr/bin/env python3
"""Loopback-only read-only goods catalogue. No player-save access."""
from pathlib import Path
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlsplit,unquote
import hashlib,json,mimetypes
SITE=Path(__file__).resolve().parent;ROOT=SITE.parents[1];PORT=8877
def approved(kind):
    # Snapshots are intentionally independent of installed-game or source edits.
    pointer=json.loads((ROOT/'Balance/current.json').read_bytes())
    relative=Path(pointer['manifest'])
    if len(relative.parts)!=2 or relative.name!='manifest.json' or not relative.parts[0].startswith('approved-v') or not relative.parts[0][10:].isdigit():raise ValueError('Invalid approved revision')
    base=ROOT/'Balance'/relative.parent;manifest=json.loads((base/'manifest.json').read_bytes())
    if manifest['version']!=1 or manifest['revision']!=pointer['revision']:raise ValueError('Invalid approved manifest')
    name={'goods':'goods.json','formulas':'formulas.json','bonding-curves':'bonding-curves.json','stock-pricing':'stock-pricing.js'}[kind];file=base/name;expected=manifest['files'][name]
    data=file.read_bytes()
    if hashlib.sha256(data).hexdigest()!=expected:raise ValueError('Approved snapshot failed verification')
    return data,expected
def goods():return approved('goods')
def formulas():return approved('formulas')
def mechanics():
    data,digest=approved('formulas');manifest=json.loads((SITE/'mechanics-manifest.json').read_bytes());pointer=json.loads((ROOT/'Balance/current.json').read_bytes())
    if manifest['mode']!='reference' or manifest['revision']!=pointer['revision'] or manifest['inputs']['formulas']!=digest:raise ValueError('Trading reference needs review')
    page=(SITE/'mechanics.html').read_bytes()
    if hashlib.sha256(page).hexdigest()!=manifest['outputs']['mechanics.html']:raise ValueError('Trading reference failed verification')
    return page
import sys
sys.path.insert(0,str(ROOT/'Local'))
from catalogue_shell import present_header

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*_):pass
    def send(self,status,data,kind='application/json; charset=utf-8',etag=None):
        self.send_response(status);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-cache');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer');self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        if etag:self.send_header('ETag','"'+etag+'"')
        self.end_headers()
        if data:self.wfile.write(data)
    def do_GET(self):
        if self.headers.get('Host') not in (f'127.0.0.1:{PORT}',f'localhost:{PORT}') or self.headers.get('Origin') not in (None,f'http://127.0.0.1:{PORT}',f'http://localhost:{PORT}'):return self.send(403,b'{"error":"Local catalogue only."}')
        route=unquote(urlsplit(self.path).path)
        if route=='/api/goods':
            try:
                data,revision=goods();return self.send(304,b'',etag=revision) if self.headers.get('If-None-Match')=='"'+revision+'"' else self.send(200,data,etag=revision)
            except Exception:return self.send(503,b'{"error":"Goods data unavailable. Reload to try again."}')
        if route=='/api/bonding-curves':
            try:
                data,revision=approved('bonding-curves');return self.send(200,data,etag=revision)
            except Exception:return self.send(503,b'{"error":"Reviewed stock curves unavailable."}')
        if route=='/api/formulas':
            try:
                data,revision=formulas();return self.send(304,b'',etag=revision) if self.headers.get('If-None-Match')=='"'+revision+'"' else self.send(200,data,etag=revision)
            except Exception:return self.send(503,b'{"error":"Formula examples unavailable. Reload to try again."}')
        if route=='/stock-pricing.js':
            try:
                data,revision=approved('stock-pricing');return self.send(200,data,'text/javascript; charset=utf-8',etag=revision)
            except Exception:return self.send(503,b'{"error":"Reviewed pricing model unavailable."}')
        if route=='/mechanics':
            try:return self.send(200,present_header(mechanics(),'goods'),'text/html; charset=utf-8')
            except Exception:return self.send(503,b'{"error":"Trading mechanics reference unavailable. Reload to try again."}')
        if route=='/mechanics.css':return self.send(200,(SITE/'mechanics.css').read_bytes(),'text/css; charset=utf-8')
        files={'/curves':SITE/'curves.html','/curves.js':SITE/'curves.js','/curve-domain.js':SITE/'curve-domain.js','/curves.css':SITE/'curves.css','/quote-prices.js':SITE/'quote-prices.js','/distribution-view.js':SITE/'distribution-view.js','/formulas':SITE/'formulas.html','/formulas.css':SITE/'formulas.css','/formulas.js':SITE/'formulas.js','/':SITE/'index.html','/catalogue.js':SITE/'catalogue.js','/goods-view.js':SITE/'goods-view.js','/catalogue.css':SITE/'catalogue.css','/catalogue-shell.css':ROOT/'Local/catalogue-shell.css'};file=files.get(route)
        if not file or not file.is_file():return self.send(404,b'{"error":"Not found."}')
        data=file.read_bytes()
        if file.suffix=='.html':data=present_header(data,'goods')
        return self.send(200,data,(mimetypes.guess_type(file)[0] or 'application/octet-stream')+'; charset=utf-8')
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
