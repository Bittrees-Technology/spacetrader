"use strict";
// Derive the game's presentation order from the same approved all-station catalogue
// shown by Item summary. No prices or gameplay inputs are changed.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const pointer=JSON.parse(fs.readFileSync(path.join(root,'Balance/current.json'))),catalogue=JSON.parse(fs.readFileSync(path.join(root,'Balance',path.dirname(pointer.manifest),'goods.json'))),E=require('../Browser/engine.js');
const lows={};for(const g of E.goods){const quotes=catalogue.rows.filter(r=>r.item===g.id&&Number.isFinite(r.lowBuy)).map(r=>r.lowBuy);if(!quotes.length)throw Error('Approved global buy low missing: '+g.id);lows[g.id]=Math.min(...quotes);}
const generated='// BEGIN APPROVED GLOBAL BUY LOWS\nconst marketBuyLows=Object.freeze('+JSON.stringify(lows)+');\n// END APPROVED GLOBAL BUY LOWS',file=path.join(root,'Browser/app.js'),source=fs.readFileSync(file,'utf8'),pattern=/\/\/ BEGIN APPROVED GLOBAL BUY LOWS[\s\S]*?\/\/ END APPROVED GLOBAL BUY LOWS/;
if(!pattern.test(source))throw Error('Exchange order block is missing');const next=source.replace(pattern,generated);if(process.argv.includes('--write')){if(next!==source)fs.writeFileSync(file,next);}else if(next!==source)throw Error('Global exchange order differs from the approved dashboard; run Tools/sync_exchange_order.cjs --write');
console.log('Global exchange order matches '+E.goods.length+' approved item-summary buy lows.');
