import * as T from './vendor/three/three.module.js';
import {OrbitControls} from './vendor/three/OrbitControls.js';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.js';
import {createShip,disposeShip,frameShipCamera} from './ship-designs.js';

const snapshots=new Map(),classInfo=new Map();let live=null,still=null,lighting='studio',view='perspective',fleetSpan=0;
function describe(shipID,upgrades={}){
 const key=shipID+':'+SpacetraderShips.modules.map(m=>upgrades[m.id]||0).join('');
 if(!classInfo.has(key)){const g=createShip({shipID,hull:100,upgrades}),[length,height,beam]=g.userData.dimensions;if(classInfo.size>=50)classInfo.delete(classInfo.keys().next().value);classInfo.set(key,{length,height,beam,hangarClearance:g.userData.hangarClearance||null,cockpitStyle:g.userData.cockpitStyle,features:[...g.userData.features]});disposeShip(g);}
 return {...classInfo.get(key)};
}
function commonFrame(target,top=false){
 if(!target.parallel)target.parallel=new T.OrthographicCamera(-300,300,195,-195,.1,4000);
 target.camera=target.parallel;if(!fleetSpan)fleetSpan=Math.max(40,...SpacetraderShips.hulls.map(h=>describe(h.id).length*1.14));const aspect=top?1000/333:1000/650,span=fleetSpan;target.camera.left=-span/2;target.camera.right=span/2;target.camera.top=span/(aspect*2);target.camera.bottom=-span/(aspect*2);target.camera.up.set(0,top?0:1,top?-1:0);target.camera.position.set(...(top?[0,1500,0]:[800,540,940]));target.camera.lookAt(0,0,0);target.camera.updateProjectionMatrix();
}
const cameraPositions={perspective:[1.15,.78,1.35],bow:[1.8,0,0],stern:[-1.8,0,0],port:[0,0,-1.8],starboard:[0,0,1.8],top:[0,1.8,0],underside:[0,-1.8,0]};
function setup(interactive=false){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'default'});renderer.setPixelRatio(1);renderer.setSize(interactive?1100:1000,interactive?825:650,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,interactive?4/3:1000/650,.1,3000),pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.42;room.dispose();pmrem.dispose();
 const key=new T.DirectionalLight(0xfff1db,2.7);key.position.set(80,150,100);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-155;key.shadow.camera.right=155;key.shadow.camera.top=155;key.shadow.camera.bottom=-155;key.shadow.camera.near=1;key.shadow.camera.far=650;key.shadow.bias=-.00015;key.shadow.normalBias=.18;key.shadow.radius=3;scene.add(key);scene.add(key.target);
 const fill=new T.DirectionalLight(0x93b5d6,.65);fill.position.set(-100,35,100);scene.add(fill);const rim=new T.DirectionalLight(0xc7deed,2.1);rim.position.set(-90,75,-110);scene.add(rim);
 const hemisphere=new T.HemisphereLight(0xdceaf1,0x1b242b,.38);scene.add(hemisphere);
 const controls=interactive?new OrbitControls(camera,renderer.domElement):null;
 const out={renderer,scene,camera,perspective:camera,key,fill,rim,hemisphere,controls,group:null,radius:90,modelKey:'',env};
 if(controls){controls.enableDamping=false;controls.enablePan=false;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI-.03;controls.addEventListener('change',()=>renderer.render(scene,camera));renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D ship. Drag to rotate; scroll to zoom. Arrow keys rotate; plus and minus zoom.');renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();const spherical=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')spherical.theta-=.15;if(e.key==='ArrowRight')spherical.theta+=.15;if(e.key==='ArrowUp')spherical.phi=Math.max(.04,spherical.phi-.15);if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.04,spherical.phi+.15);if(['+','='].includes(e.key))spherical.radius*=.9;if(e.key==='-')spherical.radius*=1.1;spherical.radius=T.MathUtils.clamp(spherical.radius,controls.minDistance,controls.maxDistance);camera.position.setFromSpherical(spherical).add(controls.target);controls.update();renderer.render(scene,camera);}});}
 return out;
}
function illumination(target){
 const sun=lighting==='sunlight';target.scene.environmentIntensity=sun?.18:.42;target.key.intensity=sun?4.2:2.7;target.fill.intensity=sun?.25:.65;target.rim.intensity=sun?1.2:2.1;target.hemisphere.intensity=sun?.18:.38;target.renderer.toneMappingExposure=sun?.85:.9;
}
function setView(target,name='perspective'){
 const position=cameraPositions[name]||cameraPositions.perspective,radius=target.radius;target.camera.up.set(...(name==='top'?[0,0,-1]:name==='underside'?[0,0,1]:[0,1,0]));let distance,focus=new T.Vector3();
 if(name==='bridge'&&target.group.userData.cockpitBounds){const info=target.group.userData.cockpitBounds,bounds=new T.Box3(new T.Vector3(...info.min),new T.Vector3(...info.max)),size=bounds.getSize(new T.Vector3());focus=bounds.getCenter(new T.Vector3()).add(target.group.position);const proxy=new T.Mesh(new T.BoxGeometry(size.x*1.35,size.y*1.5,size.z*1.4));distance=frameShipCamera(proxy,target.camera,[1.8,.9,1.3],.78);proxy.geometry.dispose();proxy.material.dispose();target.camera.position.add(focus);target.camera.lookAt(focus);target.camera.updateMatrixWorld();}
 else distance=frameShipCamera(target.group,target.camera,position);
 if(target.controls){target.controls.minDistance=name==='bridge'?distance*.4:Math.min(radius*1.8,distance*.75);target.controls.maxDistance=Math.max(radius*9,distance*2);target.controls.target.copy(focus);target.controls.update();}
}
function frameLight(target){const r=target.radius,c=target.group.position;target.key.target.position.copy(c);target.key.position.copy(c).add(new T.Vector3(.8,2.2,1.4).multiplyScalar(r));Object.assign(target.key.shadow.camera,{left:-r*1.3,right:r*1.3,top:r*1.3,bottom:-r*1.3,near:.1,far:r*7});target.key.shadow.camera.updateProjectionMatrix();}
function load(target,v){
 const key=v.shipID+':'+Object.values(v.upgrades).join('')+':'+(v.hull<35?'damaged':v.hull<60?'worn':'intact');
 if(target.modelKey===key)return false;if(target.group){target.scene.remove(target.group);disposeShip(target.group);}target.group=createShip(v);target.radius=target.group.userData.radius;target.scene.add(target.group);target.modelKey=key;return true;
}
function thumbnail(v,{scale='shared',comparison=false,angle='perspective'}={}){
 const key=v.shipID+':'+Object.values(v.upgrades).join('')+':'+(v.hull<35?2:v.hull<60?1:0)+':'+lighting+':'+scale+':'+comparison+':'+angle;if(snapshots.has(key))return snapshots.get(key);
 if(!still)still=setup();load(still,v);still.group.position.set(0,0,0);illumination(still);still.renderer.setSize(1000,comparison?333:650,false);
 if(scale==='shared'||comparison){commonFrame(still,comparison);if(comparison){const width=still.group.userData.dimensions[0];still.group.position.x=-still.camera.right+still.camera.right/15+width/2;}}
 else {still.camera=still.perspective;still.camera.aspect=1000/650;still.camera.up.set(0,1,0);setView(still,angle);}
 frameLight(still);if(angle==='underside')still.key.position.y=-still.radius*2.2;still.renderer.render(still.scene,still.camera);const url=still.renderer.domElement.toDataURL('image/png');if(snapshots.size>=30)snapshots.delete(snapshots.keys().next().value);snapshots.set(key,url);return url;
}
function mount(element,v){
 if(!live)live=setup(true);const changedClass=live.shipID!==v.shipID;load(live,v);live.shipID=v.shipID;illumination(live);if(changedClass||view==='bridge')setView(live,view);element.replaceChildren(live.renderer.domElement);frameLight(live);if(view==='underside')live.key.position.y=-live.radius*2.2;live.renderer.render(live.scene,live.camera);
}
function camera(name){view=name;if(live){setView(live,name);frameLight(live);if(name==='underside')live.key.position.y=-live.radius*2.2;live.renderer.render(live.scene,live.camera);}}
function light(value){lighting=value;if(live){illumination(live);live.renderer.render(live.scene,live.camera);}}
function release(){if(live){live.controls.enabled=false;} }
window.SpacetraderShipRenderer={thumbnail,describe,mount:(el,v)=>{mount(el,v);live.controls.enabled=true;},camera,light,release,version:'Three.js 0.180.0 · ship designs 9'};
if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
await import('./catalogue.js');
