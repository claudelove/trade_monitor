> Current authoring behavior: see [STRATEGY_WORKBENCH.md](STRATEGY_WORKBENCH.md). Web-reviewed immutable versions can run historical workers directly; the earlier registry-only restriction below is superseded for the explicit administrator-reviewed backtest endpoint. Live trading remains disconnected.

# Workspace roles and incremental screen development

## Roles

| Workspace / function | Question it answers | Current implementation / boundary |
| --- | --- | --- |
| Portfolio | Where are capital, PnL and risk concentrated? | Existing shared-account NAV, strategy contribution, holdings, gross/net exposure and risk views. Independent runs must not be summed into an account. |
| Market / 0201 QUOTE | What prices and source coverage are available? | Stored sample quotes and sample-only up/down/flat counts; not market-wide breadth or real-time health. |
| Market / 0203 EVENTMON | Can this source event be aligned to strategy inputs? | News + disclosures, occurrence/receipt/availability clocks, revision/correction, symbol, age thresholds and latest timed price checks. Missing data is explicit. No semantic signal or event-return model is inferred. TOP/NEWS remain aliases. |
| Strategy / 0304 CODE | What exact code and policy are being reviewed? | Python/policy editor, editable default skeleton, protected-server version save/load and exact registered-code historical execution. |
| Backtest / 0302 BTRESULT | What happened under declared historical assumptions? | Existing stored-result analysis; completed editor jobs open their own result. It is a separate numbered module, currently accessed within the Strategy desk. |
| Analytics / Execution / Administration | What evidence, order state and operational configuration exist? | Existing supporting functions remain; no new placeholder screens were added. |

The Strategy desk now contains two functions only: CODE and BTRESULT. Removed standalone manifest, worker-information and local-file-instruction screens. Legacy numbers 0109/0301/0303/0305 redirect to CODE; saved legacy layouts consolidate those types without resetting result-window geometry. Manual placement remains.

## Strategy-family monitoring priorities

The user-supplied 2013 hedge-fund primer provides background, not current trading assumptions. Its relative-value, event-driven, equity-hedge and tactical categories are metadata and requirements, not hardcoded strategies or separate dummy menus.

- Relative value / pairs: leg exposure, hedge ratio, spread/model stability, one-sided fills and liquidity; CB/bond strategies additionally require credit, rate, borrow and contract data.
- Event driven: original evidence, terms and changes, entity linkage, actual availability, correction/deduplication and event lifecycle; subsequent price reaction must use appropriate point-in-time observations.
- Equity hedge: gross/net, strategy contribution, overlapping symbols, sector/beta/factor and borrow costs. Net zero does not establish market neutrality.
- Tactical / futures: contract multiplier, expiry/roll, margin, volatility sizing and out-of-sample cost-sensitive validation.

Only existing source-backed measures may be displayed. Beta/factors, borrow, funding, corporate actions, macro feeds, semantic event extraction and event-to-strategy consumption tracking remain extensions. Missing inputs are not zero. A future module must declare purpose, input contract, units/clocks, actionable gaps and empty state before being added to the registry.

## Authoring and execution boundary

A version consists of Python source plus TOML universe/capital/risk/execution settings. Starter comments document actual bar API v1, the signal/sizing/exit policy owned by Python, mandatory engine/account caps and current historical IOC/cost assumptions. It explicitly lists the unimplemented full-operation requirements: limit/TTL/amend/cancel policy, market sessions, stale-data response, fill/UNKNOWN callbacks, reconciliation, restart state, kill/flatten and hedge management. These are not invented working configuration keys.

The protected server accepts inert drafts using GET/POST /api/strategy-lab/code-drafts and GET /api/strategy-lab/code-drafts/{version}. Save parses Python syntax and validates the TOML; it does not import/execute/register code. The combined content hash identifies immutable versions. Existing registered-source/hash review remains necessary before Python workers may run. Full automatic operation and broker transport are not delivered by this change.

Pages accepts editing in memory but blocks server operations before fetch. No private code/accounts/registries are bundled. Unsaved text is not browser-persistent; save before closing the pane. Code editing invalidates execution review. New backend deployment is required for server draft storage.
