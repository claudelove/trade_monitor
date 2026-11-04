# Shared terminal presentation and interaction contract

The public repository owns `packages/terminal-ui`. The private repository owns application framework, numbered functions, API/data/state, strategy and execution logic. This explicit 2026-11-05 user direction authorizes **UI dependency integration in both repositories**; it does not authorize private engine/strategy publication or unrelated private changes.

## Ownership and delivery

`@trade-monitor/terminal-ui` version 0.1.0, UI contract major 1 is a buildless ESM/CSS/font bundle. No npm registry, runtime CDN or private network endpoint is required. It includes typography/theme tokens, shell/panel/chart styles, native/SVG chart engines, model/time-link semantics, DOM lifecycle helpers and window chrome interactions. It never imports screen registries, function numbers, portfolios, strategies, API clients or application state.

The public source is canonical. `web/shared/` is generated for the public preview. The private application vendors the same bytes under `src/krx_system/monitoring/web/shared/`, pinned by a **full public commit SHA**, manifest SHA256, API major and per-file hashes in `terminal-ui.lock.json`. `scripts/sync_shared_ui.py --check` is offline and rejects drift. There is no automatic production download or silent branch tracking.

Application-owned adapters keep existing imports (`charts/terminal-chart.js`, `charts/model.js`, `ui/dom.js`, stylesheet paths) stable. These are thin re-exports/imports. `ui/actions.js`, `charts/host.js`, `window-workspace.js`, screen modules and engine clients remain local. In particular, chart normalization/rendering is shared; selecting a strategy, building its financial series and choosing link groups belong to the application. Window interaction callbacks remain local; the package binds inputs and disposes listeners.

Changing screen 0101 to 9876 does not change a style or package import. Reuse the semantic classes (`panel`, `table-wrap`, `toolbar`, `tool-window`, `window-titlebar`, `window-body`, etc.) and the stable JS interfaces. A new function with entirely new markup must still adopt those component classes; numbering alone cannot style arbitrary markup.

## Updating the public visual module

Edit only `packages/terminal-ui/src/` for shared appearance/actions. Keep business logic in its owner repository.

```sh
python scripts/build_shared_ui.py
python scripts/sync_shared_ui.py --source packages/terminal-ui
npm run test:ui
npm run test:pages
.venv/bin/python -m pytest -q
```

Commit/push a tested release to public work. Bump the package version for later releases. Do not edit generated adapters/shared copies to fix a visual issue.

## Updating the private consumer

Use the new **tested public commit's full SHA**:

```sh
python scripts/sync_shared_ui.py --revision FULL_40_CHARACTER_PUBLIC_COMMIT_SHA
python scripts/sync_monitor.py
python scripts/sync_shared_ui.py --check
npm run test:ui
python scripts/check_monitor_package.py --syntax
PYTHONPATH=src python -m unittest discover -s tests -v
```

Review the lock and asset changes, then commit the private dependency update. No screen/function/API rewrite is needed. The installer downloads only the public package subtree, verifies its manifest and rejects traversal, missing assets, modified vendored payloads, unsupported API majors and attempts to replace framework files. Its compatibility adapter allowlist does not contain app.js, screen modules, engine-client, strategy-analysis or engine code. Application action mappings are preserved separately.

For local development only, `--source /path/to/public/packages/terminal-ui` accepts an unpacked reviewed package. The release consumer should always use `--revision`. Restart/rebuild the private server/container after asset updates; do not update a running immutable deployment in place. Source updates are staged before deployment, not hot patches to live jobs. A failed/offline update is not a fallback to a moving remote branch.

## Typography and chart consistency

Default is the licensed IBM Plex Mono substitute; it is **not Bloomberg Prop**. Font glyph widths come from the selected font. Character spacing changes tracking; no horizontal canvas/CSS distortion is applied.

```js
import {setTheme} from './ui/theme.js';
setTheme(document.documentElement, {
  fontFamily: 'Verdana, sans-serif',
  typeScale: 1.05,
  letterSpacing: 0.1, // pixels
  wordSpacing: 0,
  lineHeight: 1.35,
  chartFontSize: 11,
});
```

CSS equivalents are `--font-ui`, `--ui-type-scale`, `--ui-letter-spacing`, `--ui-word-spacing`, `--ui-line-height`, `--chart-font-size`. Theme updates validate all inputs before applying and do not persist data. Native canvas charts read the same font/size and react to theme/font loading/ancestor style changes. Canvas glyph spacing is determined by the chart font, not DOM letter-spacing. Native chart data, viewports, source clocks, missing bars and optional LINK remain unchanged.

`TerminalChart(root,{series,state,key,linkGroup,bus,...})`, `setData`, `dispose` remain the rendering boundary. Chart model/time-link exports are stable under UI API v1. `bindWindowChrome(element,{onFocus,onAction,onToggleMaximize})` has no window manager state and returns an idempotent cleanup; mouse and Enter/Space title actions use the same callbacks. DOM event scopes and theme observers are cleaned up when the host disposes them.

## Packaging and licenses

Charts/fonts stay local, with TradingView attribution and original third-party licenses. The source package carries their LICENSE/NOTICE/provenance; private existing packaged licenses remain the same versions. Private wheel/static asset packaging includes shared modules/styles/fonts. CI verifies bundle/adapters against the lock without network. Public preview still blocks all server operations and never queries a private host.

Current validation includes application-independent screen-number contracts, typed/atomic theme updates, listener disposal, updater ownership/traversal/major-version guards, both applications' existing UI tests, real-browser typography + chart interaction, and private wheel asset parity.
