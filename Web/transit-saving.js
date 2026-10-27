// Public account play: only confirmed, visible journey playback can save progress.
(function(){
 const account=()=>window.SpacetraderAccount?.isCloud(),locked=()=>journey&&!journey.preview;
 const originalConfirm=confirmNew;
 confirmNew=function(){if(!account()||!window.SpacetraderAccount.singleActive())return originalConfirm();openModal('new',modalHead('Restart your voyage?',true,true)+'<p>Your current voyage will become a read-only archive. Its journal is preserved. The new active voyage stays with the same captain ID.</p><div class="actions">'+btn('Archive and restart','new-confirm','',false,'primary')+btn('Keep current voyage','close')+'</div>');positionMainModal();};
 const originalMenu=gameMenuHTML;
 gameMenuHTML=function(){const content=document.createElement('template');content.innerHTML=originalMenu();if(account())content.content.querySelector('[data-action="account-sync"]')?.remove();return content.innerHTML;};
 const originalShow=showJourney;
 showJourney=function(plan){
  originalShow(plan);if(!locked())return;
  const trip=journey;
  document.querySelector('[data-action="journey-skip"]')?.remove();
  if(!account()){const note=document.querySelector('.journey-caption');if(note)note.textContent='Your fleet is travelling. Playback finishes automatically.';return;}
  const caption=document.querySelector('.journey-caption');if(caption){caption.textContent='Saving voyage…';caption.setAttribute('role','status');}
  const retry=document.createElement('button');retry.type='button';retry.className='game-button';retry.textContent='Retry save';retry.dataset.action='transit-save-retry';retry.hidden=true;document.querySelector('.journey-controls')?.append(retry);
  const help=document.createElement('button');help.type='button';help.className='game-button';help.textContent='Account & saves';help.dataset.action='transit-account';help.hidden=true;document.querySelector('.journey-controls')?.append(help);
  trip.saveAgain=()=>{
   if(trip.savePending||document.hidden||modalKind!=='journey'||!$('modal').open)return;trip.savePending=true;trip.saveError=false;retry.hidden=true;if(caption)caption.textContent='Saving voyage…';
   // Let the departure action settle and the animation paint before promoting drafts.
   void new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))).then(()=>actionQueue).then(()=>{if(journey!==trip)throw Error('Travel screen changed.');return window.SpacetraderAccount.sync();}).then(()=>{if(journey!==trip)return;trip.savePending=false;trip.saveConfirmed=true;help.hidden=true;if(caption)caption.textContent='Voyage saved.';if(trip.progress>=journeyStopProgress(trip))finishJourney();}).catch(()=>{if(journey!==trip)return;trip.savePending=false;trip.saveError=true;retry.hidden=false;help.hidden=false;if(caption)caption.textContent='Save not confirmed. Retry when connected, or open Account & saves for sign-in and conflict review.';});
  };
  trip.saveAgain();
 };
 const originalFinish=finishJourney;
 finishJourney=function(){if(locked()){if(account()&&!journey.saveConfirmed||journey.progress<journeyStopProgress(journey))return;journey.release=true;}return originalFinish();};
 const resumeSave=()=>{if(locked()&&account()&&!document.hidden&&!journey.saveConfirmed)journey.saveAgain?.();};
 window.addEventListener('online',resumeSave);document.addEventListener('visibilitychange',resumeSave);
 document.addEventListener('click',event=>{
  if(!locked())return;
  if(event.target.closest('#captain-account-dialog'))return;
  const action=event.target.closest('button[data-action]')?.dataset.action;
  if(action==='transit-save-retry'){event.preventDefault();event.stopImmediatePropagation();journey.saveAgain();return;}
  if(action==='transit-account'){event.preventDefault();event.stopImmediatePropagation();window.SpacetraderAccount.open();return;}
  if(!['journey-pause','journey-speed'].includes(action)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
})();
