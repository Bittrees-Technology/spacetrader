# Spacetrader

A single-player space-trading game: explore the solar system, trade commodities,
manage a fleet, and build a captain's history.

Play at [captain.bittrees.org](https://captain.bittrees.org/).

The first public edition runs entirely in the browser and saves progress on that
device. Wallet saves, NFT-controlled captains, verified rankings and agent play
are planned work; they are not enabled in this edition. Clearing browser storage
removes local progress, including its checkpoint slots. Use a regular browser
profile and keep its site data; this edition does not yet provide cross-device
recovery.

## Run locally

Use an existing Node.js installation and Python 3. No dependency installation is
needed for the static build.

```sh
node Tools/check_balance.cjs
python3 Web/build.py
python3 -m http.server 8903 --bind 127.0.0.1 --directory Web/.vercel/output/static
```

Open `/play/`, `/guide/`, `/characters/`, `/ships/` or `/goods/`. The static build
uses reviewed generic reference snapshots and never reads player saves. The game
engine and approved economy are unchanged by the web packaging adapter.

Vercel releases use the generated Build Output API directory in `Web/.vercel`;
no Functions, database, analytics or paid integrations are required by this guest
edition. Public hosting still has the selected provider's usage limits and terms.

## Licensing

Code and owned game assets are MIT licensed. See `LICENSE` and
`THIRD_PARTY_NOTICES.md`. Third-party notices must be retained.
