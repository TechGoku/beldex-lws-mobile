# LWS API: large-account payload limits blocking the mobile wallet

**To:** LWS backend team
**From:** beldex-lws-mobile (Capacitor wallet)
**Date:** 2026-07-28
**Server tested:** `https://lwsapi.beldex.dev`
**Account:** a real high-activity account (~4.05M scanned height, `start_height: 1`).
Address/view-key redacted from this document — available on request.

---

## 1. Summary

The `min_height` work on `get_address_txs` is deployed, correct, and delivers a
~1,000,000× payload reduction on this account. It is now the only wallet API
call that is usable at this scale.

The same account cannot **display a balance** or **send funds**, because
`get_address_info` and `get_unspent_outs` return 135 MB and 193 MB
respectively, with no parameter of any kind to bound them. There is no
client-side fix for this: the wallet cannot page, filter, or truncate a
response the server sends whole.

We are asking for the `min_height` treatment (or any bounding parameter) to be
extended to those two endpoints. Priority order is in §5.

---

## 2. Measurements

All figures measured 2026-07-28 against `lwsapi.beldex.dev`, from a desktop on
a fast connection. A mobile device on mobile data will be worse.

| Endpoint | Bounding param | Wire (gzip) | Decompressed | Time | Items |
|---|---|---|---|---|---|
| `get_address_txs` (full) | — | — | **196,677,392 B** | **98.4 s** | — |
| `get_address_txs` (`min_height` = tip−10) | ✅ `min_height` | — | **185 B** | 2.5 s | 0 txs |
| `get_address_info` | ❌ none | 37,272,894 B | **135,738,326 B** | **57.0 s** | 656,103 `spent_outputs` |
| `get_unspent_outs` | ❌ none | 87,046,967 B | **193,491,799 B** | **133.6 s** | 223,810 `outputs` |

`get_address_txs` with `min_height`, at several window sizes:

| Window | Decompressed | gzip | Txs | Time |
|---|---|---|---|---|
| 720 blocks | 185 B | — | 0 | 1.9 s |
| 5,040 blocks | 4,115 B | — | 8 | 1.6 s |
| 21,600 blocks | 12,862 B | — | 25 | 1.6 s |
| 100,000 blocks | 41,941 B | 14,386 B | 86 | 2.4 s |

**gzip works correctly.** `Content-Encoding: gzip` + `Vary: Accept-Encoding`
are returned on bodies ≥ 1 KB, giving ~2.9× on the 100k-block window. No client
change was needed. No issue here.

---

## 3. Per-endpoint detail

### 3.1 `get_address_txs` — working as documented ✅

`min_height` behaves exactly as the integration guide describes. Our client now
does a cheap probe (`min_height` above the tip → 185 B reply carrying
`scanned_block_height`), seeds a cursor, and thereafter fetches only bounded
windows. First load went from *98 s / 196 MB / always timed out* to
**3.7 s / 42 KB**. Steady-state refreshes are 185 B.

**One documentation discrepancy.** The guide's response-semantics table states:

> | `total_received`, `total_sent` | **Full/cumulative** over the entire account — use these directly for balance. |

`total_sent` is **not present** in the `get_address_txs` response. Observed
top-level keys:

```
total_received, scanned_height, scanned_block_height, start_height,
transaction_height, blockchain_height, transactions
```

So the guide's advice to "take balance from `total_received` / `total_sent`"
cannot be followed — balance still requires `get_address_info`, which is the
135 MB call. Either the field was dropped, or the guide is aspirational here.
This one missing field is the difference between a free balance and a 135 MB
download (see §5, ask 3).

### 3.2 `get_address_info` — 135 MB, blocks balance display ❌

Returns the whole account's `spent_outputs` array — 656,103 entries — on every
call. There is no `min_height` or pagination parameter.

The client cannot skip this data. The scalar `total_sent` is uncorrected: it
counts outputs used as **mixins**, not just outputs actually spent. On this
account:

```
total_received  =  2,591,888,418,110,292
total_sent      = 20,140,313,371,759,086
total_received − total_sent = −17,548,424,953,648,794   ← negative
```

The wallet must therefore walk all 656,103 `spent_outputs`, derive a key image
for each (WASM), discard the ones that aren't ours, and subtract their amounts
back out of `total_sent`. That is the only way to reach a correct balance, and
it requires the full array.

Client-side cost of that array, measured on **desktop V8** (a phone will be far
worse): 135 MB string, ~300 ms `JSON.parse`, 278 MB heap — before any of the
656,103 WASM key-image derivations begin.

### 3.3 `get_unspent_outs` — 193 MB, blocks sending ❌ (highest impact)

Returns 223,810 outputs, 193 MB decompressed, 133 s. Again no bounding
parameter of any kind. This is on the critical path for **every send**, so
sending is currently impossible on this account regardless of client changes.

---

## 4. What the client already does (so this isn't pushed back to us)

We have taken every mitigation available on our side:

- **Never issue an unbounded `get_address_txs`.** Probe + bounded window +
  incremental cursor with a 10-block reorg safety margin, dedupe by `hash`.
- **Persistent local tx cache**, so history is downloaded once per device
  rather than once per session, with on-demand chunked backfill for older
  history.
- **Per-endpoint timeouts** raised where the payload justifies it
  (`get_address_info` 180 s, `get_unspent_outs` 300 s) instead of the default
  15 s, so these calls at least complete rather than failing outright.
- **Balance taken off the polling timer entirely** — fetched once per session
  and cached, because a 135 MB response cannot run on any cadence.
- **gzip** verified working end-to-end; nothing needed on our side.

What remains is not solvable in the client: we cannot bound a response the
server sends in full.

---

## 5. Asks, in priority order

**1. Bound `get_unspent_outs`.** *(Blocks sending entirely — highest impact.)*
Any of: accept `min_height`; accept a `limit`/`offset` or cursor; or return
only outputs at or above a caller-supplied `amount` threshold. Sending needs
enough outputs to cover the requested amount plus fee — not all 223,810.

**2. Bound `get_address_info`.** Accept `min_height` for `spent_outputs`, the
same semantics as `get_address_txs`, so the client can fetch them
incrementally and keep a running correction. Equally good: an option to omit
`spent_outputs` entirely **and** return a server-side mixin-corrected
`total_sent`, since the server already holds the view key and can do this
correction far more cheaply than 656k WASM calls on a phone.

**3. Add `total_sent` and `locked_funds` to the `get_address_txs` response.**
This is the smallest change with the largest payoff: the guide already claims
`total_sent` is there, and with it the balance comes free from the existing
185-byte incremental call, making ask 2 largely unnecessary.

---

## 6. Reproduction

Substitute a real `address` / `view_key` for the high-activity account.

```bash
ADDR='<address>'; VK='<view_key>'

# Full history — the payload the wallet used to request every refresh
curl -sS -X POST 'https://lwsapi.beldex.dev/get_address_txs' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\"}" \
  -o /dev/null -w 'full: size=%{size_download} time=%{time_total}s\n'

# Incremental — works correctly today
curl -sS -X POST 'https://lwsapi.beldex.dev/get_address_txs' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\",\"min_height\":4045308}" \
  -o /dev/null -w 'delta: size=%{size_download} time=%{time_total}s\n'

# Balance endpoint — unbounded
curl -sS --compressed -X POST 'https://lwsapi.beldex.dev/get_address_info' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\"}" \
  -o info.json -w 'info: wire=%{size_download} time=%{time_total}s\n'
python3 -c "import json;d=json.load(open('info.json'));print('spent_outputs:',len(d['spent_outputs']))"

# Send path — unbounded
curl -sS --compressed -X POST 'https://lwsapi.beldex.dev/get_unspent_outs' \
  -H 'Content-Type: application/json' \
  -d "{\"address\":\"$ADDR\",\"view_key\":\"$VK\",\"amount\":\"0\",\"mixin\":9,\"use_dust\":true,\"dust_threshold\":\"2000000000\"}" \
  -o uo.json -w 'unspent: wire=%{size_download} time=%{time_total}s\n'
python3 -c "import json;d=json.load(open('uo.json'));print('outputs:',len(d['outputs']))"
```

---

## 7. Contact

Raised by the beldex-lws-mobile team. Happy to re-run any of the above against
a staging build, or to test a bounded variant of either endpoint as soon as one
is available.
