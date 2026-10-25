'use strict';
(function(root){
// Presentation only. Resources, targeting and outcomes are resolved by the shared engine.
function turnAngle(from,to,f){return from+Math.atan2(Math.sin(to-from),Math.cos(to-from))*Math.max(0,Math.min(1,f));}
// A committed bank is illustrated once. Dense banks sample at most twelve tracers;
// these timings never resolve damage, reloads, resources or additional attacks.
function volleyPattern(weapon,bank={},phase=0){
 const type=bank.type||weapon,total=Math.max(1,Math.floor(Number(bank.count)||1)*(weapon==='laser'?1:Math.max(1,Math.floor(Number(bank.ammo)||1)))),count=Math.min(12,total);
 const flight=weapon==='laser'?0:type==='rail'?180:weapon==='kinetic'?260:type==='torpedo'?850:650,gap=weapon==='laser'?55:weapon==='kinetic'?65:75;
 return Array.from({length:count},(_,i)=>({launch:120+Math.max(0,Math.min(135,phase))+i*gap,flight,hold:type==='beam'?220:weapon==='laser'?75:80,lane:count===1?0:(i/(count-1)-.5)*.5}));
}
function shieldState(u){const max=Number(u.shieldMax)||0,current=Number(u.currentShield)||0;return {active:u.hull>0&&max>0&&current>0,ratio:max>0?Math.max(0,Math.min(1,current/max)):0};}
// Critically damped course changes retain velocity when a new order arrives.
// Sampling is pure: health, selection and half-second updates cannot add drift.
function sampleCourse(course,t,reduced=false){
 if(reduced)return {position:course.target.slice(),velocity:[0,0,0]};
 const dt=Math.max(0,t-course.at)/1000,omega=5,decay=Math.exp(-omega*dt),velocity=[];
 const position=course.target.map((target,i)=>{const offset=course.start[i]-target,c=course.velocity[i]+omega*offset;velocity[i]=(course.velocity[i]-omega*c*dt)*decay;return target+(offset+c*dt)*decay;});
 return {position,velocity};
}
function steerHeading(angle,velocity,target,elapsed,scale=1){
 const dt=Math.max(0,Math.min(.1,elapsed/1000)),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle)),rate=1.05/Math.max(.7,scale),acceleration=rate*2;
 if(Math.abs(delta)<1e-8)return {angle:angle+delta,velocity:0};
 const desired=Math.sign(delta)*Math.min(rate,Math.abs(delta)*3,Math.sqrt(2*acceleration*Math.abs(delta)));
 velocity+=Math.max(-acceleration*dt,Math.min(acceleration*dt,desired-velocity));
 const step=velocity*dt;if(Math.sign(step)===Math.sign(delta)&&Math.abs(step)>=Math.abs(delta))return {angle:angle+delta,velocity:0};
 return {angle:angle+step,velocity};
}
function create(options){
 const element=document.createElement('section');element.className='battle-space';element.setAttribute('aria-label','Three-dimensional battle view');
 element.innerHTML='<canvas class="battle-space-models" aria-label="Battle view; ships automatically face their targets"></canvas><canvas class="battle-space-effects" aria-hidden="true"></canvas><div class="battle-space-labels"></div><div class="battle-camera"><span>Automatic tactical view</span></div><div class="battle-space-key">Gold: fleet <span>Coral: raiders</span><small>Distance and hull size compressed</small></div>';
 const canvas=element.querySelector('.battle-space-models'),effects=element.querySelector('.battle-space-effects'),ctx=effects.getContext('2d'),labels=element.querySelector('.battle-space-labels'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let yaw=.18,pitch=.68,zoom=1,raf=0,disposed=false,lastFrame=0,scene={units:[],shots:[]},settings={},shotKey='',shotAt=-Infinity,changedAt=0,width=1,height=1,center=[0,0,0],fitHalf=9,gl,program,loc,triangleCount=0,frameCount=0,maxDraw=0;
 let salvos=[];const models=new Map(),units=new Map(),courses=new Map();
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],now=()=>performance.now();
 function axes(){return {r:[Math.cos(yaw),-Math.sin(yaw),0],u:[Math.sin(yaw)*Math.sin(pitch),Math.cos(yaw)*Math.sin(pitch),Math.cos(pitch)],e:[-Math.sin(yaw)*Math.cos(pitch),-Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch)]};}
 function point(p){const a=axes(),half=fitHalf/zoom;p=p.map((v,i)=>v-center[i]);return {x:width/2+dot(p,a.r)/half*width/2,y:height/2-dot(p,a.u)/(half*height/width)*height/2};}
 function goal(u){const lane=[...u.id].reduce((n,c)=>(n*31+c.charCodeAt(0))%3,0);return [(u.x-.5)*24,(u.y-.5)*14,(lane-1)*.12];}
 function resize(){const box=element.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);const dpr=Math.min(2,window.devicePixelRatio||1);for(const c of [canvas,effects]){const w=Math.round(width*dpr),h=Math.round(height*dpr);if(c.width!==w||c.height!==h){c.width=w;c.height=h;}}ctx.setTransform(dpr,0,0,dpr,0,0);draw(now());}
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Battle shader unavailable');return s;}
 try{
  gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('WebGL unavailable');
  program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,'attribute vec3 position,normal,color;uniform vec3 origin,right,up,eye;uniform vec2 halfSize,heading;uniform float size;varying vec3 N,C;void main(){vec3 p=vec3(position.x*heading.x-position.y*heading.y,position.x*heading.y+position.y*heading.x,position.z)*size+origin;N=vec3(normal.x*heading.x-normal.y*heading.y,normal.x*heading.y+normal.y*heading.x,normal.z);C=color;gl_Position=vec4(dot(p,right)/halfSize.x,dot(p,up)/halfSize.y,-dot(p,eye)/80.,1.);}');
  const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 N,C;uniform float integrity;void main(){vec3 n=normalize(N);float key=max(0.,dot(n,normalize(vec3(-.4,-.6,1.))));float rim=max(0.,dot(n,normalize(vec3(.7,.4,.2))));vec3 c=C*(.65+key*1.45)+vec3(.18,.27,.36)*rim; c=mix(c,vec3(.16,.18,.19),1.-integrity);gl_FragColor=vec4(c,1.);}');gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Battle graphics unavailable');gl.deleteShader(vs);gl.deleteShader(fs);
  loc=Object.fromEntries(['origin','right','up','eye','halfSize','heading','size','integrity'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 }catch{gl=null;element.querySelector('.battle-camera span').textContent='Tactical view';}
 function geometry(u){const key=u.shipID+':'+JSON.stringify(u.upgrades||{});if(models.has(key))return models.get(key);const model=options.model(u),mesh=model.mesh,p=mesh.positions,lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.length;i++){lo[i%3]=Math.min(lo[i%3],p[i]);hi[i%3]=Math.max(hi[i%3],p[i]);}const center=lo.map((v,i)=>(v+hi[i])/2),extent=Math.max(1,Math.hypot(...lo.map((v,i)=>(hi[i]-v)/2))),normalized=new Float32Array(p.length);for(let i=0;i<p.length;i++)normalized[i]=(p[i]-center[i%3])/extent;
  const buffers=['position','normal','color'].map((name,i)=>{const data=i===0?normalized:new Float32Array(i===1?mesh.normals:mesh.colors),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {buffer,location:gl.getAttribLocation(program,name)};});const g={buffers,count:p.length/3};if(models.size>=40){const [old,value]=models.entries().next().value;value.buffers.forEach(b=>gl.deleteBuffer(b.buffer));models.delete(old);}models.set(key,g);return g;
 }
 function currentPosition(id,t){const course=courses.get(id);return course?sampleCourse(course,t,reduced.matches).position:[0,0,0];}
 function heading(id,t){const item=units.get(id),u=item.unit,p=currentPosition(id,t),target=units.get(u.targetID),q=target&&target.unit.hull>0?currentPosition(u.targetID,t):null,to=q?Math.atan2(q[1]-p[1],q[0]-p[0]):item.heading??(u.friendly?0:Math.PI);
  if(item.heading===undefined||reduced.matches){item.heading=to;item.turnVelocity=0;}else if(u.hull>0){const turn=steerHeading(item.heading,item.turnVelocity||0,to,t-(item.headingAt??t),u.scale||1);item.heading=turn.angle;item.turnVelocity=turn.velocity;}
  item.headingAt=t;item.label.dataset.heading=item.heading.toFixed(3);return item.heading;
 }
 function draw(t){const began=now();if(disposed||!element.isConnected)return;salvos=salvos.filter(s=>t-s.at<2400);const a=axes();
  // A fixed battlefield frame avoids camera breathing as targets move or fall.
  // Bounds include the full legal tactical range, not the surviving ship count.
  const corners=[];for(const x of [-11,11])for(const y of [-6,6])for(const z of [-.8,.8])corners.push([x,y,z]);
  fitHalf=Math.max(7,...corners.map(p=>Math.max(Math.abs(dot(p,a.r))+2.2,(Math.abs(dot(p,a.u))+2.4)*width/height)));const half=fitHalf/zoom;ctx.clearRect(0,0,width,height);triangleCount=0;
  // A few fixed stars give depth without a moving background or fabricated traffic.
  for(let i=0;i<65;i++){const x=((i*197.3)%997)/997*width,y=((i*379.7)%991)/991*height;ctx.fillStyle=i%5?'#71889555':'#d0deeb88';ctx.fillRect(x,y,i%5?1:1.5,i%5?1:1.5);}
  ctx.strokeStyle='#7fa6b819';ctx.lineWidth=1;for(let y=-6;y<=6;y+=3){const x=point([-10,y,-1.6]),b=point([10,y,-1.6]);ctx.beginPath();ctx.moveTo(x.x,x.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  if(gl&&!gl.isContextLost()){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform3fv(loc.right,a.r);gl.uniform3fv(loc.up,a.u);gl.uniform3fv(loc.eye,a.e);gl.uniform2f(loc.halfSize,half,half*height/width);}
  for(const [id,item] of units){const u=item.unit,p=currentPosition(id,t),angle=heading(id,t),facing=[Math.cos(angle),Math.sin(angle)],projected=point(p),selected=id===settings.selected||id===settings.target;
   item.label.style.transform=`translate(${clamp(projected.x,80,width-80)}px,${clamp(projected.y+32,50,height-85)}px)`;item.label.hidden=projected.x<0||projected.x>width||projected.y<0||projected.y>height;
   if(gl&&!gl.isContextLost()){const g=geometry(u);for(const b of g.buffers){gl.bindBuffer(gl.ARRAY_BUFFER,b.buffer);gl.enableVertexAttribArray(b.location);gl.vertexAttribPointer(b.location,3,gl.FLOAT,false,0,0);}gl.uniform3fv(loc.origin,p.map((v,i)=>v-center[i]));gl.uniform2f(loc.heading,...facing);gl.uniform1f(loc.size,1.3*Math.max(.48,u.scale||1));gl.uniform1f(loc.integrity,u.hull>0?1:.15);gl.drawArrays(gl.TRIANGLES,0,g.count);triangleCount+=g.count;}
   else{ctx.fillStyle=u.friendly?'#b4c6d0':'#ad8e89';ctx.beginPath();for(const [i,local] of [[.9,0],[-.65,.45],[-.45,-.5]].entries()){const q=point([p[0]+local[0]*facing[0]-local[1]*facing[1],p[1]+local[0]*facing[1]+local[1]*facing[0],p[2]]);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.closePath();ctx.fill();}
   const velocity=sampleCourse(courses.get(id),t,reduced.matches).velocity,speed=Math.hypot(...velocity);
   if(u.hull>0&&speed>.03&&!reduced.matches){const f=Math.min(1,speed/3),forward=velocity[0]*facing[0]+velocity[1]*facing[1],side=forward>=0?-1:1,jet=point([p[0]+side*.7*facing[0],p[1]+side*.7*facing[1],p[2]]),trail=point([p[0]+side*(.7+.6*f)*facing[0],p[1]+side*(.7+.6*f)*facing[1],p[2]]);ctx.strokeStyle=u.friendly?'#9fd8ea99':'#e3a78e88';ctx.lineWidth=forward>=0?3:1.5;ctx.beginPath();ctx.moveTo(jet.x,jet.y);ctx.lineTo(trail.x,trail.y);ctx.stroke();}
   const shield=shieldState(u);if(shield.active){const radius=27+14*Math.max(.48,u.scale||1),hit=salvos.some(s=>s.to===id&&s.shield>0&&t-s.at<650),alpha=.15+.35*shield.ratio+(hit&&!reduced.matches?.2:0);ctx.save();ctx.translate(projected.x,projected.y);const glow=ctx.createRadialGradient(0,0,radius*.2,0,0,radius*1.3);glow.addColorStop(0,'rgba(105,207,239,0)');glow.addColorStop(.75,'rgba(105,207,239,'+(alpha*.13)+')');glow.addColorStop(1,'rgba(105,207,239,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,0,radius*1.35,radius*.8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(126,220,245,'+alpha+')';ctx.lineWidth=hit?2:1;ctx.beginPath();ctx.ellipse(0,0,radius*1.2,radius*.7,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
   if(item.destroyedAt&&t-item.destroyedAt<1900){const f=(t-item.destroyedAt)/1900;ctx.globalAlpha=1-f;ctx.fillStyle='#eaa36e';for(let n=0;n<9;n++){const angle=n*2.399;ctx.beginPath();ctx.arc(projected.x+Math.cos(angle)*f*45,projected.y+Math.sin(angle)*f*30,2*(1-f)+1,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
   if(selected){ctx.strokeStyle=u.friendly?'#d5ae68aa':'#e2907eaa';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(projected.x,projected.y+9,34,16,0,0,Math.PI*2);ctx.stroke();}
  }
  let activeTracers=0;
  for(const shot of salvos){const age=t-shot.at;const from=units.get(shot.from),to=units.get(shot.to);if(!from||!to)continue;const source=currentPosition(shot.from,t),angle=from.heading??(from.unit.friendly?0:Math.PI),forward=[Math.cos(angle),Math.sin(angle)],destination=point(currentPosition(shot.to,t)),color=shot.weapon==='laser'?(shot.friendly?'#9ee7f3':'#f1a6b3'):shot.friendly?'#efc980':'#f4a793';
   if(reduced.matches){const pa=point(source);ctx.strokeStyle=color+'88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(destination.x,destination.y);ctx.stroke();continue;}
   for(const tracer of shot.volley){const elapsed=age-tracer.launch;if(elapsed<0||elapsed>tracer.flight+450)continue;const pa=point([source[0]+.55*forward[0]-tracer.lane*forward[1],source[1]+.55*forward[1]+tracer.lane*forward[0],source[2]+.1]),pb={...destination};
    if(shot.intercepted){pb.x=pa.x+(pb.x-pa.x)*.8;pb.y=pa.y+(pb.y-pa.y)*.8;}else if(!shot.hit){pb.x+=35;pb.y-=25;}
    const f=tracer.flight?clamp(elapsed/tracer.flight,0,1):1,x=pa.x+(pb.x-pa.x)*f,y=pa.y+(pb.y-pa.y)*f;ctx.strokeStyle=color;ctx.lineWidth=shot.weapon==='laser'?1.4:shot.bankType==='rail'?2.8:2;
    if(elapsed<tracer.flight+tracer.hold){activeTracers++;ctx.beginPath();if(shot.weapon==='laser'){ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);}else{const tail=shot.weapon==='ordnance'?.13:shot.bankType==='rail'?.18:.08;ctx.moveTo(pa.x+(pb.x-pa.x)*Math.max(0,f-tail),pa.y+(pb.y-pa.y)*Math.max(0,f-tail));ctx.lineTo(x,y);}ctx.stroke();}
    if(elapsed<75){ctx.fillStyle=color;ctx.beginPath();ctx.arc(pa.x,pa.y,3*(1-elapsed/75)+1,0,Math.PI*2);ctx.fill();}
    if((shot.hit||shot.intercepted)&&elapsed>=tracer.flight&&elapsed<tracer.flight+450){const impact=elapsed-tracer.flight,radius=4+impact/35;ctx.globalAlpha=(1-impact/450)*.6;ctx.strokeStyle=shot.shield>0?'#9de8ef':'#f6be7b';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(pb.x,pb.y,radius,radius*.65,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
   }
  }
  element.dataset.activeTracers=String(activeTracers);
  frameCount++;maxDraw=Math.max(maxDraw,now()-began);if(frameCount%30===0){element.dataset.frames=String(frameCount);element.dataset.cpuDrawMs=(now()-began).toFixed(2);element.dataset.maxCpuDrawMs=maxDraw.toFixed(2);}
  element.dataset.renderer=gl&&!gl.isContextLost()?'webgl':'fallback';element.dataset.triangles=String(triangleCount/3);element.dataset.models=String(models.size);
 }
 function loop(t){raf=0;if(disposed)return;if(!document.hidden&&t-lastFrame>=1000/30){lastFrame=t;draw(t);}if(element.isConnected&&!reduced.matches&&(settings.running||t-changedAt<2500))raf=requestAnimationFrame(loop);}
 function start(){if(!raf&&!reduced.matches&&!disposed)raf=requestAnimationFrame(loop);}
 function update(next,config){const t=now();changedAt=t;scene=next;settings=config;element.dataset.dense=String(next.units.filter(u=>u.friendly).length>5);
  const visualUnits=next.units.slice();for(const [id,item] of units)if(!visualUnits.some(u=>u.id===id)&&[...(next.shots||[]),...salvos].some(s=>s.to===id||s.from===id))visualUnits.push({...item.unit,hull:0});scene={...next,units:visualUnits,shots:(next.shots||[]).map(shot=>{const shooter=visualUnits.find(u=>u.id===shot.from),slot=shot.weapon==='kinetic'?'weapons':shot.weapon,bank=shooter&&options.bank?.(shooter,slot)||{},phase=[...shot.from].reduce((n,c)=>n+c.charCodeAt(0),0)%4*45;return {...shot,bankType:bank.type,volley:volleyPattern(shot.weapon,bank,phase)};})};element.dataset.salvos=String(scene.shots.length);element.dataset.tracers=String(scene.shots.reduce((n,s)=>n+s.volley.length,0));element.dataset.exchange=String(config.step);const wanted=new Set(visualUnits.map(u=>u.id));for(const [id,item] of units)if(!wanted.has(id)){item.label.remove();units.delete(id);courses.delete(id);}
  visualUnits.forEach(u=>{const id=u.id,old=courses.get(id),sample=old&&sampleCourse(old,t,reduced.matches),destination=u.hull<=0&&sample?sample.position:goal(u);
   if(!old||destination.some((v,i)=>Math.abs(v-old.target[i])>1e-8)){courses.set(id,{start:reduced.matches?destination.slice():sample?.position||destination.slice(),velocity:u.hull<=0||reduced.matches?[0,0,0]:sample?.velocity||[0,0,0],target:destination.slice(),at:t});}
   let item=units.get(id);if(!item){const label=document.createElement('button');label.type='button';label.className='battle-contact-label';labels.append(label);item={label};units.set(id,item);}if(item.unit?.hull>0&&u.hull===0)item.destroyedAt=t;item.unit=u;item.label.dataset.action=u.friendly?'battle-actor':'battle-target';item.label.dataset.id=id;item.label.classList.toggle('hostile',!u.friendly);item.label.classList.toggle('selected',id===config.selected||id===config.target);item.label.disabled=u.hull<=0;item.label.textContent=u.name+' · '+u.hull+'%';item.label.title=u.name+' · '+u.hull+'% hull';item.label.setAttribute('aria-label',u.name+', '+u.hull+'% hull');});
  
  const key=config.step+':'+(next.shots||[]).map(s=>s.from+s.to+s.weapon).join('|');if(next.shots?.length&&key!==shotKey){shotKey=key;shotAt=t;salvos.push(...scene.shots.map(shot=>({...shot,at:t})));salvos=salvos.filter(s=>t-s.at<2400).slice(-140);}element.dataset.shields=String(visualUnits.filter(u=>shieldState(u).active).length);element.dataset.activeSalvos=String(salvos.length);resize();start();
 }
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();element.querySelector('.battle-camera span').textContent='Tactical view';draw(now());});
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(element);const motionChange=()=>{if(reduced.matches){if(raf)cancelAnimationFrame(raf);raf=0;const t=now();for(const course of courses.values()){course.start=course.target.slice();course.velocity=[0,0,0];course.at=t;}draw(t);}else start();};reduced.addEventListener('change',motionChange);
 return {element,battle:options.battle,update,dispose(){disposed=true;if(raf)cancelAnimationFrame(raf);resizeObserver.disconnect();reduced.removeEventListener('change',motionChange);if(gl){for(const g of models.values())g.buffers.forEach(b=>gl.deleteBuffer(b.buffer));gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}models.clear();units.clear();courses.clear();}};
}
const api={create,turnAngle,volleyPattern,shieldState,sampleCourse,steerHeading};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderBattleStage=api;
})(typeof window==='undefined'?globalThis:window);
