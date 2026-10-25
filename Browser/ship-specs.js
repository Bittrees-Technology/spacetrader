'use strict';
(function(root){
 const specs={
  kestrel:{emitters:2,laser:'Courier pulse pair',bankPower:8,review:['Seated the cargo pod on transverse saddles tied into the keel.','Embedded the docking collar, hatch, heat-exchanger hinges and laser lenses into their housings.'],addition:'Cargo saddle locks and connected drive-to-radiator service lines.'},
  swift:{emitters:1,laser:'Compact axial pulse laser',bankPower:7,review:['Closed nozzle coil gaps and extended the upgraded drive casing under every coil.','Seated the single axial laser and dorsal service panels into the narrow pressure hull.'],addition:'A continuous dorsal cooling channel and three supported nozzle service collars.'},
  osprey:{emitters:2,laser:'Heavy cutter pulse pair',bankPower:11,review:['Snapped boom cooling grilles to the actual sloped surface.','Embedded cheek armor, lenses and thermal plates in their shoulder foundations.'],addition:'Armored optical cheek bays and linked laser heat-exchanger rails.'},
  heron:{emitters:1,laser:'Survey-defense beam emitter',bankPower:8,review:['Connected the dish feed receiver to its bowl and support mast.','Seated optical caps against their barrels and instrument windows inside their frames.'],addition:'A three-spoke receiver support, braced optical benches and service collars.'},
  petrel:{emitters:2,laser:'Tanker defense pulse pair',bankPower:8,review:['Replaced hanging tank feet with diagonal hull-rooted saddles.','Joined the transfer collar and lugs to the cross-feed gantry.'],addition:'Individual tank valve blocks and positive manifold attachment points.'},
  peregrine:{emitters:2,laser:'Freight-defense pulse pair',bankPower:9,review:['Connected every container saddle to the hull and outboard floor beams.','Lowered detached lids and service strips onto the actual cargo modules.'],addition:'Positive container locks, braced saddle rails and accessible cargo-spine fixtures.'},
  tern:{emitters:2,laser:'Thermally isolated pulse pair',bankPower:9,review:['Seated the insulated doors, handles and cooling grilles against their module surfaces.','Clamped both thermal lines to cargo walls and returned their ends to the frame.'],addition:'Thermal pipe clamps and distinct insulated service-door surrounds.'},
  cormorant:{emitters:2,laser:'Industrial defense pair',bankPower:10,review:['Checked fork roots, articulated clamps and the winch cradle against the main structure.','Anchored cargo saddles and all laser optics rather than leaving small face gaps.'],addition:'Visible clamp pivot pins, captive winch bearings and reinforced handling saddles.'},
  gannet:{emitters:4,laser:'Quad convoy pulse battery',bankPower:12,review:['Set cooling grilles onto the stepped command and shoulder roofs.','Checked the four-nozzle carrier frame and added a common foundation for each laser pair.'],addition:'Split optical banks, protected cooler beds and convoy-store saddle ties.'},
  gyrfalcon:{emitters:4,laser:'Quad patrol beam battery',bankPower:16,review:['Checked the long patrol booms and tank saddles at the central spine.','Seated forward optics and all forward emitters in integrated shoulder/chine housings.'],addition:'Patrol cooling rails, twin-bank optical foundations and foredeck service panels.'},
  albatross:{emitters:4,laser:'Distributed freighter pulse battery',bankPower:10,review:['Supported the formerly floating central walkway with keel-rooted columns.','Joined the walkway rails with balusters and attached each container to a transverse saddle.'],addition:'A load-bearing raised service passage, rail posts and distributed defense optics.'},
  pelican:{emitters:4,laser:'Distributed bulk-defense battery',bankPower:10,review:['Lowered floating gantry floors onto the side modules and joined their handrails with posts.','Attached large pod saddles to the keel and seated every cooling collar and lens.'],addition:'Module-level service platforms, guardrail posts and supported defense emitters.'}
 };
 const prototypes=[
  {
    "id": "merlin",
    "name": "Merlin",
    "role": "Fast interceptor",
    "price": 120000,
    "dryMass": 12,
    "cargoTonnes": 2,
    "tankTonnes": 32,
    "isp": 54000,
    "thrustFactor": 1.3,
    "maxSpares": 3,
    "kineticBase": 13,
    "description": "A compact interception hull wrapped around oversized drive machinery. Recessed twin lasers and small stores suit independent pursuit or convoy escape support; two tonnes of freight leave little room for trading."
  },
  {
    "id": "curlew",
    "name": "Curlew",
    "role": "Passenger and personnel transport",
    "price": 288000,
    "dryMass": 34,
    "cargoTonnes": 14,
    "tankTonnes": 100,
    "isp": 53000,
    "thrustFactor": 1,
    "maxSpares": 4,
    "kineticBase": 10,
    "description": "A long personnel liner with segmented passenger cabins, paired life-support trunks and recessed baggage holds. Its 24 dedicated berths support certified passenger charters with real mass, daily care costs, deadlines and welfare duties."
  },
  {
    "id": "sanderling",
    "name": "Sanderling",
    "role": "Prospecting and mining vessel",
    "price": 420000,
    "dryMass": 42,
    "cargoTonnes": 36,
    "tankTonnes": 120,
    "isp": 51000,
    "thrustFactor": 0.82,
    "maxSpares": 6,
    "kineticBase": 14,
    "description": "An industrial prospecting ship with an articulated excavation frame, protected collection bins and a factory mining rig. It extracts finite surveyed ore and ice reserves; raw ore occupies hold space until paid refinery processing."
  },
  {
    "id": "rook",
    "name": "Rook",
    "role": "Salvage recovery vessel",
    "price": 600000,
    "dryMass": 50,
    "cargoTonnes": 40,
    "tankTonnes": 150,
    "isp": 52000,
    "thrustFactor": 0.84,
    "maxSpares": 7,
    "kineticBase": 15,
    "description": "An asymmetric recovery crane sits beside an open wreck cradle and sealed assessment workshop. Proposed salvage work recovers equipment from lawful wreck sites; recovery rights and hazards still matter."
  },
  {
    "id": "ibis",
    "name": "Ibis",
    "role": "Medical support vessel",
    "price": 720000,
    "dryMass": 40,
    "cargoTonnes": 12,
    "tankTonnes": 160,
    "isp": 54000,
    "thrustFactor": 0.95,
    "maxSpares": 6,
    "kineticBase": 10,
    "description": "Isolated treatment modules and a protected ambulance docking gallery surround a long pressure spine. Eight dedicated medical berths support clinic transfer charters unlocked through prior passenger service and supervised medical research."
  },
  {
    "id": "crane",
    "name": "Crane",
    "role": "Mobile fleet workshop",
    "price": 1260000,
    "dryMass": 78,
    "cargoTonnes": 30,
    "tankTonnes": 260,
    "isp": 53000,
    "thrustFactor": 0.78,
    "maxSpares": 12,
    "kineticBase": 16,
    "description": "A travelling repair yard with twin articulated service booms, sheltered work bays and stocked engineering racks. Proposed remote repairs consume parts and time, giving distant expeditions a reason to bring a workshop."
  },
  {
    "id": "nightjar",
    "name": "Nightjar",
    "role": "Electronic warfare and reconnaissance",
    "price": 1440000,
    "dryMass": 36,
    "cargoTonnes": 6,
    "tankTonnes": 145,
    "isp": 56000,
    "thrustFactor": 1.05,
    "maxSpares": 5,
    "kineticBase": 12,
    "description": "A narrow dark pressure hull carries broad directional arrays, armored signal rooms and dedicated heat rejection. Proposed active jamming trades a combat action and heat for disrupted enemy targeting."
  },
  {
    "id": "condor",
    "name": "Condor",
    "role": "Expedition carrier",
    "price": 2400000,
    "dryMass": 155,
    "cargoTonnes": 65,
    "tankTonnes": 620,
    "isp": 55000,
    "thrustFactor": 0.72,
    "maxSpares": 14,
    "kineticBase": 20,
    "description": "A heavy twin-hangar carrier with a raised offset command block, deep service decks and reinforced docking apertures. Carries two approved owned small craft; loaded mass counts against propulsion while embarked craft provide no active holds, tanks or weapons. Deploy at safely stopped licensed ports."
  }
];
 Object.assign(specs,{
  "merlin": {
    "emitters": 2,
    "laser": "Interceptor pulse pair",
    "bankPower": 10,
    "review": [
      "Drive-rooted laser cheeks and a compact armored spine.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Oversized twin drives, supported radiator strakes and recessed optical bays."
  },
  "curlew": {
    "emitters": 2,
    "laser": "Transport defense pair",
    "bankPower": 8,
    "review": [
      "Pressure cabins connect through saddles and continuous life-support trunks.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Six habitation drums, captive escape capsules and a passenger docking gallery."
  },
  "sanderling": {
    "emitters": 2,
    "laser": "Mining defense pair",
    "bankPower": 10,
    "review": [
      "Excavator arms are pinned into full-width deck foundations.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Crusher machinery, tapered mineral hoppers and articulated tool heads."
  },
  "rook": {
    "emitters": 2,
    "laser": "Recovery defense pair",
    "bankPower": 10,
    "review": [
      "The asymmetric recovery boom roots into a reinforced side workshop.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Open wreck cradle, recovery winch, grapples and assessment compartments."
  },
  "ibis": {
    "emitters": 2,
    "laser": "Medical defense pair",
    "bankPower": 8,
    "review": [
      "Treatment modules and docking collars have seated pressure connections.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Three isolation wards, ambulance docking ports and protected life-support services."
  },
  "crane": {
    "emitters": 4,
    "laser": "Workshop defense battery",
    "bankPower": 12,
    "review": [
      "Both service booms use substantial deck pedestals and captive joint pins.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Twin repair arms, open service bays, equipment racks and overhead gantries."
  },
  "nightjar": {
    "emitters": 2,
    "laser": "Reconnaissance beam pair",
    "bankPower": 10,
    "review": [
      "Directional arrays are supported along their backs and rooted into crossmembers.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Staggered signal panels, shielded electronics rooms and ventral decoy cells."
  },
  "condor": {
    "emitters": 4,
    "laser": "Carrier defense battery",
    "bankPower": 14,
    "review": [
      "Hangar roofs, walls and decks share continuous frames; command tower is hull-rooted.",
      "Standard and refitted hardware use connected foundations; proposed abilities do not alter this visual preview."
    ],
    "addition": "Two open hangars, stored utility craft, raised command block and four main drives."
  }
});
 for(const hull of prototypes)Object.freeze(hull);Object.freeze(prototypes);
 const angleReviews={
  "kestrel": [
    "Forward pulse optics clear the bow in both standard and upgraded fits.",
    "Ventral servicing bays and seated latches give the compact courier a maintained working hull."
  ],
  "swift": [
    "Moved the axial laser beyond the needle bow so its lens is fully exposed.",
    "Checked the three compact drives, radiator roots and enlarged cargo fairing; underside access panels follow the narrow hull."
  ],
  "osprey": [
    "Cooling-line ends now return to the shoulder skin instead of projecting above it.",
    "Checked cheek armor, twin optics and optional railguns; belly access bays use the broader armored footprint."
  ],
  "heron": [
    "All three receiver braces now use the dish bowl\u2019s actual tilt, with their ends on the rim.",
    "The forward defense optic clears the bow; survey outriggers and optional weapons retain separate supported mounts."
  ],
  "merlin": [
    "Closed the cooling pipes into the pressure hull, removing the unintended upright prongs.",
    "Checked the compact twin-drive frame, forward optics and optional weapons across the narrow interception spine."
  ],
  "petrel": [
    "Tank-feed pipe roots enter the pressure drums rather than ending beside them.",
    "Checked manifold clearance, all six tank saddles and outboard weapons at maximum tank size."
  ],
  "peregrine": [
    "Each container portal now has a supported upright at both ends.",
    "The overhead service trunk returns to the forward hull instead of ending above the bow; weapon bays remain clear of freight modules."
  ],
  "tern": [
    "Checked insulated doors, thermal lines and roof cooling banks at standard and maximum hold size.",
    "Added conformal underside service bays and verified that the forward optics remain visible."
  ],
  "curlew": [
    "Passenger cabins retain their dimensions when propellant upgrades are selected.",
    "Checked cabin saddles, escape-capsule supports and the ventral freight pod; end-on framing now includes the complete hull."
  ],
  "cormorant": [
    "Checked the fork roots, pivot pins, winch and free-ended grapples from both sides.",
    "Added seated ventral machinery access bays while preserving clearance around the handling fork."
  ],
  "sanderling": [
    "Checked both excavator joints, tool collars, hoppers and crusher clearances.",
    "Forward defense optics remain separate from the drill heads; underside servicing panels follow the processing keel."
  ],
  "gannet": [
    "Checked all four separate drive apertures and the distributed optical banks.",
    "Cooling lines terminate on the armor; wider ventral service bays reinforce the heavy escort silhouette."
  ],
  "rook": [
    "Recovery boom rails, cross-ties and pins now read as one reinforced crane.",
    "Checked the suspended grapple cable, open cradle and workshop at maximum refit; underside access bays remain seated."
  ],
  "ibis": [
    "Treatment wards remain fixed while separate fuel jackets and the freight pod expand.",
    "Checked ambulance collars, life-support galleries and weapon clearances; the new underside panels follow the actual lower surfaces."
  ],
  "gyrfalcon": [
    "Checked the patrol booms, outboard tanks and forward optical banks.",
    "Cooling-line ends return to the hull and the underside receives reinforced access bays rather than a blank slab."
  ],
  "albatross": [
    "Checked container saddles, cross-braced frames and the keel-rooted central walkway at full hold expansion.",
    "Verified the distributed optical bank and added lower service bays without intruding into cargo frames."
  ],
  "crane": [
    "Reinforced both articulated service booms with captive side rails and cross-ties.",
    "Checked repair-bay roof clearance, tool heads and optional weapon mounts from both sides and below."
  ],
  "nightjar": [
    "Added seated perimeter frames so the dark signal arrays remain legible.",
    "Checked all six array roots, the decoy cells and optional weapons; lower service panels remain flush with the electronic hull."
  ],
  "pelican": [
    "Separated the four drive apertures into supported upper/lower pairs, with open exhaust throats.",
    "Side cargo modules, walkways and weapon mounts now move outward with enlarged central pods, preserving clearance through all tank levels."
  ],
  "condor": [
    "Separated the four engines into supported vertical pairs and kept fairings forward of the exhaust throats.",
    "Finished the port command tower with a seated pressure lift, tapered supports, framed bridge glazing and roof communications. Replaced placeholder hangar shapes with two cold-drive utility tenders on docking cradles."
  ]
};
 for(const [id,review]of Object.entries(angleReviews))specs[id].review=review;
 // Catalogue balance revision. Existing game data remains isolated in Browser/engine.js.
 const weaponTypes={
  pulse:{name:'Pulse laser',range:7,heat:18,shield:1,armor:1,ammo:0,reload:1},
  beam:{name:'Continuous beam',range:10,heat:30,shield:1.35,armor:.75,ammo:0,reload:1},
  burst:{name:'Burst laser',range:6,heat:24,shield:1.1,armor:.9,ammo:0,reload:1},
  defensive:{name:'Tracking defense laser',range:4,heat:14,shield:.8,armor:.8,ammo:0,reload:1,intercept:4},
  coil:{name:'Coilgun',range:8,heat:24,shield:.8,armor:1.25,ammo:1,reload:1},
  rail:{name:'Railgun',range:12,heat:38,shield:.7,armor:1.6,ammo:1,reload:2},
  cannon:{name:'Rapid-fire cannon',range:4,heat:16,shield:.65,armor:1.05,ammo:2,reload:1,intercept:5},
  missile:{name:'Guided missile',range:16,heat:12,shield:1.2,armor:1.15,ammo:1,reload:2},
  torpedo:{name:'Heavy torpedo',range:12,heat:18,shield:.85,armor:1.8,ammo:1,reload:3}
 };
 // id, nominal hull length (m), hull points, base armor, factory shield, retrofit rating,
 // laser type, emitter counts, per-emitter strength, kinetic type/counts/strength,
 // ordnance type/tubes/strength. Each array is standard, tier 1, tier 2, tier 3.
 const balanceRows=[
  ['kestrel',32,120,.04,0,25,'pulse',[2,2,2,4],[5,7,10,8],'coil',[0,2,2,2],[0,9,13,18],'missile',[0,2,2,2],[0,22,30,40]],
  ['swift',27,90,.03,0,15,'pulse',[1,1,2,2],[7,10,8,11],'cannon',[0,2,2,2],[0,5,7,10],'missile',[0,2,2,2],[0,18,24,32]],
  ['osprey',44,220,.16,40,40,'burst',[4,4,6,6],[7,10,9,12],'coil',[2,2,4,4],[12,17,15,21],'missile',[2,2,4,4],[28,36,34,45]],
  ['heron',50,160,.06,0,35,'beam',[1,2,2,2],[10,8,12,17],'coil',[0,2,2,2],[0,10,14,19],'missile',[0,2,2,2],[0,24,32,42]],
  ['merlin',37,180,.12,25,30,'burst',[2,4,4,4],[10,7,11,15],'cannon',[2,2,4,4],[7,10,9,13],'missile',[2,2,4,4],[24,32,28,38]],
  ['petrel',74,280,.06,0,45,'defensive',[2,2,4,4],[6,9,7,10],'cannon',[0,2,2,4],[0,7,10,8],'missile',[0,2,2,4],[0,26,36,30]],
  ['peregrine',80,320,.07,0,50,'pulse',[2,4,4,4],[7,5,8,11],'coil',[0,2,2,4],[0,12,17,14],'missile',[0,2,2,4],[0,28,38,32]],
  ['tern',78,300,.08,0,45,'pulse',[2,2,4,4],[7,10,8,11],'cannon',[0,2,2,4],[0,8,11,9],'missile',[0,2,2,4],[0,26,36,30]],
  ['curlew',86,340,.09,40,55,'defensive',[4,4,4,6],[5,7,10,9],'cannon',[0,2,4,4],[0,8,7,10],'missile',[0,2,2,4],[0,26,36,30]],
  ['cormorant',91,440,.13,0,60,'pulse',[2,4,4,6],[9,7,10,9],'coil',[0,2,4,4],[0,15,13,19],'torpedo',[0,2,2,2],[0,48,65,85]],
  ['sanderling',68,400,.14,0,45,'beam',[2,2,2,4],[9,13,18,13],'coil',[0,2,2,4],[0,14,20,16],'torpedo',[0,2,2,2],[0,42,58,78]],
  ['gannet',102,700,.24,160,95,'defensive',[6,6,8,8],[8,11,11,15],'coil',[4,4,6,6],[15,20,18,25],'missile',[4,4,6,6],[38,48,44,58]],
  ['rook',96,520,.16,0,65,'pulse',[4,4,4,6],[7,10,14,12],'coil',[0,2,4,4],[0,16,14,20],'torpedo',[0,2,2,4],[0,50,68,56]],
  ['ibis',110,480,.10,75,70,'defensive',[4,4,6,6],[6,9,8,11],'cannon',[0,2,4,4],[0,9,8,12],'missile',[0,2,2,4],[0,30,42,35]],
  ['gyrfalcon',128,950,.26,240,125,'beam',[8,8,10,12],[12,16,17,19],'rail',[4,4,6,6],[28,38,35,48],'torpedo',[4,4,6,6],[65,85,80,105]],
  ['albatross',158,980,.11,0,110,'pulse',[4,6,6,8],[8,8,12,12],'coil',[0,2,4,4],[0,20,18,26],'missile',[0,2,4,4],[0,40,35,48]],
  ['crane',170,1100,.18,0,125,'defensive',[6,6,8,8],[7,10,10,14],'coil',[0,2,4,4],[0,20,18,26],'torpedo',[0,2,4,4],[0,62,54,74]],
  ['nightjar',118,500,.10,100,85,'beam',[2,4,4,6],[12,9,13,12],'rail',[0,2,2,4],[0,24,34,28],'missile',[2,2,4,4],[36,48,42,58]],
  ['pelican',205,1600,.15,0,150,'defensive',[8,8,10,12],[7,10,10,11],'cannon',[0,4,6,8],[0,10,10,11],'missile',[0,4,6,8],[0,38,36,40]],
  ['condor',340,2200,.22,280,180,'defensive',[10,12,14,16],[8,9,11,13],'cannon',[4,4,6,8],[10,14,13,14],'missile',[4,4,6,8],[42,56,52,62]]
 ];
 const balance={};
 for(const [id,length,hullPoints,armor,shieldBase,shieldRating,laserType,laserCounts,laserStrength,kineticType,kineticCounts,kineticStrength,ordnanceType,ordnanceCounts,ordnanceStrength]of balanceRows){
  balance[id]={length,hullPoints,armor,shieldBase,shieldRating,shieldUpgrade:true,laser:{type:laserType,counts:laserCounts,strength:laserStrength},weapons:{type:kineticType,counts:kineticCounts,strength:kineticStrength},ordnance:{type:ordnanceType,counts:ordnanceCounts,strength:ordnanceStrength}};
  Object.assign(specs[id],{emitters:laserCounts[0],bankPower:laserCounts[0]*laserStrength[0],laser:weaponTypes[laserType].name});
 }
 const fittings=[
  {id:'armor',name:'Armor reinforcement',rate:4,detail:'Reinforced hull plating reduces the remaining unarmored damage by 7% per tier. Base armor differs by class; shield absorption occurs first.'},
  {id:'drive',name:'Engine optimization',rate:5,detail:'Adds 2.5% specific impulse and 1% base dry mass per tier.'},
  {id:'tank',name:'Propellant tanks',rate:3,detail:'Adds 15% tank capacity and 2% base dry mass per tier.'},
  {id:'cargo',name:'Cargo framework',rate:3,detail:'Adds 10% gross hold capacity and 3% base dry mass per tier. Internal refit space is deducted afterward.'},
  {id:'sensors',name:'Fire-control sensors',rate:3,detail:'Adds 5 percentage points to weapon accuracy per tier; normal accuracy limits still apply.'},
  {id:'laser',name:'Energy weapon package',rate:5,detail:'Class-specific pulse, beam, burst or tracking lasers. Higher tiers improve total output and may add emitters; see the fitted weapon table. Energy based: no ammunition or cargo-space charge.'},
  {id:'weapons',name:'Kinetic weapon package',rate:6,detail:'Class-specific coilguns, railguns or rapid-fire cannons. Combat hulls include a factory battery; civilian hulls add one at tier 1.'},
  {id:'shield',name:'Shield generator',rate:7,detail:'Factory shields vary by class. Retrofitting adds 1× / 2.2× / 3.6× the class generator rating. Restores 10% capacity per round after two rounds without a hit.'},
  {id:'ordnance',name:'Missile / torpedo package',rate:6,detail:'Guided missiles or heavy torpedoes by class. Higher tiers improve warhead strength and may add launch tubes. Ammunition and reload time apply.'}
 ];
 function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const item of Object.values(value))freeze(item);Object.freeze(value);}return value;}
 // Total internal hold allowance at each refit tier, as a share of base cargo.
 // Factory services/magazines are already excluded from the advertised base hold.
 const cargoSpace=freeze({
  ammunitionTonnes:{round:.015,missile:.08,torpedo:.35},
  fractions:{laser:[0,0,0,0],weapons:[0,.025,.05,.085],ordnance:[0,.035,.075,.12],shield:[0,.03,.065,.10],sensors:[0,.005,.01,.02]},
  weaponFactors:{pulse:1,beam:1.35,burst:1.15,defensive:.8,coil:1,rail:1.3,cannon:.8,missile:1,torpedo:1.5},
  descriptions:{laser:'Energy based · no ammunition or cargo-space charge',weapons:'Weapon services and empty magazine hardware',ordnance:'Launch services and empty magazine hardware',shield:'Generator and power conditioning',sensors:'Fire-control processors and service equipment'}
 });
 const carrierPolicies=freeze({condor:{berths:2,allowedShipIDs:['kestrel','swift','merlin'],baseDryMassLimit:14,clearanceMargin:1}});
 freeze(balance);freeze(weaponTypes);freeze(fittings);
 for(const value of Object.values(specs)){Object.freeze(value.review);Object.freeze(value);}Object.freeze(specs);
 const api=Object.freeze({priceOverrides:Object.freeze({swift:16800,peregrine:200000}),hullPriceMultiplier:1.2,specs,prototypes,balance,weaponTypes,fittings,carrierPolicies,cargoSpace});root.SpacetraderShipSpecs=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
