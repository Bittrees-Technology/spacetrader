#!/usr/bin/env python3
"""Static, read-only Guide on loopback. No player data, engine or save access."""
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit,unquote
import mimetypes,json,hashlib
ROOT=Path(__file__).resolve().parents[2];SITE=Path(__file__).parent
import sys
sys.path.insert(0,str(ROOT/'Local'))
from catalogue_shell import present_header

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def send(self,status,data,kind='application/json; charset=utf-8',etag=None):
        self.send_response(status);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-cache');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        if etag:self.send_header('ETag','"'+etag+'"')
        self.end_headers()
        if data:self.wfile.write(data)
    def do_GET(self):
        if self.headers.get('Host') not in ('127.0.0.1:8878','localhost:8878') or self.headers.get('Origin') not in (None,'http://127.0.0.1:8878','http://localhost:8878'):
            return self.send(403,b'{"error":"Local catalogue only."}')
        path=unquote(urlsplit(self.path).path)
        files={'/catalogue-shell.css':ROOT/'Local/catalogue-shell.css','/':SITE/'index.html','/guide.js':SITE/'guide.js','/guide.css':SITE/'guide.css'}
        if path=='/':
            try:
                manifest=json.loads((SITE/'reference-manifest.json').read_text())
                if manifest['mode']!='reference' or hashlib.sha256((SITE/'index.html').read_bytes()).hexdigest()!=manifest['indexSHA256']:raise ValueError('Guide snapshot mismatch')
            except Exception:return self.send(503,b'{"error":"Guide reference unavailable."}')
        file=files.get(path)
        if not file or not file.is_file():return self.send(404,b'{"error":"Not found."}')
        data=file.read_bytes()
        if file.suffix=='.html':data=present_header(data,'guide')
        return self.send(200,data,(mimetypes.guess_type(file)[0] or 'application/octet-stream')+('; charset=utf-8' if file.suffix in ('.html','.js','.css') else ''))
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',8878),Handler).serve_forever()
