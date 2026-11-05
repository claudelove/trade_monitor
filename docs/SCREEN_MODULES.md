> Current baseline (2026-11-05): the user requested the integrated UI snapshot. Six desks and 36 numbered modules now replace the earlier four-desk UI below. Use docs/UI_SYNC.md and web/screens/ metadata for current numbering. The source/patch manifest is UI_UPSTREAM.json. The historical module contract below applies where compatible; new source paths are web/views/, web/analytics/, web/pane-context.js and web/engine-client.js. There is no strategy-ui.js compatibility dispatcher in the current product.

# 번호별 화면 모듈 개발

화면 번호·명령·메뉴·창 목록·기본 배치·렌더링·연결 해제를 하나의 등록 계약으로 관리한다. app.js에 화면별 switch/뷰 목록/명령 목록을 추가하지 않는다. 기존 공개 UI의 데이터 계약과 비공개 엔진 소유권은 유지한다.

## 상위 프레임

포트폴리오(strategy) / 마켓(market) / 백테스트(backtest) / 통계·데이터(analysis) 네 작업공간만 상위 메뉴에 표시한다. 소화면 모듈은 해당 desk의 내부 메뉴·패널 선택기에 등록된다. 개별 화면의 nav 플래그로 상위 목차를 추가하지 않는다. 프레임에는 데이터 기능/전략 로직을 넣지 않는다.

기본 배치는 포트폴리오 PERF/HOLD/RISK/ATTR, 마켓 QUOTE/GP/TOP/FIL, 백테스트 CODE/BTEXEC/BTRESULT, 통계·데이터 CORR/HEALTH/DATA다. CODE는 외부 코드 식별/결과 연결이며 코드 업로드·등록 실행기가 아니다. BTEXEC는 미연결 상태와 결과 열기만 제공한다. 실제 실행/전략 추가 어댑터는 비공개 엔진 계약을 확정한 뒤 연결한다.

최대화·닫기만 두고 파일/예시/배치 관리 버튼은 제거했다. 자동 분할로 배치한다. 기본 모드에서 창을 닫으면 남은 창을 재정렬한다. 배치는 v3 키로 작업공간별 저장하고 이전 v2 배치는 이관하지 않는다.

## 현재 화면

| 번호 | 명령 | 모듈 / 용도 |
| --- | --- | --- |
| 0001 | OV | 전략 워크스페이스 |
| 0002 | MKT | 마켓 워크스페이스 |
| 0003 | BT | 백테스트 워크스페이스 |
| 0004 | ANALYSIS | 통계·데이터 워크스페이스 |
| 0101 | PERF | 전략 성과 |
| 0102 | HOLD | 보유 구성 |
| 0103 | RISK | 노출·집중도 |
| 0104 | EXEC | 체결·비용 |
| 0105 | ATTR | 전략 기여도 |
| 0106 | CORR | 동행·중복 |
| 0107 | HEALTH | 보고/데이터 상태 |
| 0108 | ORD | 실행 원장 |
| 0109 | CODE / STRAT | 코드 식별 |
| 0110 | ACC | 계좌 장부 |
| 0201 | QUOTE | 종목 모니터 |
| 0202 | GP | 가격/종목 분석 |
| 0203 | TOP | 뉴스 |
| 0204 | FIL | 공시/검색/위젯 설정 |
| 0205 | DATA | 시장 데이터 연결 |
| 0206 | SAVED | 저장 공시 |
| 0290 | EVENT | 공시 상세 다이얼로그 |
| 0301 | BTEXEC | 외부 실행 환경/미연결 상태 |
| 0302 | BTRESULT | 외부 백테스트 결과 성과 |

명령창에 `0101`, `PERF`, `0202 005930` 등을 입력한다. 1–4 단축키는 네 작업공간 전환이고 4자리 화면 번호와 별개다. 기존 shortcut 메타데이터는 호환을 위해 보존하지만 소화면 단축키로 바인딩하지 않는다. 패널 제목줄에 화면 번호를 표시하고, 창의 instance ID는 별도로 유지한다.

## 새 화면 추가

예를 들어 `web/screens/0199-custom.js` 한 파일을 추가한다.

```js
import {esc, listen} from '../ui/dom.js';

export default {
  apiVersion: 1,
  id: 'custom',
  number: '0199',
  command: 'CUSTOM',
  desk: 'strategy',
  title: '사용자 분석',
  subtitle: '외부 실행 결과를 조회합니다.',
  nav: false,
  render(ctx, pane) {
    return `<section class="panel"><p>${esc(ctx.strategy.entry?.name || '전략 미연결')}</p>
      <button data-custom>조회</button></section>`;
  },
  mount(root, ctx, pane) {
    return listen(root.querySelector('[data-custom]'), 'click', () => {
      // 데이터 조회/로컬 UI 상태 변경만 담당한다.
      // 새로운 계산을 넣는 경우 원천·단위·결측 정책과 검사를 함께 작성한다.
    });
  },
};
```

그다음 카탈로그를 재생성하고 관련 검사를 실행한다.

```bash
python scripts/sync_screens.py
npm run test:ui
npm run test:pages
```

메뉴·명령·창 선택·번호 라우팅이 이 모듈에서 자동 생성되고, 정적 빌드는 web 아래의 공개 JS/CSS/SVG/woff2 자산을 하위 폴더까지 복사한다. app.js, index.html 메뉴, 창 도구 목록, build 파일 목록을 따로 고치지 않는다. 생성된 catalog.js는 커밋한다. 빌드는 stale 카탈로그를 거부한다. 신규 계산·데이터 계약에는 해당 검사를 추가한다.

새로운 원천/백엔드 API·전략 실행기를 구현하는 일까지 UI 모듈 하나로 해결된다는 뜻은 아니다. 기존 context와 조회 API를 사용하는 새 화면에 적용하는 확장 계약이다. 비공개 전략 코드를 웹 모듈로 import하지 않는다.

## 계약

- 필수: id, number(4자리), command, desk(strategy/market/backtest/analysis), title, render(ctx,pane).
- 파일명은 NNNN-lowercase-screen-name.js. 번호와 파일 prefix가 일치해야 한다. ID·번호·명령·aliases·shortcut·기본 slot 중복을 검출한다.
- 선택: aliases, subtitle, nav/navLabel/navOrder, shortcut(1–9), defaultSlot, selector, panel(false이면 전체 화면 전용), configure(root,ctx).
- kind 기본 screen, workspace는 작업 공간 호스트, dialog는 다이얼로그다.
- parseArgs(args,ctx)는 명령 인자를 pane 매개변수로 반환한다. 화면별 인자 해석을 app.js에 추가하지 않는다. dialog의 load(ctx,params)는 표시 전 데이터를 읽는다.
- mount(root,ctx,pane)는 동기적으로 cleanup 함수를 반환한다. 렌더러는 순수 HTML 생성, mount는 이벤트·차트 연결을 담당한다. 공용 이벤트 helper는 AbortSignal 수명에 연결되고, 연결 중 오류가 발생해도 등록된 이벤트는 해제된다. 특정 패널 오류를 다른 패널의 성공으로 숨기지 않는다.
- ctx에는 state의 표시용 스냅샷, strategy context, nativeRun, market, marketSource, presentation(page/window/dialog), chartBus, actions, signal이 있다. 엔진 비밀/주문 권한/전략 실행기는 없다.
- ctx.actions는 조회/화면 전환/선택/파일 열기·닫기 등 기존 UI 동작이다. ctx.state나 엔진 결과를 직접 변경하지 않는다. pane은 화면의 탭 메모리 상태다.
- 비동기 mount 작업은 ctx.signal로 취소하거나 응답 반영 전 aborted/문맥을 확인한다. document/window listener·chart bus·observer는 cleanup에서 해제한다. 공용 listen()과 mountCharts()를 우선 사용한다.

등록 파일은 개발자가 검토해 배포하는 신뢰한 UI 코드다. 사용자 업로드 JSON/뉴스/공시가 모듈을 등록하거나 실행하지 않는다. 브라우저 sandbox 밖의 전략 엔진을 제공하는 구조가 아니다.

## 구성 파일

- screens/*.js: 화면별 구현.
- screens/catalog.js: 파일 검색으로 생성한 import 목록.
- screen-registry.js / screens.js: 검증/등록/조회·수명 경계.
- window-workspace.js: 배치/최대화/닫기와 패널 수명만 담당.
- charts/: 공통 차트. [차트 API](CHART_MODULE.md).
- ui/: DOM/표시 helper. strategy-analysis.js: 화면 진단 계산.
- strategy-ui.js: 이전 직접 함수 호출의 호환 export. 실제 화면 라우팅에는 쓰지 않는다.

## 검증

새 화면을 임시 레지스트리에 등록해 기존 코어 수정 없이 내부 메뉴/번호/패널 목록에 나타나는지 검사한다. mount 실패 후 이벤트 잔존, 중복 번호/명령, chart bus 정리, 원본 데이터 불변을 함께 검사한다. Python/Pages/실제 Chromium 검증과 배포 버전 확인도 유지한다.

Current window contract (2026-11-05): one instance per screen type per desk; repeated commands focus the existing pane. No repeatable flag. Use the permanent command/SCREENS search instead of adding toolbar shortcuts or a separate function directory.
