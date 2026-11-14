# UI workflow audit — 2026-11-14

This release separates observation contexts, not brokerage policy. No strategy/source, allocation, order logic, risk rule, credentials, IP access or REAL transport is changed. Stored research records remain stored. No orders are created by this update.

## Context boundaries

- **Portfolio / 0110 ACC**: configured operating account, explicit environment, budget, actual worker heartbeat and exact-policy account/strategy valuations. Missing valuations are —. No historical research cards, account/run selector or simulated positions.
- **Research**: CODE, BTRESULT, historical positions/risk/order evidence. Each report explicitly says BACKTEST / SIMULATED and pins its own run. Backtest completion/halting does not start, stop or liquidate a brokerage strategy. An ending position is a simulated ending position.
- **KIS DEMO / 0504 BROKER**: virtual-money cash-equity setup, review, worker commands, read-only broker capture and owned brokerage order states. Only DEMO accounts enter its picker. No REAL mode selector or transition action remains. REAL dispatch remains unavailable in the backend; UI removal does not certify or enable it.
- **Market / Analytics / Administration**: source clocks, actual stored evidence and implemented configuration tools. None is proof that an operating strategy is trading.

Only Research and Analytics show the **BACKTEST ACCOUNT / RUN** default. Operation desks show account-specific clocks inside their own functions. Portfolio and DEMO data remain independent of that historical selection. Financial payloads/IDs are never persisted in browser storage.

## Every retained numbered function

| Number | Decision and essential controls |
| --- | --- |
| 0001 | Operating Portfolio desk; one initial function ACC. No historical tiles. |
| 0002 | Market desk; independent sources/symbols. |
| 0003 | Research desk; code and historical results, not account execution. |
| 0004 | Analytics & Data desk; implemented diagnostics and collection. |
| 0005 | KIS DEMO desk; one function BROKER. REAL orders explicitly disabled. |
| 0006 | Administration desk; protected access/database operations. |
| 0102 HOLD | Research-only **Backtest Positions**. Run/FOLLOW pins the historical observation. Symbol button opens that run's source chart. No buy/sell/claim of brokerage holdings. |
| 0103 RISK | Research-only **Backtest Risk**. Historical exposure/limits and source chart; cannot alter operating limits. |
| 0108 ORD | Research-only **Backtest Order & Fill Journal**. Search/state filters and immutable run evidence; no brokerage dispatch. |
| 0110 ACC | Operating-account selector and automatic read-only refresh; explicit budget vs NAV/PnL/contribution. No research account placeholders. |
| 0201 QUOTE | Actual stored security sample and source coverage; sample changes never called session returns. |
| 0202 GP | Pane-owned symbol/source, actual OHLCV cursor, history/zoom/range/chart type and opt-in exact-time link. No synthetic missing bars or execution controls. |
| 0203 EVENTMON | News/disclosure source clocks, revisions, filters and source evidence. No invented strategy signals. |
| 0204 MONITOR | Disclosure search/type/priority, original-record access and bookmarks. No orders. |
| 0206 SAVED | Real in-memory bookmarked disclosures; retained because MONITOR bookmark actions populate it. Not a placeholder portfolio/watchlist. |
| 0290 EVENT | Actual selected source record detail; bounded GET, source lineage, safe external original URL and close. |
| 0302 BTRESULT | Single backtest performance view, explicit historical provenance, simulated-cost details and links to 0102/0103/0108. Separate DEMO source review handoff; never automatic trading. |
| 0304 CODE | Inert source/policy editing, templates, validate/save/load, exact reviewed historical execution, owned-job status/stop and result selection. Unsaved source is memory-only. |
| 0403 DATA | Actual stored source lineage/coverage. Retained because query clocks and excluded/mixed source coverage are actionable. No inferred provider heartbeat. |
| 0404 JOURNAL | Bounded raw event/revision queries and lineage; data source evidence, not trading decisions. |
| 0405 BOOK | Symbol/query, stored full depth, source quality and original event. OFI unavailable for unknown continuity. |
| 0410 STATS | Supported registry tools only. Window input; peer input only for paired tools; lags only for ACF/stationarity. Current backtest run required to execute. Diagnostic evidence is not a trading approval. |
| 0411 DATAFLOW | Actual worker/history status, reviewed research-based collection policies, pagination/search and stop-recording with generation checks. Collection authorization does not send orders. |
| 0412 UNIV | Actual saved universe rules, official master request, preview, save/CAS/default selection. No manual backtest symbol-list substitute. |
| 0504 BROKER | DEMO account selection; reviewed setup in collapsible editor; START/PAUSE/STOP/FLATTEN, real heartbeat/readiness summary, optional detailed evidence, read-only capture and owned orders. STOP does not flatten; ACK is not fill. |
| 0601 ACCESS | Read policy, preview and survivor-only generation-checked IP rotation. Both slots and auth boundaries preserved. |
| 0602 DATABASE | Read-only schema inspection/report; removed static terminal-command dump. Operator migrations/backups remain documented, not browser actions. |

## Removed/consolidated UI

| Old function | Result |
| --- | --- |
| 0101 PERF | Duplicate chart removed. Number/PERF/legacy performance ID route to 0302 BTRESULT. |
| 0104 EXEC | Duplicate cost screen removed; actual simulated-cost evidence lives inside 0302. Number/EXEC/old ID route there. |
| 0105 ATTR | Separate historical shared-account tile removed. Actual operating contribution is shown in 0110 from operating performance. No standalone runs are summed. |
| 0401 CORR | Empty shared-account-only matrix screen removed. Paired supported statistical tools remain in STATS; core statistical functions are preserved. |
| 0402 HEALTH | Historical publication screen mistaken for system/broker health removed. Backtest run/source clocks remain on reports; actual worker/readiness stays in BROKER. |
| 0501 BLOTTER / 0502 FILLS | Research-only empty account-wide displays removed from Execution. Old numbers/commands/IDs route to Research 0108's selected-run simulated order/fill journal. The old account-wide UI/API behavior is not claimed equivalent to this selected-run view; the server API remains unchanged. |
| REAL selector / transition preview | Removed non-operational controls. No replacement fake REAL screen. Environment readiness evidence remains read-only. |
| Old global selector and context date on operating desks | Removed research defaults/clocks that looked like operating account context. |
| STATS disabled/unrelated inputs | Unavailable tools omitted; irrelevant pair/lag inputs hidden. |
| BROKER repeated source notes/raw JSON | Setup-only review evidence moved into setup editor. Visible worker/readiness table; raw evidence remains collapsible. |
| DATABASE static operator commands | Removed from the live control surface; migration/backup runbooks remain documentation. |

Saved layouts drop moved/retired research panes from operation desks and consolidate legacy duplicate IDs; surviving account/chart geometry remains unchanged. No automatic tiling. Retired-only layouts may be empty until the user opens a real function. Existing chart gestures/font package are unchanged.

Validation includes actual context routing, absent legacy placeholders, no research NAV in the operating portfolio, explicit simulated positions, exact reviewed DEMO flow, REAL-account exclusion, retry identity, no requests that write merely by navigation, legacy layout migration, source/table/chart suites and public Pages isolation. Synthetic tests do not establish KIS submit/fill/cancel or REAL broker acceptance.
