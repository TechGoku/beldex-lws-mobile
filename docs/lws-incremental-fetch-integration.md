# LWS incremental fetch: what the backend now supports, and what the wallet must do

**To:** beldex-lws-mobile / beldex-lws-frontend
**From:** LWS backend
**Date:** 2026-07-29
**Answers:** `docs/lws-large-account-backend-request.md` (2026-07-28)

---

## 1. Summary

All three large-account endpoints now accept an optional `min_height`, and the
bound is applied as an **LMDB cursor seek** rather than a filter — records below
the cursor are never read from disk, so server cost scales with the *delta*, not
with the account's lifetime.

| Endpoint | `min_height` | Bounds |
|---|---|---|
| `get_address_txs` | ✅ (already shipped) | `transactions` |
| `get_address_info` | ✅ **new** | `spent_outputs` |
| `get_unspent_outs` | ✅ **new** | `outputs` |

`get_unspent_outs` gains the most: each returned output carries key images that
the server looks up **per output**, so an unbounded call on the reference account
was 223,810 outputs *and* 223,810 sub-queries. Seeking removes both. This is what
unblocks sending.

`get_address_txs` also gained a server-computed cumulative **`locked_funds`**, so
a client polling only that one cheap call has everything it needs for a balance
without ever downloading `spent_outputs`.

Nothing is breaking. `min_height` is optional everywhere and its absence gives
byte-identical responses to today. No DB migration; the server is a binary
restart.

---

## 2. Semantics

`min_height` is a **cursor, not a filter**.

- **Inclusive.** A record in exactly block `min_height` is returned.
- **Omitted or `0`** returns the full history, exactly as before.
- **Above the chain tip** is not an error — the arrays come back empty and the
  scalars/heights are still populated. This is the cheap probe the tx cache
  already uses (`PROBE_MIN_HEIGHT` in [txCache.ts:67](src/services/txCache.ts#L67)).
- **Send `last_scanned_height - 10`**, not the exact last height, so a small reorg
  can't drop a record. De-duplicate on `hash` (txs), `key_image` (spends) and
  `public_key` (outputs) — the existing `mergeDelta` reorg margin is the right
  model to reuse for the other two endpoints.

### Which scalars are cumulative, and which are not

This is the part that changes client arithmetic. A field is delta-scoped only
where bounding the query also bounds what the server can sum.

| Endpoint | Field | With `min_height` |
|---|---|---|
| `get_address_txs` | `total_received` | **cumulative** |
| `get_address_txs` | `locked_funds` | **cumulative** |
| `get_address_txs` | `transactions` | delta |
| `get_address_info` | `total_received` | **cumulative** |
| `get_address_info` | `locked_funds` | **cumulative** |
| `get_address_info` | `total_sent` | **delta — must be accumulated client-side** |
| `get_address_info` | `spent_outputs` | delta |
| `get_unspent_outs` | `amount` (total value in `outputs`) | **delta** |
| `get_unspent_outs` | `outputs` | delta |

The received-side scalars stay cumulative because the server has to walk every
output anyway: a spend in a *new* block can consume an output received years
earlier, and resolving that lookup needs the full output history. Only the
spend-side and unspent-side sums shrink with the cursor.

---

## 3. What the wallet should do

### 3.1 Balance — stop calling `get_address_info` on the polling path

The cheapest correct balance now comes from `get_address_txs` alone, which the
tx cache already fetches incrementally:

```
available = total_received - (spends the wallet actually owns) - locked_funds
```

`total_received` and `locked_funds` are both cumulative and both present on every
incremental `get_address_txs` response — including the 185-byte probe. No
`get_address_info` call is needed to render a balance.

`get_address_info` is still required to *correct* the spent side, because only the
client can tell a real spend from a mixin appearance. Fetch it incrementally and
keep a running total.

### 3.2 `total_sent` must become an accumulator

This is the one required change to existing code.
[balanceCache.ts:25-31](src/services/balanceCache.ts#L25-L31) stores `totalSent`
as an absolute value read straight off the response. Once the wallet starts
sending `min_height`, that field is the delta since the cursor, so overwriting it
silently under-counts.

The cached shape needs to become "running total + the cursor it is valid at":

```ts
export interface CachedBalance {
  totalReceived: string;   // cumulative, overwrite from the response
  totalSent: string;       // running total, ADD each delta
  lockedFunds: string;     // cumulative, overwrite from the response
  spentCursor: number;     // min_height the next fetch should use
  scannedBlockHeight: number;
  updatedAt: number;
}
```

Keep amounts as decimal strings — `total_sent` on the reference account is
20,140,313,371,759,086, well past `Number.MAX_SAFE_INTEGER`, and the existing
comment in `balanceCache.ts` is right to insist on this. Accumulate with `BigInt`,
serialise back to string.

Because the merge is additive, a duplicate merge double-counts. Advance
`spentCursor` and the running total in the same write, and de-duplicate the
overlap window by `key_image` exactly as `mergeDelta` does for tx hashes.

### 3.3 Sending — maintain an incremental unspent pool

`SendFund/index.tsx` currently fetches the whole unspent set per send. Instead:

1. **Once per wallet**, `get_unspent_outs` with no `min_height` to seed the pool.
2. **Thereafter**, `get_unspent_outs` with `min_height = last_synced - 10`, merging
   new outputs into a persisted pool keyed by `public_key`.
3. Derive key images locally and mark pool entries spent; the server can't.

Note the guard change: the server's `received < amount` → HTTP 400 check is
**skipped** for incremental requests, since the server only sees the delta. The
wallet is now responsible for checking that its own accumulated pool covers
amount + fee before building a transaction, and for surfacing "insufficient
funds" itself rather than relying on that 400.

An output is immutable once scanned, so the pool only ever grows — this is a
good fit for the same two-tier cache pattern as
[txCache.ts](src/services/txCache.ts) (in-memory + `@capacitor/preferences`).
Outputs are not key material, so they must **not** go through `secureStore.ts`.

### 3.4 Timeouts can come back down

[patchBeldexNetServiceUtils.ts](src/utils/patchBeldexNetServiceUtils.ts) raised
`get_address_info` to 180 s and `get_unspent_outs` to 300 s to survive the
unbounded responses. Once both are always called with `min_height` after the
initial seed, those budgets only need to cover the one-time full fetch. Keep the
long timeout for the seeding call; the steady-state calls can use the default.

---

## 4. What did not change, and why

**`total_sent` is still a superset and still cannot be corrected server-side.**
The LWS holds only the view key. It records a candidate spend whenever one of the
account's outputs appears as a ring member — including when another wallet used it
as a mixin. On the reference account this is why
`total_received - total_sent` is negative.

Distinguishing a real spend from a mixin appearance requires the *spend* key to
derive key images, which the server does not have and must not have. So
`spent_outputs` is returned for the client to filter, and ask 3 from the original
document ("add `total_sent` to `get_address_txs`") cannot be satisfied as
written — a server-side `total_sent` would be wrong in exactly the way the current
one is.

What ask 3 was really after — a balance from the cheap incremental call — is
delivered instead by the cumulative `locked_funds` now on `get_address_txs`
(§3.1). The remaining spent-side correction is genuinely client-only work, but it
is now incremental rather than a 135 MB download per session.

---

## 5. Reproduction

Same account as the original document. Compare the seeked call against the full
one; the delta should be small and fast regardless of account size.

```bash
ADDR='<address>'; VK='<view_key>'
TIP=4045308   # or read scanned_block_height from a probe

# Probe: min_height above the tip, empty arrays, scalars still populated
curl -sS -X POST 'https://lwsapi.beldex.dev/get_address_txs' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\",\"min_height\":2147483647}" \
  -w '\nprobe: size=%{size_download} time=%{time_total}s\n'

# Balance path, bounded
curl -sS --compressed -X POST 'https://lwsapi.beldex.dev/get_address_info' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\",\"min_height\":$((TIP-720))}" \
  -o info.json -w 'info: wire=%{size_download} time=%{time_total}s\n'
python3 -c "import json;d=json.load(open('info.json'));print('spent_outputs:',len(d['spent_outputs']))"

# Send path, bounded - compare against the same call without min_height
curl -sS --compressed -X POST 'https://lwsapi.beldex.dev/get_unspent_outs' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\",\"amount\":\"0\",\"mixin\":9,\"use_dust\":true,\"dust_threshold\":\"2000000000\",\"min_height\":$((TIP-720))}" \
  -o uo.json -w 'unspent: wire=%{size_download} time=%{time_total}s\n'
python3 -c "import json;d=json.load(open('uo.json'));print('outputs:',len(d['outputs']))"
```

Sanity check worth running once per endpoint: the seeked result must equal the
tail of the unbounded result at the same height. The backend has this as an
automated test over the LMDB layer (`src/lws/tests/min_height_seek.cpp`), covering
inclusivity, `min_height = 0`, a cursor past the tip, and an empty account.

---

## 6. Status

Implemented and building; correctness covered by the seek test above. Not yet
benchmarked against a live large account — the timings in §5 are the numbers to
capture on the first staging deploy, against the baseline in
`docs/lws-large-account-backend-request.md` §2.
