'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const src=fs.readFileSync('Browser/app.js','utf8');
function functionText(name){const a=src.indexOf('function '+name+'('),b=src.indexOf('\nfunction ',a+1);return src.slice(a,b);}
let open=true,closed=false,focused=null;const main={inert:false},header={inert:false},footer={inert:false},skip={inert:false},sidebar={inert:false},shade={hidden:true};
const make=id=>({id,disabled:false,tabIndex:0,closest:()=>null,getClientRects:()=>[{}],focus(){focused=this;}}),first=make('map'),last=make('last-dialog'),nodes=[first,make('menu'),make('dialog-close'),last];let event;
const dialog={get open(){return open;},dispatchEvent:e=>{event=e;},focus(){focused=this;}};
const doc={addEventListener:()=>{},activeElement:null,querySelectorAll:selector=>selector.startsWith('.screen-main')?[main,header,footer,skip]:nodes};const ctx={document:doc,$:id=>id==='modal'?dialog:shade,Event};vm.createContext(ctx);require('./station-label-test-helpers.cjs')(ctx);
vm.runInContext(functionText('syncPopoutScope'),ctx);vm.runInContext(functionText('popoutKeydown'),ctx);
ctx.syncPopoutScope();assert(main.inert&&header.inert&&footer.inert&&skip.inert);assert(!sidebar.inert&&!shade.hidden);open=false;ctx.syncPopoutScope();assert(!main.inert&&!footer.inert&&shade.hidden);open=true;
function key(key,active,shiftKey=false){doc.activeElement=active;focused=null;let prevented=false,stopped=false;ctx.popoutKeydown({key,shiftKey,preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});return {prevented,stopped};}
assert(key('Tab',last).prevented);assert.equal(focused,first);assert(key('Tab',first,true).prevented);assert.equal(focused,last);assert(!key('Tab',nodes[1]).prevented);assert(key('Tab',{}).prevented);assert.equal(focused,first);
assert(key('Escape',last).prevented);assert.equal(event.type,'cancel');assert(event.cancelable);open=false;event=null;assert(!key('Escape',last).prevented);assert.equal(event,null);
assert(src.includes("$('modal').show()"));assert(!src.includes("$('modal').showModal()"));assert(src.includes("if(a==='screen'){if(modalKind)closeModal(true);"));assert(src.includes("if(state?.incident&&!modalKind&&!journey)showEncounter()"));assert(src.includes("if(b.closest('.game-shell>aside')&&journey)finishJourney()"));
console.log('PASS main/header/footer inert while sidebar remains live; scope released on close; keyboard wrap includes sidebar and dialog; Escape dispatch and closed state; sidebar screen close and required incident restoration.');
