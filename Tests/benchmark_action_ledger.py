"""Compare the old browser save path and both new ledger writers on isolated 32-ship states."""
from pathlib import Path
import sys,json,tempfile,subprocess,time,statistics,importlib.util
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'Local'));from shared_save_server import SaveStore
baseline=ROOT/json.loads((ROOT/'Build/ledger-baseline.json').read_text())['rollback']/'Local/shared_save_server.py'
spec=importlib.util.spec_from_file_location('old_save',baseline);old=importlib.util.module_from_spec(spec);spec.loader.exec_module(old)
raw=(ROOT/'Build/ActionLedgerQA/large-voyage.json').read_text();value=json.loads(raw);states=[]
for i in range(80):value['credits']-=1;states.append(json.dumps(value,separators=(',',':')))
def stats(values):
 s=sorted(values);return {'medianMs':round(statistics.median(s),3),'p95Ms':round(s[int(len(s)*.95)],3),'maxMs':round(max(s),3),'samples':len(s)}
result={'method':'80 isolated valid resolved 32-ship states, warm validation, durable acknowledgment including payload validation and IPC/pipe transport for native; no rendering','initialStateBytes':len(raw.encode()),'results':{}}
with tempfile.TemporaryDirectory() as folder:
 for name,klass in [('previousBrowser',old.SaveStore),('ledgerBrowser',SaveStore)]:
  store=klass(Path(folder)/name,ROOT/'Browser/engine.js','/opt/homebrew/bin/node');revision=store.write('auto',raw,None)['revision'];times=[]
  for i,state in enumerate(states):
   action={'id':name+'-'+str(i),'type':'buy','args':{'good':'water','units':1},'version':'0.68.0','source':'browser'};t=time.perf_counter();reply=store.write('auto',state,revision,action=action) if name=='ledgerBrowser' else store.write('auto',state,revision);times.append((time.perf_counter()-t)*1000);revision=reply['revision']
  result['results'][name]=stats(times)
  if hasattr(store,'close'):store.close()
  result['results'][name]['bytesOnDisk']=sum(p.stat().st_size for p in (Path(folder)/name).iterdir() if p.is_file())
 vault=Path(folder)/'native';p=subprocess.Popen([str(ROOT/'Build/tauri-save-driver'),str(vault)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 def request(body):
  p.stdin.write(json.dumps({'path':'/api/voyage','method':'POST','body':json.dumps(body)})+'\n');p.stdin.flush();r=json.loads(p.stdout.readline());assert r['status']==200,r;return r['body']
 revision=request({'key':'auto','raw':raw,'revision':None})['revision'];times=[]
 for i,state in enumerate(states):
  body={'key':'auto','raw':state,'revision':revision,'action':{'id':'native-'+str(i),'type':'buy','args':{'good':'water','units':1},'source':'mac','version':'0.68.0'}};t=time.perf_counter();reply=request(body);times.append((time.perf_counter()-t)*1000);revision=reply['revision']
 p.stdin.close();p.wait(timeout=10);p.stdout.close();p.stderr.close();result['results']['ledgerNative']=stats(times);result['results']['ledgerNative']['bytesOnDisk']=sum(v.stat().st_size for v in vault.iterdir() if v.is_file())
(ROOT/'Build/ledger-backend-performance.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
