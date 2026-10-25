#!/usr/bin/env python3
"""Loopback preview of the generated static public edition, never the local voyage service."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json
import re

STATIC = Path(__file__).resolve().parent / '.vercel/output/static'


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        path = urlsplit(self.path).path
        config = json.loads((STATIC.parent / 'config.json').read_text())
        for route in config['routes']:
            if route.get('status') == 308 and re.fullmatch(route['src'], path):
                self.send_response(308)
                self.send_header('Location', route['headers']['Location'])
                self.end_headers()
                return
        if path in ['/goods/curves', '/goods/formulas', '/goods/mechanics']:
            self.path = path + '.html'
        super().do_GET()

    def end_headers(self):
        config = json.loads((STATIC.parent / 'config.json').read_text())
        self.send_header('Content-Security-Policy', config['routes'][0]['headers']['Content-Security-Policy'])
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8903), partial(Handler, directory=str(STATIC)))
    print('Public guest preview: http://127.0.0.1:8903/play/', flush=True)
    server.serve_forever()
