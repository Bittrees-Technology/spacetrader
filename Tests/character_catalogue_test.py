"""Static reference coverage, save independence, checksum and HTTP boundaries."""
from pathlib import Path
import importlib.util,tempfile,subprocess,threading,hashlib,json,http.client
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'Local/character-catalogue'
spec=importlib.util.spec_from_file_location('catalogue',SITE/'serve.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
assert not hasattr(mod,'VAULT')
assert not any(name in vars(mod) for name in ['voyage_ledger','fcntl','subprocess'])
manifest=json.loads((SITE/'reference-manifest.json').read_bytes());static=(SITE/'reference-roster.json').read_bytes()
assert hashlib.sha256(static).hexdigest()==manifest['sha256']
# Arbitrary input is deliberately ignored by the offline exporter.
for raw in [b'',b'{"profile":{"name":"PRIVATE CAPTAIN"},"day":7654,"castSeed":"999"}',b'invalid voyage']:
 assert subprocess.check_output(['/opt/homebrew/bin/node',str(SITE/'project-roster.cjs')],input=raw,cwd=ROOT)==static
print('PASS static exporter is deterministic and independent of captain, day, seed and malformed voyage input')
server=mod.ThreadingHTTPServer(('127.0.0.1',0),mod.Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
def request(path,method='GET',extra=None):
 c=http.client.HTTPConnection('127.0.0.1',server.server_port,timeout=12);c.request(method,path,headers={'Host':'127.0.0.1:8875',**(extra or {})});r=c.getresponse();data=r.read();headers=dict(r.getheaders());status=r.status;c.close();return status,data,headers
try:
 status,data,headers=request('/api/roster');assert status==200 and data==static;roster=json.loads(data)
 assert roster['mode']=='reference' and roster['reviewScope']=='full-game' and roster['assignmentStatus']=='fixed'
 assert roster['counts']=={'staff':256,'guests':104,'uniqueNames':360,'uniquePortraits':360}
 assert not {'captain','day','profile','credits','debt','cargo','visited','unlocked'}&roster.keys()
 assert roster['coverage']=={'stationCount':26,'expectedStaff':256,'actualStaff':256,'complete':True,'missing':[],'unexpected':[]}
 assert len(roster['reservedDesigns'])==256 and len(roster['stations'])==26
 assert all('unlocked' not in p and p['staff']==p['establishments'] for p in roster['stations'])
 assert all(v['establishmentType'] and v['person'] and v['role'] and v['station'] for v in roster['rows'] if not v['guest'])
 assert not any('iteration' in v['person'].lower() for v in roster['rows'])
 print('PASS all26 stations,256 fixed staff and104 reference visitor examples without player or discovery fields')
 assert request('/api/roster',extra={'If-None-Match':headers['ETag']})[0]==304
 assert request('/api/roster?captain=PRIVATE&day=999&profile=other')[1]==static
 print('PASS reference ETag and content do not vary with profile-shaped query parameters')
 with tempfile.TemporaryDirectory() as tmp:
  vault=Path(tmp)/'private-voyage';vault.mkdir();(vault/'voyage.json').write_text('PRIVATE CAPTAIN');(vault/'actions.sqlite3').write_text('not a database');(vault/'.shared-save.lock').write_text('private lock')
  original_open=Path.open
  def guarded_open(path,*args,**kwargs):
   if str(vault) in str(path) or '/Library/Containers/' in str(path):raise AssertionError('Catalogue attempted player-file access: '+str(path))
   return original_open(path,*args,**kwargs)
  with patch.object(Path,'home',side_effect=AssertionError('Catalogue attempted home/save discovery')),patch.object(Path,'open',guarded_open),patch('subprocess.run',side_effect=AssertionError('Live roster generation is forbidden')):
   assert request('/api/roster')[1]==static
  (vault/'voyage.json').write_text('DIFFERENT CAPTAIN DAY98765')
  assert request('/api/roster')[1]==static
  # A damaged static snapshot fails closed without falling back to a voyage.
  fake=Path(tmp)/'static';fake.mkdir();(fake/'reference-manifest.json').write_bytes((SITE/'reference-manifest.json').read_bytes());(fake/'reference-roster.json').write_bytes(b'changed snapshot')
  with patch.object(mod,'SITE',fake):
   status,error,_=request('/api/roster');assert status==503 and b'Character reference unavailable' in error and b'PRIVATE' not in error
 print('PASS no save/home discovery, locks, ledger or live projection; save changes have no effect; tampered reference fails closed')
 for path in ['/../Browser/engine.js','/voyage.json','/actions.sqlite3','/.shared-save.lock','/Browser/engine.js','/api/save','/api/voyage','/api/ledger','/api/profile','/%2e%2e/Browser/world.js']:
  assert request(path)[0]==404,path
 assert request('/api/roster','POST')[0]==501
 assert request('/api/roster',extra={'Host':'attacker.invalid'})[0]==403
 assert request('/api/roster',extra={'Origin':'https://attacker.invalid'})[0]==403
 assert request('/')[0]==200 and request('/portrait-renderer.js')[0]==200
 print('PASS unrelated/player files, remote origins, hostile host headers and mutations refused; public reference assets available')
finally:server.shutdown();server.server_close()
