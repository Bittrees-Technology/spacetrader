from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'Local'))
from shared_save_server import SharedHandler,SaveStore,ThreadingHTTPServer
class Review(SharedHandler):
 def do_GET(self):
  paths={'/ledger-benchmark':('Tests/ledger_benchmark_page.html','text/html'),'/ledger-benchmark.js':('Tests/ledger_benchmark_page.js','text/javascript'),'/benchmark-fixture':('Build/ActionLedgerQA/large-voyage.json','application/json')}
  path=self.path.split('?')[0]
  if path not in paths:return super().do_GET()
  if not self.allowed():return self.respond(403,{'error':'Local test only'})
  name,kind=paths[path];data=(ROOT/name).read_bytes();self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
import threading
store=SaveStore(ROOT/'Build/ActionLedgerQA',ROOT/'Browser/engine.js','/opt/homebrew/bin/node')
for port in [8891,8892]:
 server=ThreadingHTTPServer(('127.0.0.1',port),Review);server.browser=ROOT/'Browser';server.store=store
 threading.Thread(target=server.serve_forever,daemon=True).start()
threading.Event().wait()
