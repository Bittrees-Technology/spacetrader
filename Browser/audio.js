'use strict';
/* Original offline score and shipboard sound design. No files, network or gameplay RNG. */
(function(root){
 const KEY='spacetrader.audio.v1',defaults={muted:false,music:.36,effects:.60};
 const themes={
  map:{bpm:56,root:48,chords:[[0,3,7,14],[-4,0,3,10],[-2,2,5,12],[-5,-2,2,9]],melody:[14,10,7,5,3,7,10,14]},
  station:{bpm:64,root:48,chords:[[3,7,10,14],[0,3,7,10],[-4,0,3,7],[-2,2,5,10]],melody:[10,14,12,7,10,7,5,3]},
  canteen:{bpm:76,root:48,chords:[[0,3,7,10],[-4,0,3,7],[3,7,10,14],[-2,2,5,9]],melody:[7,10,14,10,5,9,12,9]},
  travel:{bpm:72,root:50,chords:[[0,3,7,14],[-2,2,5,12],[-5,-2,2,9],[-4,0,3,10]],melody:[7,14,12,10,7,5,3,2]},
  danger:{bpm:84,root:45,chords:[[0,3,7,13],[-1,3,6,10]],melody:[0,7,3,6,0,7,1,6]},
  battle:{title:'Redshift intercept',bpm:104,root:38,chords:[[0,3,7,10],[0,2,7,13],[-1,3,6,10],[0,5,7,12],[-5,0,3,7],[-4,0,3,10],[-1,2,6,9],[0,3,7,14]],melody:[0,7,12,7,3,10,7,2,0,12,10,7,5,3,2,7]}
 };
 // Authored station scores: each has its own harmony, motif, rhythm and instrumental palette.
 const stationScores={
 "earth": {
  "title": "Meridian lights",
  "bpm": 67,
  "root": 48,
  "instrument": "warm",
  "chords": [
   [
    0,
    4,
    7,
    11
   ],
   [
    -3,
    0,
    4,
    7
   ],
   [
    2,
    5,
    9,
    12
   ],
   [
    -5,
    -1,
    2,
    7
   ]
  ],
  "melody": [
   7,
   11,
   14,
   12,
   9,
   7,
   4,
   2
  ],
  "rhythm": [
   0,
   0.75,
   1.5,
   2.5,
   3.25
  ]
 },
 "moon": {
  "title": "Water under Shackleton",
  "bpm": 55,
  "root": 50,
  "instrument": "glass",
  "chords": [
   [
    0,
    5,
    7,
    14
   ],
   [
    -2,
    2,
    5,
    12
   ],
   [
    -5,
    0,
    4,
    9
   ],
   [
    0,
    2,
    7,
    12
   ]
  ],
  "melody": [
   14,
   7,
   5,
   2,
   7,
   12,
   9,
   5
  ],
  "rhythm": [
   0,
   1.5,
   2.25,
   3.5
  ]
 },
 "mars": {
  "title": "Copper horizons",
  "bpm": 69,
  "root": 43,
  "instrument": "pluck",
  "chords": [
   [
    0,
    3,
    7,
    10
   ],
   [
    -5,
    -2,
    2,
    7
   ],
   [
    -4,
    0,
    3,
    7
   ],
   [
    -2,
    2,
    5,
    9
   ]
  ],
  "melody": [
   7,
   10,
   12,
   15,
   14,
   10,
   7,
   3
  ],
  "rhythm": [
   0,
   0.5,
   1.25,
   2,
   2.75,
   3.5
  ]
 },
 "phobos": {
  "title": "Stickney shift change",
  "bpm": 82,
  "root": 40,
  "instrument": "industrial",
  "chords": [
   [
    0,
    3,
    7,
    12
   ],
   [
    0,
    2,
    5,
    10
   ],
   [
    -1,
    3,
    6,
    10
   ],
   [
    -5,
    0,
    3,
    7
   ]
  ],
  "melody": [
   0,
   7,
   3,
   10,
   7,
   12,
   10,
   3
  ],
  "rhythm": [
   0,
   0.5,
   1.5,
   2,
   2.5,
   3.25,
   3.75
  ]
 },
 "ceres": {
  "title": "Occator crossings",
  "bpm": 78,
  "root": 41,
  "instrument": "pluck",
  "chords": [
   [
    0,
    3,
    7,
    14
   ],
   [
    3,
    7,
    10,
    14
   ],
   [
    -2,
    2,
    5,
    12
   ],
   [
    -5,
    -2,
    3,
    7
   ]
  ],
  "melody": [
   3,
   7,
   14,
   10,
   12,
   7,
   5,
   2
  ],
  "rhythm": [
   0,
   0.75,
   1.5,
   2.25,
   3,
   3.5
  ]
 },
 "callisto": {
  "title": "Valhalla long watch",
  "bpm": 53,
  "root": 45,
  "instrument": "hollow",
  "chords": [
   [
    0,
    3,
    7,
    14
   ],
   [
    -5,
    0,
    2,
    7
   ],
   [
    -2,
    3,
    5,
    10
   ],
   [
    -7,
    -2,
    2,
    5
   ]
  ],
  "melody": [
   14,
   12,
   7,
   3,
   2,
   7,
   10,
   5
  ],
  "rhythm": [
   0,
   1.25,
   2.75
  ]
 },
 "titan": {
  "title": "Kraken haze",
  "bpm": 60,
  "root": 40,
  "instrument": "glass",
  "chords": [
   [
    0,
    3,
    7,
    11
   ],
   [
    -1,
    3,
    6,
    10
   ],
   [
    -4,
    0,
    3,
    7
   ],
   [
    -2,
    2,
    6,
    9
   ]
  ],
  "melody": [
   11,
   14,
   15,
   11,
   7,
   6,
   3,
   2
  ],
  "rhythm": [
   0,
   1,
   1.75,
   2.75,
   3.5
  ]
 },
 "mercury": {
  "title": "Caloris sunline",
  "bpm": 72,
  "root": 55,
  "instrument": "bell",
  "chords": [
   [
    0,
    4,
    7,
    14
   ],
   [
    2,
    6,
    9,
    13
   ],
   [
    -3,
    1,
    4,
    8
   ],
   [
    -5,
    -1,
    2,
    9
   ]
  ],
  "melody": [
   14,
   16,
   18,
   14,
   11,
   9,
   7,
   6
  ],
  "rhythm": [
   0,
   0.5,
   1.25,
   2,
   3,
   3.5
  ]
 },
 "venus": {
  "title": "Aphrodite cloud garden",
  "bpm": 57,
  "root": 49,
  "instrument": "warm",
  "chords": [
   [
    0,
    4,
    7,
    11
   ],
   [
    -2,
    2,
    5,
    9
   ],
   [
    -5,
    -1,
    2,
    6
   ],
   [
    -3,
    0,
    4,
    7
   ]
  ],
  "melody": [
   11,
   9,
   7,
   4,
   2,
   4,
   9,
   14
  ],
  "rhythm": [
   0,
   1,
   2.5,
   3.25
  ]
 },
 "earth-high": {
  "title": "Kepler assembly",
  "bpm": 74,
  "root": 52,
  "instrument": "pluck",
  "chords": [
   [
    0,
    4,
    7,
    12
   ],
   [
    4,
    7,
    11,
    14
   ],
   [
    2,
    5,
    9,
    12
   ],
   [
    -5,
    -1,
    2,
    7
   ]
  ],
  "melody": [
   0,
   7,
   12,
   16,
   14,
   11,
   7,
   4
  ],
  "rhythm": [
   0,
   0.5,
   1,
   1.75,
   2.5,
   3,
   3.75
  ]
 },
 "deimos": {
  "title": "Swift approach",
  "bpm": 75,
  "root": 50,
  "instrument": "bell",
  "chords": [
   [
    0,
    3,
    7,
    12
   ],
   [
    -2,
    2,
    5,
    10
   ],
   [
    3,
    7,
    10,
    14
   ],
   [
    -5,
    -2,
    2,
    9
   ]
  ],
  "melody": [
   12,
   7,
   10,
   14,
   15,
   10,
   5,
   7
  ],
  "rhythm": [
   0,
   0.75,
   1,
   2,
   2.75,
   3.5
  ]
 },
 "jupiter": {
  "title": "Zephyr deep field",
  "bpm": 50,
  "root": 38,
  "instrument": "hollow",
  "chords": [
   [
    0,
    7,
    10,
    14
   ],
   [
    -5,
    2,
    5,
    9
   ],
   [
    -2,
    5,
    9,
    12
   ],
   [
    -7,
    0,
    3,
    7
   ]
  ],
  "melody": [
   7,
   14,
   10,
   5,
   2,
   7,
   12,
   9
  ],
  "rhythm": [
   0,
   1.75,
   3
  ]
 },
 "io": {
  "title": "Pele furnace",
  "bpm": 88,
  "root": 42,
  "instrument": "industrial",
  "chords": [
   [
    0,
    3,
    6,
    10
   ],
   [
    0,
    5,
    7,
    12
   ],
   [
    -1,
    3,
    7,
    10
   ],
   [
    -5,
    -2,
    2,
    6
   ]
  ],
  "melody": [
   0,
   6,
   7,
   12,
   10,
   6,
   3,
   7
  ],
  "rhythm": [
   0,
   0.5,
   1,
   1.5,
   2.25,
   2.75,
   3.5
  ]
 },
 "europa": {
  "title": "Conamara beneath the ice",
  "bpm": 54,
  "root": 53,
  "instrument": "glass",
  "chords": [
   [
    0,
    2,
    7,
    14
   ],
   [
    -5,
    0,
    4,
    11
   ],
   [
    -2,
    2,
    5,
    12
   ],
   [
    -4,
    0,
    3,
    10
   ]
  ],
  "melody": [
   14,
   12,
   7,
   2,
   4,
   9,
   11,
   7
  ],
  "rhythm": [
   0,
   1.5,
   2.5,
   3.75
  ]
 },
 "ganymede": {
  "title": "Galileo homeward",
  "bpm": 65,
  "root": 43,
  "instrument": "warm",
  "chords": [
   [
    0,
    4,
    7,
    14
   ],
   [
    5,
    9,
    12,
    16
   ],
   [
    2,
    5,
    9,
    12
   ],
   [
    -5,
    -1,
    2,
    7
   ]
  ],
  "melody": [
   7,
   9,
   14,
   16,
   14,
   12,
   9,
   4
  ],
  "rhythm": [
   0,
   1,
   1.5,
   2.25,
   3.25
  ]
 },
 "saturn": {
  "title": "Cassini ringlight",
  "bpm": 62,
  "root": 48,
  "instrument": "glass",
  "chords": [
   [
    0,
    4,
    7,
    14
   ],
   [
    -3,
    0,
    4,
    11
   ],
   [
    2,
    6,
    9,
    14
   ],
   [
    -5,
    -1,
    2,
    6
   ]
  ],
  "melody": [
   14,
   11,
   9,
   7,
   11,
   16,
   14,
   6
  ],
  "rhythm": [
   0,
   0.75,
   1.75,
   2.5,
   3.5
  ]
 },
 "enceladus": {
  "title": "Tiger Stripe fountains",
  "bpm": 59,
  "root": 55,
  "instrument": "bell",
  "chords": [
   [
    0,
    5,
    9,
    14
   ],
   [
    -2,
    2,
    7,
    12
   ],
   [
    -5,
    0,
    4,
    9
   ],
   [
    2,
    5,
    9,
    16
   ]
  ],
  "melody": [
   16,
   14,
   9,
   7,
   5,
   9,
   14,
   12
  ],
  "rhythm": [
   0,
   0.5,
   1.5,
   2.75,
   3.25
  ]
 },
 "rhea": {
  "title": "Tirawa freight rhythm",
  "bpm": 76,
  "root": 40,
  "instrument": "industrial",
  "chords": [
   [
    0,
    3,
    7,
    10
   ],
   [
    -2,
    2,
    5,
    9
   ],
   [
    -5,
    0,
    3,
    10
   ],
   [
    3,
    7,
    10,
    12
   ]
  ],
  "melody": [
   3,
   7,
   10,
   7,
   2,
   5,
   9,
   12
  ],
  "rhythm": [
   0,
   0.5,
   1.25,
   2,
   2.5,
   3.25
  ]
 },
 "iapetus": {
  "title": "Cassini Ridge shadow",
  "bpm": 61,
  "root": 42,
  "instrument": "hollow",
  "chords": [
   [
    0,
    3,
    7,
    13
   ],
   [
    -1,
    3,
    6,
    10
   ],
   [
    -4,
    0,
    3,
    8
   ],
   [
    -5,
    -2,
    2,
    7
   ]
  ],
  "melody": [
   13,
   10,
   7,
   6,
   3,
   7,
   8,
   2
  ],
  "rhythm": [
   0,
   1.25,
   2,
   3.5
  ]
 },
 "uranus": {
  "title": "Herschel blue distance",
  "bpm": 51,
  "root": 45,
  "instrument": "hollow",
  "chords": [
   [
    0,
    5,
    7,
    14
   ],
   [
    -2,
    3,
    5,
    12
   ],
   [
    -7,
    0,
    4,
    9
   ],
   [
    -5,
    0,
    2,
    7
   ]
  ],
  "melody": [
   14,
   9,
   7,
   5,
   2,
   5,
   12,
   7
  ],
  "rhythm": [
   0,
   1.75,
   2.75,
   3.5
  ]
 },
 "miranda": {
  "title": "Verona fractured sky",
  "bpm": 73,
  "root": 50,
  "instrument": "pluck",
  "chords": [
   [
    0,
    3,
    7,
    14
   ],
   [
    2,
    5,
    9,
    12
   ],
   [
    -1,
    3,
    6,
    11
   ],
   [
    -5,
    0,
    4,
    7
   ]
  ],
  "melody": [
   7,
   14,
   10,
   5,
   12,
   9,
   6,
   3
  ],
  "rhythm": [
   0,
   0.75,
   1.5,
   2,
   2.75,
   3.5
  ]
 },
 "ariel": {
  "title": "Lassell clear currents",
  "bpm": 68,
  "root": 52,
  "instrument": "bell",
  "chords": [
   [
    0,
    4,
    9,
    14
   ],
   [
    -3,
    0,
    5,
    9
   ],
   [
    2,
    6,
    9,
    13
   ],
   [
    -5,
    -1,
    2,
    7
   ]
  ],
  "melody": [
   9,
   14,
   16,
   13,
   9,
   7,
   4,
   6
  ],
  "rhythm": [
   0,
   0.5,
   1.5,
   2.25,
   3,
   3.75
  ]
 },
 "titania": {
  "title": "Messina lanterns",
  "bpm": 63,
  "root": 46,
  "instrument": "warm",
  "chords": [
   [
    0,
    4,
    7,
    11
   ],
   [
    -5,
    0,
    4,
    9
   ],
   [
    -3,
    2,
    5,
    9
   ],
   [
    -2,
    2,
    5,
    10
   ]
  ],
  "melody": [
   11,
   14,
   12,
   9,
   7,
   4,
   5,
   9
  ],
  "rhythm": [
   0,
   1,
   1.75,
   2.5,
   3.25
  ]
 },
 "oberon": {
  "title": "Mommur night passage",
  "bpm": 57,
  "root": 39,
  "instrument": "hollow",
  "chords": [
   [
    0,
    3,
    7,
    10
   ],
   [
    -5,
    -2,
    3,
    7
   ],
   [
    -1,
    2,
    6,
    10
   ],
   [
    -4,
    0,
    3,
    8
   ]
  ],
  "melody": [
   10,
   7,
   3,
   2,
   6,
   10,
   8,
   7
  ],
  "rhythm": [
   0,
   1.5,
   2.25,
   3.25
  ]
 },
 "neptune": {
  "title": "Le Verrier last signal",
  "bpm": 48,
  "root": 41,
  "instrument": "glass",
  "chords": [
   [
    0,
    7,
    12,
    14
   ],
   [
    -2,
    5,
    10,
    12
   ],
   [
    -5,
    0,
    3,
    9
   ],
   [
    -7,
    0,
    2,
    7
   ]
  ],
  "melody": [
   14,
   12,
   7,
   2,
   0,
   7,
   10,
   5
  ],
  "rhythm": [
   0,
   1.75,
   3.25
  ]
 },
 "triton": {
  "title": "Lassell countercurrent",
  "bpm": 58,
  "root": 44,
  "instrument": "glass",
  "chords": [
   [
    0,
    3,
    7,
    14
   ],
   [
    -1,
    3,
    6,
    11
   ],
   [
    -5,
    -2,
    2,
    9
   ],
   [
    -4,
    0,
    3,
    10
   ]
  ],
  "melody": [
   15,
   14,
   11,
   10,
   7,
   6,
   3,
   2
  ],
  "rhythm": [
   0,
   0.75,
   2,
   2.75,
   3.5
  ]
 }
};
 // Six connected eight-bar movements, followed by a lighter answering arrangement.
 // Fixed musical choices keep the score independent of the voyage's random stream.
 const mainMovements=[
  {title:'The ecliptic',chords:[[0,3,7,14],[-4,0,3,10],[-2,2,5,12],[-5,-2,2,9]],motifs:[[14,10,7,3],[10,7,3,0],[12,10,5,2],[9,7,5,2]],rhythm:[0,1.5,3],tone:'sine',pad:.065},
  {title:'Solar sails',chords:[[3,7,10,14],[2,5,10,14],[0,3,7,12],[-4,0,3,10]],motifs:[[7,10,14,19],[5,10,14,17],[3,7,12,15],[3,7,10,12]],rhythm:[0,1,2.5,3.5],tone:'triangle',pad:.06},
  {title:'Distant beacons',chords:[[-4,3,7,10],[-2,2,5,12],[0,5,7,14],[-5,2,5,9]],motifs:[[15,10,7,3],[14,12,10,5],[14,12,7,5],[12,9,7,2]],rhythm:[.5,2,3.25],tone:'glass',pad:.058},
  {title:'Quiet orbit',chords:[[-7,0,3,7],[-4,0,5,10],[-2,2,7,12],[0,3,7,14]],motifs:[[7,3,0,3],[10,5,3,0],[12,7,5,2],[14,7,3,7]],rhythm:[.25,2.5],tone:'sine',pad:.05},
  {title:'Open horizon',chords:[[-4,0,3,7],[3,7,10,17],[-2,2,5,14],[-5,2,7,9]],motifs:[[7,10,12,15],[10,14,17,19],[14,10,5,2],[9,14,12,7]],rhythm:[0,.75,2,3],tone:'triangle',pad:.062},
  {title:'Homeward light',chords:[[5,8,12,15],[-4,0,3,10],[-5,2,5,9],[0,3,7,14]],motifs:[[15,12,8,5],[12,10,7,3],[14,9,7,2],[14,10,7,3]],rhythm:[0,1.5,3.25],tone:'glass',pad:.06}
 ];
 function mainThemeBar(bar){const section=Math.floor(bar/8)%mainMovements.length,local=bar%8,answer=Math.floor(bar/(mainMovements.length*8))%2;return {...mainMovements[section],section,local,answer,chord:mainMovements[section].chords[Math.floor(local/2)],motif:mainMovements[section].motifs[Math.floor(local/2)]};}
 // Shared room identities: the same establishment sounds alike at every port.
 const establishmentScores={
  market:{title:'Exchange currents',bpm:88,root:48,instrument:'pluck',chords:[[0,4,7,11],[-3,0,4,9],[2,5,9,12],[-5,-1,2,7]],melody:[7,11,14,9,4,7,12,11],rhythm:[0,.75,1.5,2.5,3.25],pulse:'none'},
  contracts:{title:'Outbound manifests',bpm:78,root:45,instrument:'warm',chords:[[0,5,7,12],[-2,2,5,9],[-5,0,4,7],[0,4,7,14]],melody:[0,7,12,14,9,5,2,7],rhythm:[0,1,2.5,3.5],pulse:'soft'},
  shipyard:{title:'Dry-dock machinery',bpm:72,root:36,instrument:'industrial',chords:[[0,3,7,12],[-5,0,3,10],[-2,2,5,12],[0,5,7,10]],melody:[0,7,3,12,7,10,5,2],rhythm:[0,.5,1.5,2,3.25],pulse:'mechanical'},
  fleet:{title:'New horizons',bpm:66,root:50,instrument:'glass',chords:[[0,4,7,14],[-4,0,5,9],[-2,2,7,11],[0,5,9,12]],melody:[7,12,16,14,9,12,7,4],rhythm:[.25,1.5,2.75],pulse:'none'},
  security:{title:'Patrol watch',bpm:70,root:38,instrument:'hollow',chords:[[0,3,7,14],[-1,3,6,10],[-5,0,2,7],[-2,2,5,9]],melody:[0,7,10,7,2,5,3,0],rhythm:[0,1.75,2.5,3.5],pulse:'soft'},
  relay:{title:'Signals in the quiet',bpm:82,root:55,instrument:'bell',chords:[[0,2,7,11],[-5,0,4,9],[-2,2,5,12],[0,4,9,14]],melody:[0,7,2,11,7,14,9,4],rhythm:[0,.375,1.75,2.125,3.25],pulse:'none'},
  clinic:{title:'Quiet recovery',bpm:50,root:53,instrument:'warm',chords:[[0,4,7,9],[-5,0,4,7],[-3,2,5,9],[0,2,7,12]],melody:[7,4,2,0,4,9,7,2],rhythm:[.5,2.5],pulse:'none',quiet:true},
  local:{title:'Commons after shift',bpm:90,root:48,instrument:'pluck',chords:[[0,3,7,10],[-4,0,3,7],[3,7,10,14],[-2,2,5,9]],melody:[7,10,14,12,9,5,3,10],rhythm:[0,.5,1.25,2,2.75,3.5],pulse:'brush'},
  bank:{title:'Compounding light',bpm:62,root:47,instrument:'glass',chords:[[0,4,7,11],[2,6,9,13],[-3,0,4,7],[-5,-1,2,6]],melody:[4,7,11,14,13,9,6,2],rhythm:[0,1.25,2.5,3.25],pulse:'none'},
  authority:{title:'Charter hall',bpm:58,root:46,instrument:'warm',chords:[[0,5,9,12],[-5,0,4,9],[-2,2,7,11],[0,4,7,12]],melody:[0,5,9,12,11,7,4,0],rhythm:[0,1.5,3],pulse:'none'},
  warehouse:{title:'Rows of cargo',bpm:68,root:40,instrument:'industrial',chords:[[0,7,10,14],[-3,0,5,9],[-5,0,3,7],[-2,3,7,12]],melody:[0,3,7,10,7,5,12,7],rhythm:[0,1,1.75,2.75],pulse:'soft'}
 };
 const sceneTitles={map:'The ecliptic',station:'Port of call',canteen:'Commons after shift',travel:'Asterion drift',danger:'Unknown contact',battle:'Redshift intercept'};
 function scoreFor(scene,station='',venue=''){if(scene==='establishment')return Object.hasOwn(establishmentScores,venue)?establishmentScores[venue]:themes.station;const score=['station','canteen'].includes(scene)?stationScores[station]:null;return score?{...score,bpm:score.bpm+(scene==='canteen'?8:0)}:themes[scene]||themes.map;}
 function trackFor(scene,station='',venue=''){if(scene==='establishment'&&Object.hasOwn(establishmentScores,venue))return {id:'establishment:'+venue,title:establishmentScores[venue].title,station:null,establishment:venue};const score=['station','canteen'].includes(scene)?stationScores[station]:null;return {id:score?station+':'+scene:scene,title:score?score.title+(scene==='canteen'?' · commons variation':''):sceneTitles[scene]||(scene==='establishment'?sceneTitles.station:sceneTitles.map),station:score?station:null};}
 const clamp=(n,f)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):f;
 function preferences(raw){let v;try{v=JSON.parse(raw||'null');}catch{}return {muted:typeof v?.muted==='boolean'?v.muted:false,music:clamp(v?.music,defaults.music),effects:clamp(v?.effects,defaults.effects)};}
 const hz=midi=>440*2**((midi-69)/12);
 function soundGraph(ctx,offline=false){
  const master=ctx.createGain(),limiter=ctx.createDynamicsCompressor(),music=ctx.createGain(),effects=ctx.createGain(),filter=ctx.createBiquadFilter(),delay=ctx.createDelay(1),feedback=ctx.createGain(),wet=ctx.createGain();
  master.gain.value=.72;limiter.threshold.value=-16;limiter.knee.value=18;limiter.ratio.value=4;limiter.attack.value=.005;limiter.release.value=.25;
  filter.type='lowpass';filter.frequency.value=4200;feedback.gain.value=.22;wet.gain.value=.18;delay.delayTime.value=.375;
  music.connect(filter);filter.connect(master);filter.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);effects.connect(master);master.connect(limiter);limiter.connect(ctx.destination);
  const noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*2),ctx.sampleRate),data=noise.getChannelData(0);let seed=1717;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/2147483648-1)*.8;}
  const voices=new Set();
  function voice(bus,start,duration,frequency,volume=.1,type='sine',endFrequency=null,pan=0){
   if(!offline&&voices.size>=180)return;
   const now=ctx.currentTime,t=Math.max(now+.002,start),source=type==='noise'?ctx.createBufferSource():ctx.createOscillator(),gain=ctx.createGain(),panner=ctx.createStereoPanner?.(),toneFilter=ctx.createBiquadFilter();
   if(type==='noise'){source.buffer=noise;source.loop=true;toneFilter.type='lowpass';toneFilter.frequency.setValueAtTime(frequency,t);if(endFrequency)toneFilter.frequency.exponentialRampToValueAtTime(endFrequency,t+duration);}
   else{source.type=type;source.frequency.setValueAtTime(frequency,t);if(endFrequency)source.frequency.exponentialRampToValueAtTime(endFrequency,t+duration);toneFilter.type='lowpass';toneFilter.frequency.value=bus==='music'?2800:7500;}
   const attack=Math.min(bus==='music'&&duration>2?.85:.018,duration*.2),release=Math.min(bus==='music'&&duration>2?1.8:.22,duration*.42),end=t+duration;
   gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+attack);gain.gain.setValueAtTime(Math.max(.0002,volume),Math.max(t+attack,end-release));gain.gain.exponentialRampToValueAtTime(.0001,end);
   source.connect(toneFilter);toneFilter.connect(gain);if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(bus==='music'?music:effects);}else gain.connect(bus==='music'?music:effects);
   const entry={source,gain,bus,end};voices.add(entry);source.onended=()=>{voices.delete(entry);for(const node of [source,toneFilter,gain,panner])node?.disconnect();};source.start(t);source.stop(end+.025);return entry;
  }
  function stop(bus=null,fade=.08){const now=ctx.currentTime;for(const v of voices){if(bus&&v.bus!==bus)continue;try{v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(Math.max(.0001,now<v.end?v.gain.gain.value:.0001),now);v.gain.gain.exponentialRampToValueAtTime(.0001,now+fade);v.source.stop(now+fade+.01);}catch{}}}
  function mainPhrase(bar,t){
   const part=mainThemeBar(bar),beat=60/themes.map.bpm,length=beat*4,root=themes.map.root,{chord,motif,local,answer}=part,quiet=part.section===3;
   chord.forEach((n,i)=>{voice('music',t,length+1.4,hz(root+n),part.pad,'sine',null,(i-1.5)*.38);voice('music',t+.07,length+1.1,hz(root+n)*1.0012,quiet?.012:.018,'triangle',null,(1.5-i)*.3);});
   voice('music',t,length*.85,hz(root+chord[0]-12),quiet?.075:.095,'sine');
   part.rhythm.forEach((at,i)=>{
    // Alternate question and response within each harmony; leave room at cadences.
    if(local===7&&i===part.rhythm.length-1)return;
    const index=(i+(local%2?2:0)+answer)%motif.length,n=motif[index],when=t+at*beat+.12,duration=part.tone==='triangle'?1.1:quiet?2.4:1.8,pan=Math.sin(bar*.43+i)*.55;
    voice('music',when,duration,hz(root+n+12),quiet?.025:.033,part.tone==='triangle'?'triangle':'sine',null,pan);
    if(part.tone==='glass')voice('music',when+.015,duration*.6,hz(root+n+12)*2.002,.005,'sine',null,-pan);
   });
   if(!quiet&&answer&&local%2===1)for(const [i,at] of [1,2.75].entries())voice('music',t+at*beat,beat*.8,hz(root+chord[i+1]+12),.018,'sine',null,i?-.45:.45);
   if([1,4].includes(part.section)&&!answer)for(const [i,at] of [.5,1.5,2.5,3.5].entries())voice('music',t+at*beat,.55,hz(root+chord[i%chord.length]),.018,'triangle',null,i%2?.3:-.3);
   return length;
  }
  function establishmentPhrase(venue,bar,t){
   const theme=scoreFor('establishment','',venue),beat=60/theme.bpm,length=beat*4,chord=theme.chords[Math.floor(bar/2)%theme.chords.length],root=theme.root,style=theme.instrument,answer=Math.floor(bar/8)%2,quiet=!!theme.quiet;
   chord.forEach((n,i)=>{voice('music',t,length+1.1,hz(root+n),quiet?.035:.047,'sine',null,(i-1.5)*.35);if(!quiet)voice('music',t+.06,length+.8,hz(root+n)*1.001,.012,style==='hollow'?'sine':'triangle',null,(1.5-i)*.25);});
   voice('music',t,length*.82,hz(root+chord[0]-12),quiet?.055:.08,'sine');
   (theme.rhythm||[0,2]).forEach((at,i)=>{if(bar%8===7&&i===(theme.rhythm?.length||2)-1)return;const index=((bar%2)*2+(answer?theme.melody.length-1-i:i)+theme.melody.length)%theme.melody.length,n=theme.melody[index],when=t+at*beat+.06,percussive=['pluck','industrial','bell'].includes(style),duration=quiet?2.7:percussive?.72:1.7,pan=Math.sin(bar*.6+i)*.48;
    voice('music',when,duration,hz(root+n+(quiet?0:12)),quiet?.026:.033,['pluck','industrial'].includes(style)?'triangle':'sine',null,pan);
    if(['glass','bell'].includes(style))voice('music',when+.012,duration*.65,hz(root+n+12)*(style==='bell'?2.002:1.5),.005,'sine',null,-pan);
   });
   if(theme.pulse!=='none'&&theme.pulse)for(const at of theme.pulse==='mechanical'?[0,.5,1.5,2,2.5,3.5]:theme.pulse==='brush'?[.5,1.5,2.5,3.5]:[0,2]){
    voice('music',t+at*beat,.08,theme.pulse==='mechanical'?950:550,.005,'noise',180,at%2?.25:-.25);
    if(theme.pulse==='mechanical'&&Number.isInteger(at))voice('music',t+at*beat,.18,58,.02,'sine',38);
   }
   return length;
  }
  // Four connected eight-bar passages, independent of the combat/save clock.
  // Sustained low strings and answering motifs replace the old tick-like pulse.
  function battlePhrase(bar,t){
   const beat=60/themes.battle.bpm,length=beat*4,section=Math.floor(bar/8)%4,local=bar%8;
   const passages=[
    {chords:[[0,3,7,14],[-5,0,3,10]],motif:[0,7,12,10,7],rhythm:[0,.75,1.75,2.5,3.25]},
    {chords:[[-2,2,5,12],[-1,3,6,13]],motif:[2,7,14,12,6],rhythm:[.25,1,1.5,2.75,3.5]},
    {chords:[[-5,0,3,7],[-4,0,3,10]],motif:[12,10,7,3,7],rhythm:[0,.5,1.25,2.25,3]},
    {chords:[[-1,2,6,9],[0,3,7,14]],motif:[14,12,7,10,3],rhythm:[0,1.25,2,3.25]}
   ],part=passages[section],chord=part.chords[Math.floor(local/2)%2],root=themes.battle.root,build=section===0?.8:section===2?1.08:1;
   chord.forEach((n,i)=>{voice('music',t,length+1.2,hz(root+n),.044*build,'triangle',null,(i-1.5)*.35);voice('music',t+.06,length+1.4,hz(root+n)*1.001,.026*build,'sine',null,(1.5-i)*.25);});
   voice('music',t,length*.92,hz(root+chord[0]-12),.11*build,'sine');
   part.rhythm.forEach((at,i)=>{if(local===7&&i>1)return;const n=part.motif[(i+(local%2?2:0))%part.motif.length];voice('music',t+at*beat,.48+beat*.45,hz(root+n+12),.043*build,'triangle',null,i%2?.36:-.36);});
   if(local%2===1)for(const [i,at] of [1.5,3].entries())voice('music',t+at*beat,beat*1.1,hz(root+part.motif[(i+3)%part.motif.length]+24),.022,'sine',null,i?-.42:.42);
   // Soft low percussion belongs to the score, with no metronome/high-hat click.
   voice('music',t,.3,76,.08*build,'sine',30);
   if(local%4!==3)voice('music',t+(section===1?2.75:2.5)*beat,.36,62,.055*build,'sine',28);
   if(local===6)voice('music',t+beat*2,beat*2.1,850,.025,'noise',180,-.2);
   return length;
  }
  function phrase(scene,bar,t,station='',venue=''){if(scene==='map')return mainPhrase(bar,t);if(scene==='battle')return battlePhrase(bar,t);if(scene==='establishment')return establishmentPhrase(venue,bar,t);const theme=scoreFor(scene,station),beat=60/theme.bpm,chord=theme.chords[Math.floor(bar/2)%theme.chords.length],root=theme.root,length=beat*4,isStation=['station','canteen'].includes(scene)&&!!stationScores[station];
   chord.forEach((n,i)=>{voice('music',t,length+1.4,hz(root+n),scene==='battle'?.045:.072,'sine',null,(i-1.5)*.38);if(scene!=='battle')voice('music',t+.07,length+1.1,hz(root+n)*1.0012,.024,theme.instrument==='hollow'?'sine':'triangle',null,(1.5-i)*.3);});
   if(scene==='danger'){
    for(let i=0;i<8;i++)voice('music',t+i*beat/2,beat*.38,hz(root+theme.melody[(bar*3+i)%theme.melody.length]),.065,'triangle',null,i%2?.2:-.2);
   }else if(isStation){
    const style=theme.instrument,groove=scene==='canteen'?[0,.5,1,1.5,2,2.5,3,3.5]:theme.rhythm,variation=Math.floor(bar/4)%2;
    voice('music',t,length*.88,hz(root+chord[bar%4===3?1:0]-12),style==='hollow'?.125:.10,'sine');
    groove.forEach((at,i)=>{const index=(bar*2+(variation?theme.melody.length-1-i:i)+theme.melody.length)%theme.melody.length,n=theme.melody[index],when=t+at*beat+.06,percussive=['pluck','bell','industrial'].includes(style),duration=scene==='canteen'?.65:percussive?.9:2.1,volume=style==='industrial'?.045:.04;
     voice('music',when,duration,hz(root+n+12),volume,style==='pluck'||style==='industrial'?'triangle':'sine',null,Math.sin(bar*.7+i)*.65);
     if(style==='bell'||style==='glass')voice('music',when+.012,duration*.6,hz(root+n+12)*(style==='bell'?2.002:1.5),.009,'sine',null,-Math.sin(bar*.7+i)*.5);
    });
    if(style==='industrial'||scene==='canteen')for(let i=0;i<4;i++){voice('music',t+i*beat,.08,style==='industrial'?900:700,.009,'noise',200,i%2?.4:-.4);if(style==='industrial'&&i%2===0)voice('music',t+i*beat,.19,65,.035,'sine',38);}
   }else{
    voice('music',t,length*.85,hz(root+chord[0]-12),.11,'sine');
    const steps=scene==='travel'||scene==='canteen'?8:3;
    for(let i=0;i<steps;i++){const n=theme.melody[(bar*2+i)%theme.melody.length],when=t+i*length/steps+.12;voice('music',when,scene==='canteen'?.8:1.65,hz(root+n+12),scene==='canteen'?.055:.035,'sine',null,Math.sin(bar+i)*.65);if(scene==='travel'&&i%2===0)voice('music',when,.15,hz(root+chord[0]),.038,'triangle');}
   }
   return length;
  }
  function effect(kind,t=ctx.currentTime+.006){const tone=(f,d=.1,v=.12,type='sine',end=null,offset=0,pan=0)=>voice('effects',t+offset,d,f,v,type,end,pan);
   switch(kind){
    case 'ui':tone(760,.045,.045,'sine',620);break;
    case 'trade-buy':tone(620,.13,.10);tone(830,.18,.08,'sine',null,.09);break;
    case 'trade-sell':tone(830,.13,.10);tone(1108,.22,.08,'sine',null,.08);break;
    case 'radio':tone(620,.045,.055);tone(930,.08,.045,'sine',null,.07);break;
    case 'engine':tone(1800,.8,.12,'noise',180);tone(42,.9,.14,'sine',84);tone(110,.6,.06,'triangle',220,.12);break;
    case 'dock':tone(700,.45,.07,'noise',120);[330,440,660].forEach((f,i)=>tone(f,.22,.08,'sine',null,.22+i*.12));break;
    case 'laser':tone(2300,.16,.13,'sawtooth',330);tone(3600,.10,.04,'sine',650,.02,-.25);break;
    case 'kinetic':tone(4200,.07,.16,'noise',450);tone(125,.16,.15,'triangle',48);break;
    case 'missile':tone(350,.55,.17,'noise',4200);tone(95,.35,.08,'sine',50,.13);break;
    case 'impact':tone(1700,.24,.18,'noise',95);tone(95,.32,.15,'sine',34);break;
    case 'shield':[620,930,1240].forEach((f,i)=>tone(f,.3,.07,'sine',f*.7,i*.045,(i-1)*.4));break;
    case 'explosion':tone(2200,1.05,.21,'noise',75);tone(68,.95,.25,'sine',23);tone(320,.45,.08,'triangle',46,.08);break;
    case 'success':[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,.4,.10,'sine',null,i*.10,(i-1.5)*.2));break;
    case 'warning':tone(294,.17,.09,'triangle');tone(277,.22,.07,'sine',null,.22);break;
    case 'service':tone(180,.14,.09,'triangle',360);tone(600,.2,.07,'sine',null,.14);break;
   }
  }
  return {music,effects,voices,voice,phrase,effect,stop};
 }
 function create(options={}){
  const host=options.host||root,doc=options.document||host.document,storage=options.storage||{getItem:k=>host.localStorage.getItem(k),setItem:(k,v)=>host.localStorage.setItem(k,v)},Context=options.Context||host.AudioContext||host.webkitAudioContext;
  let prefs;try{prefs=preferences(storage.getItem(KEY));}catch{prefs={...defaults};}
  let ctx=null,graph=null,scene='map',station='',establishment='',unlocked=false,timer=null,next=0,bar=0,mapBar=0,focused=doc?.hasFocus?.()!==false,disposed=false;const cooldown=new Map(),later=options.setInterval||host.setInterval.bind(host),cancel=options.clearInterval||host.clearInterval.bind(host);
  const visible=()=>!doc?.hidden&&focused;
  function status(){return {supported:!!Context,unlocked,state:ctx?.state||'idle',scene,active:!!ctx&&ctx.state==='running'&&!prefs.muted&&(prefs.music>0||prefs.effects>0)&&visible(),preferences:{...prefs},track:trackFor(scene,station,establishment)};}
  const notify=()=>{try{options.onStatus?.(status());}catch{}};
  function levels(){if(!ctx)return;graph.music.gain.setTargetAtTime(prefs.music*.48,ctx.currentTime,.06);graph.effects.gain.setTargetAtTime(prefs.effects*.60,ctx.currentTime,.025);}
  function tick(){if(!ctx||ctx.state!=='running'||prefs.muted||!visible()||!prefs.music)return;if(next<ctx.currentTime)next=ctx.currentTime+.04;while(next<ctx.currentTime+.35){next+=graph.phrase(scene,scene==='map'?mapBar++:bar++,next,station,establishment);}}
  function halt(){if(timer!==null){cancel(timer);timer=null;}graph?.stop(null,.05);next=0;}
  async function reconcile(){if(!ctx||disposed)return;if(prefs.muted||!visible()||!prefs.music&&!prefs.effects){halt();try{await ctx.suspend();}catch{}notify();return;}try{await ctx.resume();if(disposed||prefs.muted||!visible())return;levels();if(!prefs.music&&timer!==null){cancel(timer);timer=null;}if(prefs.music&&timer===null){next=ctx.currentTime+.07;tick();timer=later(tick,200);}notify();}catch{notify();}}
  function unlock(){if(disposed||!Context||prefs.muted||!visible())return;unlocked=true;if(!ctx){try{ctx=new Context({latencyHint:'interactive'});graph=soundGraph(ctx);levels();ctx.onstatechange=notify;}catch{try{ctx?.close();}catch{}ctx=null;graph=null;notify();return;}}return reconcile();}
  function persist(){try{storage.setItem(KEY,JSON.stringify(prefs));}catch{}}
  function set(update,save=true){const old=prefs;prefs=preferences(JSON.stringify({...prefs,...update}));if(save)persist();if(ctx){levels();if(!prefs.music&&old.music)graph.stop('music',.15);if(prefs.music&&!old.music)next=ctx.currentTime+.04;}if(!prefs.muted&&!unlocked)unlock();else reconcile();notify();return {...prefs};}
  function setScene(value,pid='',vid=''){value=value==='establishment'||Object.hasOwn(themes,value)?value:'map';const venue=value==='establishment'&&Object.hasOwn(establishmentScores,vid)?vid:'';if(value==='establishment'&&!venue)value='station';const target=['station','canteen'].includes(value)&&Object.hasOwn(stationScores,pid)?pid:'';if(value===scene&&target===station&&venue===establishment)return;scene=value;station=target;establishment=venue;bar=0;if(ctx){graph.stop('music',.5);next=ctx.currentTime+.12;tick();}notify();}
  function play(kind){if(!ctx||ctx.state!=='running'||prefs.muted||!prefs.effects||!visible())return;const now=ctx.currentTime;if(now-(cooldown.get(kind)??-100)<(kind==='ui'?.07:.12))return;cooldown.set(kind,now);graph.effect(kind);}
  function action(type,args,before,after){if(!before||!after)return;
   if(type==='battle-order'||type==='battle-tick'){
    if(type==='battle-tick')for(const weapon of new Set((after.battle?.live?.events||[]).map(e=>e.weapon)))play(weapon==='laser'?'laser':weapon==='ordnance'?'missile':'kinetic');
    const order=args.order||'',effects={laser:'laser',beam:'laser',fire:'kinetic',salvo:'kinetic',ordnance:'missile',missile:'missile',repair:'service',retreat:'engine',guard:'shield'};if(type==='battle-order')play(effects[order]||'ui');
    const oldHull=before.hull+(before.fleet||[]).reduce((n,v)=>n+v.hull,0),newHull=after.hull+(after.fleet||[]).reduce((n,v)=>n+v.hull,0);
    if((after.shipLosses?.length||0)>(before.shipLosses?.length||0))play('explosion');else if(newHull<oldHull)play('impact');
    if(before.battle&&!after.battle)play(after.battleHistory?.at(-1)?.outcome==='victory'?'success':'warning');return;
   }
   if(type==='depart'){play('engine');return;}
   if(type==='buy'||type==='secret-trade'&&args.kind==='buy'){play('trade-buy');return;}
   if(type==='sell'||type==='secret-trade'&&args.kind==='sell'){play('trade-sell');return;}
   if(['venue-talk','secret-talk','talk','diplomatic-negotiate'].includes(type)){play('radio');return;}
   if(/deliver|complete|diplomatic-report/.test(type)){play('success');return;}
   if(/buy|purchase|fit|service|repair|refuel|deposit|withdraw|borrow|repay|customs-pack|warehouse|spare/.test(type)){play('service');return;}
   if(before.location!==after.location)play(after.incident?'warning':'dock');
   else if(!before.incident&&after.incident)play('warning');
  }
  const gesture=e=>{if(e.isTrusted&&(e.type==='pointerdown'?(e.button===0):['Enter',' ','Spacebar'].includes(e.key)))unlock();},visibility=()=>{focused=doc?.hasFocus?.()!==false;if(unlocked)reconcile();},focus=()=>{focused=true;if(unlocked)reconcile();},blur=()=>{focused=false;if(unlocked)reconcile();};
  doc?.addEventListener('pointerdown',gesture,{capture:true,passive:true});doc?.addEventListener('keydown',gesture,true);doc?.addEventListener('visibilitychange',visibility);host.addEventListener?.('focus',focus);host.addEventListener?.('blur',blur);
  function dispose(){disposed=true;halt();doc?.removeEventListener('pointerdown',gesture,true);doc?.removeEventListener('keydown',gesture,true);doc?.removeEventListener('visibilitychange',visibility);host.removeEventListener?.('focus',focus);host.removeEventListener?.('blur',blur);try{ctx?.close();}catch{} }
  host.addEventListener?.('pagehide',dispose,{once:true});
  const safe=fn=>(...args)=>{try{const value=fn(...args);value?.catch?.(()=>{});return value;}catch{return undefined;}};
  return {status,unlock:safe(unlock),set:safe(set),persist,scene:safe(setScene),play:safe(play),action:safe(action),dispose:safe(dispose)};
 }
 async function renderPreview(context,scene='map',seconds=8,station='',venue=''){const graph=soundGraph(context,true);graph.music.gain.value=.48;graph.effects.gain.value=.60;let t=.05,bar=0;while(t<seconds-1)t+=graph.phrase(scene,bar++,t,station,venue);['ui','trade-buy','radio','engine','dock','laser','kinetic','missile','impact','shield','explosion','success'].forEach((kind,i)=>{if(scene==='effects')graph.effect(kind,.2+i*1.2);});if(scene==='effects')graph.music.gain.value=0;return context.startRendering();}
 const api={create,preferences,renderPreview,trackFor,stationScores:()=>JSON.parse(JSON.stringify(stationScores)),establishmentScores:()=>JSON.parse(JSON.stringify(establishmentScores))};if(typeof module!=='undefined')module.exports=api;else root.SpacetraderAudio=api;
})(typeof globalThis!=='undefined'?globalThis:this);
