# Strategy workbench / bar API v1

## Delivered workflow

CODE 0304 is a real code workbench. Offline-bundled CodeMirror provides Python/TOML syntax highlighting, line numbers, folding, bracket matching, indentation, undo/redo, find/replace, context-field completion and inline diagnostics. Ctrl/Cmd-S saves; Ctrl/Cmd-Enter starts the explicit reviewed backtest flow. Editor undo/selection/text survive desk changes in pane memory, never browser storage.

1. Start with the contract template or explicitly select the runnable **synthetic OHLCV reference**. The default contract has unimplemented entry/exit hooks which must be replaced; validation blocks those hooks instead of producing a misleading successful no-op run.
2. Edit Python and the universe/capital/risk/execution TOML. Missing/unsupported runtime requirements must be implemented in the engine first. Parameters in source and engine/account limits remain separate, explicit checks.
3. VALIDATE performs static syntax/API-entry and policy checks, shows line/column diagnostics, and reports effective engine settings. It never imports Python, certifies behavior, or validates profitability. Runtime exceptions are tested in the actual worker.
4. SAVE VERSION stores even unfinished drafts, identified by the combined content SHA256. Saving does not execute/import/register code. A 64 KB source / 12 KB policy and 100-version bound apply.
5. Select an operator-approved dataset and explicitly review the exact source/policy/dataset. BACKTEST THIS STRATEGY validates and saves the current editor content, then submits that immutable version. Any content/dataset change invalidates review; stale preparation responses cannot launch changed code.
6. Inspect running/completed/failed/stopped status, structured runtime errors and version/dataset identity. STOP BACKTEST terminates only the server-owned historical process. OPEN RESULT selects this job's run, not a previous global selection. Recent jobs restore from the server after reload; unsaved source does not.

## Server contract (protected-engine host only)

- GET /api/strategy-lab/code-drafts and GET /api/strategy-lab/code-drafts/{version}: administrator-only version listing/load.
- POST /api/strategy-lab/code-drafts: `{source, manifest}`; inert immutable draft storage.
- POST /api/strategy-lab/code-validate: `{source, manifest}`; `{valid, diagnostics, effective_settings, scope}`. Diagnostics identify file, line, column, severity and message.
- POST /api/strategy-lab/backtest: `{version, expected_version, dataset, request_id, reviewed:true}`. Server checks exact hash, explicit review, static validity, dataset allowlist and required universe before taking input/source snapshots and spawning a worker. Request IDs are stable across unchanged retries and cannot refer to different inputs.
- GET /api/strategy-lab/jobs: latest 25 source-version jobs, administrator-only.
- GET /api/paper/jobs/{id}: stored process state; POST /api/paper/jobs/{id}/stop: existing administrator-only owned-worker termination.

POSTs retain exact host/origin/IP checks. The historical process receives no broker-secret environment. **Trusted Python is not a sandbox**; source review includes imports and filesystem/process access. No arbitrary path, dependency installation or broker action is accepted through these authoring endpoints. The server records source hash, combined version, dataset snapshot hash, manifest hash, request/job/run identity and review actor/time. State records publish atomically so pollers cannot see partially written JSON. Runtime failures do not create successful results. An interrupted server reports detached jobs as unverified; a durable restart supervisor is not delivered here.

## Runtime meaning and limits

Actual ABI remains `API_VERSION = "1"`, `create_strategy()` and `on_bar(StrategyContext) -> TargetDecision | None`. Context is the current strategy book's as_of/history/positions/instruments/equity/halted snapshot. Targets are signed notional/NAV weights; None means no new target and an empty mapping requests flat. Entry/hold/exit/sizing and strategy caps belong in code; shared engine/account caps remain mandatory. Future-data invariance, warmup, deterministic ties, partial liquidity and next-eligible-bar assumptions must be tested per strategy.

The default typed contract includes explicit warmup, account-halt handling, target/exit hooks, finite/universe/gross/symbol/short checks, decision reasons and fresh-instance creation. The separate runnable reference describes its exact 20-bar positive-return/top-two policy and synthetic inputs. Neither is a private strategy or a production recommendation.

Bar v1 still lacks live limit/TTL/amend/cancel transport, event/fill/timer callbacks, restart checkpoints, fill-driven hedging and full broker reconciliation. Current IOC/cost/volume assumptions do not model intraday limit touches or opening-auction liquidity. Funding, borrow, dividends and corporate actions need data/models; they are not measured zeros. Static checks do not prove strategy logic or resource isolation. Research/backtest execution is implemented; live trading is not.

## Public preview and dependency

GitHub Pages renders the same editor and public templates. It blocks all protected operations before fetch and contains no private source/account/registry data. Actual saving, validation and workers require deployment of the protected backend. Shared editor presentation is terminal-ui 0.7.0 / API 1; build with `npm run build:editor`, then the existing shared manifest/install workflow. Dependencies and MIT licenses are bundled; no runtime CDN is used.
