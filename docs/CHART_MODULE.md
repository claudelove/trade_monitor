# 공통 인터랙티브 차트

[공식 Bloomberg Charts 소개](https://professional.bloomberg.com/products/bloomberg-terminal/charts/)와 사용자가 제공한 가이드의 가격/비교 차트 작업 방식을 참고했다. 데이터·축·상태·조작을 공통 모듈로 구현했으며 Bloomberg의 데이터/엔진/모든 지표 기능을 제공하지 않는다.

## 기능

- 선/캔들 전환, 거래량 보조 영역, 좌우 단위 축, 최대 8개 시리즈 비교.
- 실제 봉 중심과 같은 간격으로 포인터를 스냅한다. 차트 내부 툴팁에 날짜·시가·고가·저가·종가·거래량을 표시하고 하단 readout도 함께 갱신한다. 키보드 커서도 툴팁을 표시하고 포인터 이탈/Escape는 닫는다. 누락 거래량은 미보고로 표시한다.
- 20B/60B/ALL, 휠/드래그 구간 이동, Ctrl/Meta+휠 확대·축소, 버튼 조작, 더블클릭 RESET.
- 좌우 키 커서 이동, +/- 확대·축소, Home/End 구간 이동, Escape 커서 해제.
- LINK 그룹 내 정확한 시각의 커서와 표시 구간 연동, 해제 가능. 그룹은 현재 계좌/전략 또는 시장 출처/선택 실행으로 분리한다. 같은 시장 원천의 서로 다른 종목도 정확한 시각이 있을 때만 연동한다. 데이터 key/viewport는 종목별로 분리하며 그룹이 없는 차트의 LINK는 비활성이다.
- 창 크기에 맞는 viewBox/포인터 좌표, 최대화와 모바일 대응.
- 기본 도구는 기간·확대/축소·선/캔들·RESET이다. LINK·이전/다음 이동은 접힌 더보기에 둔다. SVG 다운로드는 내부 API만 보존하고 UI 버튼은 제거했다.

차트 x축은 관측/봉 간격이다. 캘린더 경과 시간에 비례하지 않는다. 기간 버튼은 봉/관측 수이며 캘린더 일수로 오인하지 않는다. 전체 입력을 유지한 채 표시 구간만 바꾼다.

## 화면에서 사용

```js
import {chartSlot, mountCharts, strategyGroup} from '../charts/host.js';

// render()가 반환하는 HTML 안에 슬롯을 넣는다.
const html = chartSlot('my-chart');

// mount(root, ctx, pane)에서 생성하고 그대로 cleanup을 반환한다.
const cleanup = mountCharts(root, ctx, pane, [{
  role: 'my-chart',
  key: strategyGroup(ctx.strategy) + ':my-metric',
  linkGroup: strategyGroup(ctx.strategy),
  title: '보고 NAV / KRW',
  count: 60,
  series: [{
    id: 'nav', label: 'NAV', unit: 'KRW', type: 'line', color: '#f5d34e',
    data: [{ timestamp: '2026-11-04T06:00:00Z', value: 1000 }],
  }],
}]);
```

pane.chartStates는 viewport/type만 탭 메모리에서 유지한다. 데이터 문맥 key가 바뀌면 구간을 재설정한다. 같은 key로 다시 그리면 저장된 시작/종료 시각을 복원한다. 현재 화면이 보던 과거 구간을 새 시세로 오인하지 않도록 날짜/커서/표시 관측 범위를 표시한다. RESET은 최신 구간으로 돌아간다. 화면 배치 localStorage에는 차트 값·문맥 ID·viewport를 넣지 않는다.

## 시리즈 계약

line: `{id,label,type:'line',unit,axis:'right'|'left',format:'number'|'percent',color,data:[{timestamp,value:number|null}]}`.

candle: 같은 metadata와 `data:[{timestamp,open,high,low,close,volume?}]`를 사용한다. OHLC는 유한 숫자와 고저 관계를 검사한다. 거래량은 0 이상 숫자다. 보고하지 않은 거래량은 생성하지 않는다.

- axis 기본 right. 같은 축에 다른 unit을 섞으면 오류다. 서로 다른 단위는 left/right로 명시한다.
- format percent는 원본 비율을 표시할 때만 ×100 한다. 계산 원천을 재조정/환산하는 기능이 아니다.
- timestamp는 YYYY-MM-DD 또는 시간대 포함 ISO 문자열이다. 날짜만 있는 자료는 readout에 정확한 시각 미제공으로 표시한다. 내부 정렬 키를 위해 사용한 자정이 실제 거래/공시 시각이 되지 않는다.
- 원본 배열을 수정하지 않고 정렬한 사본을 쓴다. 동일 시리즈의 중복 시각은 거부한다. JS Date의 밀리초 해상도보다 세밀한 시각을 별도 tick archive처럼 처리하지 않는다.
- value=null 또는 비교 시리즈의 누락 시각은 선을 끊는다. 값 보간/앞 값 채우기/가짜 봉을 생성하지 않는다. 커서 연동 시 정확한 시각이 없거나 구간 밖이면 값이 있다고 표시하지 않는다.
- 축은 현재 표시 구간 데이터에 맞춘다. 단일 값/상수/0도 padding을 가진다. zero 옵션은 0을 축 범위에 포함한다. 단위·원천은 호출 화면이 명시한다.

## 직접 API

TerminalChart(root, options), setData(options), reset(), dispose(). 내부 ChartModel은 range/pan/zoom/rangeByTime/snapshot, ChartLinkBus는 subscribe/publish를 제공한다. dispose는 listener·observer·bus 구독과 표시 데이터를 해제한다. dispose 이후 setData는 지원하지 않는다.

기술 지표·자동 전략/주문·실시간 공급자·서버 측 대용량 집계는 이 모듈의 기능이 아니다. 새 지표는 외부에서 계산·보고한 시리즈 또는 검증된 별도 진단 함수로 제공한다. 현재 8개 시리즈, 시리즈당 50,000개 관측 상한이며 대규모 tick 스트림에는 별도 집계/해상도 계약이 필요하다.

## 현재 적용

0101 전략 성과, 0103 보고 노출, 0110 계좌 NAV, 0202 가격/거래량, 0204 공시 페이지의 저장 가격 비교, 0290 공시 상세 가격 변화가 같은 차트 엔진을 사용한다. 기존 개별 SVG 렌더링 분기를 제거했다.

tests/chart-registry.mjs가 viewport·결측·정확 시각 연동·축 단위·수명·텍스트 안전성을 검사하며 실제 Chromium에서 pointer/wheel/keyboard·캔들/선·SVG 다운로드·모바일을 확인한다.

2026-11-04 간소화 검증: 공개 005930 일봉의 첫/중간/마지막 봉에 마우스를 이동해 날짜와 O/H/L/C/V 5개 값이 원본과 일치하는지 실제 Chromium에서 확인했다. 툴팁은 Bloomberg 전체 기능의 재현이 아니며 현재 저장된 시계열을 조회하는 기본 기능이다.
