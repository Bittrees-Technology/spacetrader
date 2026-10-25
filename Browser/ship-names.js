'use strict';
// Original names: exploration serials, industrial space opera, distant-future
// epics and wry sentient-ship fiction inform the tone; no franchise names copied.
(function(root){
const themes={
 "swift": {
  "theme": "Express couriers \u00b7 urgency, light and messages",
  "first": [
   "Bright",
   "Early",
   "Solar",
   "Silver",
   "Rapid",
   "Golden",
   "Dawn",
   "Amber"
  ],
  "last": [
   "Relay",
   "Post",
   "Dash",
   "Dispatch",
   "Packet",
   "Sprint",
   "Streak",
   "Express"
  ]
 },
 "kestrel": {
  "theme": "Cislunar couriers \u00b7 familiar routes and lunar skies",
  "first": [
   "Lunar",
   "Copper",
   "Near",
   "Pale",
   "Evening",
   "Blue",
   "Homeward",
   "Cinder"
  ],
  "last": [
   "Arc",
   "Letter",
   "Promise",
   "Hop",
   "Ribbon",
   "Circuit",
   "Crescent",
   "Errand"
  ]
 },
 "osprey": {
  "theme": "Escort cutters \u00b7 watchfulness and safe passage",
  "first": [
   "Iron",
   "Steady",
   "Vigilant",
   "Brass",
   "Sure",
   "Loyal",
   "Resolute",
   "Aegis"
  ],
  "last": [
   "Ward",
   "Guard",
   "Shield",
   "Watch",
   "Oath",
   "Bastion",
   "Bulwark",
   "Sentinel"
  ]
 },
 "heron": {
  "theme": "Survey vessels \u00b7 inquiry, navigation and discovery",
  "first": [
   "Far",
   "Open",
   "Hidden",
   "Patient",
   "Quiet",
   "New",
   "Ancient",
   "Lucent"
  ],
  "last": [
   "Question",
   "Theorem",
   "Horizon",
   "Parallax",
   "Index",
   "Inquiry",
   "Proof",
   "Bearing"
  ]
 },
 "merlin": {
  "theme": "Interceptors \u00b7 speed and decisive strikes",
  "first": [
   "Scarlet",
   "Silent",
   "Velvet",
   "Sudden",
   "White",
   "Glass",
   "Quick",
   "Cobalt"
  ],
  "last": [
   "Dart",
   "Talon",
   "Flash",
   "Feint",
   "Edge",
   "Lance",
   "Needle",
   "Sting"
  ]
 },
 "petrel": {
  "theme": "Tankers \u00b7 reservoirs, weather and endurance",
  "first": [
   "Deep",
   "Full",
   "Winter",
   "Calm",
   "Long",
   "Rain",
   "Cloud",
   "Ocean"
  ],
  "last": [
   "Well",
   "Cistern",
   "Tide",
   "Reservoir",
   "Spring",
   "Current",
   "Drizzle",
   "Monsoon"
  ]
 },
 "peregrine": {
  "theme": "Freighters \u00b7 trade routes, bargains and distant ports",
  "first": [
   "Honest",
   "Distant",
   "Fair",
   "Westward",
   "Lucky",
   "Free",
   "Earnest",
   "Wide"
  ],
  "last": [
   "Bargain",
   "Ledger",
   "Passage",
   "Caravan",
   "Venture",
   "Haul",
   "Charter",
   "Cargo"
  ]
 },
 "curlew": {
  "theme": "Passenger transports \u00b7 welcome, company and home",
  "first": [
   "Warm",
   "Kind",
   "Gentle",
   "Beloved",
   "Friendly",
   "Common",
   "Happy",
   "Cosy"
  ],
  "last": [
   "Company",
   "Welcome",
   "Gathering",
   "Hearth",
   "Reunion",
   "Veranda",
   "Parlour",
   "Neighbour"
  ]
 },
 "cormorant": {
  "theme": "Industrial tugs \u00b7 heavy work and stubborn machinery",
  "first": [
   "Stubborn",
   "Rusted",
   "Heavy",
   "Red",
   "Tough",
   "Sooty",
   "Old",
   "Dogged"
  ],
  "last": [
   "Anchor",
   "Winch",
   "Towline",
   "Coupling",
   "Chain",
   "Capstan",
   "Yoke",
   "Bollard"
  ]
 },
 "sanderling": {
  "theme": "Mining vessels \u00b7 stone, claims and difficult fortunes",
  "first": [
   "Dusty",
   "Buried",
   "Broken",
   "Ochre",
   "Gritty",
   "Hollow",
   "Jagged",
   "Rich"
  ],
  "last": [
   "Seam",
   "Claim",
   "Pick",
   "Lode",
   "Vein",
   "Nugget",
   "Stratum",
   "Outcrop"
  ]
 },
 "gannet": {
  "theme": "Heavy escorts \u00b7 solidarity and convoy protection",
  "first": [
   "Stalwart",
   "United",
   "Solid",
   "Enduring",
   "Unbroken",
   "Tempered",
   "Proven",
   "Bound"
  ],
  "last": [
   "Rampart",
   "Phalanx",
   "Citadel",
   "Vanguard",
   "Convoy",
   "Pledge",
   "Accord",
   "Fortress"
  ]
 },
 "rook": {
  "theme": "Salvage ships \u00b7 second chances and industrial wit",
  "first": [
   "Second",
   "Spare",
   "Forgotten",
   "Borrowed",
   "Wayward",
   "Mended",
   "Useful",
   "Crooked"
  ],
  "last": [
   "Chance",
   "Bolt",
   "Fragment",
   "Fortune",
   "Remnant",
   "Treasure",
   "Scrap",
   "Recovery"
  ]
 },
 "ibis": {
  "theme": "Medical ships \u00b7 care, shelter and renewal",
  "first": [
   "Tender",
   "Clear",
   "Merciful",
   "Caring",
   "Soft",
   "Living",
   "Healing",
   "Hopeful"
  ],
  "last": [
   "Hands",
   "Remedy",
   "Respite",
   "Comfort",
   "Shelter",
   "Pulse",
   "Solace",
   "Sanctuary"
  ]
 },
 "gyrfalcon": {
  "theme": "Patrol frigates \u00b7 law, borders and patient pursuit",
  "first": [
   "Outer",
   "Dutiful",
   "Stern",
   "Just",
   "Last",
   "Firm",
   "Unseen",
   "Diligent"
  ],
  "last": [
   "Warrant",
   "Boundary",
   "Witness",
   "Verdict",
   "Pursuit",
   "Mandate",
   "Marshal",
   "Vigil"
  ]
 },
 "albatross": {
  "theme": "Deep-system freighters \u00b7 long journeys and vast distances",
  "first": [
   "Beyond",
   "Endless",
   "Remote",
   "Starward",
   "Lonely",
   "Dusk",
   "Farthest",
   "Uncharted"
  ],
  "last": [
   "Meridian",
   "Traverse",
   "Odyssey",
   "Latitude",
   "Drift",
   "Voyage",
   "Reach",
   "Crossing"
  ]
 },
 "crane": {
  "theme": "Workshop ships \u00b7 craft, repair and practical ingenuity",
  "first": [
   "Willing",
   "Able",
   "Clever",
   "Humble",
   "Ready",
   "Busy",
   "Careful",
   "Skilled"
  ],
  "last": [
   "Spanner",
   "Anvil",
   "Lathe",
   "Forge",
   "Bench",
   "Socket",
   "Rivet",
   "Jig"
  ]
 },
 "nightjar": {
  "theme": "Reconnaissance ships \u00b7 ambiguity, whispers and electronic ghosts",
  "first": [
   "Subtle",
   "Absent",
   "False",
   "Veiled",
   "Private",
   "Polite",
   "Faint",
   "Oblique"
  ],
  "last": [
   "Echo",
   "Rumour",
   "Alibi",
   "Footnote",
   "Cipher",
   "Argument",
   "Whisper",
   "Signal"
  ]
 },
 "tern": {
  "theme": "Refrigerated freighters \u00b7 cold stores and protected harvests",
  "first": [
   "Frost",
   "Polar",
   "Glacial",
   "Cool",
   "Snow",
   "Ice",
   "Rime",
   "Boreal"
  ],
  "last": [
   "Orchard",
   "Pantry",
   "Harvest",
   "Larder",
   "Granary",
   "Cellar",
   "Basket",
   "Garden"
  ]
 },
 "pelican": {
  "theme": "Bulk carriers \u00b7 abundance, scale and steady provision",
  "first": [
   "Great",
   "Broad",
   "Ample",
   "Vast",
   "Bountiful",
   "Weighty",
   "Mighty",
   "Generous"
  ],
  "last": [
   "Measure",
   "Bushel",
   "Bale",
   "Tonnage",
   "Load",
   "Heap",
   "Silo",
   "Stockpile"
  ]
 },
 "condor": {
  "theme": "Expedition carriers \u00b7 distant settlement and collective endeavour",
  "first": [
   "Rising",
   "Future",
   "Brave",
   "Daring",
   "Shared",
   "First",
   "Wandering",
   "Distant"
  ],
  "last": [
   "Chapter",
   "Expedition",
   "Assembly",
   "Outpost",
   "Frontier",
   "Endeavour",
   "Beacon",
   "Tomorrow"
  ]
 }
};
const pools=Object.fromEntries(Object.entries(themes).map(([id,t])=>[id,Object.freeze(t.first.flatMap(a=>t.last.map(b=>a+' '+b)))]));
function hash(text){let h=2166136261;for(const c of text){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function generate(classID,key,used=[]){
 const pool=pools[classID];if(!pool)throw Error('Unknown ship naming class.');
 const occupied=new Set(used.map(n=>n.toLocaleLowerCase('en'))),start=hash(String(key))%pool.length;
 // Consecutive probes visit the entire pool; full pools get a bounded, unique suffix.
 for(let n=0;n<pool.length;n++){const candidate=pool[(start+n)%pool.length];if(!occupied.has(candidate.toLocaleLowerCase('en')))return candidate;}
 for(let n=2;n<=used.length+2;n++){const candidate=pool[start]+' '+n;if(!occupied.has(candidate.toLocaleLowerCase('en')))return candidate;}
 throw Error('Unable to allocate ship name.');
}
const api=Object.freeze({generate,pools:Object.freeze(pools),themes:Object.freeze(Object.fromEntries(Object.entries(themes).map(([id,t])=>[id,t.theme])))});
if(typeof module!=='undefined')module.exports=api;else root.SpacetraderShipNames=api;
})(globalThis);
