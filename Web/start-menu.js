// Public entry screen only; opening a saved voyage does not start its encounter.
let publicStartMenu=true;
function publicStartMenuHTML(){
 const created=state.profile.created,accountSave=window.SpacetraderAccount?.isCloud();
 const item=(title,detail,action)=>btn('<strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small>',action,'',false,'game-menu-item');
 return modalHead('Menu',false)+`<div class="game-menu-content">${created?`<p class="public-voyage-summary"><strong>${esc(state.profile.name)}</strong><span>${accountSave?'Account voyage':'Device voyage'} · ${esc(stationLabel(state.location))} · ${date(state.day)}</span></p>`:''}<nav class="game-menu-grid" aria-label="Game menu">${created?item('Continue voyage',accountSave?'Continue your account save':'Continue the voyage on this device','public-continue'):''}${window.spacetraderAccountMenuHTML?.(true)||''}${Object.keys(slots).length?item('Load checkpoint','Choose from your saved slots','checkpoint-menu-load'):''}${item('New charter','Create a captain and begin a voyage',created?'new':'public-continue')}${item('Engine story','2089 · The Asterion age','drive-story')}${item('Guide','Open the game reference','help')}${item('Audio','Sound & music settings','audio-settings')}</nav><p class="public-menu-home"><a href="/">Back to site</a></p></div>`;
}
async function publicEnterVoyage(){
 if(window.SpacetraderAccount?.isCloud()&&!sharedSession.snapshot?.voyage){try{await window.SpacetraderAccount.newVoyage();}catch(error){toast(error.message);}return;}
 if(!window.SpacetraderAccount?.isCloud())window.SpacetraderAccount?.useDevice();
 publicStartMenu=false;closeModal(true);render();
 if(state.incident)showEncounter();else if(!state.profile.created)showCreator();
}
function publicReturnToMenu(){publicStartMenu=true;closeModal(true);render();showGameMenu();}
