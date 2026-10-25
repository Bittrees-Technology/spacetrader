from pathlib import Path
import sys,unittest,tempfile,threading,json,subprocess,http.client,importlib.util,concurrent.futures
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('shared',root/'Local/shared_save_server.py');shared=importlib.util.module_from_spec(spec);spec.loader.exec_module(shared)
class SharedSaveTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)
  self.store=shared.SaveStore(self.path,root/'Browser/engine.js','/opt/homebrew/bin/node')
  self.server=shared.ThreadingHTTPServer(('127.0.0.1',0),shared.SharedHandler);self.server.browser=root/'Browser';self.server.store=self.store
  self.port=self.server.server_port;self.origin='http://127.0.0.1:'+str(self.port)
  self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start()
  def voyage(name):return subprocess.check_output(['/opt/homebrew/bin/node','-e',"const E=require(process.argv[1]);process.stdout.write(JSON.stringify(E.transact(E.fresh(),'create',{name:process.argv[2],background:'engineer',temperament:'measured'})));",str(root/'Browser/engine.js'),name],text=True)
  self.a=voyage('Mac captain');self.b=voyage('Browser captain');self.c=voyage('Continued captain');self.store.atomic('voyage.json',self.a)
 def tearDown(self):self.server.shutdown();self.server.server_close();self.thread.join();self.store.close();self.tmp.cleanup()
 def request(self,method,path='/api/voyage',body=None,headers=None):
  defaults={'Host':'127.0.0.1:'+str(self.port)}
  if method=='POST':defaults.update({'Origin':self.origin,'Content-Type':'application/json','X-Spacetrader':'shared-save-v1'})
  defaults.update(headers or {});conn=http.client.HTTPConnection('127.0.0.1',self.port,timeout=10)
  conn.request(method,path,json.dumps(body) if body is not None else None,defaults);response=conn.getresponse();data=response.read();status=response.status;conn.close()
  try:data=json.loads(data)
  except:data=data.decode()
  return status,data
 def write(self,raw,revision,key='auto',preserve=False):return self.request('POST',body=dict(key=key,raw=raw,revision=revision,preserve=preserve))
 def test_native_browser_native_same_file(self):
  status,a=self.request('GET');self.assertEqual(status,200);self.assertEqual(a['raw'],self.a)
  status,b=self.write(self.b,a['revision']);self.assertEqual(status,200);self.assertEqual(self.store.raw('voyage.json'),self.b)
  request={'path':'/api/voyage','method':'POST','body':json.dumps(dict(key='auto',raw=self.c,revision=b['revision'],preserve=False))}
  result=subprocess.run([str(root/'Build/tauri-save-driver'),str(self.path)],input=json.dumps(request)+'\n',text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['status'],200)
  status,c=self.request('GET');self.assertEqual(status,200);self.assertEqual(c['raw'],self.c)
  self.assertEqual(self.write(self.a,b['revision'])[0],409);self.assertEqual(self.store.raw('voyage.json'),self.c)
 def test_simultaneous_tabs_one_wins(self):
  revision=self.store.revision();barrier=threading.Barrier(2)
  def run(raw):barrier.wait();return self.write(raw,revision)[0]
  with concurrent.futures.ThreadPoolExecutor(2) as pool:results=list(pool.map(run,[self.b,self.c]))
  self.assertEqual(sorted(results),[200,409]);self.assertIn(self.store.raw('voyage.json'),[self.b,self.c])
 def test_checkpoint_and_load_undo_preservation(self):
  revision=self.store.revision();status,r=self.write(self.b,revision,'checkpoint');self.assertEqual(status,200)
  self.assertEqual(r['slots']['checkpoint'],self.b);self.assertEqual(self.store.raw('voyage.json'),self.a)
  status,r=self.write(self.c,revision,'checkpoint');self.assertEqual(status,200);self.assertEqual(self.store.raw(r['backup']),self.b)
  status,r=self.write(self.c,revision,preserve=True);self.assertEqual(status,200);self.assertEqual(self.store.raw(r['backup']),self.a)
  status,r=self.write(self.a,r['revision'],preserve=True);self.assertEqual(status,200);self.assertEqual(self.store.raw(r['backup']),self.c)
 def test_checkpoint_endpoint_overwrite_delete_recovery_and_stale_guards(self):
  status,current=self.request('GET');revision=current['revision']
  def change(raw,expected,key='slot1',headers=None):return self.request('POST','/api/checkpoint',dict(key=key,raw=raw,expected=expected,revision=revision),headers)
  self.assertEqual(change(self.b,None)[0],200)
  status,r=change(self.c,self.b);self.assertEqual(status,200);self.assertEqual(self.store.raw(r['backup']),self.b)
  self.assertEqual(change(None,self.b)[0],409)
  status,r=change(None,self.c);self.assertEqual(status,200);self.assertIsNone(r['slots']['slot1']);self.assertEqual(self.store.raw(r['backup']),self.c)
  self.assertEqual(r['raw'],self.a);self.assertEqual(r['revision'],revision);self.assertEqual(r['sequence'],current['sequence'])
  for key in ['auto','checkpoint','slot4','../voyage']:self.assertEqual(change(None,None,key)[0],400)
  self.assertEqual(change(self.b,None,'slot2',{'Origin':'https://other.example'})[0],403)
  self.assertEqual(change(self.b,None,'slot2')[0],200)
  def fail(name):raise OSError('full disk')
  self.store.preserve=fail
  self.assertEqual(change(None,self.b,'slot2')[0],503);self.assertEqual(self.store.raw('slot2.json'),self.b)
 def test_invalid_data_and_unknown_paths_never_write(self):
  revision=self.store.revision()
  for raw in ['invalid','{}',json.dumps({**json.loads(self.a),'credits':-1})]:self.assertEqual(self.write(raw,revision)[0],400)
  self.assertEqual(self.write(self.b,revision,'../../escape')[0],400);self.assertEqual(self.store.raw('voyage.json'),self.a)
 def test_other_origins_hosts_and_missing_csrf_header_are_denied(self):
  body=dict(key='auto',raw=self.b,revision=self.store.revision())
  for headers in [{'Origin':'https://other.example'},{'X-Spacetrader':''},{'Host':'other.example'},{'Sec-Fetch-Site':'cross-site'},{'Origin':'null'}]:self.assertEqual(self.request('POST',body=body,headers=headers)[0],403)
  self.assertEqual(self.request('GET',headers={'Origin':'https://other.example'})[0],403);self.assertEqual(self.store.raw('voyage.json'),self.a)
 def test_retry_of_acknowledged_save_is_idempotent(self):
  revision=self.store.revision();status,first=self.write(self.b,revision,preserve=True);self.assertEqual(status,200)
  status,again=self.write(self.b,revision,preserve=True);self.assertEqual(status,200);self.assertEqual(first['revision'],again['revision']);self.assertEqual(len(self.store.backups()),1)
 def test_failed_preservation_prevents_replacement(self):
  def fail(name):raise OSError('full disk')
  self.store.preserve=fail
  self.assertEqual(self.write(self.b,self.store.revision(),preserve=True)[0],503);self.assertEqual(self.store.raw('voyage.json'),self.a)
 def test_failed_ledger_commit_retains_current_and_backup(self):
  revision=self.store.revision()
  self.store.db.execute("CREATE TRIGGER test_full_disk BEFORE INSERT ON entries BEGIN SELECT RAISE(ABORT,'simulated storage failure'); END")
  self.assertEqual(self.write(self.b,revision,preserve=True)[0],503);self.assertEqual(self.store.raw('voyage.json'),self.a);self.assertEqual(self.store.backups()[0]['raw'],self.a)
 def test_recovery_pages_reach_all_older_voyages_without_file_access(self):
  for i in range(65):self.store.atomic('voyage-backup-'+str(100+i)+'-abc.json',self.a)
  pages=[]
  for offset in [0,30,60]:
   status,value=self.request('GET','/api/backups?offset='+str(offset));self.assertEqual(status,200);pages.append(value['backups'])
  self.assertEqual([len(p) for p in pages],[31,31,5]);keys=[b['key'] for p in pages for b in p[:30]];self.assertEqual(len(keys),65);self.assertEqual(len(set(keys)),65)
  self.assertEqual(self.store.raw('voyage.json'),self.a)
 def test_invalid_recovery_page_is_rejected_without_touching_storage(self):
  for offset in ['-1','100001','invalid']:self.assertEqual(self.request('GET','/api/backups?offset='+offset)[0],400)
  self.assertEqual(self.store.raw('voyage.json'),self.a)
 def test_unreadable_voyage_is_exposed_without_replacing_it(self):
  self.store.atomic('voyage.json','unreadable original');status,value=self.request('GET');self.assertEqual(status,200);self.assertEqual(value['raw'],'unreadable original');self.assertEqual(self.store.raw('voyage.json'),'unreadable original')
 def test_local_assets_only_no_directory_or_source_exposure(self):
  self.assertEqual(self.request('GET','/')[0],200)
  for path in ['/../Source/GameStore.swift','/portraits/','/api/unknown','/%2e%2e/README.txt']:self.assertEqual(self.request('GET',path)[0],404)
  self.assertEqual(self.server.server_address[0],'127.0.0.1')
if __name__=='__main__':
 suite=unittest.defaultTestLoader.loadTestsFromTestCase(SharedSaveTests);result=unittest.TextTestRunner(verbosity=0).run(suite)
 if result.wasSuccessful():
  for name in unittest.defaultTestLoader.getTestCaseNames(SharedSaveTests):print('PASS local shared service '+name.replace('test_','').replace('_',' '))
  print(str(result.testsRun)+' local shared-save and cross-edition scenarios passed.')
 else:sys.exit(1)
