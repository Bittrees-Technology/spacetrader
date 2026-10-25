# Spacetrader ship catalogue


These are generic game references, independent of the current player or any saved voyage. All classes, configurations, goods and stations remain discoverable through catalogue filters; unlock requirements describe game rules and do not hide data based on personal progress. Interactive loadout/condition comparisons and pricing examples are hypothetical reference inputs, not an imported fleet or live journey. Future player-specific integration belongs in the game and is outside this catalogue.

Open http://127.0.0.1:8876/. The three permanent collections are Ships (factory models), Size comparison (one metre scale), and Armament & defenses (loadout dashboard and two saved selections). Upgrade filters also expose all 5,242,880 configurations. Obsolete roles links fall back to Ships. Full-screen inspection includes direct links back to the three collections.

## Approved catalogue, revision 4

Twenty approved hulls, their dimensions, prices, nine fitting families, weapon counts/strengths, defenses, cargo/ammunition rules and procedural artwork are pinned by `approved-manifest.json`. `approved-ships.js` freezes the accepted hull/drive data; the site uses its own matching `ship-specs.js` and `ship-rules.js`. Later game-engine changes cannot silently replace this catalogue's hull or fitting data. The read-only site has no game engine, save endpoint or transaction API. Preview controls change only the displayed configuration.

The original role recommendations remain in `class-proposals.js` as historical design input; they are no longer served or loaded by the catalogue. The complete implementation assessment is `Build/ShipRoleReview/index.html` and `audit.json`. Do not interpret historical "active/delivered" badges in that input as proof all mission content exists. The audit records every partial separately. Freezing artwork and ratings does not certify final gameplay balance.

Changes to approved designs require an explicit revision, review, preservation of the prior revision and regeneration of the manifest after validation. Header/navigation work is separate from the approved hull snapshot. The previous source is preserved by copy-on-write at `Build/Rollbacks/catalogue-lock-20261020`.

## Local operation and checks

Run `python3 Local/ship-catalogue/serve.py` from this project. It binds only to 127.0.0.1:8876, validates Host/Origin, offers an explicit asset allowlist and refuses writes, directory listing and game-save access. All assets and the existing Three.js runtime are local. The header shares `Local/catalogue-shell.css` with the character atlas and links both catalogues and the playable game.

Focused verification:

- `node Tests/browser/roles-audit.cjs`: 620 catalogue/live-game rating, mass and fitting-price comparisons; all 20 maintenance scales; 15 fleet aggregation/cost/save checks; eight rescue/authenticity regressions.
- `node Tests/ship_catalogue_visual_audit.mjs`: 660 mesh/fitting states, 280 camera frames, attachment/muzzle/hangar checks and exact configuration price-band coverage. Bounding-box connectivity is diagnostic, not a proof of every solid intersection.
- `node Tests/ship_catalogue_prices.cjs`: approved prices, Swift/Kestrel ordering, fitting scaling and ascending price bands.
- `python3 Tests/catalogue_shell_test.py`: snapshot integrity, both site headers, allowlists, blocked mutation/save/source paths.
- `node Tests/review_ship_roles.cjs`: regenerate the explicit implementation assessment after the acceptance tests and combat simulation report.

Revision 2 changes only the Peregrine hull price from 180,000 to 200,000 cr for the reviewed progression target. Artwork, dimensions, weapon ratings and the other nineteen catalogue hull prices are preserved. Prior data is retained in Build/EconomyCorrectionsReview/source-before/Local/ship-catalogue. Current gameplay build: 0.72.197. New rapid-response charters require an actual named rescue action; old booked terms are retained. Forged museum returns grant no authenticity reward. Several larger quest/encounter/duty proposals remain partial; see the audit rather than marking them complete.

## Local background service

The catalogue is installed as `com.jhineline.spacetrader.ship-catalogue` in `~/Library/LaunchAgents`. It starts at sign-in and restarts after exit, binding only to its existing loopback port. The verified runtime lives in `~/Library/Application Support/Spacetrader/Catalogues/Local/ship-catalogue`; macOS blocks LaunchAgents from opening project scripts in Documents. The runtime Browser link reads the current canonical installed Spacetrader app assets. After an approved catalogue source change, synchronize changed Local files to the runtime and restart only the corresponding catalogue service. Game releases automatically supply current Browser assets through the canonical app path. Logs are discarded to avoid unbounded growth. Source hashes and service verification are retained in `Build/CatalogueServiceReview`.

Revision4 (0.72.228) retains revision3 cargo packaging and role-based mass/volume capacities, and replaces universal trade-unit counts with actual cubic-metre limits. Goods hold-fit tools provide product-specific lot counts. Revision3 and revision2 source evidence remain under Build/CargoPackaging228.
