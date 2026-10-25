/* Offline portrait workshop. Appearance never consumes the simulation's random stream.
   Identity geometry stays fixed across jobs; wardrobe and setting follow the establishment.
   The original raster library remains available as a fallback and in the artwork archive. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpacetraderPortraits=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const pools=Object.freeze({robot:4096,human:3072,veyr:2048,ilyri:1024});
const speciesOrder=Object.freeze(['robot','human','veyr','ilyri']);
const cache=new Map(),cacheLimit=192;
function hash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;return n>>>0;}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
const number=n=>Math.round(n*100)/100;
const paint=c=>/^[a-f\d]{6}$/i.test(c)?'#'+c:c;
const path=(d,fill,stroke='',width=1)=>`<path d="${d}" fill="${paint(fill)}"${stroke?` stroke="${paint(stroke)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
const ellipse=(x,y,rx,ry,fill,stroke='',width=1)=>`<ellipse cx="${number(x)}" cy="${number(y)}" rx="${number(rx)}" ry="${number(ry)}" fill="${paint(fill)}"${stroke?` stroke="${paint(stroke)}" stroke-width="${width}"`:''}/>`;
const rect=(x,y,w,h,fill,r=0,stroke='')=>`<rect x="${number(x)}" y="${number(y)}" width="${number(w)}" height="${number(h)}" rx="${r}" fill="${paint(fill)}"${stroke?` stroke="${paint(stroke)}"`:''}/>`;
const line=(x,y,x2,y2,c,w=1)=>path(`M${number(x)} ${number(y)}L${number(x2)} ${number(y2)}`,'none',c,w);
const polygon=(points,fill,stroke='',width=1)=>path(points.map((p,i)=>(i?'L':'M')+p.map(number).join(' ')).join('')+'Z',fill,stroke,width);
function mix(a,b,t){return '#'+[0,2,4].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
const materials={human:['D6AB89','B78661','9B674A','77503B','583B30','CA9676','E0C0A1','8A5A48'],robot:['AABCC0','6C8592','C7BD9C','8B8F91','D8D6CB','747B8C','A58365','809F96'],veyr:['9C96B6','80A5AC','AA93A8','8297BE','B3ABBC','8DA7A3','B3997D','787F9D'],ilyri:['5C958B','4C777E','759F8C','638990']};
const roleDesigns={
 market:{color:'566B61',accent:'C4B27C',setting:'ledger',outfit:'waistcoat',prop:'manifest'},
 contracts:{color:'545F78',accent:'B8C8CF',setting:'routes',outfit:'tunic',prop:'slate'},
 shipyard:{color:'605D4E',accent:'D3A66C',setting:'workshop',outfit:'coveralls',prop:'tools'},
 fleet:{color:'435E6B',accent:'AFC8C8',setting:'hangar',outfit:'flightcoat',prop:'flight'},
 security:{color:'3E4D59',accent:'C6A878',setting:'patrol',outfit:'armor',prop:'radio'},
 relay:{color:'4D647C',accent:'9DCCCD',setting:'routes',outfit:'tunic',prop:'headset'},
 clinic:{color:'88A59D',accent:'DFE8D6',setting:'clinic',outfit:'scrubs',prop:'medic'},
 local:{color:'6C5867',accent:'D2B088',setting:'canteen',outfit:'apron',prop:'host'},
 bank:{color:'494C62',accent:'CBBE91',setting:'ledger',outfit:'formal',prop:'seal'},
 authority:{color:'344E68',accent:'C7B986',setting:'port',outfit:'uniform',prop:'licence'},
 warehouse:{color:'65644F',accent:'D7B27D',setting:'storage',outfit:'vest',prop:'scanner'},
 visitor:{color:'685E58',accent:'C6BC9C',setting:'commons',outfit:'travelcoat',prop:'satchel'},
 antiquarian:{color:'66526C',accent:'C5A983',setting:'canteen',outfit:'travelcoat',prop:'relic'}
};
function roleOf(v){const role=(v.role||'').toLowerCase();if(/antiquarian|archive hunter|cargo factor/.test(role))return 'antiquarian';if(/warehouse/.test(role))return 'warehouse';if(v.contactID){if(/medic/.test(role))return 'clinic';if(/technician|engineer|mechanic/.test(role))return 'shipyard';if(/pilot|navigator/.test(role))return 'fleet';if(/communications/.test(role))return 'relay';return 'visitor';}if(roleDesigns[v.id])return v.id;if(/engineer|mechanic/.test(role))return 'shipyard';if(/medic|clinic/.test(role))return 'clinic';return 'visitor';}
function base(species,index){species=pools[species]?species:'human';index=((Math.trunc(Number(index))||0)%pools[species]+pools[species])%pools[species];let n=index;const take=b=>{const x=n%b;n=Math.floor(n/b);return x;};return {species,index,style:take(species==='robot'?16:species==='human'?12:8),face:take(8),material:take(species==='ilyri'?4:8),life:take(4)};}
function describe(v,options={}){
 const species=pools[v.species]?v.species:'human',identityKey=species+'|'+(v.portraitKey||v.castKey||'')+'|'+(v.portraitPerson||v.person||'');
 const b=base(species,options.index??v.portraitIndex??hash(identityKey)%pools[species]);
 const c=v.character||{},personality=[c.tone||'',c.habit||'',c.value||'',c.cadence||''].join('|'),p=hash(personality),g=hash(identityKey+'|style|'+(v.appearance||'balanced')),style=v.portraitStyle||{},pick=(key,max,fallback)=>Number.isInteger(style[key])&&style[key]>=0&&style[key]<max?style[key]:fallback;
 const tone=String(c.tone||'').toLowerCase(),expression=/warm|cheer|friendly|playful|bright|wry/.test(tone)?0:/stern|blunt|guarded|severe|brisk/.test(tone)?1:/curious|inquisitive|excitable/.test(tone)?3:/calm|quiet|precise|patient|measured/.test(tone)?2:p%4;
 // Physical build and wardrobe are visual variety, independent of social identity.
 return {...b,identityKey,body:pick('body',4,hash(identityKey+'|body')%4),presentation:pick('presentation',6,g%6),ornament:pick('ornament',4,(g>>>5)%4),expression:Number.isInteger(options.expression)&&options.expression>=0&&options.expression<4?options.expression:expression,pose:Number.isInteger(options.pose)&&options.pose>=-2&&options.pose<=2?options.pose:(p>>>5)%5-2,detail:hash(identityKey+'|detail')%8,role:roleDesigns[options.role]?options.role:roleOf(v),wardrobe:pick('wardrobe',4,(hash(identityKey+'|wardrobe')+g)%4),personalityKey:personality};
}
function background(r,b){let s=rect(0,0,200,250,'url(#room)');s+=path('M0 204L200 174V250H0Z','#0b182665');
 for(let i=0;i<5;i++)s+=line(i*49-12,0,i*49-12,250,'#b9d4d018',1);
 if(['routes','hangar','port','patrol'].includes(r.setting)){s+=rect(123,19,65,110,'#0c2030',19,'#6f919370');s+=ellipse(176,57,32,31,'#91b4b51c');for(let i=0;i<13;i++)s+=ellipse(132+(i*17)%49,29+(i*23)%89,.6,.6,'#c7dadba0');if(r.setting==='routes')for(let i=0;i<4;i++)s+=path(`M130 ${40+i*18}Q170 ${14+i*19} 184 ${62+i*13}`,'none','#87c2c94a',.8);if(r.setting==='hangar')s+=polygon([[138,93],[158,78],[179,90],[169,96]],'#94b1b76a');}
 else if(r.setting==='workshop'||r.setting==='storage'){s+=rect(12,20,51,131,'#112735',3);for(let i=0;i<5;i++){s+=line(12,42+i*23,63,42+i*23,'#6c86865b',2);s+=rect(18+(i%2)*12,27+i*23,20,12,i%2?'#a2916c62':'#819f9a48',2);}s+=path('M181 0V77Q164 83 171 129','none','#839e9c65',4);}
 else if(r.setting==='clinic'){s+=rect(12,23,52,82,'#adcac523',6);s+=path('M17 69H26L30 55L35 82L41 62L47 69H59','none','#b4e5d285',1.8);s+=rect(161,106,18,34,'#b8d4c14a',3);}
 else if(r.setting==='canteen'||r.setting==='commons'){s+=path('M0 151H200','none','#d2bc9760',4);for(let i=0;i<4;i++){s+=rect(13+i*13,105-(i%2)*7,7,43+(i%2)*7,['#a8b79062','#c3a26b65','#91b5c262','#af89905c'][i],2);}s+=path('M162 0V43','none','#bbba9b',1);s+=ellipse(162,45,17,5,'#d6c89580');s+=polygon([[151,45],[174,45],[193,119],[133,119]],'#e3c4830c');}
 else {s+=rect(11,24,58,92,'#102431',4);for(let i=0;i<7;i++){s+=rect(17,32+i*11,16+i%3*11,2,'#9abcc45c',1);s+=rect(56,32+i*11,5,3,'#b9c48d75',1);}s+=rect(154,109,28,20,'#849e9a35',3);}
 return s+ellipse(96,236,82,12,'#030d1560');
}
function clothing(d,r,skin){const t=d.presentation,w=d.wardrobe,robot=d.species==='robot',shoulder=robot?77+d.life*3:67+(d.face%4)*2+d.body*3;
 let s=path(bodyPath(d),'url(#cloth)')+'<g clip-path="url(#bodyClip)" data-layer="fabric-surface">'+ellipse(136,213,66,48,'url(#clothLight)');
 for(let i=0;i<66;i++)s+=line(0,175+i*1.15,200,177+i*1.15,'#d1d5ca09',.22);s+='</g>';
 s+=path('M80 142H120V176Q100 196 80 176Z',robot?'url(#metal)':'url(#skin)');
 s+='<g clip-path="url(#neckClip)">'+ellipse(100,160,27,18,'url(#softShadow)')+'</g>';
 if(robot){s+=path('M84 174Q100 179 116 174','none','#36515a80',.7);for(const x of [87,114])s+=path(`M${x} 161V177`,'none','#c2d0c15c',.65);}
 if(r.outfit==='armor'){for(const side of [-1,1])s+=polygon([[100+side*40,176],[100+side*74,182],[100+side*82,204],[100+side*40,205],[100+side*28,190]],mix(r.color,'c0c7bb',.22),'#142934',1.5);s+=path('M58 201H142L134 241H66Z',mix(r.color,'192733',.36),'#88999b',.8);s+=line(100,203,100,244,'#afbbb7',1);}
 else if(r.outfit==='scrubs'){s+=path('M71 167L100 189L127 166L139 177L101 207L60 177Z','#d8e0d5');s+=path('M76 170L100 188L124 170','none','#536f71',1.2);s+=rect(38,218,34,24,'#566f70',2);s+=rect(46,226,18,4,'#e4eadf',1)+rect(53,219,4,18,'#e4eadf',1);}
 else if(r.outfit==='coveralls'||r.outfit==='vest'){for(const side of [-1,1])s+=polygon([[100+side*30,170],[100+side*43,177],[100+side*55,250],[100+side*35,250]],mix(r.color,r.accent,.53),'#1d3039',1);s+=rect(73,214,54,25,mix(r.color,'152b35',.3),3);for(let i=0;i<3;i++)s+=line(80,220+i*5,121,220+i*5,'#8e9d9b',.6);}
 else if(r.outfit==='apron'){s+=path('M74 173L128 173L140 250H61Z',mix(r.color,'2d312f',.36));s+=path('M75 188L75 170Q101 166 125 171V188','none',mix(r.accent,'70624e',.2),5);s+=path('M75 223H126V248H75Z','none','#b2a48b',1);}
 else if(r.outfit==='travelcoat'){s+=path('M76 164L55 178L75 250H96L88 188Z',mix(r.color,'dbc7a5',.25));s+=path('M120 164L146 177L127 250H105L111 190Z',mix(r.color,'c3b49e',.3));s+=path('M69 175Q100 202 133 174L122 201Q100 218 78 200Z',mix(r.accent,'56516b',.43));}
 else if(r.outfit==='flightcoat'){s+=path('M74 165L92 188L86 250H60L64 184Z',mix(r.color,r.accent,.25));s+=path('M125 165L109 188L115 250H141L137 184Z',mix(r.color,r.accent,.3));s+=path('M43 211H70V234H43Z','none','#b9c8c2',1.5);}
 else if(r.outfit==='uniform'){s+=path('M77 164L100 180L122 164L130 177L102 198L69 178Z',mix(r.color,'d2d7c6',.45));s+=line(100,198,100,250,'#afbdae',1.5);for(let i=0;i<4;i++)s+=ellipse(105,205+i*12,1.7,1.7,'#c4b081');for(let i=0;i<3;i++)s+=line(35+i*3,188,59+i*3,181,'#c5ad7b',1.3);}
 else {const low=t%2?194:184;s+=polygon([[72,166],[99,low],[78,209],[58,179]],mix(r.color,'d0cbbc',.35));s+=polygon([[125,166],[103,low],[121,209],[144,179]],mix(r.color,'d0cbbc',.47));s+=line(100,low,100,250,'#182b36',1.5);if(r.outfit==='formal')s+=polygon([[96,188],[104,188],[109,226],[100,234],[92,226]],'#b5a184');}
 // Small practical variations supplement the job's clearly readable silhouette.
 s+=rect(145,209,24,15,'#bacac0',2)+rect(149,213,12,1.5,'#435d65',.4)+rect(149,217,15,1.5,'#435d65',.4);
 if(w===0)s+=line(24,222,50,222,'#9da99b',1.8);if(w===1)s+=path('M22 250L35 193L46 190L34 250Z','#253746',r.accent,1);if(w===2)s+=path('M172 250L154 187L146 184L160 250Z',mix(r.accent,r.color,.5),'#273c43',1);if(w===3)s+=rect(29,228,25,17,mix(r.color,'c5bda8',.2),2);
 if(t===1||t===4)s+=path('M80 177Q101 212 122 177','none','#b7bca5',1)+ellipse(101,199,2.2,4,'#c4ad72');
 if(t===2||t===5)s+=line(66,183,61,196,r.accent,3)+ellipse(61,197,3,3,'#c2d0c7');
 if(r.prop==='tools'){for(let i=0;i<3;i++)s+=rect(126+i*6,218-i*3,4,21,['#8baca9','#c8b680','#b8c4bc'][i],1);}
 if(['slate','manifest','scanner','licence'].includes(r.prop))s+=path('M16 250L22 225L51 230L48 250Z','#263f4c','#829e9b',1)+line(27,234,43,237,'#b9d5ce',1);
 if(r.prop==='medic')s+=path('M68 178Q51 195 64 216M132 179Q148 195 133 215','none','#2c4b51',3)+ellipse(133,216,5,5,'#b5c5be','#2c4b51',2);
 if(r.prop==='host')s+=path('M137 241H161V250H137Z','#b7b49d')+path('M161 243Q176 241 164 250','none','#c7c6b4',2);
 if(r.prop==='relic')s+=polygon([[149,226],[155,216],[165,225],[156,238]],'#bdbd98','#e2d3a2',1);
 return s;
}
// A shared anatomical rig replaces the fixed coordinates of the first workshop.
// Every scalp root, fin, earpiece and ornament follows the same head and pose.
function anatomy(d){const human=d.species==='human',ilyri=d.species==='ilyri',robot=d.species==='robot';const w=robot?48+d.life*1.5:(human?44:ilyri?49:39)+(d.face%4)*2,chin=robot?164:human?164+Math.floor(d.face/4)*5:ilyri?168+Math.floor(d.face/4)*4:174+Math.floor(d.face/4)*3;
 return {w,chin,top:26,eyeY:(human?91:ilyri?89:88)+d.face%3*2,gap:human?19+d.face%3:ilyri?26:22,eyeW:human?10+d.face%2:ilyri?16:13,earY:101,earX:100+w-2,mouthY:chin-24,noseY:122+(ilyri?2:0),scalpY:53};}
function headPath(w,chin,face){return `M${100-w} 80C${98-w} 38 78 22 100 26C${96+w} 22 ${106+w} 42 ${100+w} 78C${102+w} 104 ${100+w*.88} ${chin-32} ${100+w*.72} ${chin-20}C${100+w*.55} ${chin-6} 116 ${chin+2} 100 ${chin}C84 ${chin+2} ${100-w*.57} ${chin-4} ${100-w*.76} ${chin-22}C${100-w*.96} ${chin-42} ${98-w} 100 ${100-w} 80Z`;}
function surface(d,kind='skin'){let dark='',light='',n=kind==='metal'?150:200;const g=anatomy(d);for(let i=0;i<n;i++){const x=number(100-g.w+((i*73+d.style*11)%997)/997*g.w*2),y=number(29+((i*137+d.face*19)%991)/991*(g.chin-29));if(kind==='metal'){const p=`M${x} ${y}h${number(.6+(i%5)*.35)}`;if(i%2)dark+=p;else light+=p;}else{const p=`M${x} ${y}h.18v.12h-.18Z`;if(i%3)dark+=p;else light+=p;}}
 return `<g opacity="${kind==='metal'?'.12':'.16'}">${path(dark,'none',kind==='metal'?'#243d48':'#4d3932',kind==='metal'?.16:.09)}${path(light,kind==='metal'?'none':'#eadcc2',kind==='metal'?'#eceddd':'',kind==='metal'?.13:.08)}</g>`;}
function crest(d,skin){const g=anatomy(d),w=g.w,a=d.style,shadow=mix(skin,'26344c',.46),hi=mix(skin,'d6e6d9',.4);let s='';
 if(d.species==='veyr'){
  // A continuous mineral root overlaps the scalp; separate crown tips grow from it.
  const left=100-w*.78,right=100+w*.78;
  s+=path(`M${left} 48Q100 15 ${right} 48L${right-3} 59Q100 37 ${left+3} 59Z`,'url(#mineral)');
  if(a===0)for(let i=0;i<7;i++){const x=left+i*(right-left)/6;s+=polygon([[x-5,47],[x-4,24-i%2*3],[x+2,19-i%3*2],[x+7,48]],'url(#mineral)');s+=line(x,27,x+1,43,hi,.6);}
  if(a===1)for(const side of [-1,1]){s+=polygon([[100+side*3,48],[100+side*13,8],[100+side*27,17],[100+side*28,52]],'url(#mineral)');s+=line(100+side*14,16,100+side*11,39,hi,.6);}
  if(a===2)s+=polygon([[left-2,49],[left+5,23],[94,16],[112,19],[right-4,27],[right+2,49],[113,44],[95,48]],'url(#mineral)')+path(`M${left+5} 27L94 21L112 24L${right-5} 33`,'none',hi,.6);
  if(a===3)for(let i=0;i<7;i++){const x=left+i*(right-left)/6;s+=polygon([[x-5,49],[x,13+Math.abs(i-3)*3],[x+6,49]],'url(#mineral)');s+=line(x,23+Math.abs(i-3)*2,x+1,43,hi,.6);}
  if(a===4)for(let i=0;i<7;i++){const x=left-7+i*(right-left+14)/6;s+=polygon([[94+i,51],[x-5,15+Math.abs(i-3)*2],[x+4,17+Math.abs(i-3)*2],[106+i*.5,50]],mix(skin,'b7d2cc',.2+i*.025));s+=line(100,46,x,20+Math.abs(i-3)*2,hi,.45);}
  if(a===5)s+=polygon([[left-3,49],[left+1,34],[left+8,33],[left+13,22],[92,26],[100,11],[109,26],[119,20],[123,33],[right+2,36],[right+4,50]],mix(skin,'344354',.25))+path(`M${left+4} 37L${left+14} 27L93 31L101 20L110 32L119 28L${right} 41`,'none',hi,.55);
  if(a===6)for(let i=0;i<5;i++){const x=left+i*(right-left)/4;s+=polygon([[x-7,49],[x-8,23+i%2*5],[x+5,25],[x+10,49]],mix(skin,'dbd8b7',.17+i*.04));s+=line(x-3,29,x+2,43,hi,.5);}
  if(a===7)s+=path(`M${left} 48Q${left-7} 23 ${left+8} 27Q84 6 99 26Q114 6 122 27Q${right+10} 23 ${right} 49L119 45L101 48L82 43Z`,'url(#mineral)');
  return `<g data-attachment="scalp-crown">${s}</g>`;
 }
 if(d.species==='ilyri')for(const side of [-1,1]){const x=100+side*(w-5),flip=ps=>ps.map(([dx,y])=>[x+side*dx,y]);
  // All membranes begin inside this fleshy attachment root, behind the cheek.
  s+=ellipse(x,105,9,27,'url(#fin)');
  if(a===0||a===4)for(let i=0;i<4;i++){const reach=(a===4?27:20)-i*1.8;s+=polygon(flip([[-6,84+i*8],[reach,69+i*11],[9,106+i*6],[-7,119+i*3]]),'url(#fin)');s+=path(`M${x-side*4} ${95+i*7}L${x+side*(reach-3)} ${75+i*11}`,'none',shadow+'85',.5);}
  if(a===1)for(let i=0;i<7;i++)s+=path(`M${x-side*3} ${88+i*4}Q${x+side*(24+i%2*3)} ${85+i*7} ${x+side*(14+i%3*3)} ${128+i*2}`,'none',mix(skin,'c3d4b4',.35),.85);
  if(a===2)s+=polygon(flip([[-6,89],[7,55],[17,47],[20,78],[3,129],[-7,125]]),'url(#fin)')+path(`M${x} 115L${x+side*12} 62`,'none',shadow+'90',.6);
  if(a===3)s+=path(`M${x-side*7} 87Q${x+side*38} 78 ${x+side*17} 119Q${x+side*5} 137 ${x-side*8} 122Z`,'url(#fin)');
  if(a===5)for(let i=0;i<6;i++)s+=ellipse(x+side*(5+i%2*3),88+i*7,7,4.5,'url(#fin)',shadow+'50',.35);
  if(a===6)s+=polygon(flip([[-7,86],[25,72],[17,91],[27,98],[12,108],[14,127],[-8,126]]),'url(#fin)');
  if(a===7)s+=path(`M${x-side*7} 85Q${x+side*34} 63 ${x+side*21} 94Q${x+side*38} 108 ${x+side*10} 131L${x-side*8} 122Z`,'url(#fin)');
  for(let j=0;j<4;j++)s+=path(`M${x-side*4} ${98+j*7}Q${x+side*10} ${99+j*7} ${x+side*3} ${109+j*6}`,'none',shadow+'b0',.65);
 }
 return `<g data-attachment="cheek-fins">${s}</g>`;
}
function hair(d,skin,back){if(d.species!=='human')return '';const g=anatomy(d),w=g.w,a=d.style,left=100-w,right=100+w,fill='url(#hairShade)',hairColor=['292424','4B382A','817364','1C252D','ABA69A','683F2D','B7A584','423B3C'][d.material],hc=d.life===3?mix(hairColor,'c9c5b7',.58):'#'+hairColor,light=mix(hc.slice(1),'ded0b3',.24);let s='';
 if(back){
  if([3,8,11].includes(a)){const backShape=`M${left-3} 73Q${left-11} 20 100 18Q${right+11} 20 ${right+3} 73L${right+7} 176Q${right} 183 ${right-10} 177L${right-15} 84H${left+15}L${left+10} 178Q${left-4} 183 ${left-8} 174Z`;s+=path(backShape,fill)+`<defs><clipPath id="backHairClip">${path(backShape,'#fff')}</clipPath></defs><g clip-path="url(#backHairClip)">`;for(const side of [-1,1])for(let i=0;i<22;i++){const x=100+side*(w-15+i*1.1);s+=path(`M${x} 51Q${x+side*5} 104 ${x+side*2} ${173+i%4}`,'none',i%3?light+'55':hc+'a0',i%3?.28:.42);}s+='</g>';}
  if(a===7)for(const side of [-1,1]){const x=100+side*(w-5);s+=path(`M${x} 61Q${x+side*5} 112 ${x+side*2} 177`,'none',hc,8);for(let i=0;i<22;i++)s+=ellipse(x+side*Math.sin(i)*1.3,72+i*4.7,4,3.8,fill,light+'65',.35);}
  if(a===5)s+=ellipse(112,22,18,15,fill);
  return `<g data-attachment="rooted-back-hair">${s}</g>`;
 }
 const scalp=`M${left-1} 86C${left-9} 34 76 15 100 20C${right-7} 16 ${right+9} 41 ${right+1} 88L${right-8} 72Q${right-7} 53 ${right-15} 49Q101 ${a===1?44:54} ${left+13} 51Q${left+6} 64 ${left+8} 76Z`;
 if(a===0){s+=`<g clip-path="url(#faceClip)">`+path(`M${left} 29H${right}V61Q100 48 ${left} 63Z`,mix(hc.slice(1),skin,.65)+'75');for(let i=0;i<100;i++)s+=ellipse(left+(i*17%101)/101*w*2,28+i*13%33,.24,.37,hc+'65');s+='</g>';return `<g data-attachment="scalp-hair">${s}</g>`;}
 if(a!==9)s+=path(scalp,fill);
 if(a===2||a===10){const rows=a===2?3:4,r=a===2?6.5:8;for(let j=0;j<rows;j++)for(let i=0;i<10;i++){const u=(i-4.5)/4.5,x=100+u*(w-6),y=29+j*6+u*u*13;s+=ellipse(x,y,r,r*.88,fill,light+'45',.32);}}
 if(a===3)s+=path(`M${left+1} 78Q${left-5} 18 103 20Q${right+8} 25 ${right} 89L${right-8} 83L${right-12} 51Q99 55 ${left+12} 55L${left+8} 85Z`,fill);
 if(a===4){for(let i=0;i<10;i++){const x=left+8+i*(w*2-16)/9;s+=path(`M${x} 59Q${x-6} 44 ${x+6} 25`,'none',hc,3.1);s+=path(`M${x+.6} 56Q${x-3} 43 ${x+6} 27`,'none',light,.45);}}
 if(a===5){s+=ellipse(112,22,18,15,fill);for(let i=0;i<8;i++)s+=path(`M98 ${20+i}Q111 7 126 ${19+i*.65}`,'none',light+'90',.45);}
 if(a===6)s+=path(`M${left+5} 76Q${left+4} 26 111 23Q${right+6} 24 ${right+1} 81L${right-10} 70L${right-17} 40Q92 32 ${left+5} 76Z`,fill)+path(`M${left+3} 64L${left+18} 53M${left+4} 69L${left+18} 58M${left+5} 74L${left+19} 63`,'none',light+'90',.65);
 if(a===7)for(let i=0;i<15;i++)s+=path(`M${left+9+i*(w*2-18)/14} 56Q${left+14+i*(w*2-25)/14} 28 ${94+i*2} 24`,'none',light+'80',.48);
 if(a===8)s+=path(`M${left+2} 70Q${left-4} 20 105 21Q${right+10} 25 ${right-3} 62L${right-15} 57Q108 83 88 76L106 43Q80 52 ${left+2} 70Z`,fill);
 if(a===9){s+=path(`M${left-8} 174L${left-8} 66Q${left-8} 13 102 15Q${right+10} 15 ${right+8} 65L${right+8} 174L${right-7} 181L${right-9} 62Q100 34 ${left+10} 62L${left+7} 180Z`,'url(#wrapShade)');for(let i=0;i<7;i++)s+=path(`M${left-4} ${58+i*5}Q${left+10} ${25+i*3} 102 ${21+i*3}Q${right-8} ${22+i*4} ${right+3} ${49+i*5}`,'none','#c4c9b147',.55);}
 if(a===11)s+=path(`M${left+1} 78Q${left-8} 19 104 19Q${right+9} 20 ${right+2} 63L${right-11} 57Q117 81 101 83Q100 63 108 46Q83 59 ${left+10} 78L${left+8} 91Z`,fill);
 if(![0,2,4,9,10].includes(a))for(let i=0;i<38;i++){const x=left+8+i*(w*2-16)/37;s+=path(`M${x} ${55+i%3}Q${x+3} 34 ${92+i*.65} ${23+i%4}`,'none',light+'60',.32);}
 if(d.life===3&&a!==9)for(const side of [-1,1])for(let i=0;i<10;i++)s+=path(`M${100+side*(w-7)} ${71+i}Q${100+side*(w-6)} 58 ${100+side*(w-15)} 48`,'none','#d6d0c070',.35);
 return `<g data-attachment="scalp-hair">${s}</g>`;
}
function organic(d,skin){const g=anatomy(d),{w,chin,eyeY,gap,eyeW,mouthY,noseY}=g,shadow=mix(skin,'172631',.48),light=mix(skin,'f0dfbf',.4);let s=hair(d,skin,true)+crest(d,skin);
 // Ears and fin roots overlap the skull before it is painted.
 if(d.species!=='ilyri')for(const side of [-1,1]){const x=100+side*(w-2);s+=ellipse(x,101,7.4,18.5,'url(#skin)')+path(`M${x} 88C${x+side*8} 87 ${x+side*7} 111 ${x} 113`,'none',shadow+'a0',.9);}
 s+=path(headPath(w,chin,d.face),'url(#skin)');
 s+='<g clip-path="url(#faceClip)" data-layer="skin-surface">';
 s+=ellipse(100-w+4,104,22,59,'url(#softShadow)')+ellipse(100+w-4,111,17,49,'url(#softShadow)')+ellipse(108,52,43,27,'url(#softLight)')+ellipse(120,111,24,24,'url(#softLight)')+ellipse(83,116,25,23,'url(#blush)')+ellipse(100,chin-11,26,13,'url(#softLight)');
 if(d.species==='veyr'){const left=100-w*.78,right=100+w*.78;s+='<g data-attachment="crown-root">'+path(`M${left} 40Q100 24 ${right} 40L${right-2} 52Q100 41 ${left+2} 52Z`,'url(#mineral)');for(let i=0;i<6;i++){const x=left+5+i*(right-left-10)/5;s+=path(`M${x} ${33+i%2*3}L${x+1} ${47+i%2*2}`,'none',light+'80',.55);}s+='</g>';}
 if(d.species==='veyr'){for(let i=0;i<4+d.life*2;i++){const x=100-w+6+(i*13)%(w*2-18),y=40+(i*19)%99;s+=polygon([[x,y],[x+18,y+14],[x+7,y+37]],i%2?light+'25':shadow+'25');}s+=path(`M${100-w+7} 51L86 83L${100-w+12} 113L89 ${chin-15}M${100+w-6} 51L115 82L${100+w-10} 112L114 ${chin-16}`,'none',d.life===3?'#d9bb788a':light+'75',.65);for(let i=0;i<6;i++)s+=ellipse(76+i*9,69+i%2*3,.7,.7,'#bfe1d6a0');}
 if(d.species==='ilyri'){for(let i=0;i<13+d.life*9;i++){const x=100-w+8+(i*19)%(w*2-16),y=52+i*13%99;s+=ellipse(x,y,.55+i%3*.25,.35+i%2*.2,d.life===3?'#c1f0cf70':mix(skin,'273f51',.25)+'68');}for(const side of [-1,1])for(let i=0;i<4;i++)s+=path(`M${100+side*(w-8)} ${101+i*8}Q${100+side*(w-1)} ${106+i*8} ${100+side*(w-6)} ${113+i*7}`,'none',shadow+'85',.65);}
 s+=surface(d);
 for(const side of [-1,1]){const x=100+side*gap,ew=eyeW,up=d.species==='human'?6:d.species==='ilyri'?13.5:8.2,open=up*(d.expression===1?.77:d.expression===3?1.12:1),eye=`M${x-ew} ${eyeY}C${x-ew*.45} ${eyeY-open*1.15} ${x+ew*.5} ${eyeY-open*1.15} ${x+ew} ${eyeY+.8}C${x+ew*.48} ${eyeY+open*.38} ${x-ew*.5} ${eyeY+open*.34} ${x-ew} ${eyeY}Z`,tag=side<0?'eyeLeft':'eyeRight',r=d.species==='human'?5.5:d.species==='ilyri'?7:6.2;
  s+=ellipse(x,eyeY-1,ew+7,open+9,shadow+'2a')+ellipse(x,eyeY-1,ew+7,open+9,'url(#socket)');s+=`<defs><clipPath id="${tag}">${path(eye,'#fff')}</clipPath></defs>`+path(eye,'url(#eyeWhite)');
  s+=`<g clip-path="url(#${tag})">`+ellipse(x+d.pose*.25,eyeY-1,r,r,'url(#iris)')+ellipse(x+d.pose*.25,eyeY-1,1.8,d.species==='veyr'?5.2:4.6,'#12232d');for(let i=0;i<12;i++){const a=i*Math.PI/6;s+=line(x+Math.cos(a)*r*.5,eyeY-1+Math.sin(a)*r*.5,x+Math.cos(a)*r*.87,eyeY-1+Math.sin(a)*r*.87,light+'70',.22);}s+=ellipse(x-1.8,eyeY-3,1.1,.85,'#eef0dfdd')+ellipse(x+1.3,eyeY+.2,.45,.4,'#d2e0d280')+'</g>';
  s+=path(`M${x-ew} ${eyeY}C${x-ew*.45} ${eyeY-open*1.15} ${x+ew*.5} ${eyeY-open*1.15} ${x+ew} ${eyeY+.8}`,'none',shadow,.95)+path(`M${x-ew-1} ${eyeY-open-3}Q${x} ${eyeY-open-6} ${x+ew+1} ${eyeY-open-2}`,'none',shadow+'60',.5);
  const slant=d.expression===1?side*2.6:d.expression===3?-side*1.7:side*.4,by=eyeY-15;
  if(d.species==='human')for(let i=0;i<26;i++){const t=i/25,xx=x-ew-1+t*(ew*2+2),yy=by-Math.sin(t*Math.PI)*2.4+(t-.5)*slant;s+=line(xx,yy,xx+.8,yy-1.1,'#584a3c99',.26);}
  else s+=path(`M${x-ew-1} ${by-slant}Q${x} ${by-4} ${x+ew+1} ${by+slant}`,'none',d.species==='veyr'?light+'c0':shadow+'95',d.species==='veyr'?1.1:.75);
  if(d.life>0)for(let i=0;i<d.life;i++)s+=path(`M${x+side*(ew+1)} ${eyeY+3+i*2.4}q${side*5} -1 ${side*7} 2`,'none',shadow+'65',.38);
 }
 // Sculpted bridge, nostril wings and softly filled lips follow the original workshop.
 const nw=d.species==='ilyri'?15:d.species==='veyr'?6.5:7+d.face%4*.9;
 s+=path(`M98 ${eyeY+1}C96 ${eyeY+14} ${100-nw+1} ${noseY-8} ${100-nw} ${noseY-1}C${100-nw+1} ${noseY+5} ${100+nw-1} ${noseY+5} ${100+nw} ${noseY-1}C${100+nw-1} ${noseY-9} 104 ${eyeY+12} 103 ${eyeY+1}Z`,'url(#noseShade)');
 s+=path(`M99 ${eyeY+12}Q94 ${noseY-6} 100 ${noseY-1}`,'none',light+'85',.9)+ellipse(100-nw+2,noseY+1,1.9,.85,shadow+'c0')+ellipse(100+nw-2,noseY+1,1.7,.8,shadow+'b0')+path(`M100 ${noseY+7}L99 ${mouthY-5}`,'none',shadow+'45',.6);
 const mw=17+d.face%3,smile=[2.4,-1.2,.2,1.3][d.expression];
 s+=path(`M${100-mw} ${mouthY}C92 ${mouthY-3} 96 ${mouthY-4} 100 ${mouthY-1.5}C104 ${mouthY-4} 110 ${mouthY-3} ${100+mw} ${mouthY}Q100 ${mouthY+smile} ${100-mw} ${mouthY}Z`,'url(#lipShade)')+path(`M${100-mw} ${mouthY}Q100 ${mouthY+smile*2} ${100+mw} ${mouthY}`,'none',shadow+'b5',.75)+path(`M${103-mw} ${mouthY+1}Q100 ${mouthY+6+smile} ${97+mw} ${mouthY+1}`,'none',light+'70',.55);
 if(d.life>=2){for(let i=0;i<d.life-1;i++)s+=path(`M82 ${59+i*5}Q100 ${57+i*5} 118 ${59+i*5}`,'none',shadow+'55',.4);for(const side of [-1,1])s+=path(`M${100+side*(nw+1)} ${noseY+4}Q${100+side*22} ${mouthY-2} ${100+side*20} ${mouthY+10}`,'none',shadow+'55',.45);}
 // Markings are skin-bound. Nothing can spill beyond the face silhouette.
 if(d.detail===1&&d.species==='human')for(let i=0;i<38;i++)s+=ellipse(73+i*17%55,101+i*7%16,.35+i%2*.12,.28,shadow+'80');
 if(d.detail===2)s+=ellipse(100+w-14,112,6,10,'url(#birthmark)');
 if(d.detail===3)s+=path(`M${100+gap+3} ${eyeY-14}L${100+gap+9} ${eyeY+1}L${100+gap+7} ${eyeY+14}`,'none',light+'b0',.72)+path(`M${100+gap+4} ${eyeY-14}L${100+gap+10} ${eyeY+1}`,'none',shadow+'60',.3);
 if(d.detail===4)s+=path(`M${100+w-6} 99L${100+w-13} 124L${100+w-26} 130L${100+w-20} 114Z`,'url(#inlay)',light+'90',.45);
 if(d.detail===6)s+=path(`M${100-gap-5} 108Q${100-gap+2} 101 ${100-gap+7} 109`,'none','#b0bfa080',.8);
 s+='</g>';
 s+=hair(d,skin,false);
 // Accessories mount to the eyes and ear rig, and share its head transform.
 if(d.detail===0){for(const side of [-1,1]){const x=100+side*gap;s+=ellipse(x,eyeY,eyeW+4,9,'#bad7d012','#a7b29aa0',.8)+line(x+side*(eyeW+4),eyeY-1,100+side*(w-2),eyeY-5,'#a7b29a',.7);}s+=line(100-gap+eyeW+4,eyeY,100+gap-eyeW-4,eyeY,'#a7b29a',.7);}
 if(d.detail===5){const x=100-w+1;s+=path(`M${x+2} 87Q${x-8} 85 ${x-8} 103Q${x-7} 114 ${x} 115`,'none','#69848b',2.4)+ellipse(x-1,111,2,2.5,'#bad8ce');}
 for(const side of [-1,1]){const x=100+side*(w-2);if(d.ornament===1&&side===1)s+=ellipse(x,117,2.1,3.5,'#b7a071','#596b6a',.4);if(d.ornament===2&&side===-1)s+=ellipse(x,119,2.6,4.4,'none','#afc0b6',.9);}
 return s;
}
function robot(d,skin){const g=anatomy(d);let s='',a=d.style,hw=g.w,y=27+(a%3)*1.5,h=137-a%4*1.7,shape;
 if(a<4)shape=`M${100-hw} ${y+19}Q${100-hw} ${y} ${119-hw} ${y}H${81+hw}Q${100+hw} ${y} ${100+hw} ${y+19}V${y+h-14}Q${100+hw} ${y+h} ${86+hw} ${y+h}H${114-hw}Q${100-hw} ${y+h} ${100-hw} ${y+h-14}Z`;
 else if(a<8)shape=`M${100-hw+11} ${y}L${100+hw-11} ${y}L${100+hw+3} ${y+34}L${100+hw-8} ${y+h-11}L118 ${y+h}H82L${100-hw+6} ${y+h-10}L${100-hw-2} ${y+32}Z`;
 else if(a<12)shape=`M100 ${y-3}Q${100+hw+12} ${y-2} ${100+hw+1} ${y+h*.59}Q${100+hw-1} ${y+h+3} 100 ${y+h}Q${100-hw-2} ${y+h+3} ${100-hw-1} ${y+h*.59}Q${100-hw-12} ${y-2} 100 ${y-3}Z`;
 else shape=`M${100-hw} ${y+10}L${100+hw-13} ${y-1}L${100+hw+4} ${y+34}L${100+hw-5} ${y+h-5}L${100-hw+11} ${y+h+2}L${100-hw-4} ${y+76}Z`;
 const dark='#19333f',lit=mix(skin,'e8e8ce',.35),sensor=['#a0dcd5','#dac18f','#accddc','#c1cfaa'][d.expression];
 s+='<g data-attachment="chassis-side-pods">';for(const side of [-1,1]){const x=100+side*(hw-1);s+=rect(x-5.5,77,11,49,mix(skin,'243c48',.2),4);for(let i=0;i<4;i++)s+=line(x-3.5,85+i*9,x+3.5,85+i*9,dark,1.2);}s+='</g>';
 s+=path(shape,'url(#metal)')+`<defs><clipPath id="shellClip">${path(shape,'#fff')}</clipPath></defs>`;
 s+='<g clip-path="url(#shellClip)" data-layer="chassis-surface">'+ellipse(100-hw+3,92,22,64,'url(#softShadow)')+ellipse(124,57,36,26,'url(#softLight)')+surface(d,'metal');
 s+=path(`M${100-hw+10} ${y+54}L${100-hw+17} ${y+h-8}L91 ${y+h+7}`,'none',dark+'c0',1.2)+path(`M${100+hw-10} ${y+54}L${100+hw-17} ${y+h-8}L110 ${y+h+7}`,'none',dark+'c0',1.2);
 s+=rect(58,64,84,49,dark,a%2?9:21);
 const lens=(x,yy,r)=>ellipse(x,yy,r+2.3,r+2.3,'url(#metal)',lit,.45)+ellipse(x,yy,r,r,'url(#lens)')+ellipse(x,yy,r*.46,r*.46,'#142d3b')+ellipse(x-r*.3,yy-r*.35,r*.21,r*.18,'#e1efdf');
 if(d.face===0)s+=rect(65,83,70,8,sensor,3)+rect(92,80,18,13,'#d0eee4',2)+rect(64,103,4,2,'#9cc6c4',.5)+rect(134,103,4,2,'#9cc6c4',.5);
 if(d.face===1)s+=lens(79,81,9)+lens(121,81,9)+lens(100,101,6);
 if(d.face===2)s+=lens(100,88,21)+rect(95,58,10,4,sensor,1);
 if(d.face===3)s+=ellipse(100,88,18,18,'none',sensor,1.8)+line(90,88,110,88,'#d4e8dd',1.5);
 if(d.face===4)for(let i=0;i<7;i++)s+=rect(66+i*10,79+(i%2)*3,6,15-(i%2)*5,sensor,2);
 if(d.face===5)s+=lens(78,79,13)+lens(122,96,8);
 if(d.face===6)s+=ellipse(100,88,32,15,'url(#lens)',lit,.55)+path('M76 88Q100 78 124 88','none',sensor,1.5);
 if(d.face===7){s+=rect(93,69,14,39,'#102937',4);for(let i=0;i<4;i++)s+=ellipse(100,75+i*9,3.5,2.8,sensor);}
 if(a%4===0)s+=path('M70 50L78 39H122L130 50Z',mix(skin,'d0d8d1',.17));
 if(a%4===1){s+=path(`M${100-hw+9} 59L${100-hw+3} 31`,'none',lit,1)+ellipse(100-hw+2,30,2,2,sensor);}
 if(a%4===2)s+=rect(81,41,38,8,dark,2)+rect(86,44,28,1.5,sensor,1);
 if(a%4===3)s+=path('M72 54L100 43L127 54','none',lit,1.2);
 s+=rect(85,130,30,9,dark,2);for(let i=0;i<5;i++)s+=rect(90+i*5,132,1.8,4,sensor,1);
 for(let i=0;i<d.life*5;i++){const x=100-hw+12+i*17%(hw*2-24),yy=49+i*29%104;s+=line(x,yy,x+2+i%4,yy-.6,lit+'90',.45);}
 if(d.life>=2)s+=path(`M${100-hw+11} 121L${100-hw+26} 120L${100-hw+28} 147H${100-hw+12}Z`,mix(skin,'536c7a',.3),lit+'80',.45)+ellipse(100-hw+16,126,1.3,1.3,dark)+ellipse(100-hw+22,142,1.3,1.3,dark);
 for(const side of [-1,1])for(const yy of [53,120,150]){const x=100+side*(hw-9);s+=ellipse(x,yy,2.2,2.2,'url(#metal)',lit,.35)+line(x-1,yy+1,x+1,yy-1,dark,.55);}
 s+='</g>';
 // Personal hardware hangs from a visible hinge on the same posed side pod.
 const ex=100+hw-1;if(d.ornament===1)s+=ellipse(ex,126,1.7,1.7,lit)+ellipse(ex,131,2.6,4.3,'none','#bcae85',.9);if(d.ornament===2){const x=101-hw;s+=line(x,124,x,129,lit,.7)+polygon([[x,128],[x-3,133],[x,139],[x+3,133]],sensor);}
 return s;
}
function bodyPath(d){const shoulder=d.species==='robot'?77+d.life*3:67+d.face%4*2+d.body*3;return `M-8 250Q-1 190 ${100-shoulder} 177L76 163H124L${100+shoulder} 177Q204 190 208 250Z`;}
function definitions(d,r,skin){const g=anatomy(d),shadow=mix(skin,'17212d',.52),lit=mix(skin,'f1d9b9',.39),hairBase=['292424','4B382A','817364','1C252D','ABA69A','683F2D','B7A584','423B3C'][d.material],hair=d.life===3?mix(hairBase,'c9c5b7',.58).slice(1):hairBase,iris=d.species==='ilyri'?'427A78':d.species==='veyr'?['B7DBDF','C6BF8A','A1CFDB','91AFA5'][d.material%4]:['765E36','476C6F','5A6045','6F7777','3F514B','80654E','677E72','946A43'][d.material];
 const gradient=(id,stops,extra='')=>`<linearGradient id="${id}" ${extra}>${stops.map(([at,c])=>`<stop offset="${at}" stop-color="${paint(c)}"/>`).join('')}</linearGradient>`;
 const soft=(id,c,opacity)=>`<radialGradient id="${id}"><stop stop-color="${paint(c)}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${paint(c)}" stop-opacity="0"/></radialGradient>`;
 let s='<defs>'+gradient('room',[[0,'172b39'],[.55,'365764'],[1,mix(r.color,'8aafab',.58)]],'x2="1" y2=".15"')+gradient('skin',[[0,shadow],[.52,skin],[1,lit]],'x1="0" y1=".65" x2="1" y2=".35"')+gradient('metal',[[0,mix(skin,'172d3c',.53)],[.54,skin],[1,mix(skin,'dfe6df',.4)]],'x2="1" y2=".2"')+gradient('cloth',[[0,mix(r.color,'0c1b27',.65)],[.6,r.color],[1,mix(r.color,'c4ccc2',.25)]],'x2="1" y2=".2"')+gradient('hairShade',[[0,mix(hair,'101e27',.42)],[.55,hair],[1,mix(hair,'e0c9a0',.23)]],'x2="1" y2=".2"')+gradient('wrapShade',[[0,'4c6060'],[.55,'77877a'],[1,'9fa591']],'x2="1" y2=".3"')+gradient('mineral',[[0,mix(skin,'314655',.23)],[.6,mix(skin,'b4d1cd',.36)],[1,mix(skin,'cbdccf',.5)]])+gradient('fin',[[0,mix(skin,'223d4b',.27)],[.6,skin],[1,mix(skin,'c1d6bc',.4)]])+gradient('noseShade',[[0,shadow+'70'],[.3,skin],[.65,lit],[1,skin]])+gradient('eyeWhite',[[0,'8c9b95'],[.55,d.species==='veyr'?'a9cec8':'d7d5bf'],[1,'c5cbb8']])+gradient('lipShade',[[0,shadow],[.6,mix(skin,d.species==='human'?'834e4a':'566b76',.4)],[1,skin]])+gradient('inlay',[[0,'657f85'],[.5,'a8bbb8'],[1,'c1cabe']]);
 s+='<radialGradient id="iris" cx=".42" cy=".35"><stop stop-color="'+mix(iris,'cadac9',.3)+'"/><stop offset=".65" stop-color="#'+iris+'"/><stop offset="1" stop-color="'+shadow+'"/></radialGradient><radialGradient id="lens" cx=".35" cy=".25"><stop stop-color="#baded9"/><stop offset=".45" stop-color="#517f98"/><stop offset="1" stop-color="#18374c"/></radialGradient>';
 s+=soft('softShadow',shadow,.5)+soft('softLight',lit,.3)+soft('socket',shadow,.54)+soft('blush',mix(skin,'a4665e',.3),.24)+soft('birthmark',mix(skin,'6e383c',.52),.5)+soft('clothLight',mix(r.color,'cdd2bc',.3),.18);
 s+='<clipPath id="faceClip">'+path(headPath(g.w,g.chin,d.face),'#fff')+'</clipPath><clipPath id="bodyClip">'+path(bodyPath(d),'#fff')+'</clipPath><clipPath id="neckClip">'+path('M80 142H120V176Q100 196 80 176Z','#fff')+'</clipPath></defs>';return s;
}
function headset(d){const g=anatomy(d),x=d.species==='robot'?100+g.w-1:g.earX,y=d.species==='robot'?94:g.earY;return `<g data-attachment="ear-mounted-headset">`+path(`M${x-1} ${y-16}Q${x+8} ${y-8} ${x+4} ${y+12}Q${x-4} ${y+27} 120 ${g.noseY+8}`,'none','#839fa4',1.15)+rect(x-3,y-10,7,23,'#304c58',3)+rect(x-1.5,y-5,2,12,'#90a9a7',1)+ellipse(119,g.noseY+8,4,2.1,'#28424e')+'</g>';}
function svg(v,options={}){const d=describe(v,options),r=roleDesigns[d.role],skin=materials[d.species][d.material];let s='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1200" viewBox="0 0 200 250">'+definitions(d,r,skin);
 s+=background(r,d)+clothing(d,r,skin);
 s+=`<g data-layer="posed-head" transform="rotate(${d.pose*.8} 100 174)">`+(d.species==='robot'?robot(d,skin):organic(d,skin));
 if(['tools','headset','flight','radio'].includes(r.prop))s+=headset(d);s+='</g>';
 s+=rect(0,0,200,250,'none',0,'#c3d4cb12')+'</svg>';return s;
}
function source(v){if(typeof v.stationPortrait==='string'&&(/^(?:\.\.\/)?station-portraits\/[a-z0-9-]+\.svg$/.test(v.stationPortrait)||/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(v.stationPortrait)))return v.stationPortrait;const d=describe(v),key=JSON.stringify(d);if(cache.has(key)){const x=cache.get(key);cache.delete(key);cache.set(key,x);return x;}const value='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(v));cache.set(key,value);if(cache.size>cacheLimit)cache.delete(cache.keys().next().value);return value;}
function appearance(v,options={}){const d=describe(v,options),features={robot:['a lit visor','three optical lenses','a telescopic camera','a luminous sensor ring','a segmented light band','offset optical lenses','a domed sensor','a vertical sensor array'],human:['closely cropped hair','a short neat cut','close curls','a long bob','swept locks','a tied bun','an undercut','long braids','a swept fringe','a wrapped head covering','full curls','a long side fringe'],veyr:['a plate crown','a split crystal crest','a broad mineral crown','a pointed crystal ridge','a translucent fan crown','a dark serrated ridge','interlocking mineral plates','a rounded polished crown'],ilyri:['layered ear fans','trailing gill filaments','tall narrow fins','rounded flowing fins','wide ear fans','pearl-like gill lobes','angular cheek fins','swept curling fins']};return (d.species==='robot'?['A clean','A maintained','A scuffed','A patched'][d.life]+' chassis':d.species==='human'?['A youthful','A mature','A weathered','A face lined by long service with a'][d.life]+(d.life===3?' silver-toned style':' face'):d.species==='veyr'?'A faceted mineral face':'A softly mottled amphibious face')+' with '+features[d.species][d.species==='robot'?d.face:d.style]+'.';}
return Object.freeze({version:2,pools,speciesOrder,total:Object.values(pools).reduce((a,b)=>a+b,0),base,describe,anatomy,svg,source,appearance,cacheSize:()=>cache.size,cacheLimit,roleDesigns});
});
