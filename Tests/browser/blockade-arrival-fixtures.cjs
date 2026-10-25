'use strict';
// Synthetic fixtures only. Wage-only checks need a fresh quiet world/route;
// inspection checks must finish any mandatory arrival battle before customs.
module.exports.quiet=(E,s,to)=>{for(let n=0;n<1200;n++){s.blockadeWorld={version:1,startDay:s.day,stations:[]};const q=E.quote(s,to),day=s.day+q.coastDays+q.waitDays+8;if(E.blockadeStation({...s,day},to)?.status!=='blockaded')return s;s.day+=30;}throw Error('No quiet synthetic arrival period');};
module.exports.dock=s=>s.battle?.stationBlockade?require('./combat-v2-balance.cjs').play(s):s;
