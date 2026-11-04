# Catalyst — 시장·전략 모니터링 터미널

시장·종목·뉴스·공시와 외부 실행기의 **상태·리스크·포지션·주문·체결·백테스트 결과**를 연결해 조회하는 종합 대시보드입니다. 이벤트 트레이딩은 여러 모니터 중 하나입니다. 전략의 리스크 정책·신호·주문 방식·백테스트/실행 로직은 외부 코드가 소유합니다.

[대시보드](https://claudelove.github.io/trade_monitor/) · [전략 연동 규격](docs/STRATEGY_INTEGRATION.md) · [작업 인계](docs/HANDOFF.md) · [배포 안내](docs/DEPLOYMENT.md)

## 경계

데이터 관리·전략/계좌 업무는 비공개 저장소, 대시보드·차트·조회 연동은 이 공개 저장소에서 이어갑니다. [저장소 역할과 연동 현황](docs/REPOSITORY_BOUNDARY.md). 대시보드 작업은 이 저장소의 work에만 푸시합니다.

- **외부 전략 코드:** 모든 전략 정책, 리스크, 주문/체결 모델, 백테스트 및 실제 실행.
- **대시보드:** 코드 ID·버전·보고된 SHA256, 관측 이력, 결과 조회, 에이전트용 API/CLI/스키마.
- **시장 데이터:** DART 제목·뉴스 RSS·선택 종목 pykrx NAVER 수정 일봉. 문서 분류는 매매 전략이 아닙니다.

코드 등록은 메타데이터 등록이며 코드를 실행하지 않습니다. 현재 구현은 관측/결과 연결 인프라이고 실행 제어 어댑터는 미연결입니다. 비공개 엔진의 기존 계좌/실행 응답을 기준으로 읽습니다. 결과 파일은 엔진 원형 그대로 열 수 있으며 별도 snapshot_id/sequence/코드 해시를 강제로 추가하지 않습니다. 직접 HTTP 조회 연결은 아직 미연결입니다.

## 화면

Bloomberg의 명령 탐색·연결된 패널을 참고한 일반 시스템 글꼴/검정·회색/절제된 주황 테마입니다. [화면 구성과 데이터 범위](docs/TERMINAL_WORKSPACES.md).

- OVERVIEW: 종목 모니터·캔들·뉴스·선택 실행·공급자 상태.
- MARKET / SECURITY / NEWS / FILINGS: 종목 표본 일봉·종목별 가격/공시/뉴스·뉴스 검색·공시 필터.
- EXECUTION / RISK / STRATEGY: 외부 실행 보고·리스크·코드 메타데이터.
- ACCOUNT: 엔진 원본 계좌 파일의 NAV/손익·전략 기여도·대사 잔차. 계좌 파일이 없으면 미연결이며 독립 전략 결과를 합산하지 않습니다.
- DATA / SAVED: 공급자 상태·지원 범위와 저장 공시.

기본은 4개 패널의 저장된 분할 워크스페이스입니다. 각 패널의 기능 선택으로 내용을 바꾸고, 메뉴/명령으로 창을 추가합니다. 배치 편집을 켜면 이동·크기 조절이 가능하며 최소화/최대화/닫기/바둑판 정렬/배치 저장을 제공합니다. 가격 창은 여러 개 열어 종목을 각각 고정할 수 있습니다. 모바일에서는 세로로 배치합니다.

공통 SECURITY/RUN 선택이 패널 사이에 유지됩니다. `GP 005930`, `MKT`, `TOP`, `ORD`, `RISK`, `ACC` 등 명령으로 조회하며 `/`는 명령창, 1–9는 화면 이동입니다. 캔들은 20B/60B/ALL과 봉별 OHLCV 조회를 제공합니다. REFRESH는 저장 상태 재조회이며 실행/주문 명령이 아닙니다.

현재 시장 자료는 선택 종목 일봉·공시·뉴스입니다. 선물/호가·금리/채권·외환/원자재·실계좌는 미연결입니다. 시장 전체 지표나 가짜 실행 결과를 자동 생성하지 않습니다. 내장 전략/백테스트 실행 UI는 없습니다.

## Python 서버

```bash
cd /workspace/trade_monitor
python -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/uvicorn monitor.app:app --host 127.0.0.1 --port 8000 --workers 1 --no-access-log
```

MONITOR_DB로 DB 경로를 지정합니다. HTTP 관측 쓰기는 MONITOR_PASSWORD 인증 설정이 필요합니다. 운영 시 HTTPS/인증과 영속 디스크를 사용하세요. 값은 소스/채팅/관측 로그에 넣지 않습니다.

에이전트·실행기 인터페이스:

```text
GET  /api/runtime/contract
GET  /api/runtime/state
POST /api/runtime/bundles
GET  /api/runtime/runs/{run_id}/observations
```

monitor.client.MonitorClient와 `python -m monitor.integration` CLI를 사용할 수 있습니다. [상세 규격](docs/STRATEGY_INTEGRATION.md)에 시각·순서·버전·중복 처리·원자적 등록 규칙을 기록했습니다.

## GitHub Pages

Pages는 Python 서버를 실행하지 않습니다. 시장 스냅샷을 보고, 워크스페이스의 결과 파일 열기로 엔진의 계좌/실행 JSON 또는 이전 관측 v1 JSON을 현재 탭으로 열 수 있습니다. 파일을 서버로 전송하거나 localStorage에 보관하지 않습니다. localStorage에는 창 종류/배치 좌표·크기만 추가로 저장하며, 파일 속 종목·실행/계좌 ID나 결과는 저장하지 않습니다. 실거래/계좌/개인 전략 자료를 공개 저장소에 커밋하면 안 됩니다.

정적 빌드는 runtime-state.json을 빈 상태로 생성해 개인 DB 자료가 공개 산출물에 섞이지 않게 합니다. 비공개 실시간 연결은 Python 백엔드와 외부 실행기를 연결하는 별도 경로입니다.

## 시장 데이터 수집/복구

DART_API_KEY는 환경/Actions secret에서만 사용합니다. 키 없이도 기존 공개 스냅샷을 볼 수 있습니다. pykrx 수정 일봉은 NAVER 경로이며 KRX 직접 인증/실시간 시세가 아닙니다.

```bash
.venv/bin/python -m monitor.cli --start 2026-10-01 --end 2026-11-03 --tickers 005930,000660,069500
.venv/bin/python -m monitor.recovery restore
```

공개 시장 기준 스냅샷과 코드/문서는 GitHub에, 운영 관측 DB는 영속 저장소에 보관합니다. 개인 실행 결과는 공개 export에서 제외합니다. 원천 시점·정정·데이터 품질 등 남은 개선 사항은 [전체 점검](docs/PROJECT_REVIEW_2026-11-04.md)에 있습니다.

## 검증/배포

```bash
.venv/bin/python -m pytest -q
npm ci
npm run test:ui
npm run test:pages
python scripts/build_pages.py
```

Dockerfile·compose.yaml은 Python 서버 운영용입니다. GitHub work 브랜치의 CI 통과 후 공개 Pages가 갱신됩니다. GCP/Render 자원은 생성하지 않았습니다. 실제 브라우저 시각 검증과 DOM/HTTP 검증은 구분해서 기록합니다.
