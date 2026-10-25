/* Astronomy parameters: Research/science.txt. All stations and economies are fiction. */
const WORLD = {
  "systems": [
    {
      "id": "mercury",
      "name": "Mercury",
      "au": 0.387098,
      "period": 87.969,
      "mu": 22031.87,
      "tint": "ACA79C",
      "phase": 0.4
    },
    {
      "id": "venus",
      "name": "Venus",
      "au": 0.723332,
      "period": 224.701,
      "mu": 324858.59,
      "tint": "D7BE88",
      "phase": 2.1
    },
    {
      "id": "earth",
      "name": "Earth",
      "au": 1,
      "period": 365.256,
      "mu": 398600.4418,
      "tint": "6BABC5",
      "phase": 0
    },
    {
      "id": "mars",
      "name": "Mars",
      "au": 1.523679,
      "period": 686.98,
      "mu": 42828.375,
      "tint": "C77961",
      "phase": 0.773
    },
    {
      "id": "ceres",
      "name": "Ceres",
      "au": 2.7675,
      "period": 1681.63,
      "mu": 62.63,
      "tint": "AAA395",
      "phase": 1.381
    },
    {
      "id": "jupiter",
      "name": "Jupiter",
      "au": 5.2044,
      "period": 4332.59,
      "mu": 126686534,
      "tint": "C9AB8E",
      "phase": 1.68
    },
    {
      "id": "saturn",
      "name": "Saturn",
      "au": 9.5826,
      "period": 10759.22,
      "mu": 37931187,
      "tint": "D0B179",
      "phase": 1.84
    },
    {
      "id": "uranus",
      "name": "Uranus",
      "au": 19.1913,
      "period": 30688.5,
      "mu": 5793939,
      "tint": "91C7CA",
      "phase": 3.3
    },
    {
      "id": "neptune",
      "name": "Neptune",
      "au": 30.069,
      "period": 60182,
      "mu": 6836529,
      "tint": "638FD0",
      "phase": 4.2
    }
  ],
  "ports": [
    {
      "name": "Meridian Station",
      "body": "Earth",
      "group": "earth",
      "tint": "6BABC5",
      "contact": "Dr. Imani Okoye",
      "role": "Orbital logistics coordinator",
      "description": "A commercial dock in a 400 km Earth orbit. Electronics, medicines and food arrive from the surface by contracted launch services.",
      "hazard": "Orbital debris",
      "id": "earth",
      "fuelPrice": 85,
      "factors": {
        "water": 1.4,
        "food": 0.65,
        "metals": 1.25,
        "electronics": 0.68,
        "medicine": 0.65,
        "machinery": 0.85
      },
      "radius": 6778.1,
      "capture": 0,
      "kind": "planet",
      "au": 1,
      "period": 365.256,
      "phase": 0,
      "piracy": 0.04
    },
    {
      "name": "Shackleton Relay",
      "body": "Moon",
      "group": "earth",
      "tint": "B3B9C0",
      "contact": "Nadia Sato",
      "role": "Lunar cooperative dispatcher",
      "description": "A lunar orbital depot supporting south-polar operations. Local tugs handle the surface leg. Water extraction and industrial processing underpin its economy.",
      "hazard": "Thermal cycling",
      "id": "moon",
      "fuelPrice": 52,
      "factors": {
        "water": 0.55,
        "food": 1.25,
        "metals": 0.8,
        "electronics": 1.35,
        "medicine": 1.4,
        "machinery": 1.2
      },
      "radius": 384400,
      "capture": 0.7,
      "kind": "moon",
      "au": 1,
      "period": 365.256,
      "phase": 0,
      "piracy": 0.04
    },
    {
      "name": "Valles Anchorage",
      "body": "Mars",
      "group": "mars",
      "tint": "C77961",
      "contact": "Ravi Chen",
      "role": "Habitat supply officer",
      "description": "A dock in a 400 km Mars orbit. Surface settlements exchange greenhouse produce and refined materials for Earth-made instrumentation.",
      "hazard": "Long-duration equipment wear",
      "id": "mars",
      "fuelPrice": 96,
      "factors": {
        "water": 0.95,
        "food": 0.85,
        "metals": 0.8,
        "electronics": 1.65,
        "medicine": 1.55,
        "machinery": 1.25
      },
      "radius": 3796.2,
      "capture": 0,
      "kind": "planet",
      "au": 1.523679,
      "period": 686.98,
      "phase": 0.773,
      "piracy": 0.13
    },
    {
      "name": "Stickney Dock",
      "body": "Phobos",
      "group": "mars",
      "tint": "A79886",
      "contact": "Elena Petrov",
      "role": "Yard superintendent",
      "description": "A facility near Mars\u2019s inner moon. Low gravity is useful for cargo handling; food and medical stores must be supplied from elsewhere.",
      "hazard": "Docking and machinery faults",
      "id": "phobos",
      "fuelPrice": 82,
      "factors": {
        "water": 1.1,
        "food": 1.35,
        "metals": 0.7,
        "electronics": 1.35,
        "medicine": 1.7,
        "machinery": 0.8
      },
      "radius": 9376,
      "capture": 0.03,
      "kind": "moon",
      "au": 1.523679,
      "period": 686.98,
      "phase": 0.773,
      "piracy": 0.13
    },
    {
      "name": "Occator Exchange",
      "body": "Ceres",
      "group": "ceres",
      "tint": "AAA395",
      "contact": "Amara Adeyemi",
      "role": "Belt freight broker",
      "description": "A station in a low orbit around the dwarf planet Ceres. Its water-rich setting supports a depot and processing industry.",
      "hazard": "Micrometeoroid damage",
      "id": "ceres",
      "fuelPrice": 48,
      "factors": {
        "water": 0.48,
        "food": 1.8,
        "metals": 0.7,
        "electronics": 1.85,
        "medicine": 1.9,
        "machinery": 1.3
      },
      "radius": 576,
      "capture": 0,
      "kind": "planet",
      "au": 2.7675,
      "period": 1681.63,
      "phase": 1.381,
      "piracy": 0.13
    },
    {
      "name": "Valhalla Relay",
      "body": "Callisto",
      "group": "jupiter",
      "tint": "A48A8B",
      "contact": "Tomas Alvarez",
      "role": "Outer-system operations chief",
      "description": "An orbital depot at Jupiter\u2019s outer Galilean moon. Callisto is farther from Jupiter\u2019s most intense radiation belts than Europa or Io. Food and electronics carry a premium.",
      "hazard": "Radiation and long transit exposure",
      "id": "callisto",
      "fuelPrice": 78,
      "factors": {
        "water": 0.6,
        "food": 2.4,
        "metals": 1.2,
        "electronics": 2.8,
        "medicine": 2.5,
        "machinery": 1.8
      },
      "radius": 1882700,
      "capture": 0.75,
      "kind": "moon",
      "au": 5.2044,
      "period": 4332.59,
      "phase": 1.68,
      "piracy": 0.09
    },
    {
      "name": "Kraken Orbital",
      "body": "Titan",
      "group": "saturn",
      "tint": "D0B179",
      "contact": "Leila Haddad",
      "role": "Saturn freight director",
      "description": "An orbital terminal serving Saturn\u2019s largest moon. Local atmospheric and surface operations are handled by specialist vehicles; your freighter remains in space.",
      "hazard": "Extended isolation and system wear",
      "id": "titan",
      "fuelPrice": 68,
      "factors": {
        "water": 0.65,
        "food": 2.8,
        "metals": 1.5,
        "electronics": 3.2,
        "medicine": 2.9,
        "machinery": 2.1
      },
      "radius": 1221870,
      "capture": 0.8,
      "kind": "moon",
      "au": 9.5826,
      "period": 10759.22,
      "phase": 1.84,
      "piracy": 0.09
    },
    {
      "id": "mercury",
      "group": "mercury",
      "body": "Mercury",
      "name": "Caloris Observatory",
      "radius": 2840,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 1.9,
        "food": 2.0,
        "metals": 0.65,
        "electronics": 1.5,
        "medicine": 1.8,
        "machinery": 1.3
      },
      "contact": "Sofia Mendes",
      "role": "Station operations officer",
      "hazard": "Intense solar heating",
      "description": "Robotic processing of silicate rock and metal-bearing feedstock is speculative. Polar ice is limited and extraction is difficult.",
      "fuelPrice": 95,
      "tint": "ACA79C",
      "au": 0.387098,
      "period": 87.969,
      "phase": 0.4,
      "piracy": 0.09
    },
    {
      "id": "venus",
      "group": "venus",
      "body": "Venus",
      "name": "Aphrodite Orbital",
      "radius": 6452,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 1.9,
        "food": 2.0,
        "metals": 1.5,
        "electronics": 1.8,
        "medicine": 1.9,
        "machinery": 1.6
      },
      "contact": "Kenji Adebayo",
      "role": "Station operations officer",
      "hazard": "Solar heating and difficult surface access",
      "description": "An orbital science and relay station. Venus has no accessible surface ocean; water and food are imported. No routine surface mining is assumed.",
      "fuelPrice": 95,
      "tint": "D7BE88",
      "au": 0.723332,
      "period": 224.701,
      "phase": 2.1,
      "piracy": 0.09
    },
    {
      "id": "earth-high",
      "group": "earth",
      "body": "Earth high orbit",
      "name": "Kepler Shipyard",
      "radius": 42164,
      "capture": 0,
      "kind": "station",
      "factors": {
        "water": 1.1,
        "food": 1.4,
        "metals": 0.8,
        "electronics": 1.2,
        "medicine": 1.5,
        "machinery": 0.8
      },
      "contact": "Mara Singh",
      "role": "Station operations officer",
      "hazard": "Debris and docking traffic",
      "description": "An equatorial high-orbit yard. Hardware comes from Earth; raising it out of Earth\u2019s gravity well costs propellant.",
      "fuelPrice": 95,
      "tint": "6BABC5",
      "au": 1,
      "period": 365.256,
      "phase": 0,
      "piracy": 0.04
    },
    {
      "id": "deimos",
      "group": "mars",
      "body": "Deimos",
      "name": "Swift Anchorage",
      "radius": 23463,
      "capture": 0.015,
      "kind": "moon",
      "factors": {
        "water": 1.1,
        "food": 1.4,
        "metals": 0.8,
        "electronics": 1.2,
        "medicine": 1.5,
        "machinery": 0.8
      },
      "contact": "Ari Nasser",
      "role": "Station operations officer",
      "hazard": "Dust and docking hazards",
      "description": "A low-gravity repair yard near Mars\u2019s outer moon. Water availability is uncertain, so no abundant local ice industry is assumed.",
      "fuelPrice": 95,
      "tint": "C77961",
      "au": 1.523679,
      "period": 686.98,
      "phase": 0.773,
      "piracy": 0.13
    },
    {
      "id": "jupiter",
      "group": "jupiter",
      "body": "Jupiter high orbit",
      "name": "Zephyr Array",
      "radius": 5000000,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 2.17,
        "food": 2.29,
        "metals": 1.72,
        "electronics": 2.06,
        "medicine": 2.17,
        "machinery": 1.83
      },
      "contact": "Quinn Mensah",
      "role": "Station operations officer",
      "hazard": "Magnetospheric radiation",
      "description": "A remote Jovian relay beyond Callisto. Jupiter has no solid surface. Atmospheric hydrogen is not treated as freely available orbital fuel.",
      "fuelPrice": 109,
      "tint": "C9AB8E",
      "au": 5.2044,
      "period": 4332.59,
      "phase": 1.68,
      "piracy": 0.09
    },
    {
      "id": "io",
      "group": "jupiter",
      "body": "Io",
      "name": "Pele Watch",
      "radius": 421700,
      "capture": 1.1,
      "kind": "moon",
      "factors": {
        "water": 2.17,
        "food": 2.29,
        "metals": 1.72,
        "electronics": 2.06,
        "medicine": 2.17,
        "machinery": 1.83
      },
      "contact": "Sana Torres",
      "role": "Station operations officer",
      "hazard": "Severe Jovian radiation",
      "description": "A heavily shielded research outpost. No cheap water exports; robotic logistics and strict exposure limits are essential.",
      "fuelPrice": 109,
      "tint": "C9AB8E",
      "au": 5.2044,
      "period": 4332.59,
      "phase": 1.68,
      "piracy": 0.09
    },
    {
      "id": "europa",
      "group": "jupiter",
      "body": "Europa",
      "name": "Conamara Research",
      "radius": 671100,
      "capture": 0.95,
      "kind": "moon",
      "factors": {
        "water": 1.26,
        "food": 2.29,
        "metals": 1.83,
        "electronics": 2.4,
        "medicine": 2.29,
        "machinery": 2.06
      },
      "contact": "Elias Noor",
      "role": "Station operations officer",
      "hazard": "Severe radiation and planetary protection",
      "description": "An orbital research dock above an ice-covered world. Ocean access and mining are not assumed; protected research samples are not trade goods.",
      "fuelPrice": 109,
      "tint": "C9AB8E",
      "au": 5.2044,
      "period": 4332.59,
      "phase": 1.68,
      "piracy": 0.09
    },
    {
      "id": "ganymede",
      "group": "jupiter",
      "body": "Ganymede",
      "name": "Galileo Haven",
      "radius": 1070400,
      "capture": 1.3,
      "kind": "moon",
      "factors": {
        "water": 0.74,
        "food": 2.4,
        "metals": 1.37,
        "electronics": 2.52,
        "medicine": 2.52,
        "machinery": 1.95
      },
      "contact": "Lina Kovacs",
      "role": "Station operations officer",
      "hazard": "Radiation and long supply chains",
      "description": "A shielded orbital dock. Surface ice supplies industrial feedstock through costly extraction and transport.",
      "fuelPrice": 69,
      "tint": "C9AB8E",
      "au": 5.2044,
      "period": 4332.59,
      "phase": 1.68,
      "piracy": 0.09
    },
    {
      "id": "saturn",
      "group": "saturn",
      "body": "Saturn high orbit",
      "name": "Cassini Exchange",
      "radius": 4000000,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 2.55,
        "food": 2.68,
        "metals": 2.01,
        "electronics": 2.41,
        "medicine": 2.55,
        "machinery": 2.15
      },
      "contact": "Noor Alvarez",
      "role": "Station operations officer",
      "hazard": "Ring-plane crossings",
      "description": "An orbital terminal outside the bright rings. Saturn has no solid surface; ring ice collection is hazardous and is not free propellant.",
      "fuelPrice": 127,
      "tint": "D0B179",
      "au": 9.5826,
      "period": 10759.22,
      "phase": 1.84,
      "piracy": 0.09
    },
    {
      "id": "enceladus",
      "group": "saturn",
      "body": "Enceladus",
      "name": "Tiger Stripe Sentinel",
      "radius": 238037,
      "capture": 0.16,
      "kind": "moon",
      "factors": {
        "water": 1.48,
        "food": 2.68,
        "metals": 2.15,
        "electronics": 2.82,
        "medicine": 2.68,
        "machinery": 2.41
      },
      "contact": "Ada Farouk",
      "role": "Station operations officer",
      "hazard": "Plume particles and protected ocean research",
      "description": "An orbital science station. Plumes contain water ice, but collection and fuel processing require energy. Ocean preservation limits industrial exports.",
      "fuelPrice": 127,
      "tint": "D0B179",
      "au": 9.5826,
      "period": 10759.22,
      "phase": 1.84,
      "piracy": 0.09
    },
    {
      "id": "rhea",
      "group": "saturn",
      "body": "Rhea",
      "name": "Tirawa Depot",
      "radius": 527108,
      "capture": 0.3,
      "kind": "moon",
      "factors": {
        "water": 0.87,
        "food": 2.82,
        "metals": 1.61,
        "electronics": 2.95,
        "medicine": 2.95,
        "machinery": 2.28
      },
      "contact": "Ivo Nakamura",
      "role": "Station operations officer",
      "hazard": "Cold equipment and micrometeoroids",
      "description": "A depot supplied by robotic ice processing on an icy moon. Imported food, electronics and medicines remain expensive.",
      "fuelPrice": 80,
      "tint": "D0B179",
      "au": 9.5826,
      "period": 10759.22,
      "phase": 1.84,
      "piracy": 0.09
    },
    {
      "id": "iapetus",
      "group": "saturn",
      "body": "Iapetus",
      "name": "Cassini Ridge",
      "radius": 3560820,
      "capture": 0.25,
      "kind": "moon",
      "factors": {
        "water": 0.87,
        "food": 2.82,
        "metals": 1.61,
        "electronics": 2.95,
        "medicine": 2.95,
        "machinery": 2.28
      },
      "contact": "Nina Okafor",
      "role": "Station operations officer",
      "hazard": "Inclined orbit and isolation",
      "description": "An isolated outer-moon dock. Transfers include an inclination reserve; its tilted orbit makes it harder to reach than a flat diagram suggests.",
      "fuelPrice": 80,
      "tint": "D0B179",
      "au": 9.5826,
      "period": 10759.22,
      "phase": 1.84,
      "piracy": 0.09
    },
    {
      "id": "uranus",
      "group": "uranus",
      "body": "Uranus high orbit",
      "name": "Herschel Relay",
      "radius": 2000000,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 3.37,
        "food": 3.55,
        "metals": 2.66,
        "electronics": 3.19,
        "medicine": 3.37,
        "machinery": 2.84
      },
      "contact": "Rowan Pereira",
      "role": "Station operations officer",
      "hazard": "Extreme isolation and tilted system",
      "description": "A remote relay in Uranus\u2019s equatorial plane. Uranus has no solid surface. Arrivals require a large plane-change allowance.",
      "fuelPrice": 168,
      "tint": "91C7CA",
      "au": 19.1913,
      "period": 30688.5,
      "phase": 3.3,
      "piracy": 0.09
    },
    {
      "id": "miranda",
      "group": "uranus",
      "body": "Miranda",
      "name": "Verona Watch",
      "radius": 129390,
      "capture": 0.2,
      "kind": "moon",
      "factors": {
        "water": 1.95,
        "food": 3.55,
        "metals": 2.84,
        "electronics": 3.72,
        "medicine": 3.55,
        "machinery": 3.19
      },
      "contact": "Yara Chen",
      "role": "Station operations officer",
      "hazard": "Cold and scarce rescue capacity",
      "description": "An orbital geological observatory. Surface ice does not imply a mature mining economy; most high-value equipment must be imported.",
      "fuelPrice": 168,
      "tint": "91C7CA",
      "au": 19.1913,
      "period": 30688.5,
      "phase": 3.3,
      "piracy": 0.09
    },
    {
      "id": "ariel",
      "group": "uranus",
      "body": "Ariel",
      "name": "Lassell Dock",
      "radius": 190900,
      "capture": 0.35,
      "kind": "moon",
      "factors": {
        "water": 1.15,
        "food": 3.72,
        "metals": 2.13,
        "electronics": 3.9,
        "medicine": 3.9,
        "machinery": 3.02
      },
      "contact": "Teo Martins",
      "role": "Station operations officer",
      "hazard": "Cold systems and long supply chains",
      "description": "A speculative ice-processing depot. Power, refining and transport constrain all exports.",
      "fuelPrice": 106,
      "tint": "91C7CA",
      "au": 19.1913,
      "period": 30688.5,
      "phase": 3.3,
      "piracy": 0.09
    },
    {
      "id": "titania",
      "group": "uranus",
      "body": "Titania",
      "name": "Messina Terminal",
      "radius": 435910,
      "capture": 0.5,
      "kind": "moon",
      "factors": {
        "water": 1.15,
        "food": 3.72,
        "metals": 2.13,
        "electronics": 3.9,
        "medicine": 3.9,
        "machinery": 3.02
      },
      "contact": "Mina Salim",
      "role": "Station operations officer",
      "hazard": "Isolation and equipment endurance",
      "description": "An orbital terminal supplied by surface tugs. Ice-rich feedstock supports local processing; food and manufacturing remain imported.",
      "fuelPrice": 106,
      "tint": "91C7CA",
      "au": 19.1913,
      "period": 30688.5,
      "phase": 3.3,
      "piracy": 0.09
    },
    {
      "id": "oberon",
      "group": "uranus",
      "body": "Oberon",
      "name": "Mommur Anchorage",
      "radius": 583520,
      "capture": 0.45,
      "kind": "moon",
      "factors": {
        "water": 1.15,
        "food": 3.72,
        "metals": 2.13,
        "electronics": 3.9,
        "medicine": 3.9,
        "machinery": 3.02
      },
      "contact": "Alexei Costa",
      "role": "Station operations officer",
      "hazard": "Isolation and cold hardware",
      "description": "An outer Uranian depot. Small settlement markets depend on shipments that can take decades from Earth.",
      "fuelPrice": 106,
      "tint": "91C7CA",
      "au": 19.1913,
      "period": 30688.5,
      "phase": 3.3,
      "piracy": 0.09
    },
    {
      "id": "neptune",
      "group": "neptune",
      "body": "Neptune high orbit",
      "name": "Le Verrier Array",
      "radius": 1000000,
      "capture": 0,
      "kind": "planet",
      "factors": {
        "water": 4.3,
        "food": 4.53,
        "metals": 3.39,
        "electronics": 4.07,
        "medicine": 4.3,
        "machinery": 3.62
      },
      "contact": "Sol Adeyemi",
      "role": "Station operations officer",
      "hazard": "Decades of transit and weak sunlight",
      "description": "A nuclear-powered orbital research relay. Neptune has no solid surface and its atmosphere is not a free fuel pump.",
      "fuelPrice": 215,
      "tint": "638FD0",
      "au": 30.069,
      "period": 60182,
      "phase": 4.2,
      "piracy": 0.09
    },
    {
      "id": "triton",
      "group": "neptune",
      "body": "Triton",
      "name": "Lassell Research",
      "radius": 354759,
      "capture": 0.75,
      "kind": "moon",
      "factors": {
        "water": 2.49,
        "food": 4.53,
        "metals": 3.62,
        "electronics": 4.75,
        "medicine": 4.53,
        "machinery": 4.07
      },
      "contact": "Kai Haddad",
      "role": "Station operations officer",
      "hazard": "Retrograde orbit and extreme cold",
      "description": "A research dock in Triton\u2019s retrograde plane. Nitrogen and water ice exist, but arriving from a prograde Neptunian orbit requires an explicit reversal burn.",
      "fuelPrice": 215,
      "tint": "638FD0",
      "au": 30.069,
      "period": 60182,
      "phase": 4.2,
      "piracy": 0.09
    }
  ]
};
// Display-only astronomy. JPL long-range elements (3000 BC–3000 AD); NASA sidereal moon periods.
// References, limits and source receipt: Research/map-astronomy.md. Does not change route economics.
WORLD.mapAstronomy = {
  "planetElements": {
    "mercury": [
      [
        0.38709843,
        0.20563661,
        7.00559432,
        252.25166724,
        77.45771895,
        48.33961819
      ],
      [
        0,
        2.123e-05,
        -0.00590158,
        149472.67486623,
        0.15940013,
        -0.12214182
      ]
    ],
    "venus": [
      [
        0.72332102,
        0.00676399,
        3.39777545,
        181.9797085,
        131.76755713,
        76.67261496
      ],
      [
        -2.6e-07,
        -5.107e-05,
        0.00043494,
        58517.8156026,
        0.05679648,
        -0.27274174
      ]
    ],
    "earth": [
      [
        1.00000018,
        0.01673163,
        -0.00054346,
        100.46691572,
        102.93005885,
        -5.11260389
      ],
      [
        -3e-08,
        -3.661e-05,
        -0.01337178,
        35999.37306329,
        0.3179526,
        -0.24123856
      ]
    ],
    "mars": [
      [
        1.52371243,
        0.09336511,
        1.85181869,
        -4.56813164,
        -23.91744784,
        49.71320984
      ],
      [
        9.7e-07,
        9.149e-05,
        -0.00724757,
        19140.29934243,
        0.45223625,
        -0.26852431
      ]
    ],
    "jupiter": [
      [
        5.20248019,
        0.0485359,
        1.29861416,
        34.33479152,
        14.27495244,
        100.29282654
      ],
      [
        -2.864e-05,
        0.00018026,
        -0.00322699,
        3034.90371757,
        0.18199196,
        0.13024619
      ],
      [
        -0.00012452,
        0.0606406,
        -0.35635438,
        38.35125
      ]
    ],
    "saturn": [
      [
        9.54149883,
        0.05550825,
        2.49424102,
        50.07571329,
        92.86136063,
        113.63998702
      ],
      [
        -3.065e-05,
        -0.00032044,
        0.00451969,
        1222.11494724,
        0.54179478,
        -0.25015002
      ],
      [
        0.00025899,
        -0.13434469,
        0.87320147,
        38.35125
      ]
    ],
    "uranus": [
      [
        19.18797948,
        0.0468574,
        0.77298127,
        314.20276625,
        172.43404441,
        73.96250215
      ],
      [
        -0.00020455,
        -1.55e-05,
        -0.00180155,
        428.49512595,
        0.09266985,
        0.05739699
      ],
      [
        0.00058331,
        -0.97731848,
        0.17689245,
        7.67025
      ]
    ],
    "neptune": [
      [
        30.06952752,
        0.00895439,
        1.7700552,
        304.22289287,
        46.68158724,
        131.78635853
      ],
      [
        6.447e-05,
        8.18e-06,
        0.000224,
        218.46515314,
        0.01009938,
        -0.00606302
      ],
      [
        -0.00041348,
        0.68346318,
        -0.10162547,
        7.67025
      ]
    ]
  },
  "ceres": {
    "epoch": 2461200.5,
    "e": 0.07969229514816586,
    "a": 2.765552595034094,
    "q": 2.545159361382861,
    "i": 10.58802780183462,
    "om": 80.24862682043221,
    "w": 73.29421453021587,
    "ma": 274.4193463761342,
    "tp": 2461599.841466614,
    "per": 1679.853119758983,
    "n": 0.21430445064843,
    "ad": 2.985945828685327
  },
  "moons": {
    "moon": [
      27.321661,
      5.145
    ],
    "phobos": [
      0.31891023,
      1.08
    ],
    "deimos": [
      1.26244,
      1.79
    ],
    "io": [
      1.769138,
      0.04
    ],
    "europa": [
      3.551181,
      0.47
    ],
    "ganymede": [
      7.154553,
      0.18
    ],
    "callisto": [
      16.689017,
      0.19
    ],
    "enceladus": [
      1.370218,
      0
    ],
    "rhea": [
      4.5175,
      0.35
    ],
    "titan": [
      15.945421,
      0.33
    ],
    "iapetus": [
      79.330183,
      14.72
    ],
    "miranda": [
      1.413479,
      4.34
    ],
    "ariel": [
      2.520379,
      0.04
    ],
    "titania": [
      8.705867,
      0.08
    ],
    "oberon": [
      13.463234,
      0.07
    ],
    "triton": [
      -5.876854,
      157.345
    ]
  },
  "spinDays": {
    "mercury": 58.646,
    "venus": -243.025,
    "earth": 0.99726968,
    "mars": 1.02595675,
    "ceres": 0.3781,
    "jupiter": 0.41354,
    "saturn": 0.444,
    "uranus": -0.71833,
    "neptune": 0.67125
  },
  "axialTilt": {
    "mercury": 0.034,
    "venus": 177.36,
    "earth": 23.44,
    "mars": 25.19,
    "ceres": 4,
    "jupiter": 3.13,
    "saturn": 26.73,
    "uranus": 97.77,
    "neptune": 28.32
  }
};
if (typeof module !== "undefined") module.exports = WORLD;
