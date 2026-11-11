# Terminal UI — shared presentation and interaction modules

Strategy CODE 0304 now uses a bundled code editor and the current version's validate/save/backtest/status/stop/result workflow. See [the workbench contract](docs/STRATEGY_WORKBENCH.md). Public Pages is UI-only; actual operations require the protected engine. Live broker transport remains disconnected.

[Open the preview](https://claudelove.github.io/trade_monitor/) · [UI source and synchronization](docs/UI_SYNC.md) · [Handoff](docs/HANDOFF.md)

The public repository owns **packages/terminal-ui**, the shared typography, styles, chart rendering and UI interaction library. The public repository also owns numbered frontend screen/view sources. The private repository owns protected application adapters, API/data/state, trading logic and strategies, and serves reviewed frontend copies. Both consume the same UI contract through versioned local bundles and stable adapters. Changing a private screen number or function does not require copying the UI again.

[Shared contract and update commands](docs/SHARED_UI.md) · [Canonical package](packages/terminal-ui) · [Consumer lock](terminal-ui.lock.json)

The existing six-desk frontend remains a preview host for the visual modules. It does not publish or implement the private engine. Shared changes belong in packages/terminal-ui/src/, not generated web/shared/ or private screen code. The historical whole-UI import is recorded in docs/UI_UPSTREAM.json; it is no longer the update workflow.

## Public preview

GitHub Pages displays the existing public market snapshot: DART disclosure titles, news candidates and selected NAVER/pykrx adjusted daily bars. It is not a real-time KRX feed. Account/run lists are empty. The banner identifies the preview and its disconnected engine.

Strategy authoring/research, statistical execution, canonical event/book history, IP management and DB services require the protected engine. The UI is present, but Pages does not execute those operations or transmit requests to a private server. No strategy examples or private registry entries are included in the preview catalog. A snapshot date is not an availability clock.

## Local preview and checks

```sh
npm ci
npm run test:ui
npm run test:pages
python -m http.server 8768 --directory dist
```

Open `http://localhost:8768`. A non-Pages deployment retains the same-origin private engine contract through `web/engine-client.js`; no URL or credentials are embedded in the client.

The pre-existing Python collector/runtime-v1 backend remains in this repository for compatibility and its tests. It is **not** the integrated `/api/accounts`, `/api/runs`, `/api/monitor/snapshot` engine and cannot supply this UI's private functions by itself. Its original Python dependencies and CLI are retained. Run `.venv/bin/python -m pytest -q` for backend checks.

## Modules, charts and licenses

Add a numbered file under `web/screens/`, assign its workspace, and regenerate `python scripts/sync_screens.py`. [Screen contract](docs/SCREEN_MODULES.md).

Charts use locally bundled **TradingView Lightweight Charts 5.2.1** and retain TradingView attribution; **Bergoom** is the self-hosted, OFL-licensed Bloomberg-inspired default; it is not Bloomberg Prop. IBM Plex Mono remains for source-code blocks. All licenses, notices and provenance are in [third_party](third_party/) and are copied into the site build. [Chart notes](docs/CHART_MODULE.md).

`work` deploys after GitHub Actions checks. No private host or paid cloud resource is created by this UI import. Never put private account/strategy data, `.env`, SQLite, credentials or artifacts in this repository or Pages. [Deployment](docs/DEPLOYMENT.md).

2026-11-11 UI cleanup: removed the disconnected event-paper OMS and static READY
functions. DATAFLOW keeps recording review/status; UNIV + CODE own automatic
historical selection. Historical portfolio/order results remain research tools.
