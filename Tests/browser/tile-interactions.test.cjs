'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/../../Browser/app.js','utf8');
const code=src.slice(src.indexOf('function installTileInteractions('),src.indexOf('let modalPresentation='));
let count=0;
function test(name,body){body();console.log('PASS '+name);count++;}
function fixture(kind='utility'){
 const listeners={},inside={},content={},other={},tiles=[{open:true,contains:t=>t===inside||t===content},{open:true,contains:t=>t===other}];
 const doc={addEventListener:(key,fn)=>{listeners[key]=fn;},querySelectorAll:()=>tiles.filter(t=>t.open)};
 const dialog={open:true,dataset:{presentation:'1'},getBoundingClientRect:()=>({left:100,top:100,right:500,bottom:600})};
 const f={kind,closed:0,doc,dialog,tiles,inside,content,other};
 const c=vm.createContext({Set});vm.runInContext(code,c);c.installTileInteractions(doc,dialog,()=>f.kind,()=>f.closed++);
 f.event=(key,target=dialog,x=50,y=50,extra={})=>listeners[key]({button:0,pointerId:1,target,clientX:x,clientY:y,...extra});
 return f;
}
test('opening another tile collapses its siblings and retains the clicked tile',()=>{const f=fixture();f.event('pointerdown',f.inside,200,200);assert.equal(f.tiles[0].open,true);assert.equal(f.tiles[1].open,false);});
test('buttons and text inside expanded content keep the parent open',()=>{const f=fixture();f.event('pointerdown',f.content,200,200);assert.equal(f.tiles[0].open,true);assert.equal(f.closed,0);});
test('outside tile clicks collapse all expanded tiles',()=>{const f=fixture();f.event('pointerdown',{},200,200);assert(f.tiles.every(t=>!t.open));});
test('an outside click closes each ordinary popout',()=>{for(const kind of ['utility','establishment','portrait','financial','station-detail','help','story','creator','backups','ship-receipt']){const f=fixture(kind);f.event('pointerdown');f.event('pointerup');assert.equal(f.closed,1,kind);}});
test('clicking blank padding inside the dialog keeps it open',()=>{const f=fixture();f.event('pointerdown',f.dialog,110,110);f.event('pointerup',f.dialog,110,110);assert.equal(f.closed,0);});
test('required encounters, journey playback and consequential confirmations stay open',()=>{for(const kind of ['encounter','journey','new','abandon','ship-exchange']){const f=fixture(kind);f.event('pointerdown');f.event('pointerup');assert.equal(f.closed,0,kind);}});
test('new-charter confirmation opened from Menu dismisses only its top layer',()=>{const f=fixture('new');f.dialog.dataset.menuParent='true';f.event('pointerdown');f.event('pointerup');assert.equal(f.closed,1);});
test('dragging text from inside to outside does not dismiss',()=>{const f=fixture();f.event('pointerdown',f.content,200,200);f.event('pointerup');assert.equal(f.closed,0);});
test('dragging from outside into dialog does not dismiss',()=>{const f=fixture();f.event('pointerdown');f.event('pointerup',f.dialog,200,200);assert.equal(f.closed,0);});
test('cancelled touch does not dismiss',()=>{const f=fixture();f.event('pointerdown');f.event('pointercancel');f.event('pointerup');assert.equal(f.closed,0);});
test('a different touch pointer cannot dismiss',()=>{const f=fixture();f.event('pointerdown');f.event('pointerup',f.dialog,50,50,{pointerId:2});assert.equal(f.closed,0);});
test('a newly presented nested popout cannot be dismissed by a stale press',()=>{const f=fixture();f.event('pointerdown');f.dialog.dataset.presentation='2';f.event('pointerup');assert.equal(f.closed,0);});
test('closed dialogs and secondary clicks do not dismiss',()=>{const f=fixture();f.dialog.open=false;f.event('pointerdown');f.event('pointerup');assert.equal(f.closed,0);f.dialog.open=true;f.event('pointerdown',f.dialog,50,50,{button:2});f.event('pointerup',f.dialog,50,50,{button:2});assert.equal(f.closed,0);});
test('switching disclosure headers does not move the target between press and click',()=>{const f=fixture(),summary={closest:()=>summary};f.tiles[1].contains=t=>t===summary;f.tiles[1].open=false;f.event('pointerdown',summary,200,200);assert(f.tiles[0].open,'keep the existing content height until the click lands');f.event('click',summary,200,200);f.tiles[1].open=true;assert(!f.tiles[0].open);assert(f.tiles[1].open);});
test('main-pane shade dismisses while sidebar presses remain navigation actions',()=>{const f=fixture(),shade={id:'modal-shade'},sidebar={id:'sidebar'};f.event('pointerdown',shade);f.event('pointerup',shade);assert.equal(f.closed,1);f.closed=0;f.event('pointerdown',sidebar);f.event('pointerup',sidebar);assert.equal(f.closed,0);});
console.log(`${count} tile and popout interaction scenarios passed.`);
