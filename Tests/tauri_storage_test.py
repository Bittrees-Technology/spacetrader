from pathlib import Path
import unittest,tempfile,subprocess,json,importlib.util,concurrent.futures,threading,os
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('shared',root/'Local/shared_save_server.py');shared=importlib.util.module_from_spec(spec);spec.loader.exec_module(shared)
class TauriStorage(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)
  self.native=subprocess.Popen([str(root/'Build/tauri-save-driver'),str(self.path)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
  self.browser=shared.SaveStore(self.path,root/'Browser/engine.js','/opt/homebrew/bin/node')
  self.a=subprocess.check_output(['/opt/homebrew/bin/node','-e',"const E=require(process.argv[1]);process.stdout.write(JSON.stringify(E.transact(E.fresh(),'create',{name:'Storage QA',background:'engineer',temperament:'measured'})));",str(root/'Browser/engine.js')],text=True)
  x=json.loads(self.a);x['credits']-=10;self.b=json.dumps(x);x['credits']-=10;self.c=json.dumps(x)
 def tearDown(self):
  self.native.stdin.close();self.native.wait(timeout=10);self.native.stdout.close();self.native.stderr.close();self.browser.close();self.tmp.cleanup()
 def request(self,method='GET',path='/api/voyage',body=None):
  self.native.stdin.write(json.dumps(dict(method=method,path=path,body=json.dumps(body) if body else None))+'\n');self.native.stdin.flush();return json.loads(self.native.stdout.readline())
 def write(self,raw,revision=None,key='auto',preserve=False):return self.request('POST',body=dict(key=key,raw=raw,revision=revision,preserve=preserve))
 def test_fresh_save_restart_and_private_permissions(self):
  self.assertIsNone(self.request()['body']['raw']);r=self.write(self.a);self.assertEqual(r['status'],200);self.assertEqual(self.browser.raw('voyage.json'),self.a)
  self.assertEqual((self.path/'actions.sqlite3').stat().st_mode&0o777,0o600);self.assertEqual(self.path.stat().st_mode&0o777,0o700)
  self.native.stdin.close();self.native.wait(timeout=10);self.native.stdout.close();self.native.stderr.close()
  self.native=subprocess.Popen([str(root/'Build/tauri-save-driver'),str(self.path)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
  self.assertEqual(self.request()['body']['raw'],self.a)
 def test_native_browser_native_revision_conflicts(self):
  first=self.write(self.a)['body'];second=self.browser.write('auto',self.b,first['revision']);self.assertEqual(self.request()['body']['raw'],self.b)
  self.assertEqual(self.write(self.c,first['revision'])['status'],409);third=self.write(self.c,second['revision']);self.assertEqual(third['status'],200);self.assertEqual(self.browser.raw('voyage.json'),self.c)
  with self.assertRaises(shared.Conflict):self.browser.write('auto',self.a,second['revision'])
 def test_simultaneous_native_and_browser_only_one_commits(self):
  for i in range(12):
   first=self.write(self.a,self.request()['body']['revision'])['body'];barrier=threading.Barrier(2)
   def native():barrier.wait();return self.write(self.b,first['revision'])['status']
   def browser():
    barrier.wait()
    try:self.browser.write('auto',self.c,first['revision']);return 200
    except shared.Conflict:return 409
   with concurrent.futures.ThreadPoolExecutor(2) as pool:
    a=pool.submit(native);b=pool.submit(browser);self.assertEqual(sorted([a.result(),b.result()]),[200,409])
   self.assertIn(self.browser.raw('voyage.json'),[self.b,self.c])
 def test_checkpoints_backup_pages_and_idempotent_retries(self):
  first=self.write(self.a)['body'];self.write(self.a,first['revision'],'checkpoint');r=self.write(self.b,first['revision'],'checkpoint');self.assertEqual(r['status'],200)
  self.assertEqual(self.browser.raw(r['body']['backup']),self.a);self.assertEqual(self.browser.raw('voyage.json'),self.a)
  second=self.write(self.b,first['revision'],preserve=True);self.assertEqual(second['status'],200);before=len(self.browser.backups());self.assertEqual(self.write(self.b,first['revision'],preserve=True)['status'],200);self.assertEqual(len(self.browser.backups()),before)
  self.assertEqual(len(self.request(path='/api/backups?offset=0')['body']['backups']),before)
  self.assertEqual(self.request(path='/api/backups?offset=100001')['status'],503)
 def test_invalid_requests_and_symlink_save_are_preserved(self):
  for raw in ['invalid','{}']:
   self.assertNotEqual(self.write(raw)['status'],200)
  self.assertNotEqual(self.write(self.a,key='../../escape')['status'],200);self.assertEqual(self.request(path='/anything')['status'],404);self.assertFalse((self.path/'voyage.json').exists())
  external=self.path/'original';external.write_text(self.a);(self.path/'voyage.json').symlink_to(external)
  self.assertNotEqual(self.request()['status'],200);self.assertNotEqual(self.write(self.b)['status'],200);self.assertEqual(external.read_text(),self.a)
 def test_checkpoint_overwrite_delete_and_cross_client_conflicts(self):
  current=self.write(self.a)['body'];revision=current['revision']
  def change(raw,expected,key='slot1',rev=revision):return self.request('POST','/api/checkpoint',dict(key=key,raw=raw,expected=expected,revision=rev))
  self.assertEqual(change(self.a,None)['status'],200)
  replaced=change(self.b,self.a);self.assertEqual(replaced['status'],200);self.assertEqual(self.browser.raw(replaced['body']['backup']),self.a)
  with self.assertRaises(shared.Conflict):self.browser.checkpoint('slot1',None,self.a,revision)
  self.assertEqual(self.browser.raw('slot1.json'),self.b)
  self.assertEqual(change(None,self.a)['status'],409)
  removed=change(None,self.b);self.assertEqual(removed['status'],200);self.assertIsNone(removed['body']['slots']['slot1']);self.assertEqual(self.browser.raw(removed['body']['backup']),self.b)
  self.assertEqual(self.request()['body']['raw'],self.a);self.assertEqual(self.request()['body']['sequence'],current['sequence']);self.assertEqual(self.request()['body']['revision'],revision)
  for key in ['auto','checkpoint','slot4','../voyage']:
   self.assertNotEqual(change(None,None,key)['status'],200)
  self.assertNotEqual(self.request('POST','/api/checkpoint',dict(key='slot2',expected=None,revision=revision))['status'],200)
  self.assertEqual(change(self.b,None,'slot2')['status'],200)
  self.browser.checkpoint('slot2',self.c,self.b,revision)
  self.assertEqual(change(None,self.b,'slot2')['status'],409)
  self.assertEqual(self.browser.raw('slot2.json'),self.c)
  self.assertEqual(change(None,self.c,'slot2','stale')['status'],409)
  self.assertEqual(change('invalid',None,'slot3')['status'],503)
 def test_second_native_instance_cannot_open_same_vault(self):
  self.request();r=subprocess.run([str(root/'Build/tauri-save-driver'),str(self.path)],input='',text=True,capture_output=True);self.assertNotEqual(r.returncode,0);self.assertIn('already running',r.stderr)
if __name__=='__main__':unittest.main(verbosity=2)
