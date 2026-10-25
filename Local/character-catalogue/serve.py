#!/usr/bin/env python3
"""Static, loopback-only character reference. No player-data access."""
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit,unquote
import hashlib,json,mimetypes
ROOT=Path(__file__).resolve().parents[2]; SITE=Path(__file__).parent

def roster():
    # Serve the reviewed static snapshot. No save/ledger paths, locks or subprocesses.
    manifest=json.loads((SITE/'reference-manifest.json').read_bytes())
    if manifest.get('version')!=1 or manifest.get('mode')!='reference' or manifest.get('snapshot')!='reference-roster.json':
        raise ValueError('Invalid character reference manifest.')
    data=(SITE/'reference-roster.json').read_bytes()
    revision=hashlib.sha256(data).hexdigest()
    if revision!=manifest['sha256']:raise ValueError('Character reference failed verification.')
    return revision,data

import sys
sys.path.insert(0,str(ROOT/'Local'))
from catalogue_shell import present_header

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def send(self,status,data,kind='application/json; charset=utf-8',etag=None):
        self.send_response(status);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-cache');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        if etag:self.send_header('ETag','"'+etag+'"')
        self.end_headers()
        if data:self.wfile.write(data)
    def do_GET(self):
        if self.headers.get('Host') not in ('127.0.0.1:8875','localhost:8875') or self.headers.get('Origin') not in (None,'http://127.0.0.1:8875','http://localhost:8875'):
            return self.send(403,b'{"error":"Local catalogue only."}')
        path=unquote(urlsplit(self.path).path)
        if path=='/api/roster':
            try:
                revision,data=roster()
                return self.send(304,b'',etag=revision) if self.headers.get('If-None-Match')=='"'+revision+'"' else self.send(200,data,etag=revision)
            except Exception:return self.send(503,b'{"error":"Character reference unavailable. Reload to try again."}')
        files={'/catalogue-shell.css': ROOT/'Local/catalogue-shell.css','/':SITE/'index.html','/catalogue.js':SITE/'catalogue.js','/catalogue.css':SITE/'catalogue.css','/portrait-renderer.js':ROOT/'Browser/portrait-renderer.js'}
        if path.startswith('/station-portraits/') and Path(path).name==path.removeprefix('/station-portraits/') and path.endswith('.svg'):files[path]=ROOT/'Browser/station-portraits'/Path(path).name
        file=files.get(path)
        if not file or not file.is_file():return self.send(404,b'{"error":"Not found."}')
        data=file.read_bytes()
        if file.suffix=='.html':data=present_header(data,'characters')
        return self.send(200,data,(mimetypes.guess_type(file)[0] or 'application/octet-stream')+('; charset=utf-8' if file.suffix in ('.html','.js','.css') else ''))
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',8875),Handler).serve_forever()
