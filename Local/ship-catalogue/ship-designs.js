import * as T from './vendor/three/three.module.js';
import './ship-specs.js';

// Approved visual recipes for all twenty classes. No game transactions.
const recipes={
 kestrel:{length:112,width:18,paint:0xb7bfc1,accent:0xb87935,kind:'courier'},
 swift:{length:124,width:12,paint:0xd5d9d5,accent:0x28788b,kind:'express'},
 peregrine:{length:157,width:24,paint:0xadb6b2,accent:0x9e5731,kind:'freighter'},
 albatross:{length:199,width:30,paint:0x9eaaa8,accent:0xb6a06a,kind:'lattice'},
 osprey:{length:120,width:30,paint:0x607683,accent:0xca7c47,kind:'cutter'},
 petrel:{length:171,width:22,paint:0xc9c7b7,accent:0xc28a36,kind:'tanker'},
 gannet:{length:162,width:34,paint:0x7f9392,accent:0xb1a16d,kind:'escort'},
 heron:{length:147,width:19,paint:0xe0ded0,accent:0xb66d3b,kind:'survey'},
 tern:{length:166,width:28,paint:0xd9ddd6,accent:0x397d8a,kind:'reefer'},
 cormorant:{length:159,width:32,paint:0xc1934a,accent:0xdac38d,kind:'tug'},
 pelican:{length:224,width:39,paint:0x8eaaa9,accent:0xc5b174,kind:'bulk'},
 gyrfalcon:{length:200,width:29,paint:0x687f8b,accent:0xc4a15b,kind:'frigate'},
 merlin:{length:114,width:18,paint:0x62707a,accent:0xb77f42,kind:'interceptor'},
 curlew:{length:166,width:25,paint:0xa8aaa0,accent:0x687f7d,kind:'liner'},
 sanderling:{length:144,width:36,paint:0x9a835a,accent:0xc0a05d,kind:'miner'},
 rook:{length:171,width:34,paint:0x788078,accent:0xb19a58,kind:'salvager'},
 ibis:{length:181,width:27,paint:0xb8bcb1,accent:0x5c8882,kind:'hospital'},
 crane:{length:208,width:38,paint:0x8c8b72,accent:0xb39b56,kind:'workshop'},
 nightjar:{length:181,width:19,paint:0x45515b,accent:0x827665,kind:'electronic'},
 condor:{length:248,width:48,paint:0x7a8580,accent:0xa99e7d,kind:'carrier'}
};
const profiles={
 merlin:{scale:[.9,1.02,1.05],features:['Oversized twin drive chambers','Armored interception spine','Recessed paired pulse optics','Short-range utility compartment']},
 curlew:{scale:[1.35,1.15,1.1],features:['Six linked pressure cabins','Continuous life-support gallery','Captive escape capsules','Shielded passenger docking vestibules']},
 sanderling:{scale:[1.45,1.35,1.35],features:['Articulated excavation arms','Braced mineral hoppers','Raised crusher machinery','Protected processing and tool deck']},
 rook:{scale:[1.5,1.3,1.3],features:['Asymmetric recovery crane','Open reinforced wreck cradle','Captive cable and grapple system','Sealed salvage assessment workshop']},
 ibis:{scale:[1.45,1.25,1.3],features:['Three isolated treatment wards','Twin ambulance docking galleries','Protected life-support backbone','Separate relief stores']},
 crane:{scale:[1.85,1.5,1.5],features:['Twin articulated service booms','Sheltered open repair bays','Replaceable spare-component racks','Overhead handling gantries']},
 nightjar:{scale:[1.55,1.1,1.5],features:['Staggered directional signal arrays','Shielded electronics compartments','Broad dedicated cooling beds','Protected decoy launch cells']},
 condor:{scale:[2.25,1.65,1.6],features:['Twin framed utility hangars','Integrated offset command tower','Two cradle-mounted utility tenders','Four main drive chambers']},
 swift:{scale:[.62,.7,.72],features:['Needle pressure hull','Three compact drive nozzles','Swept radiator strakes','Flush urgent-cargo bay']},
 kestrel:{scale:[.83,.88,.88],features:['Twin serviceable nacelles','Ventral docking collar','Compact dorsal freight pod','Recessed two-part canopy']},
 osprey:{scale:[.95,1.1,1.08],features:['Armored delta shoulders','Layered forward cheek plates','Short patrol drive booms','Recessed weapon bays']},
 heron:{scale:[.95,1.05,1.08],features:['Braced survey dish','Twin optical instrument booms','Wide heat-rejection outriggers','Modular research cabin']},
 peregrine:{scale:[1.2,1.12,1.1],features:['Three framed container berths','External freight spine','Docking and cargo-lock hardware','Independent drive service pods']},
 tern:{scale:[1.25,1.2,1.12],features:['Four insulated freight modules','Dedicated roof cooling banks','Continuous thermal feed lines','Protected cold-store service doors']},
 petrel:{scale:[1.3,1.25,1.2],features:['Six jacketed propellant drums','Braced transfer manifolds','Protected cross-feed plumbing','Aft tank-service gantry']},
 cormorant:{scale:[1.4,1.18,1.18],features:['Open handling fork','Articulated cargo clamps','Recessed winch and cable drums','Reinforced belly cradle']},
 gannet:{scale:[1.45,1.3,1.25],features:['Broad armored command citadel','Four-nozzle drive cluster','Protected convoy stores','Heavy shoulder fairings']},
 gyrfalcon:{scale:[1.6,1.35,1.2],features:['Extended twin patrol booms','Faceted command citadel','Armored longitudinal spine','Protected forward optics and weapon shoulders']},
 albatross:{scale:[1.8,1.5,1.35],features:['Double cargo lattice','Cross-braced container gantries','Raised central service passage','Separated fore and aft pressure modules']},
 pelican:{scale:[2.15,1.8,1.55],features:['Large pressure-pod cargo train','Deep structural cargo cradle','Four reinforced main drive stations','Full-length external service gantries']}
};
for(const [id,profile]of Object.entries(profiles))Object.assign(recipes[id],profile);

const cockpitStyles={
 kestrel:'Twin-pane courier flight deck',swift:'Long tandem needle canopy',osprey:'Armored cutter vision slit',heron:'Framed survey observation dome',merlin:'Arrowhead interception canopy',petrel:'Offset tanker wheelhouse',peregrine:'Three-window freight deckhouse',tern:'Recessed thermal-hood pilothouse',curlew:'Panoramic passenger bridge',cormorant:'Starboard handling-control cab',sanderling:'Caged excavation cab',gannet:'Layered convoy command citadel',rook:'Asymmetric recovery observation cab',ibis:'Oval medical-service flight deck',gyrfalcon:'Recessed frigate command bunker',albatross:'Two-level forward navigation house',crane:'Linked twin operator booths',nightjar:'Shielded indirect-view command pod',pelican:'Raised bulk-carrier docking bridge',condor:'Split bow docking-control blisters'
};

function material(color,roughness=.45,metalness=.32){
 const mat=new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:metalness>.7?.06:.2,clearcoatRoughness:.38});
 mat.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 shipSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nshipSurface=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 shipSurface;\nfloat shipGrain(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=shipGrain(floor(shipSurface*19.));float wear=shipGrain(floor(shipSurface*1.7));diffuseColor.rgb*=.965+grain*.055;diffuseColor.rgb*=mix(.86,1.,smoothstep(.08,.38,wear));');
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(shipGrain(floor(shipSurface*7.))-.5)*.09,.08,.95);');
 };mat.customProgramCacheKey=()=> 'spacetrader-surface-2';return mat;
}
function rounded(sx,sy,sz,r=.5){
 r=Math.max(.02,Math.min(r,sx*.2,sy*.2,sz*.2));const x=-sx/2+r,y=-sy/2+r,w=sx-2*r,h=sy-2*r,s=new T.Shape();
 s.moveTo(x,y);s.lineTo(x+w,y);s.lineTo(x+w,y+h);s.lineTo(x,y+h);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:sz-r*2,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,steps:1,curveSegments:2});g.translate(0,0,-sz/2+r);return g;
}
function merged(group){
 group.updateMatrixWorld(true);const batches=new Map();
 group.traverse(obj=>{if(!obj.isMesh)return;let g=obj.geometry.clone().applyMatrix4(obj.matrixWorld);if(g.index){const expanded=g.toNonIndexed();g.dispose();g=expanded;}const key=obj.material.uuid;if(!batches.has(key))batches.set(key,{material:obj.material,geometries:[]});batches.get(key).geometries.push(g);});
 const out=new T.Group();for(const {material,geometries}of batches.values()){
  const geometry=new T.BufferGeometry();for(const name of ['position','normal','uv']){const itemSize=name==='uv'?2:3,total=geometries.reduce((n,g)=>n+g.attributes[name].array.length,0),buffer=new Float32Array(total);let offset=0;for(const g of geometries){buffer.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}geometry.setAttribute(name,new T.BufferAttribute(buffer,itemSize));}
  const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;out.add(mesh);for(const g of geometries)g.dispose();
 }
 group.traverse(obj=>{if(obj.isMesh)obj.geometry.dispose();});return out;
}
function attachmentScan(root){
 root.updateMatrixWorld(true);const meshes=root.children.filter(m=>m.isMesh),bounds=meshes.map(m=>new T.Box3().setFromObject(m)),parents=meshes.map((_,i)=>i),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
 for(let i=0;i<meshes.length;i++)for(let j=i+1;j<meshes.length;j++)if(bounds[i].clone().expandByScalar(.015).intersectsBox(bounds[j]))parents[find(j)]=find(i);
 const main=find(0),groups=new Map();for(let i=0;i<meshes.length;i++){const key=find(i);if(key===main)continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({index:i,type:meshes[i].geometry.type,position:meshes[i].position.toArray(),origin:meshes[i].userData.origin});}
 return {meshCount:meshes.length,detachedGroups:[...groups.values()]};
}

export function createShip(v){
 const c=recipes[v.shipID];if(!c)throw Error('Unknown hull');const balance=globalThis.SpacetraderShipSpecs.balance[v.shipID],u={armor:0,drive:0,tank:0,cargo:0,sensors:0,laser:0,weapons:0,shield:0,ordnance:0,...v.upgrades};
 const bulkOffset=u.tank*1.155,L=c.length,W=c.width,A=-L/2,F=L/2,root=new T.Group(),driveApertures=[],driveFaces=[],laserFaces=[],kineticFaces=[],bulkPods=[],bulkContainers=[],hangarBays=[];
 const m={paint:material(c.paint),secondary:material(new T.Color(c.paint).multiplyScalar(.72),.5,.48),accent:material(c.accent,.4,.35),steel:material(0x8e9c9c,.29,.85),dark:material(0x17262f,.52,.5),rubber:material(0x111a1f,.78,.08),radiator:material(0x25323a,.48,.68),ceramic:material(0xc6cac2,.67,.1),glass:new T.MeshPhysicalMaterial({color:0x163b4a,metalness:.45,roughness:.13,clearcoat:1,clearcoatRoughness:.08}),light:new T.MeshStandardMaterial({color:0xb4e2ed,emissive:0x81c5e8,emissiveIntensity:2,roughness:.3}),red:new T.MeshStandardMaterial({color:0x923526,emissive:0xa52b1b,emissiveIntensity:.8}),green:new T.MeshStandardMaterial({color:0x559b7a,emissive:0x2b7655,emissiveIntensity:.7})};
 const add=(geometry,mat,x=0,y=0,z=0)=>{const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);if(v.audit)mesh.userData.origin=new Error().stack.split('\n').slice(2,5).join(' ');root.add(mesh);return mesh;};
 const box=(x,y,z,sx,sy,sz,mat=m.paint,r=.4)=>add(rounded(sx,sy,sz,r),mat,x,y,z);
 const cyl=(x,y,z,length,r,mat=m.steel,r2=r,segments=24)=>{const mesh=add(new T.CylinderGeometry(r,r2,length,segments,1,false),mat,x,y,z);mesh.rotation.z=Math.PI/2;return mesh;};
 const ring=(x,y,z,r,t=.35,mat=m.steel)=>{const mesh=add(new T.TorusGeometry(r,t,6,32),mat,x,y,z);mesh.rotation.y=Math.PI/2;return mesh;};
 const beam=(a,b,r=.45,mat=m.steel)=>{const pa=new T.Vector3(...a),pb=new T.Vector3(...b),d=pb.clone().sub(pa),mesh=add(new T.CylinderGeometry(r,r,d.length(),8),mat,...pa.clone().add(pb).multiplyScalar(.5).toArray());mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;};
 function topAt(x,z,fallback){root.updateMatrixWorld(true);const hit=new T.Raycaster(new T.Vector3(x,1000,z),new T.Vector3(0,-1,0)).intersectObjects(root.children,false)[0];return hit?hit.point.y:fallback;}
 const vent=(x,y,z,length=12,width=6)=>{y=topAt(x,z,y)+.15;box(x,y,z,length,.6,width,m.dark,.1);for(let n=0;n<6;n++)box(x-length*.4+n*length*.16,y+.35,z,.5,.45,width*.83,m.steel,.07);};
 let sections=[];
 function loft(profile,mat=m.paint,offsetZ=0,offsetY=0){
  const vertices=[],uv=[],indices=[],rings=profile.map(([x,w,b,t])=>{const bevel=Math.min(w*.25,(t-b)*.24);return [[x,b+offsetY,-w*.7+offsetZ],[x,b+bevel+offsetY,-w+offsetZ],[x,t-bevel+offsetY,-w+offsetZ],[x,t+offsetY,-w*.7+offsetZ],[x,t+offsetY,w*.7+offsetZ],[x,t-bevel+offsetY,w+offsetZ],[x,b+bevel+offsetY,w+offsetZ],[x,b+offsetY,w*.7+offsetZ]];});
  const tri=(a,b,c)=>{const start=vertices.length/3;vertices.push(...a,...b,...c);uv.push(0,0,1,0,1,1);indices.push(start,start+1,start+2);};
  for(let k=0;k<rings.length-1;k++)for(let j=0;j<8;j++){const a=rings[k][j],b=rings[k+1][j],c=rings[k+1][(j+1)%8],d=rings[k][(j+1)%8];tri(a,c,b);tri(a,d,c);}
  for(let j=1;j<7;j++){tri(rings[0][0],rings[0][j+1],rings[0][j]);tri(rings.at(-1)[0],rings.at(-1)[j],rings.at(-1)[j+1]);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=add(g,mat);mesh.material.side=T.DoubleSide;return mesh;
 }
 function keel(profile){sections=profile.map(([x,w,b,t],i)=>{const central=i>0&&i<profile.length-1;return [x,w+(central?(u.tank*.38+u.cargo*.3+u.armor*.2):0),b,t+(central?u.cargo*.45+u.armor*.18:0)];});loft(sections,m.secondary);}
 function skin(x){for(let i=0;i<sections.length-1;i++){const a=sections[i],b=sections[i+1];if(x<=b[0]){const t=T.MathUtils.clamp((x-a[0])/(b[0]-a[0]),0,1);return a.slice(1).map((n,j)=>T.MathUtils.lerp(n,b[j+1],t));}}return sections.at(-1).slice(1);}
 function engine(x,y,z,r=6){
  const scale=1+u.drive*.045;r*=scale;driveApertures.push({x:x-9,y,z,radius:Math.max(r*1.13,r*1.11+.45)});const bodyLength=23+u.drive*2;cyl(x-3.5+bodyLength/2,y,z,bodyLength,r*.9,m.secondary,r*.82);ring(x+18,y,z,r*.85,.6,m.steel);
  const nozzle=add(new T.CylinderGeometry(r*.67,r*1.13,10,40,1,true),m.steel,x-4,y,z);nozzle.rotation.z=-Math.PI/2;
  const inner=add(new T.CylinderGeometry(r*.59,r*1.04,9.6,40,1,true),m.dark,x-4,y,z);inner.rotation.z=-Math.PI/2;
  ring(x-9,y,z,r*1.11,.45);driveFaces.push(cyl(x-3.8,y,z,.8,r*.58,m.light));ring(x-9.15,y,z,r*1.06,.3,m.secondary);
  for(let i=0;i<5+u.drive*2;i++){const at=2+i*1.8,skinRadius=r*T.MathUtils.lerp(.9,.82,(at+3.5)/bodyLength);ring(x+at,y,z,skinRadius+.08,.22,i<5?m.steel:m.accent);}
  for(const side of [-1,1]){beam([x-6,y+side*r*.85,z],[x+19,y+side*r*.75,z],.45);box(x+11,y+r*.83,z,9,1,3.5,m.dark);}
 }
 function radiator(x,y,z,length,width){box(x,y,z,length,.65,width,m.dark,.15);for(let j=0;j<10+u.drive;j++)box(x-length*.46+j*length*.92/(9+u.drive),y+.45,z,.45,.3,width*.9,m.steel,.05);beam([x-length/2,y-.5,z],[x+length/2,y-.5,z],.6);}
 function tank(x,y,z,length,r,fixed=false){r*=fixed?1:1+u.tank*.055;const shape=[[0,0],[2,r*.52],[5,r*.87],[8,r],[length-8,r],[length-5,r*.87],[length-2,r*.52],[length,0]],profile=shape.map(([a,b])=>new T.Vector2(b,a-length/2));const mesh=add(new T.LatheGeometry(profile,32),m.ceramic,x,y,z);if(c.kind==='bulk')bulkPods.push(mesh);mesh.rotation.z=Math.PI/2;for(const s of [-1,1]){ring(x+s*(length/2-10),y,z,r+.15,.7,m.secondary);const sx=x+s*length*.3,[w,b,t]=skin(sx);beam([sx,t-.6,T.MathUtils.clamp(z,-w*.55,w*.55)],[sx,y-r+.4,z],1.1,m.secondary);box(sx,y-r+.3,z,3,1.6,r*1.2,m.secondary,.3);}box(x,y+r+.1,z,length*.55,.4,1.4,m.accent);if(u.tank&&!fixed)for(let i=0;i<u.tank;i++)ring(x-length*.18+i*3,y,z,r+.16,.2,m.accent);}
 function cargo(x,y,z,length,width,height,mat=m.paint){height+=u.cargo*1.3;const container=box(x,y+height/2,z,length,height,width,mat,1);if(c.kind==='bulk')bulkContainers.push(container);box(x,y+height+.15,z,length-4,.6,width-4,m.secondary,.12);for(const side of [-1,1]){box(x,y+height*.5,z+side*(width/2+.15),length-4,height-3,.4,m.secondary,.08);for(let i=0;i<6;i++)box(x-length*.4+i*length*.16,y+height*.5,z+side*(width/2+.43),.7,height-5,.4,m.steel,.08);box(x,y+height*.22,z+side*(width/2+.38),length*.6,1,.3,m.accent,.04);}for(const end of [-1,1]){const sx=x+end*length*.32,[w,b,t]=skin(sx);beam([sx,t-.6,T.MathUtils.clamp(z,-w*.55,w*.55)],[sx,y-.45,z],1.1,m.secondary);beam([sx,y-.45,z-width*.48],[sx,y-.45,z+width*.48],.9,m.secondary);for(const side of [-1,1])box(x+end*(length/2-2),y+.6,z+side*(width/2-1.5),3,2.2,3,m.dark);}}
 function sideAt(x,y){const [w,b,t]=skin(x),e=Math.min(w*.25,(t-b)*.24);return y>t-e?T.MathUtils.lerp(w,w*.7,(y-(t-e))/e):y<b+e?T.MathUtils.lerp(w*.7,w,(y-b)/e):w;}
 const combat=['cutter','escort','frigate','interceptor'].includes(c.kind),industrial=['lattice','bulk','tanker','tug','miner','salvager','workshop','carrier'].includes(c.kind);
 if(c.kind==='courier'){
  keel([[A+6,9,0,11],[A+25,W,-2,19],[F-29,W*.83,-1,16],[F-8,7,3,10],[F,2,5,7]]);
  for(const s of [-1,1]){loft([[A+6,7,0,9],[A+24,10,-1,12],[F-34,5,1,9],[F-19,1,4,6]],m.paint,s*22);engine(A+1,6,s*22,5.8);radiator(A+34,4,s*34,34,11);beam([A+27,3,s*18],[A+32,4,s*34],1.5,m.secondary);}cargo(A+41,18,0,22,21,6);
 }else if(c.kind==='express'){
  keel([[A+4,8,1,12],[A+33,W,-2,14],[F-22,5,2,10],[F+7,.6,4,6]]);
  for(const s of [-1,1]){loft([[A+13,3,0,6],[A+40,9,-1,8],[F-22,1,3,6]],m.paint,s*14);engine(A+1,4,s*15,4.8);radiator(A+40,1,s*25,40,6);beam([A+24,1,s*11],[A+43,1,s*25],1,m.secondary);}engine(A-2,4,0,3);
 }else if(c.kind==='interceptor'){
  keel([[A+5,8,-3,11],[A+30,11,-2,14],[F-25,7,1,11],[F,2,5,7]]);
  for(const side of [-1,1]){loft([[A+1,7,-4,9],[A+25,8,-3,12],[F-32,3,2,9]],m.secondary,side*20);engine(A-2,4,side*20,8);beam([A+26,5,side*7],[A+25,5,side*20],1.5,m.secondary);radiator(A+36,1,side*30,30,8);beam([A+29,2,side*20],[A+35,1,side*30],1.2,m.secondary);}
 }else if(combat){
  keel([[A+7,W*.65,-3,13],[A+30,W,-4,21],[F-35,W*.7,0,c.kind==='frigate'?28:20],[F-9,9,4,13],[F+1,2,6,8]]);
  const boom=c.kind==='cutter'?W:c.kind==='interceptor'?W*.95:W*.88;
  for(const s of [-1,1]){loft([[A+1,9,-4,10],[A+27,11,-3,15],[F-34,7,0,12],[F-15,1.5,4,7]],m.secondary,s*boom);engine(A-2,4,s*boom,c.kind==='interceptor'?8:c.kind==='cutter'?6.5:8);radiator(A+47,3,s*(boom+12),L*.35,8);for(let i=0;i<4;i++)vent(A+31+i*14,16,s*boom,10,8);}
  if(c.kind==='escort'){cargo(A+53,20,-13,30,19,8,m.secondary);cargo(A+53,20,13,30,19,8,m.secondary);for(const s of [-1,1])engine(A+5,-4,s*14,4);}
  if(c.kind==='frigate'){loft([[A+54,13,22,26],[A+68,18,21,33],[F-40,13,23,34],[F-25,4,20,25]],m.paint);for(const s of [-1,1]){tank(A+39,7,s*41,47,5.5);beam([A+12,3,s*25],[A+42,4,s*41],1.2,m.secondary);}}
 }else{
  keel(['miner','salvager','workshop','carrier'].includes(c.kind)?[[A+8,W*.5,-3,8],[A+28,W*.7,-4,12],[F-25,W*.57,-1,14],[F+1,W*.42,2,12]]:[[A+8,W*.5,-3,8],[A+28,W*.7,-4,12],[F-32,W*.57,-1,14],[F-10,8,3,11],[F+1,2,5,7]]);
  if(c.kind==='freighter'){for(let i=0;i<3;i++)cargo(A+38+i*31,11,0,28,42,18,i%2?m.secondary:m.paint);for(const s of [-1,1])loft([[A+17,6,-1,7],[A+35,8,-2,11],[F-25,4,0,8]],m.secondary,s*29);}
  if(c.kind==='lattice'){for(let i=0;i<4;i++)for(const s of [-1,1]){cargo(A+39+i*32,13,s*16,28,28,17,i%2?m.paint:m.ceramic);beam([A+22+i*32,5,s*32],[A+22+(i+1)*32,6,s*32],1,m.steel);beam([A+22+i*32,5,s*32],[A+22+(i+1)*32,12,s*24],.8,m.steel);}for(const s of [-1,1])beam([A+22,6,s*33],[F-25,6,s*33],1.2,m.secondary);}
  if(c.kind==='tanker'){for(let i=0;i<3;i++)for(const s of [-1,1])tank(A+35+i*38,16,s*16,35,11);for(const s of [-1,1])beam([A+17,3,s*30],[F-26,3,s*30],1.5,m.secondary);}
  if(c.kind==='reefer'){for(let i=0;i<4;i++){cargo(A+32+i*30,12,0,27,48,20,m.ceramic);vent(A+32+i*30,33.7,0,18,23);box(A+32+i*30,24,24.6,20,2,.45,m.accent,.1);}for(const s of [-1,1])beam([A+17,4,s*28],[F-21,4,s*28],1.8,m.secondary);}
  if(c.kind==='tug'){for(const s of [-1,1]){loft([[A+5,10,-3,10],[A+31,12,-4,13],[F+9,5,-1,9],[F+14,4,1,7]],m.paint,s*31);box(F+5,3,s*31,13,10,13,m.dark);box(F+6,4,s*26,10,5,4,m.steel);for(let j=0;j<6;j++)box(F-20+j*4,9,s*31,1,.4,6,j%2?m.dark:m.accent,.05);}cargo(A+49,11,0,35,25,11,m.secondary);cyl(A+12,12,0,12,7,m.steel);}
  if(c.kind==='bulk'){for(let i=0;i<4;i++){tank(A+40+i*39,27,0,36,21);for(const s of [-1,1])cargo(A+40+i*39,8,s*(31+bulkOffset),31,18,18,m.secondary);}for(const s of [-1,1]){beam([A+17,0,s*(39+bulkOffset)],[F-20,0,s*(39+bulkOffset)],2,m.secondary);engine(A-2,-7,s*34,6);}}
  if(c.kind==='survey'){loft([[A+23,14,12,18],[A+37,19,11,24],[F-33,12,13,22]],m.paint);for(const s of [-1,1])tank(A+36,8,s*24,48,7);const dx=A+47;beam([dx,22,0],[dx-5,41,0],1);beam([dx+8,22,0],[dx-5,41,0],.75);const profile=[new T.Vector2(0,0),new T.Vector2(3,.1),new T.Vector2(8,1.3),new T.Vector2(13,4)];const dish=add(new T.LatheGeometry(profile,40),m.ceramic,dx-5,40,0);dish.rotation.x=.22;const dishPoint=(r,a,h)=>new T.Vector3(r*Math.cos(a),h,r*Math.sin(a)).applyEuler(dish.rotation).add(dish.position).toArray(),focus=dishPoint(0,0,7),receiver=add(new T.CylinderGeometry(1,1,1.8,16),m.steel,...focus);receiver.rotation.x=.22;for(let j=0;j<3;j++)beam(focus,dishPoint(13,j*Math.PI*2/3,4),.25,m.steel);for(const s of [-1,1]){box(F-39,24,s*14,12,5,5,m.dark);box(F-39,26.5,s*14,8,.6,3,m.glass);}}
  const tail=c.kind==='tug'?31:c.kind==='bulk'?34:c.kind==='carrier'?37:W*.56,driveY=c.kind==='bulk'?14:c.kind==='carrier'?16:4;for(const s of [-1,1]){engine(A-1,driveY,s*tail,industrial?8:6.5);radiator(A+34,0,s*(W+11),L*.34,10);beam([A+18,1,s*W*.55],[A+33,0,s*(W+11)],1.1,m.secondary);}
 }
 // Structural signatures are specific to each job, not extra gameplay capabilities.
 function pipe(points,r=.5,mat=m.steel){for(let i=0;i<points.length-1;i++)beam(points[i],points[i+1],r,mat);}
 function collar(x,y,z,r,axis='x'){
  const outer=ring(x,y,z,r,.8,m.secondary),inner=ring(x,y,z,r*.76,.35,m.steel);
  if(axis==='y'){outer.rotation.y=0;outer.rotation.x=Math.PI/2;inner.rotation.y=0;inner.rotation.x=Math.PI/2;}if(axis==='z'){outer.rotation.y=0;inner.rotation.y=0;}
  for(const s of [-1,1])box(x+(axis==='y'||axis==='z'?s*r*.8:0),y+(axis==='x'?s*r*.8:0),z,2.2,2.2,2.2,m.accent,.2);
 }

 // Eight original industrial structures: pressure modules and machinery mounted on the keel.
 function jointPin(x,y,z,r=2){cyl(x,y,z,4,r,m.steel);ring(x,y,z,r+.15,.35,m.secondary);}
 function arm(points,r=1.2){for(let i=0;i<points.length-1;i++){const pa=new T.Vector3(...points[i]),pb=new T.Vector3(...points[i+1]),d=pb.clone().sub(pa),lattice=['salvager','workshop'].includes(c.kind);beam(points[i],points[i+1],lattice?r*.65:r,m.secondary);if(lattice){const off=new T.Vector3().crossVectors(d,new T.Vector3(0,1,0)).normalize().multiplyScalar(r*1.2);for(const side of [-1,1])beam(pa.clone().addScaledVector(off,side).toArray(),pb.clone().addScaledVector(off,side).toArray(),r*.35,m.steel);for(const f of [.25,.5,.75]){const at=pa.clone().addScaledVector(d,f);beam(at.clone().sub(off).toArray(),at.clone().add(off).toArray(),r*.24,m.secondary);}}jointPin(...points[i],r*1.75);}jointPin(...points.at(-1),r*1.5);}
 function rootedPost(x,z,y,r=1){const [w,b,t]=skin(x);beam([x,t-.5,T.MathUtils.clamp(z,-w*.6,w*.6)],[x,y,z],r,m.secondary);}
 if(c.kind==='interceptor'){
  for(const side of [-1,1]){loft([[A+11,4,8,11],[A+35,7,10,17],[F-32,3,11,15]],m.paint,side*16);pipe([[A+12,11,side*16],[A+30,17,side*13],[F-34,15,side*9]],.7,m.steel);}
  box(A+31,16,0,24,5,12,m.secondary);vent(A+31,19,0,19,9);
 }
 if(c.kind==='liner'){
  for(const side of [-1,1]){
   for(let i=0;i<3;i++){const x=A+38+i*31;tank(x,21,side*15,29,9,true);box(x,22,side*24,12,3,.5,m.glass,.1);for(let j=0;j<3;j++)box(x-4+j*4,22,side*24.35,.4,3,.3,m.secondary,.04);}
   beam([A+23,15,side*15],[F-29,15,side*15],1.6,m.secondary);
   for(const x of [A+46,F-47]){const [w,b,t]=skin(x);beam([x,t-.5,side*8],[x,14,side*30],1.4,m.secondary);cyl(x,14,side*29,12,3.4,m.paint);ring(x+4,14,side*29,3.5,.4);}
  }
  box(0,24,0,L*.62,6,9,m.secondary);for(const x of [A+34,F-37])rootedPost(x,0,24,1.5);
  collar(F-28,13,0,4,'y');
 }
 if(c.kind==='miner'){
  cargo(A+40,12,0,33,32,20,m.secondary);box(A+38,33,0,25,9,22,m.dark);for(let j=0;j<6;j++)box(A+29+j*4,37,0,1.5,2,22,m.steel,.1);
  for(const side of [-1,1]){
   const x=A+69;cargo(x,11,side*17,25,22,13,m.paint);rootedPost(F-30,side*30,10,2);box(F-30,10,side*30,15,8,13,m.secondary);
   const points=[[F-30,12,side*30],[F-10,18,side*39],[F+8,8,side*31]];arm(points,1.8);cyl(F+12,8,side*31,13,3,m.dark);for(let j=0;j<4;j++)ring(F+8+j*2.4,8,side*31,3.1,.6,m.steel);
   beam([F-30,10,side*30],[F-10,17,side*39],.65,m.steel);
  }
 }
 if(c.kind==='salvager'){
  cargo(A+45,12,-20,45,26,17,m.secondary);box(A+43,29,-20,24,7,20,m.paint);vent(A+43,33,-20,18,14);
  for(const z of [-4,27]){rootedPost(A+79,z,17,1.6);rootedPost(F-25,z,17,1.6);beam([A+68,17,z],[F-19,17,z],1.6,m.secondary);for(let i=0;i<5;i++)box(A+73+i*12,18,z,3,3,6,m.accent,.2);}
  box((A+68+F-19)/2,14.5,11.5,F-19-(A+68),1.5,31,m.dark,.2);for(const x of [A+73,F-29]){beam([x,15,-7],[x,15,29],1.2,m.steel);for(const z of [-4,27])rootedPost(x,z,17,1.2);}
  rootedPost(A+57,-25,35,2);box(A+57,29,-25,15,13,15,m.secondary);arm([[A+57,35,-25],[A+80,53,-13],[F-23,34,10]],1.8);
  beam([A+58,38,-25],[A+80,54,-13],.65,m.steel);beam([F-23,34,10],[F-23,17,10],.2,m.steel);for(const side of [-1,1])beam([F-23,17,10],[F-17,13,10+side*4],.7,m.secondary);
  cyl(A+51,33,-25,12,3.5,m.dark);for(let j=0;j<5;j++)ring(A+46+j*2,33,-25,3.6,.4);
 }
 if(c.kind==='hospital'){
  for(let i=0;i<3;i++){const x=A+38+i*38;tank(x,22,0,35,14,true);box(x,36,0,17,1,10,m.accent,.15);box(x,36.7,0,2,.5,8,m.ceramic,.05);box(x,36.7,0,7,.5,2,m.ceramic,.05);}
  for(const side of [-1,1]){
   beam([A+23,14,side*25],[F-25,14,side*25],1.5,m.secondary);
   for(const x of [A+47,F-48]){rootedPost(x,side*25,14,1.3);box(x,18,side*24,19,10,10,m.paint);collar(x,18,side*29,3.8,'z');const hatch=add(new T.CylinderGeometry(2.8,2.8,.4,24),m.dark,x,18,side*29.2);hatch.rotation.x=Math.PI/2;box(x,23.2,side*24,12,.4,6,m.glass,.1);}
   pipe([[A+22,10,side*15],[A+22,26,side*15],[F-30,26,side*15],[F-30,12,side*15]],.7,m.accent);
  }
 }
 if(c.kind==='workshop'){
  for(const side of [-1,1]){
   cargo(A+45,11,side*23,42,24,19,m.secondary);box(A+45,30+u.cargo*1.3,side*23,32,2,18,m.paint);
   rootedPost(A+73,side*26,32,2);box(A+73,25,side*26,15,15,16,m.paint);arm([[A+73,32,side*26],[A+98,48,side*34],[F-24,29,side*22]],2);
   beam([A+74,36,side*26],[A+98,49,side*34],.75,m.steel);box(F-24,29,side*22,10,5,8,m.dark);for(const pin of [-1,1])beam([F-24,28,side*22],[F-16,24,side*22+pin*4],.7,m.steel);
   for(const x of [A+95,F-37]){const z=side*27;rootedPost(x,z,12,1.5);box(x,12,z,24,2,18,m.secondary);box(x,24,z,24,2,18,m.paint);box(x,18,z-side*8,24,12,2,m.dark);for(const end of [-1,1])box(x+end*11,18,z,2,12,18,m.secondary);for(let j=0;j<3;j++)box(x-6+j*6,16,z-side*4,3,5,4,m.steel,.2);for(const end of [-1,1])box(x+end*10,18,z+side*8.5,1,12,1,m.accent,.1);}
  }
  for(const x of [A+42,F-50]){for(const z of [-33,33])rootedPost(x,z,34,1.2);beam([x,34,-33],[x,34,33],1,m.steel);}
 }
 if(c.kind==='electronic'){
  loft([[A+24,9,12,18],[A+48,12,10,25],[F-34,8,12,22]],m.paint);
  for(let i=0;i<3;i++)for(const side of [-1,1]){
   const x=A+42+i*33,z=side*(25+i*4);rootedPost(x,z,21,1.3);beam([x-12,21,z],[x+12,21,z],1,m.secondary);
   box(x,23,z,28,5,14,m.dark);for(let j=0;j<7;j++)box(x-11+j*3.6,25.55,z,1,.4,12,m.radiator,.04);for(const edge of [-1,1]){box(x+edge*13.2,25.45,z,1,.45,14,m.steel,.1);box(x,25.45,z+edge*6.6,27,.45,1,m.secondary,.1);}
   for(const dx of [-10,10])beam([x+dx,21,z],[x+dx,24,z-side*5],.6,m.steel);
  }
  for(const side of [-1,1]){const x=F-40,[w,b,t]=skin(x);box(x,t-2,side*8,22,5,7,m.secondary);for(let j=0;j<5;j++)cyl(x-8+j*4,t-1,side*8,2.5,1,m.dark);}
 }
 if(c.kind==='carrier'){
  for(const side of [-1,1]){
   const cx=A+111,z=side*29,half=17,start=A+52,end=F-35;
   box((start+end)/2,12,z,end-start,4,36,m.secondary);box((start+end)/2,40,z,end-start,4,36,m.paint);
   for(const edge of [-1,1])box((start+end)/2,26,z+edge*half,end-start,28,3,m.secondary);box(start,26,z,3,28,36,m.secondary);
   for(let x=start+5;x<=end;x+=22){beam([x,14,z-half+2],[x,38,z-half+2],.9,m.steel);beam([x,38,z-half],[x,38,z+half],1,m.steel);beam([x,14,z+half-2],[x,38,z+half-2],.9,m.steel);rootedPost(x,z,12,1.5);}
   for(let x=start+6;x<end-4;x+=22){const outer=z+side*18.5;box(x,26,outer,2.2,29,2,m.secondary,.3);box(x,41,z,3,1,36,m.steel,.15);for(const y of [16,35])box(x,y,outer+side,4,2,1,m.accent,.1);}
   for(const y of [17,35])box((start+end)/2,y,z+side*18.5,end-start-4,1.4,1.5,m.secondary,.15);
   for(const edge of [-1,1])box(end,26,z+edge*15.2,4,27,2,m.accent,.2);box(end,39,z,4,2,32,m.accent,.2);
   for(let j=0;j<7;j++)box(end-3,14.1,z-12+j*4,3,.35,1.2,m.light,.05);
   // Parked tenders are scale references only. Their cold drives are not carrier engines.
   const tx=end-31,tenderStart=root.children.length;
   for(const dx of [-10,10]){
    box(tx+dx,14.3,z,5,.6,24,m.dark,.12);
    for(const edge of [-1,1]){
     box(tx+dx,14.8,z+edge*7,4,1,4,m.accent,.12);
     beam([tx+dx,15.1,z+edge*7],[tx+dx,19.2,z+edge*5],.65,m.steel);
     box(tx+dx,18.9,z+edge*5,4,1.2,3,m.secondary,.15);
    }
   }
   loft([[tx-22,4,19,25],[tx-14,7.5,18,28],[tx+7,6,19,27],[tx+18,2,21,24]],m.ceramic,z);
   loft([[tx-3,4.5,26,28],[tx+4,4.4,26,31],[tx+12,2.4,24,27]],m.secondary,z);
   loft([[tx+4.2,3.7,28.8,30.7],[tx+10.8,2.25,26,27.2]],m.glass,z);
   beam([tx+4.2,30.7,z],[tx+10.8,27.2,z],.22,m.secondary);
   for(const edge of [-1,1]){
    loft([[tx-21,2.5,20,25],[tx-10,3.2,19,26],[tx+1,1.8,21,25]],m.secondary,z+edge*8);
    cyl(tx-21.1,22.5,z+edge*8,1.2,2.1,m.steel);cyl(tx-21.75,22.5,z+edge*8,.25,1.5,m.dark);
    box(tx-4,24,z+edge*6.4,12,1.1,.6,m.accent,.08);
    box(tx-10,26.1,z+edge*8,5,.5,2,m.radiator,.08);
   }
   if(v.audit)hangarBays.push({reserved:new T.Box3(new T.Vector3(tx-23,18,z-11.5),new T.Vector3(tx+19,32,z+11.5)),tenderParts:new Set(root.children.slice(tenderStart))});
   // Clear centerline and short edge markings keep the docking floor readable.
   for(const dx of [-25,-17,-9,-1,7,15])box(tx+dx,14.04,z,4,.12,.65,m.accent,.03);
   for(const x of [A+32,F-52]){
    if(x<start)rootedPost(x,side*51,26,2);
    else{
     // Carry the service sponson on the exterior wall, never diagonally through its bay.
     box(x,12,side*49,18,4,8,m.secondary);
     for(const dx of [-5,5])beam([x+dx,14,side*51],[x+dx,21,side*51],1.2,m.steel);
    }
    box(x,26,side*51,16,12,8,m.secondary);vent(x,33,side*51,12,6);
   }
   for(const x of [A+75,A+113,A+151]){box(x,42.15,z,20,.5,12,m.secondary,.15);vent(x,42.5,z,15,8);}
   engine(A-3,-8,side*37,9);loft([[A+1,12,-18,27],[A+14,13,-18,29],[A+35,10,-3,17]],m.secondary,side*37);beam([A+23,5,side*19],[A+23,5,side*37],2,m.secondary);
  }
  // A pressure lift, tapered pedestal and bridge house share the port hangar structure.
  const bx=A+78,bz=-29;
  box(bx-17,27,-44,9,30,6,m.secondary,.65);
  for(const y of [18,27,36])box(bx-17,y,-47.1,6,1.4,.7,m.steel,.12);
  loft([[bx-23,12,40.5,43],[bx-16,15,40.5,46],[bx+13,15,40.5,46],[bx+22,10,40.5,43]],m.secondary,bz);
  loft([[bx-15,10,44,53],[bx-10,10,44,58],[bx+7,8,44,58],[bx+12,7,44,54]],m.paint,bz);
  for(const edge of [-1,1]){
   beam([bx-16,43,bz+edge*12],[bx-9,57,bz+edge*8],1.1,m.secondary);
   beam([bx+17,43,bz+edge*10],[bx+6,56,bz+edge*7],1.1,m.secondary);
   box(bx-4,50,bz+edge*9.7,12,3,.6,m.dark,.1);
  }
  loft([[bx-19,9,55,63],[bx-10,13,54,66],[bx+10,13,54,66],[bx+16,10,56,64]],m.paint,bz);
  // Recessed bridge glazing, with continuous sills and visible mullions.
  box(bx+16.08,60,bz,.35,4,16,m.glass,.08);
  box(bx-19.08,59,bz,.35,2.7,12,m.glass,.08);
  for(const y of [57.4,60.6])box(bx-19.25,y,bz,.6,.5,13,m.secondary,.08);
  for(const dz of [-6,0,6])box(bx-19.3,59,bz+dz,.6,3.5,.5,m.secondary,.08);
  for(const edge of [-1,1]){
   box(bx,60.5,bz+edge*13.08,18,3.8,.35,m.glass,.08);
   for(const y of [58.35,62.65])box(bx,y,bz+edge*13.2,20,.55,.65,m.secondary,.08);
   for(const dx of [-8,-2,4,8])box(bx+dx,60.5,bz+edge*13.28,.55,4.7,.55,m.secondary,.08);
  }
  for(const y of [57.8,62.2])box(bx+16.25,y,bz,.6,.6,17,m.secondary,.08);
  for(const dz of [-8,-3,3,8])box(bx+16.3,60,bz+dz,.6,4.8,.55,m.secondary,.08);
  box(bx,66,bz,23,1.2,25,m.secondary,.45);
  box(bx-4,67.2,bz,10,1.4,10,m.paint,.3);box(bx-4,68,bz,8,.3,8,m.dark,.08);
  beam([bx-11,66,bz],[bx-11,73,bz],.6,m.steel);box(bx-11,71.5,bz,2,3.2,6,m.secondary,.25);
  box(bx-11,73.3,bz,1.5,.5,2,m.light,.1);
  // Aft service door and restrained platform rails finish the accessible bridge base.
  box(bx-15.1,49,bz,1,8,5,m.dark,.2);box(bx-15.7,49,bz,.4,6,3,m.paint,.15);
  for(const dx of [-14,-3,8])beam([bx+dx,45.7,bz-13.5],[bx+dx,48.5,bz-13.5],.25,m.steel);
  beam([bx-14,48.5,bz-13.5],[bx+8,48.5,bz-13.5],.25,m.steel);
  for(const side of [-1,1])pipe([[A+24,8,side*23],[A+24,44,side*23],[F-37,44,side*23],[F-37,40,side*23]],1,m.steel);
 }
 if(['liner','hospital'].includes(c.kind)){const x=A+L*.57,[w,b,t]=skin(x);box(x,b-1-u.cargo*.6,0,L*.32,3+u.cargo*1.5,w*.85,m.secondary,.6);for(const side of [-1,1])box(x,b-1-u.cargo*.6,side*w*.4,L*.28,1,.5,m.accent,.1);}
 // Shared working-ship language: ribbed access trunks, captive latches and braced pipes.
 // Each fixture is seated by raycast rather than hovering over a sloped surface.
 const serviceXs=[A+24,A+L*.46];
 for(const x of serviceXs){const [w,b,t]=skin(x),z=-w*.35,roof=topAt(x,z,t);box(x,roof+.45,z,10,1.4,7,m.dark,.2);for(let j=0;j<4;j++)box(x-3+j*2,roof+1.16,z,.5,.3,5.5,m.steel,.04);for(const side of [-1,1])box(x+side*4,roof+.3,z,1.4,.8,7.8,m.secondary,.1);}
 for(const side of [-1,1]){const x=A+L*.62,z=side*skin(x)[0]*.5,y=topAt(x,z,skin(x)[2]);pipe([[x-6,topAt(x-6,z,y)-.1,z],[x-6,y+2,z],[x+7,y+2,z],[x+7,topAt(x+7,z,y)-.1,z]],.38,m.steel);}
 if(c.kind==='courier'){
  collar(A+37,-2,0,5.2,'y');box(A+38,-3.4,0,15,1.7,13,m.secondary);
  for(const s of [-1,1]){pipe([[A+19,9,s*22],[A+30,11,s*18],[A+47,11,s*18]],.55,m.steel);box(A+16,12,s*22,8,2,7,m.accent);box(A+44,5,s*37,6,2,4,m.dark);}
 }else if(c.kind==='express'){
  loft([[A+24,4,11,13],[A+37,6,10,18],[F-31,2,10,14]],m.secondary);
  for(const s of [-1,1]){loft([[A+21,1,4,6],[A+39,8,3,7],[F-31,1,6,8]],m.accent,s*22);for(let i=0;i<4;i++)box(A+26+i*5,15-i*.3,0,1.5,.35,4,m.steel,.05);}
 }else if(c.kind==='freighter'){
  for(let i=0;i<3;i++)for(const s of [-1,1]){const x=A+38+i*31,z=s*23;for(const end of [-1,1])beam([x+end*14,8,z],[x+end*14,32+u.cargo*1.3,z],1.1,m.secondary);beam([x-14,32+u.cargo*1.3,z],[x+14,32+u.cargo*1.3,z],.9,m.secondary);box(x,9,z,24,2.5,3,m.accent);for(const end of [-1,1])box(x+end*11,12,z,4,4,3,m.dark);}
  pipe([[A+24,7,0],[A+24,34,0],[F-30,34,0],[F-30,topAt(F-30,0,skin(F-30)[2])-.2,0]],.7,m.steel);
 }else if(c.kind==='lattice'){
  for(let i=0;i<4;i++)for(const s of [-1,1]){const x=A+39+i*32,z=s*33;beam([x-15,6,z],[x-15,36+u.cargo*1.3,z],1.3,m.secondary);beam([x-15,36+u.cargo*1.3,z],[x+15,36+u.cargo*1.3,z],1.1,m.secondary);beam([x-15,8,z],[x+15,35+u.cargo*1.3,z],.75,m.steel);box(x,35+u.cargo*1.3,0,28,1,14,m.dark);const [cw,cb,ct]=skin(x);beam([x,ct-.5,0],[x,35+u.cargo*1.3,0],1,m.secondary);for(const side of [-1,1])beam([x,35+u.cargo*1.3,side*6],[x,37+u.cargo*1.3,side*6],.5,m.steel);}
  for(const s of [-1,1]){beam([A+23,37+u.cargo*1.3,s*6],[F-29,37+u.cargo*1.3,s*6],.55,m.accent);box(A+13,10,s*29,15,9,12,m.secondary);}
 }else if(c.kind==='tanker'){
  for(const s of [-1,1]){
   pipe([[A+16,9,s*16],[A+16,31+u.tank*.6,s*16],[F-29,31+u.tank*.6,s*16],[F-29,11,s*16]],.8,m.steel);
   for(let i=0;i<3;i++){const x=A+35+i*38;beam([x,6,s*30],[x,24,s*30],.8,m.secondary);box(x,24,s*30,9,2,5,m.accent);pipe([[x,22,s*24],[x,22,s*31],[x+9,22,s*31]],.45,m.steel);}
  }
  beam([A+15,31,-19],[A+15,31,19],1,m.secondary);collar(A+15,31,0,4);
 }else if(c.kind==='reefer'){
  for(const s of [-1,1]){pipe([[A+16,5,s*28],[A+16,18,s*28],[F-24,18,s*28],[F-24,8,s*28],[F-21,4,s*28]],.8,m.accent);for(let i=0;i<4;i++){const x=A+32+i*30;box(x,26,s*24.35,15,9,.8,m.secondary,.3);box(x,26,s*24.75,12,6,.35,m.ceramic,.3);box(x+4,26,s*24.98,1,2,.4,m.steel,.05);beam([x,18,s*24],[x,18,s*28],.8,m.secondary);}}
 }else if(c.kind==='tug'){
  for(const s of [-1,1]){const z=s*31;beam([F-10,4,z],[F+12,0,s*24],1.4,m.steel);box(F+12,0,s*24,8,8,6,m.secondary);box(F+14,0,s*20,7,5,3,m.steel);for(let i=0;i<3;i++)ring(A+12+i*2,12,0,7.2,.45,m.dark);beam([A+27,-5,s*20],[F-8,-5,s*20],1.6,m.secondary);beam([A+30,-5,s*20],[F-5,2,s*31],1,m.steel);}
  pipe([[A+12,12,0],[A+29,12,0],[F-12,3,0]],.7,m.dark);
 }else if(c.kind==='bulk'){
  for(let i=0;i<4;i++)for(const s of [-1,1]){const x=A+40+i*39;beam([x-16,-1,s*(41+bulkOffset)],[x-16,32,s*(41+bulkOffset)],1.4,m.secondary);beam([x-16,32,s*(41+bulkOffset)],[x+16,32,s*(41+bulkOffset)],1,m.steel);beam([x-16,0,s*(41+bulkOffset)],[x+16,27,s*(41+bulkOffset)],.9,m.secondary);box(x,26.15+u.cargo*1.3,s*(31+bulkOffset),29,1.2,5,m.dark);box(x,26.8+u.cargo*1.3,s*(31+bulkOffset),27,.3,1.5,m.accent,.05);beam([x,26+u.cargo*1.3,s*(33+bulkOffset)],[x,28.5+u.cargo*1.3,s*(33+bulkOffset)],.5,m.steel);}
  for(const s of [-1,1]){beam([A+20,28.5+u.cargo*1.3,s*(33+bulkOffset)],[F-24,28.5+u.cargo*1.3,s*(33+bulkOffset)],.6,m.accent);loft([[A+1,13,-17,24],[A+14,15,-17,26],[A+30,9,1,13]],m.secondary,s*34);}
 }else if(c.kind==='survey'){
  for(const s of [-1,1]){const z=s*38;beam([A+36,11,s*24],[A+40,14,z],1,m.secondary);radiator(A+57,14,z,56,16);pipe([[F-40,19,s*9],[F-24,20,s*16],[F-13,20,s*16]],.65,m.steel);cyl(F-10,20,s*16,8,2,m.dark);cyl(F-6.05,20,s*16,.3,1.4,m.glass);box(A+32,26,0,18,5,12,m.secondary);}
 }else if(c.kind==='cutter'){
  for(const s of [-1,1]){loft([[A+31,9,12,16],[A+43,13,9,23],[F-18,5,6,13]],m.paint,s*22);for(let j=0;j<3;j++)box(A+33+j*9,19-j*.8,s*22,7,.8,12,m.secondary,.25);box(A+15,10,s*30,11,4,9,m.accent);}
 }else if(c.kind==='escort'){
  loft([[A+35,14,22,27],[A+49,18,21,36],[F-44,12,22,31]],m.secondary);
  for(const s of [-1,1]){loft([[A+28,12,6,13],[A+48,15,5,22],[F-31,8,4,16]],m.paint,s*31);for(let j=0;j<3;j++)vent(A+29+j*12,23,s*31,9,10);box(A+14,2,s*40,15,5,6,m.accent);}
 }else if(c.kind==='frigate'){
  for(const s of [-1,1]){loft([[A+34,8,8,15],[A+67,12,6,20],[F-25,6,5,15],[F+7,1,7,10]],m.secondary,s*29);beam([A+28,7,s*30],[A+60,25,s*16],1.2,m.steel);for(let i=0;i<5;i++)box(A+68+i*12,31,s*15,8,.8,5,i%2?m.paint:m.secondary,.2);box(F-35,16,s*19,15,4,5,m.dark);box(F-32,18.2,s*19,8,.3,3,m.glass,.1);}
 }
 // Captive service fixtures add readable, class-specific mechanical complexity.
 if(c.kind==='courier')for(const side of [-1,1]){const x=A+32,z=side*34;box(x,4,z,7,2.2,4,m.secondary);cyl(x,4,z,6,1.2,m.steel);}
 if(c.kind==='express'){const x=A+34,[w,b,t]=skin(x);for(const side of [-1,1])pipe([[A+19,7,side*15],[x,t-.3,side*5],[F-31,11,side*5]],.45,m.steel);}
 if(c.kind==='tanker')for(let i=0;i<3;i++)for(const side of [-1,1]){const x=A+35+i*38,z=side*30;box(x,23.6,z,5,2.4,5,m.secondary);cyl(x,24.2,z,4,1.5,m.accent);}
 if(c.kind==='tug')for(const side of [-1,1]){cyl(F+6,2,side*25,5,2.4,m.steel);box(A+12,8.5,side*7,8,4,3,m.secondary);}
 if(c.kind==='freighter'||c.kind==='lattice'||c.kind==='bulk')for(const x of [A+29,F-29]){const [w,b,t]=skin(x);box(x,t-.25,0,10,1.8,8,m.secondary);collar(x,t+.4,0,2.4,'y');}
 if(combat)for(const side of [-1,1]){const x=A+40,[w,b,t]=skin(x),endX=F-37,endZ=side*8;pipe([[A+21,topAt(A+21,side*W*.5,12)-.2,side*W*.5],[x,t-.2,side*w*.45],[endX,topAt(endX,endZ,skin(endX)[2])-.2,endZ]],.5,m.steel);}
 // Every class has its own command-space silhouette. Glazing follows actual shell faces.
 const cockpitStart=root.children.length,cockpitWindows=[];
 let bridgeX=F-25;
 function glazing(corners,columns=1,rows=1,outward=[1,0,0],border=.16){
  const v=corners.map(p=>new T.Vector3(...p)),normal=new T.Vector3().crossVectors(v[1].clone().sub(v[0]),v[3].clone().sub(v[0])).normalize();if(normal.dot(new T.Vector3(...outward))<0)normal.negate();
  const point=(u,t)=>v[0].clone().lerp(v[1],u).lerp(v[3].clone().lerp(v[2],u),t).addScaledVector(normal,.025);
  for(let col=0;col<columns;col++)for(let row=0;row<rows;row++){
   const u0=(col+.065)/columns,u1=(col+.935)/columns,t0=(row+.09)/rows,t1=(row+.91)/rows,p=[point(u0,t0),point(u1,t0),point(u1,t1),point(u0,t1)],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...p[0],...p[1],...p[2],...p[0],...p[2],...p[3]],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));g.computeVertexNormals();const pane=add(g,m.glass);pane.material.side=T.DoubleSide;
   for(let i=0;i<4;i++)beam(p[i].toArray(),p[(i+1)%4].toArray(),border,m.secondary);
   cockpitWindows.push({pane,point:point((u0+u1)*.5,t0+(t1-t0)*.43),normal});
  }
 }
 function cab(x,z,shape,mat=m.paint){
  bridgeX=x;const deck=skin(x)[2],surface=topAt(x,z,deck),y=surface-deck<=6?Math.max(deck-.1,surface):deck-.1,p=shape.map(([dx,w,h])=>[x+dx,w,skin(x+dx)[2]-.8,y+h+skin(x+dx)[2]-deck]);loft(p,mat,z);
  return {x,z,y,p};
 }
 function front(h,columns=2,rows=1,inset=.8){const [x,w,b,t]=h.p.at(-1),bevel=Math.min(w*.25,(t-b)*.24),bottom=b+bevel+.25,top=t-bevel-.25,half=w*inset;if(top<=bottom)return;glazing([[x,bottom,h.z-half],[x,bottom,h.z+half],[x,top,h.z+half],[x,top,h.z-half]],columns,rows);}
 function roof(h,segment,columns=2){const a=h.p[segment],b=h.p[segment+1];glazing([[a[0],a[3],h.z-a[1]*.66],[b[0],b[3],h.z-b[1]*.66],[b[0],b[3],h.z+b[1]*.66],[a[0],a[3],h.z+a[1]*.66]],columns,1,[0,1,0]);}
 function sides(h,segment,columns=2,band=0,rows=1){const a=h.p[segment],b=h.p[segment+1],edge=p=>Math.min(p[1]*.25,(p[3]-p[2])*.24);for(const side of [-1,1])glazing([[a[0],T.MathUtils.lerp(a[2]+edge(a)+.35,a[3]-edge(a)-.35,band),h.z+side*a[1]],[b[0],T.MathUtils.lerp(b[2]+edge(b)+.35,b[3]-edge(b)-.35,band),h.z+side*b[1]],[b[0],b[3]-edge(b)-.35,h.z+side*b[1]],[a[0],a[3]-edge(a)-.35,h.z+side*a[1]]],columns,rows,[0,0,side]);}
 function brow(h,width,depth=3){const [x,w,b,t]=h.p.at(-1);box(x-1,t+.25,h.z,depth,.7,width,m.secondary,.15);}
 function oval(h,x,y,ry,rz){const points=[];for(let i=0;i<32;i++){const angle=i*Math.PI*2/32;points.push(new T.Vector3(x+.025,y+Math.sin(angle)*ry,h.z+Math.cos(angle)*rz));}const center=new T.Vector3(x+.025,y,h.z),vertices=[];for(let i=0;i<32;i++)vertices.push(...center,...points[i],...points[(i+1)%32]);const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.BufferAttribute(new Float32Array(vertices.length/3*2),2));geometry.computeVertexNormals();const pane=add(geometry,m.glass);pane.material.side=T.DoubleSide;for(let i=0;i<32;i++)beam(points[i].toArray(),points[(i+1)%32].toArray(),.2,m.secondary);beam([x+.04,y-ry,h.z],[x+.04,y+ry,h.z],.15,m.secondary);cockpitWindows.push({pane,point:new T.Vector3(x+.025,y+ry*.25,h.z+rz*.3),normal:new T.Vector3(1,0,0)});}
 switch(v.shipID){
  case 'kestrel':{const h=cab(F-24,0,[[-15,5,4],[-7,8,8],[4,8,8],[12,6,4.5]]);roof(h,2,2);box(h.x-8,h.y+8.3,0,3,.6,11,m.secondary);break;}
  case 'swift':{const h=cab(F-30,0,[[-20,2.5,1.5],[-11,4.2,5.5],[4,3.8,5.1],[17,1.1,1.2]]);roof(h,1,3);roof(h,2,1);box(h.x-13,h.y+5,0,3,1.6,4,m.secondary);break;}
  case 'merlin':{const h=cab(F-29,0,[[-14,3,2],[-5,7,6],[7,4.5,4],[14,.9,1]]);roof(h,1,2);roof(h,2,1);for(const side of [-1,1])beam([h.x-6,h.y+5.8,side*5],[h.x+10,h.y+2,side*2.2],.45,m.secondary);break;}
  case 'osprey':{const h=cab(F-29,0,[[-14,8,3],[-6,10,6],[8,8,5],[11,7,4.4]],m.secondary);front(h,3,1,.83);brow(h,16,5);for(const side of [-1,1])box(h.x+7,h.y+1.5,side*7.2,9,1.8,3,m.paint);break;}
  case 'heron':{
   bridgeX=F-29;const y=skin(bridgeX)[2]+.7,r=6.3;box(bridgeX,y-.5,0,19,2,14,m.secondary,.7);add(new T.CylinderGeometry(r,r+1,1.2,16),m.paint,bridgeX,y,0);
   const geometry=new T.SphereGeometry(r,24,12,0,Math.PI*2,0,Math.PI/2);geometry.scale(1.32,.8,1);const dome=add(geometry,m.glass,bridgeX,y+.5,0);dome.material.side=T.DoubleSide;
   const domePoint=(theta,phi)=>[bridgeX+r*1.32*Math.sin(theta)*Math.cos(phi),y+.5+r*.8*Math.cos(theta),r*Math.sin(theta)*Math.sin(phi)];
   for(let n=0;n<8;n++)for(let k=0;k<10;k++)beam(domePoint(k*Math.PI/20,n*Math.PI/4),domePoint((k+1)*Math.PI/20,n*Math.PI/4),.14,m.secondary);
   for(const theta of [Math.PI/3,Math.PI/2])for(let n=0;n<40;n++)beam(domePoint(theta,n*Math.PI/20),domePoint(theta,(n+1)*Math.PI/20),.14,m.secondary);
   const point=new T.Vector3(...domePoint(.85,.35)),normal=new T.Vector3(point.x-bridgeX,(point.y-y-.5)*2,point.z).normalize();cockpitWindows.push({pane:dome,point,normal});break;}
  case 'petrel':{const h=cab(F-23,-6,[[-11,6,5],[-6,7,10],[8,7,10],[11,6,9]],m.ceramic);front(h,3);sides(h,1,3);brow(h,15,5);box(h.x-6,h.y+11,h.z,8,2,10,m.secondary);break;}
  case 'peregrine':{const h=cab(F-22,0,[[-13,7,6],[-8,9,9],[9,9,9],[12,8,8]]);front(h,3);sides(h,1,3);brow(h,18,4);box(h.x-7,h.y+9.3,0,5,.9,14,m.secondary);break;}
  case 'tern':{const h=cab(F-23,0,[[-13,9,4],[-5,11,8],[9,9,7],[12,7.5,6]],m.ceramic);front(h,2,1,.7);sides(h,1,2);brow(h,18,6);for(const side of [-1,1])beam([h.x-5,h.y+7.8,side*9],[h.x+11,h.y+5.7,side*7],.65,m.ceramic);break;}
  case 'curlew':{const h=cab(F-24,0,[[-14,6.5,4],[-8,7.5,9],[5,7.5,9],[12,6.5,8]],m.ceramic);front(h,5);sides(h,1,4,.65);roof(h,1,3);brow(h,21,3);break;}
  case 'cormorant':{const h=cab(F-34,8,[[-10,5,4],[-4,6,10],[8,6,10],[11,4.5,7]]);front(h,2,2);sides(h,1,2);brow(h,12,4);box(h.x-8,h.y+4,h.z,4,8,9,m.secondary);break;}
  case 'sanderling':{const h=cab(F-25,-5,[[-10,5,4],[-4,6,7],[7,6,7],[10,4.8,5.8]],m.secondary);front(h,2);sides(h,1,2);for(const side of [-1,1]){beam([h.x-5,h.y+7.5,h.z+side*6],[h.x+9,h.y+6.8,h.z+side*5],.45,m.steel);beam([h.x+9,h.y+.7,h.z+side*5],[h.x+9,h.y+6.8,h.z+side*5],.45,m.steel);}beam([h.x+9,h.y+6.8,h.z-5],[h.x+9,h.y+6.8,h.z+5],.45,m.steel);break;}
  case 'gannet':{const h=cab(F-29,0,[[-19,10,4],[-10,10,10],[7,9,9],[12,8.5,7.5]],m.secondary);front(h,4,2,.8);sides(h,1,3);brow(h,19,5);loft([[h.x-14,7,h.y+9,h.y+12],[h.x-3,8,h.y+9,h.y+12],[h.x+3,6,h.y+8,h.y+10]],m.paint);break;}
  case 'rook':{const h=cab(F-26,4,[[-11,4,3],[-4,4.5,8],[7,4.5,8],[12,3,4.5]]);roof(h,2,2);sides(h,1,3);front(h,2);box(h.x-6,h.y+skin(h.x-6)[2]-skin(h.x)[2]+7,h.z,5,1,8,m.secondary);break;}
  case 'ibis':{const h=cab(F-25,0,[[-13,5,3],[-7,8,8],[7,8,8],[11,6.5,7]],m.ceramic);const p=h.p.at(-1);oval(h,p[0],(p[2]+p[3])*.5,2,5.1);roof(h,1,3);box(h.x-10,topAt(h.x-10,0,h.y+5)+.35,0,4,.8,10,m.paint);break;}
  case 'gyrfalcon':{const h=cab(F-30,0,[[-20,6,3],[-9,9,7],[6,7,5],[14,4.5,2.7]],m.secondary);roof(h,1,3);for(const side of [-1,1])loft([[-13,2,3,7.5],[3,2,2,6.2],[13,1,0,2]].map(([dx,w,b,t])=>[h.x+dx,w,h.y+skin(h.x+dx)[2]-skin(h.x)[2]+b,h.y+skin(h.x+dx)[2]-skin(h.x)[2]+t]),m.paint,side*7);box(h.x-12,topAt(h.x-12,0,h.y+7)+.5,0,5,1.2,8,m.dark);break;}
  case 'albatross':{const h=cab(F-23,0,[[-13,8,7],[-8,9.5,13],[8,9.5,13],[12,8,12]],m.paint);front(h,4,2);sides(h,1,3,0,2);brow(h,19,5);box(h.x-2,h.y+6.5,0,23,.7,20,m.secondary);box(h.x-7,h.y+13.5,0,8,1,14,m.secondary);break;}
  case 'crane':{
   bridgeX=F-26;const y=skin(bridgeX)[2];box(bridgeX-4,y+1,0,12,3,24,m.secondary,.6);
   for(const side of [-1,1]){const h=cab(bridgeX,side*8,[[-9,4,3],[-3,4.5,7],[7,4.5,7],[10,3.5,6]],m.paint);front(h,2);roof(h,1,2);brow(h,9,3);}break;}
  case 'nightjar':{const h=cab(F-29,0,[[-18,4,1.2],[-9,7,4],[7,5,3.2],[14,2.5,1]],m.secondary);const x=h.x+3,roofY=h.y+4;box(x,roofY,0,6,1.6,8,m.secondary);for(const side of [-1,0,1]){const pane=cyl(x+3.1,roofY,side*2,1,.5,m.glass);cockpitWindows.push({pane,point:new T.Vector3(x+3.6,roofY+.13,side*2+.15),normal:new T.Vector3(1,0,0)});}break;}
  case 'pelican':{const h=cab(F-26,7,[[-13,5,7],[-7,6.5,16],[8,6.5,16],[11,5.8,14.7]],m.paint);front(h,3,2,.82);sides(h,1,3);brow(h,14,5);box(h.x-5,h.y+16.4,h.z,8,.8,11,m.secondary);break;}
  case 'condor':{bridgeX=F-31;for(const side of [-1,1]){const h=cab(bridgeX,side*5,[[-10,3,1],[-3,3.5,3.3],[6,2.8,2],[10,1.8,.7]],m.secondary);roof(h,1,2);}break;}
 }
 root.updateMatrixWorld(true);const cockpitParts=root.children.slice(cockpitStart),cockpitBounds=new T.Box3();for(const part of cockpitParts)cockpitBounds.union(new T.Box3().setFromObject(part));
 // Flush service tiles track the actual hull surface. Armor replaces these with thicker slabs.
 for(let x=A+25;x<F-40;x+=13){const [w,b,t]=skin(x);for(const s of [-1,1]){const width=Math.min(w*.54,10),plate=box(x,t+.18+u.armor*.09,s*w*.36,11,.5+balance.armor+u.armor*.2,width,u.armor?m.paint:m.secondary,.12);for(let j=0;j<u.armor;j++)box(x-3.5+j*2.2,t+.43+u.armor*.19,s*w*.36,.5,.3,width*.8,m.steel,.04);box(x,t-3,s*(w+.1),10,3,.4+u.armor*.3,m.paint,.14);}if(x%2)vent(x,t+.6,0,8,4);}
 // Small, repeated surface details supply scale; propulsion and cargo hardware stay readable.
 for(const s of [-1,1]){const x=F-17,[w,b,t]=skin(x);box(x,t-1,s*(sideAt(x,t-1)+.12),3,1,1,s<0?m.red:m.green,.12);for(let x=A+21;x<F-34;x+=29){const [w,b,t]=skin(x);box(x,t-3,s*(sideAt(x,t-3)+.08),8,1,.3,m.accent,.08);box(x+5,t-3,s*(sideAt(x+5,t-3)+.08),1,1,.3,m.ceramic,.08);}}
 const hatchX=A+27,[hw,hb,ht]=skin(hatchX);box(hatchX,ht+.15,0,8,.6,9,m.dark,.2);box(hatchX,ht+.45,0,6,.3,7,m.paint,.2);box(hatchX+1,ht+.63,0,2,.22,.4,m.steel,.05);
 // Tank upgrades: conformal jacket channels and service valves, supported on the hull sides.
 if(u.tank&&!['tanker','bulk','survey','frigate'].includes(c.kind))for(const s of [-1,1]){const x=A+38,[w,b,t]=skin(x),z=s*(w*.9+1.5),r=2+u.tank*.45;cyl(x,(b+t)*.5,z,L*.2,r,m.secondary);for(let j=0;j<u.tank+1;j++)ring(x-L*.07+j*3,(b+t)*.5,z,r+.2,.2,m.accent);}
 // Express and patrol ships use enclosed holds; expansion replaces their central fairing.
 if(u.cargo&&['express','cutter','frigate','survey','interceptor','electronic','carrier'].includes(c.kind)){const x=A+43,[w,b,t]=skin(x);box(x,t+u.cargo*.6,0,L*.17,1.2+u.cargo,Math.min(w,13),m.secondary,.6);for(let j=0;j<u.cargo+1;j++)box(x-L*.06+j*4,t+u.cargo*.6+(1.2+u.cargo)/2+.1,0,1,.3,Math.min(w-2,10),m.steel,.1);}
 // Energy banks use class-specific emitter counts and strengths, on seated bow mounts.
 const laserFit=balance.laser,laserLevel=u.laser,laserCount=laserFit.counts[laserLevel],laserX=F-13,[lw,lb,lt]=skin(laserX),laserY=(lb+lt)*.5;
 const laserReach=c.kind==='express'?10:['miner','salvager','workshop','carrier'].includes(c.kind)?9:3;
 const laserRows=Math.ceil(laserCount/8),perRow=Math.ceil(laserCount/laserRows);
 for(let index=0;index<laserCount;index++){
  const row=Math.floor(index/perRow),rowCount=Math.min(perRow,laserCount-row*perRow),column=index%perRow,z=rowCount===1?0:(column/(rowCount-1)*2-1)*lw*.72,y=laserY+(row-(laserRows-1)/2)*3.2,pitch=rowCount===1?8:lw*1.44/(rowCount-1),r=Math.min(.55+laserFit.strength[laserLevel]*.02+laserLevel*.035,pitch*.32,.98),reach=laserReach+(laserFit.type==='beam'?2:0);
  loft([[laserX-11,1.1+r*.5,y-1.4,y+.8],[laserX-6,1.3+r*.5,y-1.4,y+1.7],[F-4+reach,.8+r*.3,y-.8,y+.8]],m.secondary,z);
  cyl(F-5+reach,y,z,9,r,m.steel);const face=cyl(F-.6+reach,y,z,.3,r*.68,m.light);laserFaces.push(face);ring(F-1+reach,y,z,r*.9,.14,m.secondary);
  for(let i=0;i<2+laserLevel;i++){const hx=laserX-5+i*1.5,top=T.MathUtils.lerp(1.7,.8,(hx-(laserX-6))/(F-4+reach-(laserX-6)));box(hx,y+top+.05,z,.35,.25,1.8,m.steel,.04);}
 }
 // Two integrated weapon houses carry the actual number of class-specific barrels.
 const kinetic=balance.weapons,kineticCount=kinetic.counts[u.weapons];
 if(kineticCount){const x=c.kind==='carrier'?F-18:F-45,[w,b,t]=skin(x),outerBay={freighter:29,lattice:34,reefer:30,bulk:44+bulkOffset,tanker:32,tug:31,survey:23,carrier:6}[c.kind];
  for(const side of [-1,1]){const z=side*(outerBay||w*.62),y=c.kind==='bulk'?5:outerBay?Math.min(t-1,12):t-1;
   if(outerBay){for(const dx of [-5,8])beam([x+dx,t-3,side*w*.6],[x+dx,y-2,z],1.05,m.secondary);box(x+3,y-2,z,24,2.5,9,m.secondary,.5);}
   loft([[x-9,3,y-4,y],[x,4.5,y-4,y+5],[x+17,3,y-2,y+3],[x+24,1,y,y+1]],m.secondary,z);
   const barrels=kineticCount/2;box(x+9,y+4.2,z,16,1.8,6.5,m.secondary,.2);
   for(let j=0;j<barrels;j++){
    const bz=z+(j-(barrels-1)/2)*1.6,by=y+5.4,length=18+u.weapons*2,tip=x+16+length/2;
    if(kinetic.type==='rail')for(const rail of [-1,1])box(x+16,by,bz+rail*.42,length,.8,.38,m.steel,.09);
    else{cyl(x+16,by,bz,length,.6,m.steel);for(let band=0;band<(kinetic.type==='coil'?4:2);band++)ring(x+9+band*2,by,bz,.6,.12,m.secondary);}
    const face=cyl(tip+.08,by,bz,.2,.38,m.dark);kineticFaces.push(face);
   }
   for(let i=0;i<2+u.weapons;i++)box(x-1+i*2.5,y+4.8,z,1.1,.9,5,m.accent,.13);
  }
 }
 // Enclosed dorsal launch cells: each visible circular hatch is one launch tube.
 const ordnance=balance.ordnance,ordnanceCount=ordnance.counts[u.ordnance];
 if(ordnanceCount){const rows=ordnanceCount/2,x=A+L*.53,span=rows*3.3+2,z=0,y=Math.max(...[-1,1].flatMap(sx=>[-1,1].map(sz=>topAt(x+sx*span*.4,sz*3,skin(x)[2]))),topAt(x,z,skin(x)[2]))+.8;
  for(const dx of [-span*.4,span*.4])for(const dz of [-3,3])beam([x+dx,topAt(x+dx,dz,skin(x+dx)[2])-.1,dz],[x+dx,y,dz],.45,m.secondary);
  box(x,y,z,span,1.6,8,m.secondary,.3);
  for(let i=0;i<rows;i++)for(const side of [-1,1]){const px=x+(i-(rows-1)/2)*3.3,pz=side*2;add(new T.CylinderGeometry(1,1,.7,16),m.steel,px,y+.9,pz);add(new T.CylinderGeometry(.8,.8,.25,16),m.dark,px,y+1.33,pz);box(px,y+1.5,pz,1.1,.13,.3,m.accent,.04);}
 }
 // Field emitters are installed on small roof saddles, following actual local surfaces.
 const shieldCapacity=balance.shieldBase+balance.shieldRating*[0,1,2.2,3.6][u.shield],shieldEmitterCount=shieldCapacity?2+u.shield*2:0;
 for(let i=0;i<shieldEmitterCount/2;i++)for(const side of [-1,1]){const x=A+L*(.22+i*.16),z=side*skin(x)[0]*.3,roof=Math.max(...[-1,1].flatMap(dx=>[-1,1].map(dz=>topAt(x+dx*1.8,z+dz,skin(x)[2])))),y=roof+.55;
  for(const dx of [-1.8,1.8])for(const dz of [-1,1])beam([x+dx,topAt(x+dx,z+dz,skin(x+dx)[2])-.1,z+dz],[x+dx,y,z+dz],.25,m.secondary);
  box(x,y,z,4.5,1.1,2.8,m.secondary,.25);box(x,y+.65,z,3.4,.35,1.8,m.glass,.12);for(const dx of [-1,1])box(x+dx*1.8,y+.65,z,.35,.5,2,m.steel,.06);
 }
 // Sensor levels expand flush array area and lens count, without tall antenna stacks.
 if(u.sensors){const x=A+22,[w,b,t]=skin(x);for(const s of [-1,1]){box(x,t+.7,s*w*.45,8+u.sensors*2,1.4,4+u.sensors,m.secondary,.4);box(x,t+1.5,s*w*.45,6+u.sensors*2,.25,2+u.sensors,m.glass,.1);for(let j=0;j<u.sensors;j++)box(x-2+j*2,t+1.7,s*w*.45,.5,.2,2,m.steel,.04);}}
 const bottomAt=(x,z,fallback)=>{root.updateMatrixWorld(true);const hit=new T.Raycaster(new T.Vector3(x,-1000,z),new T.Vector3(0,1,0)).intersectObjects(root.children,false)[0];return hit?hit.point.y:fallback;};
 for(const fraction of (['liner','hospital'].includes(c.kind)?[.27,.53,.83]:[.32,.53,.74])){const x=A+L*fraction,[w,b,t]=skin(x),half=Math.min(w*.42,industrial?12:combat?9:7),span=Math.min(22,L*.1),xa=x-span/2,xb=x+span/2,depth=.55+u.armor*.15,samples=[...new Set([xa,xb,...sections.map(section=>section[0]).filter(px=>px>xa&&px<xb),...Array.from({length:5},(_,i)=>xa+span*(i+1)/6)])].sort((a,b)=>a-b),profile=samples.map(px=>[px,half,bottomAt(px,0,skin(px)[1])]);
  const lowerY=px=>{for(let j=1;j<profile.length;j++)if(px<=profile[j][0])return T.MathUtils.lerp(profile[j-1][2],profile[j][2],(px-profile[j-1][0])/(profile[j][0]-profile[j-1][0]));return profile.at(-1)[2];};
  loft(profile.map(([px,width,py])=>[px,width,py-depth,py+.12]),m.secondary);const insetXs=[xa+1,...samples.filter(px=>px>xa+1&&px<xb-1),xb-1];loft(insetXs.map(px=>[px,half*.5,lowerY(px)-depth-.08,lowerY(px)-depth+.1]),m.radiator);
  for(const px of [xa+1,xb-1])for(const side of [-1,1])add(new T.CylinderGeometry(.45,.45,.25,8),m.steel,px,lowerY(px)-depth-.03,side*half*.74);
 }
 // Wear is a surface patch, not a box suspended above a sloping hull or canopy.
 function wearPatch(x,z,length,width,turn=0){const geometry=new T.PlaneGeometry(length,width,3,1);geometry.rotateX(-Math.PI/2);geometry.rotateY(turn);const points=geometry.attributes.position;for(let i=0;i<points.count;i++){const px=x+points.getX(i),pz=z+points.getZ(i);points.setXYZ(i,px,topAt(px,pz,skin(px)[2])+.008,pz);}geometry.computeVertexNormals();const patch=add(geometry,m.dark);patch.userData.surfaceWear=true;}
 if(v.hull<60)for(let i=0;i<9;i++){const x=A+27+i*L*.05,[w,b,t]=skin(x);wearPatch(x,-w*.45,4,.25,.4+(i%3)*.3);}
 if(v.hull<35)for(let i=0;i<4;i++)wearPatch(bridgeX-8+i*4,-5,1.8,2.3);
 if(typeof document!=='undefined'){
  // Keep printed registration on one continuous roof patch, never across a hangar/cargo step.
  let spot=null;for(const length of [20,16,12,8]){for(const back of [0,8,16,24,32,40]){const x=Math.max(A+20,cockpitBounds.min.x-13-back),width=length/4;for(const z of [0,-skin(x)[0]*.35,skin(x)[0]*.35]){const heights=[];for(let i=0;i<=8;i++)for(let j=0;j<=2;j++)heights.push(topAt(x-length/2+i*length/8,z-width/2+j*width/2,skin(x)[2]));if(Math.max(...heights)-Math.min(...heights)<2.4){spot={x,z,length,width};break;}}if(spot)break;}if(spot)break;}
  if(spot){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle='#283942';ctx.font='600 50px sans-serif';ctx.fillText(v.shipID.toUpperCase(),14,53);ctx.font='20px sans-serif';ctx.fillText('COMPACT REGISTRY   /   '+c.kind.toUpperCase(),16,91);ctx.fillRect(16,110,290,4);for(let i=0;i<10;i++)ctx.fillRect(350+i*13,23,5+i%3,89);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const decal=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const {x,z,length,width}=spot,[w,b,t]=skin(x),geometry=new T.PlaneGeometry(length,width,8,2),points=geometry.attributes.position;for(let i=0;i<points.count;i++){const px=x+points.getX(i),pz=z-points.getY(i);points.setXYZ(i,px,topAt(px,pz,t)+.018,pz);}geometry.computeVertexNormals();add(geometry,decal);
  }
 }
 const attachmentAudit=v.audit?attachmentScan(root):null;if(v.audit){root.updateMatrixWorld(true);attachmentAudit.cargoPodIntersections=[];for(const [i,pod]of bulkPods.entries())for(const [j,container]of bulkContainers.entries())if(new T.Box3().setFromObject(pod).intersectsBox(new T.Box3().setFromObject(container)))attachmentAudit.cargoPodIntersections.push([i,j]);attachmentAudit.occludedDrives=driveFaces.map((face,index)=>{const p=face.position,r=face.geometry.parameters.radiusTop,hit=new T.Raycaster(new T.Vector3(p.x-1000,p.y+r*.23,p.z+r*.17),new T.Vector3(1,0,0)).intersectObjects(root.children,false)[0];return hit?.object===face?null:{index,hit:hit?.object.userData.origin};}).filter(n=>n!==null);attachmentAudit.occludedLasers=laserFaces.map((face,index)=>{const p=face.position,hit=new T.Raycaster(new T.Vector3(p.x+1000,p.y+face.geometry.parameters.radiusTop*.23,p.z+face.geometry.parameters.radiusTop*.17),new T.Vector3(-1,0,0)).intersectObjects(root.children,false)[0];return hit?.object===face?null:{index,hit:hit?{position:hit.point.toArray(),origin:hit.object.userData.origin}:null};}).filter(n=>n!==null);}
 if(v.audit){
  attachmentAudit.hangarIntrusions=[];attachmentAudit.weatheredCockpitWindows=[];attachmentAudit.cockpitWindows=cockpitWindows.length;attachmentAudit.coveredCockpitWindows=cockpitWindows.map((w,index)=>{const directions=[w.normal,w.normal.clone().add(new T.Vector3(.7,.7,0)).normalize(),w.normal.clone().add(new T.Vector3(-.5,.8,0)).normalize(),w.normal.clone().add(new T.Vector3(0,2.5,0)).normalize()];let hit;for(const direction of directions){hit=new T.Raycaster(w.point.clone().addScaledVector(direction,500),direction.clone().negate()).intersectObjects(root.children,false)[0];if(hit?.object===w.pane)return null;if(hit?.object.userData.surfaceWear){attachmentAudit.weatheredCockpitWindows.push(index);return null;}}return {index,hit:hit?.object.userData.origin};}).filter(n=>n!==null);
  attachmentAudit.occludedKinetics=kineticFaces.map((face,index)=>{const p=face.position,r=face.geometry.parameters.radiusTop,hit=new T.Raycaster(new T.Vector3(p.x+1000,p.y+r*.23,p.z+r*.17),new T.Vector3(-1,0,0)).intersectObjects(root.children,false)[0];return hit?.object===face?null:{index,hit:hit?.object.userData.origin};}).filter(n=>n!==null);
  const triangle=new T.Triangle(),bounds=new T.Box3();
  for(const [bayIndex,bay]of hangarBays.entries())for(const mesh of root.children){
   if(!mesh.isMesh||bay.tenderParts.has(mesh)||!bounds.setFromObject(mesh).intersectsBox(bay.reserved))continue;
   const points=mesh.geometry.attributes.position,indices=mesh.geometry.index,count=indices?indices.count:points.count;
   for(let i=0;i<count;i+=3){
    for(const [j,point]of [triangle.a,triangle.b,triangle.c].entries())point.fromBufferAttribute(points,indices?indices.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);
    if(bay.reserved.intersectsTriangle(triangle)){attachmentAudit.hangarIntrusions.push({bay:bayIndex,origin:mesh.userData.origin});break;}
   }
  }
 }
 const out=merged(root);out.userData={shipID:v.shipID,kind:c.kind,upgrades:{...u},visualVersion:9,cockpitStyle:cockpitStyles[v.shipID],cockpitWindowCount:cockpitWindows.length,weaponMounts:{energy:laserFaces.length,kinetic:kineticFaces.length,ordnance:ordnanceCount},shieldEmitterCount,driveApertures,...(attachmentAudit?{attachmentAudit}:{})};
 // Center geometry for consistent orbit control and framing on all 20 classes.
 const bounds=new T.Box3().setFromObject(out),center=bounds.getCenter(new T.Vector3());out.position.copy(center).multiplyScalar(-1);const pivot=new T.Group();pivot.add(out);pivot.scale.set(...c.scale.map(n=>n*balance.length/(L*c.scale[0])));const scaled=new T.Box3().setFromObject(pivot),dimensions=scaled.getSize(new T.Vector3());const cockpitBox=cockpitBounds.clone().translate(center.clone().negate());cockpitBox.min.multiply(pivot.scale);cockpitBox.max.multiply(pivot.scale);pivot.userData={...out.userData,...(c.kind==='carrier'?{hangarClearance:{length:156*pivot.scale.x,height:24*pivot.scale.y,beam:28.4*pivot.scale.z}}:{}),radius:dimensions.length()*.5,dimensions:dimensions.toArray(),features:[cockpitStyles[v.shipID],...c.features],cockpitBounds:{min:cockpitBox.min.toArray(),max:cockpitBox.max.toArray()}};return pivot;
}

export function disposeShip(group){group.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
export const shipRecipes=recipes;

// Fit the complete model bounds in front of the near plane, including long bow-on hulls.
export function frameShipCamera(group,camera,position,padding=.88){
 group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(group),radius=bounds.getSize(new T.Vector3()).length()*.5,n=new T.Vector3(...position).normalize(),right=new T.Vector3().crossVectors(camera.up,n).normalize(),up=new T.Vector3().crossVectors(n,right).normalize(),tanV=Math.tan(T.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect,p=new T.Vector3();let distance=0;
 group.traverse(mesh=>{if(!mesh.isMesh)return;const points=mesh.geometry.attributes.position;for(let i=0;i<points.count;i++){p.fromBufferAttribute(points,i).applyMatrix4(mesh.matrixWorld);distance=Math.max(distance,p.dot(n)+Math.max(Math.abs(p.dot(right))/(tanH*padding),Math.abs(p.dot(up))/(tanV*padding)));}});
 distance+=radius*.02;camera.position.copy(n).multiplyScalar(distance);camera.near=Math.max(.05,radius/200);camera.far=Math.max(radius*40,distance+radius*2);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();return distance;
}
