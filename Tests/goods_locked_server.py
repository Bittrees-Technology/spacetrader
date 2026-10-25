"""Approved snapshots remain stable independently of live engine projection."""
from pathlib import Path
import importlib.util,threading,http.client,json,hashlib
ROOT=Path(__file__).resolve().parents[1];site=ROOT/'Local/goods-catalogue'
spec=importlib.util.spec_from_file_location('locked_goods',site/'serve.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
pointer=json.loads((ROOT/'Balance/current.json').read_text());baseline=ROOT/'Balance'/Path(pointer['manifest']).parent
server=m.ThreadingHTTPServer(('127.0.0.1',0),m.Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
def request(url,host='127.0.0.1:8877',origin=None,etag=None,method='GET'):
 c=http.client.HTTPConnection('127.0.0.1',server.server_port,timeout=5);headers={'Host':host}
 if origin:headers['Origin']=origin
 if etag:headers['If-None-Match']=etag
 c.request(method,url,headers=headers);r=c.getresponse();value=(r.status,dict(r.getheaders()),r.read());c.close();return value
try:
 for kind in ['goods','formulas']:
  status,headers,data=request('/api/'+kind);assert status==200
  assert data==(baseline/(kind+'.json')).read_bytes()
  assert json.loads(data)['approval']['revision']==pointer['revision']
  assert request('/api/'+kind,etag=headers['ETag'])[0]==304
  assert request('/api/'+kind,host='evil.example')[0]==403
  assert request('/api/'+kind,origin='https://evil.example')[0]==403
  assert request('/api/'+kind,method='POST')[0]==501
 for url in ['/Balance/current.json','/Balance/approved-v1/manifest.json','/../Balance/approved-v1/goods.json','/api/save']:assert request(url)[0]==404
 # Failure of snapshot integrity is rejected, rather than recomputing a different model.
 previous=m.hashlib.sha256
 class WrongDigest:
  def hexdigest(self):return '0'*64
 m.hashlib.sha256=lambda _:WrongDigest()
 assert request('/api/goods')[0]==503
 m.hashlib.sha256=previous
 assert request('/api/goods')[0]==200
 print('PASS immutable approved API responses, ETag, integrity failure, loopback/read-only and private-file protections')
finally:server.shutdown();server.server_close()
