'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),site=path.join(root,'Local/guide-catalogue'),sha=v=>crypto.createHash('sha256').update(v).digest('hex'),read=p=>fs.readFileSync(p),m=JSON.parse(read(path.join(site,'reference-manifest.json')));
assert.equal(m.mode,'reference');assert.equal(sha(read(path.join(root,'Local/catalogue_shell.py'))),m.headerSHA256);assert.equal(sha(read(path.join(site,'index.html'))),m.indexSHA256);assert.equal(sha(read(path.join(site,'guide-template.cjs'))),m.inputs.template);assert.equal(sha(read(path.join(site,'export.cjs'))),m.inputs.exporter);assert.equal(sha(read(path.join(site,'build.py'))),m.builderSHA256);assert.equal(sha(read(path.join(root,'Browser/engine.js'))),m.inputs.engine);
assert.equal(sha(read(path.join(root,'Local/formula_notation.py'))),m.notationSHA256);assert.equal(sha(read(path.join(root,'Local/formula-notation-witness.json'))),m.notationWitnessSHA256);
const src=read(path.join(root,'Browser/app.js')).toString(),helpers=[];
assert.equal(sha(read(path.join(root,'Local/goods-catalogue/mechanics-fragment.html'))),m.inputs.goodsMechanics);
assert.equal(sha(read(path.join(site,'bank-rate-ranges.json'))),m.inputs.bankRateRanges);
const rates=JSON.parse(read(path.join(site,'bank-rate-ranges.json'))),current=JSON.parse(read(path.join(root,'Balance/current.json')));
assert.equal(rates.mode,'reference');assert.equal(rates.engineSHA256,m.inputs.engine);assert.equal(rates.approvedRevision,current.revision);assert.equal(rates.rows.length,26);assert.equal(rates.stationQuotes,rates.days*rates.rows.length);
for(const name of ['navigationPlace','stationLabel','stationNames','establishmentTitle','establishmentDescription','governmentArchive','mapMotionText','mapAstronomyDetails','guideAstronomyDetails']){const a=src.indexOf('function '+name+'('),b=src.indexOf('\nfunction ',a+1);assert(a>=0&&b>a);helpers.push(src.slice(a,b));}
assert.equal(sha(helpers.join('\n')),m.inputs.helpers);assert.equal(new Set(m.topics.map(t=>t.id)).size,m.topics.length);assert(m.topics.length>=43);
console.log('Generic Guide verified: '+m.topics.length+' topics, static source fingerprints match.');
