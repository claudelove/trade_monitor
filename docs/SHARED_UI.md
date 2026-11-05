# Shared terminal presentation and interaction contract

The public repository owns `packages/terminal-ui`. The private repository owns application framework, numbered functions, API/data/state, strategy and execution logic. This explicit 2026-11-05 user direction authorizes **UI dependency integration in both repositories**; it does not authorize private engine/strategy publication or unrelated private changes.

## Ownership and delivery

`@trade-monitor/terminal-ui` version 0.4.0, UI contract major 1 is a buildless ESM/CSS/font bundle. No npm registry, runtime CDN or private network endpoint is required. It includes typography/theme tokens, shell/panel/chart styles, native/SVG chart engines, model/time-link semantics, DOM lifecycle helpers and window chrome interactions. It never imports screen registries, function numbers, portfolios, strategies, API clients or application state.

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

Default is **Bergoom**, the OFL-licensed Bloomberg-inspired font from dchest/bergoom, pinned to upstream commit e5553246134ee34a3880e801c8d4c92f316a1ffd. Regular/Semibold/Bold/Italic are self-hosted unmodified. It is **not Bloomberg Prop**. IBM Plex Mono remains the code-editor/preformatted fallback; Korean glyphs use the local sans-serif fallbacks. Font glyph widths come from the selected font. Character spacing changes tracking; no horizontal canvas/CSS distortion is applied.

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

Charts/fonts stay local, with TradingView attribution and original third-party licenses. The source package carries their LICENSE/NOTICE/provenance. Redistribution notices are also generated into shared/licenses/ as text and included in consumer wheels; the public site serves these copies and third_party/. Private wheel/static asset packaging includes shared modules/styles/fonts. CI verifies bundle/adapters against the lock without network. Public preview still blocks all server operations and never queries a private host.

Current validation includes application-independent screen-number contracts, typed/atomic theme updates, listener disposal, updater ownership/traversal/major-version guards, both applications' existing UI tests, real-browser typography + chart interaction, and private wheel asset parity.

## HTS presentation, 0.2.0

Native price charts use red/blue candles, a separate adjustable volume pane, right-axis source values, quiet horizontal grid, LAST SOURCE / Δ BAR ribbon, and default trailing MA 5/20/60 with cursor values. Δ BAR compares the prior loaded observation; it is not an inferred day/session return. Missing/short MA inputs remain N/A. No bar, volume, session clock or market feed is fabricated. An integer OHLC series uses integer axis/cursor labels; displayPrecision may override presentation only, never exchange tick rules.

The canvas focus target supports Left/Right inspection, +/- zoom, Home earliest, End latest, Escape clear. Cursor LINK clears on missing timestamps. Pan/zoom retention, visible-range preservation on resize and the user volume-pane proportion are maintained. Chart height measures actual toolbar/ribbon/legend height. CANDLE/LINE, Latest and opt-in LINK stay in the stable API-v1 component. state.studies=[] disables the default MAs; options.defaultStudies can choose among 5/20/60.

## Manual windows and screen search, 0.3.0

`bindWindowGeometry(element,{bounds,getGeometry,onChange,onCommit,enabled})` supplies pointer drag, eight-edge resize and keyboard movement/resize with normalized geometry callbacks. Applications own geometry, z-order, screen routing and persistence; the package never reads a registry or localStorage. Gestures update existing elements, preserving mounted charts. Pointer cancellation, Escape, blur and disposal roll back unfinished gestures and release listeners. Desktop movement stays within canvas bounds; resizing uses a 280×180 CSS-pixel interaction minimum where space permits. Mobile <=700px retains vertically stacked readable panels and disables geometry interaction.

Both application adapters remove automatic tiling, preserve existing geometry on opening/closing, and originally exposed a per-workspace SCREENS / Search dialog (superseded by 0.4.0 below). It searches the live registry by number, command, alias, name and desk; selecting a result routes through the application. The former full numbered toolbar, per-window function dropdown and reset button are removed. Maximum 12 panels per desk remains. Only screen types/geometry persist in browser storage; account/run/source payloads do not. Keyboard title maximize now also raises/focuses the selected panel.

## Guide-based chrome and persistent function search, 0.4.0

The shared theme uses dark navy, red function bars, gray window controls, amber editable fields and blue selections; see TERMINAL_STYLE_GUIDE.md. `bindFunctionSearch(form,{entries,onSubmit,onError})` binds a permanent command form. Entries are plain `{id,number,command,title,group,aliases}` data (or a function returning them); no registry/API/state import. The host parses commands and routes selections. `onSubmit(text,row,{selected})` distinguishes explicit row choice from a raw command and returns false to keep the search open. The returned `open(clear=false)`, `close()` and idempotent `dispose()` manage lifecycle. Search alone never executes. Keyboard, held Enter/IME guards, ARIA selection, dismiss and input escaping are shared.

Applications now use one permanent shell directory; old per-desk directories, static HELP dialog, redundant shortcuts and hidden layout/heading placeholders are removed. Workspaces reuse one instance of each function, consolidate legacy duplicate layouts and update pane chrome incrementally. Re-select/maximize/add/close preserves surviving chart DOM; explicit changed pane parameters remount only their target. Application publication/context changes retain their existing data lifecycle. Layout persistence remains screen identity/geometry only.
