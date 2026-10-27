// Public account play: station actions are volatile until transit or Save now.
(function(){
 const account=()=>window.SpacetraderAccount?.isCloud(),locked=()=>account()&&journey&&!journey.preview;
 const originalMenu=gameMenuHTML;
 gameMenuHTML=function(){return originalMenu().replace('Sync now','Save now');};
 const originalShow=showJourney;
 showJourney=function(plan){
  originalShow(plan);if(!locked())return;
  const trip=journey;
  document.querySelector('[data-action="journey-skip"]')?.remove();
  const caption=document.querySelector('.journey-caption');if(caption){caption.textContent='Saving voyage…';caption.setAttribute('role','status');}
  const retry=document.createElement('button');retry.type='button';retry.className='game-button';retry.textContent='Retry save';retry.dataset.action='transit-save-retry';retry.hidden=true;document.querySelector('.journey-controls')?.append(retry);
  const help=document.createElement('button');help.type='button';help.className='game-button';help.textContent='Account & saves';help.dataset.action='transit-account';help.hidden=true;document.querySelector('.journey-controls')?.append(help);
  trip.saveAgain=()=>{
   if(trip.savePending)return;trip.savePending=true;trip.saveError=false;retry.hidden=true;if(caption)caption.textContent='Saving voyage…';
   void window.SpacetraderAccount.sync().then(()=>{if(journey!==trip)return;trip.savePending=false;help.hidden=true;if(caption)caption.textContent='Voyage saved.';if(trip.progress>=journeyStopProgress(trip))finishJourney();}).catch(()=>{if(journey!==trip)return;trip.savePending=false;trip.saveError=true;retry.hidden=false;help.hidden=false;if(caption)caption.textContent='Save not confirmed. Retry when connected, or open Account & saves for sign-in and conflict review.';});
  };
  trip.saveAgain();
 };
 const originalFinish=finishJourney;
 finishJourney=function(){if(locked()){if(journey.savePending||journey.saveError||journey.progress<journeyStopProgress(journey))return;journey.release=true;}return originalFinish();};
 document.addEventListener('click',event=>{
  if(!locked())return;
  if(event.target.closest('#captain-account-dialog'))return;
  const action=event.target.closest('button[data-action]')?.dataset.action;
  if(action==='transit-save-retry'){event.preventDefault();event.stopImmediatePropagation();journey.saveAgain();return;}
  if(action==='transit-account'){event.preventDefault();event.stopImmediatePropagation();window.SpacetraderAccount.open();return;}
  if(!['journey-pause','journey-speed'].includes(action)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 const originalAction=sharedAction;
 sharedAction=function(type,args,onFailure){
  const result=originalAction(type,args,onFailure);
  void result.then(done=>{if(done&&account()&&!journey&&(type==='create'||(state.voyage||state.battle)&&window.SpacetraderAccount.syncStatus()?.unsaved))void window.SpacetraderAccount.sync().catch(()=>{});});
  return result;
 };
})();
