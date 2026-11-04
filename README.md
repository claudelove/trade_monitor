# KRX Terminal — public monitoring UI

[Open the preview](https://claudelove.github.io/trade_monitor/) · [UI source and synchronization](docs/UI_SYNC.md) · [Handoff](docs/HANDOFF.md)

This repository publishes the frontend of the integrated KRX terminal. The user authorized importing **UI only** from the reviewed private integration. No private strategy source, engine, operational data, configuration, credential or Git history is published.

The six workspaces are Portfolio, Market, Strategy, Analytics & Data, Execution and Administration. Numbered screens are independent modules. The imported English terminal UI, independently pinned panels, native charts and locally packaged fonts match the pinned upstream source; the public preview connection is the only functional adaptation. [File hashes and source revision](docs/UI_UPSTREAM.json).

## Public preview

GitHub Pages displays the existing public market snapshot: DART disclosure titles, news candidates and selected NAVER/pykrx adjusted daily bars. It is not a real-time KRX feed. Account/run lists are empty. The banner identifies the preview and its disconnected engine.

Strategy authoring/research, statistical execution, canonical event/book history, OMS, IP management and DB services require the protected engine. The UI is present, but Pages does not execute those operations or transmit requests to a private server. No strategy examples or private registry entries are included in the preview catalog. A snapshot date is not an availability clock.

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

Charts use locally bundled **TradingView Lightweight Charts 5.2.1** and retain TradingView attribution; **IBM Plex Mono 5.3.0** is a redistributable terminal-style font, not Bloomberg's proprietary font. All licenses, notices and provenance are in [third_party](third_party/) and are copied into the site build. [Chart notes](docs/CHART_MODULE.md).

`work` deploys after GitHub Actions checks. No private host or paid cloud resource is created by this UI import. Never put private account/strategy data, `.env`, SQLite, credentials or artifacts in this repository or Pages. [Deployment](docs/DEPLOYMENT.md).
