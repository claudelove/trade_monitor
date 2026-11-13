# Latest 2026-11-06 — DATAFLOW0411

## Mondu Terminal product name

User requested the product name be changed to Mondu Terminal across both repositories and Pages. Updated browser title, split brand label/accessibility label and product text; private host/MCP display names and export heading follow the same name. Existing repository URLs, KRX exchange identifiers and technical storage/command identifiers are preserved. Brand text/HTML and Pages build checked; no trading/data behavior changed.

## Korean user manual / text-only documentation

README now starts with user tasks and a guide link. docs/USER_GUIDE.md walks through navigation/windows, market/event data, UNIV → CODE research, BROKER DEMO prepare/apply/start/pause/stop/flatten, portfolio, DATAFLOW and troubleshooting. Written against reviewed frontend 53e8901; distinguishes static Pages from protected operations, WAIT_SESSION from a trade, and stop from liquidation. Existing technical README preserved as docs/DEVELOPER_GUIDE.md with adjusted links. No screenshots or UI/backend/runtime changes. Documentation links and screen commands checked locally.

Added the public-owned numbered data request/research-review/recording UI, CODE retrospective-dataset labelling, scoped form layout, exact operation allowlist and synthetic DOM checks. See DATAFLOW.md and releases/dataflow-1.json for the separately reviewed frontend release; the common package remains 0.7.0. Protected implementation is a separate host capability, not the legacy public Python server. Pages remains disconnected and rejects reads/writes for DATAFLOW without calling a private origin. No private engine/strategy/runtime files were copied here. Validation: all 13 UI suites, 37 public Python tests and the Pages boundary passed. A disposable protected host also exercised exact result selection and saved two synthetic recording owners; no real provider request or private production deployment. The release commit is the commit introducing this entry.

# 작업 인계 — Catalyst

## 2026-11-05 financial display / execution-filter audit

Reviewed all 26 user-facing functions in the deployed public preview and a separate synthetic protected host. Fixed source-decimal book prices (0405) and OMS limit prices (0503) displaying as missing because the generic shared number formatter intentionally rejects strings. New ui/exact-decimal.js is a schema-specific display adapter: exact string grouping/scientific expansion, no floating-price conversion, no identifier coercion, no input mutation. The canonical API decimal contract stays unchanged. Numeric cells retain semantic alignment.

Execution 0501 adds the actual `unfilled` order state to its filter. FILLS 0502 has no order-state selector and ignores stale order-state filters; fill records do not carry an order status. No invented filled field, order mutation or live connection was introduced. Shared package/font/chart bytes are unchanged; numbered screen/view sources are canonical here and are consumed as reviewed copies by the protected host.

Validation: public Python 37 pass, all 12 UI suites pass, Pages no-private-request/no-write/no-invented-clock boundary pass. Browser on an isolated synthetic host verified price values rather than dashes, unknown continuity/session preserved and raw evidence opening. Source-only UI fixes and synthetic tests are published; private engine/strategy/account artifacts are not. No production private deployment or brokerage order occurred.


## 2026-11-05 actual strategy workbench — current

Replaced the textarea-only authoring flow with offline CodeMirror (shared UI 0.7.0 / API 1), typed bar-v1 contract and an explicitly selected runnable synthetic reference. Current-content validate/save/backtest is primary; no manual local registry step is needed for an administrator's explicit exact-version historical request. Draft save allows incomplete edits without execution. Validation has source positions and effective policy settings; incomplete hooks fail. Status/error, own result, real worker stop and recent-job recovery are connected. Source/data edits invalidate review; stale responses cannot launch a changed input. Desk transitions preserve editor text/undo/selection in pane memory. See STRATEGY_WORKBENCH.md.

Both 11-suite UI checks and public Pages boundary passed. Actual Chromium against a disposable synthetic protected server confirmed editor highlighting/gutter/inline diagnostics, reviewed saved-version worker execution with orders/fills/result provenance, load/reload recovery and mobile containment. Additional Chromium verified editor undo across desk changes and actual worker stop without a success result. Related DOM tests cover stale-response rejection and automatic validate/save/run sequencing. No private production deployment or live trading occurred.

## 2026-11-05 default editable strategy skeleton — latest correction

Replaced the prose GUIDE with actual prefilled Python and TOML in CODE 0304. The source exposes signal, target_weights, exit_policy, risk_policy and create_strategy; the policy includes universe/capital, all current risk caps and execution cost/IOC assumptions. Default signal returns None. Starter instrument/costs/limits are explicitly placeholders. INSERT SKELETON restores both editors with confirmation before replacing any differing code, including a loaded saved version. Nullish initialization preserves existing/explicitly empty edits across remounts. Removed unused prose-guide module/styles. No backend or execution contract change. Targeted operations DOM checks and Python syntax/manifest validation passed.

## 2026-11-05 code workspace and strategy-input event monitoring — current

Strategy desk reduced to CODE 0304 and BTRESULT 0302. Python + TOML editor, inline actual-v1 guide, version save/load, exact registered-source review/backtest, own completed-result routing and memory-only unsaved edits. Retired 0301/0303/0305 descriptors are removed; legacy commands/numbers/layouts migrate to CODE. Market QUOTE adds sample coverage; EVENTMON 0203 replaces headline-only reading with news/disclosure input checks, filters and configurable event/price ages. No fake semantic signals, event returns, broad-market breadth or live readiness. See WORKSPACE_PURPOSES.md for purpose-by-function and strategy-family requirements from the user-provided primer.

Protected-engine integration uses inert code-draft storage; the public host does not implement or connect to a private engine. Full live policy/runtime, broker dispatch, semantic extraction and event-to-strategy consumption tracking remain unfinished. Shared library stays 0.6.2; no font/chart dependency churn. Validation: both 11-suite UI checks passed before the final layout refinements; affected operation/workspace/event checks were repeated afterward. Public Pages boundary and 37 Python tests passed. Chromium checked editor tabs/guide, legacy unique routing, no outgoing preview writes, event filtering and mobile containment. Consumer backend verification is recorded only in its own handoff. Private production deployment and live trading were not performed.


갱신일: 2026-11-04 (KST)



## 2026-11-05 market security-monitor alignment — current

User identified Market quote-table alignment. Browser measurement showed matching primary text/header coordinates, but a two-line security cell created 44px rows with values sitting at the top, and full-width automatic columns exaggerated whitespace. Shared UI 0.6.2 / API 1 provides explicit left/right/center and validated pixel column widths. The host quote table separates ticker/name, uses 30px vertically centered rows, stable numeric columns and centered source date/time, with a bounded table width and horizontal scrolling in narrow panes. Other tables remain unchanged. Source symbols/values/units/order and chart actions are preserved.

Public ten UI suites/Python 37/Pages checks passed. Renderer regressions cover explicit center vs numeric defaults, widths, leading-zero ticker, one-line row structure and chart action metadata. Actual Chromium verified glyph centers/header grid offsets <=1px for all public quote rows, 30px row height, stable numeric widths at 1440/900px, GP click-through and mobile contained scroll. Consumer-specific evidence remains in its own handoff; Release 207d616302f0c324aaa078e9ea78797bb8fca3f4 passed [Actions 41988192791](https://github.com/claudelove/trade_monitor/actions/runs/41988192791) and deployed; live quote adapter/shared renderer/CSS/version bytes match.

## 2026-11-05 table body column separators — current

Shared UI 0.6.1 adds 1px vertical rules between body cells, aligned with existing header divisions. Last cells omit the right rule to avoid a doubled outer edge. Shared table styles apply across all desks, including dynamic rows; source data/formatters/geometry remain unchanged. Public ten UI suites, Python 37 and Pages asset checks passed. Actual Chromium confirmed 1px body dividers and no last-cell outer divider. Release fd2210cb9926c82789c7ef0de78bd21e23db2c27 passed [Actions 41985623356](https://github.com/claudelove/trade_monitor/actions/runs/41985623356) and deployed; live shared table CSS and version match.

## 2026-11-05 terminal tables / legibility — current

Common UI 0.6.0 / API 1 adds a dedicated table CSS layer, typed safe renderTable, strict number/percentage formatters and compatibility tableMarkup for trusted host-rendered action rows. Data/header/secondary sizes are 14/13/12px; body UI 13px and key supporting labels 11px. Amber identifiers, light primary values, explicit right-aligned numeric headers/cells, gray column headers, restrained row rules and darker blue selection replace inconsistent table rules. Red/blue values remain legible on highlighted rows. Disclosure headlines wrap instead of clipping. No fake table controls.

Host adapters cover market/disclosures, native records, strategy positions/risk/contribution/correlation, account sleeve, fills/orders, stored book and OMS. Existing actions, filtering, raw ordering and source data remain. Missing numeric values never become zero; identifiers are text; percentage basis is explicit and PP is not multiplied by 100; timestamps remain source strings. Removed positional analysis-cell alignment and tiny execution-table override. New screens can use the same renderer without a function-number dependency.

Local public ten UI suites, Python 37 and Pages boundary passed. Browser verified 14/13/12px sizes, numeric heading/body alignment, selected/hover red-blue contrast >=4.5:1, complete/wrapped headlines, empty/filter restoration, sticky headings and mobile contained horizontal scroll. All 29 registered screens opened twice without duplicates/mount/page errors or writes. Consumer evidence remains in its own handoff; Release ac260710912a49184d8b18c3d0d94e151524c60b passed [Actions 41981825228](https://github.com/claudelove/trade_monitor/actions/runs/41981825228) and deployed. Live shared table JS/CSS/tokens/style/version and market/strategy adapters match. Actual Bergoom glyphs, source OHLCV tooltip/keyboard/chart modes and mobile also passed.

## 2026-11-05 remove misleading header defaults — current

The top SYMBOL and NEW PANE SOURCE fields changed only defaults for newly opened panes, while existing windows stay pinned. Removed those redundant controls and their handlers/contextOptions helper/CSS. GP retains its own symbol/source selectors. Explicit GP symbol commands fall back between existing stored and selected-run bars; invalid symbols reject without opening a pane. Non-GP market panes default to the canonical snapshot independently of GP run-bar defaults; this prevents hidden source state from emptying news/overview. No new API/provider or price data is introduced.

Account/run and strategy-default controls are shown only with actual data choices, outside Market/Admin; empty strategy defaults are hidden. Label/tooltip clarifies new-pane defaults and opt-in FOLLOW; per-pane independence and account publication behavior remain. Shared presentation 0.5.1 / API 1.

Local public UI suites/Pages boundary/Python 37 passed. Controller regressions cover run→stored→run commands without global controls, unique GP reuse and preserved pinning. Browser checks cover absence of redundant globals, hidden empty context, command/local symbol changes, invalid symbols and mobile. Consumer-specific evidence remains in its own handoff; Common release 4b9556f7f98186ae938cec44d549ffc0365b433f passed Actions 41976356288; final frontend c368e8cc0343e1460b41ae39e0687f3f4b837b5c passed [Actions 41976568152](https://github.com/claudelove/trade_monitor/actions/runs/41976568152) and deployed. Live HTML has no global market selectors; app/pane context/terminal views/shared CSS/version bytes match.

## 2026-11-05 interaction feedback and magnetic placement — current

Shared UI 0.5.0 / API 1 adds restrained 90–110ms control/focus/search/open/desk feedback and respects reduced-motion. No drag/resize coordinate transition or delayed command; publication refresh does not replay a navigation reveal. Native charts remain mounted through chrome interactions.

Bottom SNAP ON/OFF (default on) assists only the active drag/resize near workspace/peer edges and 4px adjacency, within 10 CSS px. A temporary dashed guide shows alignment. Alt bypasses; keyboard movement remains precise. Escape/cancel/blur/dispose restores the start geometry and clears guides. Peer windows are untouched and no automatic tiling is introduced. The presentation boolean krx-terminal-snap-v1 is browser-local and shared across desks on mount; account/source/run payload persistence remains prohibited. Mobile keeps stacked panels and hides inactive SNAP.

Local checks: public nine UI suites/Pages boundary and Python 37 passed. Regressions cover pure nearest-edge/resize/minimum/immutable geometry, snapping/Alt/cancel/guide cleanup and no keyboard commit during a pointer gesture; publication refresh does not replay effects. Actual Chromium verified peer 4px alignment/guide, canvas-edge drag and resize, Escape rollback, toggle/reload, retained native canvas, reduced motion and mobile. Consumer evidence remains in its own handoff. Release 83414e914b31e23ad1514b677ae95ac82ff3656e passed [Actions 41974290009](https://github.com/claudelove/trade_monitor/actions/runs/41974290009) and deployed. Live app/workspace, shared gesture/CSS/tokens and version bytes match.

## 2026-11-05 per-desk open-window shortcut tabs — current

User requested bottom shortcuts for open screens by major category. Each desk now has a compact bottom strip containing only its currently open functions (number/command; accessible full title). Clicking raises an existing pane, including one covered by another maximized pane; it does not open duplicates or remount surviving charts. Window focus and close synchronize active/remove state. Arrow keys/Home/End navigate; mobile overflows horizontally and reveals the selected pane. One-function identity, manual geometry and screen-only persistence remain unchanged. Shared UI 0.4.1 owns styles; local workspace owns entries/focus/lifecycle.

Validation: public UI suites, Pages boundary/assets and Python 37 passed; workspace regression covers active state, keyboard, maximized switching, close and desk isolation. Actual Chromium passed desk isolation, open/close/reload tab synchronization, active focus, covered/maximized pane switching, keyboard Home, retained native chart canvas and desktop/mobile no horizontal overflow. Release 0f583e805ac6b48d752e508c812a9e3a156a0c63 passed [Actions 41955382301](https://github.com/claudelove/trade_monitor/actions/runs/41955382301) and deployed. Live workspace, common panel CSS and shared version bytes match. Consumer-specific evidence remains in its own repository.

## 2026-11-05 guide-based terminal chrome / GP search fix — current

User-supplied student guide: all 28 pages / 31 embedded images reviewed. Shared UI 0.4.0 / API 1 applies navy reading surface, red function bars, amber editable fields, gray controls, thin window boundaries and blue selected results. See docs/TERMINAL_STYLE_GUIDE.md; Bergoom and actual domestic HTS chart semantics remain. The manual PDF/images are not added to this repository.

GP previously had repeatable:true and every execution created another chart; old layouts could restore multiple copies together. One function per desk now reuses/raises its existing pane; legacy duplicates consolidate without retiling. Incremental window chrome preserves surviving chart DOM on reuse/add/close/maximize. Explicit symbol/source changes remount only the affected pane.

One persistent shell command/SCREENS directory replaces per-desk search and the static HELP dialog. Number/command/name/desk/alias/legacy-number search, exact-match ranking, explicit choice precedence, Escape/Tab/focus dismissal, IME/held-Enter guards and unknown queries are covered. Removed duplicate header shortcuts, hidden heading/layout placeholders, unused widgets action/state, repeatable/reset/minimize remnants and obsolete toolbar CSS. Private source/account/API policies remain outside this visual update.

Local checks: public Python 37; both nine-suite UI contracts, public Pages boundary/assets, consumer asset syntax. Actual Chromium reviewed screenshots and all 29 public numbered screen routes twice without duplicate/mount exception/network writes; repeated GP keeps its native canvas, saved duplicate layouts migrate, real drag/resize/double-click, keyboard/global search/no-match/Korean query and mobile checks passed. Consumer-specific checks/CI evidence remain in its own handoff. Release ada0c12b9551a056c5096139997d4401ac16d587 passed [public Actions 41953050786](https://github.com/claudelove/trade_monitor/actions/runs/41953050786) and deployed. Live app/workspace, shared search/gesture/theme/CSS/version bytes and version.json commit match. Actual held Enter was verified to open one GP without repeated title maximize.

## 2026-11-05 manual windows and screen search — current

User requested removal of automatic layout and the full numbered toolbar. Common UI 0.3.0 / API 1 provides normalized pointer/keyboard move/resize gestures, bounds, cancellation and disposal. Public application preserves existing pane geometry on add/close, opens new panes with a small overlap, saves geometry per desk, and keeps maximize/restore/close. Titles show their function identity; the old function dropdown and workspace reset button are removed. SCREENS / Search lists registered screens across desks with number/command/title/alias/desk filtering, keyboard selection, Escape and focus return. It uses existing application routing, not new business APIs. Mobile remains stacked.

Validation: public Python 37 tests, nine UI suites, Pages boundary/asset checks passed. Actual Chromium verified drag, real native-chart resize without remount, maximize/restore, geometry reload, close without reflow, cross-desk search routing, no-match/Escape and mobile no horizontal overflow. Public snapshot/private-operation boundaries remain unchanged. Release d7df77a8d740ec11c8436ef2f4f31dca465b0f0a passed [public Actions 41950003665](https://github.com/claudelove/trade_monitor/actions/runs/41950003665) including deployment. The live Pages app, workspace adapter, shared gestures/CSS and version bytes match this release.

## 2026-11-05 Bergoom and HTS chart presentation — released

Common UI 0.2.0 / API 1 defaults to self-hosted Bergoom Regular/Semibold/Bold/Italic, the user-selected OFL Bloomberg-inspired alternative. Original font bytes, source provenance and copyright/OFL notices are preserved. This is not Bloomberg Prop or Neue Haas. Code editors retain IBM Plex Mono.

The module provides LAST SOURCE / prior-observation Δ BAR, trailing MA5/20/60 values, red/blue OHLC/volume, keyboard inspection/zoom/Home/End/Escape, missing-time LINK clearing, display-only integer-price precision and resize viewport/volume retention. Source values and clock precision are preserved. Application screen numbers, APIs and financial logic remain outside this visual module.

Public release 217feb40f8f917ef27fb91c6ac34713dd9bed6c1 passed public Actions 41943056266 and deployed. Deployed font, CSS, chart helpers and OFL text match local bytes. Public Python 37, nine UI suites, actual Chromium Bergoom glyph identification, source OHLCV and native chart/keyboard/mobile checks passed. Consumer-specific commits and integration evidence are kept only in the consumer repository's handoff. Use docs/SHARED_UI.md to update the pinned dependency.

## 2026-11-05 shared presentation/interaction dependency — current direction

Public packages/terminal-ui owns the common typography, styles, chart engines and input/lifecycle primitives. Consumer applications own their framework, numbered functions, APIs and financial policies. Use docs/SHARED_UI.md and terminal-ui.lock.json; update the pinned UI package rather than copying complete applications.

The public package version is 0.1.0 / UI contract 1. Public commit b9f883ad4021ff5e5e2b3055ece6ff754d9b77cd passed public Actions 41933965746 and is deployed; shared JS/CSS/version bytes were verified. Public Python 37 tests, the preview boundary, manifest/update guards and UI contracts passed. Stable adapters preserve the application-facing imports; the visual contract has no screen-number dependency.

The user's direct approval resolves the earlier permission question for the prepared scoped consumer update. Store consumer-specific commits, integration test evidence and execution details only in that consumer's own handoff. Do not reproduce private metadata or source in this public record. The approval does not authorize unrelated engine changes or private data/source publication.

## 2026-11-05 UI-only upstream import — current direction

User authorized importing the integrated private terminal UI unchanged into public trade_monitor/work. UI source is pinned to 7f3130426056f7215f303738ead80eec7b9b8af7; docs/UI_UPSTREAM.json records file hashes. Six English desks, terminal font, independent panels, native Lightweight Charts, authoring/review/analytics/execution/admin screens replace the old public UI. This explicit snapshot request supersedes earlier four-desk/system-font/no-authoring-button product instructions for the imported UI.

Only frontend assets, third-party licenses/provenance and generic synthetic UI tests are included. No private engine/strategy/configuration/registry/runtime/account data or Git history is imported, and no private push is made. docs/UI_SYNC.md defines the update boundary. Public Pages uses pages-preview.js with existing public snapshot and empty accounts/runs; server operations are rejected before fetch. Non-Pages engine-client preserves the same-origin private API contract. Public Python runtime-v1 backend remains legacy and does not implement that contract.

Local validation: Python 32; seven imported UI contract suites; Pages boundary/upstream byte parity/license/private-data checks; actual Chromium native canvas OHLCV against public bars, line/candle/MA, six desks, evidence dialog, no private API/POST requests, 390px responsive passed. The user-visible UI remains the upstream implementation. Only app preview labels, engine-client preview boundary and generated catalog differ; tests check parity of all other imported assets.

Deployment confirmed: 5a46642fc1aba3830b760e2cd09d59595d6c4ea3; Actions 41929231779 test/build-pages/deploy-pages success. Public version.json matches; deployed preview boundary, chart/vendor/font/license bytes match local files; private runtime lists remain empty. Public work only. Documentation-only follow-up skips CI.

Further edits should start from the pinned integrated UI and preserve the source-only publication boundary. Do not automatically copy private engine functionality. See docs/UI_SYNC.md.

## 비공개 서버 운영 전제 UI 최소화 — 2026-11-04

완료: 결과 파일 열기/닫기·파일 input·형식 예시·합성 예시·데모 선택·수동 수집·위젯 구성·배치 편집/정렬/리셋·차트 SVG·CSV·빈 공시의 데모 안내 버튼을 제품 UI에서 제거했다. 네 작업공간/내부 소화면·전략/종목 선택·검색·창 최대화/닫기·OHLCV 호버는 유지한다. 배치는 자동 분할이며 추가 편집 모드는 없다. 일반 글꼴, 검정 바탕, 어두운 선택창, 주황 활성 메뉴, 작은 사각 버튼/제목줄로 정리했다. 파일/예제 소비 함수는 기존 합성 계약 테스트를 위해 내부에 남아 있지만 화면 action으로 노출하지 않는다.

검증: Python 32개, UI/Pages/차트 계약 모두 통과. 실제 로컬 Chromium에서 네 공간별 제거된 버튼/input 부재, 실제 공개 일봉 첫/중간/마지막 OHLCV, 최대화·닫기·재열기, 390px 각 공간 넘침 없음과 pageerror 0을 확인했다.

다음 작업: 비공개 엔진의 읽기 API를 인증된 서버 경유로 연결하고 인증/호스팅을 정한다. 아직 비공개 웹사이트를 구축/배포하지 않았고 로그인/실시간 조회/전략 추가·실행도 미구현이다. Pages는 공개 시장 스냅샷 미리보기만 유지하며 개인 자료/비밀은 넣지 않는다. 비공개 레포 수정/푸시 금지. UI에 파일 버튼이나 예시를 다시 넣지 않는다.

배포 완료: a8865edbc862f8d95b2e443fc8623a35be82db3b / Actions 41791491614 test·build-pages·deploy-pages success. 공개 version.json SHA 일치, index의 파일/수집/구성/데모 선택 UI 부재, 공개 runtime-state 전략/실행 0건 확인. 공개 work에만 푸시했으며 비공개 호스팅/인증/API 연결은 위 다음 작업으로 남는다.

## 2026-11-04 필수 작업공간으로 간소화 — 최신 기준

사용자 지적에 따라 상위 탐색을 포트폴리오/마켓/백테스트/통계·데이터 네 개로 줄였다. 각 공간 내부 소화면 메뉴와 모듈은 유지한다. 포트폴리오 기본은 성과·보유·리스크·기여도이며 체결/원장은 필요할 때 연다. 마켓은 뉴스·가격·공시·저장 공시, 통계는 상관/중복·보고 상태·출처다. 백테스트는 외부 전략 연결/미연결 실행 환경/결과 검토이며 실제 전략 추가·실행 어댑터는 구현하지 않았다. 실행되는 듯한 버튼은 없다.

중복 작업공간 탭·개별 화면 상위 메뉴·창 전체페이지 전환/최소화 버튼을 제거했다. 배치 편집/예시/파일 관리는 접고 차트 보조 도구도 더보기에 둔다. v3 배치로 기본 화면을 새로 구성하고 고정 배치에서 창을 닫으면 재정렬한다. UI 기능은 소화면 모듈, 프레임은 선택/배치만 담당한다.

실제 오류: data-runtime-refresh가 closeReport를 호출해 개인 파일을 지웠던 바인딩을 refreshReport로 수정했다. 새로고침은 파일을 유지한다. 새 파일은 명시적 결과 파일 열기로 교체한다. 새로고침 후 선택 결과 유지 회귀 검사를 추가했다.

차트 포인터 계산을 실제 봉 중심 간격과 일치시키고 차트 내부 날짜/OHLCV 툴팁을 추가했다. 기존 하단 작은 readout만 있던 상태를 개선했다. 키보드 커서에도 툴팁을 표시한다. 원본값/미보고·일자 정밀도 경계는 보존한다.

검증/배포: 로컬 Python 32개 및 UI/차트·Pages 검사, 실제 Chromium 네 공간 전환·소화면·파일선택/닫기·공개 005930 첫/중간/마지막 OHLCV 원본 일치·선/캔들/확대/리셋/내보내기·저장 공시·390px 각 공간 넘침 없음 확인. 푸시 후 원격 배포 결과는 아래 기록을 기준으로 확인한다. 비공개 저장소에는 쓰기/푸시하지 않았다.

배포 완료: 기능 커밋 **7c1cc4e21206651c48f76d2ceb06b7981d75ce58**, Actions **41784080301** test/build-pages/deploy-pages success. 공개 version.json SHA 일치, 신규 작업공간/화면/차트 자산 HTTP 200, 공개 runtime-state 전략/실행 0건 확인. 실제 Chromium 조작 검증은 로컬 정적 빌드에서 수행했다. 공개 URL Chromium 재검사는 환경의 인증서 신뢰 오류로 미완료이며 HTTPS Python 조회는 정상 검증했다. 배포 기록 후속 문서 커밋은 CI를 생략한다.

## 최신 사용자 결정

**최신 구조 지시: 번호별 화면 모듈과 공통 인터랙티브 차트로 전면 정리했다. web/screens에 19개 모듈, registry/catalog가 메뉴·명령·창 목록/기본 배치와 수명을 관리한다. 신규 화면은 모듈 추가+catalog 재생성으로 확장한다. docs/SCREEN_MODULES.md 및 CHART_MODULE.md 필독.**

**최신: 전략 중심 STRATEGY와 종목 중심 MARKET을 분리한다. PORTFOLIO/STRATEGY 선택이 분석 패널 전체에 공유된다. 기본은 PERF/HOLD/RISK/EXEC이며 ATTR/CORR/HEALTH를 추가한다. 더 선명한 Bloomberg 참고 색상 적용. docs/STRATEGY_MONITORING.md가 현재 화면·분석 기준이다.**

**최신 구체화: 비공개 엔진 응답을 기준으로 공개 대시보드가 맞춘다. 기본 화면은 4개 분할 패널/패널별 기능 선택과 저장된 배치이며 배치 편집에서만 이동/크기 조절한다. 자유창만으로 Bloomberg 기본 UI를 설명했던 것은 정정했다. docs/NATIVE_REPORTS.md와 TERMINAL_WORKSPACES.md 참고.**

**최신 역할 분리: 비공개 저장소는 데이터 관리·전략·실행·계좌 업무, 공개 trade_monitor는 모니터링 화면·조회 어댑터를 담당한다. 비공개 쪽 모니터링 작업을 읽어 이어가되 커밋·푸시는 공개 work에만 한다. docs/REPOSITORY_BOUNDARY.md 필독.**

**최신 추가 지시: 이벤트 중심에서 종합 시장/운영 터미널로 확장한다. 지정된 비공개 레퍼런스의 문서·화면을 읽었으며 구조만 참고하고 원문/소스/전략 자료는 공개 저장소에 복사하지 않았다. docs/TERMINAL_WORKSPACES.md가 현재 화면 기준이다. 외부 코드 소유 경계는 유지한다.**

**2026-11-04 최종 방향: 시스템은 외부 전략 코드를 연결하는 모니터링 대시보드다. 전략 코드가 리스크·신호·주문 방식·백테스트/실행 전부를 소유한다. 대시보드에 전략 정책을 내장하지 않는다. 사용자 제공 예정 docs를 받으면 실행 어댑터를 맞추며, 현재 구현은 관측 인프라다. 최신 규격은 docs/STRATEGY_INTEGRATION.md다. 이전 연구 플랫폼 제안은 현재 구현 지시가 아니다.**

2026-11-04: 첨부 Bloomberg 매뉴얼을 참고해 전체 프로젝트를 재점검했다. 사용자의 핵심 목표는 에이전트가 모든 기능/데이터에 접근해 전략 가설·검증·자동화를 수행하는 것이다. 다음 개발은 데이터 근거/시점/정정·공통 기능 계약·재현 가능한 연구 기록을 우선한다. 상세 기준: docs/PROJECT_REVIEW_2026-11-04.md.

이벤트 트레이딩 리서치 앱을 확인하며 수정하는 동안 별도 도메인·GCP·Render 없이 GitHub만 사용하고 싶다고 요청했다. GitHub Pages + Actions로 전환한다. GCP 프로젝트 ID는 krx-dashboard-513607이지만 배포는 보류하며 자원을 생성하지 않았다.

## 저장소와 현재 상태

- 저장소 https://github.com/claudelove/trade_monitor, 작업 브랜치 work. main은 초기 커밋이며 자동 병합하지 않는다.
- 최초 기능 5fa9d8c, 복구/Docker 기준 96b2ed6.
- **배포 주소: https://claudelove.github.io/trade_monitor/**. 2026-11-04 최신 외부 전략 모니터 배포 HTTP 200 확인.
- 확인된 최신 기능 배포 커밋: 10d576ac4c6f50f3e494ba60409d7cbf453725e9. version.json과 일치. CI 실행 41780865100의 test/build-pages/deploy-pages 성공. 후속 배포 기록 문서 커밋은 [skip ci]로 저장한다.
- 작업 도중 관리형 클라우드 실행 환경이 unavailable로 바뀌어 GitHub API로 0896489를 저장했다. 이후 환경 연결이 복구돼 로컬 draft를 stash 보존하고 원격 0896489로 fast-forward 했다.
- 사용자가 Pages Source=GitHub Actions 및 github-pages 환경 허용 브랜치 work 설정을 완료했다. 현재 자동 Pages 배포 정상 동작.
- repository default branch가 main이면 workflow_dispatch 수집 기능을 위해 work로 변경하거나 향후 명시적으로 워크플로를 main에 반영해야 한다. 기본 브랜치를 자동 변경했다고 가정하지 않는다.
- DART key의 Actions secret 이전은 미완료. 자동 승인 심사가 해당 키/목적지에 대한 명시적 허용 부족으로 전송을 거절했다. 사용자에게 별도 허용을 요청했으며, 사용자는 키 유출 위험을 질문해 답변한 상태다. 질문을 전송 허용으로 간주하지 않는다. 기존 화면/백테스트는 키 없이 공개 스냅샷만으로 동작한다.

## 기능

현재 기능: 공시·뉴스·가격 조회, 검색·필터·CSV·관심 목록·위젯, 문서 유형 분류, 외부 전략 코드 메타데이터와 실행 결과 모니터링이다. 내장 전략 라이브러리·M&A 계산·고정일 백테스트 UI는 제거했다. 전략 정책과 실행은 외부 코드 소유다.

Pages에서는 web/static-api.js가 공개 시장 JSON과 비어 있는 runtime-state를 읽는다. 개인 결과 파일은 탭 메모리에서만 연다. scripts/build_pages.py는 정적 산출물을 만들며 Python 서버는 실행하지 않는다. 과거 연구 계산은 호환 테스트 자료로만 보존하며 /api/backtest는 종료했다.

수집 Actions는 입력을 환경 변수와 subprocess 인수로 전달한다. 사용자 입력을 쉘 코드에 삽입하지 않는다. 수집 결과는 공개 필드만 선별하고 키 포함 검사를 거쳐 커밋한다. 별도 정기 수집 스케줄은 없다.

## 보존 데이터/비밀

- fixtures/bootstrap-live.json: 502개 공시, 74개 뉴스 후보, 12종목 264개 수정 일봉. 기준 2026-11-03, 공시 56건 가격 연결.
- pykrx 수정 일봉은 NAVER 경로다. KRX 직접 인증 성공이 아니다.
- 키·개인 데이터는 공개 페이지/스냅샷/커밋에 포함하지 않는다. DART 수집 키는 repository Actions secret DART_API_KEY로 설정한다.
- 운영 SQLite와 work/는 Git 제외. 임시 실행 환경의 DB가 사라져도 공개 기준 스냅샷은 GitHub에서 복원할 수 있다.
- 관심 목록/위젯은 브라우저 localStorage이며 서버 계정 간 동기화하지 않는다.

## 검증 상태

- 96b2ed6: Python 18개·UI DOM·컨테이너 인증/PORT·빈 볼륨 복원·재시작 보존 검증 완료. 해당 GitHub CI success 확인.
- Pages 변경 0896489: GitHub Actions run 41601438353에서 Python 18개, UI DOM, Python/브라우저 백테스트 비교 720개, 이벤트 연구 556개 및 Pages UI/정적 API/상대경로 검사 통과. build-pages도 성공했다.
- 최초 Source 설정/환경 브랜치 제한으로 배포가 실패했으나, 사용자가 두 설정을 완료한 뒤 41602592661에서 배포 성공. HTTP 및 공개 데이터 수신 확인.
- 실제 브라우저 시각 검증 미수행. 지원되는 브라우저 도구가 없었다.

## 다음 행동

1. 최신 번호별 모듈/공통 차트 화면(10d576a)의 사용자 피드백을 반영한다. 비공개 실행 엔진 연결 시 전략/계좌 범위·단위·시각 계약을 먼저 맞춘다. 현재는 관측 인프라만 연결돼 있다.
2. 코드 수정 시 test/build-pages/deploy-pages 및 version.json 커밋을 확인. 계정 Pages 설정은 완료돼 다시 요청할 필요 없음.
3. 필요 시 기본 브랜치 work 설정과 Actions secret 등록 후 수동 수집 확인.
4. 화면 피드백 → 관련 테스트 → 인계 갱신 → 커밋·푸시를 유지한다.

## 계정 설정 결과 (2026-11-03)

Pages Source=GitHub Actions 및 환경의 work 브랜치 허용은 사용자 설정으로 완료됐다. Repository default branch는 main 그대로다. 수동 수집 workflow_dispatch와 DART Actions secret은 별도 설정/명시적 허용이 필요하므로 현재 완료됐다고 말하지 않는다. 사이트 열람·기존 스냅샷·백테스트에는 필요 없다.

## 최신 화면 변경 (2026-11-03)

사용자 요청으로 Bloomberg Terminal 스타일의 검정/주황/청록 테마로 변경했다. 상단 가로 메뉴, 모노스페이스, 사각 테두리, 촘촘한 표와 고정 헤더·내부 스크롤, 차트 색상을 적용했다. Catalyst 명칭과 기존 기능을 유지한다.

공시 분류는 monitor/strategies.py의 제목 정규화+키워드 최초 일치 규칙이다. 본문/금액/조건 파싱이나 복합 이벤트 다중 분류가 아니다. 이번 요청에서는 테마만 수정했고 분류 규칙과 분석 계산은 변경하지 않았다.

테마 변경 검증: JS 구문·UI DOM·Python/브라우저 백테스트 비교 720개·이벤트 연구 556개 및 Pages 정적 API/경로/UI 검사를 통과했다. 실제 브라우저 시각 검증은 수행하지 않았다. 배포는 work 푸시 후 GitHub Actions 결과와 version.json으로 확인한다.

테마 배포 결과: CI 41603727268 성공, version.json=fa76a9f, 공개 HTML의 CATALYST TERMINAL 및 새 CSS의 주황색/48vh 표 스크롤 규칙 수신을 확인했다.

## 레퍼런스 반영 — 최신 테마 요구 (2026-11-03)

사용자가 제공한 표 중심 레퍼런스를 기준으로 장식을 더 줄였다. 사용자는 검정 배경·차분한 회색 글자를 명시적으로 선택했다. 카드/표/태그/입력창 테두리, 메뉴 번호·로고 배지·장식 아이콘, 주황/청록 강조를 제거했다. 헤더와 숫자를 작게 조정하고 중립 회색 계층을 사용한다. 수익률 글자도 회색이며, 방향은 옅은 녹색/적색 셀 배경과 부호로만 구분한다. 차트도 저채도 회색 선이다.

이번 변경은 web/style.css와 차트 색상만 수정했고 기능·데이터·분류·백테스트 계산은 유지했다. JS 구문/기존 UI DOM 검사를 실행하며, work 푸시 후 GitHub CI/Pages 및 version.json·배포 CSS로 결과를 확인한다. 실제 브라우저 시각 검증을 수행했다고 주장하지 않는다.

간소화 배포 확인: bf8bd40의 원격 검사/Pages 배포 후 공개 version.json 일치, index HTTP 200, 회색 기본 글자와 장식 테두리 없는 새 CSS 수신을 확인했다.

## 일반 글꼴·기능 중심 포인트 (2026-11-03)

최신 사용자 요청: 채팅처럼 평범한 글꼴을 사용하고 레퍼런스의 포인트 컬러를 가시성에만 활용한다. 기존 모노스페이스를 시스템 산세리프(-apple-system/Segoe UI/한국어 시스템 글꼴 등)로 교체하고, 본문/표/보조 글자의 작은 크기를 소폭 키웠다. 선택된 탭·선택 조건·주요 동작·저장된 관심 표시 및 종목 차트 선에만 절제된 주황을 적용한다. 본문은 회색, 카드/태그 테두리와 장식 아이콘은 계속 없다. 차트 면적 그라데이션을 제거하고 숫자는 tabular-nums 정렬을 유지한다. 분류·데이터·계산 로직은 변경하지 않는다.

일반 글꼴/포인트 변경 배포 확인: CI 41629452456 검사 통과, 공개 version.json=0284fb7, 시스템 글꼴 스택/주황 선택 포인트 CSS 수신 및 차트 면적 그라데이션 제거를 확인했다. 배포 기록 문서 커밋은 CI를 생략한다.

## 전체 재점검 결과 (2026-11-04)

- 검토 기준 코드 d18dda1. 공개 배포는 0284fb7을 HTTP로 확인했다.
- 첨부 PDF 2개 본문/관련 화면 검토. PDF·전문·이미지는 work/에만 두고 공개 저장소에 올리지 않았다.
- Python 18개·기존 UI DOM·Python/브라우저 비교 720개·이벤트 연구 556개 통과. 독립적인 재현 사례에서 별도 문제가 확인됐으므로 테스트 통과를 금융적 정확성 보장으로 해석하지 않는다.
- 주요 확인: 미래 거래정지로 과거 진입 거래를 제외, 가격 공백을 건너뛴 진입, 비거래 출구의 이벤트 수익률, 실패 갱신의 상위 시각/원천 이력 부족, 제목 분류의 취득/처분 혼동, Pages 실행 API 부재.
- scripts/audit_readiness.py는 합성 입력/임시 DB로 현재 문제를 재현한다. 종료 0은 재현 성공이지 문제 수정/검증 통과가 아니다. 출력은 work/audit/reproductions.json.
- docs/agent-capabilities.proposed.json은 14개 기능의 **설계 전용** 입력 스키마 초안이며 애플리케이션에 연결하지 않았다. JSON Schema 검사 통과.
- 실제 기본 브랜치 main 확인. secret 목록 조회는 403이라 DART Actions secret 존재를 확인할 수 없었다. 이전에 보류된 키 이전을 다시 시도하지 않았다.
- 이번 커밋은 점검/설계/재현 도구만 포함하며 운영 UI·분류·계산·자동화 설정은 수정하지 않았다.

다음 구현 순서: (1) 원천/스냅샷/시점/품질 계약과 재현 결함의 정상 정책 회귀 테스트 → (2) 공통 읽기 서비스/기능 카탈로그/에이전트 어댑터 → (3) 가설·실험·평가 기록 → (4) 동일 기능을 여는 종목 연동 패널 → (5) durable job과 제한된 자동화. 창 번호/시각적 복제부터 확대하지 않는다. 데이터 없는 Bloomberg 기능은 요구 조건·미지원 이유를 표시한다.

## 외부 전략 모니터 인프라 구현 (2026-11-04)

- monitor/integration.py: artifact 등록, complete run snapshot 수신, 최신 상태·append-only 관측 이력, 원자적 bundle import, 중복/역순/버전·해시 충돌 검사. 외부 코드는 실행하지 않는다.
- monitor/client.py: 인증된 비공개 HTTP 보고/조회 클라이언트. CLI schema/validate/import/state와 OpenAPI 경로 제공.
- schemas/strategy-runtime-v1.json: 실제 모델과 일치 검사하는 관측 계약. 전략 실행 ABI는 사용자 docs 대기.
- UI 전략 코드/실행·결과: 외부 지표·리스크·포지션·주문·체결·평가액·로그. 개인 결과 JSON은 현재 탭에서만 읽고 서버/localStorage에 쓰지 않는다.
- Pages 산출물은 runtime-state를 항상 빈 상태로 생성한다. 가상 JSON은 다운로드 예시이며 실제 등록 전략으로 자동 표시하지 않는다.
- 내장 전략 라이브러리/현금 M&A 계산/고정일 롱온리 실행 폼과 정적 가설 문구 제거. /api/backtest는 410으로 종료. 이벤트 상세의 내장 가정 수익률도 제거했다.
- monitor/event_types.py는 문서 유형일 뿐 전략이 아니다. monitor/strategies.py는 과거 연구 예제 테스트용 호환 import. 과거 금융 연구 모형 문제를 수정한 것은 아니며 현재 전략 실행에는 사용하지 않는다.
- 비공개 API는 코드 ID·버전·해시만 보관한다. code_ref를 다운로드/실행하지 않고 해시는 외부 보고 값임을 표시한다. 실제 실행/주문 제어 채널은 미연결이다.
- GCP/Render 배포, 브로커 연결, DART key 이전은 수행하지 않았다.

다음 작업: 사용자가 첨부할 docs에서 전략 코드 패키징·실행 진입점·백테스트/실거래 인터페이스·콜백 규약을 읽고, 이 관측 계약에 얇은 어댑터로 매핑한다. 대시보드에 별도 risk/entry/exit/order 정책을 추가하지 않는다.

외부 전략 관측 인프라 검증: Python 32개 통과(버전 불변·중복/역순·원자적 롤백·미인증 쓰기·코드 미실행·공개 산출물 개인 자료 제외 포함), 기존 UI DOM 및 Pages 파일 검증/패널/XSS/분리 검사 통과. 과거 연구 예제의 Python/JS 비교 720개와 이벤트 연구 556개도 보존해 통과했다. JSON 형식 예시의 CLI validate 통과.

배포 검증: GitHub Actions 41743580578 성공. 공개 version.json이 7002b82 전체 SHA와 일치하고, 새 메뉴·runtime UI/validator 모듈·계약/예시 JSON이 HTTP 200이다. 공개 runtime-state의 strategies/runs는 각각 0건이다. 실제 브라우저 시각 검증·외부 전략 실행·실주문은 수행하지 않았다.

## 종합 터미널 재구성 (2026-11-04)

- 기본 화면 OVERVIEW: 종목 표본·캔들·뉴스·선택 실행 요약·공급자 상태. 공시는 FILINGS로 분리.
- MARKET/SECURITY/NEWS/RISK/ACCOUNT 및 공통 SECURITY/RUN 선택. OV/MKT/GP/TOP/FIL/ORD/RISK/STRAT/ACC/DATA 명령과 /·1–9 탐색. REFRESH는 저장 상태 조회.
- web/terminal-ui.js의 읽기 전용 화면 모듈과 기존 runtime 모델 사용. 20B/60B/ALL 캔들·봉 OHLCV·종목 뉴스/공시 연동. 늦게 도착한 이전 데이터 모드 요청은 무시.
- 시장 전체 통계·타 자산군·계좌 장부/대사/합산·비공개 레퍼런스 실행 엔진 연결은 미구현이다. 레퍼런스 on_bar 문서도 읽었지만 사용자 지정 실행 책임과 차이가 있어 자동 호환/실행을 주장하지 않는다.
- Python 32개, UI/Pages 회귀 검사 통과. 로컬 Chromium 1440px/390px에서 명령·공통 종목·20봉·뉴스·개인 결과 JSON·리스크·overview 확인, JS pageerror/문서 가로 overflow 없음. 캡처를 직접 확인했다. 개인 JSON과 캡처는 work/에만 보존하며 커밋하지 않는다.

종합 터미널 배포 확인: CI 41747207679 성공, 공개 version.json=5f6ed816c6cac9f0eadb4f9104be7a95e9040eb2, 새 메뉴·terminal-ui/app 모듈 HTTP 200. 공개 runtime-state 전략/실행 0건 확인. 배포 기록 문서 커밋은 [skip ci]로 보존한다.

## 저장소 역할 분리와 인계 확인 (2026-11-04)

비공개 저장소의 최신 HANDOFF·TerminalService·HTTP 조회 라우트·결과 저장·계좌 화면 계약을 읽었다. 읽기만 했으며 비공개 저장소에 커밋/푸시하지 않았다. 원문/소스/개인 자료를 공개 저장소에 복사하지 않았다.

공개 앱의 /api/runtime 관측 v1과 비공개 계좌/실행/원천 API는 직접 호환되지 않는다. docs/REPOSITORY_BOUNDARY.md에 조회 출발점·형식 차이·계좌 context·동일 publication·출처/시각 조건을 정리했다. 다음 기능 개발은 공개 쪽 읽기 어댑터와 계좌/전략 context 연결부터 이어갈 수 있다. 실제 비공개 서버/DB/계좌 연결은 이번 작업에서 수행하지 않았다.

이번 변경은 문서·작업 규칙만 포함한다. 기존 5f6ed81 배포를 유지하며 UI/API 구현을 새로 했다고 보고하지 않는다. 문서 경로와 diff 검사를 수행하고 [skip ci] 커밋으로 공개 work에 푸시한다.

## 분할 패널·원본 결과 소비 구현 (2026-11-04)

- WindowWorkspace: 기본 4개 분할 패널, 패널별 기능 선택, 편집 잠금, 이동/크기 조절, 최소화/최대화/복원/닫기, 다중 가격/독립 종목, 정렬·복원, 좌표만 영속 저장, 모바일 세로 배치.
- native-report: 비공개 엔진의 계좌/실행 JSON을 원형으로 현재 탭에 열어 계좌 NAV/손익/기여도/대사·실행 주문/체결/판단/평가·보고 한도/메타데이터 조회. 기존 v1 hash/sequence 필수 값을 강요하지 않는다. 부분 오류 완료 상태 보존, 계좌 자식 소유권/시점 검사, 실패한 파일은 이전 상태를 유지한다.
- 원형 실행을 열면 가격 데이터도 해당 실행의 market 봉만 사용한다. 공개 시장 봉/뉴스/공시와 같은 데이터셋인 것처럼 합치지 않는다. 직접 API 연결/실주문/비공개 푸시는 하지 않았다.
- Python 32개, UI/Pages/새 window/native 계약 검사와 Chromium 드래그·resize·최대/최소·가격 독립 선택·reload 배치 복원·계좌 파일·모바일 검사 수행. 실제 화면 캡처 확인. 합성 fixtures만 커밋.

배포 확인: CI 41751488203 전체 success. 공개 version.json=6643906a1c3f6fbac86e97aab64d0ee3e9ea053c, window-workspace/native-report JS HTTP 200. 공개 runtime-state 전략/실행 0건 확인. 검증 기록 문서 커밋은 [skip ci]로 저장한다.

## 전략 중심 워크스페이스 및 진단 (2026-11-04)

- strategy-analysis/strategy-ui: 원본 계좌/실행을 수정하지 않고 성과·낙폭·비연율 변동성·같은 시각 종가/승수의 명목·집중도·수량 체결률·전략 동행/중복·상태를 분석한다. 계좌 NAV/PnL/기여도는 재합산하지 않는다.
- 여러 native 파일을 탭에 열어 포트폴리오를 전환. 한 계좌의 전략 선택/기여도 행 선택이 모든 전략 패널을 갱신한다. 자식 미포함은 상세 원천 미보고. 별도 엔진 계층/API 변경은 없다.
- MARKET만 ticker/source를 표시. 공개 시장과 선택 전략 저장 봉은 명시적으로 선택. 두 workspace의 배치는 v2 별도 키로 저장, 개인 결과/선택은 저장하지 않는다.
- 색상 주황/황색/청록/녹색/적색 대비 강화, 시스템 글꼴 유지. 합성 분석 예시는 버튼으로만 열고 배너에 표시. 실제 성과/백테스트가 아니다.
- Python 32개, UI/Pages/분석 edge 사례 검사, Chromium의 공유 전략/기여도/포트폴리오 전환·워크스페이스/출처/배치 분리·모바일/비공개 메모리 격리 확인. 스크린샷 직접 검토. 실제 계좌/HTTP/브로커 연결은 수행하지 않았다.

전략 중심 배포 확인: CI 41774974015 전체 success. 공개 version.json=b4e3c844756f1873cbf9f206d58d8b9e67dcd7a0, 포트폴리오/전략·마켓 메뉴/새 분석 JS HTTP 200. 공개 runtime-state 전략/실행 0건 유지. 검증 기록 후속 문서는 [skip ci]로 저장한다.

## 번호별 모듈·공통 인터랙티브 차트 (2026-11-04)

- 전략/마켓/공시 상세 19개 번호 모듈. app.js의 화면별 switch/뷰/명령 목록 제거. catalog 파일 검색 생성, 중복/버전/파일 번호 검사, 하위 JS/CSS 공개 자산 빌드. 전략 UI는 화면별로 분리하고 이전 함수 export만 호환 유지.
- ChartModel/TerminalChart/ChartLinkBus/host: line/candle/volume·다중 시리즈/좌우 축·범위/팬/줌·커서·LINK 시각/구간·단독 SVG. 0101/0103/0110/0202/0204/0290 차트가 공통 모듈 사용. 데이터 문맥별 메모리 viewport와 수명 관리.
- 원본 배열/숫자/결측을 수정하지 않으며 null/없는 시각의 선은 끊는다. 날짜만 있으면 정확한 시각 미제공. 계좌/전략/원천/종목으로 chart group을 분리하고 부재 시각을 보간하지 않는다.
- 새 계약 검사: 임시 모듈 추가가 기존 코어 수정 없이 메뉴/번호/패널에 반영, 충돌/실패한 mount 이벤트 해제, chart subscription cleanup·dual axis·gap·viewport·원본 불변.
- Python 32개, UI/Pages/새 chart-registry 검사와 실제 Chromium 번호 호출/선·캔들/volume/커서·구간 연동/휠·포인터·키보드/SVG 다운로드/날짜 precision/문맥·닫기/mobile 검증. 화면 캡처 직접 확인. 비공개 저장소/엔진/실주문 변경 없음.

모듈/차트 배포 확인: CI 41780865100 전체 success, 공개 version.json=10d576ac4c6f50f3e494ba60409d7cbf453725e9. catalog의 화면 19개와 공통 하위 자산 합계 26개 HTTP 200 확인. 공개 runtime-state 전략/실행 0건 유지. 인계 기록 문서 커밋은 [skip ci]로 보존한다.

## 2026-11-07 — Managed universe frontend

Added UNIV 0412 (35 numbered modules), editable saved/default pool, exact-cap
preview, explicit master refresh and revision/default CAS. CODE now accepts
research conditions and a managed-universe manifest; removed normal dataset
selection, added explicit legacy-policy conversion and durable automatic research
progress/cancel/result routing. Review invalidates on condition/source/default
changes. Public Pages still blocks every protected operation. Common UI 0.7.0
unchanged. See UNIVERSES_UI.md; the separately reviewed universes-1 frontend
manifest is the private host import contract. UI DOM 14 suites and Pages boundary
passed locally. No private backend or runtime payload is included in this commit.

## 2026-11-08 frontend audit

Reviewed real protected host screens while preserving public source ownership.
Fixed UNIV poll selection loss, inability to recover loaded CAS via explicit
reload, NEW RULE retaining old data, stale member previews, and edits during save.
Added regression coverage for polling vs reviewed revisions, explicit reload,
new-rule identity, pending locks and disposal. No server policy/CAS is weakened.
App command success clears old error tooltip; toast callback no longer queries a
closed document or hides a newer toast on an older timer. Common UI0.7 unchanged.
Both 14-suite UI runs and public 37 Python/Pages checks passed during audit.
Release universes-2 pins the five reviewed screen/style/template files. Private
engine/credential/OMS/account data is not in this public commit.

## 2026-11-11 — Remove non-operational UI functions

User requested removal of useless UI. Removed static READY0406 and separate
unconnected event-paper OMS0503 from source/catalog/search/commands. Registry
tombstones retain only retired IDs for geometry migration; saved layouts drop
those panes without resetting survivors. DATAFLOW no longer duplicates managed
universe research with a manual ticker/date history form; recording review,
request provenance and worker checkpoints remain. Corrected obsolete dataset
selection guidance by replacing it with UNIV -> CODE automatic selection. No
backend endpoints, engine policies, account data or shared UI package changed.
Release docs/releases/cleanup-1.json is the explicit reviewed consumer scope.
UI14 suites passed locally; retirement aliases and survivor geometry tested.

Validation: all14 UI suites, Pages privacy/assets boundary and37 public Python
tests passed. Python backend checks used an isolated temporary test environment;
no production dependencies or configuration were changed. Browser/private-host
verification is recorded by the consumer, not as a public deployment claim.

## 2026-11-11 — Protected KIS DEMO control screen

BROKER0504 owns explicit version/cohort/capital/risk preparation, exact reviewed
apply, separate DEMO start/pause/stop/flatten requests, actual worker/readiness,
owned order states and read-only broker account query. CODE links to BROKER;
existing BLOTTER/FILLS are labelled research history and no longer default panes.
REAL tab is preparation-only: separate bindings, transition-policy preview and
explicit blockers; no real dispatch route. No keys/private strategies/accounts
are bundled. Pages rejects all new writes before fetch. Unsaved settings remain
pane memory only, request identities survive uncertain retries, edits invalidate
review. DEMO remaining-quantity cancellation acceptance is explicitly labelled
and never a live-cancellable-quantity claim. See demo-execution-1 release manifest.

Follow-up button cleanup: CODE no longer exposes standalone VALIDATE (backtest
validates automatically), legacy policy-conversion or redundant universe-reload
buttons. Version/template operations are collapsed; stop/result controls appear
only with an applicable job. BROKER drops duplicate CODE/reload buttons; safety
pause/stop/flatten, exact setup/apply and explicit read-only balance query remain.
Validation:15 UI suites, Pages write/privacy guard and37 public Python checks
passed before publication. No private runtime/code/account data exported.

Final preview gate: BROKER setup/query/actions remain disabled when protected
services are unavailable (including Pages). Execution header is neutral about
research accounts and uses per-function broker clocks; it never calls a stored
research publication a current broker observation. Browser/host operation
evidence remains private.


## 2026-11-12 — Pages navigation to protected terminal

User requested Pages as an entry point to the separately protected terminal,
retaining same-origin frontend/API on that destination. Added one build-time
OPEN PRIVATE TERMINAL link from terminal-entry.json, HTTPS-origin-only, no
credentials/query/fragment/payload. New-tab navigation uses noopener noreferrer
and no-referrer. No automatic redirect/fetch, private code/data/account export,
CORS/authentication change, shared UI update or numbered screen modification.
The protected endpoint restricts access; opening the preview is not authorization.
Domain migration changes only terminal-entry.json in this repository.

Verified15 UI suites,37 Python tests and built Pages boundary suite: exactly one
navigation link and still only one public snapshot fetch, no protected writes.
Actual production deployment and click verification are recorded after completion.

Actual deployment verified: source4772114 / Actions43211506906 completed success,
production version.json matched. Browser clicked OPEN PRIVATE TERMINAL on the
actual github.io page and reached the protected HTTPS UI, whose DB screen passed.
Preview remains disconnected and never receives the destination's data. This is
verified navigation, not a Pages-hosted engine or live-trading certification.

## 2026-11-12 — Control audit, readable loading, exact research → execution review

Reviewed all34 numbered modules (including six workspace wrappers) and supporting
view/chart controls. USER_GUIDE sections11–12 now enumerate every button/input/
select, expanders, common chart/window actions, broker JSON settings and the
research→DEMO→separate real-readiness path. Removed inert DATA0403 journal shortcut
(no click binding), removed context-free CODE→BROKER shortcut, removed hardcoded
strategy-ID default. Kept meaningful filters, source clocks, review, stop/flatten.
BTRESULT0302 now opens BROKER0504 with exact saved source version + owned research
ID in memory only. No prepare/apply/start occurs on navigation. Backend source
review is a protected private capability; public Pages still blocks API access.
The UI shows missing restart hooks, historical halt and real transport blockers.
No real start button, auto-promotion or daily→five-second conversion introduced.

Shared terminal-ui0.7.1 adds static high-contrast amber busy presentation, no poll
animation or drag changes. Screen adapters mark/clear actual async busy states.
Market-only publications preserve CODE, BROKER and ACCESS mounted management DOM
when account/run publication is unchanged; actual account selection/publication
changes still render. Regression covers code + operating settings/focus and exact
version handoff without orders. Public tests use synthetic fixtures only.
Validation:15UI suites,37Python checks and Pages boundary (final rerun after
packaging recorded in follow-up). Public release contains no private engine,
strategy source, account/runtime evidence or credentials. Real-money acceptance
and private worker commissioning are not certified by this frontend release.

Execution-review follow-up: PREPARE stays disabled until protected source review
returns demo_preparation_supported=true. Missing version, unavailable API and
known checkpoint/static blockers cannot expose a runnable setup action. Server
validation remains authoritative.15UI suites passed including blocked→compatible
source change; no automatic policy apply/start. Prior Pages run43229228384
succeeded after a single rerun (initial attempt had no jobs/logs).

Actual cloud screen audit covered all34 numbered functions (including workspace
routing and raw event dialog), read-only controls only, no policy/order writes.
Loading follow-up: initial/manual refresh has high-contrast progress; background
AUTO polling retains connected status rather than displaying perpetual initial
loading. Actual bounded market snapshot measured13.52s on current Atlas/VM path,
health0.03s/runs0.04s. This source-query latency is unresolved; AUTO2s avoids
overlap and is not a2-second data freshness promise.15UI suites passed.

## 2026-11-14 — Separate historical reference and operating source

BROKER0504 now retains the pinned historical reference while selecting a separate
OPERATING CODE VERSION. Typed INPUT / AND-CONDITION DIFFERENCES is required for a
paired preparation; editing conditions invalidates the preparation/review. New
reference identity clears old preparation IDs. Protected operation-review is a
new read-only capability; unknown hosts fail closed. Existing strict source-review
is not weakened. UI shows reference halt and warns historical returns do not
validate changed operating inputs/source. Preparation/apply/start remain separate.

Public changes contain frontend + synthetic fixtures/docs only; no private source,
seed/account data, keys or engine implementation. Shared UI package unchanged.
Verification:15UI suites,37Python tests and Pages isolation checks passed. Fixtures
cover changing operating version without losing research evidence, difference
submission, stale review, command identity and real-mode/public guards. Private
service integration/deployment and actual broker acceptance are separate evidence.
