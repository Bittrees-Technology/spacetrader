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

With `SPACETRADER_BATCH_SAVES=1`, actions commit to a bounded IndexedDB outbox before gameplay continues. The account transport sends ordered batches after 2.5 seconds, at most32 actions and3.8MB per request, with at most32MiB reconstructed state per batch. Canonical JSON core patches and component references preserve exact values and property order. The server reconstructs and validates every intermediate state and creates a separate journal receipt for every action; only the final head/component is written. A batch uses an owned context read and one atomic SQL write, plus authentication (three normal round trips). An unchanged idle poll uses two queries and runs once per minute while visible; focus/visibility changes also check progress.

The durable record keeps its base snapshot, pending events, latest device state and an immutable in-flight prefix. Actions may append behind a slow prefix. Lost acknowledgements replay the identical operation; acknowledgement removes only that prefix. IndexedDB transactions compare the local cursor across tabs. A stale device holds its pending actions for explicit review/download or dismissal. Background retry is bounded by local queue limits, with backoff; authorization, format, quota and conflict failures require renewed conditions or explicit sync. Queue bounds are32 actions per voyage,16 voyages and16MiB total per browser. This supports interrupted connections, not unbounded offline play. The saved indicator distinguishes device persistence from cloud confirmation. Account/voyage changes and history requests flush first. Sign-out never discards pending actions.

Outbox writes request strict IndexedDB durability where supported and resolve only on transaction completion. Hiding the document, pagehide, online recovery and back/forward restoration trigger a flush, including an action still completing its local write. Actions completed while hidden schedule synchronization immediately. Normal batch requests below60,000 UTF-8 bytes use fetch keepalive; larger requests use ordinary fetch so the browser's64KiB keepalive limit cannot reject them solely for size. Closing an entire browser, losing power or losing network access cannot guarantee server delivery; an interrupted immutable prefix remains on-device and retries after reopening. Device storage deletion is outside this recovery guarantee.

The tab's selected voyage remains session-scoped. An account-scoped local preference also remembers the last visible voyage for fresh tabs/browser restarts. Hidden tabs do not overwrite that preference. Reopening loads that voyage's latest account head or its pending device tail, never a historical checkpoint. New devices load the account selection and only confirmed cloud progress. Authentication and owned-voyage checks still apply; the preference is not authorization or a duplicate saved game.

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
