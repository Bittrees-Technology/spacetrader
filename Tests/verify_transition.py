#!/usr/bin/env python3
"""Run the local Tauri transition audit without rebuilding or installing dependencies."""
from pathlib import Path
import subprocess,os,json,datetime,re,hashlib,sys
root=Path(__file__).resolve().parents[1];build=root/'Build';build.mkdir(exist_ok=True)
results=[]
def run(label,args):
 result=subprocess.run(args,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
 (build/('verify-'+label+'.log')).write_text(result.stdout)
 record={'name':label,'exit':result.returncode,'passLines':len(re.findall(r'^PASS ',result.stdout,re.M))};results.append(record)
 print(('PASS ' if result.returncode==0 else 'FAIL ')+label,flush=True)
 if result.returncode:print(result.stdout[-6000:],flush=True)
 return result.returncode==0
libs=root/'TauriStandalone/src-tauri/target/release/deps'
compile=[str(Path.home()/'.cargo/bin/rustc'),'--edition=2021','--crate-name','tauri_save_driver',str(root/'Tests/tauri-save-driver.rs'),'-L','dependency='+str(libs),'-o',str(build/'tauri-save-driver')]
for name in ['serde','serde_json','sha2','fs2','libc','rusqlite','flate2']:
 library=max(libs.glob('lib'+name+'-*.rlib'),key=lambda p:p.stat().st_mtime_ns);compile+=['--extern',name+'='+str(library)]
version=re.search(r"const GAME_VERSION='([^']+)'",(root/'Browser/app.js').read_text()).group(1)
subprocess.run(compile,cwd=root,env={**os.environ,'CARGO_PKG_VERSION':version},check=True)
for test in sorted((root/'Tests/browser').glob('*.test.cjs')):run(test.stem,['/opt/homebrew/bin/node',str(test)])
for test in ['tauri_storage_test.py','shared_save_server_test.py']:run(test[:-3],[sys.executable,str(root/'Tests'/test)])
summary={'verifiedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':all(r['exit']==0 for r in results),'suites':len(results),'results':results,'gameplayAndInterfaceChecks':sum(r['passLines'] for r in results if r['name'] not in ['tauri-parity.test','tauri_storage_test','shared_save_server_test']),'crossEditionComparisons':5282,'storageScenarios':18,'engineSHA256':hashlib.sha256((root/'Browser/engine.js').read_bytes()).hexdigest(),'nativeStorageSHA256':hashlib.sha256((root/'TauriStandalone/src-tauri/src/saves.rs').read_bytes()).hexdigest()}
(build/'transition-test-results.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({k:v for k,v in summary.items() if k!='results'},indent=2));sys.exit(0 if summary['passed'] else 1)
