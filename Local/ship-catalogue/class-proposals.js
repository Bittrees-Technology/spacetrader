'use strict';
// Accepted roles and current implementation; catalogue remains read-only.
globalThis.SpacetraderClassProposals=Object.freeze({
  "kestrel": {
    "name": "Local runner",
    "solo": "Low-cost local trading and small client shipments.",
    "fleet": "Affordable extra cargo and propellant capacity on short routes.",
    "effect": "Reduce this hull’s provision bill by 10% on Earth–Moon journeys.",
    "conditions": "Both endpoints in the Earth system; this Kestrel travels at 50%+ integrity. Berths, propellant and companion ships remain full price.",
    "changes": "Adds a useful starter operating niche without raising starter combat power.",
    "abilities": [
      {
        "name": "Local runner",
        "effect": "Reduce this hull’s provision bill by 10% on Earth–Moon journeys.",
        "conditions": "Both endpoints in the Earth system; this Kestrel travels at 50%+ integrity. Berths, propellant and companion ships remain full price.",
        "changes": "Adds a useful starter operating niche without raising starter combat power.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Neighborhood charter",
        "effect": "After three successful local deliveries, unlock a repeatable 2–8-unit local supply job and a 5% reduction on this hull’s basic repair invoice at Meridian or Shackleton.",
        "conditions": "Earn the charter separately at each station with local trust of at least +10; one supply offer per station per 30 days. Repair discount never applies to ammunition, refits or purchased hulls.",
        "changes": "Adds a local career path and a reason to revisit home; discounts enter the shared service-discount cap.",
        "phase": 1,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Local civil freight; broader routes still need an eligible active companion and the purchased licence.",
    "status": "active"
  },
  "swift": {
    "name": "Express dispatch",
    "solo": "Urgent small deliveries with a light, fast ship.",
    "fleet": "A fast courier or, after carrier deployment exists, a carried messenger. It never speeds up a slower convoy.",
    "effect": "Pay +15% delivery fee for a client consignment of at most 1.5 t, capped at 4,000 cr extra.",
    "conditions": "Swift is flagship at acceptance and delivery; actual route, cargo mass and deadline are quoted first. A travelling slow escort still controls convoy speed.",
    "changes": "Adds priority freight with higher breach fees, rather than awarding speed bonuses for simply owning a courier.",
    "abilities": [
      {
        "name": "Express dispatch",
        "effect": "Pay +15% delivery fee for a client consignment of at most 1.5 t, capped at 4,000 cr extra.",
        "conditions": "Swift is flagship at acceptance and delivery; actual route, cargo mass and deadline are quoted first. A travelling slow escort still controls convoy speed.",
        "changes": "Adds priority freight with higher breach fees, rather than awarding speed bonuses for simply owning a courier.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Sealed messenger",
        "effect": "Unlock high-trust document and diplomatic courier missions with compact, traceable dispatch cases.",
        "conditions": "Local trust +15; reserve 0.25 t per physical case. Delivery pays once; opening, selling or abandoning a case records theft and closes the lawful mission.",
        "changes": "Adds diplomacy/commerce outcomes, optional criminal choices and patron follow-up missions.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Express and sealed dispatch handling; no automatic heavy-convoy or deep-expedition certification.",
    "status": "active"
  },
  "osprey": {
    "name": "Cutter thermal shunt",
    "solo": "Affordable bounty hunting and early combat missions.",
    "fleet": "An accessible armed escort with sustained laser fire.",
    "effect": "Energy-bank orders generate 3 less heat than the fitted weapon’s normal bank heat.",
    "conditions": "Only this ship’s laser orders qualify, whether flagship or active escort. Normal damage, cooling and accuracy remain.",
    "changes": "Applies to the acting Osprey only; damage, range, reload and accuracy use the fitted weapon package.",
    "status": "active",
    "abilities": [
      {
        "name": "Counter-ambush patrol",
        "effect": "Offer paid escort objectives for vulnerable NPC traders, with a +10% fee if all protected ships arrive above 70% integrity.",
        "conditions": "A patrol office issues one recorded charter with a disclosed threat budget. Bonus capped at 3,000 cr; no bonus for self-created distress or repeated combat against the same objective.",
        "changes": "Adds protect-and-withdraw encounters where survival can matter more than destroying all enemies.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Cooling discipline",
        "effect": "Fit a thermal-control specialization: one emergency vent removing up to 40 heat per engagement.",
        "conditions": "Spend the Osprey’s action; engineering rank 2 and a paid certified refit. Vent is once per battle and replaces guard: no guard protection, simultaneous shot or immediate shield regeneration. It adds no fleet-wide cooling.",
        "changes": "Builds on the active −3 laser-heat trait without creating unlimited attacks.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": {
      "name": "Cutter thermal shunt",
      "effect": "Energy-bank orders generate 3 less heat than the fitted weapon’s normal bank heat.",
      "conditions": "Only this ship’s laser orders qualify, whether flagship or active escort. Normal damage, cooling and accuracy remain.",
      "changes": "Applies to the acting Osprey only; damage, range, reload and accuracy use the fitted weapon package."
    },
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Patrol operations; retain existing solar/research eligibility, subject to authority checks and actual route fuel."
  },
  "heron": {
    "name": "Survey archive",
    "solo": "Survey commissions, first visits and route intelligence.",
    "fleet": "Locates prospecting and recovery opportunities for specialist companions.",
    "effect": "Give +5 navigation XP for the first filed survey of a destination and unlock finite deposit, wreck or signal leads.",
    "conditions": "Heron active at 50%+ integrity; survey costs one day. Site identity and result are saved before inspection; each destination XP reward is once per voyage. Licences still required.",
    "changes": "Adds an exploration job chain and persistent discovery records.",
    "abilities": [
      {
        "name": "Survey archive",
        "effect": "Give +5 navigation XP for the first filed survey of a destination and unlock finite deposit, wreck or signal leads.",
        "conditions": "Heron active at 50%+ integrity; survey costs one day. Site identity and result are saved before inspection; each destination XP reward is once per voyage. Licences still required.",
        "changes": "Adds an exploration job chain and persistent discovery records.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Provenance laboratory",
        "effect": "Authenticate one recovered antiquity or suspect beacon, revealing legal status, origin clues and a bounded confidence rating.",
        "conditions": "Spend one stopped day and a 150 cr lab charge; engineering rank 2. No instant resale payout, duplicate authentication XP or guaranteed genuine relic.",
        "changes": "Connects survey ships to antiquities traders, forgery detection and archive quests.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Survey and scientific access; require the actual research/radiation certification at hazardous facilities.",
    "status": "active"
  },
  "petrel": {
    "name": "Fuel purchasing contract",
    "solo": "Long-range low-volume trading and proposed fuel-supply contracts.",
    "fleet": "Contributes its large tanks to the existing shared propellant pool.",
    "effect": "Reduce fuel actually loaded into this Petrel’s tank by 8%.",
    "conditions": "Eligible contracted fuel depot; Petrel travels at 50%+ integrity. Discount applies before shared-pool allocation, once per actual purchased tonne; never to other tanks or fuel resale.",
    "changes": "Adds tanker operating economics without reducing physical route burn.",
    "abilities": [
      {
        "name": "Fuel purchasing contract",
        "effect": "Reduce fuel actually loaded into this Petrel’s tank by 8%.",
        "conditions": "Eligible contracted fuel depot; Petrel travels at 50%+ integrity. Discount applies before shared-pool allocation, once per actual purchased tonne; never to other tanks or fuel resale.",
        "changes": "Adds tanker operating economics without reducing physical route burn.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Stranded convoy supply",
        "effect": "Carry a finite, client-owned propellant allocation to a verified distress location.",
        "conditions": "Reserve the shipment in Petrel tank capacity at acceptance; it cannot fund ordinary travel or be sold. Delivery consumes it, provisions and time; shortfall triggers the stated freight liability.",
        "changes": "Requires separately accounted client fuel and supply missions; no creation of free reaction mass.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Long-endurance fuel carriage; keep current outer-system eligibility and normal earned-XP thresholds.",
    "status": "active"
  },
  "peregrine": {
    "name": "Warehouse logistics",
    "solo": "Versatile interplanetary freight and warehouse-based trading.",
    "fleet": "A balanced freight component alongside specialists.",
    "effect": "Reduce permanent warehouse-bay purchase price by 15%, capped at 5,000 cr per bay.",
    "conditions": "Peregrine flagship; warehouse actually exists and local trust is nonnegative. Record the amount paid as property value; no resale or home-switch refund.",
    "changes": "Creates a logistics niche and keeps net worth honest.",
    "abilities": [
      {
        "name": "Warehouse logistics",
        "effect": "Reduce permanent warehouse-bay purchase price by 15%, capped at 5,000 cr per bay.",
        "conditions": "Peregrine flagship; warehouse actually exists and local trust is nonnegative. Record the amount paid as property value; no resale or home-switch refund.",
        "changes": "Creates a logistics niche and keeps net worth honest.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Consolidated consignments",
        "effect": "Carry up to three compatible freight contracts together with a +5% completion-fee bonus, capped at 3,000 cr for the whole batch.",
        "conditions": "Every cargo lot has its own owner, origin, deadline and physical allocation. Bonus requires at least two distinct clients; it is a single batch bonus, not per-ship multiplication.",
        "changes": "Replaces the single active freight slot with a contract ledger; damage and theft are attributed to the affected lots.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Civil convoy and container handling; an endurance endorsement needs a reviewed loaded route reserve.",
    "status": "active"
  },
  "curlew": {
    "name": "Passenger manifest",
    "solo": "Passenger transport, diplomatic delegations and evacuation contracts.",
    "fleet": "Carries expedition personnel in dedicated pressure cabins.",
    "effect": "Book exclusive passenger charters for 4–24 travellers through freight offices. Dedicated berths add 0.1 t per traveller without consuming trade holds.",
    "conditions": "Discover passenger work through a freight or clinic conversation. Requires a welfare certificate, earned commerce and diplomacy level 1, an assigned Curlew at 70% hull and 70 crew readiness, and licensed endpoints. Care costs 2 cr per traveller per day.",
    "changes": "Persistent manifests, daily care, deadlines, welfare treatment, reduced late fees, reputation consequences and physical hull-loss accounting are active.",
    "abilities": [
      {
        "name": "Passenger manifest",
        "effect": "Book exclusive passenger charters for 4–24 travellers through freight offices. Dedicated berths add 0.1 t per traveller without consuming trade holds.",
        "conditions": "Discover passenger work through a freight or clinic conversation. Requires a welfare certificate, earned commerce and diplomacy level 1, an assigned Curlew at 70% hull and 70 crew readiness, and licensed endpoints. Care costs 2 cr per traveller per day.",
        "changes": "Persistent manifests, daily care, deadlines, welfare treatment, reduced late fees, reputation consequences and physical hull-loss accounting are active.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Delegation charter",
        "effect": "Unlock diplomatic delegations and relief-worker journeys with a +10% fee after safe, on-time handover.",
        "conditions": "At least six passengers, local trust +15 and readiness 70+. Bonus capped at 5,000 cr; illicit cargo must be disclosed and can invalidate the charter.",
        "changes": "Adds branching conversations at arrival and patron reputation; harmed passengers have stated consequences.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Passenger welfare and delegation handling; outer-system passenger work needs a reviewed endurance certificate.",
    "status": "active"
  },
  "merlin": {
    "name": "Break-contact screen",
    "solo": "Short-range interception and pursuit missions.",
    "fleet": "Helps an outmatched convoy break away from attackers.",
    "effect": "A screen order adds 10 percentage points to fleet withdrawal chance for the current round, capped at 95%. A flagship Merlin attempts withdrawal as part of its screen order.",
    "conditions": "Requires at least 35% integrity and 20 spare heat capacity. Escort screens cannot stack. A flagship screen also spends normal fleet withdrawal propellant; failure uses its action.",
    "changes": "Screening replaces firing. It changes combat escape chances, not cruise speed.",
    "status": "active",
    "abilities": [
      {
        "name": "Intercept and identify",
        "effect": "Spend a combat action to expose a fleeing raider’s identity and mark its escape direction for a later pursuit lead.",
        "conditions": "Merlin at 35%+ integrity; add 20 heat and use ordinary maneuver propellant. Mark lasts two rounds and reveals a saved clue, never an automatic interception or capture.",
        "changes": "Adds a pursuit role distinct from Gannet protection and Nightjar interference.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Rapid response warrant",
        "effect": "Unlock short-window intercept or rescue missions with +10% fee, capped at 3,000 cr.",
        "conditions": "Issuer and target route are already licensed. ETA includes the whole travelling fleet; named objective and expiry are saved on acceptance.",
        "changes": "Makes the small interceptor valuable between battles without accelerating larger companions.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": {
      "name": "Break-contact screen",
      "effect": "A screen order adds 10 percentage points to fleet withdrawal chance for the current round, capped at 95%. A flagship Merlin attempts withdrawal as part of its screen order.",
      "conditions": "Requires at least 35% integrity and 20 spare heat capacity. Escort screens cannot stack. A flagship screen also spends normal fleet withdrawal propellant; failure uses its action.",
      "changes": "Screening replaces firing. It changes combat escape chances, not cruise speed."
    },
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Intercept patrol and rapid response; short-range class alone does not grant deep-space logistics access."
  },
  "sanderling": {
    "name": "Finite-deposit extraction",
    "solo": "Extracts saleable raw materials from surveyed deposits.",
    "fleet": "Supplies a trading expedition with ore for existing cargo holds.",
    "effect": "Extract finite surveyed ore or ice in 4–11-unit work orders, capped by deposit reserves and the mining ship’s free hold.",
    "conditions": "Discover the survey register at an eligible coordinator. Survey with a Heron or level 2 sensors and navigation level 1. Extraction needs a local authority claim, earned engineering level 2, an assigned Sanderling at 50% hull, one spare, a quoted service fee and two days.",
    "changes": "Raw ore occupies 250 kg per unit and needs paid two-day refining at a spaceport freight or market desk. Ice enters water stores. A fixed 15% work-order hazard causes 6 hull damage; deposits never refill.",
    "abilities": [
      {
        "name": "Finite-deposit extraction",
        "effect": "Extract finite surveyed ore or ice in 4–11-unit work orders, capped by deposit reserves and the mining ship’s free hold.",
        "conditions": "Discover the survey register at an eligible coordinator. Survey with a Heron or level 2 sensors and navigation level 1. Extraction needs a local authority claim, earned engineering level 2, an assigned Sanderling at 50% hull, one spare, a quoted service fee and two days.",
        "changes": "Raw ore occupies 250 kg per unit and needs paid two-day refining at a spaceport freight or market desk. Ice enters water stores. A fixed 15% work-order hazard causes 6 hull damage; deposits never refill.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Assay and supply charter",
        "effect": "Offer a +10% fee on verified ore-supply contracts accepted before extraction.",
        "conditions": "Station specifies grade and 12–40 units; source, sample and chain of custody required. Premium capped at 5,000 cr; no market buy/sell-price bonus or sale of unprocessed ore as refined electronics.",
        "changes": "Adds a small raw-ore commodity and paid processing at industrial stations; provenance determines eligibility.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Industrial extraction and lawful mineral claims; claim rights do not substitute for a destination licence.",
    "status": "active"
  },
  "rook": {
    "name": "Recovery rights",
    "solo": "Recovers equipment and merchandise from lawful wreck sites.",
    "fleet": "Retrieves damaged components or stranded small assets for a recovery fee.",
    "effect": "Recover cargo, components or antiquity leads from a discovered wreck.",
    "conditions": "One lawful recovery licence or an explicit theft choice; two stopped days, one spare and 50%+ integrity. Finite wreck inventory; recovered mass must fit; own scuttled ships yield no profitable rewards.",
    "changes": "Adds wreck ownership, hazard checks and persisted recovery receipts.",
    "abilities": [
      {
        "name": "Recovery rights",
        "effect": "Recover cargo, components or antiquity leads from a discovered wreck.",
        "conditions": "One lawful recovery licence or an explicit theft choice; two stopped days, one spare and 50%+ integrity. Finite wreck inventory; recovered mass must fit; own scuttled ships yield no profitable rewards.",
        "changes": "Adds wreck ownership, hazard checks and persisted recovery receipts.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Evidence cradle",
        "effect": "Secure a sealed 1 t evidence lot from a confirmed raider site for a 2,000–6,000 cr patrol contract.",
        "conditions": "Patrol names the site first; no active battle; preserve the lot unopened and hand it to the issuing authority. No second bounty on an already closed warrant.",
        "changes": "Links salvage, crime investigation and later raider leads without paying twice for one kill.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Wreck recovery and evidence custody; separate legal recovery rights are required at each owned site.",
    "status": "active"
  },
  "ibis": {
    "name": "Mobile treatment wards",
    "solo": "Medical transport, relief and rescue contracts.",
    "fleet": "Restores crew readiness while stopped away from a clinic.",
    "effect": "Restore up to 10 fleet crew-readiness points per stopped day, using one owned medical-supply unit per four active ships, rounded up.",
    "conditions": "Minimum one supply unit; one treatment per fleet per day; Ibis at 50%+ integrity; no battle or unresolved incident. Client-owned freight cannot be consumed; duplicate ships do not multiply the rate.",
    "changes": "Adds a bounded medical service; local clinics still provide studies, patron work and full treatment.",
    "abilities": [
      {
        "name": "Mobile treatment wards",
        "effect": "Restore up to 10 fleet crew-readiness points per stopped day, using one owned medical-supply unit per four active ships, rounded up.",
        "conditions": "Minimum one supply unit; one treatment per fleet per day; Ibis at 50%+ integrity; no battle or unresolved incident. Client-owned freight cannot be consumed; duplicate ships do not multiply the rate.",
        "changes": "Adds a bounded medical service; local clinics still provide studies, patron work and full treatment.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Rescue and relief intake",
        "effect": "Provide 12 temporary patient berths and accept field stabilization objectives.",
        "conditions": "Reserve 0.2 t actual patient/support mass per occupied berth and one medical unit per four patients per treatment day. Permanent evacuation requires a clinic handover and stated deadline.",
        "changes": "Adds civilian rescue, care quality and local trust rewards; Ibis treats patients while Curlew transports larger healthy groups.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Clinical transport and humanitarian relief; scientific/radiation access needs a separate facility endorsement.",
    "status": "active"
  },
  "crane": {
    "name": "Field repair workshop",
    "solo": "Remote engineering and repair contracts.",
    "fleet": "Repairs travelling companions between encounters.",
    "effect": "Restore up to 12 integrity to one active local hull using a hull-scaled spare lot and one stopped day.",
    "conditions": "Crane at 50%+ integrity; outside battle and unresolved incidents. Consume max(1, ceiling(target base dry mass / 25 t)) owned spares. One service per fleet day; recipient is present. No XP for repairing deliberate damage or repeat service farming.",
    "changes": "Adds remote hull maintenance; module damage and full servicing still need a supplier dry dock.",
    "abilities": [
      {
        "name": "Field repair workshop",
        "effect": "Restore up to 12 integrity to one active local hull using a hull-scaled spare lot and one stopped day.",
        "conditions": "Crane at 50%+ integrity; outside battle and unresolved incidents. Consume max(1, ceiling(target base dry mass / 25 t)) owned spares. One service per fleet day; recipient is present. No XP for repairing deliberate damage or repeat service farming.",
        "changes": "Adds remote hull maintenance; module damage and full servicing still need a supplier dry dock.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Field component refit",
        "effect": "Install one already-owned compatible module at a stopped safe site for a service charge of 5% of its hull-scaled fitting price.",
        "conditions": "Engineering rank 3, one day, one spare and a paid certified fitting crate. Module compatibility, cargo and ammunition limits are checked before changes. No manufacturing, stock creation or field ammunition shop.",
        "changes": "Adds component-crate inventory and convenience while retaining station-only purchases and weapon-type suppliers.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Industrial service and field component handling; outer routes require inspected endurance and reserve supplies.",
    "status": "active"
  },
  "nightjar": {
    "name": "Directional interference",
    "solo": "Reconnaissance commissions and hazardous-route intelligence.",
    "fleet": "Disrupts enemy targeting while escorts protect the signal ship.",
    "effect": "A jamming order reduces enemy weapon accuracy by 10 percentage points for the current round.",
    "conditions": "Nightjar spends its action and adds 30 heat. One jammer effect per fleet; normal accuracy floors and heat limits apply. No invisibility or immunity.",
    "changes": "An operational Nightjar spends an action and 30 heat; one interference effect per round. Normal accuracy floors still apply.",
    "status": "active",
    "abilities": [
      {
        "name": "Signal triangulation",
        "effect": "Combine two independent observations to narrow a recorded raider or archive signal to a local approach corridor.",
        "conditions": "One stopped day per observation; navigation rank 3; observations separated by a completed route leg or seven days. One Nightjar result per signal; no global map reveal or forced engagement.",
        "changes": "Adds decaying intel quality and stronger proximity weighting only for a valid saved lead.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Counterfeit-beacon analysis",
        "effect": "Identify whether a particular distress transmission is authentic, uncertain or an ambush with +15 percentage points to the analysis check.",
        "conditions": "Nightjar at 50%+ integrity; spend one stopped day. Final confidence capped at 90%; observation is fixed on first analysis, so reloads and repeated dialogue cannot reroll it.",
        "changes": "Adds informed rescue decisions and pirate deception; existing cargo inspections and overdue debt remain enforceable.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": {
      "name": "Directional interference",
      "effect": "A jamming order reduces enemy weapon accuracy by 10 percentage points for the current round.",
      "conditions": "At least 35% integrity and 30 spare heat capacity; consumes its action. One interference effect per fleet per round; normal accuracy floors apply.",
      "changes": "An operational Nightjar spends an action and 30 heat; one interference effect per round. Normal accuracy floors still apply."
    },
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Reconnaissance and signal intelligence; neither stealth nor sensor power waives an authority licence."
  },
  "condor": {
    "name": "Embarked small craft",
    "solo": "Runs distant expeditions with two deployable small craft.",
    "fleet": "A proposed staging base for approved small craft, supported by specialist escorts and a real supply train.",
    "effect": "Carry and deploy two owned Swift, Kestrel or Merlin craft at safely stopped, licensed ports.",
    "conditions": "Discover carrier work at a fleet registry and obtain the expedition certificate at earned navigation level 3. The 14 t base dry-mass ceiling and conservative measured fitting envelopes apply. Embarkation needs 60% carrier and 35% craft hull; deployment needs both at 35%. Each operation takes one day and 200 cr.",
    "changes": "Embarked craft add loaded mass once, provide no active cargo, tanks or combat turns, follow their carrier physically and are lost inside a destroyed carrier. Deployment rejoins the normal active fleet; detached remote commands remain separate.",
    "abilities": [
      {
        "name": "Embarked small craft",
        "effect": "Carry and deploy two owned Swift, Kestrel or Merlin craft at safely stopped, licensed ports.",
        "conditions": "Discover carrier work at a fleet registry and obtain the expedition certificate at earned navigation level 3. The 14 t base dry-mass ceiling and conservative measured fitting envelopes apply. Embarkation needs 60% carrier and 35% craft hull; deployment needs both at 35%. Each operation takes one day and 200 cr.",
        "changes": "Embarked craft add loaded mass once, provide no active cargo, tanks or combat turns, follow their carrier physically and are lost inside a destroyed carrier. Deployment rejoins the normal active fleet; detached remote commands remain separate.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Remote expedition staging",
        "effect": "Operate a temporary recovery point for a discovered survey or rescue objective.",
        "conditions": "Condor at 60%+ integrity, one deployed approved utility craft, one spare and one stopped day per staging operation. Only one active staging point; a surviving carrier is required to retrieve the craft.",
        "changes": "Connects scouting, rescue and retrieval with a vulnerable expensive base; no instant launch-and-fire, free repairs or unlimited respawning craft.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Deep-expedition carrier operations; both the carrier certificate and carried-craft clearance are required.",
    "status": "active"
  },
  "cormorant": {
    "name": "Heavy tow cradle",
    "solo": "Towing jobs and industrial cargo handling.",
    "fleet": "Retrieves a disabled travelling companion when safe to attach a tow.",
    "effect": "Tow one disabled, surviving hull to a licensed dry dock.",
    "conditions": "Target loaded mass at most 1.5 times this tug’s base dry mass; one tow per tug. Attach only outside battle using one spare and one day. Towed mass adds to burn; disabled ship contributes neither usable tanks nor active cargo capacity.",
    "changes": "Adds a separate towing state, lawful salvage checks and real transport costs; destroyed ships cannot be resurrected.",
    "abilities": [
      {
        "name": "Heavy tow cradle",
        "effect": "Tow one disabled, surviving hull to a licensed dry dock.",
        "conditions": "Target loaded mass at most 1.5 times this tug’s base dry mass; one tow per tug. Attach only outside battle using one spare and one day. Towed mass adds to burn; disabled ship contributes neither usable tanks nor active cargo capacity.",
        "changes": "Adds a separate towing state, lawful salvage checks and real transport costs; destroyed ships cannot be resurrected.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Industrial handling contract",
        "effect": "Unlock oversized sealed-machinery jobs with a +12% fee, capped at 6,000 cr.",
        "conditions": "Origin and destination both have industrial handling facilities; machinery occupies its actual hold space. One eligible tug must travel throughout carriage; no cargo multiplier for the rest of the fleet.",
        "changes": "Adds indivisible cargo and station-specific loading advantages.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Heavy handling and licensed towing; towed mass must pass the live route planner.",
    "status": "active"
  },
  "gannet": {
    "name": "Convoy screen",
    "solo": "Defensive patrol work and guarded freight.",
    "fleet": "Protects vulnerable traders and support vessels.",
    "effect": "A guard order reduces incoming damage to other active travelling ships by 10% for that round.",
    "conditions": "Gannet guards instead of firing. Its screen reduces raw incoming bank damage to other ships before shields and armor. It does not protect itself beyond normal guard and cannot stack.",
    "changes": "Protection ends when the guarding Gannet can no longer maintain the screen.",
    "status": "active",
    "abilities": [
      {
        "name": "Protected convoy contract",
        "effect": "Unlock higher-value escort contracts and a +10% objective fee when named civilian cargo carriers survive.",
        "conditions": "A licensed patrol office names the protected ships before departure; Gannet remains operational at arrival. No automatic bounty multiplier or raid immunity.",
        "changes": "Adds measurable defense objectives that reward the existing guard-and-screen action.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Brace and intercept",
        "effect": "Offer a defensive specialization that trades its own next firing opportunity for improved missile interception of one named companion.",
        "conditions": "Declare before the hostile response; one protected target, +10 percentage points to its interception, total cap 40%. Gannet must have a tracking laser, 35%+ integrity and 20 spare heat capacity; cannot stack with a second Gannet.",
        "changes": "Adds a targeted defense choice; generic guard remains available and the player chooses which support action to use.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": {
      "name": "Convoy screen",
      "effect": "A guard order reduces incoming damage to other active travelling ships by 10% for that round.",
      "conditions": "Gannet guards instead of firing. Its screen reduces raw incoming bank damage to other ships before shields and armor. It does not protect itself beyond normal guard and cannot stack.",
      "changes": "Protection ends when the guarding Gannet can no longer maintain the screen."
    },
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Protected convoy and patrol duties; existing outer-route permissions stay valid."
  },
  "gyrfalcon": {
    "name": "Patrol warrant",
    "solo": "Long-range notorious-raider hunting.",
    "fleet": "Provides offensive firepower when a convoy commits to battle.",
    "effect": "15% extra cash on a confirmed notorious-raider bounty claim.",
    "conditions": "Gyrfalcon must be active when the target is defeated, and owned at claim. Nonnegative wider reputation required; one bonus per bounty.",
    "changes": "The automatic patrol handover adds the bonus once to a qualifying captured warrant; generic pirate defense rewards are unchanged.",
    "status": "active",
    "abilities": [
      {
        "name": "Warrant chain",
        "effect": "Unlock multi-stage raider investigations: identify a courier, recover evidence, confirm a leader, then claim the posted warrant.",
        "conditions": "Patrol reputation +15 and navigation rank 3; leads age and remain uncertain. Each leader and investigation has a unique ID; the existing +15% warrant bonus applies once at capture.",
        "changes": "Adds objectives beyond repeated destruction while retaining existing closed-bounty receipts.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Disabling shot",
        "effect": "Choose a weakened hostile drive or weapon bank as a limited subsystem target instead of normal hull fire.",
        "conditions": "Target hull below 40%, shields below 20% and a completed sensor identification. Shot uses normal ammo, heat, range and an action, with −15 accuracy points; subsystem cap once per target.",
        "changes": "Supports surrenders, capture and boarding outcomes without guaranteed disables or extra damage.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": {
      "name": "Patrol warrant",
      "effect": "15% extra cash on a confirmed notorious-raider bounty claim.",
      "conditions": "An active Gyrfalcon at 35%+ integrity when a notorious raider is defeated; nonnegative wider reputation. Existing patrol handover pays the bonus once; ordinary pirate rewards do not qualify.",
      "changes": "The automatic patrol handover adds the bonus once to a qualifying captured warrant; generic pirate defense rewards are unchanged."
    },
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Patrol, scientific and long-range security duties; retain existing qualifications rather than silently narrowing them."
  },
  "albatross": {
    "name": "Deep-range stores",
    "solo": "Long-distance general freight with substantial reserves.",
    "fleet": "Carries the expedition’s long-haul commercial cargo.",
    "effect": "Reduce this hull’s provision charges by 15% on journeys lasting at least 60 coast days.",
    "conditions": "Albatross travels at 50%+ integrity. Each qualifying hull discounts only its own costs; burn, berths, companions and travel time remain physical.",
    "changes": "Adds an endurance niche rather than a universal expedition discount.",
    "abilities": [
      {
        "name": "Deep-range stores",
        "effect": "Reduce this hull’s provision charges by 15% on journeys lasting at least 60 coast days.",
        "conditions": "Albatross travels at 50%+ integrity. Each qualifying hull discounts only its own costs; burn, berths, companions and travel time remain physical.",
        "changes": "Adds an endurance niche rather than a universal expedition discount.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Remote depot charter",
        "effect": "Carry multi-leg station-resupply consignments with +10% total completion fee, capped at 10,000 cr.",
        "conditions": "Complete two or more named remote stops in the contracted order. Cargo and deadlines are tracked per leg; remote access is purchased normally.",
        "changes": "Adds staged logistics, stock-shortage stories and consequential choices about helping an extra settlement.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Deep-system commercial endurance; existing purchased access remains permanent.",
    "status": "active"
  },
  "pelican": {
    "name": "Bulk charters",
    "solo": "High-volume commodity trading and large freight jobs.",
    "fleet": "Provides the largest commercial hold in a cargo convoy.",
    "effect": "Unlock client-owned consignments of 40–120 units with fees based on occupied tonne-days, route costs and disclosed threat.",
    "conditions": "Full shipment fits at acceptance; operational Pelican remains in the travelling fleet. Quote a target 15% margin above estimated incremental direct costs, cap the negotiated fee, and retain freight liability.",
    "changes": "Replaces the old flat 3×-fee suggestion with volume- and time-based contracts; a larger hold carries larger obligations.",
    "abilities": [
      {
        "name": "Bulk charters",
        "effect": "Unlock client-owned consignments of 40–120 units with fees based on occupied tonne-days, route costs and disclosed threat.",
        "conditions": "Full shipment fits at acceptance; operational Pelican remains in the travelling fleet. Quote a target 15% margin above estimated incremental direct costs, cap the negotiated fee, and retain freight liability.",
        "changes": "Replaces the old flat 3×-fee suggestion with volume- and time-based contracts; a larger hold carries larger obligations.",
        "phase": 2,
        "status": "active"
      },
      {
        "name": "Station construction supply",
        "effect": "Deliver staged bulk materials to a finite station project, earning local trust and a project-specific service concession.",
        "conditions": "Issuer posts three finite milestones. Each lot is paid once; final concession is a 5% warehouse or basic repair discount there for 180 days, within the overall cap.",
        "changes": "Gives bulk trading a lasting local effect and follow-up missions without permanently breaking market spreads.",
        "phase": 3,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Bulk commercial freight and heavy-project carriage; no automatic industrial handling for indivisible machinery.",
    "status": "active"
  },
  "tern": {
    "name": "Certified cold chain",
    "solo": "Food and medical-supply freight with specialist certification.",
    "fleet": "Handles eligible cold-chain freight in its own hold.",
    "effect": "Pay +20% on-time food or medical consignment fees, capped at 6,000 cr extra.",
    "conditions": "Named certified Tern hold carries the qualifying lots throughout transit. A sealed-temperature log must stay valid; client medicine cannot be spent on treatment.",
    "changes": "Adds certified cargo allocation and handling events, without introducing spoilage for all ordinary trade goods.",
    "abilities": [
      {
        "name": "Certified cold chain",
        "effect": "Pay +20% on-time food or medical consignment fees, capped at 6,000 cr extra.",
        "conditions": "Named certified Tern hold carries the qualifying lots throughout transit. A sealed-temperature log must stay valid; client medicine cannot be spent on treatment.",
        "changes": "Adds certified cargo allocation and handling events, without introducing spoilage for all ordinary trade goods.",
        "phase": 1,
        "status": "active"
      },
      {
        "name": "Cold-store processing",
        "effect": "Handle one preaccepted refrigerated client lot at a specialist station for a quoted handling commission.",
        "conditions": "Station posts a finite client lot; Tern, a cold-chain certificate, one stopped day and empty certified hold space are required. No processing of the same lot twice.",
        "changes": "Adds refrigerated facility contracts and quality inspections; the fee is a separate service payment and daily commodity quotes stay fixed.",
        "phase": 2,
        "status": "active"
      }
    ],
    "activeAbility": null,
    "duty": "Proposed service abilities require an active, present ship at 50%+ integrity unless stricter terms are stated. Combat support retains its existing 35% threshold. Berthed or carried ships grant no passive fleet bonuses.",
    "certificates": "Certified food/medical cold chain; certification covers named lots carried in its own hold.",
    "status": "active"
  }
});
globalThis.SpacetraderRoleReview=Object.freeze({
  "title": "Roles & abilities",
  "version": 1,
  "proposalOnly": true,
  "principles": [
    "Forty proposed abilities across twenty classes; five existing combat traits remain active. Numbers are starting balance targets for review.",
    "One normal order per operational ship. Service roles usually require 50% integrity; current tactical support keeps its 35% threshold.",
    "Fleet combinations pay their real fuel, provisions, time and stores. Qualifying component actions unlock benefits; repeated identical ships do not multiply them.",
    "Keep fixed daily market quotes, purchased local access, exponential earned XP and existing saved-history receipts."
  ],
  "combos": [
    {
      "id": "local-start",
      "name": "Local trading partnership",
      "ships": [
        "kestrel",
        "swift"
      ],
      "solo": "Kestrel alone remains the cheapest local cargo career; Swift alone takes urgent light freight.",
      "effect": "Run ordinary freight in Kestrel while keeping Swift available for a separately accepted dispatch.",
      "conditions": "Both aboard one travelling fleet still share the slowest convoy ETA. Independent operations require a future detached-fleet system with its own fuel, captain and clocks.",
      "changes": "No extra combination cash bonus; complementary contract choices are the benefit.",
      "tradeoff": "Do not buy a second ship expecting faster travel or two simultaneous jobs before detached commands exist.",
      "status": "proposed"
    },
    {
      "id": "express-screen",
      "name": "Express escape group",
      "ships": [
        "swift",
        "merlin"
      ],
      "solo": "Swift trades cargo margin for speed; Merlin can pursue or withdraw alone.",
      "effect": "Use Merlin’s existing screen to help a valuable courier consignment escape.",
      "conditions": "Merlin spends its action before the flagship withdraws; current heat, fuel, 35% integrity and 95% escape cap apply.",
      "changes": "This tactical interaction already works; proposed priority contracts give it a commercial purpose.",
      "tradeoff": "A second hull increases burn and provisions and may slow the express ETA.",
      "status": "proposed"
    },
    {
      "id": "merchant-defense",
      "name": "Protected merchant convoy",
      "ships": [
        "peregrine",
        "gannet"
      ],
      "solo": "Peregrine carries freight; Gannet is a capable defensive solo ship.",
      "effect": "A Gannet guard reduces damage to the freighter while its captain chooses whether to fight or withdraw.",
      "conditions": "Existing screen is nonstacking; proposed protection-contract bonus requires named civilian carriers to survive.",
      "changes": "Existing guard interaction plus proposed protected-shipment contracts.",
      "tradeoff": "Screening uses the escort’s firing action; escort costs reduce freight profit.",
      "status": "proposed"
    },
    {
      "id": "cold-relief",
      "name": "Cold-chain relief mission",
      "ships": [
        "tern",
        "ibis",
        "gannet"
      ],
      "solo": "Tern can take certified medical freight alone; Ibis can perform a smaller rescue.",
      "effect": "Tern preserves certified parcels, Ibis treats patients, Gannet protects both.",
      "conditions": "Client medicine stays sealed and cannot power Ibis treatment. Carry separately owned medical supplies; patients require actual berths and mass.",
      "changes": "One mission fee, at most +25% combined specialist premium and a named clinic handover.",
      "tradeoff": "Medical delays consume stock and deadline margin; no triple payment for the same delivery.",
      "status": "proposed"
    },
    {
      "id": "survey-mine",
      "name": "Survey and extraction expedition",
      "ships": [
        "heron",
        "sanderling",
        "peregrine"
      ],
      "solo": "Sanderling may buy a valid survey; Heron earns discovery work without mining.",
      "effect": "Heron identifies a finite deposit, Sanderling extracts, Peregrine carries the yield.",
      "conditions": "Survey, claim, spares, work days and aggregate hold space must all be funded. All three ships are present for their own actions.",
      "changes": "Physical division of work; no invisible yield multiplier from fleet composition.",
      "tradeoff": "Survey and extraction can reveal a poor deposit, and a larger convoy costs more to return.",
      "status": "proposed"
    },
    {
      "id": "wreck-archive",
      "name": "Archive recovery partnership",
      "ships": [
        "heron",
        "rook",
        "nightjar"
      ],
      "solo": "Rook may use purchased lawful wreck coordinates; Heron can authenticate a station-supplied object.",
      "effect": "Nightjar analyzes a signal, Heron checks identity, Rook retrieves the physical lot.",
      "conditions": "Evidence and salvage rights needed; each observation and recovered item has a persistent identity and actual cargo allocation.",
      "changes": "Unlocks a branching archive investigation and antiquarian introduction.",
      "tradeoff": "Three observations do not guarantee a genuine artifact or profitable resale.",
      "status": "proposed"
    },
    {
      "id": "industrial-rescue",
      "name": "Heavy recovery train",
      "ships": [
        "cormorant",
        "crane",
        "petrel"
      ],
      "solo": "Cormorant can tow within its limit; Crane services a ship at a safe stop.",
      "effect": "Repair enough to stabilize a survivor, attach a lawful tow, then fund the loaded journey from the shared fuel pool.",
      "conditions": "Spare and day costs paid per operation; tow mass and tug limit checked; no destroyed-ship recovery.",
      "changes": "Adds a recovery contract paying for the measured tow burden and delivery.",
      "tradeoff": "Disabled hull contributes no usable fuel or cargo capacity; recovery can cost more than the hull is worth.",
      "status": "proposed"
    },
    {
      "id": "medical-evacuation",
      "name": "Evacuation flotilla",
      "ships": [
        "curlew",
        "ibis",
        "merlin"
      ],
      "solo": "Curlew handles routine passengers; Ibis handles smaller critical patients.",
      "effect": "Curlew moves healthy evacuees; Ibis supplies finite patient wards; Merlin screens a retreat.",
      "conditions": "Separate passenger and patient manifests, provisions, treatment supplies and deadlines. No automatic ship-to-ship transfer during battle.",
      "changes": "Rescue chain ends at a real clinic; specialist mission premium shares the +25% contract cap.",
      "tradeoff": "Overbooking or consuming freight medicine threatens welfare and reputation.",
      "status": "proposed"
    },
    {
      "id": "warrant-team",
      "name": "Raider investigation group",
      "ships": [
        "gyrfalcon",
        "nightjar",
        "merlin",
        "rook"
      ],
      "solo": "Gyrfalcon can pursue a confirmed warrant alone.",
      "effect": "Trace a lead, identify a hostile, disable or defeat it, then recover contracted evidence.",
      "conditions": "Nightjar and Merlin spend tactical actions; Rook works only after combat. Existing notorious bounty bonus remains +15% once; evidence pays only its separate preaccepted contract.",
      "changes": "Adds a multi-step hunt with capture and evidence outcomes.",
      "tradeoff": "Investigation costs time, leads expire, and damaged support ships can force withdrawal.",
      "status": "proposed"
    },
    {
      "id": "sustained-escort",
      "name": "Affordable escort pair",
      "ships": [
        "osprey",
        "gannet"
      ],
      "solo": "Osprey offers early offense; Gannet offers stronger defense.",
      "effect": "Osprey fires efficiently while Gannet screens a protected trader or guards itself.",
      "conditions": "One action per ship; Gannet does not screen itself, and its protection ends when it cannot maintain the screen.",
      "changes": "Uses current combat abilities; improve enemy intent previews and convoy objectives around them.",
      "tradeoff": "Two armed hulls still need real ammunition, repair cash and a paying objective.",
      "status": "proposed"
    },
    {
      "id": "outer-supply",
      "name": "Outer-system supply train",
      "ships": [
        "albatross",
        "petrel",
        "crane",
        "gannet"
      ],
      "solo": "Albatross can run licensed deep-range freight independently.",
      "effect": "Large holds, paid tanker fuel, limited field repairs and a defensive escort support a remote supply chain.",
      "conditions": "Each hull pays its own operating costs; discounts apply to eligible cost lines only. Normal route licensing and slowest-ship timing remain.",
      "changes": "Adds remote depot and return-load missions; no blanket fleet fuel or damage multiplier.",
      "tradeoff": "High fixed costs and return-fuel reserves make small speculative loads unattractive.",
      "status": "proposed"
    },
    {
      "id": "construction",
      "name": "Station construction convoy",
      "ships": [
        "pelican",
        "cormorant",
        "crane"
      ],
      "solo": "Pelican carries bulk lots; Cormorant takes smaller machinery work alone.",
      "effect": "Deliver bulk construction materials, indivisible machinery and a contracted installation team.",
      "conditions": "A finite project names accepted quantities, handling facilities and delivery milestones. Ship role is checked at its action, not only acceptance.",
      "changes": "Project-specific station concessions follow verified milestones, within service-discount caps.",
      "tradeoff": "Unfinished projects tie up capital; machinery cannot be split across undersized holds.",
      "status": "proposed"
    },
    {
      "id": "carrier-recon",
      "name": "Carrier reconnaissance group",
      "ships": [
        "condor",
        "heron",
        "nightjar",
        "swift"
      ],
      "solo": "Heron can survey from ordinary ports; Condor operates only after hangar systems are implemented.",
      "effect": "Carry an approved Swift as a messenger while Heron and Nightjar survey and analyze from the expedition group.",
      "conditions": "Heron and Nightjar are external escorts, not hangar occupants. Swift must pass the measured fitting envelope; deploy only at a safe stop.",
      "changes": "Adds staging and retrieval, not passive map reveal or free movement.",
      "tradeoff": "Carrier and stored craft are a concentrated loss risk, with no stored-ship combat actions.",
      "status": "proposed"
    },
    {
      "id": "carrier-recovery",
      "name": "Carrier recovery wing",
      "ships": [
        "condor",
        "merlin",
        "kestrel",
        "rook",
        "ibis"
      ],
      "solo": "Rook and Ibis can use ports instead of a carrier.",
      "effect": "Condor shelters approved Merlin and Kestrel craft; external Rook and Ibis recover cargo and patients at safe objectives.",
      "conditions": "Only two stored craft; Rook and Ibis never enter the hangars. Deployed craft mass, stores and return path remain accounted for.",
      "changes": "Makes carrier roles different from simply adding five active escorts.",
      "tradeoff": "Launch operations need time and a safe location; a carrier loss can also lose undeployed craft.",
      "status": "proposed"
    },
    {
      "id": "discreet-archive",
      "name": "Discreet archive courier",
      "ships": [
        "heron",
        "swift",
        "nightjar"
      ],
      "solo": "Swift may accept an unlocked secret courier contract without extra ships.",
      "effect": "Authenticate an antiquarian clue, recognize false rendezvous signals, then deliver a sealed lot quickly.",
      "conditions": "A discovered trader must introduce the job; legal status, inspections, client ownership and deadline are explicit. No ship makes contraband invisible.",
      "changes": "Adds lawful museum returns or an explicit illicit delivery branch with separate underworld standing.",
      "tradeoff": "Trust may be lost with a patrol, patron or criminal broker depending on the chosen handover.",
      "status": "proposed"
    }
  ],
  "systems": [
    {
      "id": "mission-ledger",
      "name": "Mission and quest contracts",
      "current": "The shared register indexes existing freight, passengers and personal work, plus up to three separately owned specialist contracts with reserved physical lots, deadlines, receipts, theft and liability.",
      "recommendation": "Introduce one mission ledger supporting delivery, escort, survey, extraction, recovery, passengers, investigation and multi-stage station projects.",
      "conditions": "Quote issuer, objective, cargo owner, assigned hulls, deadline, fee, liability, access and failure consequences before acceptance. Cap accepted work by physical capacity and stated contract slots.",
      "changes": "Add unique mission/objective IDs, reserved cargo and a receipt for each reward; defeat, abandonment, theft and expiry update the same ledger.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "combat-formation",
      "name": "Combat formation and action economy",
      "current": "Only the flagship may maneuver the formation once each round. Movement consumes fuel and an action; escorts retain their own firing and support opportunities.",
      "recommendation": "Give each fleet one formation-maneuver decision per round, paid by the commanding hull’s action and normal maneuver propellant. Add protected targets, safe disengagement and role-relevant objectives.",
      "conditions": "Keep one bank or support action per ship. Range changes cannot multiply simply by adding 32 escorts; enemy moves obey the same round limits. A later range-band model must be separately balanced.",
      "changes": "Add formation state and objective outcomes; retain heat, reload, armor, shields, interception and finite ammunition.",
      "ships": [
        "osprey",
        "gannet",
        "merlin",
        "gyrfalcon",
        "nightjar"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "combat-ai",
      "name": "Enemy intent and encounter balance",
      "current": "Regional crews use saved identities, threat budgets 2/5/8, varied class rosters, cargo-targeting intent, low-hull withdrawal and persistent survivor records. Enemy budgets never mirror player purchases.",
      "recommendation": "Use faction-specific enemy budgets and visible intents: extort, seize cargo, flee, disable, screen a leader or defend a tender. Retreating pirates should value their survival.",
      "conditions": "Threat comes from region, posted contract, cargo attraction and saved faction activity, with uncertainty shown before departure. Never mirror every purchased player upgrade with an automatic enemy upgrade.",
      "changes": "Add threat budgets, role-aware target selection and objective-based outcomes. At round 12, resolve escape, tracking or mission failure from objective state rather than treating every objective alike.",
      "ships": [
        "osprey",
        "gannet",
        "gyrfalcon",
        "nightjar",
        "merlin"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "combat-subsystems",
      "name": "Capture, subsystem damage and support",
      "current": "Identification lasts two rounds. Gyrfalcon subsystem shots use ammunition, heat and range with 15 points less accuracy; weakened identified hostiles can be asked to surrender. Osprey thermal and Gannet interception specializations are purchasable.",
      "recommendation": "Add a limited damaged-drive or damaged-bank state and surrender demands before any boarding system. Keep repairs, treatment, mining and salvage outside live combat.",
      "conditions": "Require identification, low target hull/shields, real ammo and a firing action. One disabled subsystem per target; capture needs a patrol handover. No automatic death recovery or free carrier fighters.",
      "changes": "Implement bounded subsystem state, surrender terms and capture receipts before considering boarding crews.",
      "ships": [
        "gyrfalcon",
        "merlin",
        "rook",
        "crane",
        "condor"
      ],
      "phase": 3,
      "status": "active"
    },
    {
      "id": "cargo-custody",
      "name": "Cargo, equipment and ship-loss accounting",
      "current": "Special lots have owners, masses and carrying hulls. Reserved fuel is not burnable; passengers, ore, modules, relics, carrier loads and external tows affect physical mass and loss accounting.",
      "recommendation": "Extend each physical lot with owner, assigned hull, mass, legal status, certification and mission ID. Add component crates, samples, sealed machinery, passenger mass and restricted relic cases.",
      "conditions": "Preserve aggregate trade controls and per-hull allocation. Each item counts once; no fitting both installed and stored, no client medicine used as supplies, no stored craft adding free capacity.",
      "changes": "Use one allocation pass when loadout or stores change; reserve job cargo atomically and show which hull carries the risk.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "markets-fees",
      "name": "Markets, premiums and discounts",
      "current": "Daily commodity quotes retain fixed supply-tier spreads. Conditional class and batch premiums pay once; service reductions share caps. Tern cold-chain premium is 20%, capped at 6000 cr.",
      "recommendation": "Keep the daily quote cache and move specialist advantages into clearly quoted mission fees, certified handling services and eligible station service lines.",
      "conditions": "Proposed specialist contract bonuses add together with the existing relic fee benefit, cap at +25% total, and respect the lower per-ability cap. Urgency/danger are priced into the base offer, not compounded again.",
      "changes": "Add a visible fee breakdown. Buy and sell transactions do not change that day’s quote or rerun fleet-specialty calculations.",
      "ships": [
        "swift",
        "tern",
        "peregrine",
        "albatross",
        "pelican"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "access-certification",
      "name": "Access licences and ship qualification",
      "current": "All twenty hulls have role-based access profiles. Earned XP, active present hull qualifications, issuer locations and purchased licences are checked separately; old purchased access is retained.",
      "recommendation": "Review every issuer and route against capability certificates: endurance, radiation protection, passenger welfare, industrial handling and lawful recovery. Explicitly map all 20 classes before release.",
      "conditions": "Still purchase the licence at its actual issuing port. A qualifying ship must be an active local flagship or escort above the stated integrity threshold. Relics and borrowed effective skill never replace earned XP requirements.",
      "changes": "Replace incomplete class whitelists with reviewed certificates and a clear explanation of what is missing; preserve already purchased access.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "xp-specialization",
      "name": "Experience and captain specialization",
      "current": "XP levels retain exponential thresholds. Combat action XP is capped at 10 per skill; repeat guard/movement, routine purchased maintenance and loss-making buy/resell loops give no action XP.",
      "recommendation": "Keep the curve; reward a distinct verified objective, first survey, successful rescue or tactically useful action. Cap action XP at 10 per skill per encounter and retain separate objective awards.",
      "conditions": "No XP for repeated misses, guarding without a threat, damaging your own ships, replaying dialogue or buying and reselling the same cargo. First-time and mission awards use unique receipt IDs.",
      "changes": "Add a per-encounter XP budget and objective tags; retain earned history and never subtract old earned XP merely for choosing a different ship.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "reputation-factions",
      "name": "Reputation and criminal careers",
      "current": "Public and local reputations continue alongside patrol, industrial, scientific, relief and underworld standing. Specialist success, failure, theft and provenance choices record distinct consequences.",
      "recommendation": "Keep wider and station reputation; add separate patrol, industrial, scientific, relief and underworld standing. Criminal success can improve broker trust while worsening lawful standing.",
      "conditions": "Publish consequences before theft, smuggling, evidence sales or patron betrayal. Positive criminal reputation never clears bank debt, makes contraband lawful or automatically cancels a wanted record.",
      "changes": "Record faction-specific event receipts and patron introductions; forgiveness requires restitution or a new mission, not repeated cheap dialogue.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 2,
      "status": "active"
    },
    {
      "id": "encounter-director",
      "name": "Random encounters and discovery",
      "current": "Saved regional crew histories, fresh investigation and triangulation leads affect normal approach encounters. Discoveries and read-only previews do not launch battles or consume encounter RNG.",
      "recommendation": "Keep physical regional risk, but choose from a weighted set of raids, distress, damaged beacons, industrial accidents, travelers, abandoned cargo and quiet passages. Discovery starts with imperfect clues.",
      "conditions": "Roll once per travel/event window and save the result; reloading, opening menus and repeating a conversation cannot reroll it. Publish meaningful risk factors, not exact hidden event identity.",
      "changes": "Add stable event IDs, a short variety cooldown and objective dependencies. Ships influence relevant options and confidence rather than guaranteeing profitable events.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 2,
      "status": "active"
    },
    {
      "id": "raiders-warrants",
      "name": "Raiders, bounties and persistent consequences",
      "current": "Investigations lead to ordinary travel encounters, with physical evidence and unique crew records. Existing named warrants still pay once; confirmed sites can issue separate finite Rook evidence-recovery work.",
      "recommendation": "Keep those one-time warrants; add finite procedural crews with leaders, territory, damaged survivors, heat and a cooldown before replacement factions appear. Paid intel should narrow a search.",
      "conditions": "Track capture, kill, escape and seized evidence distinctly. Gyrfalcon’s existing +15% bonus applies once; do not pay a bounty for ordinary salvage, surrendered civilians or a closed warrant.",
      "changes": "Add persistent faction leaders and saved pursuit leads. Revisit the Last Signal’s Albatross-labelled carrier role once Condor hangar gameplay exists.",
      "ships": [
        "gyrfalcon",
        "merlin",
        "nightjar",
        "rook",
        "osprey",
        "gannet"
      ],
      "phase": 2,
      "status": "active"
    },
    {
      "id": "antiquities",
      "name": "Antiquities, relic traders and authenticity",
      "current": "Finite wreck recovery can reveal physical antiquities with condition, origin, legal status and fixed uncertain authenticity. Analysis costs one day and 150 cr. Both relic collections share two slots and a +1 effective-skill cap.",
      "recommendation": "Add identified physical antiquities with provenance, condition, legal owner, a lead chain and either a collectible value or one bounded active effect. Let museums, brokers and scholars disagree about value.",
      "conditions": "Heron analysis improves information, not guaranteed authenticity. Rook retrieves lots; Swift moves sealed items. Keep two active relic slots; total relic effective-skill gain stays capped at +1 per skill, even with two related objects.",
      "changes": "Add item IDs and one-time appraisal records. Legal museum returns, discreet sales and forged objects create different reputation and mission outcomes.",
      "ships": [
        "heron",
        "rook",
        "swift",
        "nightjar"
      ],
      "phase": 3,
      "status": "active"
    },
    {
      "id": "station-identities",
      "name": "Station features, shortages and advantages",
      "current": "Certified cold and industrial facilities, finite supply projects, freight boards and station specialties distinguish services. Construction concessions reduce local repairs/bays by 5% for 180 days.",
      "recommendation": "Give each station a primary economy, one rarer facility specialty and named patron chains. Suggested anchors: Kepler engineering, Occator industry, Galileo care, Conamara science, Kraken cold-chain, Le Verrier deepwatch and Lassell Research archives.",
      "conditions": "Facility assignments are proposals for review, not claims that new services already exist. Universal refuelling remains. Purchases and ammunition stay tied to real local stock; introductions reveal only discovered offers.",
      "changes": "Add a station capability registry and finite projects. Completed construction may grant a limited service concession without turning every port into a full shipyard.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 2,
      "status": "active"
    },
    {
      "id": "services-finance",
      "name": "Local services, home advantage and bank terms",
      "current": "Existing branch rates, earned credit limits and enforcement remain. New service quotes use capped local/home reductions; Peregrine bays record actual cost, Petrel discounts only its depot fuel, and repairs scale with hull price.",
      "recommendation": "Use one additive service-discount cap of 30% across home, earned concessions and eligible class benefits. Exclude goods, hull purchases, loan APR and ammunition unless an offer explicitly says otherwise.",
      "conditions": "Each benefit names its station, eligible invoice line, duration and beneficiary hull. Never retroactively rewrite old loans or offer a risk-free borrow/deposit loop. Large debt still triggers existing arrival collection.",
      "changes": "Add invoice breakdowns and concession receipts; retain distinct market spreads, branch interest and debt consequences.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "dialogue-offers",
      "name": "Characters, conversations and offer discovery",
      "current": "Existing establishment conversations introduce specialist registers. Earned skills, trust, prior tasks, local certificates, discovered sites and active specialist hulls control their availability.",
      "recommendation": "Let a known coordinator, mechanic, medic, patrol officer or antiquarian introduce a role-relevant quest when trust and evidence justify it. Show only current exchange and applicable replies.",
      "conditions": "Asking about work does not accept it. Branch rewards are once per objective; offers persist through a defined window, show refusal consequences and do not reveal all hidden stations immediately.",
      "changes": "Add patron-specific quest memory, introductions, persuasion alternatives and explicit theft/return decisions.",
      "ships": [
        "curlew",
        "heron",
        "ibis",
        "rook",
        "gyrfalcon",
        "swift"
      ],
      "phase": 2,
      "status": "active"
    },
    {
      "id": "solo-fleet-design",
      "name": "Solo viability and fleet combinations",
      "current": "Basic solo trade/freight remains viable. Some field commissions quote paid station contractors; certified physical carriage requires its named specialist. Owned tools replace charges and enable additional objectives without remote passive bonuses.",
      "recommendation": "Allow solo versions using bought intel, station treatment, leased handling or a paid NPC escort. Fleet combinations should replace those costs with owned tools and meaningful obligations.",
      "conditions": "Combination benefits come from completed component actions, not ship ownership. Qualifying service ships must be present and operational; repeated identical support does not stack unless a capacity rule explicitly allows it.",
      "changes": "Add optional service alternatives and per-objective role checks. Do not require ownership of a million-credit utility hull for every ordinary mission.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "carrier-detachments",
      "name": "Carrier and independent fleet operations",
      "current": "Condor carries two owned approved small craft with safe-port embark/deploy, loaded mass and irreversible loss accounting. Staging needs a discovered objective, a surviving Condor and a deployed utility craft. Independent remote captains remain future work.",
      "recommendation": "Implement hangar inventory first; then safe deployment/retrieval; consider independent fleet captains only after separate fuel, time, objectives and failure records are reliable.",
      "conditions": "Kestrel, Swift and Merlin only; two berths, 14 t base dry-mass limit and measured upgrade clearance. No carrying other Condors. Stored craft mass counts once, with no pooled stores/capacity duplication.",
      "changes": "Add mothership/craft ownership, separate deployed manifests and irreversible-loss handling. An expedition cannot teleport a messenger home or repair destroyed craft.",
      "ships": [
        "condor",
        "kestrel",
        "swift",
        "merlin",
        "rook",
        "ibis",
        "heron",
        "nightjar"
      ],
      "phase": 3,
      "status": "active"
    },
    {
      "id": "balance-validation",
      "name": "Economy, balance and readable feedback",
      "current": "Focused acceptance suites cover ownership, payouts, costs, caps, itinerary order, finite sites, failure states and old saves. 1920 deterministic combat simulations cover all twenty classes at base and maximum fittings.",
      "recommendation": "Compare net profit per ship-day after fuel, provisions, repairs, ammo, financing and expected failures; also measure civilian survival, discovery progress and reputation.",
      "conditions": "Cover every class solo and each listed combination at early, mid and late progression. Include no-cash states, full holds, expired leads, loss of a required ship and repeated-action abuse.",
      "changes": "Implement one proposed loop at a time behind explicit content revisions; keep old saves intact and use stored quote/mission receipts for deterministic outcomes.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 1,
      "status": "active"
    },
    {
      "id": "loadout-branches",
      "name": "Loadout specializations and fitting costs",
      "current": "Certified Osprey thermal and Gannet interception duties consume normal combat actions. Hull-scaled fitting crates are bought from station suppliers and can be installed by a Crane with engineering 3, a spare, a day and a 5% charge.",
      "recommendation": "After core roles are stable, offer one optional duty specialization per hull: sustained fire, interception, certified freight, survey or field support. Keep ordinary tier upgrades usable without specializing.",
      "conditions": "The hull must support the duty and purchase its certificate at an actual supplier. One duty at a time; switching pays labor and takes a stopped day. New modules reserve real mass/space and use the existing hull-price scaling.",
      "changes": "Add alternative fitting choices with explicit tradeoffs: cooling against hold space, close defense against offensive fire, or certified work bays against general cargo. Do not multiply every weapon or give one ship every profession.",
      "ships": [
        "kestrel",
        "swift",
        "osprey",
        "heron",
        "petrel",
        "peregrine",
        "curlew",
        "merlin",
        "sanderling",
        "rook",
        "ibis",
        "crane",
        "nightjar",
        "condor",
        "cormorant",
        "gannet",
        "gyrfalcon",
        "albatross",
        "pelican",
        "tern"
      ],
      "phase": 3,
      "status": "active"
    },
    {
      "id": "maintenance-costs",
      "name": "Hull maintenance and supply costs",
      "current": "Station repairs scale with purchase price; field spare lots scale with base dry mass. Crane repair and Ibis treatment use supplies and stopped days, with no repeat-service XP. Albatross and local Kestrel discounts apply only to their own provisions.",
      "recommendation": "Review repair and spare consumption by hull scale before balancing carrier or workshop income. Starting station-repair target: max(10, ceiling(hull price × 0.0005)) cr per missing integrity point, before eligible local service discounts.",
      "conditions": "Keep engineering spare units physically interchangeable and price them by station, not by the buyer ship: otherwise a cheap hull can buy and transfer discounted spares. Scale field/battle repair consumption with target base dry mass; quote total units before committing.",
      "changes": "Give large hulls credible operating costs and preserve affordable starter repairs. Publish examples and stress-test cash-poor arrivals before adopting rates; no retroactive bills or changes to existing stored supplies.",
      "ships": [
        "crane",
        "cormorant",
        "condor",
        "pelican",
        "albatross",
        "kestrel",
        "swift",
        "ibis"
      ],
      "phase": 1,
      "status": "active"
    }
  ],
  "phases": [
    {
      "name": "Foundations and current-rule gaps",
      "why": "Makes the expanded roster coherent before it creates more rewards.",
      "deliver": [
        "Review all 20 access certificates and station suppliers.",
        "Create mission/cargo ownership receipts and fee/discount caps.",
        "Fix repeat formation movement and reward action farming; expand enemy objective previews."
      ],
      "accept": "No save changes during previews; no cargo or money duplication; every class has a valid advertised access and service path.",
      "stage": 1,
      "status": "delivered"
    },
    {
      "name": "Trade, service and discovery loops",
      "why": "Adds useful reasons to fly utility ships and build small fleets.",
      "deliver": [
        "Local and express charters, certified freight and multiple consignments.",
        "Finite survey/mining/salvage sites, basic field repairs and treatment.",
        "Persistent encounter variety, station patrons, project milestones and raider investigations."
      ],
      "accept": "Each class has an affordable or rentable solo alternative; each listed combination has a measurable benefit after operating costs.",
      "stage": 2,
      "status": "delivered"
    },
    {
      "name": "Passengers, antiquities and advanced operations",
      "why": "Requires the strongest inventory, objective and loss accounting.",
      "deliver": [
        "Passenger and patient manifests; provenance and authentic antiquities.",
        "Limited subsystem capture, lawful evidence recovery and physical component crates.",
        "Condor hangars, safe launch/retrieval and expedition staging. Independent remote captains remain optional future work."
      ],
      "accept": "No free stored-ship capacity, permanent bounty duplication, relic stacking or passenger mass omissions; hazards and failures remain recoverable where appropriate.",
      "stage": 3,
      "status": "delivered"
    }
  ]
});
