#!/usr/bin/env python3
"""Loopback preview of the generated static public edition, never the local voyage service."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

STATIC = Path(__file__).resolve().parent / '.vercel/output/static'


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ['/goods/curves', '/goods/formulas', '/goods/mechanics']:
            self.path = path + '.html'
        super().do_GET()

    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8903), partial(Handler, directory=str(STATIC)))
    print('Public guest preview: http://127.0.0.1:8903/play/', flush=True)
    server.serve_forever()
