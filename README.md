# Catalyst — 시장·전략 모니터링 터미널

시장·종목·뉴스·공시와 외부 실행기의 **상태·리스크·포지션·주문·체결·백테스트 결과**를 연결해 조회하는 종합 대시보드입니다. 이벤트 트레이딩은 여러 모니터 중 하나입니다. 전략의 리스크 정책·신호·주문 방식·백테스트/실행 로직은 외부 코드가 소유합니다.

[대시보드](https://claudelove.github.io/trade_monitor/) · [전략 연동 규격](docs/STRATEGY_INTEGRATION.md) · [작업 인계](docs/HANDOFF.md) · [배포 안내](docs/DEPLOYMENT.md)

## 경계

데이터 관리·전략/계좌 업무는 비공개 저장소, 대시보드·차트·조회 연동은 이 공개 저장소에서 이어갑니다. [저장소 역할과 연동 현황](docs/REPOSITORY_BOUNDARY.md). 대시보드 작업은 이 저장소의 work에만 푸시합니다.

- **외부 전략 코드:** 모든 전략 정책, 리스크, 주문/체결 모델, 백테스트 및 실제 실행.
- **대시보드:** 코드 ID·버전·보고된 SHA256, 관측 이력, 결과 조회, 에이전트용 API/CLI/스키마.
- **시장 데이터:** DART 제목·뉴스 RSS·선택 종목 pykrx NAVER 수정 일봉. 문서 분류는 매매 전략이 아닙니다.

코드 등록은 메타데이터 등록이며 코드를 실행하지 않습니다. 현재 구현은 관측/결과 연결 인프라이고 실행 제어 어댑터는 미연결입니다. 비공개 엔진의 기존 계좌/실행 응답을 기준으로 읽습니다. 내부 어댑터는 엔진 원형을 소비하며 별도 snapshot_id/sequence/코드 해시를 강제로 추가하지 않습니다. 직접 HTTP 조회 연결은 아직 미연결입니다.

## 화면

상위 메뉴는 네 작업공간으로 고정합니다. 소화면은 각 공간 안의 메뉴에서 열고, 제목줄의 기능 선택·최대화·닫기만 기본으로 표시합니다. 파일 관리·예시·수동 수집·배치 편집 버튼은 제거했습니다. 운영은 비공개 서버 기반을 전제로 합니다.

- **포트폴리오:** 성과·보유·리스크·전략별 기여도가 기본입니다. 체결·실행 원장·계좌 장부를 추가할 수 있습니다. PORTFOLIO → STRATEGY 선택을 공유합니다.
- **마켓:** 종목 모니터·가격/OHLCV·뉴스·공시·저장 공시를 조회합니다. 공개 시장 스냅샷과 선택 전략의 저장 봉을 구분합니다.
- **백테스트:** 전략 연결 정보·실행 환경·외부 결과 성과를 검토합니다. 전략 추가/실행 엔진은 미연결이며 실행 버튼을 제공하지 않습니다. 데이터는 서버 연결을 통해 공급할 예정입니다.
- **통계 · 데이터:** 전략 간 상관/중복 보유·보고 품질·데이터 출처를 확인합니다.

독립 전략 결과를 합쳐 계좌 NAV/기여도를 만들지 않습니다. 누락된 가격·승수·체결 ID·동일 평가 구간은 미보고로 유지합니다. [진단 정의](docs/STRATEGY_MONITORING.md).

기본 공개 미리보기의 전략/계좌 데이터는 비어 있습니다. 데모/파일 열기 UI는 없습니다. 실시간 엔진 HTTP/브로커·sector/beta/VaR·실제 대사는 미연결입니다.

## 화면/차트 모듈 확장

실제 소화면은 `web/screens/NNNN-name.js` 모듈입니다. `desk`로 네 작업공간 중 하나를 지정하고 `python scripts/sync_screens.py`로 카탈로그를 갱신합니다. 소화면을 추가해도 상위 메뉴는 늘어나지 않습니다. [화면 모듈 계약](docs/SCREEN_MODULES.md).

공통 차트는 실제 봉에 맞춘 십자선과 **차트 안 날짜/OHLCV 툴팁**, 선/캔들·거래량·확대/이동을 제공합니다. LINK·구간 이동은 더보기에 두고 SVG 다운로드 버튼은 제거했습니다. `0101`, `0202 005930` 번호 명령도 유지합니다. [차트 API](docs/CHART_MODULE.md).

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

Pages는 공개 UI 미리보기이며 비공개 운영 사이트가 아닙니다. Python 서버를 실행하지 않으며 시장 스냅샷만 제공합니다. 파일 업로드·예시·수집 UI는 제거했습니다. 개인 실행/계좌 자료는 정적 산출물에 포함하지 않습니다. 창 배치만 localStorage에 보존합니다.

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
