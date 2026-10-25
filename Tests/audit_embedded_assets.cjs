'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const source=path.join(root,'Browser'),build=path.join(root,'TauriStandalone/src-tauri/target/release/build'),binaryPath=path.join(process.env.HOME,'Applications/Spacetrader.app/Contents/MacOS/Spacetrader'),binary=fs.readFileSync(binaryPath);
const files=fs.readdirSync(source,{recursive:true}).filter(n=>fs.statSync(path.join(source,n)).isFile()),expected=new Map(files.map(n=>[sha(fs.readFileSync(path.join(source,n))),n])),appHash=sha(fs.readFileSync(path.join(source,'app.js'))),portraitHash=sha(fs.readFileSync(path.join(source,'portrait-renderer.js')));
const unpack=b=>{try{return zlib.brotliDecompressSync(b)}catch{return b}};
let cache;for(const dir of fs.readdirSync(build).filter(d=>d.startsWith('spacetrader-tauri-'))){const candidate=path.join(build,dir,'out/tauri-codegen-assets');if(!fs.existsSync(candidate))continue;const hashes=new Set(fs.readdirSync(candidate).filter(n=>n.endsWith('.js')).map(n=>sha(unpack(fs.readFileSync(path.join(candidate,n))))));if(hashes.has(appHash)&&hashes.has(portraitHash)){cache=candidate;break;}}
assert(cache,'Current generated embedded assets must exist');
const matched=new Set(),unused=[],rewritten=[];let embedded=0;
// Tauri retains superseded compressed chunks in this reproducible compiler cache.
// Verify the current source against payloads actually present in the installed binary.
for(const n of fs.readdirSync(cache)){const packed=fs.readFileSync(path.join(cache,n));if(binary.indexOf(packed)<0){unused.push(n);continue;}embedded++;const raw=unpack(packed);if(expected.has(sha(raw)))matched.add(sha(raw));else rewritten.push({cache:n,raw:raw.toString()});}
const unmatched=files.filter(n=>!matched.has(sha(fs.readFileSync(path.join(source,n)))));assert.deepEqual(unmatched,['index.html']);assert.equal(rewritten.length,1);assert(/<!doctype html>/i.test(rewritten[0].raw));
const scripts=s=>[...s.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);assert.equal(scripts(rewritten[0].raw).length,11);assert.deepEqual(scripts(rewritten[0].raw),scripts(fs.readFileSync(path.join(source,'index.html'),'utf8')));
const report={binary:binaryPath,binarySHA256:sha(binary),embeddedAssetPayloadsVerified:embedded,sourceFilesWithExactEmbeddedContent:files.length-1,htmlOnlyNormalizedByTauri:true,htmlScriptListMatchesSource:true,unmatchedSourceFiles:unmatched,missingEmbeddedPayloads:[],unusedCompilerCacheFiles:unused};fs.writeFileSync(path.join(root,'Build/transition-embedded-audit.json'),JSON.stringify(report,null,2));console.log('PASS embedded application assets: '+JSON.stringify(report));
