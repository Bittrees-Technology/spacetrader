'use strict';
// Freight tests start with an already-owned cargo escort, independent of the
// registry's experience gates and randomized inventory (tested elsewhere).
module.exports=function addFreightEscort(E,s,shipID='peregrine'){
 const h=E.ships.find(h=>h.id===shipID),v={id:'freight-escort-'+s.fleet.length,name:'Freight '+shipID,shipID,hull:100,location:s.location,fuel:h.tankTonnes*.5,spares:h.maxSpares,cargo:{},cargoBasis:{},upgrades:Object.fromEntries(E.upgradeCatalog.map(m=>[m.id,0])),ammo:0,ordnanceAmmo:0,fittingEdition:2,escort:true};s.fleet.push(v);E.validate(s);return s;
};
