"""Isolated durability, shared ownership, replay safety and latency checks."""
from pathlib import Path
import unittest,tempfile,subprocess,json,sys,sqlite3,zlib,hashlib,threading,concurrent.futures,time,statistics,importlib.util
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'Local'));from shared_save_server import SaveStore,Conflict
import voyage_ledger as ledger
class LedgerTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name);self.store=SaveStore(self.path,ROOT/'Browser/engine.js','/opt/homebrew/bin/node')
  self.raw=(ROOT/'Build/ActionLedgerQA/voyage.json').read_text();self.native=subprocess.Popen([str(ROOT/'Build/tauri-save-driver'),str(self.path)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 def tearDown(self):
  self.native.stdin.close();self.native.wait(timeout=10);self.native.stdout.close();self.native.stderr.close();self.store.close();self.tmp.cleanup()
 def native_request(self,body=None,path='/api/voyage'):
  self.native.stdin.write(json.dumps({'method':'POST' if body else 'GET','path':path,'body':json.dumps(body) if body else None})+'\n');self.native.stdin.flush();return json.loads(self.native.stdout.readline())
 def event(self,id,kind='buy'):return {'id':id,'type':kind,'args':{'units':1,'good':'water'},'version':'0.68.0','source':'browser'}
 def write(self,raw=None,revision=None,id='test-1'):
  return self.store.write('auto',raw or self.raw,revision,action=self.event(id))
 def test_import_keeps_original_and_checkpoint_bytes(self):
  self.store.atomic('voyage.json',self.raw);self.store.atomic('checkpoint.json',self.raw);before={p.name:p.read_bytes() for p in self.path.glob('*.json')}
  first=self.native_request()['body'];second=self.store.snapshot();self.assertEqual(first['raw'],self.raw);self.assertEqual(second['sequence'],1);self.assertEqual(first['revision'],second['revision']);self.assertEqual(len(self.store.history()['entries']),1)
  self.assertEqual(before,{p.name:p.read_bytes() for p in self.path.glob('*.json')});self.assertEqual(self.store.history()['entries'][0]['type'],'legacy-import')
 def test_exact_actions_and_resolved_random_state_cross_editions(self):
  a=self.write();v=json.loads(self.raw);v['credits']-=100;v['seed']='123456789';b=json.dumps(v)
  action=self.event('native-2');action['source']='mac';r=self.native_request({'key':'auto','raw':b,'revision':a['revision'],'action':action});self.assertEqual(r['status'],200);self.assertEqual(r['body']['sequence'],2)
  self.assertEqual(self.store.snapshot()['raw'],b);self.assertEqual(self.store.entry(1)['raw'],self.raw);self.assertEqual(self.store.entry(2)['raw'],b)
  row=self.store.db.execute('SELECT action_json,payload,revision,parent_revision FROM entries WHERE seq=2').fetchone();self.assertEqual(json.loads(row[0]),{'args':action['args'],'source':'mac'});self.assertEqual(zlib.decompress(row[1]).decode(),b);self.assertEqual(hashlib.sha256(b.encode()).hexdigest(),row[2]);self.assertEqual(row[3],a['revision'])
 def test_original_action_arguments_are_readable_on_both_history_transports(self):
  self.write(id='metadata-test')
  browser=self.store.history()['entries'][0]
  native=self.native_request(path='/api/ledger')['body']['entries'][0]
  self.assertEqual(browser['args'],{'units':1,'good':'water'})
  self.assertEqual(native['args'],browser['args'])
  self.assertEqual(self.store.snapshot()['sequence'],1)
 def test_noop_action_has_its_own_sequence_and_stale_revision_is_rejected(self):
  a=self.write();b=self.write(revision=a['revision'],id='no-change-2');self.assertEqual(b['sequence'],2);self.assertNotEqual(a['revision'],b['revision'])
  with self.assertRaises(Conflict):self.write(revision=a['revision'],id='stale')
  self.assertEqual(self.store.snapshot()['sequence'],2)
 def test_lost_reply_retry_never_duplicates_or_replaces_newer_head(self):
  a=self.write();v=json.loads(self.raw);v['credits']-=1;b=json.dumps(v);self.write(b,a['revision'],'test-2')
  again=self.native_request({'key':'auto','raw':self.raw,'revision':None,'action':self.event('test-1')});self.assertEqual(again['status'],200);self.assertEqual(again['body']['sequence'],2);self.assertEqual(again['body']['raw'],b)
  with self.assertRaises(ValueError):self.write(b,again['body']['revision'],'test-1')
  self.assertEqual(len(self.store.history()['entries']),2)
 def test_append_only_and_explicit_restore_preserve_future_history(self):
  a=self.write();v=json.loads(self.raw);v['credits']-=10;b=json.dumps(v);second=self.write(b,a['revision'],'test-2');restored=self.store.write('auto',self.raw,second['revision'],action=self.event('restore-3','restore'))
  self.assertEqual(restored['sequence'],3);self.assertEqual(self.store.entry(2)['raw'],b)
  for sql in ['DELETE FROM entries','UPDATE entries SET kind=\'changed\'']:
   with self.assertRaises(sqlite3.DatabaseError):self.store.db.execute(sql)
  self.assertEqual(len(self.store.history()['entries']),3)
 def test_native_browser_race_commits_only_one(self):
  a=self.write();v=json.loads(self.raw);v['credits']-=1;b=json.dumps(v);barrier=threading.Barrier(2)
  def browser():
   barrier.wait()
   try:self.write(b,a['revision'],'browser-race');return 200
   except Conflict:return 409
  def native():barrier.wait();return self.native_request({'key':'auto','raw':b,'revision':a['revision'],'action':self.event('native-race')})['status']
  with concurrent.futures.ThreadPoolExecutor(2) as pool:
   x=pool.submit(browser);y=pool.submit(native);self.assertEqual(sorted([x.result(),y.result()]),[200,409])
  self.assertEqual(self.store.snapshot()['sequence'],2)
 def test_transaction_crash_discards_only_uncommitted_entry(self):
  a=self.write();script="import sqlite3,sys,time;d=sqlite3.connect(sys.argv[1]);d.execute('BEGIN IMMEDIATE');d.execute(\"INSERT INTO entries(operation_id,parent_revision,revision,kind,action_json,engine_version,created_ms,summary_json,payload) SELECT 'crashed',parent_revision,revision,kind,action_json,engine_version,created_ms,summary_json,payload FROM entries LIMIT 1\");print('ready',flush=True);time.sleep(30)"
  process=subprocess.Popen([sys.executable,'-c',script,str(self.path/'actions.sqlite3')],stdout=subprocess.PIPE,text=True);self.assertEqual(process.stdout.readline().strip(),'ready');process.kill();process.wait();process.stdout.close()
  self.assertEqual(self.store.snapshot()['revision'],a['revision']);self.assertEqual(self.native_request()['body']['raw'],self.raw);self.assertEqual(len(self.store.history()['entries']),1)
 def test_failed_commit_never_advances_and_history_remains_readable(self):
  a=self.write();self.store.db.execute("CREATE TRIGGER fail_insert BEFORE INSERT ON entries BEGIN SELECT RAISE(ABORT,'full disk'); END")
  with self.assertRaises(sqlite3.DatabaseError):self.write(revision=a['revision'],id='failed')
  self.assertEqual(self.store.snapshot()['revision'],a['revision']);self.assertEqual(self.store.entry(1)['raw'],self.raw)
 def test_history_pages_cover_every_entry_and_are_read_only(self):
  rev=None
  for i in range(70):rev=self.write(revision=rev,id='page-'+str(i))['revision']
  all=[];before=9223372036854775807
  while True:
   page=self.store.history(before)['entries'];all.extend(v['sequence'] for v in page[:30])
   if len(page)<=30:break
   before=page[29]['sequence']
  self.assertEqual(all,list(range(70,0,-1)));self.assertEqual(self.native_request(path='/api/ledger?before=41')['body']['entries'][0]['sequence'],40);self.assertEqual(self.native_request(path='/api/ledger/1')['body']['raw'],self.raw);self.assertEqual(self.store.snapshot()['sequence'],70)
 def test_bad_ids_metadata_and_payload_never_append(self):
  a=self.write()
  for action in [{'id':'../escape','type':'buy','args':{}},{'id':'bad','type':'buy','args':'wrong'},{'id':'bad','type':'buy','args':{},'source':'remote'}]:
   with self.assertRaises(ValueError):self.store.write('auto',self.raw,a['revision'],action=action)
  self.assertEqual(self.store.snapshot()['sequence'],1)
 def test_regular_action_and_unchanged_poll_do_not_return_legacy_checkpoint_payloads(self):
  self.store.atomic('checkpoint.json',' '*1000000+self.raw)
  first=self.native_request({'key':'auto','raw':self.raw,'revision':None,'action':self.event('minimal')})
  self.assertEqual(first['status'],200);self.assertNotIn('slots',first['body'])
  poll=self.native_request(path='/api/voyage?since='+first['body']['revision'])
  self.assertTrue(poll['body']['unchanged']);self.assertNotIn('raw',poll['body']);self.assertNotIn('slots',poll['body']);self.assertLess(len(json.dumps(poll)),600)
  self.assertEqual(self.store._file_raw('checkpoint.json'),' '*1000000+self.raw)
 def test_linked_ledger_sidecars_are_refused_without_touching_target(self):
  # Separate directory because the current store intentionally keeps its SQLite handle open.
  other=self.path/'other';other.mkdir();target=self.path/'private';target.write_text('original');(other/'actions.sqlite3-wal').symlink_to(target)
  with self.assertRaises(ValueError):ledger.connect(other)
  self.assertEqual(target.read_text(),'original')
 def test_restarting_both_readers_returns_latest_without_reexecuting_engine(self):
  a=self.write();v=json.loads(self.raw);v['seed']='987654321';raw=json.dumps(v);self.write(raw,a['revision'],'random-result');self.store.close();self.store=SaveStore(self.path,ROOT/'Browser/engine.js','/opt/homebrew/bin/node');self.assertEqual(self.store.snapshot()['raw'],raw);self.assertEqual(self.native_request()['body']['raw'],raw)
if __name__=='__main__':unittest.main(verbosity=2)
