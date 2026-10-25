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
 const species=pools[v.species]?v.species:'human',identityKey=species+'|'+(v.portraitKey||v.castKey||'')+'|'+(v.person||'');
 const b=base(species,options.index??hash(identityKey)%pools[species]),gender=['woman','man','nonbinary','genderless','unspecified'].includes(v.gender)?v.gender:'unspecified';
 const c=v.character||{},personality=[c.tone||'',c.habit||'',c.value||'',c.cadence||''].join('|'),p=hash(personality),g=hash(identityKey+'|'+gender+'|'+(v.appearance||'balanced'));
 const tone=String(c.tone||'').toLowerCase(),expression=/warm|cheer|friendly|playful|bright|wry/.test(tone)?0:/stern|blunt|guarded|severe|brisk/.test(tone)?1:/curious|inquisitive|excitable/.test(tone)?3:/calm|quiet|precise|patient|measured/.test(tone)?2:p%4;
 // Presentation is personal styling, not a rule assigning anatomy to a gender.
 return {...b,identityKey,gender,body:hash(identityKey+'|body|'+(v.sex||'unspecified'))%4,presentation:g%6,ornament:(g>>>5)%4,expression,pose:(p>>>5)%5-2,detail:hash(identityKey+'|detail')%8,role:roleOf(v),wardrobe:(hash(identityKey+'|wardrobe')+g)%4,personalityKey:personality};
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
 let s=path(`M-8 250Q-1 190 ${100-shoulder} 177L76 163H124L${100+shoulder} 177Q204 190 208 250Z`,'url(#cloth)','#121f2d',1.3);
 if(robot){s+=path(`M79 174V146H121V174L110 191H90Z`,'url(#metal)','#17313c',1.3);for(let i=0;i<5;i++)s+=line(81,151+i*6,119,151+i*6,'#253c46',2);for(const x of [89,110])s+=path(`M${x} 153V177`,'none','#bfd5cb',2);}
 else{s+=path('M81 143H119V173Q99 191 81 173Z','url(#skin)');s+=path('M82 147Q100 165 118 146V157Q102 173 82 161Z',mix(skin,'142330',.36));}
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
function headPath(w,chin,face){const temple=face%2?4:-1;return `M${100-w} 71Q${97-w+temple} 25 100 24Q${104+w} 24 ${100+w} 71Q${103+w} 113 ${100+w*.63} ${chin-10}Q${100+w*.3} ${chin+3} 100 ${chin}Q${100-w*.34} ${chin+3} ${100-w*.67} ${chin-11}Q${97-w} 111 ${100-w} 71Z`;}
function crest(d,skin,back=false){let s='',a=d.style,shadow=mix(skin,'26344c',.5),hi=mix(skin,'d6e6d9',.5);if(d.species==='veyr'){
 if(a===0)for(let i=0;i<5;i++)s+=polygon([[67+i*13,40],[65+i*13,16+i%2*6],[75+i*13,10+i%3*4],[82+i*13,41]],i%2?hi:skin,shadow,.8);
 if(a===1)for(const side of [-1,1])s+=polygon([[100+side*3,40],[100+side*17,2],[100+side*32,9],[100+side*23,43]],hi,shadow,1);
 if(a===2)s+=polygon([[65,43],[75,11],[100,5],[125,11],[136,43],[110,31],[92,38]],hi,shadow,1);
 if(a===3)for(let i=0;i<7;i++)s+=polygon([[64+i*10,39],[69+i*10,12+Math.abs(i-3)*4],[76+i*10,40]],i%2?skin:hi,shadow,.8);
 if(a===4)for(let i=0;i<7;i++)s+=polygon([[95+i*1.5,46],[46+i*16,8+Math.abs(i-3)*4],[57+i*14,12],[108,43]],mix(skin,'b8dcda',i*.07),shadow,.7);
 if(a===5)s+=polygon([[63,41],[65,31],[72,29],[77,17],[86,20],[94,3],[104,20],[115,12],[120,28],[135,30],[137,42]],shadow,hi,1.3);
 if(a===6)for(let i=0;i<4;i++)s+=polygon([[68+i*16,45],[63+i*17,18+i%2*6],[79+i*17,24],[87+i*14,44]],mix(skin,'ddd8b6',i*.15),shadow,1);
 if(a===7)s+=path('M65 42Q58 13 78 15Q81 1 96 19Q111 -1 120 16Q142 11 134 43L115 34L100 39L81 33Z',hi,shadow,1);
 return s;
 }if(d.species==='ilyri')for(const side of [-1,1]){const x=100+side*(33+d.face%3),flip=p=>p.map(([dx,y])=>[x+side*dx,y]);
 if(a===0||a===4)for(let i=0;i<4;i++)s+=polygon(flip([[0,62+i*12],[22+(a===4?10:0)-i*2,42+i*16],[11,90+i*8],[-3,101+i*6]]),mix(skin,'bbd6b5',i*.1),shadow,.7);
 if(a===1)for(let i=0;i<7;i++)s+=path(`M${x} ${76+i*5}Q${x+side*31} ${65+i*8} ${x+side*(18+i%3*4)} ${128+i*2}`,'none',mix(skin,'cbd9b6',.4),1.5);
 if(a===2)s+=polygon(flip([[0,64],[10,28],[20,22],[25,53],[6,110],[-1,109]]),hi,shadow,.9);
 if(a===3)s+=path(`M${x} 68Q${x+side*48} 71 ${x+side*20} 116Q${x+side*7} 132 ${x} 99Z`,hi,shadow,.8);
 if(a===5)for(let i=0;i<6;i++)s+=ellipse(x+side*(8+i%2*4),67+i*10,9,5,mix(skin,'b9d8b7',i*.07),shadow,.7);
 if(a===6)s+=polygon(flip([[0,66],[31,55],[22,78],[33,86],[15,95],[18,117],[-2,108]]),skin,hi,1.1);
 if(a===7)s+=path(`M${x} 63Q${x+side*42} 38 ${x+side*27} 77Q${x+side*48} 95 ${x+side*14} 119L${x} 104Z`,hi,shadow,.8);
 for(let j=0;j<4;j++)s+=path(`M${x} ${80+j*8}Q${x+side*14} ${86+j*8} ${x+side*5} ${95+j*8}`,'none',shadow,.9);
 }return s;
}
function hair(d,skin,back){if(d.species!=='human')return '';const a=d.style,color=['292424','4B382A','817364','1C252D','ABA69A','683F2D','B7A584','423B3C'][d.material],hair=d.life===3?mix(color,'c9c5b7',.6):'#'+color,light=mix(hair.slice(1),'ded0b3',.28);let s='';
 if(back){if([3,5,7,9,11].includes(a))s+=path('M60 51Q51 15 99 16Q146 15 142 62L150 164L128 184L119 98H78L73 179L49 166Z',hair,'#1a2430',1.2);return s;}
 if(a===0){for(let i=0;i<50;i++)s+=ellipse(65+i*29%70,31+i*13%21,.5,.7,hair);return s;}
 if(a===1)s+=path('M61 70Q55 23 96 18Q143 15 140 72L129 49Q99 39 72 51Z',hair);
 if(a===2){for(let i=0;i<36;i++)s+=ellipse(65+(i%9)*9,27+Math.floor(i/9)*8+(i%3),7.7,7.5,hair,light,.5);}
 if(a===3)s+=path('M59 91Q48 13 100 17Q153 12 141 94L131 89L126 42Q88 68 70 54L68 91Z',hair);
 if(a===4){for(let i=0;i<7;i++)s+=path(`M${68+i*9} 46Q${66+i*9} 12 ${76+i*8} 22`,'none',hair,7);}
 if(a===5){s+=ellipse(114,18,21,15,hair,light,.8);s+=path('M61 66Q55 20 101 20Q144 20 140 68L131 48L75 46Z',hair);}
 if(a===6)s+=path('M61 68Q59 17 107 20Q145 20 141 75L126 60L118 33Q94 27 61 68Z',hair)+path('M61 49L72 40M62 54L73 44M62 59L73 48','none',light,1.2);
 if(a===7){for(const side of [-1,1])for(let j=0;j<3;j++)for(let i=0;i<17;i++)s+=ellipse(100+side*(34+j*3),43+i*8,2.7,5.5,hair,light,.5);s+=path('M61 53Q57 17 99 18Q145 18 139 54L123 39H76Z',hair);}
 if(a===8)s+=path('M60 74Q49 19 97 13Q151 13 140 64L126 60L124 38Q92 64 65 83Z',hair);
 if(a===9){s+=path('M51 155L56 59Q49 14 101 12Q151 12 146 60L152 157L133 164L127 65Q107 39 77 59L70 162Z','#6d7970','#abb3a0',1);for(let i=0;i<4;i++)s+=path(`M${63+i*3} 61Q${72+i*5} 17 ${134-i*2} ${33+i*7}`,'none','#bdc6af',.8);}
 if(a===10){for(let i=0;i<28;i++)s+=ellipse(63+(i%7)*12,22+Math.floor(i/7)*9+(i%2)*3,9,8,hair,light,.6);}
 if(a===11)s+=path('M60 75Q53 14 102 18Q146 19 139 58L127 54Q109 91 85 74L101 43L70 53L69 81Z',hair);
 if(![0,2,4,9,10].includes(a))for(let i=0;i<12;i++)s+=path(`M${67+i*5} ${42+i%3*2}Q${78+i*3} 22 ${101+i*3} 28`,'none',light,.55);
 return s;
}
function organic(d,skin){const w=(d.species==='human'?34:d.species==='ilyri'?37:29)+(d.face%4)*2,chin=147+Math.floor(d.face/4)*6-(d.species==='veyr'?5:0),shadow=mix(skin,'172631',.48),light=mix(skin,'f0dfbf',.45),eyeY=79+(d.face%3)*2,eyeGap=d.species==='ilyri'?21:19,eyew=d.species==='ilyri'?13:10,smile=[3.5,-1.5,.1,2][d.expression];let s='';
 s+=hair(d,skin,true)+crest(d,skin,true);
 if(d.species==='human')for(const side of [-1,1])s+=ellipse(100+side*w,90,7,17,'url(#skin)',shadow,.7)+path(`M${100+side*w} 80q${side*6} 8 0 18`,'none',shadow,.8);
 s+=path(headPath(w,chin,d.face),'url(#skin)',shadow,.75);
 s+=path(`M${100-w} 69Q${82-w} 109 ${100-w*.6} ${chin-9}L100 ${chin}Q${74} 116 77 67Z`,shadow+'3b');
 if(d.species==='veyr'){for(let i=0;i<4+d.life*2;i++){const x=72+i*7%57,y=54+i*19%78;s+=polygon([[x,y],[x+12,y+8],[x+5,y+24]],i%2?light+'67':shadow+'67',light+'65',.55);}s+=path(`M74 57L86 79L78 104L90 133M127 55L117 77L129 106L115 138`,'none',d.life===3?'#d9bb78':light,1.2);}
 if(d.species==='ilyri'){for(let i=0;i<8+d.life*8;i++){const x=73+(i*19)%55,y=52+(i*13)%83;s+=ellipse(x,y,d.life===2?2.8:1.4+(i%2),d.life===1?2.5:.9,d.life===3?'#c1f0cf99':mix(skin,'273f51',.33)+'77');}s+=path('M86 52Q100 45 114 52','none',light,2);}
 for(const side of [-1,1]){const x=100+side*eyeGap,open=d.expression===1?4.4:d.expression===3?7:5.7;
 s+=ellipse(x,eyeY+2,eyew+3,open+4,shadow+'49');
 s+=path(`M${x-eyew} ${eyeY}Q${x} ${eyeY-open*2} ${x+eyew} ${eyeY}Q${x} ${eyeY+open} ${x-eyew} ${eyeY}Z`,d.species==='veyr'?'#b9dcd2':'#d7d5c1',shadow,.8);
 s+=ellipse(x+(d.pose*.35),eyeY-1,3.5,d.species==='ilyri'?6:4.6,['#536e68','#8c7449','#6e777c','#4f786c'][d.material%4])+ellipse(x,eyeY-1,1.5,3.1,'#142631')+ellipse(x-1.1,eyeY-3,1,1,'#e7f0dd');
 const slant=d.expression===1?side*3:d.expression===3?-side*2:side*.5;
 s+=path(`M${x-eyew-1} ${eyeY-10-slant}Q${x} ${eyeY-14} ${x+eyew+1} ${eyeY-10+slant}`,'none',d.species==='human'?'#51453d':shadow,d.species==='veyr'?2.5:1.7);
 if(d.species==='human'&&d.life>0)for(let i=0;i<d.life;i++)s+=path(`M${x+side*10} ${eyeY+2+i*3}q${side*6} -2 ${side*8} 2`,'none',shadow+'8c',.65);
 }
 const nw=4+d.face%4+(d.species==='ilyri'?3:0);s+=path(`M98 86Q${99-nw} 107 ${100-nw} 111Q100 117 ${103+nw} 110`,'none',shadow,.9)+path('M102 88L104 108L100 110','none',light,1.4);
 s+=path(`M${84+d.face%3} 127Q100 ${128+smile*2} ${116-d.face%3} 127`,'none',mix(skin,'5f3b41',.6),1.6)+path(`M88 132Q100 ${135+smile} 112 132`,'none',light,.7);
 if(d.species==='human'&&d.life>=2){for(let i=0;i<d.life-1;i++)s+=path(`M83 ${57+i*5}Q100 ${54+i*5} 117 ${57+i*5}`,'none',shadow+'83',.65);s+=path('M84 114Q77 123 81 136M116 114Q123 123 119 136','none',shadow+'6b',.8);}
 s+=hair(d,skin,false);
 if(d.detail===0){for(const x of [81,119])s+=ellipse(x,eyeY,14,10,'#b8d8d21a','#b9bca1',1.4);s+=line(95,eyeY,105,eyeY,'#b9bca1',1.3);}
 if(d.detail===1&&d.species==='human')for(let i=0;i<25;i++)s+=ellipse(73+i*17%55,92+i*7%12,.7,.55,shadow+'a0');
 if(d.detail===2)s+=ellipse(100+w-9,104,5,9,mix(skin,'643e49',.38)+'a0');
 if(d.detail===3)s+=path('M119 65L125 80L122 96','none',light,1.2)+path('M120 65L126 80','none',shadow+'a0',.5);
 if(d.detail===4)s+=path(`M${100+w-3} 75L${100+w+1} 92L${100+w-7} 116L${100+w-12} 108Z`,'#97aaa7','#dae1d3',.7);
 if(d.detail===5)s+=path(`M${100-w} 87Q${90-w} 87 ${96-w} 103`,'none','#6c9399',4)+ellipse(96-w,101,2,2,'#bcdfd0');
 if(d.detail===6)s+=path('M76 104Q82 97 85 106','none','#b4c8ad',1.4);
 if(d.ornament===1)s+=ellipse(100+w,108,2.7,4.5,'#c8b181','#314851',.7);if(d.ornament===2)s+=ellipse(100-w,111,3,5,'none','#bac9c1',1.3);
 return s;
}
function robot(d,skin){let s='',a=d.style,hw=34+d.life*2,y=29+(a%3)*3,h=115-a%4*4,shape;
 if(a<4)shape=`M${100-hw} ${y+12}Q${100-hw} ${y} ${112-hw} ${y}H${88+hw}Q${100+hw} ${y} ${100+hw} ${y+12}V${y+h-12}Q${100+hw} ${y+h} ${88+hw} ${y+h}H${112-hw}Q${100-hw} ${y+h} ${100-hw} ${y+h-12}Z`;
 else if(a<8)shape=`M${100-hw+8} ${y}L${100+hw-8} ${y}L${100+hw+3} ${y+26}L${100+hw-5} ${y+h-19}L${112} ${y+h}H86L${100-hw-4} ${y+h-20}L${100-hw} ${y+23}Z`;
 else if(a<12)shape=`M100 ${y-5}Q${100+hw+14} ${y-3} ${100+hw+3} ${y+h*.6}Q${100+hw-2} ${y+h+6} 100 ${y+h}Q${100-hw-4} ${y+h+6} ${100-hw-3} ${y+h*.6}Q${100-hw-14} ${y-3} 100 ${y-5}Z`;
 else shape=`M${100-hw} ${y+8}L${100+hw-12} ${y-3}L${100+hw+5} ${y+29}L${100+hw-1} ${y+h-8}L${100-hw+8} ${y+h+4}L${100-hw-6} ${y+66}Z`;
 const dark='#18323f',lit=mix(skin,'e8e8ce',.48),sensor=['#99dcd4','#deb97b','#a6cce1','#c9cf97'][d.expression];
 for(const side of [-1,1]){s+=rect(100+side*(hw+2)-5,66,10,39,mix(skin,'243c48',.3),3,dark);for(let i=0;i<4;i++)s+=line(100+side*(hw+2)-3,73+i*8,100+side*(hw+2)+3,73+i*8,dark,1.4);}
 s+=path(shape,'url(#metal)',dark,1.5);
 s+=path(`M${100-hw+5} ${y+18}L${100-hw+10} ${y+h-17}L91 ${y+h-5}`,'none',dark,1.4)+path(`M${100+hw-5} ${y+19}L${100+hw-10} ${y+h-17}L110 ${y+h-5}`,'none',lit,1.1);
 s+=rect(72,62,56,41,dark,a%2?6:16);
 const lens=(x,y,r)=>ellipse(x,y,r+2,r+2,mix(skin,'d5ddd1',.3),lit,.7)+ellipse(x,y,r,r,'url(#lens)')+ellipse(x,y,r*.47,r*.47,'#112a39')+ellipse(x-r*.28,y-r*.38,r*.22,r*.22,'#e5f5df');
 if(d.face===0)s+=rect(76,77,48,7,sensor,3)+rect(92,74,16,12,'#d0eee4',2);
 if(d.face===1)s+=lens(87,77,7)+lens(114,77,7)+lens(100,92,5);
 if(d.face===2)s+=lens(100,81,16)+rect(96,58,8,5,sensor,2);
 if(d.face===3)s+=ellipse(100,82,17,17,'none',sensor,3)+line(91,82,109,82,'#d9f2e6',2);
 if(d.face===4)for(let i=0;i<6;i++)s+=rect(77+i*8,75+(i%2)*3,5,14-(i%2)*6,sensor,2);
 if(d.face===5)s+=lens(85,76,10)+lens(115,86,6);
 if(d.face===6)s+=ellipse(100,81,24,12,'url(#lens)',lit,1)+path('M81 82Q100 73 119 82','none',sensor,2.3);
 if(d.face===7){s+=rect(94,64,12,34,'#0a202e',4);for(let i=0;i<4;i++)s+=ellipse(100,69+i*8,3,2.5,sensor);}
 if(a%4===0)s+=path('M73 43L79 33H121L127 43Z',lit,dark,.7);
 if(a%4===1){s+=path('M73 53L61 24','none',lit,2)+ellipse(60,22,3,3,sensor);}
 if(a%4===2)s+=rect(84,35,33,9,dark,2)+rect(88,38,25,2,sensor,1);
 if(a%4===3)s+=path('M78 50L100 40L123 50','none',lit,3);
 s+=rect(86,115,28,10,dark,3);for(let i=0;i<5;i++)s+=rect(90+i*5,118,2,4,sensor,1);
 for(let i=0;i<d.life*4;i++){const x=72+(i*17)%55,y=47+(i*29)%91;s+=line(x,y,x+3+i%4,y-1,lit,1);}
 if(d.life>=2)s+=path('M74 111L86 108L89 131H77Z','#6b868c',lit,.8)+ellipse(80,115,1.6,1.6,dark)+ellipse(83,125,1.6,1.6,dark);
 for(const x of [72,128])for(const y of [50,110,131])s+=ellipse(x,y,2,2,dark,lit,.7)+line(x-1,y+1,x+1,y-1,lit,.6);
 // Gender-informed personal presentation remains independent of chassis construction.
 if(d.ornament===1)s+=ellipse(139,108,3,6,'none','#c6b585',1.3);if(d.ornament===2)s+=path('M62 112L57 122L63 129L68 122Z',sensor,dark,.7);
 return s;
}
function svg(v,options={}){const d=describe(v,options),r=roleDesigns[d.role],skin=materials[d.species][d.material],light=mix(skin,'f0dfbf',.42),shadow=mix(skin,'17212d',.54),cloth='#'+r.color;let s=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1200" viewBox="0 0 200 250"><defs><linearGradient id="room" x2="1" y2="1"><stop stop-color="#0b1823"/><stop offset=".55" stop-color="#294554"/><stop offset="1" stop-color="${mix(r.color,'263c49',.55)}"/></linearGradient><linearGradient id="skin"><stop stop-color="${shadow}"/><stop offset=".55" stop-color="#${skin}"/><stop offset="1" stop-color="${light}"/></linearGradient><linearGradient id="metal"><stop stop-color="${shadow}"/><stop offset=".42" stop-color="#${skin}"/><stop offset=".67" stop-color="${light}"/><stop offset="1" stop-color="${mix(skin,'3b5460',.4)}"/></linearGradient><linearGradient id="cloth" x2=".9" y2=".3"><stop stop-color="${mix(r.color,'0c1b27',.65)}"/><stop offset=".6" stop-color="${cloth}"/><stop offset="1" stop-color="${mix(r.color,'c4ccc2',.25)}"/></linearGradient><radialGradient id="lens" cx=".35" cy=".25"><stop stop-color="#c7eee2"/><stop offset=".45" stop-color="#517f98"/><stop offset="1" stop-color="#18374c"/></radialGradient></defs>`;
 s+=background(r,d)+clothing(d,r,skin);
 s+=`<g transform="rotate(${d.pose*.8} 100 157)">`+(d.species==='robot'?robot(d,skin):organic(d,skin))+'</g>';
 if(['tools','headset','flight','radio'].includes(r.prop))s+=path('M140 76Q153 79 144 102L126 116','none','#a8c1bf',2.3)+rect(138,79,7,20,'#263e4c',3)+ellipse(124,116,5,2.6,'#203847');
 // Subtle line texture keeps these vector portraits in the established illustration family.
 for(let i=0;i<16;i++)s+=line(15+i*17%173,185+i*7%62,20+i*17%173,185+i*7%62,'#dedac410',.5);
 s+=rect(0,0,200,250,'none',0,'#c3d4cb25')+'</svg>';return s;
}
function source(v){const d=describe(v),key=JSON.stringify(d);if(cache.has(key)){const x=cache.get(key);cache.delete(key);cache.set(key,x);return x;}const value='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(v));cache.set(key,value);if(cache.size>cacheLimit)cache.delete(cache.keys().next().value);return value;}
function appearance(v,options={}){const d=describe(v,options),features={robot:['a lit visor','three optical lenses','a telescopic camera','a luminous sensor ring','a segmented light band','offset optical lenses','a domed sensor','a vertical sensor array'],human:['closely cropped hair','a short neat cut','close curls','a long bob','swept locks','a tied bun','an undercut','long braids','a swept fringe','a wrapped head covering','full curls','a long side fringe'],veyr:['a plate crown','a split crystal crest','a broad mineral crown','a pointed crystal ridge','a translucent fan crown','a dark serrated ridge','interlocking mineral plates','a rounded polished crown'],ilyri:['layered ear fans','trailing gill filaments','tall narrow fins','rounded flowing fins','wide ear fans','pearl-like gill lobes','angular cheek fins','swept curling fins']};return (d.species==='robot'?['A clean','A maintained','A scuffed','A patched'][d.life]+' chassis':d.species==='human'?['A youthful','A mature','A weathered','A face lined by long service with a'][d.life]+(d.life===3?' silver-toned style':' face'):d.species==='veyr'?'A faceted mineral face':'A softly mottled amphibious face')+' with '+features[d.species][d.species==='robot'?d.face:d.style]+'.';}
return Object.freeze({version:1,pools,speciesOrder,total:Object.values(pools).reduce((a,b)=>a+b,0),base,describe,svg,source,appearance,cacheSize:()=>cache.size,cacheLimit,roleDesigns});
});
