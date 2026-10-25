#!/usr/bin/env python3
"""Ship catalogue: loopback only, no save access and no write endpoints."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
import mimetypes

SITE = Path(__file__).resolve().parent
ROOT = SITE.parents[1]
PORT = 8876

import sys
sys.path.insert(0,str(ROOT/'Local'))
from catalogue_shell import present_header

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send(self, status, data, kind='application/json; charset=utf-8'):
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        if data:
            self.wfile.write(data)

    def do_GET(self):
        if self.headers.get('Host') not in (f'127.0.0.1:{PORT}', f'localhost:{PORT}') or self.headers.get('Origin') not in (None, f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}'):
            return self.send(403, b'{"error":"Local catalogue only."}')
        path = unquote(urlsplit(self.path).path)
        files = {'/catalogue-shell.css': ROOT/'Local/catalogue-shell.css', '/': SITE/'index.html', '/catalogue.css': SITE/'catalogue.css',
                 '/catalogue.js': SITE/'catalogue.js', '/catalogue-model.js': SITE/'catalogue-model.js', '/ship-viewer.js': SITE/'ship-viewer.js', '/ship-designs.js': SITE/'ship-designs.js', '/approved-ships.js': SITE/'approved-ships.js', '/cargo-specs.js': SITE/'cargo-specs.js', '/ship-rules.js': SITE/'ship-rules.js', '/ship-specs.js': SITE/'ship-specs.js'}
        files.update({f'/vendor/three/{name}': SITE/'vendor/three'/name for name in ('three.module.js','three.core.min.js','OrbitControls.js','RoomEnvironment.js','LICENSE')})
        file = files.get(path)
        if not file or not file.is_file():
            return self.send(404, b'{"error":"Not found."}')
        data=file.read_bytes()
        if file.suffix=='.html':data=present_header(data,'ships')
        return self.send(200,data, (mimetypes.guess_type(file)[0] or 'application/octet-stream') + '; charset=utf-8')

if __name__ == '__main__':
    print(f'Spacetrader ships: http://127.0.0.1:{PORT}/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
