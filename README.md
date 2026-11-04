# Catalyst — 외부 전략 코드 모니터링 대시보드

전략 코드와 에이전트 실행기가 보고하는 **상태·리스크·포지션·주문·체결·백테스트 결과**를 확인하는 시스템입니다. 전략의 리스크 정책·신호·주문 방식·백테스트/실행 로직은 외부 코드가 소유합니다.

[대시보드](https://claudelove.github.io/trade_monitor/) · [전략 연동 규격](docs/STRATEGY_INTEGRATION.md) · [작업 인계](docs/HANDOFF.md) · [배포 안내](docs/DEPLOYMENT.md)

## 경계

- **외부 전략 코드:** 모든 전략 정책, 리스크, 주문/체결 모델, 백테스트 및 실제 실행.
- **대시보드:** 코드 ID·버전·보고된 SHA256, 관측 이력, 결과 조회, 에이전트용 API/CLI/스키마.
- **시장 데이터:** DART 제목·뉴스 RSS·선택 종목 pykrx NAVER 수정 일봉. 문서 분류는 매매 전략이 아닙니다.

코드 등록은 메타데이터 등록이며 코드를 실행하지 않습니다. 사용자 제공 예정 docs를 받기 전 실행 ABI를 임의로 가정하지 않았습니다. 현재 구현은 관측/결과 연결 인프라이고 실행 제어 어댑터는 미연결입니다.

## 화면

- 이벤트 모니터: 공시·뉴스·가격 조회와 문서 유형 검색.
- 전략 코드: 등록된 코드 버전/해시, 결과 파일 열기, 연동 규격/예시.
- 실행·결과: 외부 코드가 보고한 지표·리스크·포지션·주문·체결·평가액·로그.
- 관심 이벤트·데이터 연결: 기존 시장 자료의 저장/공급자 상태.

내장 전략 목록·공개매수 수동 시나리오·고정 보유일 백테스트 실행 UI는 제거했습니다. 실행 결과가 없으면 연결 대기 상태를 표시하며 가짜 실행 자료를 자동으로 채우지 않습니다.

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

Pages는 Python 서버를 실행하지 않습니다. 시장 스냅샷을 보고, 전략 코드 메뉴에서 외부 결과 JSON을 현재 탭으로 열 수 있습니다. 파일을 서버로 전송하거나 localStorage에 보관하지 않습니다. 실거래/계좌/개인 전략 자료를 공개 저장소에 커밋하면 안 됩니다.

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
