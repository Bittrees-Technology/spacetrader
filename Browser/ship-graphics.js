var SpacetraderShipGraphics=(()=>{var _a=Object.create;var $n=Object.defineProperty;var ya=Object.getOwnPropertyDescriptor;var xa=Object.getOwnPropertyNames;var Ma=Object.getPrototypeOf,Sa=Object.prototype.hasOwnProperty;var ba=(u,e)=>()=>{try{return e||u((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}},Ta=(u,e)=>{for(var t in e)$n(u,t,{get:e[t],enumerable:!0})},Ms=(u,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of xa(e))!Sa.call(u,i)&&i!==t&&$n(u,i,{get:()=>e[i],enumerable:!(n=ya(e,i))||n.enumerable});return u};var wa=(u,e,t)=>(t=u!=null?_a(Ma(u)):{},Ms(e||!u||!u.__esModule?$n(t,"default",{value:u,enumerable:!0}):t,u)),Ea=u=>Ms($n({},"__esModule",{value:!0}),u);var ia=ba((rf,ms)=>{"use strict";(function(u){let e={kestrel:{emitters:2,laser:"Courier pulse pair",bankPower:8,review:["Seated the cargo pod on transverse saddles tied into the keel.","Embedded the docking collar, hatch, heat-exchanger hinges and laser lenses into their housings."],addition:"Cargo saddle locks and connected drive-to-radiator service lines."},swift:{emitters:1,laser:"Compact axial pulse laser",bankPower:7,review:["Closed nozzle coil gaps and extended the upgraded drive casing under every coil.","Seated the single axial laser and dorsal service panels into the narrow pressure hull."],addition:"A continuous dorsal cooling channel and three supported nozzle service collars."},osprey:{emitters:2,laser:"Heavy cutter pulse pair",bankPower:11,review:["Snapped boom cooling grilles to the actual sloped surface.","Embedded cheek armor, lenses and thermal plates in their shoulder foundations."],addition:"Armored optical cheek bays and linked laser heat-exchanger rails."},heron:{emitters:1,laser:"Survey-defense beam emitter",bankPower:8,review:["Connected the dish feed receiver to its bowl and support mast.","Seated optical caps against their barrels and instrument windows inside their frames."],addition:"A three-spoke receiver support, braced optical benches and service collars."},petrel:{emitters:2,laser:"Tanker defense pulse pair",bankPower:8,review:["Replaced hanging tank feet with diagonal hull-rooted saddles.","Joined the transfer collar and lugs to the cross-feed gantry."],addition:"Individual tank valve blocks and positive manifold attachment points."},peregrine:{emitters:2,laser:"Freight-defense pulse pair",bankPower:9,review:["Connected every container saddle to the hull and outboard floor beams.","Lowered detached lids and service strips onto the actual cargo modules."],addition:"Positive container locks, braced saddle rails and accessible cargo-spine fixtures."},tern:{emitters:2,laser:"Thermally isolated pulse pair",bankPower:9,review:["Seated the insulated doors, handles and cooling grilles against their module surfaces.","Clamped both thermal lines to cargo walls and returned their ends to the frame."],addition:"Thermal pipe clamps and distinct insulated service-door surrounds."},cormorant:{emitters:2,laser:"Industrial defense pair",bankPower:10,review:["Checked fork roots, articulated clamps and the winch cradle against the main structure.","Anchored cargo saddles and all laser optics rather than leaving small face gaps."],addition:"Visible clamp pivot pins, captive winch bearings and reinforced handling saddles."},gannet:{emitters:4,laser:"Quad convoy pulse battery",bankPower:12,review:["Set cooling grilles onto the stepped command and shoulder roofs.","Checked the four-nozzle carrier frame and added a common foundation for each laser pair."],addition:"Split optical banks, protected cooler beds and convoy-store saddle ties."},gyrfalcon:{emitters:4,laser:"Quad patrol beam battery",bankPower:16,review:["Checked the long patrol booms and tank saddles at the central spine.","Seated forward optics and all forward emitters in integrated shoulder/chine housings."],addition:"Patrol cooling rails, twin-bank optical foundations and foredeck service panels."},albatross:{emitters:4,laser:"Distributed freighter pulse battery",bankPower:10,review:["Supported the formerly floating central walkway with keel-rooted columns.","Joined the walkway rails with balusters and attached each container to a transverse saddle."],addition:"A load-bearing raised service passage, rail posts and distributed defense optics."},pelican:{emitters:4,laser:"Distributed bulk-defense battery",bankPower:10,review:["Lowered floating gantry floors onto the side modules and joined their handrails with posts.","Attached large pod saddles to the keel and seated every cooling collar and lens."],addition:"Module-level service platforms, guardrail posts and supported defense emitters."}},t=[{id:"merlin",name:"Merlin",role:"Fast interceptor",price:12e4,dryMass:12,cargoTonnes:2,tankTonnes:32,isp:54e3,thrustFactor:1.3,maxSpares:3,kineticBase:13,description:"A compact interception hull wrapped around oversized drive machinery. Recessed twin lasers and small stores suit independent pursuit or convoy escape support; two tonnes of freight leave little room for trading."},{id:"curlew",name:"Curlew",role:"Passenger and personnel transport",price:288e3,dryMass:34,cargoTonnes:14,tankTonnes:100,isp:53e3,thrustFactor:1,maxSpares:4,kineticBase:10,description:"A long personnel liner with segmented passenger cabins, paired life-support trunks and recessed baggage holds. Its 24 dedicated berths support certified passenger charters with real mass, daily care costs, deadlines and welfare duties."},{id:"sanderling",name:"Sanderling",role:"Prospecting and mining vessel",price:42e4,dryMass:42,cargoTonnes:36,tankTonnes:120,isp:51e3,thrustFactor:.82,maxSpares:6,kineticBase:14,description:"An industrial prospecting ship with an articulated excavation frame, protected collection bins and a factory mining rig. It extracts finite surveyed ore and ice reserves; raw ore occupies hold space until paid refinery processing."},{id:"rook",name:"Rook",role:"Salvage recovery vessel",price:6e5,dryMass:50,cargoTonnes:40,tankTonnes:150,isp:52e3,thrustFactor:.84,maxSpares:7,kineticBase:15,description:"An asymmetric recovery crane sits beside an open wreck cradle and sealed assessment workshop. Proposed salvage work recovers equipment from lawful wreck sites; recovery rights and hazards still matter."},{id:"ibis",name:"Ibis",role:"Medical support vessel",price:72e4,dryMass:40,cargoTonnes:12,tankTonnes:160,isp:54e3,thrustFactor:.95,maxSpares:6,kineticBase:10,description:"Isolated treatment modules and a protected ambulance docking gallery surround a long pressure spine. Eight dedicated medical berths support clinic transfer charters unlocked through prior passenger service and supervised medical research."},{id:"crane",name:"Crane",role:"Mobile fleet workshop",price:126e4,dryMass:78,cargoTonnes:30,tankTonnes:260,isp:53e3,thrustFactor:.78,maxSpares:12,kineticBase:16,description:"A travelling repair yard with twin articulated service booms, sheltered work bays and stocked engineering racks. Proposed remote repairs consume parts and time, giving distant expeditions a reason to bring a workshop."},{id:"nightjar",name:"Nightjar",role:"Electronic warfare and reconnaissance",price:144e4,dryMass:36,cargoTonnes:6,tankTonnes:145,isp:56e3,thrustFactor:1.05,maxSpares:5,kineticBase:12,description:"A narrow dark pressure hull carries broad directional arrays, armored signal rooms and dedicated heat rejection. Proposed active jamming trades a combat action and heat for disrupted enemy targeting."},{id:"condor",name:"Condor",role:"Expedition carrier",price:24e5,dryMass:155,cargoTonnes:65,tankTonnes:620,isp:55e3,thrustFactor:.72,maxSpares:14,kineticBase:20,description:"A heavy twin-hangar carrier with a raised offset command block, deep service decks and reinforced docking apertures. Carries two approved owned small craft; loaded mass counts against propulsion while embarked craft provide no active holds, tanks or weapons. Deploy at safely stopped licensed ports."}];Object.assign(e,{merlin:{emitters:2,laser:"Interceptor pulse pair",bankPower:10,review:["Drive-rooted laser cheeks and a compact armored spine.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Oversized twin drives, supported radiator strakes and recessed optical bays."},curlew:{emitters:2,laser:"Transport defense pair",bankPower:8,review:["Pressure cabins connect through saddles and continuous life-support trunks.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Six habitation drums, captive escape capsules and a passenger docking gallery."},sanderling:{emitters:2,laser:"Mining defense pair",bankPower:10,review:["Excavator arms are pinned into full-width deck foundations.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Crusher machinery, tapered mineral hoppers and articulated tool heads."},rook:{emitters:2,laser:"Recovery defense pair",bankPower:10,review:["The asymmetric recovery boom roots into a reinforced side workshop.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Open wreck cradle, recovery winch, grapples and assessment compartments."},ibis:{emitters:2,laser:"Medical defense pair",bankPower:8,review:["Treatment modules and docking collars have seated pressure connections.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Three isolation wards, ambulance docking ports and protected life-support services."},crane:{emitters:4,laser:"Workshop defense battery",bankPower:12,review:["Both service booms use substantial deck pedestals and captive joint pins.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Twin repair arms, open service bays, equipment racks and overhead gantries."},nightjar:{emitters:2,laser:"Reconnaissance beam pair",bankPower:10,review:["Directional arrays are supported along their backs and rooted into crossmembers.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Staggered signal panels, shielded electronics rooms and ventral decoy cells."},condor:{emitters:4,laser:"Carrier defense battery",bankPower:14,review:["Hangar roofs, walls and decks share continuous frames; command tower is hull-rooted.","Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."],addition:"Two open hangars, stored utility craft, raised command block and four main drives."}});for(let f of t)Object.freeze(f);Object.freeze(t);let n={kestrel:["Forward pulse optics clear the bow in both standard and upgraded fits.","Ventral servicing bays and seated latches give the compact courier a maintained working hull."],swift:["Moved the axial laser beyond the needle bow so its lens is fully exposed.","Checked the three compact drives, radiator roots and enlarged cargo fairing; underside access panels follow the narrow hull."],osprey:["Cooling-line ends now return to the shoulder skin instead of projecting above it.","Checked cheek armor, twin optics and optional railguns; belly access bays use the broader armored footprint."],heron:["All three receiver braces now use the dish bowl\u2019s actual tilt, with their ends on the rim.","The forward defense optic clears the bow; survey outriggers and optional weapons retain separate supported mounts."],merlin:["Closed the cooling pipes into the pressure hull, removing the unintended upright prongs.","Checked the compact twin-drive frame, forward optics and optional weapons across the narrow interception spine."],petrel:["Tank-feed pipe roots enter the pressure drums rather than ending beside them.","Checked manifold clearance, all six tank saddles and outboard weapons at maximum tank size."],peregrine:["Each container portal now has a supported upright at both ends.","The overhead service trunk returns to the forward hull instead of ending above the bow; weapon bays remain clear of freight modules."],tern:["Checked insulated doors, thermal lines and roof cooling banks at standard and maximum hold size.","Added conformal underside service bays and verified that the forward optics remain visible."],curlew:["Passenger cabins retain their dimensions when propellant upgrades are selected.","Checked cabin saddles, escape-capsule supports and the ventral freight pod; end-on framing now includes the complete hull."],cormorant:["Checked the fork roots, pivot pins, winch and free-ended grapples from both sides.","Added seated ventral machinery access bays while preserving clearance around the handling fork."],sanderling:["Checked both excavator joints, tool collars, hoppers and crusher clearances.","Forward defense optics remain separate from the drill heads; underside servicing panels follow the processing keel."],gannet:["Checked all four separate drive apertures and the distributed optical banks.","Cooling lines terminate on the armor; wider ventral service bays reinforce the heavy escort silhouette."],rook:["Recovery boom rails, cross-ties and pins now read as one reinforced crane.","Checked the suspended grapple cable, open cradle and workshop at maximum refit; underside access bays remain seated."],ibis:["Treatment wards remain fixed while separate fuel jackets and the freight pod expand.","Checked ambulance collars, life-support galleries and weapon clearances; the new underside panels follow the actual lower surfaces."],gyrfalcon:["Checked the patrol booms, outboard tanks and forward optical banks.","Cooling-line ends return to the hull and the underside receives reinforced access bays rather than a blank slab."],albatross:["Checked container saddles, cross-braced frames and the keel-rooted central walkway at full hold expansion.","Verified the distributed optical bank and added lower service bays without intruding into cargo frames."],crane:["Reinforced both articulated service booms with captive side rails and cross-ties.","Checked repair-bay roof clearance, tool heads and optional weapon mounts from both sides and below."],nightjar:["Added seated perimeter frames so the dark signal arrays remain legible.","Checked all six array roots, the decoy cells and optional weapons; lower service panels remain flush with the electronic hull."],pelican:["Separated the four drive apertures into supported upper/lower pairs, with open exhaust throats.","Side cargo modules, walkways and weapon mounts now move outward with enlarged central pods, preserving clearance through all tank levels."],condor:["Separated the four engines into supported vertical pairs and kept fairings forward of the exhaust throats.","Finished the port command tower with a seated pressure lift, tapered supports, framed bridge glazing and roof communications. Replaced placeholder hangar shapes with two cold-drive utility tenders on docking cradles."]};for(let[f,p]of Object.entries(n))e[f].review=p;let i={pulse:{name:"Pulse laser",range:7,heat:18,shield:1,armor:1,ammo:0,reload:1},beam:{name:"Continuous beam",range:10,heat:30,shield:1.35,armor:.75,ammo:0,reload:1},burst:{name:"Burst laser",range:6,heat:24,shield:1.1,armor:.9,ammo:0,reload:1},defensive:{name:"Tracking defense laser",range:4,heat:14,shield:.8,armor:.8,ammo:0,reload:1,intercept:4},coil:{name:"Coilgun",range:8,heat:24,shield:.8,armor:1.25,ammo:1,reload:1},rail:{name:"Railgun",range:12,heat:38,shield:.7,armor:1.6,ammo:1,reload:2},cannon:{name:"Rapid-fire cannon",range:4,heat:16,shield:.65,armor:1.05,ammo:2,reload:1,intercept:5},missile:{name:"Guided missile",range:16,heat:12,shield:1.2,armor:1.15,ammo:1,reload:2},torpedo:{name:"Heavy torpedo",range:12,heat:18,shield:.85,armor:1.8,ammo:1,reload:3}},r=[["kestrel",32,120,.04,0,25,"pulse",[2,2,2,4],[5,7,10,8],"coil",[0,2,2,2],[0,9,13,18],"missile",[0,2,2,2],[0,22,30,40]],["swift",27,90,.03,0,15,"pulse",[1,1,2,2],[7,10,8,11],"cannon",[0,2,2,2],[0,5,7,10],"missile",[0,2,2,2],[0,18,24,32]],["osprey",44,220,.16,40,40,"burst",[4,4,6,6],[7,10,9,12],"coil",[2,2,4,4],[12,17,15,21],"missile",[2,2,4,4],[28,36,34,45]],["heron",50,160,.06,0,35,"beam",[1,2,2,2],[10,8,12,17],"coil",[0,2,2,2],[0,10,14,19],"missile",[0,2,2,2],[0,24,32,42]],["merlin",37,180,.12,25,30,"burst",[2,4,4,4],[10,7,11,15],"cannon",[2,2,4,4],[7,10,9,13],"missile",[2,2,4,4],[24,32,28,38]],["petrel",74,280,.06,0,45,"defensive",[2,2,4,4],[6,9,7,10],"cannon",[0,2,2,4],[0,7,10,8],"missile",[0,2,2,4],[0,26,36,30]],["peregrine",80,320,.07,0,50,"pulse",[2,4,4,4],[7,5,8,11],"coil",[0,2,2,4],[0,12,17,14],"missile",[0,2,2,4],[0,28,38,32]],["tern",78,300,.08,0,45,"pulse",[2,2,4,4],[7,10,8,11],"cannon",[0,2,2,4],[0,8,11,9],"missile",[0,2,2,4],[0,26,36,30]],["curlew",86,340,.09,40,55,"defensive",[4,4,4,6],[5,7,10,9],"cannon",[0,2,4,4],[0,8,7,10],"missile",[0,2,2,4],[0,26,36,30]],["cormorant",91,440,.13,0,60,"pulse",[2,4,4,6],[9,7,10,9],"coil",[0,2,4,4],[0,15,13,19],"torpedo",[0,2,2,2],[0,48,65,85]],["sanderling",68,400,.14,0,45,"beam",[2,2,2,4],[9,13,18,13],"coil",[0,2,2,4],[0,14,20,16],"torpedo",[0,2,2,2],[0,42,58,78]],["gannet",102,700,.24,160,95,"defensive",[6,6,8,8],[8,11,11,15],"coil",[4,4,6,6],[15,20,18,25],"missile",[4,4,6,6],[38,48,44,58]],["rook",96,520,.16,0,65,"pulse",[4,4,4,6],[7,10,14,12],"coil",[0,2,4,4],[0,16,14,20],"torpedo",[0,2,2,4],[0,50,68,56]],["ibis",110,480,.1,75,70,"defensive",[4,4,6,6],[6,9,8,11],"cannon",[0,2,4,4],[0,9,8,12],"missile",[0,2,2,4],[0,30,42,35]],["gyrfalcon",128,950,.26,240,125,"beam",[8,8,10,12],[12,16,17,19],"rail",[4,4,6,6],[28,38,35,48],"torpedo",[4,4,6,6],[65,85,80,105]],["albatross",158,980,.11,0,110,"pulse",[4,6,6,8],[8,8,12,12],"coil",[0,2,4,4],[0,20,18,26],"missile",[0,2,4,4],[0,40,35,48]],["crane",170,1100,.18,0,125,"defensive",[6,6,8,8],[7,10,10,14],"coil",[0,2,4,4],[0,20,18,26],"torpedo",[0,2,4,4],[0,62,54,74]],["nightjar",118,500,.1,100,85,"beam",[2,4,4,6],[12,9,13,12],"rail",[0,2,2,4],[0,24,34,28],"missile",[2,2,4,4],[36,48,42,58]],["pelican",205,1600,.15,0,150,"defensive",[8,8,10,12],[7,10,10,11],"cannon",[0,4,6,8],[0,10,10,11],"missile",[0,4,6,8],[0,38,36,40]],["condor",340,2200,.22,280,180,"defensive",[10,12,14,16],[8,9,11,13],"cannon",[4,4,6,8],[10,14,13,14],"missile",[4,4,6,8],[42,56,52,62]]],a={};for(let[f,p,_,x,T,c,w,y,C,R,E,D,F,X,N]of r)a[f]={length:p,hullPoints:_,armor:x,shieldBase:T,shieldRating:c,shieldUpgrade:!0,laser:{type:w,counts:y,strength:C},weapons:{type:R,counts:E,strength:D},ordnance:{type:F,counts:X,strength:N}},Object.assign(e[f],{emitters:y[0],bankPower:y[0]*C[0],laser:i[w].name});let s=[{id:"armor",name:"Armor reinforcement",rate:4,detail:"Reinforced hull plating reduces the remaining unarmored damage by 7% per tier. Base armor differs by class; shield absorption occurs first."},{id:"drive",name:"Engine optimization",rate:5,detail:"Adds 2.5% specific impulse and 1% base dry mass per tier."},{id:"tank",name:"Propellant tanks",rate:3,detail:"Adds 15% tank capacity and 2% base dry mass per tier."},{id:"cargo",name:"Cargo framework",rate:3,detail:"Adds 10% gross hold capacity and 3% base dry mass per tier. Internal refit space is deducted afterward."},{id:"sensors",name:"Fire-control sensors",rate:3,detail:"Adds 5 percentage points to weapon accuracy per tier; normal accuracy limits still apply."},{id:"laser",name:"Energy weapon package",rate:5,detail:"Class-specific pulse, beam, burst or tracking lasers. Higher tiers improve total output and may add emitters; see the fitted weapon table. Energy based: no ammunition or cargo-space charge."},{id:"weapons",name:"Kinetic weapon package",rate:6,detail:"Class-specific coilguns, railguns or rapid-fire cannons. Combat hulls include a factory battery; civilian hulls add one at tier 1."},{id:"shield",name:"Shield generator",rate:7,detail:"Factory shields vary by class. Retrofitting adds 1\xD7 / 2.2\xD7 / 3.6\xD7 the class generator rating. Restores 10% capacity per round after two rounds without a hit."},{id:"ordnance",name:"Missile / torpedo package",rate:6,detail:"Guided missiles or heavy torpedoes by class. Higher tiers improve warhead strength and may add launch tubes. Ammunition and reload time apply."}];function o(f){if(f&&typeof f=="object"&&!Object.isFrozen(f)){for(let p of Object.values(f))o(p);Object.freeze(f)}return f}let h=o({ammunitionTonnes:{round:.015,missile:.08,torpedo:.35},fractions:{laser:[0,0,0,0],weapons:[0,.025,.05,.085],ordnance:[0,.035,.075,.12],shield:[0,.03,.065,.1],sensors:[0,.005,.01,.02]},weaponFactors:{pulse:1,beam:1.35,burst:1.15,defensive:.8,coil:1,rail:1.3,cannon:.8,missile:1,torpedo:1.5},descriptions:{laser:"Energy based \xB7 no ammunition or cargo-space charge",weapons:"Weapon services and empty magazine hardware",ordnance:"Launch services and empty magazine hardware",shield:"Generator and power conditioning",sensors:"Fire-control processors and service equipment"}}),d=o({condor:{berths:2,allowedShipIDs:["kestrel","swift","merlin"],baseDryMassLimit:14,clearanceMargin:1}});o(a),o(i),o(s);for(let f of Object.values(e))Object.freeze(f.review),Object.freeze(f);Object.freeze(e);let m=Object.freeze({priceOverrides:Object.freeze({swift:16800,peregrine:2e5}),hullPriceMultiplier:1.2,specs:e,prototypes:t,balance:a,weaponTypes:i,fittings:s,carrierPolicies:d,cargoSpace:h});u.SpacetraderShipSpecs=m,typeof ms<"u"&&(ms.exports=m)})(globalThis)});var po={};Ta(po,{model:()=>uo,revision:()=>la,source:()=>ca});var gn=2;var is=0,rs=1,ss=2,as=3,os=4,ls=5,cs=6,hs=7;var us=300;var kr=1e3,Cn=1001,zr=1002,Rn=1003;var js=1015;var qs=1026;var In=2300,wi=2301,bi=2302,Vr=2400,Gr=2401,Hr=2402;var Fe="srgb",Wr="srgb-linear",Xr="linear",Ti="srgb";var kt=7680;var jr=35044;var ln=2e3,Ei=2001;var zt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}},Re=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ss=1234567,qr=Math.PI/180,Yr=180/Math.PI;function qt(){let u=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0,n=4294967295*Math.random()|0;return(Re[255&u]+Re[u>>8&255]+Re[u>>16&255]+Re[u>>24&255]+"-"+Re[255&e]+Re[e>>8&255]+"-"+Re[e>>16&15|64]+Re[e>>24&255]+"-"+Re[63&t|128]+Re[t>>8&255]+"-"+Re[t>>16&255]+Re[t>>24&255]+Re[255&n]+Re[n>>8&255]+Re[n>>16&255]+Re[n>>24&255]).toLowerCase()}function te(u,e,t){return Math.max(e,Math.min(t,u))}function Zr(u,e){return(u%e+e)%e}function wn(u,e,t){return(1-t)*u+t*e}function an(u,e){switch(e.constructor){case Float32Array:return u;case Uint32Array:return u/4294967295;case Uint16Array:return u/65535;case Uint8Array:return u/255;case Int32Array:return Math.max(u/2147483647,-1);case Int16Array:return Math.max(u/32767,-1);case Int8Array:return Math.max(u/127,-1);default:throw new Error("Invalid component type.")}}function Le(u,e){switch(e.constructor){case Float32Array:return u;case Uint32Array:return Math.round(4294967295*u);case Uint16Array:return Math.round(65535*u);case Uint8Array:return Math.round(255*u);case Int32Array:return Math.round(2147483647*u);case Int16Array:return Math.round(32767*u);case Int8Array:return Math.round(127*u);default:throw new Error("Invalid component type.")}}var Ae={DEG2RAD:qr,RAD2DEG:Yr,generateUUID:qt,clamp:te,euclideanModulo:Zr,mapLinear:function(u,e,t,n,i){return n+(u-e)*(i-n)/(t-e)},inverseLerp:function(u,e,t){return u!==e?(t-u)/(e-u):0},lerp:wn,damp:function(u,e,t,n){return wn(u,e,1-Math.exp(-t*n))},pingpong:function(u,e=1){return e-Math.abs(Zr(u,2*e)-e)},smoothstep:function(u,e,t){return u<=e?0:u>=t?1:(u=(u-e)/(t-e))*u*(3-2*u)},smootherstep:function(u,e,t){return u<=e?0:u>=t?1:(u=(u-e)/(t-e))*u*u*(u*(6*u-15)+10)},randInt:function(u,e){return u+Math.floor(Math.random()*(e-u+1))},randFloat:function(u,e){return u+Math.random()*(e-u)},randFloatSpread:function(u){return u*(.5-Math.random())},seededRandom:function(u){u!==void 0&&(Ss=u);let e=Ss+=1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296},degToRad:function(u){return u*qr},radToDeg:function(u){return u*Yr},isPowerOfTwo:function(u){return!(u&u-1)&&u!==0},ceilPowerOfTwo:function(u){return Math.pow(2,Math.ceil(Math.log(u)/Math.LN2))},floorPowerOfTwo:function(u){return Math.pow(2,Math.floor(Math.log(u)/Math.LN2))},setQuaternionFromProperEuler:function(u,e,t,n,i){let r=Math.cos,a=Math.sin,s=r(t/2),o=a(t/2),h=r((e+n)/2),d=a((e+n)/2),m=r((e-n)/2),f=a((e-n)/2),p=r((n-e)/2),_=a((n-e)/2);switch(i){case"XYX":u.set(s*d,o*m,o*f,s*h);break;case"YZY":u.set(o*f,s*d,o*m,s*h);break;case"ZXZ":u.set(o*m,o*f,s*d,s*h);break;case"XZX":u.set(s*d,o*_,o*p,s*h);break;case"YXY":u.set(o*p,s*d,o*_,s*h);break;case"ZYZ":u.set(o*_,o*p,s*d,s*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}},normalize:Le,denormalize:an},B=class u{constructor(e=0,t=0){u.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=te(this.x,e.x,t.x),this.y=te(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=te(this.x,e,t),this.y=te(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(te(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(te(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},tt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,s){let o=n[i+0],h=n[i+1],d=n[i+2],m=n[i+3],f=r[a+0],p=r[a+1],_=r[a+2],x=r[a+3];if(s===0)return e[t+0]=o,e[t+1]=h,e[t+2]=d,void(e[t+3]=m);if(s===1)return e[t+0]=f,e[t+1]=p,e[t+2]=_,void(e[t+3]=x);if(m!==x||o!==f||h!==p||d!==_){let T=1-s,c=o*f+h*p+d*_+m*x,w=c>=0?1:-1,y=1-c*c;if(y>Number.EPSILON){let R=Math.sqrt(y),E=Math.atan2(R,c*w);T=Math.sin(T*E)/R,s=Math.sin(s*E)/R}let C=s*w;if(o=o*T+f*C,h=h*T+p*C,d=d*T+_*C,m=m*T+x*C,T===1-s){let R=1/Math.sqrt(o*o+h*h+d*d+m*m);o*=R,h*=R,d*=R,m*=R}}e[t]=o,e[t+1]=h,e[t+2]=d,e[t+3]=m}static multiplyQuaternionsFlat(e,t,n,i,r,a){let s=n[i],o=n[i+1],h=n[i+2],d=n[i+3],m=r[a],f=r[a+1],p=r[a+2],_=r[a+3];return e[t]=s*_+d*m+o*p-h*f,e[t+1]=o*_+d*f+h*m-s*p,e[t+2]=h*_+d*p+s*f-o*m,e[t+3]=d*_-s*m-o*f-h*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,a=e._order,s=Math.cos,o=Math.sin,h=s(n/2),d=s(i/2),m=s(r/2),f=o(n/2),p=o(i/2),_=o(r/2);switch(a){case"XYZ":this._x=f*d*m+h*p*_,this._y=h*p*m-f*d*_,this._z=h*d*_+f*p*m,this._w=h*d*m-f*p*_;break;case"YXZ":this._x=f*d*m+h*p*_,this._y=h*p*m-f*d*_,this._z=h*d*_-f*p*m,this._w=h*d*m+f*p*_;break;case"ZXY":this._x=f*d*m-h*p*_,this._y=h*p*m+f*d*_,this._z=h*d*_+f*p*m,this._w=h*d*m-f*p*_;break;case"ZYX":this._x=f*d*m-h*p*_,this._y=h*p*m+f*d*_,this._z=h*d*_-f*p*m,this._w=h*d*m+f*p*_;break;case"YZX":this._x=f*d*m+h*p*_,this._y=h*p*m+f*d*_,this._z=h*d*_-f*p*m,this._w=h*d*m-f*p*_;break;case"XZY":this._x=f*d*m-h*p*_,this._y=h*p*m-f*d*_,this._z=h*d*_+f*p*m,this._w=h*d*m+f*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],s=t[5],o=t[9],h=t[2],d=t[6],m=t[10],f=n+s+m;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(d-o)*p,this._y=(r-h)*p,this._z=(a-i)*p}else if(n>s&&n>m){let p=2*Math.sqrt(1+n-s-m);this._w=(d-o)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(r+h)/p}else if(s>m){let p=2*Math.sqrt(1+s-n-m);this._w=(r-h)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(o+d)/p}else{let p=2*Math.sqrt(1+m-n-s);this._w=(a-i)/p,this._x=(r+h)/p,this._y=(o+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(te(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,a=e._w,s=t._x,o=t._y,h=t._z,d=t._w;return this._x=n*d+a*s+i*h-r*o,this._y=i*d+a*o+r*s-n*h,this._z=r*d+a*h+n*o-i*s,this._w=a*d-n*s-i*o-r*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,r=this._z,a=this._w,s=a*e._w+n*e._x+i*e._y+r*e._z;if(s<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,s=-s):this.copy(e),s>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;let o=1-s*s;if(o<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let h=Math.sqrt(o),d=Math.atan2(h,s),m=Math.sin((1-t)*d)/h,f=Math.sin(t*d)/h;return this._w=a*m+this._w*f,this._x=n*m+this._x*f,this._y=i*m+this._y*f,this._z=r*m+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},M=class u{constructor(e=0,t=0,n=0){u.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bs.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bs.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,s=e.z,o=e.w,h=2*(a*i-s*n),d=2*(s*t-r*i),m=2*(r*n-a*t);return this.x=t+o*h+a*m-s*d,this.y=n+o*d+s*h-r*m,this.z=i+o*m+r*d-a*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=te(this.x,e.x,t.x),this.y=te(this.y,e.y,t.y),this.z=te(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=te(this.x,e,t),this.y=te(this.y,e,t),this.z=te(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(te(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,a=t.x,s=t.y,o=t.z;return this.x=i*o-r*s,this.y=r*a-n*o,this.z=n*s-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return pr.copy(this).projectOnVector(e),this.sub(pr)}reflect(e){return this.sub(pr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(te(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,4*t)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,3*t)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=2*Math.random()-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},pr=new M,bs=new tt,K=class u{constructor(e,t,n,i,r,a,s,o,h){u.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,s,o,h)}set(e,t,n,i,r,a,s,o,h){let d=this.elements;return d[0]=e,d[1]=i,d[2]=s,d[3]=t,d[4]=r,d[5]=o,d[6]=n,d[7]=a,d[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,a=n[0],s=n[3],o=n[6],h=n[1],d=n[4],m=n[7],f=n[2],p=n[5],_=n[8],x=i[0],T=i[3],c=i[6],w=i[1],y=i[4],C=i[7],R=i[2],E=i[5],D=i[8];return r[0]=a*x+s*w+o*R,r[3]=a*T+s*y+o*E,r[6]=a*c+s*C+o*D,r[1]=h*x+d*w+m*R,r[4]=h*T+d*y+m*E,r[7]=h*c+d*C+m*D,r[2]=f*x+p*w+_*R,r[5]=f*T+p*y+_*E,r[8]=f*c+p*C+_*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],s=e[5],o=e[6],h=e[7],d=e[8];return t*a*d-t*s*h-n*r*d+n*s*o+i*r*h-i*a*o}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],s=e[5],o=e[6],h=e[7],d=e[8],m=d*a-s*h,f=s*o-d*r,p=h*r-a*o,_=t*m+n*f+i*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/_;return e[0]=m*x,e[1]=(i*h-d*n)*x,e[2]=(s*n-i*a)*x,e[3]=f*x,e[4]=(d*t-i*o)*x,e[5]=(i*r-s*t)*x,e[6]=p*x,e[7]=(n*o-h*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,s){let o=Math.cos(r),h=Math.sin(r);return this.set(n*o,n*h,-n*(o*a+h*s)+a+e,-i*h,i*o,-i*(-h*a+o*s)+s+t,0,0,1),this}scale(e,t){return this.premultiply(mr.makeScale(e,t)),this}rotate(e){return this.premultiply(mr.makeRotation(-e)),this}translate(e,t){return this.premultiply(mr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},mr=new K;function Ys(u){for(let e=u.length-1;e>=0;--e)if(u[e]>=65535)return!0;return!1}function Jr(u){return document.createElementNS("http://www.w3.org/1999/xhtml",u)}var Ts={};function Kr(u){u in Ts||(Ts[u]=!0,console.warn(u))}var ws=new K().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Es=new K().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Aa(){let u={enabled:!0,workingColorSpace:Wr,spaces:{},convert:function(i,r,a){return this.enabled!==!1&&r!==a&&r&&a&&(this.spaces[r].transfer===Ti&&(i.r=vt(i.r),i.g=vt(i.g),i.b=vt(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ti&&(i.r=on(i.r),i.g=on(i.g),i.b=on(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===""?Xr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Kr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),u.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Kr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),u.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return u.define({[Wr]:{primaries:e,whitePoint:n,transfer:Xr,toXYZ:ws,fromXYZ:Es,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Fe},outputColorSpaceConfig:{drawingBufferColorSpace:Fe}},[Fe]:{primaries:e,whitePoint:n,transfer:Ti,toXYZ:ws,fromXYZ:Es,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Fe}}}),u}var qe=Aa();function vt(u){return u<.04045?.0773993808*u:Math.pow(.9478672986*u+.0521327014,2.4)}function on(u){return u<.0031308?12.92*u:1.055*Math.pow(u,.41666)-.055}var Zt,Ai=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Zt===void 0&&(Zt=Jr("canvas")),Zt.width=e.width,Zt.height=e.height;let i=Zt.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Zt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Jr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=255*vt(r[a]/255);return n.putImageData(i,0,0),t}if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(255*vt(t[n]/255)):t[n]=vt(t[n]);return{data:t,width:e.width,height:e.height}}return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Ca=0,Pn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ca++}),this.uuid=qt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,s=i.length;a<s;a++)i[a].isDataTexture?r.push(fr(i[a].image)):r.push(fr(i[a]))}else r=fr(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function fr(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap?Ai.getDataURL(u):u.data?{data:Array.from(u.data),width:u.width,height:u.height,type:u.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Ra=0,gr=new M,Ye=class u extends zt{constructor(e=u.DEFAULT_IMAGE,t=u.DEFAULT_MAPPING,n=1001,i=1001,r=1006,a=1008,s=1023,o=1009,h=u.DEFAULT_ANISOTROPY,d=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ra++}),this.uuid=qt(),this.name="",this.source=new Pn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=s,this.internalFormat=null,this.type=o,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new K,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(gr).x}get height(){return this.source.getSize(gr).y}get depth(){return this.source.getSize(gr).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];i!==void 0?i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n:console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`)}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==us)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kr:e.x=e.x-Math.floor(e.x);break;case Cn:e.x=e.x<0?0:1;break;case zr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case kr:e.y=e.y-Math.floor(e.y);break;case Cn:e.y=e.y<0?0:1;break;case zr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ye.DEFAULT_IMAGE=null,Ye.DEFAULT_MAPPING=us,Ye.DEFAULT_ANISOTROPY=1;var Et=class u{constructor(e=0,t=0,n=0,i=1){u.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,o=e.elements,h=o[0],d=o[4],m=o[8],f=o[1],p=o[5],_=o[9],x=o[2],T=o[6],c=o[10];if(Math.abs(d-f)<.01&&Math.abs(m-x)<.01&&Math.abs(_-T)<.01){if(Math.abs(d+f)<.1&&Math.abs(m+x)<.1&&Math.abs(_+T)<.1&&Math.abs(h+p+c-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let y=(h+1)/2,C=(p+1)/2,R=(c+1)/2,E=(d+f)/4,D=(m+x)/4,F=(_+T)/4;return y>C&&y>R?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=E/n,r=D/n):C>R?C<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(C),n=E/i,r=F/i):R<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(R),n=D/r,i=F/r),this.set(n,i,r,t),this}let w=Math.sqrt((T-_)*(T-_)+(m-x)*(m-x)+(f-d)*(f-d));return Math.abs(w)<.001&&(w=1),this.x=(T-_)/w,this.y=(m-x)/w,this.z=(f-d)/w,this.w=Math.acos((h+p+c-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=te(this.x,e.x,t.x),this.y=te(this.y,e.y,t.y),this.z=te(this.z,e.z,t.z),this.w=te(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=te(this.x,e,t),this.y=te(this.y,e,t),this.z=te(this.z,e,t),this.w=te(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(te(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};var Ci=class extends Ye{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Rn,this.minFilter=Rn,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ri=class extends Ye{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Rn,this.minFilter=Rn,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var xe=class{constructor(e=new M(1/0,1/0,1/0),t=new M(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Ke.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Ke.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Ke.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,s=r.count;a<s;a++)e.isMesh===!0?e.getVertexPosition(a,Ke):Ke.fromBufferAttribute(r,a),Ke.applyMatrix4(e.matrixWorld),this.expandByPoint(Ke);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Qn.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qn.copy(n.boundingBox)),Qn.applyMatrix4(e.matrixWorld),this.union(Qn)}let i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ke),Ke.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xn),ei.subVectors(this.max,xn),Jt.subVectors(e.a,xn),Kt.subVectors(e.b,xn),$t.subVectors(e.c,xn),yt.subVectors(Kt,Jt),xt.subVectors($t,Kt),Nt.subVectors(Jt,$t);let t=[0,-yt.z,yt.y,0,-xt.z,xt.y,0,-Nt.z,Nt.y,yt.z,0,-yt.x,xt.z,0,-xt.x,Nt.z,0,-Nt.x,-yt.y,yt.x,0,-xt.y,xt.x,0,-Nt.y,Nt.x,0];return!!vr(t,Jt,Kt,$t,ei)&&(t=[1,0,0,0,1,0,0,0,1],!!vr(t,Jt,Kt,$t,ei)&&(ti.crossVectors(yt,xt),t=[ti.x,ti.y,ti.z],vr(t,Jt,Kt,$t,ei)))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ke).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=.5*this.getSize(Ke).length()),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(ut[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ut[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ut[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ut[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ut[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ut[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ut[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ut[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ut)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ut=[new M,new M,new M,new M,new M,new M,new M,new M],Ke=new M,Qn=new xe,Jt=new M,Kt=new M,$t=new M,yt=new M,xt=new M,Nt=new M,xn=new M,ei=new M,ti=new M,Ft=new M;function vr(u,e,t,n,i){for(let r=0,a=u.length-3;r<=a;r+=3){Ft.fromArray(u,r);let s=i.x*Math.abs(Ft.x)+i.y*Math.abs(Ft.y)+i.z*Math.abs(Ft.z),o=e.dot(Ft),h=t.dot(Ft),d=n.dot(Ft);if(Math.max(-Math.max(o,h,d),Math.min(o,h,d))>s)return!1}return!0}var Ia=new xe,Mn=new M,_r=new M,nt=class{constructor(e=new M,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Ia.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Mn.subVectors(e,this.center);let t=Mn.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=.5*(n-this.radius);this.center.addScaledVector(Mn,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_r.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Mn.copy(e.center).add(_r)),this.expandByPoint(Mn.copy(e.center).sub(_r))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},dt=new M,yr=new M,ni=new M,Mt=new M,xr=new M,ii=new M,Mr=new M,At=class{constructor(e=new M,t=new M(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,dt)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=dt.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(dt.copy(this.origin).addScaledVector(this.direction,t),dt.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){yr.copy(e).add(t).multiplyScalar(.5),ni.copy(t).sub(e).normalize(),Mt.copy(this.origin).sub(yr);let r=.5*e.distanceTo(t),a=-this.direction.dot(ni),s=Mt.dot(this.direction),o=-Mt.dot(ni),h=Mt.lengthSq(),d=Math.abs(1-a*a),m,f,p,_;if(d>0)if(m=a*o-s,f=a*s-o,_=r*d,m>=0)if(f>=-_)if(f<=_){let x=1/d;m*=x,f*=x,p=m*(m+a*f+2*s)+f*(a*m+f+2*o)+h}else f=r,m=Math.max(0,-(a*f+s)),p=-m*m+f*(f+2*o)+h;else f=-r,m=Math.max(0,-(a*f+s)),p=-m*m+f*(f+2*o)+h;else f<=-_?(m=Math.max(0,-(-a*r+s)),f=m>0?-r:Math.min(Math.max(-r,-o),r),p=-m*m+f*(f+2*o)+h):f<=_?(m=0,f=Math.min(Math.max(-r,-o),r),p=f*(f+2*o)+h):(m=Math.max(0,-(a*r+s)),f=m>0?r:Math.min(Math.max(-r,-o),r),p=-m*m+f*(f+2*o)+h);else f=a>0?-r:r,m=Math.max(0,-(a*f+s)),p=-m*m+f*(f+2*o)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,m),i&&i.copy(yr).addScaledVector(ni,f),p}intersectSphere(e,t){dt.subVectors(e.center,this.origin);let n=dt.dot(this.direction),i=dt.dot(dt)-n*n,r=e.radius*e.radius;if(i>r)return null;let a=Math.sqrt(r-i),s=n-a,o=n+a;return o<0?null:s<0?this.at(o,t):this.at(s,t)}intersectsSphere(e){return!(e.radius<0)&&this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0?!0:e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,s,o,h=1/this.direction.x,d=1/this.direction.y,m=1/this.direction.z,f=this.origin;return h>=0?(n=(e.min.x-f.x)*h,i=(e.max.x-f.x)*h):(n=(e.max.x-f.x)*h,i=(e.min.x-f.x)*h),d>=0?(r=(e.min.y-f.y)*d,a=(e.max.y-f.y)*d):(r=(e.max.y-f.y)*d,a=(e.min.y-f.y)*d),n>a||r>i?null:((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),m>=0?(s=(e.min.z-f.z)*m,o=(e.max.z-f.z)*m):(s=(e.max.z-f.z)*m,o=(e.min.z-f.z)*m),n>o||s>i?null:((s>n||n!=n)&&(n=s),(o<i||i!=i)&&(i=o),i<0?null:this.at(n>=0?n:i,t)))}intersectsBox(e){return this.intersectBox(e,dt)!==null}intersectTriangle(e,t,n,i,r){xr.subVectors(t,e),ii.subVectors(n,e),Mr.crossVectors(xr,ii);let a,s=this.direction.dot(Mr);if(s>0){if(i)return null;a=1}else{if(!(s<0))return null;a=-1,s=-s}Mt.subVectors(this.origin,e);let o=a*this.direction.dot(ii.crossVectors(Mt,ii));if(o<0)return null;let h=a*this.direction.dot(xr.cross(Mt));if(h<0||o+h>s)return null;let d=-a*Mt.dot(Mr);return d<0?null:this.at(d/s,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},se=class u{constructor(e,t,n,i,r,a,s,o,h,d,m,f,p,_,x,T){u.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,s,o,h,d,m,f,p,_,x,T)}set(e,t,n,i,r,a,s,o,h,d,m,f,p,_,x,T){let c=this.elements;return c[0]=e,c[4]=t,c[8]=n,c[12]=i,c[1]=r,c[5]=a,c[9]=s,c[13]=o,c[2]=h,c[6]=d,c[10]=m,c[14]=f,c[3]=p,c[7]=_,c[11]=x,c[15]=T,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new u().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/Qt.setFromMatrixColumn(e,0).length(),r=1/Qt.setFromMatrixColumn(e,1).length(),a=1/Qt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),s=Math.sin(n),o=Math.cos(i),h=Math.sin(i),d=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){let f=a*d,p=a*m,_=s*d,x=s*m;t[0]=o*d,t[4]=-o*m,t[8]=h,t[1]=p+_*h,t[5]=f-x*h,t[9]=-s*o,t[2]=x-f*h,t[6]=_+p*h,t[10]=a*o}else if(e.order==="YXZ"){let f=o*d,p=o*m,_=h*d,x=h*m;t[0]=f+x*s,t[4]=_*s-p,t[8]=a*h,t[1]=a*m,t[5]=a*d,t[9]=-s,t[2]=p*s-_,t[6]=x+f*s,t[10]=a*o}else if(e.order==="ZXY"){let f=o*d,p=o*m,_=h*d,x=h*m;t[0]=f-x*s,t[4]=-a*m,t[8]=_+p*s,t[1]=p+_*s,t[5]=a*d,t[9]=x-f*s,t[2]=-a*h,t[6]=s,t[10]=a*o}else if(e.order==="ZYX"){let f=a*d,p=a*m,_=s*d,x=s*m;t[0]=o*d,t[4]=_*h-p,t[8]=f*h+x,t[1]=o*m,t[5]=x*h+f,t[9]=p*h-_,t[2]=-h,t[6]=s*o,t[10]=a*o}else if(e.order==="YZX"){let f=a*o,p=a*h,_=s*o,x=s*h;t[0]=o*d,t[4]=x-f*m,t[8]=_*m+p,t[1]=m,t[5]=a*d,t[9]=-s*d,t[2]=-h*d,t[6]=p*m+_,t[10]=f-x*m}else if(e.order==="XZY"){let f=a*o,p=a*h,_=s*o,x=s*h;t[0]=o*d,t[4]=-m,t[8]=h*d,t[1]=f*m+x,t[5]=a*d,t[9]=p*m-_,t[2]=_*m-p,t[6]=s*d,t[10]=x*m+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Pa,e,La)}lookAt(e,t,n){let i=this.elements;return ze.subVectors(e,t),ze.lengthSq()===0&&(ze.z=1),ze.normalize(),St.crossVectors(n,ze),St.lengthSq()===0&&(Math.abs(n.z)===1?ze.x+=1e-4:ze.z+=1e-4,ze.normalize(),St.crossVectors(n,ze)),St.normalize(),ri.crossVectors(ze,St),i[0]=St.x,i[4]=ri.x,i[8]=ze.x,i[1]=St.y,i[5]=ri.y,i[9]=ze.y,i[2]=St.z,i[6]=ri.z,i[10]=ze.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,a=n[0],s=n[4],o=n[8],h=n[12],d=n[1],m=n[5],f=n[9],p=n[13],_=n[2],x=n[6],T=n[10],c=n[14],w=n[3],y=n[7],C=n[11],R=n[15],E=i[0],D=i[4],F=i[8],X=i[12],N=i[1],q=i[5],O=i[9],Q=i[13],oe=i[2],de=i[6],ce=i[10],Ue=i[14],we=i[3],ve=i[7],ne=i[11],pe=i[15];return r[0]=a*E+s*N+o*oe+h*we,r[4]=a*D+s*q+o*de+h*ve,r[8]=a*F+s*O+o*ce+h*ne,r[12]=a*X+s*Q+o*Ue+h*pe,r[1]=d*E+m*N+f*oe+p*we,r[5]=d*D+m*q+f*de+p*ve,r[9]=d*F+m*O+f*ce+p*ne,r[13]=d*X+m*Q+f*Ue+p*pe,r[2]=_*E+x*N+T*oe+c*we,r[6]=_*D+x*q+T*de+c*ve,r[10]=_*F+x*O+T*ce+c*ne,r[14]=_*X+x*Q+T*Ue+c*pe,r[3]=w*E+y*N+C*oe+R*we,r[7]=w*D+y*q+C*de+R*ve,r[11]=w*F+y*O+C*ce+R*ne,r[15]=w*X+y*Q+C*Ue+R*pe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],s=e[5],o=e[9],h=e[13],d=e[2],m=e[6],f=e[10],p=e[14];return e[3]*(+r*o*m-i*h*m-r*s*f+n*h*f+i*s*p-n*o*p)+e[7]*(+t*o*p-t*h*f+r*a*f-i*a*p+i*h*d-r*o*d)+e[11]*(+t*h*m-t*s*p-r*a*m+n*a*p+r*s*d-n*h*d)+e[15]*(-i*s*d-t*o*m+t*s*f+i*a*m-n*a*f+n*o*d)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],s=e[5],o=e[6],h=e[7],d=e[8],m=e[9],f=e[10],p=e[11],_=e[12],x=e[13],T=e[14],c=e[15],w=m*T*h-x*f*h+x*o*p-s*T*p-m*o*c+s*f*c,y=_*f*h-d*T*h-_*o*p+a*T*p+d*o*c-a*f*c,C=d*x*h-_*m*h+_*s*p-a*x*p-d*s*c+a*m*c,R=_*m*o-d*x*o-_*s*f+a*x*f+d*s*T-a*m*T,E=t*w+n*y+i*C+r*R;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/E;return e[0]=w*D,e[1]=(x*f*r-m*T*r-x*i*p+n*T*p+m*i*c-n*f*c)*D,e[2]=(s*T*r-x*o*r+x*i*h-n*T*h-s*i*c+n*o*c)*D,e[3]=(m*o*r-s*f*r-m*i*h+n*f*h+s*i*p-n*o*p)*D,e[4]=y*D,e[5]=(d*T*r-_*f*r+_*i*p-t*T*p-d*i*c+t*f*c)*D,e[6]=(_*o*r-a*T*r-_*i*h+t*T*h+a*i*c-t*o*c)*D,e[7]=(a*f*r-d*o*r+d*i*h-t*f*h-a*i*p+t*o*p)*D,e[8]=C*D,e[9]=(_*m*r-d*x*r-_*n*p+t*x*p+d*n*c-t*m*c)*D,e[10]=(a*x*r-_*s*r+_*n*h-t*x*h-a*n*c+t*s*c)*D,e[11]=(d*s*r-a*m*r-d*n*h+t*m*h+a*n*p-t*s*p)*D,e[12]=R*D,e[13]=(d*x*i-_*m*i+_*n*f-t*x*f-d*n*T+t*m*T)*D,e[14]=(_*s*i-a*x*i-_*n*o+t*x*o+a*n*T-t*s*T)*D,e[15]=(a*m*i-d*s*i+d*n*o-t*m*o-a*n*f+t*s*f)*D,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,s=e.y,o=e.z,h=r*a,d=r*s;return this.set(h*a+n,h*s-i*o,h*o+i*s,0,h*s+i*o,d*s+n,d*o-i*a,0,h*o-i*s,d*o+i*a,r*o*o+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,a=t._y,s=t._z,o=t._w,h=r+r,d=a+a,m=s+s,f=r*h,p=r*d,_=r*m,x=a*d,T=a*m,c=s*m,w=o*h,y=o*d,C=o*m,R=n.x,E=n.y,D=n.z;return i[0]=(1-(x+c))*R,i[1]=(p+C)*R,i[2]=(_-y)*R,i[3]=0,i[4]=(p-C)*E,i[5]=(1-(f+c))*E,i[6]=(T+w)*E,i[7]=0,i[8]=(_+y)*D,i[9]=(T-w)*D,i[10]=(1-(f+x))*D,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,r=Qt.set(i[0],i[1],i[2]).length(),a=Qt.set(i[4],i[5],i[6]).length(),s=Qt.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],$e.copy(this);let o=1/r,h=1/a,d=1/s;return $e.elements[0]*=o,$e.elements[1]*=o,$e.elements[2]*=o,$e.elements[4]*=h,$e.elements[5]*=h,$e.elements[6]*=h,$e.elements[8]*=d,$e.elements[9]*=d,$e.elements[10]*=d,t.setFromRotationMatrix($e),n.x=r,n.y=a,n.z=s,this}makePerspective(e,t,n,i,r,a,s=2e3,o=!1){let h=this.elements,d=2*r/(t-e),m=2*r/(n-i),f=(t+e)/(t-e),p=(n+i)/(n-i),_,x;if(o)_=r/(a-r),x=a*r/(a-r);else if(s===ln)_=-(a+r)/(a-r),x=-2*a*r/(a-r);else{if(s!==Ei)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+s);_=-a/(a-r),x=-a*r/(a-r)}return h[0]=d,h[4]=0,h[8]=f,h[12]=0,h[1]=0,h[5]=m,h[9]=p,h[13]=0,h[2]=0,h[6]=0,h[10]=_,h[14]=x,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,n,i,r,a,s=2e3,o=!1){let h=this.elements,d=2/(t-e),m=2/(n-i),f=-(t+e)/(t-e),p=-(n+i)/(n-i),_,x;if(o)_=1/(a-r),x=a/(a-r);else if(s===ln)_=-2/(a-r),x=-(a+r)/(a-r);else{if(s!==Ei)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+s);_=-1/(a-r),x=-r/(a-r)}return h[0]=d,h[4]=0,h[8]=0,h[12]=f,h[1]=0,h[5]=m,h[9]=0,h[13]=p,h[2]=0,h[6]=0,h[10]=_,h[14]=x,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Qt=new M,$e=new se,Pa=new M(0,0,0),La=new M(1,1,1),St=new M,ri=new M,ze=new M,As=new se,Cs=new tt,_t=class u{constructor(e=0,t=0,n=0,i=u.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],a=i[4],s=i[8],o=i[1],h=i[5],d=i[9],m=i[2],f=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(te(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,h),this._z=0);break;case"YXZ":this._x=Math.asin(-te(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(s,p),this._z=Math.atan2(o,h)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(te(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-m,p),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(o,r));break;case"ZYX":this._y=Math.asin(-te(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(o,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(te(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,h),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(s,p));break;case"XZY":this._z=Math.asin(-te(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,h),this._y=Math.atan2(s,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return As.makeRotationFromQuaternion(e),this.setFromRotationMatrix(As,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Cs.setFromEuler(this),this.setFromQuaternion(Cs,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};_t.DEFAULT_ORDER="XYZ";var Ln=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Da=0,Rs=new M,en=new tt,pt=new se,si=new M,Sn=new M,Ua=new M,Na=new tt,Is=new M(1,0,0),Ps=new M(0,1,0),Ls=new M(0,0,1),Ds={type:"added"},Fa={type:"removed"},tn={type:"childadded",child:null},Sr={type:"childremoved",child:null},lt=class u extends zt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Da++}),this.uuid=qt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=u.DEFAULT_UP.clone();let e=new M,t=new _t,n=new tt,i=new M(1,1,1);t._onChange(function(){n.setFromEuler(t,!1)}),n._onChange(function(){t.setFromQuaternion(n,void 0,!1)}),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new se},normalMatrix:{value:new K}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=u.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=u.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ln,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return en.setFromAxisAngle(e,t),this.quaternion.multiply(en),this}rotateOnWorldAxis(e,t){return en.setFromAxisAngle(e,t),this.quaternion.premultiply(en),this}rotateX(e){return this.rotateOnAxis(Is,e)}rotateY(e){return this.rotateOnAxis(Ps,e)}rotateZ(e){return this.rotateOnAxis(Ls,e)}translateOnAxis(e,t){return Rs.copy(e).applyQuaternion(this.quaternion),this.position.add(Rs.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Is,e)}translateY(e){return this.translateOnAxis(Ps,e)}translateZ(e){return this.translateOnAxis(Ls,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pt.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?si.copy(e):si.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Sn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pt.lookAt(Sn,si,this.up):pt.lookAt(si,Sn,this.up),this.quaternion.setFromRotationMatrix(pt),i&&(pt.extractRotation(i.matrixWorld),en.setFromRotationMatrix(pt),this.quaternion.premultiply(en.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ds),tn.child=e,this.dispatchEvent(tn),tn.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fa),Sr.child=e,this.dispatchEvent(Sr),Sr.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pt.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pt.multiply(e.parent.matrixWorld)),e.applyMatrix4(pt),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ds),tn.child=e,this.dispatchEvent(tn),tn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sn,e,Ua),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sn,Na,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};function r(s,o){return s[o.uuid]===void 0&&(s[o.uuid]=o.toJSON(e)),o.uuid}if(i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(s=>({...s,boundingBox:s.boundingBox?s.boundingBox.toJSON():void 0,boundingSphere:s.boundingSphere?s.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(s=>({...s})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON())),this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let s=this.geometry.parameters;if(s!==void 0&&s.shapes!==void 0){let o=s.shapes;if(Array.isArray(o))for(let h=0,d=o.length;h<d;h++){let m=o[h];r(e.shapes,m)}else r(e.shapes,o)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let s=[];for(let o=0,h=this.material.length;o<h;o++)s.push(r(e.materials,this.material[o]));i.material=s}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let s=0;s<this.children.length;s++)i.children.push(this.children[s].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let s=0;s<this.animations.length;s++){let o=this.animations[s];i.animations.push(r(e.animations,o))}}if(t){let s=a(e.geometries),o=a(e.materials),h=a(e.textures),d=a(e.images),m=a(e.shapes),f=a(e.skeletons),p=a(e.animations),_=a(e.nodes);s.length>0&&(n.geometries=s),o.length>0&&(n.materials=o),h.length>0&&(n.textures=h),d.length>0&&(n.images=d),m.length>0&&(n.shapes=m),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=i,n;function a(s){let o=[];for(let h in s){let d=s[h];delete d.metadata,o.push(d)}return o}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};lt.DEFAULT_UP=new M(0,1,0),lt.DEFAULT_MATRIX_AUTO_UPDATE=!0,lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qe=new M,mt=new M,br=new M,ft=new M,nn=new M,rn=new M,Us=new M,Tr=new M,wr=new M,Er=new M,Ar=new Et,Cr=new Et,Rr=new Et,et=class u{constructor(e=new M,t=new M,n=new M){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Qe.subVectors(e,t),i.cross(Qe);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Qe.subVectors(i,t),mt.subVectors(n,t),br.subVectors(e,t);let a=Qe.dot(Qe),s=Qe.dot(mt),o=Qe.dot(br),h=mt.dot(mt),d=mt.dot(br),m=a*h-s*s;if(m===0)return r.set(0,0,0),null;let f=1/m,p=(h*o-s*d)*f,_=(a*d-s*o)*f;return r.set(1-p-_,_,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,ft)!==null&&ft.x>=0&&ft.y>=0&&ft.x+ft.y<=1}static getInterpolation(e,t,n,i,r,a,s,o){return this.getBarycoord(e,t,n,i,ft)===null?(o.x=0,o.y=0,"z"in o&&(o.z=0),"w"in o&&(o.w=0),null):(o.setScalar(0),o.addScaledVector(r,ft.x),o.addScaledVector(a,ft.y),o.addScaledVector(s,ft.z),o)}static getInterpolatedAttribute(e,t,n,i,r,a){return Ar.setScalar(0),Cr.setScalar(0),Rr.setScalar(0),Ar.fromBufferAttribute(e,t),Cr.fromBufferAttribute(e,n),Rr.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Ar,r.x),a.addScaledVector(Cr,r.y),a.addScaledVector(Rr,r.z),a}static isFrontFacing(e,t,n,i){return Qe.subVectors(n,t),mt.subVectors(e,t),Qe.cross(mt).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qe.subVectors(this.c,this.b),mt.subVectors(this.a,this.b),.5*Qe.cross(mt).length()}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return u.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return u.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return u.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return u.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return u.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,a,s;nn.subVectors(i,n),rn.subVectors(r,n),Tr.subVectors(e,n);let o=nn.dot(Tr),h=rn.dot(Tr);if(o<=0&&h<=0)return t.copy(n);wr.subVectors(e,i);let d=nn.dot(wr),m=rn.dot(wr);if(d>=0&&m<=d)return t.copy(i);let f=o*m-d*h;if(f<=0&&o>=0&&d<=0)return a=o/(o-d),t.copy(n).addScaledVector(nn,a);Er.subVectors(e,r);let p=nn.dot(Er),_=rn.dot(Er);if(_>=0&&p<=_)return t.copy(r);let x=p*h-o*_;if(x<=0&&h>=0&&_<=0)return s=h/(h-_),t.copy(n).addScaledVector(rn,s);let T=d*_-p*m;if(T<=0&&m-d>=0&&p-_>=0)return Us.subVectors(r,i),s=(m-d)/(m-d+(p-_)),t.copy(i).addScaledVector(Us,s);let c=1/(T+x+f);return a=x*c,s=f*c,t.copy(n).addScaledVector(nn,a).addScaledVector(rn,s)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Zs={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bt={h:0,s:0,l:0},ai={h:0,s:0,l:0};function Ir(u,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?u+6*(e-u)*t:t<.5?e:t<2/3?u+6*(e-u)*(2/3-t):u}var le=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(255&e)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,qe.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=qe.workingColorSpace){if(e=Zr(e,1),t=te(t,0,1),n=te(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Ir(a,r,e+1/3),this.g=Ir(a,r,e),this.b=Ir(a,r,e-1/3)}return qe.colorSpaceToWorking(this,i),this}setStyle(e,t=Fe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=i[1],s=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fe){let n=Zs[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=vt(e.r),this.g=vt(e.g),this.b=vt(e.b),this}copyLinearToSRGB(e){return this.r=on(e.r),this.g=on(e.g),this.b=on(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fe){return qe.workingToColorSpace(Ie.copy(this),e),65536*Math.round(te(255*Ie.r,0,255))+256*Math.round(te(255*Ie.g,0,255))+Math.round(te(255*Ie.b,0,255))}getHexString(e=Fe){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace(Ie.copy(this),t);let n=Ie.r,i=Ie.g,r=Ie.b,a=Math.max(n,i,r),s=Math.min(n,i,r),o,h,d=(s+a)/2;if(s===a)o=0,h=0;else{let m=a-s;switch(h=d<=.5?m/(a+s):m/(2-a-s),a){case n:o=(i-r)/m+(i<r?6:0);break;case i:o=(r-n)/m+2;break;case r:o=(n-i)/m+4}o/=6}return e.h=o,e.s=h,e.l=d,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace(Ie.copy(this),t),e.r=Ie.r,e.g=Ie.g,e.b=Ie.b,e}getStyle(e=Fe){qe.workingToColorSpace(Ie.copy(this),e);let t=Ie.r,n=Ie.g,i=Ie.b;return e!==Fe?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(255*t)},${Math.round(255*n)},${Math.round(255*i)})`}offsetHSL(e,t,n){return this.getHSL(bt),this.setHSL(bt.h+e,bt.s+t,bt.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(bt),e.getHSL(ai);let n=wn(bt.h,ai.h,t),i=wn(bt.s,ai.s,t),r=wn(bt.l,ai.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ie=new le;le.NAMES=Zs;var Oa=0,Dn=class extends zt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Oa++}),this.uuid=qt(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new le(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=kt,this.stencilZFail=kt,this.stencilZPass=kt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];i!==void 0?i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n:console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`)}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};function i(r){let a=[];for(let s in r){let o=r[s];delete o.metadata,a.push(o)}return a}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==kt&&(n.stencilFail=this.stencilFail),this.stencilZFail!==kt&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==kt&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData),t){let r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},cn=class extends Dn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _t,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},fo=Ba();function Ba(){let u=new ArrayBuffer(4),e=new Float32Array(u),t=new Uint32Array(u),n=new Uint32Array(512),i=new Uint32Array(512);for(let o=0;o<256;++o){let h=o-127;h<-27?(n[o]=0,n[256|o]=32768,i[o]=24,i[256|o]=24):h<-14?(n[o]=1024>>-h-14,n[256|o]=1024>>-h-14|32768,i[o]=-h-1,i[256|o]=-h-1):h<=15?(n[o]=h+15<<10,n[256|o]=h+15<<10|32768,i[o]=13,i[256|o]=13):h<128?(n[o]=31744,n[256|o]=64512,i[o]=24,i[256|o]=24):(n[o]=31744,n[256|o]=64512,i[o]=13,i[256|o]=13)}let r=new Uint32Array(2048),a=new Uint32Array(64),s=new Uint32Array(64);for(let o=1;o<1024;++o){let h=o<<13,d=0;for(;!(8388608&h);)h<<=1,d-=8388608;h&=-8388609,d+=947912704,r[o]=h|d}for(let o=1024;o<2048;++o)r[o]=939524096+(o-1024<<13);for(let o=1;o<31;++o)a[o]=o<<23;a[31]=1199570944,a[32]=2147483648;for(let o=33;o<63;++o)a[o]=2147483648+(o-32<<23);a[63]=3347054592;for(let o=1;o<64;++o)o!==32&&(s[o]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:r,exponentTable:a,offsetTable:s}}var Me=new M,oi=new B,ka=0,Ze=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ka++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=jr,this.updateRanges=[],this.gpuType=js,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)oi.fromBufferAttribute(this,t),oi.applyMatrix3(e),this.setXY(t,oi.x,oi.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Me.fromBufferAttribute(this,t),Me.applyMatrix3(e),this.setXYZ(t,Me.x,Me.y,Me.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Me.fromBufferAttribute(this,t),Me.applyMatrix4(e),this.setXYZ(t,Me.x,Me.y,Me.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Me.fromBufferAttribute(this,t),Me.applyNormalMatrix(e),this.setXYZ(t,Me.x,Me.y,Me.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Me.fromBufferAttribute(this,t),Me.transformDirection(e),this.setXYZ(t,Me.x,Me.y,Me.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=an(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Le(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=an(t,this.array)),t}setX(e,t){return this.normalized&&(t=Le(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=an(t,this.array)),t}setY(e,t){return this.normalized&&(t=Le(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=an(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Le(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=an(t,this.array)),t}setW(e,t){return this.normalized&&(t=Le(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Le(t,this.array),n=Le(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Le(t,this.array),n=Le(n,this.array),i=Le(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Le(t,this.array),n=Le(n,this.array),i=Le(i,this.array),r=Le(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==jr&&(e.usage=this.usage),e}};var Ii=class extends Ze{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Pi=class extends Ze{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var J=class extends Ze{constructor(e,t,n){super(new Float32Array(e),t,n)}},za=0,je=new se,Pr=new lt,sn=new M,Ve=new xe,bn=new xe,Te=new M,ge=class u extends zt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:za++}),this.uuid=qt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ys(e)?Pi:Ii)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new K().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return je.makeRotationFromQuaternion(e),this.applyMatrix4(je),this}rotateX(e){return je.makeRotationX(e),this.applyMatrix4(je),this}rotateY(e){return je.makeRotationY(e),this.applyMatrix4(je),this}rotateZ(e){return je.makeRotationZ(e),this.applyMatrix4(je),this}translate(e,t,n){return je.makeTranslation(e,t,n),this.applyMatrix4(je),this}scale(e,t,n){return je.makeScale(e,t,n),this.applyMatrix4(je),this}lookAt(e){return Pr.lookAt(e),Pr.updateMatrix(),this.applyMatrix4(Pr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(sn).negate(),this.translate(sn.x,sn.y,sn.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new J(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xe);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),void this.boundingBox.set(new M(-1/0,-1/0,-1/0),new M(1/0,1/0,1/0));if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];Ve.setFromBufferAttribute(r),this.morphTargetsRelative?(Te.addVectors(this.boundingBox.min,Ve.min),this.boundingBox.expandByPoint(Te),Te.addVectors(this.boundingBox.max,Ve.max),this.boundingBox.expandByPoint(Te)):(this.boundingBox.expandByPoint(Ve.min),this.boundingBox.expandByPoint(Ve.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new nt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)return console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),void this.boundingSphere.set(new M,1/0);if(e){let n=this.boundingSphere.center;if(Ve.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let s=t[r];bn.setFromBufferAttribute(s),this.morphTargetsRelative?(Te.addVectors(Ve.min,bn.min),Ve.expandByPoint(Te),Te.addVectors(Ve.max,bn.max),Ve.expandByPoint(Te)):(Ve.expandByPoint(bn.min),Ve.expandByPoint(bn.max))}Ve.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)Te.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Te));if(t)for(let r=0,a=t.length;r<a;r++){let s=t[r],o=this.morphTargetsRelative;for(let h=0,d=s.count;h<d;h++)Te.fromBufferAttribute(s,h),o&&(sn.fromBufferAttribute(e,h),Te.add(sn)),i=Math.max(i,n.distanceToSquared(Te))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");let n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ze(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),s=[],o=[];for(let F=0;F<n.count;F++)s[F]=new M,o[F]=new M;let h=new M,d=new M,m=new M,f=new B,p=new B,_=new B,x=new M,T=new M;function c(F,X,N){h.fromBufferAttribute(n,F),d.fromBufferAttribute(n,X),m.fromBufferAttribute(n,N),f.fromBufferAttribute(r,F),p.fromBufferAttribute(r,X),_.fromBufferAttribute(r,N),d.sub(h),m.sub(h),p.sub(f),_.sub(f);let q=1/(p.x*_.y-_.x*p.y);isFinite(q)&&(x.copy(d).multiplyScalar(_.y).addScaledVector(m,-p.y).multiplyScalar(q),T.copy(m).multiplyScalar(p.x).addScaledVector(d,-_.x).multiplyScalar(q),s[F].add(x),s[X].add(x),s[N].add(x),o[F].add(T),o[X].add(T),o[N].add(T))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let F=0,X=w.length;F<X;++F){let N=w[F],q=N.start;for(let O=q,Q=q+N.count;O<Q;O+=3)c(e.getX(O+0),e.getX(O+1),e.getX(O+2))}let y=new M,C=new M,R=new M,E=new M;function D(F){R.fromBufferAttribute(i,F),E.copy(R);let X=s[F];y.copy(X),y.sub(R.multiplyScalar(R.dot(X))).normalize(),C.crossVectors(E,X);let N=C.dot(o[F])<0?-1:1;a.setXYZW(F,y.x,y.y,y.z,N)}for(let F=0,X=w.length;F<X;++F){let N=w[F],q=N.start;for(let O=q,Q=q+N.count;O<Q;O+=3)D(e.getX(O+0)),D(e.getX(O+1)),D(e.getX(O+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ze(new Float32Array(3*t.count),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let i=new M,r=new M,a=new M,s=new M,o=new M,h=new M,d=new M,m=new M;if(e)for(let f=0,p=e.count;f<p;f+=3){let _=e.getX(f+0),x=e.getX(f+1),T=e.getX(f+2);i.fromBufferAttribute(t,_),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,T),d.subVectors(a,r),m.subVectors(i,r),d.cross(m),s.fromBufferAttribute(n,_),o.fromBufferAttribute(n,x),h.fromBufferAttribute(n,T),s.add(d),o.add(d),h.add(d),n.setXYZ(_,s.x,s.y,s.z),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(T,h.x,h.y,h.z)}else for(let f=0,p=t.count;f<p;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),d.subVectors(a,r),m.subVectors(i,r),d.cross(m),n.setXYZ(f+0,d.x,d.y,d.z),n.setXYZ(f+1,d.x,d.y,d.z),n.setXYZ(f+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Te.fromBufferAttribute(e,t),Te.normalize(),e.setXYZ(t,Te.x,Te.y,Te.z)}toNonIndexed(){function e(s,o){let h=s.array,d=s.itemSize,m=s.normalized,f=new h.constructor(o.length*d),p=0,_=0;for(let x=0,T=o.length;x<T;x++){p=s.isInterleavedBufferAttribute?o[x]*s.data.stride+s.offset:o[x]*d;for(let c=0;c<d;c++)f[_++]=h[p++]}return new Ze(f,d,m)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new u,n=this.index.array,i=this.attributes;for(let s in i){let o=e(i[s],n);t.setAttribute(s,o)}let r=this.morphAttributes;for(let s in r){let o=[],h=r[s];for(let d=0,m=h.length;d<m;d++){let f=e(h[d],n);o.push(f)}t.morphAttributes[s]=o}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let s=0,o=a.length;s<o;s++){let h=a[s];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let o=this.parameters;for(let h in o)o[h]!==void 0&&(e[h]=o[h]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let o in n){let h=n[o];e.data.attributes[o]=h.toJSON(e.data)}let i={},r=!1;for(let o in this.morphAttributes){let h=this.morphAttributes[o],d=[];for(let m=0,f=h.length;m<f;m++){let p=h[m];d.push(p.toJSON(e.data))}d.length>0&&(i[o]=d,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let s=this.boundingSphere;return s!==null&&(e.data.boundingSphere=s.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let h in i){let d=i[h];this.setAttribute(h,d.clone(t))}let r=e.morphAttributes;for(let h in r){let d=[],m=r[h];for(let f=0,p=m.length;f<p;f++)d.push(m[f].clone(t));this.morphAttributes[h]=d}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let h=0,d=a.length;h<d;h++){let m=a[h];this.addGroup(m.start,m.count,m.materialIndex)}let s=e.boundingBox;s!==null&&(this.boundingBox=s.clone());let o=e.boundingSphere;return o!==null&&(this.boundingSphere=o.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ns=new se,Ot=new At,li=new nt,Fs=new M,ci=new M,hi=new M,ui=new M,Lr=new M,di=new M,Os=new M,pi=new M,Ct=class extends lt{constructor(e=new ge,t=new cn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++){let a=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=i}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let s=this.morphTargetInfluences;if(r&&s){di.set(0,0,0);for(let o=0,h=r.length;o<h;o++){let d=s[o],m=r[o];d!==0&&(Lr.fromBufferAttribute(m,e),a?di.addScaledVector(Lr,d):di.addScaledVector(Lr.sub(t),d))}t.add(di)}return t}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;if(i!==void 0){if(n.boundingSphere===null&&n.computeBoundingSphere(),li.copy(n.boundingSphere),li.applyMatrix4(r),Ot.copy(e.ray).recast(e.near),li.containsPoint(Ot.origin)===!1&&(Ot.intersectSphere(li,Fs)===null||Ot.origin.distanceToSquared(Fs)>(e.far-e.near)**2))return;Ns.copy(r).invert(),Ot.copy(e.ray).applyMatrix4(Ns),n.boundingBox!==null&&Ot.intersectsBox(n.boundingBox)===!1||this._computeIntersections(e,t,Ot)}}_computeIntersections(e,t,n){let i,r=this.geometry,a=this.material,s=r.index,o=r.attributes.position,h=r.attributes.uv,d=r.attributes.uv1,m=r.attributes.normal,f=r.groups,p=r.drawRange;if(s!==null)if(Array.isArray(a))for(let _=0,x=f.length;_<x;_++){let T=f[_],c=a[T.materialIndex];for(let w=Math.max(T.start,p.start),y=Math.min(s.count,Math.min(T.start+T.count,p.start+p.count));w<y;w+=3)i=mi(this,c,e,n,h,d,m,s.getX(w),s.getX(w+1),s.getX(w+2)),i&&(i.faceIndex=Math.floor(w/3),i.face.materialIndex=T.materialIndex,t.push(i))}else for(let _=Math.max(0,p.start),x=Math.min(s.count,p.start+p.count);_<x;_+=3)i=mi(this,a,e,n,h,d,m,s.getX(_),s.getX(_+1),s.getX(_+2)),i&&(i.faceIndex=Math.floor(_/3),t.push(i));else if(o!==void 0)if(Array.isArray(a))for(let _=0,x=f.length;_<x;_++){let T=f[_],c=a[T.materialIndex];for(let w=Math.max(T.start,p.start),y=Math.min(o.count,Math.min(T.start+T.count,p.start+p.count));w<y;w+=3)i=mi(this,c,e,n,h,d,m,w,w+1,w+2),i&&(i.faceIndex=Math.floor(w/3),i.face.materialIndex=T.materialIndex,t.push(i))}else for(let _=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);_<x;_+=3)i=mi(this,a,e,n,h,d,m,_,_+1,_+2),i&&(i.faceIndex=Math.floor(_/3),t.push(i))}};function mi(u,e,t,n,i,r,a,s,o,h){u.getVertexPosition(s,ci),u.getVertexPosition(o,hi),u.getVertexPosition(h,ui);let d=(function(m,f,p,_,x,T,c,w){let y;if(y=f.side===1?_.intersectTriangle(c,T,x,!0,w):_.intersectTriangle(x,T,c,f.side===0,w),y===null)return null;pi.copy(w),pi.applyMatrix4(m.matrixWorld);let C=p.ray.origin.distanceTo(pi);return C<p.near||C>p.far?null:{distance:C,point:pi.clone(),object:m}})(u,e,t,n,ci,hi,ui,Os);if(d){let m=new M;et.getBarycoord(Os,ci,hi,ui,m),i&&(d.uv=et.getInterpolatedAttribute(i,s,o,h,m,new B)),r&&(d.uv1=et.getInterpolatedAttribute(r,s,o,h,m,new B)),a&&(d.normal=et.getInterpolatedAttribute(a,s,o,h,m,new M),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let f={a:s,b:o,c:h,normal:new M,materialIndex:0};et.getNormal(ci,hi,ui,f.normal),d.face=f,d.barycoord=m}return d}var Li=class u extends ge{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};let s=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);let o=[],h=[],d=[],m=[],f=0,p=0;function _(x,T,c,w,y,C,R,E,D,F,X){let N=C/D,q=R/F,O=C/2,Q=R/2,oe=E/2,de=D+1,ce=F+1,Ue=0,we=0,ve=new M;for(let ne=0;ne<ce;ne++){let pe=ne*q-Q;for(let Ne=0;Ne<de;Ne++){let Oe=Ne*N-O;ve[x]=Oe*w,ve[T]=pe*y,ve[c]=oe,h.push(ve.x,ve.y,ve.z),ve[x]=0,ve[T]=0,ve[c]=E>0?1:-1,d.push(ve.x,ve.y,ve.z),m.push(Ne/D),m.push(1-ne/F),Ue+=1}}for(let ne=0;ne<F;ne++)for(let pe=0;pe<D;pe++){let Ne=f+pe+de*ne,Oe=f+pe+de*(ne+1),be=f+(pe+1)+de*(ne+1),Lt=f+(pe+1)+de*ne;o.push(Ne,Oe,Lt),o.push(Oe,be,Lt),we+=6}s.addGroup(p,we,X),p+=we,f+=Ue}_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,i,a,2),_("x","z","y",1,-1,e,n,-t,i,a,3),_("x","y","z",1,-1,e,t,n,i,r,4),_("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(o),this.setAttribute("position",new J(h,3)),this.setAttribute("normal",new J(d,3)),this.setAttribute("uv",new J(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Js(u){let e={};for(let t in u){e[t]={};for(let n in u[t]){let i=u[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function De(u){let e={};for(let t=0;t<u.length;t++){let n=Js(u[t]);for(let i in n)e[i]=n[i]}return e}var Un=class extends lt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=ln,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},go=new M,vo=new B,_o=new B;var Di=class extends Ye{constructor(e=[],t=301,n,i,r,a,s,o,h,d){super(e,t,n,i,r,a,s,o,h,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Vt=class extends lt{constructor(){super(),this.isGroup=!0,this.type="Group"}};var yo=new M;var xo=new M,Mo=new M,So=new M,bo=new B,To=new B,wo=new se,Eo=new M,Ao=new M,Co=new M,Ro=new B,Io=new B,Po=new B;var Lo=new M,Do=new M;var Uo=new M,No=new Et,Fo=new Et,Oo=new M,Bo=new se,ko=new M,zo=new nt,Vo=new se,Go=new At;var Ho=new se,Wo=new se;var Xo=new se,jo=new se;var qo=new xe,Yo=new se,Zo=new Ct,Jo=new nt;var Dr=new M,Va=new M,Ga=new K,gt=class{constructor(e=new M(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Dr.subVectors(n,t).cross(Va.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Dr),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ga.getNormalMatrix(e),i=this.coplanarPoint(Dr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Bt=new nt,Ha=new B(.5,.5),fi=new M,Nn=class{constructor(e=new gt,t=new gt,n=new gt,i=new gt,r=new gt,a=new gt){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){let s=this.planes;return s[0].copy(e),s[1].copy(t),s[2].copy(n),s[3].copy(i),s[4].copy(r),s[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2e3,n=!1){let i=this.planes,r=e.elements,a=r[0],s=r[1],o=r[2],h=r[3],d=r[4],m=r[5],f=r[6],p=r[7],_=r[8],x=r[9],T=r[10],c=r[11],w=r[12],y=r[13],C=r[14],R=r[15];if(i[0].setComponents(h-a,p-d,c-_,R-w).normalize(),i[1].setComponents(h+a,p+d,c+_,R+w).normalize(),i[2].setComponents(h+s,p+m,c+x,R+y).normalize(),i[3].setComponents(h-s,p-m,c-x,R-y).normalize(),n)i[4].setComponents(o,f,T,C).normalize(),i[5].setComponents(h-o,p-f,c-T,R-C).normalize();else if(i[4].setComponents(h-o,p-f,c-T,R-C).normalize(),t===ln)i[5].setComponents(h+o,p+f,c+T,R+C).normalize();else{if(t!==Ei)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);i[5].setComponents(o,f,T,C).normalize()}return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bt.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bt.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bt)}intersectsSprite(e){Bt.center.set(0,0,0);let t=Ha.distanceTo(e.center);return Bt.radius=.7071067811865476+t,Bt.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bt)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(fi.x=i.normal.x>0?e.max.x:e.min.x,fi.y=i.normal.y>0?e.max.y:e.min.y,fi.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(fi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},st=new se,at=new Nn,Ui=class u{constructor(){this.coordinateSystem=ln}intersectsObject(e,t){if(!t.isArrayCamera||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(st.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),at.setFromProjectionMatrix(st,i.coordinateSystem,i.reversedDepth),at.intersectsObject(e))return!0}return!1}intersectsSprite(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(st.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),at.setFromProjectionMatrix(st,i.coordinateSystem,i.reversedDepth),at.intersectsSprite(e))return!0}return!1}intersectsSphere(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(st.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),at.setFromProjectionMatrix(st,i.coordinateSystem,i.reversedDepth),at.intersectsSphere(e))return!0}return!1}intersectsBox(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(st.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),at.setFromProjectionMatrix(st,i.coordinateSystem,i.reversedDepth),at.intersectsBox(e))return!0}return!1}containsPoint(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(st.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),at.setFromProjectionMatrix(st,i.coordinateSystem,i.reversedDepth),at.containsPoint(e))return!0}return!1}clone(){return new u}};var $r=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,i){let r=this.pool,a=this.list;this.index>=r.length&&r.push({start:-1,count:-1,z:-1,index:-1});let s=r[this.index];a.push(s),this.index++,s.start=e,s.count=t,s.z=n,s.index=i}reset(){this.list.length=0,this.index=0}},Ko=new se,$o=new le(1,1,1),Qo=new Nn,el=new Ui,tl=new xe,nl=new nt,il=new M,rl=new M,sl=new M,al=new $r,ol=new Ct;var ll=new M,cl=new M,hl=new se,ul=new At,dl=new nt,pl=new M,ml=new M;var fl=new M,gl=new M;var vl=new se,_l=new At,yl=new nt,xl=new M;var Fn=class extends Ye{constructor(e,t,n,i,r,a,s,o,h){super(e,t,n,i,r,a,s,o,h),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ni=class extends Ye{constructor(e,t,n=1014,i,r,a,s=1003,o=1003,h,d=1026,m=1){if(d!==qs&&d!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:m},i,r,a,s,o,d,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Pn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}};var Fi=class u extends ge{constructor(e=1,t=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));let a=[],s=[],o=[],h=[],d=t/2,m=Math.PI/2*e,f=t,p=2*m+f,_=2*n+r,x=i+1,T=new M,c=new M;for(let w=0;w<=_;w++){let y=0,C=0,R=0,E=0;if(w<=n){let X=w/n,N=X*Math.PI/2;C=-d-e*Math.cos(N),R=e*Math.sin(N),E=-e*Math.cos(N),y=X*m}else if(w<=n+r){let X=(w-n)/r;C=X*t-d,R=e,E=0,y=m+X*f}else{let X=(w-n-r)/n,N=X*Math.PI/2;C=d+e*Math.sin(N),R=e*Math.cos(N),E=e*Math.sin(N),y=m+f+X*m}let D=Math.max(0,Math.min(1,y/p)),F=0;w===0?F=.5/i:w===_&&(F=-.5/i);for(let X=0;X<=i;X++){let N=X/i,q=N*Math.PI*2,O=Math.sin(q),Q=Math.cos(q);c.x=-R*Q,c.y=C,c.z=R*O,s.push(c.x,c.y,c.z),T.set(-R*Q,E,R*O),T.normalize(),o.push(T.x,T.y,T.z),h.push(N+F,D)}if(w>0){let X=(w-1)*x;for(let N=0;N<i;N++){let q=X+N,O=X+N+1,Q=w*x+N,oe=w*x+N+1;a.push(q,O,Q),a.push(O,oe,Q)}}}this.setIndex(a),this.setAttribute("position",new J(s,3)),this.setAttribute("normal",new J(o,3)),this.setAttribute("uv",new J(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},Oi=class u extends ge{constructor(e=1,t=32,n=0,i=2*Math.PI){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],a=[],s=[],o=[],h=new M,d=new B;a.push(0,0,0),s.push(0,0,1),o.push(.5,.5);for(let m=0,f=3;m<=t;m++,f+=3){let p=n+m/t*i;h.x=e*Math.cos(p),h.y=e*Math.sin(p),a.push(h.x,h.y,h.z),s.push(0,0,1),d.x=(a[f]/e+1)/2,d.y=(a[f+1]/e+1)/2,o.push(d.x,d.y)}for(let m=1;m<=t;m++)r.push(m,m+1,0);this.setIndex(r),this.setAttribute("position",new J(a,3)),this.setAttribute("normal",new J(s,3)),this.setAttribute("uv",new J(o,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Pe=class u extends ge{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,s=0,o=2*Math.PI){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:s,thetaLength:o};let h=this;i=Math.floor(i),r=Math.floor(r);let d=[],m=[],f=[],p=[],_=0,x=[],T=n/2,c=0;function w(y){let C=_,R=new B,E=new M,D=0,F=y===!0?e:t,X=y===!0?1:-1;for(let q=1;q<=i;q++)m.push(0,T*X,0),f.push(0,X,0),p.push(.5,.5),_++;let N=_;for(let q=0;q<=i;q++){let O=q/i*o+s,Q=Math.cos(O),oe=Math.sin(O);E.x=F*oe,E.y=T*X,E.z=F*Q,m.push(E.x,E.y,E.z),f.push(0,X,0),R.x=.5*Q+.5,R.y=.5*oe*X+.5,p.push(R.x,R.y),_++}for(let q=0;q<i;q++){let O=C+q,Q=N+q;y===!0?d.push(Q,Q+1,O):d.push(Q+1,Q,O),D+=3}h.addGroup(c,D,y===!0?1:2),c+=D}(function(){let y=new M,C=new M,R=0,E=(t-e)/n;for(let D=0;D<=r;D++){let F=[],X=D/r,N=X*(t-e)+e;for(let q=0;q<=i;q++){let O=q/i,Q=O*o+s,oe=Math.sin(Q),de=Math.cos(Q);C.x=N*oe,C.y=-X*n+T,C.z=N*de,m.push(C.x,C.y,C.z),y.set(oe,E,de).normalize(),f.push(y.x,y.y,y.z),p.push(O,1-X),F.push(_++)}x.push(F)}for(let D=0;D<i;D++)for(let F=0;F<r;F++){let X=x[F][D],N=x[F+1][D],q=x[F+1][D+1],O=x[F][D+1];(e>0||F!==0)&&(d.push(X,N,O),R+=3),(t>0||F!==r-1)&&(d.push(N,q,O),R+=3)}h.addGroup(c,R,0),c+=R})(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(d),this.setAttribute("position",new J(m,3)),this.setAttribute("normal",new J(f,3)),this.setAttribute("uv",new J(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Bi=class u extends Pe{constructor(e=1,t=1,n=32,i=1,r=!1,a=0,s=2*Math.PI){super(0,e,t,n,i,r,a,s),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:s}}static fromJSON(e){return new u(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Rt=class u extends ge{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],a=[];function s(p,_,x,T){let c=T+1,w=[];for(let y=0;y<=c;y++){w[y]=[];let C=p.clone().lerp(x,y/c),R=_.clone().lerp(x,y/c),E=c-y;for(let D=0;D<=E;D++)w[y][D]=D===0&&y===c?C:C.clone().lerp(R,D/E)}for(let y=0;y<c;y++)for(let C=0;C<2*(c-y)-1;C++){let R=Math.floor(C/2);C%2==0?(o(w[y][R+1]),o(w[y+1][R]),o(w[y][R])):(o(w[y][R+1]),o(w[y+1][R+1]),o(w[y+1][R]))}}function o(p){r.push(p.x,p.y,p.z)}function h(p,_){let x=3*p;_.x=e[x+0],_.y=e[x+1],_.z=e[x+2]}function d(p,_,x,T){T<0&&p.x===1&&(a[_]=p.x-1),x.x===0&&x.z===0&&(a[_]=T/2/Math.PI+.5)}function m(p){return Math.atan2(p.z,-p.x)}function f(p){return Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))}(function(p){let _=new M,x=new M,T=new M;for(let c=0;c<t.length;c+=3)h(t[c+0],_),h(t[c+1],x),h(t[c+2],T),s(_,x,T,p)})(i),(function(p){let _=new M;for(let x=0;x<r.length;x+=3)_.x=r[x+0],_.y=r[x+1],_.z=r[x+2],_.normalize().multiplyScalar(p),r[x+0]=_.x,r[x+1]=_.y,r[x+2]=_.z})(n),(function(){let p=new M;for(let _=0;_<r.length;_+=3){p.x=r[_+0],p.y=r[_+1],p.z=r[_+2];let x=m(p)/2/Math.PI+.5,T=f(p)/Math.PI+.5;a.push(x,1-T)}(function(){let _=new M,x=new M,T=new M,c=new M,w=new B,y=new B,C=new B;for(let R=0,E=0;R<r.length;R+=9,E+=6){_.set(r[R+0],r[R+1],r[R+2]),x.set(r[R+3],r[R+4],r[R+5]),T.set(r[R+6],r[R+7],r[R+8]),w.set(a[E+0],a[E+1]),y.set(a[E+2],a[E+3]),C.set(a[E+4],a[E+5]),c.copy(_).add(x).add(T).divideScalar(3);let D=m(c);d(w,E+0,_,D),d(y,E+2,x,D),d(C,E+4,T,D)}})(),(function(){for(let _=0;_<a.length;_+=6){let x=a[_+0],T=a[_+2],c=a[_+4],w=Math.max(x,T,c),y=Math.min(x,T,c);w>.9&&y<.1&&(x<.2&&(a[_+0]+=1),T<.2&&(a[_+2]+=1),c<.2&&(a[_+4]+=1))}})()})(),this.setAttribute("position",new J(r,3)),this.setAttribute("normal",new J(r.slice(),3)),this.setAttribute("uv",new J(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.vertices,e.indices,e.radius,e.details)}},ki=class u extends Rt{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n;super([-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new u(e.radius,e.detail)}},gi=new M,vi=new M,Ur=new M,_i=new et,zi=class extends ge{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let i=Math.pow(10,4),r=Math.cos(qr*t),a=e.getIndex(),s=e.getAttribute("position"),o=a?a.count:s.count,h=[0,0,0],d=["a","b","c"],m=new Array(3),f={},p=[];for(let _=0;_<o;_+=3){a?(h[0]=a.getX(_),h[1]=a.getX(_+1),h[2]=a.getX(_+2)):(h[0]=_,h[1]=_+1,h[2]=_+2);let{a:x,b:T,c}=_i;if(x.fromBufferAttribute(s,h[0]),T.fromBufferAttribute(s,h[1]),c.fromBufferAttribute(s,h[2]),_i.getNormal(Ur),m[0]=`${Math.round(x.x*i)},${Math.round(x.y*i)},${Math.round(x.z*i)}`,m[1]=`${Math.round(T.x*i)},${Math.round(T.y*i)},${Math.round(T.z*i)}`,m[2]=`${Math.round(c.x*i)},${Math.round(c.y*i)},${Math.round(c.z*i)}`,m[0]!==m[1]&&m[1]!==m[2]&&m[2]!==m[0])for(let w=0;w<3;w++){let y=(w+1)%3,C=m[w],R=m[y],E=_i[d[w]],D=_i[d[y]],F=`${C}_${R}`,X=`${R}_${C}`;X in f&&f[X]?(Ur.dot(f[X].normal)<=r&&(p.push(E.x,E.y,E.z),p.push(D.x,D.y,D.z)),f[X]=null):F in f||(f[F]={index0:h[w],index1:h[y],normal:Ur.clone()})}}for(let _ in f)if(f[_]){let{index0:x,index1:T}=f[_];gi.fromBufferAttribute(s,x),vi.fromBufferAttribute(s,T),p.push(gi.x,gi.y,gi.z),p.push(vi.x,vi.y,vi.z)}this.setAttribute("position",new J(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},He=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,a;a=t||e*n[r-1];let s,o=0,h=r-1;for(;o<=h;)if(i=Math.floor(o+(h-o)/2),s=n[i]-a,s<0)o=i+1;else{if(!(s>0)){h=i;break}h=i-1}if(i=h,n[i]===a)return i/(r-1);let d=n[i];return(i+(a-d)/(n[i+1]-d))/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let a=this.getPoint(i),s=this.getPoint(r),o=t||(a.isVector2?new B:new M);return o.copy(s).sub(a).normalize(),o}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new M,i=[],r=[],a=[],s=new M,o=new se;for(let p=0;p<=e;p++){let _=p/e;i[p]=this.getTangentAt(_,new M)}r[0]=new M,a[0]=new M;let h=Number.MAX_VALUE,d=Math.abs(i[0].x),m=Math.abs(i[0].y),f=Math.abs(i[0].z);d<=h&&(h=d,n.set(1,0,0)),m<=h&&(h=m,n.set(0,1,0)),f<=h&&n.set(0,0,1),s.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],s),a[0].crossVectors(i[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),s.crossVectors(i[p-1],i[p]),s.length()>Number.EPSILON){s.normalize();let _=Math.acos(te(i[p-1].dot(i[p]),-1,1));r[p].applyMatrix4(o.makeRotationAxis(s,_))}a[p].crossVectors(i[p],r[p])}if(t===!0){let p=Math.acos(te(r[0].dot(r[e]),-1,1));p/=e,i[0].dot(s.crossVectors(r[0],r[e]))>0&&(p=-p);for(let _=1;_<=e;_++)r[_].applyMatrix4(o.makeRotationAxis(i[_],p*_)),a[_].crossVectors(i[_],r[_])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},hn=class extends He{constructor(e=0,t=0,n=1,i=1,r=0,a=2*Math.PI,s=!1,o=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=s,this.aRotation=o}getPoint(e,t=new B){let n=t,i=2*Math.PI,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(r=a?0:i),this.aClockwise!==!0||a||(r===i?r=-i:r-=i);let s=this.aStartAngle+e*r,o=this.aX+this.xRadius*Math.cos(s),h=this.aY+this.yRadius*Math.sin(s);if(this.aRotation!==0){let d=Math.cos(this.aRotation),m=Math.sin(this.aRotation),f=o-this.aX,p=h-this.aY;o=f*d-p*m+this.aX,h=f*m+p*d+this.aY}return n.set(o,h)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Vi=class extends hn{constructor(e,t,n,i,r,a){super(e,t,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function ds(){let u=0,e=0,t=0,n=0;function i(r,a,s,o){u=r,e=s,t=-3*r+3*a-2*s-o,n=2*r-2*a+s+o}return{initCatmullRom:function(r,a,s,o,h){i(a,s,h*(s-r),h*(o-a))},initNonuniformCatmullRom:function(r,a,s,o,h,d,m){let f=(a-r)/h-(s-r)/(h+d)+(s-a)/d,p=(s-a)/d-(o-a)/(d+m)+(o-s)/m;f*=d,p*=d,i(a,s,f,p)},calc:function(r){let a=r*r;return u+e*r+t*a+n*(a*r)}}}var yi=new M,Nr=new ds,Fr=new ds,Or=new ds,Gi=class extends He{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new M){let n=t,i=this.points,r=i.length,a=(r-(this.closed?0:1))*e,s,o,h=Math.floor(a),d=a-h;this.closed?h+=h>0?0:(Math.floor(Math.abs(h)/r)+1)*r:d===0&&h===r-1&&(h=r-2,d=1),this.closed||h>0?s=i[(h-1)%r]:(yi.subVectors(i[0],i[1]).add(i[0]),s=yi);let m=i[h%r],f=i[(h+1)%r];if(this.closed||h+2<r?o=i[(h+2)%r]:(yi.subVectors(i[r-1],i[r-2]).add(i[r-1]),o=yi),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,_=Math.pow(s.distanceToSquared(m),p),x=Math.pow(m.distanceToSquared(f),p),T=Math.pow(f.distanceToSquared(o),p);x<1e-4&&(x=1),_<1e-4&&(_=x),T<1e-4&&(T=x),Nr.initNonuniformCatmullRom(s.x,m.x,f.x,o.x,_,x,T),Fr.initNonuniformCatmullRom(s.y,m.y,f.y,o.y,_,x,T),Or.initNonuniformCatmullRom(s.z,m.z,f.z,o.z,_,x,T)}else this.curveType==="catmullrom"&&(Nr.initCatmullRom(s.x,m.x,f.x,o.x,this.tension),Fr.initCatmullRom(s.y,m.y,f.y,o.y,this.tension),Or.initCatmullRom(s.z,m.z,f.z,o.z,this.tension));return n.set(Nr.calc(d),Fr.calc(d),Or.calc(d)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new M().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Bs(u,e,t,n,i){let r=.5*(n-e),a=.5*(i-t),s=u*u;return(2*t-2*n+r+a)*(u*s)+(-3*t+3*n-2*r-a)*s+r*u+t}function En(u,e,t,n){return(function(i,r){let a=1-i;return a*a*r})(u,e)+(function(i,r){return 2*(1-i)*i*r})(u,t)+(function(i,r){return i*i*r})(u,n)}function An(u,e,t,n,i){return(function(r,a){let s=1-r;return s*s*s*a})(u,e)+(function(r,a){let s=1-r;return 3*s*s*r*a})(u,t)+(function(r,a){return 3*(1-r)*r*r*a})(u,n)+(function(r,a){return r*r*r*a})(u,i)}var On=class extends He{constructor(e=new B,t=new B,n=new B,i=new B){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new B){let n=t,i=this.v0,r=this.v1,a=this.v2,s=this.v3;return n.set(An(e,i.x,r.x,a.x,s.x),An(e,i.y,r.y,a.y,s.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Hi=class extends He{constructor(e=new M,t=new M,n=new M,i=new M){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new M){let n=t,i=this.v0,r=this.v1,a=this.v2,s=this.v3;return n.set(An(e,i.x,r.x,a.x,s.x),An(e,i.y,r.y,a.y,s.y),An(e,i.z,r.z,a.z,s.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Bn=class extends He{constructor(e=new B,t=new B){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Wi=class extends He{constructor(e=new M,t=new M){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new M){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new M){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},kn=class extends He{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(En(e,i.x,r.x,a.x),En(e,i.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},zn=class extends He{constructor(e=new M,t=new M,n=new M){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new M){let n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(En(e,i.x,r.x,a.x),En(e,i.y,r.y,a.y),En(e,i.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vn=class extends He{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new B){let n=t,i=this.points,r=(i.length-1)*e,a=Math.floor(r),s=r-a,o=i[a===0?a:a-1],h=i[a],d=i[a>i.length-2?i.length-1:a+1],m=i[a>i.length-3?i.length-1:a+2];return n.set(Bs(s,o.x,h.x,d.x,m.x),Bs(s,o.y,h.y,d.y,m.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new B().fromArray(i))}return this}},Xi=Object.freeze({__proto__:null,ArcCurve:Vi,CatmullRomCurve3:Gi,CubicBezierCurve:On,CubicBezierCurve3:Hi,EllipseCurve:hn,LineCurve:Bn,LineCurve3:Wi,QuadraticBezierCurve:kn,QuadraticBezierCurve3:zn,SplineCurve:Vn}),ji=class extends He{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Xi[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let a=i[r]-n,s=this.curves[r],o=s.getLength(),h=o===0?0:1-a/o;return s.getPointAt(h,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let a=r[i],s=a.isEllipseCurve?2*e:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,o=a.getPoints(s);for(let h=0;h<o.length;h++){let d=o[h];n&&n.equals(d)||(t.push(d),n=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Xi[i.type]().fromJSON(i))}return this}},Gn=class extends ji{constructor(e){super(),this.type="Path",this.currentPoint=new B,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Bn(this.currentPoint.clone(),new B(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new kn(this.currentPoint.clone(),new B(e,t),new B(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,a){let s=new On(this.currentPoint.clone(),new B(e,t),new B(n,i),new B(r,a));return this.curves.push(s),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Vn(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,a){let s=this.currentPoint.x,o=this.currentPoint.y;return this.absarc(e+s,t+o,n,i,r,a),this}absarc(e,t,n,i,r,a){return this.absellipse(e,t,n,n,i,r,a),this}ellipse(e,t,n,i,r,a,s,o){let h=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+h,t+d,n,i,r,a,s,o),this}absellipse(e,t,n,i,r,a,s,o){let h=new hn(e,t,n,i,r,a,s,o);if(this.curves.length>0){let m=h.getPoint(0);m.equals(this.currentPoint)||this.lineTo(m.x,m.y)}this.curves.push(h);let d=h.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Gt=class extends Gn{constructor(e){super(e),this.uuid=qt(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Gn().fromJSON(i))}return this}};function Wa(u,e,t=2){let n=e&&e.length,i=n?e[0]*t:u.length,r=ks(u,0,i,t,!0),a=[];if(!r||r.next===r.prev)return a;let s,o,h;if(n&&(r=(function(d,m,f,p){let _=[];for(let x=0,T=m.length;x<T;x++){let c=ks(d,m[x]*p,x<T-1?m[x+1]*p:d.length,p,!1);c===c.next&&(c.steiner=!0),_.push($a(c))}_.sort(Za);for(let x=0;x<_.length;x++)f=Ja(_[x],f);return f})(u,e,r,t)),u.length>80*t){s=1/0,o=1/0;let d=-1/0,m=-1/0;for(let f=t;f<i;f+=t){let p=u[f],_=u[f+1];p<s&&(s=p),_<o&&(o=_),p>d&&(d=p),_>m&&(m=_)}h=Math.max(d-s,m-o),h=h!==0?32767/h:0}return Hn(r,a,t,s,o,h,0),a}function ks(u,e,t,n,i){let r;if(i===(function(a,s,o,h){let d=0;for(let m=s,f=o-h;m<o;m+=h)d+=(a[f]-a[m])*(a[m+1]+a[f+1]),f=m;return d})(u,e,t,n)>0)for(let a=e;a<t;a+=n)r=zs(a/n|0,u[a],u[a+1],r);else for(let a=t-n;a>=e;a-=n)r=zs(a/n|0,u[a],u[a+1],r);return r&&un(r,r.next)&&(Xn(r),r=r.next),r}function Ht(u,e){if(!u)return u;e||(e=u);let t,n=u;do if(t=!1,n.steiner||!un(n,n.next)&&ye(n.prev,n,n.next)!==0)n=n.next;else{if(Xn(n),n=e=n.prev,n===n.next)break;t=!0}while(t||n!==e);return e}function Hn(u,e,t,n,i,r,a){if(!u)return;!a&&r&&(function(o,h,d,m){let f=o;do f.z===0&&(f.z=Qr(f.x,f.y,h,d,m)),f.prevZ=f.prev,f.nextZ=f.next,f=f.next;while(f!==o);f.prevZ.nextZ=null,f.prevZ=null,(function(p){let _,x=1;do{let T,c=p;p=null;let w=null;for(_=0;c;){_++;let y=c,C=0;for(let E=0;E<x&&(C++,y=y.nextZ,y);E++);let R=x;for(;C>0||R>0&&y;)C!==0&&(R===0||!y||c.z<=y.z)?(T=c,c=c.nextZ,C--):(T=y,y=y.nextZ,R--),w?w.nextZ=T:p=T,T.prevZ=w,w=T;c=y}w.nextZ=null,x*=2}while(_>1)})(f)})(u,n,i,r);let s=u;for(;u.prev!==u.next;){let o=u.prev,h=u.next;if(r?ja(u,n,i,r):Xa(u))e.push(o.i,u.i,h.i),Xn(u),u=h.next,s=h.next;else if((u=h)===s){a?a===1?Hn(u=qa(Ht(u),e),e,t,n,i,r,2):a===2&&Ya(u,e,t,n,i,r):Hn(Ht(u),e,t,n,i,r,1);break}}}function Xa(u){let e=u.prev,t=u,n=u.next;if(ye(e,t,n)>=0)return!1;let i=e.x,r=t.x,a=n.x,s=e.y,o=t.y,h=n.y,d=Math.min(i,r,a),m=Math.min(s,o,h),f=Math.max(i,r,a),p=Math.max(s,o,h),_=n.next;for(;_!==e;){if(_.x>=d&&_.x<=f&&_.y>=m&&_.y<=p&&Tn(i,s,r,o,a,h,_.x,_.y)&&ye(_.prev,_,_.next)>=0)return!1;_=_.next}return!0}function ja(u,e,t,n){let i=u.prev,r=u,a=u.next;if(ye(i,r,a)>=0)return!1;let s=i.x,o=r.x,h=a.x,d=i.y,m=r.y,f=a.y,p=Math.min(s,o,h),_=Math.min(d,m,f),x=Math.max(s,o,h),T=Math.max(d,m,f),c=Qr(p,_,e,t,n),w=Qr(x,T,e,t,n),y=u.prevZ,C=u.nextZ;for(;y&&y.z>=c&&C&&C.z<=w;){if(y.x>=p&&y.x<=x&&y.y>=_&&y.y<=T&&y!==i&&y!==a&&Tn(s,d,o,m,h,f,y.x,y.y)&&ye(y.prev,y,y.next)>=0||(y=y.prevZ,C.x>=p&&C.x<=x&&C.y>=_&&C.y<=T&&C!==i&&C!==a&&Tn(s,d,o,m,h,f,C.x,C.y)&&ye(C.prev,C,C.next)>=0))return!1;C=C.nextZ}for(;y&&y.z>=c;){if(y.x>=p&&y.x<=x&&y.y>=_&&y.y<=T&&y!==i&&y!==a&&Tn(s,d,o,m,h,f,y.x,y.y)&&ye(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;C&&C.z<=w;){if(C.x>=p&&C.x<=x&&C.y>=_&&C.y<=T&&C!==i&&C!==a&&Tn(s,d,o,m,h,f,C.x,C.y)&&ye(C.prev,C,C.next)>=0)return!1;C=C.nextZ}return!0}function qa(u,e){let t=u;do{let n=t.prev,i=t.next.next;!un(n,i)&&$s(n,t,t.next,i)&&Wn(n,i)&&Wn(i,n)&&(e.push(n.i,t.i,i.i),Xn(t),Xn(t.next),t=u=i),t=t.next}while(t!==u);return Ht(t)}function Ya(u,e,t,n,i,r){let a=u;do{let s=a.next.next;for(;s!==a.prev;){if(a.i!==s.i&&Qa(a,s)){let o=Qs(a,s);return a=Ht(a,a.next),o=Ht(o,o.next),Hn(a,e,t,n,i,r,0),void Hn(o,e,t,n,i,r,0)}s=s.next}a=a.next}while(a!==u)}function Za(u,e){let t=u.x-e.x;return t===0&&(t=u.y-e.y,t===0)&&(t=(u.next.y-u.y)/(u.next.x-u.x)-(e.next.y-e.y)/(e.next.x-e.x)),t}function Ja(u,e){let t=(function(i,r){let a=r,s=i.x,o=i.y,h,d=-1/0;if(un(i,a))return a;do{if(un(i,a.next))return a.next;if(o<=a.y&&o>=a.next.y&&a.next.y!==a.y){let x=a.x+(o-a.y)*(a.next.x-a.x)/(a.next.y-a.y);if(x<=s&&x>d&&(d=x,h=a.x<a.next.x?a:a.next,x===s))return h}a=a.next}while(a!==r);if(!h)return null;let m=h,f=h.x,p=h.y,_=1/0;a=h;do{if(s>=a.x&&a.x>=f&&s!==a.x&&Ks(o<p?s:d,o,f,p,o<p?d:s,o,a.x,a.y)){let x=Math.abs(o-a.y)/(s-a.x);Wn(a,i)&&(x<_||x===_&&(a.x>h.x||a.x===h.x&&Ka(h,a)))&&(h=a,_=x)}a=a.next}while(a!==m);return h})(u,e);if(!t)return e;let n=Qs(t,u);return Ht(n,n.next),Ht(t,t.next)}function Ka(u,e){return ye(u.prev,u,e.prev)<0&&ye(e.next,u,u.next)<0}function Qr(u,e,t,n,i){return(u=1431655765&((u=858993459&((u=252645135&((u=16711935&((u=(u-t)*i|0)|u<<8))|u<<4))|u<<2))|u<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-n)*i|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function $a(u){let e=u,t=u;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==u);return t}function Ks(u,e,t,n,i,r,a,s){return(i-a)*(e-s)>=(u-a)*(r-s)&&(u-a)*(n-s)>=(t-a)*(e-s)&&(t-a)*(r-s)>=(i-a)*(n-s)}function Tn(u,e,t,n,i,r,a,s){return!(u===a&&e===s)&&Ks(u,e,t,n,i,r,a,s)}function Qa(u,e){return u.next.i!==e.i&&u.prev.i!==e.i&&!(function(t,n){let i=t;do{if(i.i!==t.i&&i.next.i!==t.i&&i.i!==n.i&&i.next.i!==n.i&&$s(i,i.next,t,n))return!0;i=i.next}while(i!==t);return!1})(u,e)&&(Wn(u,e)&&Wn(e,u)&&(function(t,n){let i=t,r=!1,a=(t.x+n.x)/2,s=(t.y+n.y)/2;do i.y>s!=i.next.y>s&&i.next.y!==i.y&&a<(i.next.x-i.x)*(s-i.y)/(i.next.y-i.y)+i.x&&(r=!r),i=i.next;while(i!==t);return r})(u,e)&&(ye(u.prev,u,e.prev)||ye(u,e.prev,e))||un(u,e)&&ye(u.prev,u,u.next)>0&&ye(e.prev,e,e.next)>0)}function ye(u,e,t){return(e.y-u.y)*(t.x-e.x)-(e.x-u.x)*(t.y-e.y)}function un(u,e){return u.x===e.x&&u.y===e.y}function $s(u,e,t,n){let i=Mi(ye(u,e,t)),r=Mi(ye(u,e,n)),a=Mi(ye(t,n,u)),s=Mi(ye(t,n,e));return i!==r&&a!==s||!(i!==0||!xi(u,t,e))||!(r!==0||!xi(u,n,e))||!(a!==0||!xi(t,u,n))||!(s!==0||!xi(t,e,n))}function xi(u,e,t){return e.x<=Math.max(u.x,t.x)&&e.x>=Math.min(u.x,t.x)&&e.y<=Math.max(u.y,t.y)&&e.y>=Math.min(u.y,t.y)}function Mi(u){return u>0?1:u<0?-1:0}function Wn(u,e){return ye(u.prev,u,u.next)<0?ye(u,e,u.next)>=0&&ye(u,u.prev,e)>=0:ye(u,e,u.prev)<0||ye(u,u.next,e)<0}function Qs(u,e){let t=es(u.i,u.x,u.y),n=es(e.i,e.x,e.y),i=u.next,r=e.prev;return u.next=e,e.prev=u,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function zs(u,e,t,n){let i=es(u,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Xn(u){u.next.prev=u.prev,u.prev.next=u.next,u.prevZ&&(u.prevZ.nextZ=u.nextZ),u.nextZ&&(u.nextZ.prevZ=u.prevZ)}function es(u,e,t){return{i:u,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}var ts=class{static triangulate(e,t,n=2){return Wa(e,t,n)}},ot=class u{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return .5*n}static isClockWise(e){return u.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];Vs(e),Gs(n,e);let a=e.length;t.forEach(Vs);for(let o=0;o<t.length;o++)i.push(a),a+=t[o].length,Gs(n,t[o]);let s=ts.triangulate(n,i);for(let o=0;o<s.length;o+=3)r.push(s.slice(o,o+3));return r}};function Vs(u){let e=u.length;e>2&&u[e-1].equals(u[0])&&u.pop()}function Gs(u,e){for(let t=0;t<e.length;t++)u.push(e[t].x),u.push(e[t].y)}var dn=class u extends ge{constructor(e=new Gt([new B(.5,.5),new B(-.5,.5),new B(-.5,-.5),new B(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],r=[];for(let s=0,o=e.length;s<o;s++)a(e[s]);function a(s){let o=[],h=t.curveSegments!==void 0?t.curveSegments:12,d=t.steps!==void 0?t.steps:1,m=t.depth!==void 0?t.depth:1,f=t.bevelEnabled===void 0||t.bevelEnabled,p=t.bevelThickness!==void 0?t.bevelThickness:.2,_=t.bevelSize!==void 0?t.bevelSize:p-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,T=t.bevelSegments!==void 0?t.bevelSegments:3,c=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:eo,y,C,R,E,D,F=!1;c&&(y=c.getSpacedPoints(d),F=!0,f=!1,C=c.computeFrenetFrames(d,!1),R=new M,E=new M,D=new M),f||(T=0,p=0,_=0,x=0);let X=s.extractPoints(h),N=X.shape,q=X.holes;if(!ot.isClockWise(N)){N=N.reverse();for(let k=0,V=q.length;k<V;k++){let z=q[k];ot.isClockWise(z)&&(q[k]=z.reverse())}}function O(k){let V=10000000000000001e-36,z=k[0];for(let j=1;j<=k.length;j++){let Z=j%k.length,re=k[Z],ee=re.x-z.x,ue=re.y-z.y,_e=ee*ee+ue*ue,Se=Math.max(Math.abs(re.x),Math.abs(re.y),Math.abs(z.x),Math.abs(z.y));_e<=V*Se*Se?(k.splice(Z,1),j--):z=re}}O(N),q.forEach(O);let Q=q.length,oe=N;for(let k=0;k<Q;k++){let V=q[k];N=N.concat(V)}function de(k,V,z){return V||console.error("THREE.ExtrudeGeometry: vec does not exist"),k.clone().addScaledVector(V,z)}let ce=N.length;function Ue(k,V,z){let j,Z,re,ee=k.x-V.x,ue=k.y-V.y,_e=z.x-k.x,Se=z.y-k.y,Xe=ee*ee+ue*ue,Dt=ee*Se-ue*_e;if(Math.abs(Dt)>Number.EPSILON){let Ce=Math.sqrt(Xe),Ut=Math.sqrt(_e*_e+Se*Se),ht=V.x-ue/Ce,_n=V.y+ee/Ce,qn=((z.x-Se/Ut-ht)*Se-(z.y+_e/Ut-_n)*_e)/(ee*Se-ue*_e);j=ht+ee*qn-k.x,Z=_n+ue*qn-k.y;let Yn=j*j+Z*Z;if(Yn<=2)return new B(j,Z);re=Math.sqrt(Yn/2)}else{let Ce=!1;ee>Number.EPSILON?_e>Number.EPSILON&&(Ce=!0):ee<-Number.EPSILON?_e<-Number.EPSILON&&(Ce=!0):Math.sign(ue)===Math.sign(Se)&&(Ce=!0),Ce?(j=-ue,Z=ee,re=Math.sqrt(Xe)):(j=ee,Z=ue,re=Math.sqrt(Xe/2))}return new B(j/re,Z/re)}let we=[];for(let k=0,V=oe.length,z=V-1,j=k+1;k<V;k++,z++,j++)z===V&&(z=0),j===V&&(j=0),we[k]=Ue(oe[k],oe[z],oe[j]);let ve=[],ne,pe,Ne=we.concat();for(let k=0,V=Q;k<V;k++){let z=q[k];ne=[];for(let j=0,Z=z.length,re=Z-1,ee=j+1;j<Z;j++,re++,ee++)re===Z&&(re=0),ee===Z&&(ee=0),ne[j]=Ue(z[j],z[re],z[ee]);ve.push(ne),Ne=Ne.concat(ne)}if(T===0)pe=ot.triangulateShape(oe,q);else{let k=[],V=[];for(let z=0;z<T;z++){let j=z/T,Z=p*Math.cos(j*Math.PI/2),re=_*Math.sin(j*Math.PI/2)+x;for(let ee=0,ue=oe.length;ee<ue;ee++){let _e=de(oe[ee],we[ee],re);Je(_e.x,_e.y,-Z),j===0&&k.push(_e)}for(let ee=0,ue=Q;ee<ue;ee++){let _e=q[ee];ne=ve[ee];let Se=[];for(let Xe=0,Dt=_e.length;Xe<Dt;Xe++){let Ce=de(_e[Xe],ne[Xe],re);Je(Ce.x,Ce.y,-Z),j===0&&Se.push(Ce)}j===0&&V.push(Se)}}pe=ot.triangulateShape(k,V)}let Oe=pe.length,be=_+x;for(let k=0;k<ce;k++){let V=f?de(N[k],Ne[k],be):N[k];F?(E.copy(C.normals[0]).multiplyScalar(V.x),R.copy(C.binormals[0]).multiplyScalar(V.y),D.copy(y[0]).add(E).add(R),Je(D.x,D.y,D.z)):Je(V.x,V.y,0)}for(let k=1;k<=d;k++)for(let V=0;V<ce;V++){let z=f?de(N[V],Ne[V],be):N[V];F?(E.copy(C.normals[k]).multiplyScalar(z.x),R.copy(C.binormals[k]).multiplyScalar(z.y),D.copy(y[k]).add(E).add(R),Je(D.x,D.y,D.z)):Je(z.x,z.y,m/d*k)}for(let k=T-1;k>=0;k--){let V=k/T,z=p*Math.cos(V*Math.PI/2),j=_*Math.sin(V*Math.PI/2)+x;for(let Z=0,re=oe.length;Z<re;Z++){let ee=de(oe[Z],we[Z],j);Je(ee.x,ee.y,m+z)}for(let Z=0,re=q.length;Z<re;Z++){let ee=q[Z];ne=ve[Z];for(let ue=0,_e=ee.length;ue<_e;ue++){let Se=de(ee[ue],ne[ue],j);F?Je(Se.x,Se.y+y[d-1].y,y[d-1].x+z):Je(Se.x,Se.y,m+z)}}}function Lt(k,V){let z=k.length;for(;--z>=0;){let j=z,Z=z-1;Z<0&&(Z=k.length-1);for(let re=0,ee=d+2*T;re<ee;re++){let ue=ce*re,_e=ce*(re+1);Ee(V+j+ue,V+Z+ue,V+Z+_e,V+j+_e)}}}function Je(k,V,z){o.push(k),o.push(V),o.push(z)}function We(k,V,z){Be(k),Be(V),Be(z);let j=i.length/3,Z=w.generateTopUV(n,i,j-3,j-2,j-1);he(Z[0]),he(Z[1]),he(Z[2])}function Ee(k,V,z,j){Be(k),Be(V),Be(j),Be(V),Be(z),Be(j);let Z=i.length/3,re=w.generateSideWallUV(n,i,Z-6,Z-3,Z-2,Z-1);he(re[0]),he(re[1]),he(re[3]),he(re[1]),he(re[2]),he(re[3])}function Be(k){i.push(o[3*k+0]),i.push(o[3*k+1]),i.push(o[3*k+2])}function he(k){r.push(k.x),r.push(k.y)}(function(){let k=i.length/3;if(f){let V=0,z=ce*V;for(let j=0;j<Oe;j++){let Z=pe[j];We(Z[2]+z,Z[1]+z,Z[0]+z)}V=d+2*T,z=ce*V;for(let j=0;j<Oe;j++){let Z=pe[j];We(Z[0]+z,Z[1]+z,Z[2]+z)}}else{for(let V=0;V<Oe;V++){let z=pe[V];We(z[2],z[1],z[0])}for(let V=0;V<Oe;V++){let z=pe[V];We(z[0]+ce*d,z[1]+ce*d,z[2]+ce*d)}}n.addGroup(k,i.length/3-k,0)})(),(function(){let k=i.length/3,V=0;Lt(oe,V),V+=oe.length;for(let z=0,j=q.length;z<j;z++){let Z=q[z];Lt(Z,V),V+=Z.length}n.addGroup(k,i.length/3-k,1)})()}this.setAttribute("position",new J(i,3)),this.setAttribute("uv",new J(r,2)),this.computeVertexNormals()}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n,i){if(i.shapes=[],Array.isArray(t))for(let r=0,a=t.length;r<a;r++){let s=t[r];i.shapes.push(s.uuid)}else i.shapes.push(t.uuid);return i.options=Object.assign({},n),n.extrudePath!==void 0&&(i.options.extrudePath=n.extrudePath.toJSON()),i})(this.parameters.shapes,this.parameters.options,e)}static fromJSON(e,t){let n=[];for(let r=0,a=e.shapes.length;r<a;r++){let s=t[e.shapes[r]];n.push(s)}let i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Xi[i.type]().fromJSON(i)),new u(n,e.options)}},eo={generateTopUV:function(u,e,t,n,i){let r=e[3*t],a=e[3*t+1],s=e[3*n],o=e[3*n+1],h=e[3*i],d=e[3*i+1];return[new B(r,a),new B(s,o),new B(h,d)]},generateSideWallUV:function(u,e,t,n,i,r){let a=e[3*t],s=e[3*t+1],o=e[3*t+2],h=e[3*n],d=e[3*n+1],m=e[3*n+2],f=e[3*i],p=e[3*i+1],_=e[3*i+2],x=e[3*r],T=e[3*r+1],c=e[3*r+2];return Math.abs(s-d)<Math.abs(a-h)?[new B(a,1-o),new B(h,1-m),new B(f,1-_),new B(x,1-c)]:[new B(s,1-o),new B(d,1-m),new B(p,1-_),new B(T,1-c)]}},qi=class u extends Rt{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2;super([-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new u(e.radius,e.detail)}},Wt=class u extends ge{constructor(e=[new B(0,-.5),new B(.5,0),new B(0,.5)],t=12,n=0,i=2*Math.PI){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=te(i,0,2*Math.PI);let r=[],a=[],s=[],o=[],h=[],d=1/t,m=new M,f=new B,p=new M,_=new M,x=new M,T=0,c=0;for(let w=0;w<=e.length-1;w++)switch(w){case 0:T=e[w+1].x-e[w].x,c=e[w+1].y-e[w].y,p.x=1*c,p.y=-T,p.z=0*c,x.copy(p),p.normalize(),o.push(p.x,p.y,p.z);break;case e.length-1:o.push(x.x,x.y,x.z);break;default:T=e[w+1].x-e[w].x,c=e[w+1].y-e[w].y,p.x=1*c,p.y=-T,p.z=0*c,_.copy(p),p.x+=x.x,p.y+=x.y,p.z+=x.z,p.normalize(),o.push(p.x,p.y,p.z),x.copy(_)}for(let w=0;w<=t;w++){let y=n+w*d*i,C=Math.sin(y),R=Math.cos(y);for(let E=0;E<=e.length-1;E++){m.x=e[E].x*C,m.y=e[E].y,m.z=e[E].x*R,a.push(m.x,m.y,m.z),f.x=w/t,f.y=E/(e.length-1),s.push(f.x,f.y);let D=o[3*E+0]*C,F=o[3*E+1],X=o[3*E+0]*R;h.push(D,F,X)}}for(let w=0;w<t;w++)for(let y=0;y<e.length-1;y++){let C=y+w*e.length,R=C,E=C+e.length,D=C+e.length+1,F=C+1;r.push(R,E,F),r.push(D,F,E)}this.setIndex(r),this.setAttribute("position",new J(a,3)),this.setAttribute("uv",new J(s,2)),this.setAttribute("normal",new J(h,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.points,e.segments,e.phiStart,e.phiLength)}},Yi=class u extends Rt{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new u(e.radius,e.detail)}},Xt=class u extends ge{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,a=t/2,s=Math.floor(n),o=Math.floor(i),h=s+1,d=o+1,m=e/s,f=t/o,p=[],_=[],x=[],T=[];for(let c=0;c<d;c++){let w=c*f-a;for(let y=0;y<h;y++){let C=y*m-r;_.push(C,-w,0),x.push(0,0,1),T.push(y/s),T.push(1-c/o)}}for(let c=0;c<o;c++)for(let w=0;w<s;w++){let y=w+h*c,C=w+h*(c+1),R=w+1+h*(c+1),E=w+1+h*c;p.push(y,C,E),p.push(C,R,E)}this.setIndex(p),this.setAttribute("position",new J(_,3)),this.setAttribute("normal",new J(x,3)),this.setAttribute("uv",new J(T,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.width,e.height,e.widthSegments,e.heightSegments)}},Zi=class u extends ge{constructor(e=.5,t=1,n=32,i=1,r=0,a=2*Math.PI){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n);let s=[],o=[],h=[],d=[],m=e,f=(t-e)/(i=Math.max(1,i)),p=new M,_=new B;for(let x=0;x<=i;x++){for(let T=0;T<=n;T++){let c=r+T/n*a;p.x=m*Math.cos(c),p.y=m*Math.sin(c),o.push(p.x,p.y,p.z),h.push(0,0,1),_.x=(p.x/t+1)/2,_.y=(p.y/t+1)/2,d.push(_.x,_.y)}m+=f}for(let x=0;x<i;x++){let T=x*(n+1);for(let c=0;c<n;c++){let w=c+T,y=w,C=w+n+1,R=w+n+2,E=w+1;s.push(y,C,E),s.push(C,R,E)}}this.setIndex(s),this.setAttribute("position",new J(o,3)),this.setAttribute("normal",new J(h,3)),this.setAttribute("uv",new J(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ji=class u extends ge{constructor(e=new Gt([new B(0,.5),new B(-.5,-.5),new B(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],r=[],a=[],s=0,o=0;if(Array.isArray(e)===!1)h(e);else for(let d=0;d<e.length;d++)h(e[d]),this.addGroup(s,o,d),s+=o,o=0;function h(d){let m=i.length/3,f=d.extractPoints(t),p=f.shape,_=f.holes;ot.isClockWise(p)===!1&&(p=p.reverse());for(let T=0,c=_.length;T<c;T++){let w=_[T];ot.isClockWise(w)===!0&&(_[T]=w.reverse())}let x=ot.triangulateShape(p,_);for(let T=0,c=_.length;T<c;T++){let w=_[T];p=p.concat(w)}for(let T=0,c=p.length;T<c;T++){let w=p[T];i.push(w.x,w.y,0),r.push(0,0,1),a.push(w.x,w.y)}for(let T=0,c=x.length;T<c;T++){let w=x[T],y=w[0]+m,C=w[1]+m,R=w[2]+m;n.push(y,C,R),o+=3}}this.setIndex(n),this.setAttribute("position",new J(i,3)),this.setAttribute("normal",new J(r,3)),this.setAttribute("uv",new J(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return(function(t,n){if(n.shapes=[],Array.isArray(t))for(let i=0,r=t.length;i<r;i++){let a=t[i];n.shapes.push(a.uuid)}else n.shapes.push(t.uuid);return n})(this.parameters.shapes,e)}static fromJSON(e,t){let n=[];for(let i=0,r=e.shapes.length;i<r;i++){let a=t[e.shapes[i]];n.push(a)}return new u(n,e.curveSegments)}},pn=class u extends ge{constructor(e=1,t=32,n=16,i=0,r=2*Math.PI,a=0,s=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:s},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let o=Math.min(a+s,Math.PI),h=0,d=[],m=new M,f=new M,p=[],_=[],x=[],T=[];for(let c=0;c<=n;c++){let w=[],y=c/n,C=0;c===0&&a===0?C=.5/t:c===n&&o===Math.PI&&(C=-.5/t);for(let R=0;R<=t;R++){let E=R/t;m.x=-e*Math.cos(i+E*r)*Math.sin(a+y*s),m.y=e*Math.cos(a+y*s),m.z=e*Math.sin(i+E*r)*Math.sin(a+y*s),_.push(m.x,m.y,m.z),f.copy(m).normalize(),x.push(f.x,f.y,f.z),T.push(E+C,1-y),w.push(h++)}d.push(w)}for(let c=0;c<n;c++)for(let w=0;w<t;w++){let y=d[c][w+1],C=d[c][w],R=d[c+1][w],E=d[c+1][w+1];(c!==0||a>0)&&p.push(y,C,E),(c!==n-1||o<Math.PI)&&p.push(C,R,E)}this.setIndex(p),this.setAttribute("position",new J(_,3)),this.setAttribute("normal",new J(x,3)),this.setAttribute("uv",new J(T,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},Ki=class u extends Rt{constructor(e=1,t=0){super([1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],[2,1,0,0,3,2,1,3,0,2,3,1],e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new u(e.radius,e.detail)}},mn=class u extends ge{constructor(e=1,t=.4,n=12,i=48,r=2*Math.PI){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);let a=[],s=[],o=[],h=[],d=new M,m=new M,f=new M;for(let p=0;p<=n;p++)for(let _=0;_<=i;_++){let x=_/i*r,T=p/n*Math.PI*2;m.x=(e+t*Math.cos(T))*Math.cos(x),m.y=(e+t*Math.cos(T))*Math.sin(x),m.z=t*Math.sin(T),s.push(m.x,m.y,m.z),d.x=e*Math.cos(x),d.y=e*Math.sin(x),f.subVectors(m,d).normalize(),o.push(f.x,f.y,f.z),h.push(_/i),h.push(p/n)}for(let p=1;p<=n;p++)for(let _=1;_<=i;_++){let x=(i+1)*p+_-1,T=(i+1)*(p-1)+_-1,c=(i+1)*(p-1)+_,w=(i+1)*p+_;a.push(x,T,w),a.push(T,c,w)}this.setIndex(a),this.setAttribute("position",new J(s,3)),this.setAttribute("normal",new J(o,3)),this.setAttribute("uv",new J(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}},$i=class u extends ge{constructor(e=1,t=.4,n=64,i=8,r=2,a=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:r,q:a},n=Math.floor(n),i=Math.floor(i);let s=[],o=[],h=[],d=[],m=new M,f=new M,p=new M,_=new M,x=new M,T=new M,c=new M;for(let y=0;y<=n;++y){let C=y/n*r*Math.PI*2;w(C,r,a,e,p),w(C+.01,r,a,e,_),T.subVectors(_,p),c.addVectors(_,p),x.crossVectors(T,c),c.crossVectors(x,T),x.normalize(),c.normalize();for(let R=0;R<=i;++R){let E=R/i*Math.PI*2,D=-t*Math.cos(E),F=t*Math.sin(E);m.x=p.x+(D*c.x+F*x.x),m.y=p.y+(D*c.y+F*x.y),m.z=p.z+(D*c.z+F*x.z),o.push(m.x,m.y,m.z),f.subVectors(m,p).normalize(),h.push(f.x,f.y,f.z),d.push(y/n),d.push(R/i)}}for(let y=1;y<=n;y++)for(let C=1;C<=i;C++){let R=(i+1)*(y-1)+(C-1),E=(i+1)*y+(C-1),D=(i+1)*y+C,F=(i+1)*(y-1)+C;s.push(R,E,F),s.push(E,D,F)}function w(y,C,R,E,D){let F=Math.cos(y),X=Math.sin(y),N=R/C*y,q=Math.cos(N);D.x=E*(2+q)*.5*F,D.y=E*(2+q)*X*.5,D.z=E*Math.sin(N)*.5}this.setIndex(s),this.setAttribute("position",new J(o,3)),this.setAttribute("normal",new J(h,3)),this.setAttribute("uv",new J(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new u(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},Qi=class u extends ge{constructor(e=new zn(new M(-1,-1,0),new M(-1,1,0),new M(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let s=new M,o=new M,h=new B,d=new M,m=[],f=[],p=[],_=[];function x(T){d=e.getPointAt(T/t,d);let c=a.normals[T],w=a.binormals[T];for(let y=0;y<=i;y++){let C=y/i*Math.PI*2,R=Math.sin(C),E=-Math.cos(C);o.x=E*c.x+R*w.x,o.y=E*c.y+R*w.y,o.z=E*c.z+R*w.z,o.normalize(),f.push(o.x,o.y,o.z),s.x=d.x+n*o.x,s.y=d.y+n*o.y,s.z=d.z+n*o.z,m.push(s.x,s.y,s.z)}}(function(){for(let T=0;T<t;T++)x(T);x(r===!1?t:0),(function(){for(let T=0;T<=t;T++)for(let c=0;c<=i;c++)h.x=T/t,h.y=c/i,p.push(h.x,h.y)})(),(function(){for(let T=1;T<=t;T++)for(let c=1;c<=i;c++){let w=(i+1)*(T-1)+(c-1),y=(i+1)*T+(c-1),C=(i+1)*T+c,R=(i+1)*(T-1)+c;_.push(w,y,R),_.push(y,C,R)}})()})(),this.setIndex(_),this.setAttribute("position",new J(m,3)),this.setAttribute("normal",new J(f,3)),this.setAttribute("uv",new J(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new u(new Xi[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},er=class extends ge{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,i=new M,r=new M;if(e.index!==null){let a=e.attributes.position,s=e.index,o=e.groups;o.length===0&&(o=[{start:0,count:s.count,materialIndex:0}]);for(let h=0,d=o.length;h<d;++h){let m=o[h],f=m.start;for(let p=f,_=f+m.count;p<_;p+=3)for(let x=0;x<3;x++){let T=s.getX(p+x),c=s.getX(p+(x+1)%3);i.fromBufferAttribute(a,T),r.fromBufferAttribute(a,c),Hs(i,r,n)===!0&&(t.push(i.x,i.y,i.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let s=0,o=a.count/3;s<o;s++)for(let h=0;h<3;h++){let d=3*s+h,m=3*s+(h+1)%3;i.fromBufferAttribute(a,d),r.fromBufferAttribute(a,m),Hs(i,r,n)===!0&&(t.push(i.x,i.y,i.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new J(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Hs(u,e,t){let n=`${u.x},${u.y},${u.z}-${e.x},${e.y},${e.z}`,i=`${e.x},${e.y},${e.z}-${u.x},${u.y},${u.z}`;return t.has(n)!==!0&&t.has(i)!==!0&&(t.add(n),t.add(i),!0)}var Ml=Object.freeze({__proto__:null,BoxGeometry:Li,CapsuleGeometry:Fi,CircleGeometry:Oi,ConeGeometry:Bi,CylinderGeometry:Pe,DodecahedronGeometry:ki,EdgesGeometry:zi,ExtrudeGeometry:dn,IcosahedronGeometry:qi,LatheGeometry:Wt,OctahedronGeometry:Yi,PlaneGeometry:Xt,PolyhedronGeometry:Rt,RingGeometry:Zi,ShapeGeometry:Ji,SphereGeometry:pn,TetrahedronGeometry:Ki,TorusGeometry:mn,TorusKnotGeometry:$i,TubeGeometry:Qi,WireframeGeometry:er});var It=class extends Dn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _t,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},fn=class extends It{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new B(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return te(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new le(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new le(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new le(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function Si(u,e){return u&&u.constructor!==e?typeof e.BYTES_PER_ELEMENT=="number"?new e(u):Array.prototype.slice.call(u):u}function to(u){return ArrayBuffer.isView(u)&&!(u instanceof DataView)}var jt=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<i)){for(let s=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===s)break;if(r=i,i=t[++n],e<i)break e}a=t.length;break t}if(!(e>=r)){let s=t[1];e<s&&(n=2,r=s);for(let o=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let s=n+a>>>1;e<t[s]?a=s:n=s+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},tr=class extends jt{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Vr,endingEnd:Vr}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,a=e+1,s=i[r],o=i[a];if(s===void 0)switch(this.getSettings_().endingStart){case Gr:r=e,s=2*t-n;break;case Hr:r=i.length-2,s=t+i[r]-i[r+1];break;default:r=e,s=n}if(o===void 0)switch(this.getSettings_().endingEnd){case Gr:a=e,o=2*n-t;break;case Hr:a=1,o=n+i[1]-i[0];break;default:a=e-1,o=t}let h=.5*(n-t),d=this.valueSize;this._weightPrev=h/(t-s),this._weightNext=h/(o-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=e*s,h=o-s,d=this._offsetPrev,m=this._offsetNext,f=this._weightPrev,p=this._weightNext,_=(n-t)/(i-t),x=_*_,T=x*_,c=-f*T+2*f*x-f*_,w=(1+f)*T+(-1.5-2*f)*x+(-.5+f)*_+1,y=(-1-p)*T+(1.5+p)*x+.5*_,C=p*T-p*x;for(let R=0;R!==s;++R)r[R]=c*a[d+R]+w*a[h+R]+y*a[o+R]+C*a[m+R];return r}},nr=class extends jt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=e*s,h=o-s,d=(n-t)/(i-t),m=1-d;for(let f=0;f!==s;++f)r[f]=a[h+f]*m+a[o+f]*d;return r}},ir=class extends jt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Ge=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Si(t,this.TimeBufferType),this.values=Si(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Si(e.times,Array),values:Si(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ir(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new nr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new tr(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case In:t=this.InterpolantFactoryMethodDiscrete;break;case wi:t=this.InterpolantFactoryMethodLinear;break;case bi:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0){if(e===this.DefaultInterpolation)throw new Error(n);this.setInterpolation(this.DefaultInterpolation)}return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return In;case this.InterpolantFactoryMethodLinear:return wi;case this.InterpolantFactoryMethodSmooth:return bi}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);let s=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*s,a*s)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let s=0;s!==r;s++){let o=n[s];if(typeof o=="number"&&isNaN(o)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,s,o),e=!1;break}if(a!==null&&a>o){console.error("THREE.KeyframeTrack: Out of order keys.",this,s,o,a),e=!1;break}a=o}if(i!==void 0&&to(i))for(let s=0,o=i.length;s!==o;++s){let h=i[s];if(isNaN(h)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,s,h),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===bi,r=e.length-1,a=1;for(let s=1;s<r;++s){let o=!1,h=e[s];if(h!==e[s+1]&&(s!==1||h!==e[0]))if(i)o=!0;else{let d=s*n,m=d-n,f=d+n;for(let p=0;p!==n;++p){let _=t[d+p];if(_!==t[m+p]||_!==t[f+p]){o=!0;break}}}if(o){if(s!==a){e[a]=e[s];let d=s*n,m=a*n;for(let f=0;f!==n;++f)t[m+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let s=r*n,o=a*n,h=0;h!==n;++h)t[o+h]=t[s+h];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=new this.constructor(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}};Ge.prototype.ValueTypeName="",Ge.prototype.TimeBufferType=Float32Array,Ge.prototype.ValueBufferType=Float32Array,Ge.prototype.DefaultInterpolation=wi;var Tt=class extends Ge{constructor(e,t,n){super(e,t,n)}};Tt.prototype.ValueTypeName="bool",Tt.prototype.ValueBufferType=Array,Tt.prototype.DefaultInterpolation=In,Tt.prototype.InterpolantFactoryMethodLinear=void 0,Tt.prototype.InterpolantFactoryMethodSmooth=void 0;var rr=class extends Ge{constructor(e,t,n,i){super(e,t,n,i)}};rr.prototype.ValueTypeName="color";var sr=class extends Ge{constructor(e,t,n,i){super(e,t,n,i)}};sr.prototype.ValueTypeName="number";var ar=class extends jt{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=(n-t)/(i-t),h=e*s;for(let d=h+s;h!==d;h+=4)tt.slerpFlat(r,0,a,h-s,a,h,o);return r}},jn=class extends Ge{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new ar(this.times,this.values,this.getValueSize(),e)}};jn.prototype.ValueTypeName="quaternion",jn.prototype.InterpolantFactoryMethodSmooth=void 0;var wt=class extends Ge{constructor(e,t,n){super(e,t,n)}};wt.prototype.ValueTypeName="string",wt.prototype.ValueBufferType=Array,wt.prototype.DefaultInterpolation=In,wt.prototype.InterpolantFactoryMethodLinear=void 0,wt.prototype.InterpolantFactoryMethodSmooth=void 0;var or=class extends Ge{constructor(e,t,n,i){super(e,t,n,i)}};or.prototype.ValueTypeName="vector";var lr=class{constructor(e,t,n){let i=this,r,a=!1,s=0,o=0,h=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(d){o++,a===!1&&i.onStart!==void 0&&i.onStart(d,s,o),a=!0},this.itemEnd=function(d){s++,i.onProgress!==void 0&&i.onProgress(d,s,o),s===o&&(a=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(d){i.onError!==void 0&&i.onError(d)},this.resolveURL=function(d){return r?r(d):d},this.setURLModifier=function(d){return r=d,this},this.addHandler=function(d,m){return h.push(d,m),this},this.removeHandler=function(d){let m=h.indexOf(d);return m!==-1&&h.splice(m,2),this},this.getHandler=function(d){for(let m=0,f=h.length;m<f;m+=2){let p=h[m],_=h[m+1];if(p.global&&(p.lastIndex=0),p.test(d))return _}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},ea=new lr,cr=class{constructor(e){this.manager=e!==void 0?e:ea,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};cr.DEFAULT_MATERIAL_NAME="__DEFAULT";var Sl=new se,bl=new M,Tl=new M;var wl=new se,El=new M,Al=new M;var hr=class extends Un{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,a=n+e,s=i+t,o=i-t;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,s-=d*this.view.offsetY,o=s-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,s,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var Cl=new se,Rl=new se,Il=new se;var Pl=new M,Ll=new tt,Dl=new M,Ul=new M,Nl=new M;var Fl=new M,Ol=new tt,Bl=new M,kl=new M;var ps="\\[\\]\\.:\\/",no=new RegExp("["+ps+"]","g"),Br="[^"+ps+"]",io="[^"+ps.replace("\\.","")+"]",ro=new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",Br)+/(WCOD+)?/.source.replace("WCOD",io)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Br)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Br)+"$"),so=["material","materials","bones","map"],fe=class u{constructor(e,t,n){this.path=t,this.parsedPath=n||u.parseTrackName(t),this.node=u.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new u.Composite(e,t,n):new u(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(no,"")}static parseTrackName(e){let t=ro.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);so.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let s=r[a];if(s.name===t||s.uuid===t)return s;let o=n(s.children);if(o)return o}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=u.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e)return void console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");if(n){let h=t.objectIndex;switch(n){case"materials":if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.materials)return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);e=e.material.materials;break;case"bones":if(!e.skeleton)return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===h){h=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material)return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);if(!e.material.map)return void console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);e=e.material.map;break;default:if(e[n]===void 0)return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);e=e[n]}if(h!==void 0){if(e[h]===void 0)return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);e=e[h]}}let a=e[i];if(a===void 0){let h=t.nodeName;return void console.error("THREE.PropertyBinding: Trying to update property for track: "+h+"."+i+" but it wasn't found.",e)}let s=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?s=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let o=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);if(!e.geometry.morphAttributes)return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}o=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(o=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(o=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[o],this.setValue=this.SetterByBindingTypeAndVersioning[o][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};fe.Composite=class{constructor(u,e,t){let n=t||fe.parseTrackName(e);this._targetGroup=u,this._bindings=u.subscribe_(e,n)}getValue(u,e){this.bind();let t=this._targetGroup.nCachedObjects_,n=this._bindings[t];n!==void 0&&n.getValue(u,e)}setValue(u,e){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].setValue(u,e)}bind(){let u=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=u.length;e!==t;++e)u[e].bind()}unbind(){let u=this._bindings;for(let e=this._targetGroup.nCachedObjects_,t=u.length;e!==t;++e)u[e].unbind()}},fe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},fe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},fe.prototype.GetterByBindingType=[fe.prototype._getValue_direct,fe.prototype._getValue_array,fe.prototype._getValue_arrayElement,fe.prototype._getValue_toArray],fe.prototype.SetterByBindingTypeAndVersioning=[[fe.prototype._setValue_direct,fe.prototype._setValue_direct_setNeedsUpdate,fe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_array,fe.prototype._setValue_array_setNeedsUpdate,fe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_arrayElement,fe.prototype._setValue_arrayElement_setNeedsUpdate,fe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[fe.prototype._setValue_fromArray,fe.prototype._setValue_fromArray_setNeedsUpdate,fe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var zl=new Float32Array(1);var Ws=new se,ct=class{constructor(e,t,n=0,i=1/0){this.ray=new At(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Ln,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ws.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ws),this}intersectObject(e,t=!0,n=[]){return ns(e,this,n,t),n.sort(Xs),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)ns(e[i],this,n,t);return n.sort(Xs),n}};function Xs(u,e){return u.distance-e.distance}function ns(u,e,t,n){let i=!0;if(u.layers.test(e.layers)&&u.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){let r=u.children;for(let a=0,s=r.length;a<s;a++)ns(r[a],e,t,!0)}}var Vl=new B;var Gl=new M,Hl=new M,Wl=new M,Xl=new M,jl=new M,ql=new M,Yl=new M;var Zl=new M;var Jl=new M,Kl=new se,$l=new se;var Ql=new M,ec=new le,tc=new le;var nc=new M,ic=new M,rc=new M;var sc=new M,ac=new Un;var oc=new xe;var lc=new M;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");var ae={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},W={common:{diffuse:{value:new le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new K},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new K}},envmap:{envMap:{value:null},envMapRotation:{value:new K},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new K}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new K}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new K},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new K},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new K},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new K}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new K}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new K}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0},uvTransform:{value:new K}},sprite:{diffuse:{value:new le(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new K},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0}}},ta={basic:{uniforms:De([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:ae.meshbasic_vert,fragmentShader:ae.meshbasic_frag},lambert:{uniforms:De([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new le(0)}}]),vertexShader:ae.meshlambert_vert,fragmentShader:ae.meshlambert_frag},phong:{uniforms:De([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new le(0)},specular:{value:new le(1118481)},shininess:{value:30}}]),vertexShader:ae.meshphong_vert,fragmentShader:ae.meshphong_frag},standard:{uniforms:De([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ae.meshphysical_vert,fragmentShader:ae.meshphysical_frag},toon:{uniforms:De([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new le(0)}}]),vertexShader:ae.meshtoon_vert,fragmentShader:ae.meshtoon_frag},matcap:{uniforms:De([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:ae.meshmatcap_vert,fragmentShader:ae.meshmatcap_frag},points:{uniforms:De([W.points,W.fog]),vertexShader:ae.points_vert,fragmentShader:ae.points_frag},dashed:{uniforms:De([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ae.linedashed_vert,fragmentShader:ae.linedashed_frag},depth:{uniforms:De([W.common,W.displacementmap]),vertexShader:ae.depth_vert,fragmentShader:ae.depth_frag},normal:{uniforms:De([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:ae.meshnormal_vert,fragmentShader:ae.meshnormal_frag},sprite:{uniforms:De([W.sprite,W.fog]),vertexShader:ae.sprite_vert,fragmentShader:ae.sprite_frag},background:{uniforms:{uvTransform:{value:new K},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ae.background_vert,fragmentShader:ae.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new K}},vertexShader:ae.backgroundCube_vert,fragmentShader:ae.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ae.cube_vert,fragmentShader:ae.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ae.equirect_vert,fragmentShader:ae.equirect_frag},distanceRGBA:{uniforms:De([W.common,W.displacementmap,{referencePosition:{value:new M},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ae.distanceRGBA_vert,fragmentShader:ae.distanceRGBA_frag},shadow:{uniforms:De([W.lights,W.fog,{color:{value:new le(0)},opacity:{value:1}}]),vertexShader:ae.shadow_vert,fragmentShader:ae.shadow_frag}};ta.physical={uniforms:De([ta.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new K},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new K},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new K},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new K},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new K},sheen:{value:0},sheenColor:{value:new le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new K},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new K},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new K},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new K},attenuationDistance:{value:0},attenuationColor:{value:new le(0)},specularColor:{value:new le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new K},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new K},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new K}}]),vertexShader:ae.meshphysical_vert,fragmentShader:ae.meshphysical_frag};var Om=new _t,Bm=new se;var km=new hr,zm=new le;var Yt=(1+Math.sqrt(5))/2,vn=1/Yt,Vm=[new M(-Yt,vn,0),new M(Yt,vn,0),new M(-vn,0,Yt),new M(vn,0,Yt),new M(0,Yt,-vn),new M(0,Yt,vn),new M(-1,1,-1),new M(1,1,-1),new M(-1,1,1),new M(1,1,1)],Gm=new M;var Hm=new Ye,Wm=new Ni(1,1),Xm=new Ci,jm=new Ri,qm=new Di;var Ym=new Float32Array(16),Zm=new Float32Array(9),Jm=new Float32Array(4);var Km=new K;var $m=new M;var Qm={[is]:rs,[ss]:cs,[os]:hs,[as]:ls,[rs]:is,[cs]:ss,[hs]:os,[ls]:as};var ef=new _t,tf=new se;var sf=wa(ia()),sa={kestrel:{length:112,width:18,paint:12042177,accent:12089653,kind:"courier"},swift:{length:124,width:12,paint:14014933,accent:2652299,kind:"express"},peregrine:{length:157,width:24,paint:11384498,accent:10377009,kind:"freighter"},albatross:{length:199,width:30,paint:10398376,accent:11968618,kind:"lattice"},osprey:{length:120,width:30,paint:6321795,accent:13270087,kind:"cutter"},petrel:{length:171,width:22,paint:13223863,accent:12749366,kind:"tanker"},gannet:{length:162,width:34,paint:8360850,accent:11641197,kind:"escort"},heron:{length:147,width:19,paint:14737104,accent:11955515,kind:"survey"},tern:{length:166,width:28,paint:14278102,accent:3767690,kind:"reefer"},cormorant:{length:159,width:32,paint:12686154,accent:14336909,kind:"tug"},pelican:{length:224,width:39,paint:9349801,accent:12956020,kind:"bulk"},gyrfalcon:{length:200,width:29,paint:6848395,accent:12886363,kind:"frigate"},merlin:{length:114,width:18,paint:6451322,accent:12025666,kind:"interceptor"},curlew:{length:166,width:25,paint:11053728,accent:6848381,kind:"liner"},sanderling:{length:144,width:36,paint:10126170,accent:12623965,kind:"miner"},rook:{length:171,width:34,paint:7897208,accent:11639384,kind:"salvager"},ibis:{length:181,width:27,paint:12106929,accent:6064258,kind:"hospital"},crane:{length:208,width:38,paint:9210738,accent:11770710,kind:"workshop"},nightjar:{length:181,width:19,paint:4542811,accent:8549989,kind:"electronic"},condor:{length:248,width:48,paint:8029568,accent:11116157,kind:"carrier"}},ao={merlin:{scale:[.9,1.02,1.05],features:["Oversized twin drive chambers","Armored interception spine","Recessed paired pulse optics","Short-range utility compartment"]},curlew:{scale:[1.35,1.15,1.1],features:["Six linked pressure cabins","Continuous life-support gallery","Captive escape capsules","Shielded passenger docking vestibules"]},sanderling:{scale:[1.45,1.35,1.35],features:["Articulated excavation arms","Braced mineral hoppers","Raised crusher machinery","Protected processing and tool deck"]},rook:{scale:[1.5,1.3,1.3],features:["Asymmetric recovery crane","Open reinforced wreck cradle","Captive cable and grapple system","Sealed salvage assessment workshop"]},ibis:{scale:[1.45,1.25,1.3],features:["Three isolated treatment wards","Twin ambulance docking galleries","Protected life-support backbone","Separate relief stores"]},crane:{scale:[1.85,1.5,1.5],features:["Twin articulated service booms","Sheltered open repair bays","Replaceable spare-component racks","Overhead handling gantries"]},nightjar:{scale:[1.55,1.1,1.5],features:["Staggered directional signal arrays","Shielded electronics compartments","Broad dedicated cooling beds","Protected decoy launch cells"]},condor:{scale:[2.25,1.65,1.6],features:["Twin framed utility hangars","Integrated offset command tower","Two cradle-mounted utility tenders","Four main drive chambers"]},swift:{scale:[.62,.7,.72],features:["Needle pressure hull","Three compact drive nozzles","Swept radiator strakes","Flush urgent-cargo bay"]},kestrel:{scale:[.83,.88,.88],features:["Twin serviceable nacelles","Ventral docking collar","Compact dorsal freight pod","Recessed two-part canopy"]},osprey:{scale:[.95,1.1,1.08],features:["Armored delta shoulders","Layered forward cheek plates","Short patrol drive booms","Recessed weapon bays"]},heron:{scale:[.95,1.05,1.08],features:["Braced survey dish","Twin optical instrument booms","Wide heat-rejection outriggers","Modular research cabin"]},peregrine:{scale:[1.2,1.12,1.1],features:["Three framed container berths","External freight spine","Docking and cargo-lock hardware","Independent drive service pods"]},tern:{scale:[1.25,1.2,1.12],features:["Four insulated freight modules","Dedicated roof cooling banks","Continuous thermal feed lines","Protected cold-store service doors"]},petrel:{scale:[1.3,1.25,1.2],features:["Six jacketed propellant drums","Braced transfer manifolds","Protected cross-feed plumbing","Aft tank-service gantry"]},cormorant:{scale:[1.4,1.18,1.18],features:["Open handling fork","Articulated cargo clamps","Recessed winch and cable drums","Reinforced belly cradle"]},gannet:{scale:[1.45,1.3,1.25],features:["Broad armored command citadel","Four-nozzle drive cluster","Protected convoy stores","Heavy shoulder fairings"]},gyrfalcon:{scale:[1.6,1.35,1.2],features:["Extended twin patrol booms","Faceted command citadel","Armored longitudinal spine","Protected forward optics and weapon shoulders"]},albatross:{scale:[1.8,1.5,1.35],features:["Double cargo lattice","Cross-braced container gantries","Raised central service passage","Separated fore and aft pressure modules"]},pelican:{scale:[2.15,1.8,1.55],features:["Large pressure-pod cargo train","Deep structural cargo cradle","Four reinforced main drive stations","Full-length external service gantries"]}};for(let[u,e]of Object.entries(ao))Object.assign(sa[u],e);var ra={kestrel:"Twin-pane courier flight deck",swift:"Long tandem needle canopy",osprey:"Armored cutter vision slit",heron:"Framed survey observation dome",merlin:"Arrowhead interception canopy",petrel:"Offset tanker wheelhouse",peregrine:"Three-window freight deckhouse",tern:"Recessed thermal-hood pilothouse",curlew:"Panoramic passenger bridge",cormorant:"Starboard handling-control cab",sanderling:"Caged excavation cab",gannet:"Layered convoy command citadel",rook:"Asymmetric recovery observation cab",ibis:"Oval medical-service flight deck",gyrfalcon:"Recessed frigate command bunker",albatross:"Two-level forward navigation house",crane:"Linked twin operator booths",nightjar:"Shielded indirect-view command pod",pelican:"Raised bulk-carrier docking bridge",condor:"Split bow docking-control blisters"};function Pt(u,e=.45,t=.32){let n=new fn({color:u,roughness:e,metalness:t,clearcoat:t>.7?.06:.2,clearcoatRoughness:.38});return n.onBeforeCompile=i=>{i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
varying vec3 shipSurface;`).replace("#include <begin_vertex>",`#include <begin_vertex>
shipSurface=position;`),i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 shipSurface;
float shipGrain(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}`),i.fragmentShader=i.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
float grain=shipGrain(floor(shipSurface*19.));float wear=shipGrain(floor(shipSurface*1.7));diffuseColor.rgb*=.965+grain*.055;diffuseColor.rgb*=mix(.86,1.,smoothstep(.08,.38,wear));`),i.fragmentShader=i.fragmentShader.replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+(shipGrain(floor(shipSurface*7.))-.5)*.09,.08,.95);`)},n.customProgramCacheKey=()=>"spacetrader-surface-2",n}function oo(u,e,t,n=.5){n=Math.max(.02,Math.min(n,u*.2,e*.2,t*.2));let i=-u/2+n,r=-e/2+n,a=u-2*n,s=e-2*n,o=new Gt;o.moveTo(i,r),o.lineTo(i+a,r),o.lineTo(i+a,r+s),o.lineTo(i,r+s),o.closePath();let h=new dn(o,{depth:t-n*2,bevelEnabled:!0,bevelThickness:n,bevelSize:n,bevelSegments:2,steps:1,curveSegments:2});return h.translate(0,0,-t/2+n),h}function lo(u){u.updateMatrixWorld(!0);let e=new Map;u.traverse(n=>{if(!n.isMesh)return;let i=n.geometry.clone().applyMatrix4(n.matrixWorld);if(i.index){let a=i.toNonIndexed();i.dispose(),i=a}let r=n.material.uuid;e.has(r)||e.set(r,{material:n.material,geometries:[]}),e.get(r).geometries.push(i)});let t=new Vt;for(let{material:n,geometries:i}of e.values()){let r=new ge;for(let s of["position","normal","uv"]){let o=s==="uv"?2:3,h=i.reduce((f,p)=>f+p.attributes[s].array.length,0),d=new Float32Array(h),m=0;for(let f of i)d.set(f.attributes[s].array,m),m+=f.attributes[s].array.length;r.setAttribute(s,new Ze(d,o))}let a=new Ct(r,n);a.castShadow=!0,a.receiveShadow=!0,t.add(a);for(let s of i)s.dispose()}return u.traverse(n=>{n.isMesh&&n.geometry.dispose()}),t}function co(u){u.updateMatrixWorld(!0);let e=u.children.filter(s=>s.isMesh),t=e.map(s=>new xe().setFromObject(s)),n=e.map((s,o)=>o),i=s=>n[s]===s?s:n[s]=i(n[s]);for(let s=0;s<e.length;s++)for(let o=s+1;o<e.length;o++)t[s].clone().expandByScalar(.015).intersectsBox(t[o])&&(n[i(o)]=i(s));let r=i(0),a=new Map;for(let s=0;s<e.length;s++){let o=i(s);o!==r&&(a.has(o)||a.set(o,[]),a.get(o).push({index:s,type:e[s].geometry.type,position:e[s].position.toArray(),origin:e[s].userData.origin}))}return{meshCount:e.length,detachedGroups:[...a.values()]}}function aa(u){let e=sa[u.shipID];if(!e)throw Error("Unknown hull");let t=globalThis.SpacetraderShipSpecs.balance[u.shipID],n={armor:0,drive:0,tank:0,cargo:0,sensors:0,laser:0,weapons:0,shield:0,ordnance:0,...u.upgrades},i=n.tank*1.155,r=e.length,a=e.width,s=-r/2,o=r/2,h=new Vt,d=[],m=[],f=[],p=[],_=[],x=[],T=[],c={paint:Pt(e.paint),secondary:Pt(new le(e.paint).multiplyScalar(.72),.5,.48),accent:Pt(e.accent,.4,.35),steel:Pt(9346204,.29,.85),dark:Pt(1517103,.52,.5),rubber:Pt(1120799,.78,.08),radiator:Pt(2437690,.48,.68),ceramic:Pt(13028034,.67,.1),glass:new fn({color:1456970,metalness:.45,roughness:.13,clearcoat:1,clearcoatRoughness:.08}),light:new It({color:11854573,emissive:8504808,emissiveIntensity:2,roughness:.3}),red:new It({color:9581862,emissive:10824475,emissiveIntensity:.8}),green:new It({color:5610362,emissive:2848341,emissiveIntensity:.7})},w=(l,v,g=0,S=0,b=0)=>{let A=new Ct(l,v);return A.position.set(g,S,b),u.audit&&(A.userData.origin=new Error().stack.split(`
`).slice(2,5).join(" ")),h.add(A),A},y=(l,v,g,S,b,A,P=c.paint,L=.4)=>w(oo(S,b,A,L),P,l,v,g),C=(l,v,g,S,b,A=c.steel,P=b,L=24)=>{let I=w(new Pe(b,P,S,L,1,!1),A,l,v,g);return I.rotation.z=Math.PI/2,I},R=(l,v,g,S,b=.35,A=c.steel)=>{let P=w(new mn(S,b,6,32),A,l,v,g);return P.rotation.y=Math.PI/2,P},E=(l,v,g=.45,S=c.steel)=>{let b=new M(...l),A=new M(...v),P=A.clone().sub(b),L=w(new Pe(g,g,P.length(),8),S,...b.clone().add(A).multiplyScalar(.5).toArray());return L.quaternion.setFromUnitVectors(new M(0,1,0),P.normalize()),L};function D(l,v,g){h.updateMatrixWorld(!0);let S=new ct(new M(l,1e3,v),new M(0,-1,0)).intersectObjects(h.children,!1)[0];return S?S.point.y:g}let F=(l,v,g,S=12,b=6)=>{v=D(l,g,v)+.15,y(l,v,g,S,.6,b,c.dark,.1);for(let A=0;A<6;A++)y(l-S*.4+A*S*.16,v+.35,g,.5,.45,b*.83,c.steel,.07)},X=[];function N(l,v=c.paint,g=0,S=0){let b=[],A=[],P=[],L=l.map(([H,$,me,Y])=>{let ie=Math.min($*.25,(Y-me)*.24);return[[H,me+S,-$*.7+g],[H,me+ie+S,-$+g],[H,Y-ie+S,-$+g],[H,Y+S,-$*.7+g],[H,Y+S,$*.7+g],[H,Y-ie+S,$+g],[H,me+ie+S,$+g],[H,me+S,$*.7+g]]}),I=(H,$,me)=>{let Y=b.length/3;b.push(...H,...$,...me),A.push(0,0,1,0,1,1),P.push(Y,Y+1,Y+2)};for(let H=0;H<L.length-1;H++)for(let $=0;$<8;$++){let me=L[H][$],Y=L[H+1][$],ie=L[H+1][($+1)%8],rt=L[H][($+1)%8];I(me,ie,Y),I(me,rt,ie)}for(let H=1;H<7;H++)I(L[0][0],L[0][H+1],L[0][H]),I(L.at(-1)[0],L.at(-1)[H],L.at(-1)[H+1]);let G=new ge;G.setAttribute("position",new J(b,3)),G.setAttribute("uv",new J(A,2)),G.setIndex(P),G.computeVertexNormals();let U=w(G,v);return U.material.side=gn,U}function q(l){X=l.map(([v,g,S,b],A)=>{let P=A>0&&A<l.length-1;return[v,g+(P?n.tank*.38+n.cargo*.3+n.armor*.2:0),S,b+(P?n.cargo*.45+n.armor*.18:0)]}),N(X,c.secondary)}function O(l){for(let v=0;v<X.length-1;v++){let g=X[v],S=X[v+1];if(l<=S[0]){let b=Ae.clamp((l-g[0])/(S[0]-g[0]),0,1);return g.slice(1).map((A,P)=>Ae.lerp(A,S[P+1],b))}}return X.at(-1).slice(1)}function Q(l,v,g,S=6){let b=1+n.drive*.045;S*=b,d.push({x:l-9,y:v,z:g,radius:Math.max(S*1.13,S*1.11+.45)});let A=23+n.drive*2;C(l-3.5+A/2,v,g,A,S*.9,c.secondary,S*.82),R(l+18,v,g,S*.85,.6,c.steel);let P=w(new Pe(S*.67,S*1.13,10,40,1,!0),c.steel,l-4,v,g);P.rotation.z=-Math.PI/2;let L=w(new Pe(S*.59,S*1.04,9.6,40,1,!0),c.dark,l-4,v,g);L.rotation.z=-Math.PI/2,R(l-9,v,g,S*1.11,.45),m.push(C(l-3.8,v,g,.8,S*.58,c.light)),R(l-9.15,v,g,S*1.06,.3,c.secondary);for(let I=0;I<5+n.drive*2;I++){let G=2+I*1.8,U=S*Ae.lerp(.9,.82,(G+3.5)/A);R(l+G,v,g,U+.08,.22,I<5?c.steel:c.accent)}for(let I of[-1,1])E([l-6,v+I*S*.85,g],[l+19,v+I*S*.75,g],.45),y(l+11,v+S*.83,g,9,1,3.5,c.dark)}function oe(l,v,g,S,b){y(l,v,g,S,.65,b,c.dark,.15);for(let A=0;A<10+n.drive;A++)y(l-S*.46+A*S*.92/(9+n.drive),v+.45,g,.45,.3,b*.9,c.steel,.05);E([l-S/2,v-.5,g],[l+S/2,v-.5,g],.6)}function de(l,v,g,S,b,A=!1){b*=A?1:1+n.tank*.055;let P=[[0,0],[2,b*.52],[5,b*.87],[8,b],[S-8,b],[S-5,b*.87],[S-2,b*.52],[S,0]],L=P.map(([G,U])=>new B(U,G-S/2)),I=w(new Wt(L,32),c.ceramic,l,v,g);e.kind==="bulk"&&_.push(I),I.rotation.z=Math.PI/2;for(let G of[-1,1]){R(l+G*(S/2-10),v,g,b+.15,.7,c.secondary);let U=l+G*S*.3,[H,$,me]=O(U);E([U,me-.6,Ae.clamp(g,-H*.55,H*.55)],[U,v-b+.4,g],1.1,c.secondary),y(U,v-b+.3,g,3,1.6,b*1.2,c.secondary,.3)}if(y(l,v+b+.1,g,S*.55,.4,1.4,c.accent),n.tank&&!A)for(let G=0;G<n.tank;G++)R(l-S*.18+G*3,v,g,b+.16,.2,c.accent)}function ce(l,v,g,S,b,A,P=c.paint){A+=n.cargo*1.3;let L=y(l,v+A/2,g,S,A,b,P,1);e.kind==="bulk"&&x.push(L),y(l,v+A+.15,g,S-4,.6,b-4,c.secondary,.12);for(let I of[-1,1]){y(l,v+A*.5,g+I*(b/2+.15),S-4,A-3,.4,c.secondary,.08);for(let G=0;G<6;G++)y(l-S*.4+G*S*.16,v+A*.5,g+I*(b/2+.43),.7,A-5,.4,c.steel,.08);y(l,v+A*.22,g+I*(b/2+.38),S*.6,1,.3,c.accent,.04)}for(let I of[-1,1]){let G=l+I*S*.32,[U,H,$]=O(G);E([G,$-.6,Ae.clamp(g,-U*.55,U*.55)],[G,v-.45,g],1.1,c.secondary),E([G,v-.45,g-b*.48],[G,v-.45,g+b*.48],.9,c.secondary);for(let me of[-1,1])y(l+I*(S/2-2),v+.6,g+me*(b/2-1.5),3,2.2,3,c.dark)}}function Ue(l,v){let[g,S,b]=O(l),A=Math.min(g*.25,(b-S)*.24);return v>b-A?Ae.lerp(g,g*.7,(v-(b-A))/A):v<S+A?Ae.lerp(g*.7,g,(v-S)/A):g}let we=["cutter","escort","frigate","interceptor"].includes(e.kind),ve=["lattice","bulk","tanker","tug","miner","salvager","workshop","carrier"].includes(e.kind);if(e.kind==="courier"){q([[s+6,9,0,11],[s+25,a,-2,19],[o-29,a*.83,-1,16],[o-8,7,3,10],[o,2,5,7]]);for(let l of[-1,1])N([[s+6,7,0,9],[s+24,10,-1,12],[o-34,5,1,9],[o-19,1,4,6]],c.paint,l*22),Q(s+1,6,l*22,5.8),oe(s+34,4,l*34,34,11),E([s+27,3,l*18],[s+32,4,l*34],1.5,c.secondary);ce(s+41,18,0,22,21,6)}else if(e.kind==="express"){q([[s+4,8,1,12],[s+33,a,-2,14],[o-22,5,2,10],[o+7,.6,4,6]]);for(let l of[-1,1])N([[s+13,3,0,6],[s+40,9,-1,8],[o-22,1,3,6]],c.paint,l*14),Q(s+1,4,l*15,4.8),oe(s+40,1,l*25,40,6),E([s+24,1,l*11],[s+43,1,l*25],1,c.secondary);Q(s-2,4,0,3)}else if(e.kind==="interceptor"){q([[s+5,8,-3,11],[s+30,11,-2,14],[o-25,7,1,11],[o,2,5,7]]);for(let l of[-1,1])N([[s+1,7,-4,9],[s+25,8,-3,12],[o-32,3,2,9]],c.secondary,l*20),Q(s-2,4,l*20,8),E([s+26,5,l*7],[s+25,5,l*20],1.5,c.secondary),oe(s+36,1,l*30,30,8),E([s+29,2,l*20],[s+35,1,l*30],1.2,c.secondary)}else if(we){q([[s+7,a*.65,-3,13],[s+30,a,-4,21],[o-35,a*.7,0,e.kind==="frigate"?28:20],[o-9,9,4,13],[o+1,2,6,8]]);let l=e.kind==="cutter"?a:e.kind==="interceptor"?a*.95:a*.88;for(let v of[-1,1]){N([[s+1,9,-4,10],[s+27,11,-3,15],[o-34,7,0,12],[o-15,1.5,4,7]],c.secondary,v*l),Q(s-2,4,v*l,e.kind==="interceptor"?8:e.kind==="cutter"?6.5:8),oe(s+47,3,v*(l+12),r*.35,8);for(let g=0;g<4;g++)F(s+31+g*14,16,v*l,10,8)}if(e.kind==="escort"){ce(s+53,20,-13,30,19,8,c.secondary),ce(s+53,20,13,30,19,8,c.secondary);for(let v of[-1,1])Q(s+5,-4,v*14,4)}if(e.kind==="frigate"){N([[s+54,13,22,26],[s+68,18,21,33],[o-40,13,23,34],[o-25,4,20,25]],c.paint);for(let v of[-1,1])de(s+39,7,v*41,47,5.5),E([s+12,3,v*25],[s+42,4,v*41],1.2,c.secondary)}}else{if(q(["miner","salvager","workshop","carrier"].includes(e.kind)?[[s+8,a*.5,-3,8],[s+28,a*.7,-4,12],[o-25,a*.57,-1,14],[o+1,a*.42,2,12]]:[[s+8,a*.5,-3,8],[s+28,a*.7,-4,12],[o-32,a*.57,-1,14],[o-10,8,3,11],[o+1,2,5,7]]),e.kind==="freighter"){for(let g=0;g<3;g++)ce(s+38+g*31,11,0,28,42,18,g%2?c.secondary:c.paint);for(let g of[-1,1])N([[s+17,6,-1,7],[s+35,8,-2,11],[o-25,4,0,8]],c.secondary,g*29)}if(e.kind==="lattice"){for(let g=0;g<4;g++)for(let S of[-1,1])ce(s+39+g*32,13,S*16,28,28,17,g%2?c.paint:c.ceramic),E([s+22+g*32,5,S*32],[s+22+(g+1)*32,6,S*32],1,c.steel),E([s+22+g*32,5,S*32],[s+22+(g+1)*32,12,S*24],.8,c.steel);for(let g of[-1,1])E([s+22,6,g*33],[o-25,6,g*33],1.2,c.secondary)}if(e.kind==="tanker"){for(let g=0;g<3;g++)for(let S of[-1,1])de(s+35+g*38,16,S*16,35,11);for(let g of[-1,1])E([s+17,3,g*30],[o-26,3,g*30],1.5,c.secondary)}if(e.kind==="reefer"){for(let g=0;g<4;g++)ce(s+32+g*30,12,0,27,48,20,c.ceramic),F(s+32+g*30,33.7,0,18,23),y(s+32+g*30,24,24.6,20,2,.45,c.accent,.1);for(let g of[-1,1])E([s+17,4,g*28],[o-21,4,g*28],1.8,c.secondary)}if(e.kind==="tug"){for(let g of[-1,1]){N([[s+5,10,-3,10],[s+31,12,-4,13],[o+9,5,-1,9],[o+14,4,1,7]],c.paint,g*31),y(o+5,3,g*31,13,10,13,c.dark),y(o+6,4,g*26,10,5,4,c.steel);for(let S=0;S<6;S++)y(o-20+S*4,9,g*31,1,.4,6,S%2?c.dark:c.accent,.05)}ce(s+49,11,0,35,25,11,c.secondary),C(s+12,12,0,12,7,c.steel)}if(e.kind==="bulk"){for(let g=0;g<4;g++){de(s+40+g*39,27,0,36,21);for(let S of[-1,1])ce(s+40+g*39,8,S*(31+i),31,18,18,c.secondary)}for(let g of[-1,1])E([s+17,0,g*(39+i)],[o-20,0,g*(39+i)],2,c.secondary),Q(s-2,-7,g*34,6)}if(e.kind==="survey"){N([[s+23,14,12,18],[s+37,19,11,24],[o-33,12,13,22]],c.paint);for(let I of[-1,1])de(s+36,8,I*24,48,7);let g=s+47;E([g,22,0],[g-5,41,0],1),E([g+8,22,0],[g-5,41,0],.75);let S=[new B(0,0),new B(3,.1),new B(8,1.3),new B(13,4)],b=w(new Wt(S,40),c.ceramic,g-5,40,0);b.rotation.x=.22;let A=(I,G,U)=>new M(I*Math.cos(G),U,I*Math.sin(G)).applyEuler(b.rotation).add(b.position).toArray(),P=A(0,0,7),L=w(new Pe(1,1,1.8,16),c.steel,...P);L.rotation.x=.22;for(let I=0;I<3;I++)E(P,A(13,I*Math.PI*2/3,4),.25,c.steel);for(let I of[-1,1])y(o-39,24,I*14,12,5,5,c.dark),y(o-39,26.5,I*14,8,.6,3,c.glass)}let l=e.kind==="tug"?31:e.kind==="bulk"?34:e.kind==="carrier"?37:a*.56,v=e.kind==="bulk"?14:e.kind==="carrier"?16:4;for(let g of[-1,1])Q(s-1,v,g*l,ve?8:6.5),oe(s+34,0,g*(a+11),r*.34,10),E([s+18,1,g*a*.55],[s+33,0,g*(a+11)],1.1,c.secondary)}function ne(l,v=.5,g=c.steel){for(let S=0;S<l.length-1;S++)E(l[S],l[S+1],v,g)}function pe(l,v,g,S,b="x"){let A=R(l,v,g,S,.8,c.secondary),P=R(l,v,g,S*.76,.35,c.steel);b==="y"&&(A.rotation.y=0,A.rotation.x=Math.PI/2,P.rotation.y=0,P.rotation.x=Math.PI/2),b==="z"&&(A.rotation.y=0,P.rotation.y=0);for(let L of[-1,1])y(l+(b==="y"||b==="z"?L*S*.8:0),v+(b==="x"?L*S*.8:0),g,2.2,2.2,2.2,c.accent,.2)}function Ne(l,v,g,S=2){C(l,v,g,4,S,c.steel),R(l,v,g,S+.15,.35,c.secondary)}function Oe(l,v=1.2){for(let g=0;g<l.length-1;g++){let S=new M(...l[g]),b=new M(...l[g+1]),A=b.clone().sub(S),P=["salvager","workshop"].includes(e.kind);if(E(l[g],l[g+1],P?v*.65:v,c.secondary),P){let L=new M().crossVectors(A,new M(0,1,0)).normalize().multiplyScalar(v*1.2);for(let I of[-1,1])E(S.clone().addScaledVector(L,I).toArray(),b.clone().addScaledVector(L,I).toArray(),v*.35,c.steel);for(let I of[.25,.5,.75]){let G=S.clone().addScaledVector(A,I);E(G.clone().sub(L).toArray(),G.clone().add(L).toArray(),v*.24,c.secondary)}}Ne(...l[g],v*1.75)}Ne(...l.at(-1),v*1.5)}function be(l,v,g,S=1){let[b,A,P]=O(l);E([l,P-.5,Ae.clamp(v,-b*.6,b*.6)],[l,g,v],S,c.secondary)}if(e.kind==="interceptor"){for(let l of[-1,1])N([[s+11,4,8,11],[s+35,7,10,17],[o-32,3,11,15]],c.paint,l*16),ne([[s+12,11,l*16],[s+30,17,l*13],[o-34,15,l*9]],.7,c.steel);y(s+31,16,0,24,5,12,c.secondary),F(s+31,19,0,19,9)}if(e.kind==="liner"){for(let l of[-1,1]){for(let v=0;v<3;v++){let g=s+38+v*31;de(g,21,l*15,29,9,!0),y(g,22,l*24,12,3,.5,c.glass,.1);for(let S=0;S<3;S++)y(g-4+S*4,22,l*24.35,.4,3,.3,c.secondary,.04)}E([s+23,15,l*15],[o-29,15,l*15],1.6,c.secondary);for(let v of[s+46,o-47]){let[g,S,b]=O(v);E([v,b-.5,l*8],[v,14,l*30],1.4,c.secondary),C(v,14,l*29,12,3.4,c.paint),R(v+4,14,l*29,3.5,.4)}}y(0,24,0,r*.62,6,9,c.secondary);for(let l of[s+34,o-37])be(l,0,24,1.5);pe(o-28,13,0,4,"y")}if(e.kind==="miner"){ce(s+40,12,0,33,32,20,c.secondary),y(s+38,33,0,25,9,22,c.dark);for(let l=0;l<6;l++)y(s+29+l*4,37,0,1.5,2,22,c.steel,.1);for(let l of[-1,1]){let v=s+69;ce(v,11,l*17,25,22,13,c.paint),be(o-30,l*30,10,2),y(o-30,10,l*30,15,8,13,c.secondary);let g=[[o-30,12,l*30],[o-10,18,l*39],[o+8,8,l*31]];Oe(g,1.8),C(o+12,8,l*31,13,3,c.dark);for(let S=0;S<4;S++)R(o+8+S*2.4,8,l*31,3.1,.6,c.steel);E([o-30,10,l*30],[o-10,17,l*39],.65,c.steel)}}if(e.kind==="salvager"){ce(s+45,12,-20,45,26,17,c.secondary),y(s+43,29,-20,24,7,20,c.paint),F(s+43,33,-20,18,14);for(let l of[-4,27]){be(s+79,l,17,1.6),be(o-25,l,17,1.6),E([s+68,17,l],[o-19,17,l],1.6,c.secondary);for(let v=0;v<5;v++)y(s+73+v*12,18,l,3,3,6,c.accent,.2)}y((s+68+o-19)/2,14.5,11.5,o-19-(s+68),1.5,31,c.dark,.2);for(let l of[s+73,o-29]){E([l,15,-7],[l,15,29],1.2,c.steel);for(let v of[-4,27])be(l,v,17,1.2)}be(s+57,-25,35,2),y(s+57,29,-25,15,13,15,c.secondary),Oe([[s+57,35,-25],[s+80,53,-13],[o-23,34,10]],1.8),E([s+58,38,-25],[s+80,54,-13],.65,c.steel),E([o-23,34,10],[o-23,17,10],.2,c.steel);for(let l of[-1,1])E([o-23,17,10],[o-17,13,10+l*4],.7,c.secondary);C(s+51,33,-25,12,3.5,c.dark);for(let l=0;l<5;l++)R(s+46+l*2,33,-25,3.6,.4)}if(e.kind==="hospital"){for(let l=0;l<3;l++){let v=s+38+l*38;de(v,22,0,35,14,!0),y(v,36,0,17,1,10,c.accent,.15),y(v,36.7,0,2,.5,8,c.ceramic,.05),y(v,36.7,0,7,.5,2,c.ceramic,.05)}for(let l of[-1,1]){E([s+23,14,l*25],[o-25,14,l*25],1.5,c.secondary);for(let v of[s+47,o-48]){be(v,l*25,14,1.3),y(v,18,l*24,19,10,10,c.paint),pe(v,18,l*29,3.8,"z");let g=w(new Pe(2.8,2.8,.4,24),c.dark,v,18,l*29.2);g.rotation.x=Math.PI/2,y(v,23.2,l*24,12,.4,6,c.glass,.1)}ne([[s+22,10,l*15],[s+22,26,l*15],[o-30,26,l*15],[o-30,12,l*15]],.7,c.accent)}}if(e.kind==="workshop"){for(let l of[-1,1]){ce(s+45,11,l*23,42,24,19,c.secondary),y(s+45,30+n.cargo*1.3,l*23,32,2,18,c.paint),be(s+73,l*26,32,2),y(s+73,25,l*26,15,15,16,c.paint),Oe([[s+73,32,l*26],[s+98,48,l*34],[o-24,29,l*22]],2),E([s+74,36,l*26],[s+98,49,l*34],.75,c.steel),y(o-24,29,l*22,10,5,8,c.dark);for(let v of[-1,1])E([o-24,28,l*22],[o-16,24,l*22+v*4],.7,c.steel);for(let v of[s+95,o-37]){let g=l*27;be(v,g,12,1.5),y(v,12,g,24,2,18,c.secondary),y(v,24,g,24,2,18,c.paint),y(v,18,g-l*8,24,12,2,c.dark);for(let S of[-1,1])y(v+S*11,18,g,2,12,18,c.secondary);for(let S=0;S<3;S++)y(v-6+S*6,16,g-l*4,3,5,4,c.steel,.2);for(let S of[-1,1])y(v+S*10,18,g+l*8.5,1,12,1,c.accent,.1)}}for(let l of[s+42,o-50]){for(let v of[-33,33])be(l,v,34,1.2);E([l,34,-33],[l,34,33],1,c.steel)}}if(e.kind==="electronic"){N([[s+24,9,12,18],[s+48,12,10,25],[o-34,8,12,22]],c.paint);for(let l=0;l<3;l++)for(let v of[-1,1]){let g=s+42+l*33,S=v*(25+l*4);be(g,S,21,1.3),E([g-12,21,S],[g+12,21,S],1,c.secondary),y(g,23,S,28,5,14,c.dark);for(let b=0;b<7;b++)y(g-11+b*3.6,25.55,S,1,.4,12,c.radiator,.04);for(let b of[-1,1])y(g+b*13.2,25.45,S,1,.45,14,c.steel,.1),y(g,25.45,S+b*6.6,27,.45,1,c.secondary,.1);for(let b of[-10,10])E([g+b,21,S],[g+b,24,S-v*5],.6,c.steel)}for(let l of[-1,1]){let v=o-40,[g,S,b]=O(v);y(v,b-2,l*8,22,5,7,c.secondary);for(let A=0;A<5;A++)C(v-8+A*4,b-1,l*8,2.5,1,c.dark)}}if(e.kind==="carrier"){for(let g of[-1,1]){let S=s+111,b=g*29,A=17,P=s+52,L=o-35;y((P+L)/2,12,b,L-P,4,36,c.secondary),y((P+L)/2,40,b,L-P,4,36,c.paint);for(let U of[-1,1])y((P+L)/2,26,b+U*A,L-P,28,3,c.secondary);y(P,26,b,3,28,36,c.secondary);for(let U=P+5;U<=L;U+=22)E([U,14,b-A+2],[U,38,b-A+2],.9,c.steel),E([U,38,b-A],[U,38,b+A],1,c.steel),E([U,14,b+A-2],[U,38,b+A-2],.9,c.steel),be(U,b,12,1.5);for(let U=P+6;U<L-4;U+=22){let H=b+g*18.5;y(U,26,H,2.2,29,2,c.secondary,.3),y(U,41,b,3,1,36,c.steel,.15);for(let $ of[16,35])y(U,$,H+g,4,2,1,c.accent,.1)}for(let U of[17,35])y((P+L)/2,U,b+g*18.5,L-P-4,1.4,1.5,c.secondary,.15);for(let U of[-1,1])y(L,26,b+U*15.2,4,27,2,c.accent,.2);y(L,39,b,4,2,32,c.accent,.2);for(let U=0;U<7;U++)y(L-3,14.1,b-12+U*4,3,.35,1.2,c.light,.05);let I=L-31,G=h.children.length;for(let U of[-10,10]){y(I+U,14.3,b,5,.6,24,c.dark,.12);for(let H of[-1,1])y(I+U,14.8,b+H*7,4,1,4,c.accent,.12),E([I+U,15.1,b+H*7],[I+U,19.2,b+H*5],.65,c.steel),y(I+U,18.9,b+H*5,4,1.2,3,c.secondary,.15)}N([[I-22,4,19,25],[I-14,7.5,18,28],[I+7,6,19,27],[I+18,2,21,24]],c.ceramic,b),N([[I-3,4.5,26,28],[I+4,4.4,26,31],[I+12,2.4,24,27]],c.secondary,b),N([[I+4.2,3.7,28.8,30.7],[I+10.8,2.25,26,27.2]],c.glass,b),E([I+4.2,30.7,b],[I+10.8,27.2,b],.22,c.secondary);for(let U of[-1,1])N([[I-21,2.5,20,25],[I-10,3.2,19,26],[I+1,1.8,21,25]],c.secondary,b+U*8),C(I-21.1,22.5,b+U*8,1.2,2.1,c.steel),C(I-21.75,22.5,b+U*8,.25,1.5,c.dark),y(I-4,24,b+U*6.4,12,1.1,.6,c.accent,.08),y(I-10,26.1,b+U*8,5,.5,2,c.radiator,.08);u.audit&&T.push({reserved:new xe(new M(I-23,18,b-11.5),new M(I+19,32,b+11.5)),tenderParts:new Set(h.children.slice(G))});for(let U of[-25,-17,-9,-1,7,15])y(I+U,14.04,b,4,.12,.65,c.accent,.03);for(let U of[s+32,o-52]){if(U<P)be(U,g*51,26,2);else{y(U,12,g*49,18,4,8,c.secondary);for(let H of[-5,5])E([U+H,14,g*51],[U+H,21,g*51],1.2,c.steel)}y(U,26,g*51,16,12,8,c.secondary),F(U,33,g*51,12,6)}for(let U of[s+75,s+113,s+151])y(U,42.15,b,20,.5,12,c.secondary,.15),F(U,42.5,b,15,8);Q(s-3,-8,g*37,9),N([[s+1,12,-18,27],[s+14,13,-18,29],[s+35,10,-3,17]],c.secondary,g*37),E([s+23,5,g*19],[s+23,5,g*37],2,c.secondary)}let l=s+78,v=-29;y(l-17,27,-44,9,30,6,c.secondary,.65);for(let g of[18,27,36])y(l-17,g,-47.1,6,1.4,.7,c.steel,.12);N([[l-23,12,40.5,43],[l-16,15,40.5,46],[l+13,15,40.5,46],[l+22,10,40.5,43]],c.secondary,v),N([[l-15,10,44,53],[l-10,10,44,58],[l+7,8,44,58],[l+12,7,44,54]],c.paint,v);for(let g of[-1,1])E([l-16,43,v+g*12],[l-9,57,v+g*8],1.1,c.secondary),E([l+17,43,v+g*10],[l+6,56,v+g*7],1.1,c.secondary),y(l-4,50,v+g*9.7,12,3,.6,c.dark,.1);N([[l-19,9,55,63],[l-10,13,54,66],[l+10,13,54,66],[l+16,10,56,64]],c.paint,v),y(l+16.08,60,v,.35,4,16,c.glass,.08),y(l-19.08,59,v,.35,2.7,12,c.glass,.08);for(let g of[57.4,60.6])y(l-19.25,g,v,.6,.5,13,c.secondary,.08);for(let g of[-6,0,6])y(l-19.3,59,v+g,.6,3.5,.5,c.secondary,.08);for(let g of[-1,1]){y(l,60.5,v+g*13.08,18,3.8,.35,c.glass,.08);for(let S of[58.35,62.65])y(l,S,v+g*13.2,20,.55,.65,c.secondary,.08);for(let S of[-8,-2,4,8])y(l+S,60.5,v+g*13.28,.55,4.7,.55,c.secondary,.08)}for(let g of[57.8,62.2])y(l+16.25,g,v,.6,.6,17,c.secondary,.08);for(let g of[-8,-3,3,8])y(l+16.3,60,v+g,.6,4.8,.55,c.secondary,.08);y(l,66,v,23,1.2,25,c.secondary,.45),y(l-4,67.2,v,10,1.4,10,c.paint,.3),y(l-4,68,v,8,.3,8,c.dark,.08),E([l-11,66,v],[l-11,73,v],.6,c.steel),y(l-11,71.5,v,2,3.2,6,c.secondary,.25),y(l-11,73.3,v,1.5,.5,2,c.light,.1),y(l-15.1,49,v,1,8,5,c.dark,.2),y(l-15.7,49,v,.4,6,3,c.paint,.15);for(let g of[-14,-3,8])E([l+g,45.7,v-13.5],[l+g,48.5,v-13.5],.25,c.steel);E([l-14,48.5,v-13.5],[l+8,48.5,v-13.5],.25,c.steel);for(let g of[-1,1])ne([[s+24,8,g*23],[s+24,44,g*23],[o-37,44,g*23],[o-37,40,g*23]],1,c.steel)}if(["liner","hospital"].includes(e.kind)){let l=s+r*.57,[v,g,S]=O(l);y(l,g-1-n.cargo*.6,0,r*.32,3+n.cargo*1.5,v*.85,c.secondary,.6);for(let b of[-1,1])y(l,g-1-n.cargo*.6,b*v*.4,r*.28,1,.5,c.accent,.1)}let Lt=[s+24,s+r*.46];for(let l of Lt){let[v,g,S]=O(l),b=-v*.35,A=D(l,b,S);y(l,A+.45,b,10,1.4,7,c.dark,.2);for(let P=0;P<4;P++)y(l-3+P*2,A+1.16,b,.5,.3,5.5,c.steel,.04);for(let P of[-1,1])y(l+P*4,A+.3,b,1.4,.8,7.8,c.secondary,.1)}for(let l of[-1,1]){let v=s+r*.62,g=l*O(v)[0]*.5,S=D(v,g,O(v)[2]);ne([[v-6,D(v-6,g,S)-.1,g],[v-6,S+2,g],[v+7,S+2,g],[v+7,D(v+7,g,S)-.1,g]],.38,c.steel)}if(e.kind==="courier"){pe(s+37,-2,0,5.2,"y"),y(s+38,-3.4,0,15,1.7,13,c.secondary);for(let l of[-1,1])ne([[s+19,9,l*22],[s+30,11,l*18],[s+47,11,l*18]],.55,c.steel),y(s+16,12,l*22,8,2,7,c.accent),y(s+44,5,l*37,6,2,4,c.dark)}else if(e.kind==="express"){N([[s+24,4,11,13],[s+37,6,10,18],[o-31,2,10,14]],c.secondary);for(let l of[-1,1]){N([[s+21,1,4,6],[s+39,8,3,7],[o-31,1,6,8]],c.accent,l*22);for(let v=0;v<4;v++)y(s+26+v*5,15-v*.3,0,1.5,.35,4,c.steel,.05)}}else if(e.kind==="freighter"){for(let l=0;l<3;l++)for(let v of[-1,1]){let g=s+38+l*31,S=v*23;for(let b of[-1,1])E([g+b*14,8,S],[g+b*14,32+n.cargo*1.3,S],1.1,c.secondary);E([g-14,32+n.cargo*1.3,S],[g+14,32+n.cargo*1.3,S],.9,c.secondary),y(g,9,S,24,2.5,3,c.accent);for(let b of[-1,1])y(g+b*11,12,S,4,4,3,c.dark)}ne([[s+24,7,0],[s+24,34,0],[o-30,34,0],[o-30,D(o-30,0,O(o-30)[2])-.2,0]],.7,c.steel)}else if(e.kind==="lattice"){for(let l=0;l<4;l++)for(let v of[-1,1]){let g=s+39+l*32,S=v*33;E([g-15,6,S],[g-15,36+n.cargo*1.3,S],1.3,c.secondary),E([g-15,36+n.cargo*1.3,S],[g+15,36+n.cargo*1.3,S],1.1,c.secondary),E([g-15,8,S],[g+15,35+n.cargo*1.3,S],.75,c.steel),y(g,35+n.cargo*1.3,0,28,1,14,c.dark);let[b,A,P]=O(g);E([g,P-.5,0],[g,35+n.cargo*1.3,0],1,c.secondary);for(let L of[-1,1])E([g,35+n.cargo*1.3,L*6],[g,37+n.cargo*1.3,L*6],.5,c.steel)}for(let l of[-1,1])E([s+23,37+n.cargo*1.3,l*6],[o-29,37+n.cargo*1.3,l*6],.55,c.accent),y(s+13,10,l*29,15,9,12,c.secondary)}else if(e.kind==="tanker"){for(let l of[-1,1]){ne([[s+16,9,l*16],[s+16,31+n.tank*.6,l*16],[o-29,31+n.tank*.6,l*16],[o-29,11,l*16]],.8,c.steel);for(let v=0;v<3;v++){let g=s+35+v*38;E([g,6,l*30],[g,24,l*30],.8,c.secondary),y(g,24,l*30,9,2,5,c.accent),ne([[g,22,l*24],[g,22,l*31],[g+9,22,l*31]],.45,c.steel)}}E([s+15,31,-19],[s+15,31,19],1,c.secondary),pe(s+15,31,0,4)}else if(e.kind==="reefer")for(let l of[-1,1]){ne([[s+16,5,l*28],[s+16,18,l*28],[o-24,18,l*28],[o-24,8,l*28],[o-21,4,l*28]],.8,c.accent);for(let v=0;v<4;v++){let g=s+32+v*30;y(g,26,l*24.35,15,9,.8,c.secondary,.3),y(g,26,l*24.75,12,6,.35,c.ceramic,.3),y(g+4,26,l*24.98,1,2,.4,c.steel,.05),E([g,18,l*24],[g,18,l*28],.8,c.secondary)}}else if(e.kind==="tug"){for(let l of[-1,1]){let v=l*31;E([o-10,4,v],[o+12,0,l*24],1.4,c.steel),y(o+12,0,l*24,8,8,6,c.secondary),y(o+14,0,l*20,7,5,3,c.steel);for(let g=0;g<3;g++)R(s+12+g*2,12,0,7.2,.45,c.dark);E([s+27,-5,l*20],[o-8,-5,l*20],1.6,c.secondary),E([s+30,-5,l*20],[o-5,2,l*31],1,c.steel)}ne([[s+12,12,0],[s+29,12,0],[o-12,3,0]],.7,c.dark)}else if(e.kind==="bulk"){for(let l=0;l<4;l++)for(let v of[-1,1]){let g=s+40+l*39;E([g-16,-1,v*(41+i)],[g-16,32,v*(41+i)],1.4,c.secondary),E([g-16,32,v*(41+i)],[g+16,32,v*(41+i)],1,c.steel),E([g-16,0,v*(41+i)],[g+16,27,v*(41+i)],.9,c.secondary),y(g,26.15+n.cargo*1.3,v*(31+i),29,1.2,5,c.dark),y(g,26.8+n.cargo*1.3,v*(31+i),27,.3,1.5,c.accent,.05),E([g,26+n.cargo*1.3,v*(33+i)],[g,28.5+n.cargo*1.3,v*(33+i)],.5,c.steel)}for(let l of[-1,1])E([s+20,28.5+n.cargo*1.3,l*(33+i)],[o-24,28.5+n.cargo*1.3,l*(33+i)],.6,c.accent),N([[s+1,13,-17,24],[s+14,15,-17,26],[s+30,9,1,13]],c.secondary,l*34)}else if(e.kind==="survey")for(let l of[-1,1]){let v=l*38;E([s+36,11,l*24],[s+40,14,v],1,c.secondary),oe(s+57,14,v,56,16),ne([[o-40,19,l*9],[o-24,20,l*16],[o-13,20,l*16]],.65,c.steel),C(o-10,20,l*16,8,2,c.dark),C(o-6.05,20,l*16,.3,1.4,c.glass),y(s+32,26,0,18,5,12,c.secondary)}else if(e.kind==="cutter")for(let l of[-1,1]){N([[s+31,9,12,16],[s+43,13,9,23],[o-18,5,6,13]],c.paint,l*22);for(let v=0;v<3;v++)y(s+33+v*9,19-v*.8,l*22,7,.8,12,c.secondary,.25);y(s+15,10,l*30,11,4,9,c.accent)}else if(e.kind==="escort"){N([[s+35,14,22,27],[s+49,18,21,36],[o-44,12,22,31]],c.secondary);for(let l of[-1,1]){N([[s+28,12,6,13],[s+48,15,5,22],[o-31,8,4,16]],c.paint,l*31);for(let v=0;v<3;v++)F(s+29+v*12,23,l*31,9,10);y(s+14,2,l*40,15,5,6,c.accent)}}else if(e.kind==="frigate")for(let l of[-1,1]){N([[s+34,8,8,15],[s+67,12,6,20],[o-25,6,5,15],[o+7,1,7,10]],c.secondary,l*29),E([s+28,7,l*30],[s+60,25,l*16],1.2,c.steel);for(let v=0;v<5;v++)y(s+68+v*12,31,l*15,8,.8,5,v%2?c.paint:c.secondary,.2);y(o-35,16,l*19,15,4,5,c.dark),y(o-32,18.2,l*19,8,.3,3,c.glass,.1)}if(e.kind==="courier")for(let l of[-1,1]){let v=s+32,g=l*34;y(v,4,g,7,2.2,4,c.secondary),C(v,4,g,6,1.2,c.steel)}if(e.kind==="express"){let l=s+34,[v,g,S]=O(l);for(let b of[-1,1])ne([[s+19,7,b*15],[l,S-.3,b*5],[o-31,11,b*5]],.45,c.steel)}if(e.kind==="tanker")for(let l=0;l<3;l++)for(let v of[-1,1]){let g=s+35+l*38,S=v*30;y(g,23.6,S,5,2.4,5,c.secondary),C(g,24.2,S,4,1.5,c.accent)}if(e.kind==="tug")for(let l of[-1,1])C(o+6,2,l*25,5,2.4,c.steel),y(s+12,8.5,l*7,8,4,3,c.secondary);if(e.kind==="freighter"||e.kind==="lattice"||e.kind==="bulk")for(let l of[s+29,o-29]){let[v,g,S]=O(l);y(l,S-.25,0,10,1.8,8,c.secondary),pe(l,S+.4,0,2.4,"y")}if(we)for(let l of[-1,1]){let v=s+40,[g,S,b]=O(v),A=o-37,P=l*8;ne([[s+21,D(s+21,l*a*.5,12)-.2,l*a*.5],[v,b-.2,l*g*.45],[A,D(A,P,O(A)[2])-.2,P]],.5,c.steel)}let Je=h.children.length,We=[],Ee=o-25;function Be(l,v=1,g=1,S=[1,0,0],b=.16){let A=l.map(I=>new M(...I)),P=new M().crossVectors(A[1].clone().sub(A[0]),A[3].clone().sub(A[0])).normalize();P.dot(new M(...S))<0&&P.negate();let L=(I,G)=>A[0].clone().lerp(A[1],I).lerp(A[3].clone().lerp(A[2],I),G).addScaledVector(P,.025);for(let I=0;I<v;I++)for(let G=0;G<g;G++){let U=(I+.065)/v,H=(I+.935)/v,$=(G+.09)/g,me=(G+.91)/g,Y=[L(U,$),L(H,$),L(H,me),L(U,me)],ie=new ge;ie.setAttribute("position",new J([...Y[0],...Y[1],...Y[2],...Y[0],...Y[2],...Y[3]],3)),ie.setAttribute("uv",new J([0,0,1,0,1,1,0,0,1,1,0,1],2)),ie.computeVertexNormals();let rt=w(ie,c.glass);rt.material.side=gn;for(let Kn=0;Kn<4;Kn++)E(Y[Kn].toArray(),Y[(Kn+1)%4].toArray(),b,c.secondary);We.push({pane:rt,point:L((U+H)*.5,$+(me-$)*.43),normal:P})}}function he(l,v,g,S=c.paint){Ee=l;let b=O(l)[2],A=D(l,v,b),P=A-b<=6?Math.max(b-.1,A):b-.1,L=g.map(([I,G,U])=>[l+I,G,O(l+I)[2]-.8,P+U+O(l+I)[2]-b]);return N(L,S,v),{x:l,z:v,y:P,p:L}}function k(l,v=2,g=1,S=.8){let[b,A,P,L]=l.p.at(-1),I=Math.min(A*.25,(L-P)*.24),G=P+I+.25,U=L-I-.25,H=A*S;U<=G||Be([[b,G,l.z-H],[b,G,l.z+H],[b,U,l.z+H],[b,U,l.z-H]],v,g)}function V(l,v,g=2){let S=l.p[v],b=l.p[v+1];Be([[S[0],S[3],l.z-S[1]*.66],[b[0],b[3],l.z-b[1]*.66],[b[0],b[3],l.z+b[1]*.66],[S[0],S[3],l.z+S[1]*.66]],g,1,[0,1,0])}function z(l,v,g=2,S=0,b=1){let A=l.p[v],P=l.p[v+1],L=I=>Math.min(I[1]*.25,(I[3]-I[2])*.24);for(let I of[-1,1])Be([[A[0],Ae.lerp(A[2]+L(A)+.35,A[3]-L(A)-.35,S),l.z+I*A[1]],[P[0],Ae.lerp(P[2]+L(P)+.35,P[3]-L(P)-.35,S),l.z+I*P[1]],[P[0],P[3]-L(P)-.35,l.z+I*P[1]],[A[0],A[3]-L(A)-.35,l.z+I*A[1]]],g,b,[0,0,I])}function j(l,v,g=3){let[S,b,A,P]=l.p.at(-1);y(S-1,P+.25,l.z,g,.7,v,c.secondary,.15)}function Z(l,v,g,S,b){let A=[];for(let U=0;U<32;U++){let H=U*Math.PI*2/32;A.push(new M(v+.025,g+Math.sin(H)*S,l.z+Math.cos(H)*b))}let P=new M(v+.025,g,l.z),L=[];for(let U=0;U<32;U++)L.push(...P,...A[U],...A[(U+1)%32]);let I=new ge;I.setAttribute("position",new J(L,3)),I.setAttribute("uv",new Ze(new Float32Array(L.length/3*2),2)),I.computeVertexNormals();let G=w(I,c.glass);G.material.side=gn;for(let U=0;U<32;U++)E(A[U].toArray(),A[(U+1)%32].toArray(),.2,c.secondary);E([v+.04,g-S,l.z],[v+.04,g+S,l.z],.15,c.secondary),We.push({pane:G,point:new M(v+.025,g+S*.25,l.z+b*.3),normal:new M(1,0,0)})}switch(u.shipID){case"kestrel":{let l=he(o-24,0,[[-15,5,4],[-7,8,8],[4,8,8],[12,6,4.5]]);V(l,2,2),y(l.x-8,l.y+8.3,0,3,.6,11,c.secondary);break}case"swift":{let l=he(o-30,0,[[-20,2.5,1.5],[-11,4.2,5.5],[4,3.8,5.1],[17,1.1,1.2]]);V(l,1,3),V(l,2,1),y(l.x-13,l.y+5,0,3,1.6,4,c.secondary);break}case"merlin":{let l=he(o-29,0,[[-14,3,2],[-5,7,6],[7,4.5,4],[14,.9,1]]);V(l,1,2),V(l,2,1);for(let v of[-1,1])E([l.x-6,l.y+5.8,v*5],[l.x+10,l.y+2,v*2.2],.45,c.secondary);break}case"osprey":{let l=he(o-29,0,[[-14,8,3],[-6,10,6],[8,8,5],[11,7,4.4]],c.secondary);k(l,3,1,.83),j(l,16,5);for(let v of[-1,1])y(l.x+7,l.y+1.5,v*7.2,9,1.8,3,c.paint);break}case"heron":{Ee=o-29;let l=O(Ee)[2]+.7,v=6.3;y(Ee,l-.5,0,19,2,14,c.secondary,.7),w(new Pe(v,v+1,1.2,16),c.paint,Ee,l,0);let g=new pn(v,24,12,0,Math.PI*2,0,Math.PI/2);g.scale(1.32,.8,1);let S=w(g,c.glass,Ee,l+.5,0);S.material.side=gn;let b=(L,I)=>[Ee+v*1.32*Math.sin(L)*Math.cos(I),l+.5+v*.8*Math.cos(L),v*Math.sin(L)*Math.sin(I)];for(let L=0;L<8;L++)for(let I=0;I<10;I++)E(b(I*Math.PI/20,L*Math.PI/4),b((I+1)*Math.PI/20,L*Math.PI/4),.14,c.secondary);for(let L of[Math.PI/3,Math.PI/2])for(let I=0;I<40;I++)E(b(L,I*Math.PI/20),b(L,(I+1)*Math.PI/20),.14,c.secondary);let A=new M(...b(.85,.35)),P=new M(A.x-Ee,(A.y-l-.5)*2,A.z).normalize();We.push({pane:S,point:A,normal:P});break}case"petrel":{let l=he(o-23,-6,[[-11,6,5],[-6,7,10],[8,7,10],[11,6,9]],c.ceramic);k(l,3),z(l,1,3),j(l,15,5),y(l.x-6,l.y+11,l.z,8,2,10,c.secondary);break}case"peregrine":{let l=he(o-22,0,[[-13,7,6],[-8,9,9],[9,9,9],[12,8,8]]);k(l,3),z(l,1,3),j(l,18,4),y(l.x-7,l.y+9.3,0,5,.9,14,c.secondary);break}case"tern":{let l=he(o-23,0,[[-13,9,4],[-5,11,8],[9,9,7],[12,7.5,6]],c.ceramic);k(l,2,1,.7),z(l,1,2),j(l,18,6);for(let v of[-1,1])E([l.x-5,l.y+7.8,v*9],[l.x+11,l.y+5.7,v*7],.65,c.ceramic);break}case"curlew":{let l=he(o-24,0,[[-14,6.5,4],[-8,7.5,9],[5,7.5,9],[12,6.5,8]],c.ceramic);k(l,5),z(l,1,4,.65),V(l,1,3),j(l,21,3);break}case"cormorant":{let l=he(o-34,8,[[-10,5,4],[-4,6,10],[8,6,10],[11,4.5,7]]);k(l,2,2),z(l,1,2),j(l,12,4),y(l.x-8,l.y+4,l.z,4,8,9,c.secondary);break}case"sanderling":{let l=he(o-25,-5,[[-10,5,4],[-4,6,7],[7,6,7],[10,4.8,5.8]],c.secondary);k(l,2),z(l,1,2);for(let v of[-1,1])E([l.x-5,l.y+7.5,l.z+v*6],[l.x+9,l.y+6.8,l.z+v*5],.45,c.steel),E([l.x+9,l.y+.7,l.z+v*5],[l.x+9,l.y+6.8,l.z+v*5],.45,c.steel);E([l.x+9,l.y+6.8,l.z-5],[l.x+9,l.y+6.8,l.z+5],.45,c.steel);break}case"gannet":{let l=he(o-29,0,[[-19,10,4],[-10,10,10],[7,9,9],[12,8.5,7.5]],c.secondary);k(l,4,2,.8),z(l,1,3),j(l,19,5),N([[l.x-14,7,l.y+9,l.y+12],[l.x-3,8,l.y+9,l.y+12],[l.x+3,6,l.y+8,l.y+10]],c.paint);break}case"rook":{let l=he(o-26,4,[[-11,4,3],[-4,4.5,8],[7,4.5,8],[12,3,4.5]]);V(l,2,2),z(l,1,3),k(l,2),y(l.x-6,l.y+O(l.x-6)[2]-O(l.x)[2]+7,l.z,5,1,8,c.secondary);break}case"ibis":{let l=he(o-25,0,[[-13,5,3],[-7,8,8],[7,8,8],[11,6.5,7]],c.ceramic),v=l.p.at(-1);Z(l,v[0],(v[2]+v[3])*.5,2,5.1),V(l,1,3),y(l.x-10,D(l.x-10,0,l.y+5)+.35,0,4,.8,10,c.paint);break}case"gyrfalcon":{let l=he(o-30,0,[[-20,6,3],[-9,9,7],[6,7,5],[14,4.5,2.7]],c.secondary);V(l,1,3);for(let v of[-1,1])N([[-13,2,3,7.5],[3,2,2,6.2],[13,1,0,2]].map(([g,S,b,A])=>[l.x+g,S,l.y+O(l.x+g)[2]-O(l.x)[2]+b,l.y+O(l.x+g)[2]-O(l.x)[2]+A]),c.paint,v*7);y(l.x-12,D(l.x-12,0,l.y+7)+.5,0,5,1.2,8,c.dark);break}case"albatross":{let l=he(o-23,0,[[-13,8,7],[-8,9.5,13],[8,9.5,13],[12,8,12]],c.paint);k(l,4,2),z(l,1,3,0,2),j(l,19,5),y(l.x-2,l.y+6.5,0,23,.7,20,c.secondary),y(l.x-7,l.y+13.5,0,8,1,14,c.secondary);break}case"crane":{Ee=o-26;let l=O(Ee)[2];y(Ee-4,l+1,0,12,3,24,c.secondary,.6);for(let v of[-1,1]){let g=he(Ee,v*8,[[-9,4,3],[-3,4.5,7],[7,4.5,7],[10,3.5,6]],c.paint);k(g,2),V(g,1,2),j(g,9,3)}break}case"nightjar":{let l=he(o-29,0,[[-18,4,1.2],[-9,7,4],[7,5,3.2],[14,2.5,1]],c.secondary),v=l.x+3,g=l.y+4;y(v,g,0,6,1.6,8,c.secondary);for(let S of[-1,0,1]){let b=C(v+3.1,g,S*2,1,.5,c.glass);We.push({pane:b,point:new M(v+3.6,g+.13,S*2+.15),normal:new M(1,0,0)})}break}case"pelican":{let l=he(o-26,7,[[-13,5,7],[-7,6.5,16],[8,6.5,16],[11,5.8,14.7]],c.paint);k(l,3,2,.82),z(l,1,3),j(l,14,5),y(l.x-5,l.y+16.4,l.z,8,.8,11,c.secondary);break}case"condor":{Ee=o-31;for(let l of[-1,1]){let v=he(Ee,l*5,[[-10,3,1],[-3,3.5,3.3],[6,2.8,2],[10,1.8,.7]],c.secondary);V(v,1,2)}break}}h.updateMatrixWorld(!0);let re=h.children.slice(Je),ee=new xe;for(let l of re)ee.union(new xe().setFromObject(l));for(let l=s+25;l<o-40;l+=13){let[v,g,S]=O(l);for(let b of[-1,1]){let A=Math.min(v*.54,10),P=y(l,S+.18+n.armor*.09,b*v*.36,11,.5+t.armor+n.armor*.2,A,n.armor?c.paint:c.secondary,.12);for(let L=0;L<n.armor;L++)y(l-3.5+L*2.2,S+.43+n.armor*.19,b*v*.36,.5,.3,A*.8,c.steel,.04);y(l,S-3,b*(v+.1),10,3,.4+n.armor*.3,c.paint,.14)}l%2&&F(l,S+.6,0,8,4)}for(let l of[-1,1]){let v=o-17,[g,S,b]=O(v);y(v,b-1,l*(Ue(v,b-1)+.12),3,1,1,l<0?c.red:c.green,.12);for(let A=s+21;A<o-34;A+=29){let[P,L,I]=O(A);y(A,I-3,l*(Ue(A,I-3)+.08),8,1,.3,c.accent,.08),y(A+5,I-3,l*(Ue(A+5,I-3)+.08),1,1,.3,c.ceramic,.08)}}let ue=s+27,[_e,Se,Xe]=O(ue);if(y(ue,Xe+.15,0,8,.6,9,c.dark,.2),y(ue,Xe+.45,0,6,.3,7,c.paint,.2),y(ue+1,Xe+.63,0,2,.22,.4,c.steel,.05),n.tank&&!["tanker","bulk","survey","frigate"].includes(e.kind))for(let l of[-1,1]){let v=s+38,[g,S,b]=O(v),A=l*(g*.9+1.5),P=2+n.tank*.45;C(v,(S+b)*.5,A,r*.2,P,c.secondary);for(let L=0;L<n.tank+1;L++)R(v-r*.07+L*3,(S+b)*.5,A,P+.2,.2,c.accent)}if(n.cargo&&["express","cutter","frigate","survey","interceptor","electronic","carrier"].includes(e.kind)){let l=s+43,[v,g,S]=O(l);y(l,S+n.cargo*.6,0,r*.17,1.2+n.cargo,Math.min(v,13),c.secondary,.6);for(let b=0;b<n.cargo+1;b++)y(l-r*.06+b*4,S+n.cargo*.6+(1.2+n.cargo)/2+.1,0,1,.3,Math.min(v-2,10),c.steel,.1)}let Dt=t.laser,Ce=n.laser,Ut=Dt.counts[Ce],ht=o-13,[_n,qn,Yn]=O(ht),ua=(qn+Yn)*.5,da=e.kind==="express"?10:["miner","salvager","workshop","carrier"].includes(e.kind)?9:3,fs=Math.ceil(Ut/8),Zn=Math.ceil(Ut/fs);for(let l=0;l<Ut;l++){let v=Math.floor(l/Zn),g=Math.min(Zn,Ut-v*Zn),S=l%Zn,b=g===1?0:(S/(g-1)*2-1)*_n*.72,A=ua+(v-(fs-1)/2)*3.2,P=g===1?8:_n*1.44/(g-1),L=Math.min(.55+Dt.strength[Ce]*.02+Ce*.035,P*.32,.98),I=da+(Dt.type==="beam"?2:0);N([[ht-11,1.1+L*.5,A-1.4,A+.8],[ht-6,1.3+L*.5,A-1.4,A+1.7],[o-4+I,.8+L*.3,A-.8,A+.8]],c.secondary,b),C(o-5+I,A,b,9,L,c.steel);let G=C(o-.6+I,A,b,.3,L*.68,c.light);f.push(G),R(o-1+I,A,b,L*.9,.14,c.secondary);for(let U=0;U<2+Ce;U++){let H=ht-5+U*1.5,$=Ae.lerp(1.7,.8,(H-(ht-6))/(o-4+I-(ht-6)));y(H,A+$+.05,b,.35,.25,1.8,c.steel,.04)}}let ur=t.weapons,gs=ur.counts[n.weapons];if(gs){let l=e.kind==="carrier"?o-18:o-45,[v,g,S]=O(l),b={freighter:29,lattice:34,reefer:30,bulk:44+i,tanker:32,tug:31,survey:23,carrier:6}[e.kind];for(let A of[-1,1]){let P=A*(b||v*.62),L=e.kind==="bulk"?5:b?Math.min(S-1,12):S-1;if(b){for(let G of[-5,8])E([l+G,S-3,A*v*.6],[l+G,L-2,P],1.05,c.secondary);y(l+3,L-2,P,24,2.5,9,c.secondary,.5)}N([[l-9,3,L-4,L],[l,4.5,L-4,L+5],[l+17,3,L-2,L+3],[l+24,1,L,L+1]],c.secondary,P);let I=gs/2;y(l+9,L+4.2,P,16,1.8,6.5,c.secondary,.2);for(let G=0;G<I;G++){let U=P+(G-(I-1)/2)*1.6,H=L+5.4,$=18+n.weapons*2,me=l+16+$/2;if(ur.type==="rail")for(let ie of[-1,1])y(l+16,H,U+ie*.42,$,.8,.38,c.steel,.09);else{C(l+16,H,U,$,.6,c.steel);for(let ie=0;ie<(ur.type==="coil"?4:2);ie++)R(l+9+ie*2,H,U,.6,.12,c.secondary)}let Y=C(me+.08,H,U,.2,.38,c.dark);p.push(Y)}for(let G=0;G<2+n.weapons;G++)y(l-1+G*2.5,L+4.8,P,1.1,.9,5,c.accent,.13)}}let pa=t.ordnance,dr=pa.counts[n.ordnance];if(dr){let l=dr/2,v=s+r*.53,g=l*3.3+2,S=0,b=Math.max(...[-1,1].flatMap(A=>[-1,1].map(P=>D(v+A*g*.4,P*3,O(v)[2]))),D(v,S,O(v)[2]))+.8;for(let A of[-g*.4,g*.4])for(let P of[-3,3])E([v+A,D(v+A,P,O(v+A)[2])-.1,P],[v+A,b,P],.45,c.secondary);y(v,b,S,g,1.6,8,c.secondary,.3);for(let A=0;A<l;A++)for(let P of[-1,1]){let L=v+(A-(l-1)/2)*3.3,I=P*2;w(new Pe(1,1,.7,16),c.steel,L,b+.9,I),w(new Pe(.8,.8,.25,16),c.dark,L,b+1.33,I),y(L,b+1.5,I,1.1,.13,.3,c.accent,.04)}}let ma=t.shieldBase+t.shieldRating*[0,1,2.2,3.6][n.shield],vs=ma?2+n.shield*2:0;for(let l=0;l<vs/2;l++)for(let v of[-1,1]){let g=s+r*(.22+l*.16),S=v*O(g)[0]*.3,b=Math.max(...[-1,1].flatMap(P=>[-1,1].map(L=>D(g+P*1.8,S+L,O(g)[2])))),A=b+.55;for(let P of[-1.8,1.8])for(let L of[-1,1])E([g+P,D(g+P,S+L,O(g+P)[2])-.1,S+L],[g+P,A,S+L],.25,c.secondary);y(g,A,S,4.5,1.1,2.8,c.secondary,.25),y(g,A+.65,S,3.4,.35,1.8,c.glass,.12);for(let P of[-1,1])y(g+P*1.8,A+.65,S,.35,.5,2,c.steel,.06)}if(n.sensors){let l=s+22,[v,g,S]=O(l);for(let b of[-1,1]){y(l,S+.7,b*v*.45,8+n.sensors*2,1.4,4+n.sensors,c.secondary,.4),y(l,S+1.5,b*v*.45,6+n.sensors*2,.25,2+n.sensors,c.glass,.1);for(let A=0;A<n.sensors;A++)y(l-2+A*2,S+1.7,b*v*.45,.5,.2,2,c.steel,.04)}}let fa=(l,v,g)=>{h.updateMatrixWorld(!0);let S=new ct(new M(l,-1e3,v),new M(0,1,0)).intersectObjects(h.children,!1)[0];return S?S.point.y:g};for(let l of["liner","hospital"].includes(e.kind)?[.27,.53,.83]:[.32,.53,.74]){let v=s+r*l,[g,S,b]=O(v),A=Math.min(g*.42,ve?12:we?9:7),P=Math.min(22,r*.1),L=v-P/2,I=v+P/2,G=.55+n.armor*.15,U=[...new Set([L,I,...X.map(Y=>Y[0]).filter(Y=>Y>L&&Y<I),...Array.from({length:5},(Y,ie)=>L+P*(ie+1)/6)])].sort((Y,ie)=>Y-ie),H=U.map(Y=>[Y,A,fa(Y,0,O(Y)[1])]),$=Y=>{for(let ie=1;ie<H.length;ie++)if(Y<=H[ie][0])return Ae.lerp(H[ie-1][2],H[ie][2],(Y-H[ie-1][0])/(H[ie][0]-H[ie-1][0]));return H.at(-1)[2]};N(H.map(([Y,ie,rt])=>[Y,ie,rt-G,rt+.12]),c.secondary);let me=[L+1,...U.filter(Y=>Y>L+1&&Y<I-1),I-1];N(me.map(Y=>[Y,A*.5,$(Y)-G-.08,$(Y)-G+.1]),c.radiator);for(let Y of[L+1,I-1])for(let ie of[-1,1])w(new Pe(.45,.45,.25,8),c.steel,Y,$(Y)-G-.03,ie*A*.74)}function _s(l,v,g,S,b=0){let A=new Xt(g,S,3,1);A.rotateX(-Math.PI/2),A.rotateY(b);let P=A.attributes.position;for(let I=0;I<P.count;I++){let G=l+P.getX(I),U=v+P.getZ(I);P.setXYZ(I,G,D(G,U,O(G)[2])+.008,U)}A.computeVertexNormals();let L=w(A,c.dark);L.userData.surfaceWear=!0}if(u.hull<60)for(let l=0;l<9;l++){let v=s+27+l*r*.05,[g,S,b]=O(v);_s(v,-g*.45,4,.25,.4+l%3*.3)}if(u.hull<35)for(let l=0;l<4;l++)_s(Ee-8+l*4,-5,1.8,2.3);if(typeof document<"u"){let l=null;for(let v of[20,16,12,8]){for(let g of[0,8,16,24,32,40]){let S=Math.max(s+20,ee.min.x-13-g),b=v/4;for(let A of[0,-O(S)[0]*.35,O(S)[0]*.35]){let P=[];for(let L=0;L<=8;L++)for(let I=0;I<=2;I++)P.push(D(S-v/2+L*v/8,A-b/2+I*b/2,O(S)[2]));if(Math.max(...P)-Math.min(...P)<2.4){l={x:S,z:A,length:v,width:b};break}}if(l)break}if(l)break}if(l){let v=document.createElement("canvas");v.width=512,v.height=128;let g=v.getContext("2d");g.clearRect(0,0,512,128),g.fillStyle="#283942",g.font="600 50px sans-serif",g.fillText(u.shipID.toUpperCase(),14,53),g.font="20px sans-serif",g.fillText("COMPACT REGISTRY   /   "+e.kind.toUpperCase(),16,91),g.fillRect(16,110,290,4);for(let Y=0;Y<10;Y++)g.fillRect(350+Y*13,23,5+Y%3,89);let S=new Fn(v);S.colorSpace=Fe;let b=new cn({map:S,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1}),{x:A,z:P,length:L,width:I}=l,[G,U,H]=O(A),$=new Xt(L,I,8,2),me=$.attributes.position;for(let Y=0;Y<me.count;Y++){let ie=A+me.getX(Y),rt=P-me.getY(Y);me.setXYZ(Y,ie,D(ie,rt,H)+.018,rt)}$.computeVertexNormals(),w($,b)}}let ke=u.audit?co(h):null;if(u.audit){h.updateMatrixWorld(!0),ke.cargoPodIntersections=[];for(let[l,v]of _.entries())for(let[g,S]of x.entries())new xe().setFromObject(v).intersectsBox(new xe().setFromObject(S))&&ke.cargoPodIntersections.push([l,g]);ke.occludedDrives=m.map((l,v)=>{let g=l.position,S=l.geometry.parameters.radiusTop,b=new ct(new M(g.x-1e3,g.y+S*.23,g.z+S*.17),new M(1,0,0)).intersectObjects(h.children,!1)[0];return b?.object===l?null:{index:v,hit:b?.object.userData.origin}}).filter(l=>l!==null),ke.occludedLasers=f.map((l,v)=>{let g=l.position,S=new ct(new M(g.x+1e3,g.y+l.geometry.parameters.radiusTop*.23,g.z+l.geometry.parameters.radiusTop*.17),new M(-1,0,0)).intersectObjects(h.children,!1)[0];return S?.object===l?null:{index:v,hit:S?{position:S.point.toArray(),origin:S.object.userData.origin}:null}}).filter(l=>l!==null)}if(u.audit){ke.hangarIntrusions=[],ke.weatheredCockpitWindows=[],ke.cockpitWindows=We.length,ke.coveredCockpitWindows=We.map((g,S)=>{let b=[g.normal,g.normal.clone().add(new M(.7,.7,0)).normalize(),g.normal.clone().add(new M(-.5,.8,0)).normalize(),g.normal.clone().add(new M(0,2.5,0)).normalize()],A;for(let P of b){if(A=new ct(g.point.clone().addScaledVector(P,500),P.clone().negate()).intersectObjects(h.children,!1)[0],A?.object===g.pane)return null;if(A?.object.userData.surfaceWear)return ke.weatheredCockpitWindows.push(S),null}return{index:S,hit:A?.object.userData.origin}}).filter(g=>g!==null),ke.occludedKinetics=p.map((g,S)=>{let b=g.position,A=g.geometry.parameters.radiusTop,P=new ct(new M(b.x+1e3,b.y+A*.23,b.z+A*.17),new M(-1,0,0)).intersectObjects(h.children,!1)[0];return P?.object===g?null:{index:S,hit:P?.object.userData.origin}}).filter(g=>g!==null);let l=new et,v=new xe;for(let[g,S]of T.entries())for(let b of h.children){if(!b.isMesh||S.tenderParts.has(b)||!v.setFromObject(b).intersectsBox(S.reserved))continue;let A=b.geometry.attributes.position,P=b.geometry.index,L=P?P.count:A.count;for(let I=0;I<L;I+=3){for(let[G,U]of[l.a,l.b,l.c].entries())U.fromBufferAttribute(A,P?P.getX(I+G):I+G).applyMatrix4(b.matrixWorld);if(S.reserved.intersectsTriangle(l)){ke.hangarIntrusions.push({bay:g,origin:b.userData.origin});break}}}}let yn=lo(h);yn.userData={shipID:u.shipID,kind:e.kind,upgrades:{...n},visualVersion:9,cockpitStyle:ra[u.shipID],cockpitWindowCount:We.length,weaponMounts:{energy:f.length,kinetic:p.length,ordnance:dr},shieldEmitterCount:vs,driveApertures:d,...ke?{attachmentAudit:ke}:{}};let ga=new xe().setFromObject(yn),ys=ga.getCenter(new M);yn.position.copy(ys).multiplyScalar(-1);let it=new Vt;it.add(yn),it.scale.set(...e.scale.map(l=>l*t.length/(r*e.scale[0])));let va=new xe().setFromObject(it),xs=va.getSize(new M),Jn=ee.clone().translate(ys.clone().negate());return Jn.min.multiply(it.scale),Jn.max.multiply(it.scale),it.userData={...yn.userData,...e.kind==="carrier"?{hangarClearance:{length:156*it.scale.x,height:24*it.scale.y,beam:28.4*it.scale.z}}:{},radius:xs.length()*.5,dimensions:xs.toArray(),features:[ra[u.shipID],...e.features],cockpitBounds:{min:Jn.min.toArray(),max:Jn.max.toArray()}},it}function oa(u){u.traverse(e=>{e.isMesh&&(e.geometry.dispose(),e.material.map&&e.material.map.dispose(),e.material.dispose())})}var la=9,ca="approved-catalogue",ha=u=>[.788*u[0]-.615*u[1],-.251*u[0]-.321*u[1]+.913*u[2]];function ho(u,e){let t=[],n=u.positions,i=u.normals,r=u.colors,a=[-.3,-.45,.84],s=[.562,.721,.408];for(let o=0;o<n.length;o+=9){if(i[o]*s[0]+i[o+1]*s[1]+i[o+2]*s[2]<-.05)continue;let h=.3+.7*Math.max(0,i[o]*a[0]+i[o+1]*a[1]+i[o+2]*a[2]),d=[0,1,2].map(p=>Math.round(Math.min(1,r[o+p]*h)*255).toString(16).padStart(2,"0")).join(""),m=[],f=0;for(let p=0;p<9;p+=3){let _=n.subarray(o+p,o+p+3),x=ha(_);m.push([200+(x[0]-e.cx)*e.scale,122.5-(x[1]-e.cy)*e.scale]),f+=_[0]*s[0]+_[1]*s[1]+_[2]*s[2]}t.push({points:m,fill:d,depth:f})}return t.sort((o,h)=>o.depth-h.depth),t}function uo(u,e,t){let n=aa(u),i=n.userData;n.updateMatrixWorld(!0);try{let r=[],a=0;n.traverse(c=>{c.isMesh&&!(c.material.map&&c.material.transparent)&&(r.push(c),a+=c.geometry.attributes.position.count)});let s=Object.fromEntries(["positions","normals","colors","surfaces","uvs"].map(c=>[c,new Float32Array(a*3)])),o=new M,h=new M,d=new K,m=0,f=1/0,p=-1/0,_=1/0,x=-1/0;for(let c of r){let w=c.geometry,y=c.material,C=(y.color||new le(16777215)).clone().convertLinearToSRGB(),R=y.emissive?Math.max(y.emissive.r,y.emissive.g,y.emissive.b)*(y.emissiveIntensity??1):0;d.getNormalMatrix(c.matrixWorld);for(let E=0;E<w.attributes.position.count;E++){o.fromBufferAttribute(w.attributes.position,E).applyMatrix4(c.matrixWorld),h.fromBufferAttribute(w.attributes.normal,E).applyNormalMatrix(d);let D=m+E*3;s.positions.set([o.x,-o.z,o.y],D),s.normals.set([h.x,-h.z,h.y],D),s.colors.set([C.r,C.g,C.b],D),s.surfaces.set([y.roughness??.45,y.metalness??.25,Math.min(1,R)],D),s.uvs.set([Ae.clamp(w.attributes.uv.getX(E),0,1),Ae.clamp(w.attributes.uv.getY(E),0,1),0],D);let F=ha(s.positions.subarray(D,D+3));f=Math.min(f,F[0]),p=Math.max(p,F[0]),_=Math.min(_,F[1]),x=Math.max(x,F[1])}m+=w.attributes.position.count*3}let T={scale:Math.min(354/(p-f),203/(x-_)),cx:(f+p)/2,cy:(_+x)/2};return{key:t,mesh:s,projection:T,get polygons(){return ho(s,T)},width:400,height:245,caption:e,graphics:{source:ca,revision:la,shipID:u.shipID,dimensions:[...i.dimensions],cockpitStyle:i.cockpitStyle,features:[...i.features],weaponMounts:{...i.weaponMounts},shieldEmitterCount:i.shieldEmitterCount},bytes:a*3*5*4}}finally{oa(n)}}return Ea(po);})();
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
if(typeof module!=='undefined')module.exports=SpacetraderShipGraphics;
