'use strict';
// The physical zero-to-capacity range contains the complete centered S-curve.
(function(root){
 function domain(sample,capacity,rules,mode='station'){return {lo:0,hi:capacity};}
 const api=Object.freeze({domain});
 if(typeof module!=='undefined')module.exports=api;else root.SpacetraderCurveDomain=api;
})(globalThis);
