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
checkpoint appears when that voyage has saved slots. Account & saves can select
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
  compact account format. All migrations are additive; existing histories and legacy functions remain intact.
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
its own captain, journal, action history and two manual checkpoint slots. Starting a
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
structured receipts and rendered notices in compressed chunks of up to 128 actions
and 512 KiB before compression. Earlier actions are readable, not restorable world
states. A last-operation digest and compare-and-swap revision protect lost-response
retries; older stale requests require reviewing the current head rather than replay. Two current manual checkpoint slots replace their contents in place for account saves. Legacy versions stay intact. State is validated with the actual engine.

Transfers copy the complete local action history into an inactive staged voyage,
then transfer checkpoint slots and activate only after count and head-hash checks.
The local original is never deleted. A transfer interrupted by a disconnect can
resume from the last acknowledged action. Existing account voyages do not block
additional device transfers. At most three unfinished transfers can be staged
at once. Imports and saves remain unranked. Imported journal receipts retain complete
action history without copying a world-state replay payload for each action.
Existing third checkpoint slots remain loadable and deletable; new account
checkpoints use slots 1 and 2. Superseded snapshot-slot contents are not archived
again. Original legacy histories/checkpoints are not removed by this rollout.

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

Account actions need a connection. Guest play continues to use device IndexedDB
and recovery storage. The site does not cache an authenticated cloud voyage as
an unrelated guest voyage, and signing out returns to the separate device save.

New private save requests require `X-Spacetrader-Storage: compact-v1`; older
open clients must reload. Read-only history does not authorize arbitrary state
restoration. Guest and native ledgers retain their existing format in this pass.

Snapshot payloads use bounded Brotli quality 4 (`B1:` prefix); legacy zlib payloads
remain readable. Journal blocks additionally share field names and repeated
strings through a versioned lossless dictionary. The stored block digest always
checks the exact decoded canonical record array. No dialogue, numeric change or
event is discarded. Every newly encoded block is round-tripped before committing.
Keep the dual-codec reader in any server rollback; older readers fail closed on
new payloads. This encoding change needs no schema, quota or infrastructure change.
