# Generic Guide reference

The loopback-only site runs on port 8878 beside Characters (8875), Ships (8876) and Goods (8877). All four servers render the canonical header from `Local/catalogue_shell.py`, use `Local/catalogue-shell.css` and link to each other.

`guide-template.cjs` is the canonical guide prose, migrated from the in-game Guide. `export.cjs` supplies a fixed synthetic reference baseline and public engine rules, never a save or action ledger. It exports all station systems, public establishments, treaties, access requirements and general rules. Live account assessments and enforcement reports are replaced with general explanations. `build.py` organizes the snapshot into searchable topics and eight categories, while preserving every guide chapter. Update and review these files, run the exporter and builder, then validate the manifest before syncing the static runtime.

```
node Local/guide-catalogue/export.cjs
python3 Local/guide-catalogue/build.py
```

The runtime needs only `serve.py`, `index.html`, `guide.css`, `guide.js`, `reference-manifest.json`, the shared header helper and the shared stylesheet. No engine or player data is read by the server. Its routes are allowlisted, read-only and loopback-bound; a mismatched HTML snapshot fails closed. The existing per-player game remains at 8774. Never import a user's voyage into a reference site.

The game opens this reference in a browser. Its native command accepts no caller-supplied path or URL and retains the game's local navigation restriction.

The Goods & exchange mechanics topic imports the reviewed fragment from `Local/goods-catalogue/mechanics-fragment.html`. Build and check that reference with `python3 Local/goods-catalogue/build_mechanics.py` before exporting this Guide; its fingerprint is part of the Guide manifest. This keeps the trading rules aligned on both sites. The Guide exporter applies its own editorial wording to the shared overview while preserving the approved mechanics fragment and formula fingerprints.

Bank rate ranges use the reviewed public `bank-rate-ranges.json` snapshot, produced from the actual engine on every valid saved game day (0–365249). It contains no player data. The exporter checks the selected Balance revision, engine fingerprint, complete station roster and all quoted endpoint witnesses before rendering the table. The Guide manifest binds this snapshot. If the engine/revision changes, review and refresh the public reference before exporting; never fall back to a live voyage. Banking model and range topics belong under Banking & property.
