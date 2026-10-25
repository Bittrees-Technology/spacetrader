# Local pricing lab

Run `python3 Tools/pricing_lab.py --years 100 --output Build/PricingLab100Years` from the project folder. Choose a fresh output folder for each audit. Python uses its standard library and the existing Node runtime to call the actual installed game engine. It does not port pricing formulas or open saves, ledgers or game actions.

By default the runner reads the current loopback goods catalogue and installed Spacetrader engine. `--catalogue` accepts a previously generated goods JSON and `--engine` selects an existing engine.js. The engine hash must match the catalogue. Horizons are bounded to 4–1,000 game years; integer years that are multiples of four contain complete recurring price cycles.

The runner checks every station and every exchange good on every game day, compares later prices with the first full cycle, builds frequency-weighted credit/ROI distributions, and reconciles their limits with dashboard maximum gain/loss. It writes a compact audit JSON, per-good model JSON and a readable Markdown report. No daily raw-history log or Cartesian trade-pair list is created. Source paths and results remain local. A longer audit verifies repetition; it does not make repeated phases independent observations or forecast actual travel outcomes. No services or dependencies are installed.

The catalogue now serves an approved baseline. For a future changed engine, generate fresh candidate goods and use `--engine Browser/engine.js --catalogue <candidate.json>` rather than replacing the approved snapshot. Follow Balance/README.md for the review and versioning process.
