'use strict';
module.exports=E=>{
 let s=E.transact(E.fresh(),'create',{name:'Warehouse transfer QA',background:'engineer',temperament:'measured'});s.credits=1000000;s=E.transact(s,'warehouse-buy',{port:'earth'});s.upgrades.weapons=1;s.ammo=8;s.spares=1;s.cargo={water:2};s.cargoBasis={water:{units:2,cost:200}};
 for(const [id,location,escort] of [['escort','earth',true],['reserve','earth',false],['remote','moon',false]]){const v=E.activeHull(s);Object.assign(v,{id,name:id,location,escort,cargo:{water:3},cargoBasis:{water:{units:3,cost:450}},ammo:4,spares:1});s.fleet.push(v);}
 Object.assign(s.warehouses.earth,{cargo:{food:4},cargoBasis:{food:{units:4,cost:800}},spares:3,ammo:0,ammunition:{coil:20}});E.validate(s);return s;
};
