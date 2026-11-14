> 2026-11-14 UI: Portfolio is operating-account-only, Research owns all simulated backtest positions/risk/orders, and KIS DEMO owns virtual-money brokerage control. REAL order controls are unavailable. See the [complete screen/control audit](docs/UI_WORKFLOW_AUDIT_2026-11-14.md) and [user guide](docs/USER_GUIDE.md).

# Mondu Terminal

전략을 작성하고 검증하며, 시장 데이터와 포트폴리오를 확인하는 모니터링 터미널입니다.

**[터미널 열기](https://claudelove.github.io/trade_monitor/) · [사용자 가이드](docs/USER_GUIDE.md)**

## 처음 사용하는 순서

1. 상단 **FUNCTION**에 `GP 005930`을 입력해 차트를 열어봅니다.
2. 비공개 서버에 접속했다면 `UNIV`에서 투자 대상을 저장합니다.
3. `CODE`에서 전략을 작성하고 연구 조건을 정해 **BACKTEST THIS STRATEGY**를 실행합니다.
4. 결과를 검토하고, 모의 운용은 `BROKER`에서 별도로 준비·적용·시작합니다.

**GitHub Pages는 공개 UI 미리보기입니다.** 서버 저장·백테스트·계좌 조회·주문은 비공개 서버에서만 사용할 수 있습니다. 미리보기에서 버튼이 비활성화된 것은 이 연결 경계 때문입니다. 실계좌 주문은 현재 지원하지 않습니다.

## 무엇을 하고 싶나요?

| 작업 | 시작할 화면 | 안내 |
| --- | --- | --- |
| 뉴스·공시·가격 확인 | `GP` · `EVENTMON` · `FIL` | [마켓 사용법](docs/USER_GUIDE.md#3-시장과-이벤트-확인하기) |
| 투자 대상 설정 | `UNIV` | [유니버스 설정](docs/USER_GUIDE.md#4-투자할-종목군-정하기--univ) |
| 전략 작성·백테스트 | `CODE` · `BTRESULT` | [전략 작업 흐름](docs/USER_GUIDE.md#5-전략-작성과-백테스트--code) |
| KIS 모의 운용 | `BROKER` | [준비·시작·중지](docs/USER_GUIDE.md#6-kis-모의투자-준비와-실행--broker) |
| 계좌·전략 성과 확인 | `ACC` · `PERF` · `RISK` · `ATTR` | [포트폴리오 보기](docs/USER_GUIDE.md#7-포트폴리오-확인하기) |
| 데이터 수집 점검 | `DATAFLOW` | [기록·원천 상태](docs/USER_GUIDE.md#8-데이터-수집-상태-확인하기--dataflow) |
| 상태나 오류의 의미 찾기 | 연결 표시·작업 상태 | [문제 해결](docs/USER_GUIDE.md#9-상태-표시와-문제-해결) |

창은 제목 표시줄을 드래그해 옮기고, 가장자리를 드래그해 크기를 바꿉니다. **SCREENS**로 화면을 검색하고 아래 탭으로 열린 창 사이를 이동할 수 있습니다.

## 개발·설치 문서

[개발자 안내](docs/DEVELOPER_GUIDE.md) · [공통 UI](docs/SHARED_UI.md) · [화면 모듈](docs/SCREEN_MODULES.md) · [전략 편집기 계약](docs/STRATEGY_WORKBENCH.md) · [배포](docs/DEPLOYMENT.md) · [작업 인계](docs/HANDOFF.md)

공개 저장소는 공통 UI와 화면 모듈을 관리합니다. 비공개 서버는 API·데이터·전략·계좌·실행 상태를 관리합니다. 인증키와 개인 계좌·전략 데이터는 공개 저장소와 Pages에 포함하지 않습니다.

## Open the protected terminal

The Pages header's **OPEN PRIVATE TERMINAL ↗** link opens the protected host in a
new tab. Pages remains a public preview and never calls that host's private APIs.
The authorized network and protected host enforce access. To change the terminal's
address later, update only the HTTPS origin in [terminal-entry.json](terminal-entry.json)
and configure TLS/Host/Origin on that host; no strategy code belongs here.
