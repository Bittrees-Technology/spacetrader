# Spacetrader account saves

Spacetrader uses the canonical Bittrees LoginPanel, EmailSignIn, EthereumSignIn
and shared SSO client. `shared/provenance.json` pins their unchanged source.
Only the surrounding dialog and explicit navy/brass theme differ, as requested.

The game stays playable as a guest. Account saves are optional and do not require
an NFT. Future NFT ownership can attach to the stable voyage UUID; this release
does not mint, transfer, rank or grant agent control of any captain.

`/play/` opens the game menu before rendering the cockpit or resuming an encounter.
Choose Sign in & load voyage on a new device and use the original verified email
or wallet identity. Continue voyage opens the selected account/device head; Load
checkpoint remains a device/Mac feature; account play uses latest-progress autosaves. Account & saves can select
any saved account voyage when a separate device voyage is present. Saved voyages
lists the library; New account voyage or New charter creates a separate captain.
Only explicitly starting a charter opens captain creation. An expired account session returns to the
menu; continuing a labelled device voyage is an explicit choice, never an automatic
replacement for a cloud save.

## Integration requiring the existing service owners

- Register SSO client `spacetrader` at `https://captain.bittrees.org`, with callback
  `https://captain.bittrees.org/api/sso/callback`, through the existing Roles owner.
  It is an ordinary identity audience, with no product roles or transaction rights.
- Add the client to Roles' explicit client-ID allowlist; retain every existing
  client, callback, PKCE/state, one-use code, original-proof age and suppression rule.
- Supply a distinct server-only client secret to this existing Vercel project and
  its hash to the broker. Never include either value in source or audit receipts.
- Review `schema.sql` and apply it to an approved existing PostgreSQL database,
  using an application-restricted connection. No new database/project/service is
  requested. Do not share another app's unrestricted database credential.
- For the voyage library, apply `migrations/002-voyage-library.sql`, followed by
  `migrations/002-voyage-library-grants.sql`, through the same database owner.
  Then apply `migrations/003-compact-journal.sql` and its matching grants for the
  compact account format. Next review/apply `migrations/004-efficient-saves.sql`
  and matching grants. Its tables/columns are additive; two compact functions gain
  fail-closed format guards. Other legacy functions and ACLs remain unchanged.
  Deploy the compatible reader with efficient writers off, apply/verify004,
  enable `SPACETRADER_EFFICIENT_READS=1`, then enable
  `SPACETRADER_EFFICIENT_SAVES=1` only after the staged compatibility checks.
  Keep efficient readers enabled in any subsequent rollback.
- For background saving, review/apply `migrations/005-batched-saves.sql` and its matching grants through the same database owner. Deploy the compatible endpoint/client with `SPACETRADER_BATCH_SAVES` off, apply/verify005, then enable the flag only after local/native-PostgreSQL and browser recovery checks. No quota or connection-limit change is part of005. A rollback must retain a compatible batch endpoint for pending outboxes; disabling it holds those actions on-device rather than silently discarding them.
- Reuse the existing approved email delivery service and verified domain, with a
  reviewed hard daily and calendar-month email caps within its current allowance. Do not send test
  codes to third parties or enable overages. Tests intercept delivery.
- Set explicit per-account and aggregate compressed-storage budgets based on
  existing capacity. Quota exhaustion holds new writes without deleting history.

Required server configuration: `SPACETRADER_ACCOUNTS_ENABLED=1`, `APP_ORIGIN`,
`SPACETRADER_DATABASE_URL`, `SPACETRADER_ACCOUNT_STORAGE_BYTES`,
`SPACETRADER_TOTAL_STORAGE_BYTES`, `BITTREES_SSO_ENABLED=1`,
`BITTREES_SSO_ISSUER=https://roles.bittrees.org`, `BITTREES_SSO_CLIENT_SECRET`.
Email additionally needs `RESEND_API_KEY`, `SPACETRADER_MAIL_FROM` and
`SPACETRADER_EMAIL_DAILY_LIMIT` and `SPACETRADER_EMAIL_MONTHLY_LIMIT`. Unconfigured features fail closed and preserve
device saves. Authentication cookies are host-only, Secure, HttpOnly and SameSite.

## Persistence and integrity

Each verified email or Ethereum identity owns its own account. Existing linked
identities are not inferred or merged by labels or email strings. Account linking
requires a separate fresh-proof flow; a shared session conveys identity only.

Each account can hold multiple independent voyages. Each has a stable UUID,
its own captain, latest progress, journal and complete action history. Starting a
charter never resets an earlier account voyage. The library pages metadata in
groups of twenty and excludes unfinished transfers. Its storage limit is shared
across the account, rather than multiplied by the number of voyages.

Each browser tab pins its chosen voyage ID; choosing a different default on
another device does not redirect pending writes, checkpoint reads or history.
All non-bootstrap requests require an owned, published voyage ID as well as
authentication. Older unpinned clients must reload before writing. Idempotent
creation and completed-transfer retries cannot duplicate or replace a voyage.

Cloud commits record resolved outcomes with compare-and-swap revisions and unique
operation IDs. Retries cannot apply the same action twice, and another device's
newer head cannot be silently replaced. The current resolved state is overwritten atomically. The journal retains compact
structured receipts and rendered notices in a small active block of up to128 actions
and512KiB before compression. Closed blocks are losslessly compacted into binary
columnar archives of up to8,192 actions,2,000,000 encoded bytes and16MiB decoded
canonical JSON. Unusually varied histories form smaller archives. At most64
closed blocks are considered by a maintenance transaction; fewer than eight
closed blocks stay in the hot table. Pages reconstruct only the requested records. Earlier actions are readable, not restorable world
states. A last-operation digest and compare-and-swap revision protect lost-response
retries; older stale requests require reviewing newer progress. With batched saving enabled, account play offers no new checkpoints or action restores. Existing checkpoints are retained, and legacy readers remain supported. State is validated with the actual engine.

Transfers copy the complete local action history into an inactive staged voyage,
then transfer checkpoint slots and activate only after count and head-hash checks.
The local original is never deleted. A transfer interrupted by a disconnect can
resume from the last acknowledged action. Existing account voyages do not block
additional device transfers. At most three unfinished transfers can be staged
at once. Imports and saves remain unranked. Imported journal receipts retain complete
action history without copying a world-state replay payload for each action.
With the batch flag enabled, new account checkpoint writes are rejected, while existing checkpoint data remains intact and deletable through the owned endpoint. Superseded snapshot-slot contents are not archived
again. Original replay histories/checkpoints remain intact; only verified compact receipt blocks are replaced with equivalent archives.

Only the authenticated account can access its cloud head, history or checkpoints.
All private responses are no-store/noindex; writes require exact Origin and a
same-origin save header. An account-bound header detects sign-in changes between
tabs without treating that public identifier as authentication. No saves are
rendered into public catalogues, sitemaps or discovery files.

The reviewed launch limits are 16 MiB per account and 128 MiB in aggregate for
compressed voyage payloads, retained checkpoint versions and charged record metadata.
Physical database/index/WAL storage and authentication metadata are additional;
these logical limits are not a provider billing limit. Authentication is bounded
to 10,000 accounts, ten sessions per account, expiring challenges and rate buckets,
with bounded expiry cleanup. Email delivery reserves attempts before sending,
including failures, with caps of 20 per UTC day and 500 per calendar month. No
provider-quota retry or paid fallback is enabled. Capacity exhaustion preserves
existing saves and requires a reviewed operator decision before limits change.

With `SPACETRADER_BATCH_SAVES=1`, the public account client stages station actions in memory until a confirmed departure displays a non-preview travel animation. Creating a captain and combat also remain volatile until that window. Closing beforehand intentionally resumes the latest confirmed progress. Legacy/native callers retain their default durable per-action mode.

The save gate is checked before draft promotion and immediately before every batch request, including retries and split batches. It requires a visible, open journey dialog; logical flight/battle state is insufficient. Account menus, journal reads, polling, pagehide, online and hidden-tab events cannot bypass it. Account/voyage changes are held until pending progress has been saved during travel. No manual save control is shown in account play.

Transit atomically promotes the draft to the strict-durability IndexedDB outbox, then drains ordered batches of at most32 actions/3.8MB/32MiB expanded state. Every action keeps its dated journal receipt. Station drafts stop at511 actions/12MiB, reserving a departure action and4MiB for travel updates. Combat/encounter actions have a4096-event limit inside the unchanged16MiB hard bound, so a nearly full station visit can still resolve combat and resume travel. Interrupted promoted batches retain their immutable flight IDs, but do not upload outside visible travel, including after reopening. New station drafts atop an interrupted batch stay volatile and use an expected-revision check when later promoted. The server protocol, authorization, schema and quotas are unchanged.

Travel has no skip or dismiss control in public browser play. Account travel waits for both normal playback and acknowledgment, with Retry save on failure. Two animation frames precede the initial upload so the departure screen paints first. Reconnection/visibility restoration can retry only with that screen still open. Mac controls are unchanged. The journal merges transient and durable pending receipts without saving; delayed cloud reads cannot overwrite newer local actions.

Small save requests below60,000 UTF-8 bytes use fetch keepalive. Larger batches use ordinary fetch and retain their durable retry record. Browser shutdown cannot guarantee delivery. Draft progress and durable pending uploads have distinct save indicators. Voyage selection remains account-scoped locally and tab-scoped in session storage; preference metadata never grants access. No checkpoint data, old journal records, database limits or connection limits are deleted or raised.

Guest play continues to use device IndexedDB
and recovery storage. The authenticated outbox is account/voyage scoped; the site does not cache it as
an unrelated guest voyage, and signing out returns to the separate device save.

New private save requests require `X-Spacetrader-Storage: compact-v1`; older
open clients must reload. Read-only history does not authorize arbitrary state
restoration. Guest and native ledgers retain their existing format in this pass.

Legacy snapshots use bounded Brotli quality4 (`B1:`) or the earlier zlib codec.
Efficient snapshots instead use an `E1` marker, a binary compressed player core
and an exact, voyage-scoped economy component. The existing R1/D1/raw Float64
frame is stored as binary without recomputing or rounding quantities. Its hash
refers only to a component authorized for the signed-in account's selected voyage;
hashes never confer access. Current heads and manual slots retain their references
atomically. Only components no longer referenced by either can be collected.
Component reuse avoids rewriting or uploading the same frame for every trade.
A bounded warm-instance cache rechecks existence/ownership before reuse.

`X-Spacetrader-Wire: parts-v1` negotiates component-aware transfer. Loads verify
component and reconstructed-state hashes; writes send changed cores and missing
components, then receive a verified acknowledgement instead of reflecting the
whole save. A missing reference prompts one bounded resend. Older compact clients
can still supply full JSON; the server stores it efficiently when enabled.
An older server fails closed on new heads/slots rather than overwriting them.
Rollback must retain this reader and the004 guards, not reapply003 over004.

New archives retain every field, property order, Unicode string, and exact JSON
number. The application validates expansion bounds, canonical hashes, contiguous
sequences and a full byte-identical round trip before requesting replacement.
SQL then verifies the expected source chunk hashes/contiguity and compressed
payload SHA256 under the existing lock order before atomic replacement and quota
accounting. SQL does not independently decode Brotli to establish equivalence;
that remains the reviewed application writer's responsibility. Service credentials
remain trusted, with account identity derived from the verified HTTP session.
The runtime has SELECT-only access to new tables and narrowly granted definer
functions; no general journal/component DELETE or TRUNCATE permission is added.

Migration of existing compact histories is bounded and happens as play continues;
old heads become binary on their next successful save and old slots on replacement.
Cold legacy saves remain readable and are not rewritten in a bulk background job.
The128MiB aggregate cap has not been raised. Ten-thousand-captain capacity still
needs mixed-workload, concurrent-user and provider-budget review; compressed
payload projections are not PostgreSQL/provider invoice estimates. Freed pages,
WAL and provider backup/history retention can delay physical billing reductions.


## One active voyage per captain

Migration 006 introduces a server-created stable captain UUID, independently stored from sign-in credentials, and binds every active or archived voyage to it. The account currently owns one captain. `SPACETRADER_SINGLE_ACTIVE_VOYAGE=1` enables the matching scoped authentication query, API and account UI after 006 and its grants are verified. Login proof continues through canonical shared SSO; no new sign-in form, credential or app privilege is introduced.

Starting a replacement requires the exact current voyage ID and revision. The SQL function locks global usage, account and old voyage, rechecks that cursor, creates the replacement and archives the old head in the same transaction. Operation IDs replay without creating another charter. An old operation cannot reactivate its now-archived result. Triggers make archived heads, legacy entries, journal chunks, compressed journals, world components and checkpoint slots read-only even for old write paths; the selection function can select only the current active voyage. Active-voyage compaction remains allowed; archived journals are frozen, including background compaction. Pending imports can stage payloads only while the account has no active voyage. Initial entries are inserted after activation within the same restart transaction. Existing non-active completed voyages are marked as archives without rewriting their worlds or journals. No data is deleted. One-time captain rows and UUID/archive metadata add a small amount of bounded database metadata; existing storage limits and counters for saved payloads are unchanged.

Account status identifies the active voyage and captain. Fresh tabs follow this server selection, rather than an older tab/device preference. Old pending saves remain available for review/download; they never attach to the replacement. Archive journals use owned read-only history requests and never replace the playable state. Device-voyage import is available only to an account without an active voyage; an import cannot replace a continuing captain implicitly. Device-only and Mac behavior stays separate.

Future NFT integration should bind the canonical chain/contract/token tuple to this captain UUID and resolve verified current ownership at every protected operation. Its active voyage and archives already share that identity. This release does not mint tokens, accept token IDs as authentication, verify NFT ownership, implement transfers, or authorize an agent. NFT transfers and recipient accounts with an existing captain need a separately reviewed atomic ownership handoff. Preserve the stable captain UUID and all journal associations when implementing it.

Roll out 006 through the existing database owner with bounded locks, verify guards/grants and preserved heads, then enable the flag on the matching backend/client deployment. Turning the API flag off does not make archived rows writable: the database policy remains in force. Rollbacks must retain 006 compatibility, including explicit restarts; do not restore the old ability to select multiple writable voyages. The Spacetrader release owner remains responsible for deployment and live synthetic acceptance.

## Verified email and Ethereum linking

Migration 007, the permanent compatibility marker `SPACETRADER_IDENTITY_SCHEMA=1`, and `SPACETRADER_LINKED_LOGINS=1` add at most one verified email and one verified wallet per Spacetrader account. The canonical shared login components and SSO protocol are unchanged. `sessions.login_identity` is the identity actually proved; every SSO attestation and shared-profile request uses that value, never a canonical account's original `identity` label. Keep 007-compatible authentication and the identity-schema marker on every rollback after links exist. Turning off only LINKED_LOGINS disables new linking while preserving actual proof identities, alias sign-in and merged archive authorization. The schema marker also implies single-active mode.

The source session must be no more than ten minutes old. Linking challenges are separately purpose-bound, session-bound, five-minute proofs, with five verification attempts and the existing shared email allowances. They do not sign the player into the target account or disclose its voyage before proof. Wallet signatures include the origin, nonce and exact source-account-specific linking statement. Email linking codes cannot be used as ordinary sign-in codes.

The verified preview contains server-generated account, captain, active-voyage, revision and storage cursors. Commit locks usage, both accounts and the challenge, rechecks that exact preview, and requires an explicit keep choice and deletion confirmation. An acknowledged intervening save invalidates the preview. One atomic commit moves aliases, deletes only the unchosen active voyage and every associated journal/checkpoint/component row, retains earlier archived voyages, updates exact charged-byte counters, and revokes both accounts' app sessions. The kept captain UUID and save bytes stay unchanged. There is no arbitrary account/captain reassignment endpoint.

Merged source account/captain rows remain as immutable ownership records for retained archives. Server-side archive authorization resolves only a direct owned merge relation; writes continue to require the one active voyage. An owner-only transaction witness permits deletion of immutable initial journal entries solely within the reviewed merge transaction. Runtime cannot write aliases or the witness table. A session-bound, short-lived result allows the exact commit to recover from a lost response after revocation. Explicit app sign-out revokes these recovery receipts too. Other apps' Roles identities, permissions and shared sessions are not merged. NFT ownership handoff remains a separate future integration.

Apply only through the existing database owner after exact-hash review, data/ACL preservation checks, real restricted-runtime merge/deletion probes and concurrency tests. Existing per-account/global limits do not increase; a combined history over the account cap rejects atomically with no deletion. Do not run destructive merge probes against human accounts. Retain synthetic test evidence privately; avoid public test email delivery and hosted load testing.


## Final-score-only retirement (current account policy)

Migration 008 and `SPACETRADER_SCORE_ARCHIVES=1` supersede the full-archive retention described in the historical 006/007 rollout notes above. Only the active account voyage keeps a saved world, inventory, journal and checkpoints. On restart the application loads the last confirmed stored head and computes its final net worth with `engine.financialOverview`; a client-supplied score is never used. A finished record contains only its net-worth value and bounded name/date/captain/account identifiers. It is a personal high score, not proof of authoritative or anti-cheat-verified public ranking.

`spacetrader_restart_scored_voyage` checks the exact active revision, creates the replacement, records the old score, deletes every retired payload table and old head, adjusts exact counters and enforces final storage budgets in one transaction. The internal retained helper is owner-only. Old restart writers fail closed instead of recreating full archives. The API requires the explicit `final-score-v1` retention marker on replacement requests, so older open tabs must reload to see the deletion warning before they can restart. The transaction-scoped deletion witness is inaccessible to the runtime role; normal history remains append-only. CAS conflicts, lost-ack operation IDs and account scope remain enforced. Empty, never-created captains do not earn scores. Scores are charged 512 bytes each; current-game payload limits and provider cost safeguards are unchanged.

The reviewed operator migration must decode and validate each existing completed archive, calculate the final score, retire it using its exact revision, and verify that active state hashes and counters are unchanged. Never invent a score for unreadable/corrupt data or export full human saves into operational logs. Pending guest imports are transient staging, not finished voyages; do not purge an in-progress import as an archive. Linking keeps earlier scores via existing merged-account ownership, and permanently deletes the unchosen active voyage without awarding it a score. Future NFT ownership still binds to the stable captain ID. New account UI lists one loadable voyage and paginated high scores, without archived-journal controls.

Apply 008 and its grants, verify native and restricted-role tests, convert old completed archives, then enable the matching API/client flag on the existing deployment. Do not roll back to archive-writing code after cutover; retain the 008 reader/writer behavior. Provider restore history and reusable PostgreSQL pages can retain physical bytes temporarily after logical payload deletion. No storage ceiling or billing setting changes are part of this migration.

Focused checks: `node Web/account/build.mjs --score-test`; `node Web/account/build.mjs --score-ui-test`; set `SPACETRADER_TEST_BROWSER=webkit` for WebKit. The legacy test groups exercise pre-cutover compatibility separately.
