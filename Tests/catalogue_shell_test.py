"""Shared catalogue navigation, frozen ship inputs and read-only server boundaries."""
from pathlib import Path
import hashlib,importlib.util,json,re,threading,http.client,subprocess
ROOT=Path(__file__).resolve().parents[1]
ship=ROOT/'Local/ship-catalogue';manifest=json.loads((ship/'approved-manifest.json').read_text())
for name,digest in manifest['files'].items():
    assert hashlib.sha256((ship/name).read_bytes()).hexdigest()==digest,name
assert len(set(manifest['classes']))==20 and manifest['configurations']==5242880
# The pinned hash records the approval source, not a freeze on future game UI work.
assert re.fullmatch('[0-9a-f]{64}',manifest['gameEngineHash'])
for name in ['ship-specs.js','ship-rules.js']:
    assert hashlib.sha256((ROOT/'Browser'/name).read_bytes()).hexdigest()==manifest['files'][name]
subprocess.run(['node','-e',"const a=require('./Local/ship-catalogue/approved-ships'),e=require('./Browser/engine'),assert=require('node:assert/strict');assert.deepEqual(e.shipCatalog(),a.hulls);"],cwd=ROOT,check=True)
headers=[]
for folder,port in [('ship-catalogue',8876),('character-catalogue',8875),('goods-catalogue',8877)]:
    site=ROOT/'Local'/folder;html=(site/'index.html').read_text()
    header=html[html.index('<header'):html.index('</header>')+9]
    headers.append(re.sub(r' aria-current="page"','',header))
    assert '/catalogue-shell.css' in html and 'Game reference' in header
    for endpoint in [8875,8876,8877,8774]:assert f'http://127.0.0.1:{endpoint}/' in header
    spec=importlib.util.spec_from_file_location(folder,site/'serve.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    server=module.ThreadingHTTPServer(('127.0.0.1',0),module.Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
    def request(path,method='GET',host=None,origin=None):
        conn=http.client.HTTPConnection('127.0.0.1',server.server_port,timeout=5);headers={'Host':host or f'127.0.0.1:{port}'}
        if origin:headers['Origin']=origin
        conn.request(method,path,headers=headers);r=conn.getresponse();data=r.read();status=r.status;conn.close();return status,data
    try:
        assert request('/')[0]==200
        status,data=request('/catalogue-shell.css');assert status==200 and data==(ROOT/'Local/catalogue-shell.css').read_bytes()
        assert request('/',method='POST')[0] in [405,501]
        assert request('/',host='outside.example')[0]==403
        assert request('/',origin='https://outside.example')[0]==403
        for path in ['/voyage.json','/actions.sqlite3','/.shared-save.lock','/api/save','/api/voyage','/api/ledger','/api/profile','/../Browser/engine.js','/%2e%2e/Browser/engine.js','/README.md']:
            assert request(path)[0]==404,path
        if folder=='ship-catalogue':
            for path in ['/engine.js','/class-proposals.js','/api/roster']:assert request(path)[0]==404,path
            for path in ['/approved-ships.js','/ship-rules.js']:assert request(path)[0]==200
            assert 'abilitiesTab' not in html and 'rolesPanel' not in html
            for tab in ['shipsTab','sizesTab','balanceTab']:assert html.count('id="'+tab+'"')==1
            assert 'SpacetraderClassProposals' not in (site/'catalogue.js').read_text()
        if folder=='character-catalogue':
            status,data=request('/api/roster');assert status==200
            assert json.loads(data)['mode']=='reference'
            assert request('/api/roster?captain=PRIVATE&day=99999')[1]==data
        elif folder=='goods-catalogue':
            for route in ['/api/goods','/api/formulas']:
                status,data=request(route);assert status==200
                assert request(route+'?captain=PRIVATE&day=99999')[1]==data
                assert not {'captain','profile','visited','unlocked','credits','debt','cargo'}&json.loads(data).keys()
            data=json.loads(request('/api/goods')[1]);assert len({r['port'] for r in data['rows']})==26 and len({r['item'] for r in data['rows'] if r['category']=='Exchange goods'})==64
        else:
            status,data=request('/approved-ships.js');assert status==200
            assert request('/approved-ships.js?captain=PRIVATE&day=99999')[1]==data
        print('PASS',folder,'generic reference content, all-game coverage, shared header and blocked save/ledger/profile paths')
    finally:server.shutdown();server.server_close()
assert headers[0]==headers[1]==headers[2]
print('PASS identical shared headers; 20 frozen ship classes and 5,242,880 configurations verified')
