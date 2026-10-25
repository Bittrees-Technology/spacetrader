'use strict';
// Approved catalogue data; changes require an explicit catalogue revision.
(function(root){const data={
  "revision": 4,
  "gameVersion": "0.72.228",
  "hulls": [
    {
      "id": "swift",
      "thrustFactor": 1.18,
      "name": "Swift",
      "role": "Express courier",
      "dryMass": 8,
      "cargoTonnes": 3.25,
      "tankTonnes": 18,
      "isp": 51500,
      "price": 16800,
      "maxSpares": 3,
      "balance": {
        "length": 27,
        "hullPoints": 90,
        "armor": 0.03,
        "shieldBase": 0,
        "shieldRating": 15,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            1,
            1,
            2,
            2
          ],
          "strength": [
            7,
            10,
            8,
            11
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            5,
            7,
            10
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            18,
            24,
            32
          ]
        }
      },
      "description": "A light pressure cabin, narrow radiator vanes and clustered engines. An uprated drive suits small urgent cargoes; only three tonnes of hold space.",
      "cargoM3": 8
    },
    {
      "id": "kestrel",
      "name": "Kestrel",
      "role": "Cislunar courier",
      "dryMass": 12,
      "cargoTonnes": 8.5,
      "tankTonnes": 22,
      "isp": 50000,
      "price": 21600,
      "maxSpares": 3,
      "balance": {
        "length": 32,
        "hullPoints": 120,
        "armor": 0.04,
        "shieldBase": 0,
        "shieldRating": 25,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            2,
            2,
            2,
            4
          ],
          "strength": [
            5,
            7,
            10,
            8
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            9,
            13,
            18
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            22,
            30,
            40
          ]
        }
      },
      "description": "A compact working courier with paired drive nacelles, a panelled pressure hull and a recessed forward cockpit. Balanced for early freight runs.",
      "cargoM3": 20
    },
    {
      "id": "osprey",
      "name": "Osprey",
      "role": "Armed escort cutter",
      "dryMass": 18,
      "cargoTonnes": 5,
      "tankTonnes": 38,
      "isp": 52500,
      "price": 78000,
      "maxSpares": 4,
      "balance": {
        "length": 44,
        "hullPoints": 220,
        "armor": 0.16,
        "shieldBase": 40,
        "shieldRating": 40,
        "shieldUpgrade": true,
        "laser": {
          "type": "burst",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            7,
            10,
            9,
            12
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            12,
            17,
            15,
            21
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            28,
            36,
            34,
            45
          ]
        }
      },
      "description": "A compact armored cutter with reinforced gun mounts. Stronger standard lasers and combat systems trade cargo room for patrol work.",
      "cargoM3": 10
    },
    {
      "id": "heron",
      "thrustFactor": 0.92,
      "name": "Heron",
      "role": "Survey and research vessel",
      "dryMass": 14,
      "cargoTonnes": 7,
      "tankTonnes": 55,
      "isp": 54000,
      "price": 93600,
      "maxSpares": 5,
      "balance": {
        "length": 50,
        "hullPoints": 160,
        "armor": 0.06,
        "shieldBase": 0,
        "shieldRating": 35,
        "shieldUpgrade": true,
        "laser": {
          "type": "beam",
          "counts": [
            1,
            2,
            2,
            2
          ],
          "strength": [
            10,
            8,
            12,
            17
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            10,
            14,
            19
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            24,
            32,
            42
          ]
        }
      },
      "description": "An instrument truss, large communication dish and survey cabin. Long endurance and extra spares, with little commercial hold space.",
      "cargoM3": 24
    },
    {
      "id": "merlin",
      "name": "Merlin",
      "role": "Fast interceptor",
      "price": 120000,
      "dryMass": 12,
      "cargoTonnes": 3.5,
      "tankTonnes": 32,
      "isp": 54000,
      "thrustFactor": 1.3,
      "maxSpares": 3,
      "kineticBase": 13,
      "description": "A compact interception hull wrapped around oversized drive machinery. Recessed twin lasers and small stores suit independent pursuit or convoy escape support; two tonnes of freight leave little room for trading.",
      "balance": {
        "length": 37,
        "hullPoints": 180,
        "armor": 0.12,
        "shieldBase": 25,
        "shieldRating": 30,
        "shieldUpgrade": true,
        "laser": {
          "type": "burst",
          "counts": [
            2,
            4,
            4,
            4
          ],
          "strength": [
            10,
            7,
            11,
            15
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            7,
            10,
            9,
            13
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            24,
            32,
            28,
            38
          ]
        }
      },
      "cargoM3": 8
    },
    {
      "id": "petrel",
      "name": "Petrel",
      "role": "Long-range tanker",
      "dryMass": 22,
      "cargoTonnes": 16,
      "tankTonnes": 140,
      "isp": 50000,
      "price": 144000,
      "maxSpares": 4,
      "balance": {
        "length": 74,
        "hullPoints": 280,
        "armor": 0.06,
        "shieldBase": 0,
        "shieldRating": 45,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            6,
            9,
            7,
            10
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            7,
            10,
            8
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            26,
            36,
            30
          ]
        }
      },
      "description": "Jacketed propellant drums dominate this tanker. Its large tank and modest hold suit long routes and low-volume cargo.",
      "cargoM3": 256
    },
    {
      "id": "peregrine",
      "name": "Peregrine",
      "role": "Interplanetary freighter",
      "dryMass": 28,
      "cargoTonnes": 36,
      "tankTonnes": 95,
      "isp": 52500,
      "price": 200000,
      "maxSpares": 4,
      "balance": {
        "length": 80,
        "hullPoints": 320,
        "armor": 0.07,
        "shieldBase": 0,
        "shieldRating": 50,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            2,
            4,
            4,
            4
          ],
          "strength": [
            7,
            5,
            8,
            11
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            12,
            17,
            14
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            28,
            38,
            32
          ]
        }
      },
      "description": "Shielded container bays and paired heat radiators surround a reinforced service hull. More cargo room than a courier without bulk-carrier costs.",
      "cargoM3": 90
    },
    {
      "id": "tern",
      "thrustFactor": 0.94,
      "name": "Tern",
      "role": "Refrigerated freighter",
      "dryMass": 25,
      "cargoTonnes": 26,
      "tankTonnes": 82,
      "isp": 52500,
      "price": 216000,
      "maxSpares": 4,
      "balance": {
        "length": 78,
        "hullPoints": 300,
        "armor": 0.08,
        "shieldBase": 0,
        "shieldRating": 45,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            7,
            10,
            8,
            11
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            8,
            11,
            9
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            26,
            36,
            30
          ]
        }
      },
      "description": "White insulated cargo pods and dedicated thermal panels protect temperature-sensitive freight. Refrigeration is included in the hull; cargo uses the standard market rules.",
      "cargoM3": 156
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
      "description": "A long personnel liner with segmented passenger cabins, paired life-support trunks and recessed baggage holds. Its 24 dedicated berths support certified passenger charters with real mass, daily care costs, deadlines and welfare duties.",
      "balance": {
        "length": 86,
        "hullPoints": 340,
        "armor": 0.09,
        "shieldBase": 40,
        "shieldRating": 55,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            4,
            4,
            4,
            6
          ],
          "strength": [
            5,
            7,
            10,
            9
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            8,
            7,
            10
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            26,
            36,
            30
          ]
        }
      },
      "cargoM3": 32
    },
    {
      "id": "cormorant",
      "thrustFactor": 0.85,
      "name": "Cormorant",
      "role": "Industrial cargo tug",
      "dryMass": 38,
      "cargoTonnes": 60,
      "tankTonnes": 170,
      "isp": 53500,
      "price": 360000,
      "maxSpares": 6,
      "balance": {
        "length": 91,
        "hullPoints": 440,
        "armor": 0.13,
        "shieldBase": 0,
        "shieldRating": 60,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            2,
            4,
            4,
            6
          ],
          "strength": [
            9,
            7,
            10,
            9
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            15,
            13,
            19
          ]
        },
        "ordnance": {
          "type": "torpedo",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            48,
            65,
            85
          ]
        }
      },
      "description": "A reinforced handling fork, grapples and a low cargo cradle. A middleweight freight hauler with an industrial silhouette; no separate salvage system is required.",
      "cargoM3": 180
    },
    {
      "id": "sanderling",
      "name": "Sanderling",
      "role": "Prospecting and mining vessel",
      "price": 420000,
      "dryMass": 42,
      "cargoTonnes": 40,
      "tankTonnes": 120,
      "isp": 51000,
      "thrustFactor": 0.82,
      "maxSpares": 6,
      "kineticBase": 14,
      "description": "An industrial prospecting ship with an articulated excavation frame, protected collection bins and a factory mining rig. It extracts finite surveyed ore and ice reserves; raw ore occupies hold space until paid refinery processing.",
      "balance": {
        "length": 68,
        "hullPoints": 400,
        "armor": 0.14,
        "shieldBase": 0,
        "shieldRating": 45,
        "shieldUpgrade": true,
        "laser": {
          "type": "beam",
          "counts": [
            2,
            2,
            2,
            4
          ],
          "strength": [
            9,
            13,
            18,
            13
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            14,
            20,
            16
          ]
        },
        "ordnance": {
          "type": "torpedo",
          "counts": [
            0,
            2,
            2,
            2
          ],
          "strength": [
            0,
            42,
            58,
            78
          ]
        }
      },
      "cargoM3": 64
    },
    {
      "id": "gannet",
      "name": "Gannet",
      "role": "Heavy convoy escort",
      "dryMass": 48,
      "cargoTonnes": 18,
      "tankTonnes": 150,
      "isp": 55000,
      "price": 504000,
      "maxSpares": 6,
      "balance": {
        "length": 102,
        "hullPoints": 700,
        "armor": 0.24,
        "shieldBase": 160,
        "shieldRating": 95,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            6,
            6,
            8,
            8
          ],
          "strength": [
            8,
            11,
            11,
            15
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            15,
            20,
            18,
            25
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            38,
            48,
            44,
            58
          ]
        }
      },
      "description": "A broad armored escort with paired engine pods. Heavy combat systems and reserves leave a smaller freight hold.",
      "cargoM3": 40
    },
    {
      "id": "rook",
      "name": "Rook",
      "role": "Salvage recovery vessel",
      "price": 600000,
      "dryMass": 50,
      "cargoTonnes": 44,
      "tankTonnes": 150,
      "isp": 52000,
      "thrustFactor": 0.84,
      "maxSpares": 7,
      "kineticBase": 15,
      "description": "An asymmetric recovery crane sits beside an open wreck cradle and sealed assessment workshop. Proposed salvage work recovers equipment from lawful wreck sites; recovery rights and hazards still matter.",
      "balance": {
        "length": 96,
        "hullPoints": 520,
        "armor": 0.16,
        "shieldBase": 0,
        "shieldRating": 65,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            4,
            4,
            4,
            6
          ],
          "strength": [
            7,
            10,
            14,
            12
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            16,
            14,
            20
          ]
        },
        "ordnance": {
          "type": "torpedo",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            50,
            68,
            56
          ]
        }
      },
      "cargoM3": 132
    },
    {
      "id": "ibis",
      "name": "Ibis",
      "role": "Medical support vessel",
      "price": 720000,
      "dryMass": 40,
      "cargoTonnes": 14,
      "tankTonnes": 160,
      "isp": 54000,
      "thrustFactor": 0.95,
      "maxSpares": 6,
      "kineticBase": 10,
      "description": "Isolated treatment modules and a protected ambulance docking gallery surround a long pressure spine. Eight dedicated medical berths support clinic transfer charters unlocked through prior passenger service and supervised medical research.",
      "balance": {
        "length": 110,
        "hullPoints": 480,
        "armor": 0.1,
        "shieldBase": 75,
        "shieldRating": 70,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            6,
            9,
            8,
            11
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            9,
            8,
            12
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            30,
            42,
            35
          ]
        }
      },
      "cargoM3": 56
    },
    {
      "id": "gyrfalcon",
      "thrustFactor": 1.1,
      "name": "Gyrfalcon",
      "role": "Long-range patrol frigate",
      "dryMass": 62,
      "cargoTonnes": 16,
      "tankTonnes": 230,
      "isp": 55000,
      "price": 900000,
      "maxSpares": 6,
      "balance": {
        "length": 128,
        "hullPoints": 950,
        "armor": 0.26,
        "shieldBase": 240,
        "shieldRating": 125,
        "shieldUpgrade": true,
        "laser": {
          "type": "beam",
          "counts": [
            8,
            8,
            10,
            12
          ],
          "strength": [
            12,
            16,
            17,
            19
          ]
        },
        "weapons": {
          "type": "rail",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            28,
            38,
            35,
            48
          ]
        },
        "ordnance": {
          "type": "torpedo",
          "counts": [
            4,
            4,
            6,
            6
          ],
          "strength": [
            65,
            85,
            80,
            105
          ]
        }
      },
      "description": "Twin drive booms, a reinforced command citadel and patrol laser mounts. The strongest standard combat fit in the catalog, with limited freight capacity.",
      "cargoM3": 36
    },
    {
      "id": "albatross",
      "name": "Albatross",
      "role": "Deep-system freighter",
      "dryMass": 70,
      "cargoTonnes": 120,
      "tankTonnes": 350,
      "isp": 55000,
      "price": 1080000,
      "maxSpares": 6,
      "balance": {
        "length": 158,
        "hullPoints": 980,
        "armor": 0.11,
        "shieldBase": 0,
        "shieldRating": 110,
        "shieldUpgrade": true,
        "laser": {
          "type": "pulse",
          "counts": [
            4,
            6,
            6,
            8
          ],
          "strength": [
            8,
            8,
            12,
            12
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            20,
            18,
            26
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            40,
            35,
            48
          ]
        }
      },
      "description": "A deep-system cargo lattice with large reserves and multiple container berths. High purchase and resupply costs reward planned routes.",
      "cargoM3": 360
    },
    {
      "id": "crane",
      "name": "Crane",
      "role": "Mobile fleet workshop",
      "price": 1260000,
      "dryMass": 78,
      "cargoTonnes": 32,
      "tankTonnes": 260,
      "isp": 53000,
      "thrustFactor": 0.78,
      "maxSpares": 12,
      "kineticBase": 16,
      "description": "A travelling repair yard with twin articulated service booms, sheltered work bays and stocked engineering racks. Proposed remote repairs consume parts and time, giving distant expeditions a reason to bring a workshop.",
      "balance": {
        "length": 170,
        "hullPoints": 1100,
        "armor": 0.18,
        "shieldBase": 0,
        "shieldRating": 125,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            6,
            6,
            8,
            8
          ],
          "strength": [
            7,
            10,
            10,
            14
          ]
        },
        "weapons": {
          "type": "coil",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            20,
            18,
            26
          ]
        },
        "ordnance": {
          "type": "torpedo",
          "counts": [
            0,
            2,
            4,
            4
          ],
          "strength": [
            0,
            62,
            54,
            74
          ]
        }
      },
      "cargoM3": 96
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
      "description": "A narrow dark pressure hull carries broad directional arrays, armored signal rooms and dedicated heat rejection. Proposed active jamming trades a combat action and heat for disrupted enemy targeting.",
      "balance": {
        "length": 118,
        "hullPoints": 500,
        "armor": 0.1,
        "shieldBase": 100,
        "shieldRating": 85,
        "shieldUpgrade": true,
        "laser": {
          "type": "beam",
          "counts": [
            2,
            4,
            4,
            6
          ],
          "strength": [
            12,
            9,
            13,
            12
          ]
        },
        "weapons": {
          "type": "rail",
          "counts": [
            0,
            2,
            2,
            4
          ],
          "strength": [
            0,
            24,
            34,
            28
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            2,
            2,
            4,
            4
          ],
          "strength": [
            36,
            48,
            42,
            58
          ]
        }
      },
      "cargoM3": 24
    },
    {
      "id": "pelican",
      "thrustFactor": 0.78,
      "name": "Pelican",
      "role": "Bulk cargo carrier",
      "dryMass": 110,
      "cargoTonnes": 220,
      "tankTonnes": 480,
      "isp": 54000,
      "price": 1800000,
      "maxSpares": 7,
      "balance": {
        "length": 205,
        "hullPoints": 1600,
        "armor": 0.15,
        "shieldBase": 0,
        "shieldRating": 150,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            8,
            8,
            10,
            12
          ],
          "strength": [
            7,
            10,
            10,
            11
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            0,
            4,
            6,
            8
          ],
          "strength": [
            0,
            10,
            10,
            11
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            0,
            4,
            6,
            8
          ],
          "strength": [
            0,
            38,
            36,
            40
          ]
        }
      },
      "description": "Large cylindrical bulk modules on a reinforced cargo cradle. The largest hold in the fleet comes with substantial dry mass, slower acceleration and an expensive propellant load.",
      "cargoM3": 616
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
      "description": "A heavy twin-hangar carrier with a raised offset command block, deep service decks and reinforced docking apertures. Carries two approved owned small craft; loaded mass counts against propulsion while embarked craft provide no active holds, tanks or weapons. Deploy at safely stopped licensed ports.",
      "balance": {
        "length": 340,
        "hullPoints": 2200,
        "armor": 0.22,
        "shieldBase": 280,
        "shieldRating": 180,
        "shieldUpgrade": true,
        "laser": {
          "type": "defensive",
          "counts": [
            10,
            12,
            14,
            16
          ],
          "strength": [
            8,
            9,
            11,
            13
          ]
        },
        "weapons": {
          "type": "cannon",
          "counts": [
            4,
            4,
            6,
            8
          ],
          "strength": [
            10,
            14,
            13,
            14
          ]
        },
        "ordnance": {
          "type": "missile",
          "counts": [
            4,
            4,
            6,
            8
          ],
          "strength": [
            42,
            56,
            52,
            62
          ]
        }
      },
      "cargoM3": 195
    }
  ],
  "drive": {
    "name": "Asterion",
    "acceleration": 0.04,
    "playbackSeconds": 32
  }
};function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}root.SpacetraderApprovedShips=freeze(data);if(typeof module!=='undefined')module.exports=root.SpacetraderApprovedShips;})(globalThis);
