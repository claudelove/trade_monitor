## 2026-11-05 manual window layout

Removed automatic tiling and numbered function toolbar. Users move/resize independent windows; existing geometry is retained on add/close and restored per desk. Separate registry-backed screen list/search routes by number, command or title across desks. Shared UI 0.3.0 / API 1 owns reusable pointer/keyboard gestures. Public UI/Python/Pages checks and real Chromium layout/chart-resize/search/mobile checks passed. No market/private-data or execution changes.

## 2026-11-05 Bergoom and HTS chart presentation — released

Common UI 0.2.0 / API 1 defaults to self-hosted Bergoom Regular/Semibold/Bold/Italic, the user-selected OFL Bloomberg-inspired alternative. Original font bytes, source provenance and copyright/OFL notices are preserved. This is not Bloomberg Prop or Neue Haas. Code editors retain IBM Plex Mono.

The module provides LAST SOURCE / prior-observation Δ BAR, trailing MA5/20/60 values, red/blue OHLC/volume, keyboard inspection/zoom/Home/End/Escape, missing-time LINK clearing, display-only integer-price precision and resize viewport/volume retention. Source values and clock precision are preserved. Application screen numbers, APIs and financial logic remain outside this visual module.

Public release 217feb40f8f917ef27fb91c6ac34713dd9bed6c1 passed public Actions 41943056266 and deployed. Deployed font, CSS, chart helpers and OFL text match local bytes. Public Python 37, nine UI suites, actual Chromium Bergoom glyph identification, source OHLCV and native chart/keyboard/mobile checks passed. Consumer-specific commits and integration evidence are kept only in the consumer repository's handoff. Use docs/SHARED_UI.md to update the pinned dependency.

## 2026-11-05 shared visual library

Public packages/terminal-ui 0.1.0 / API 1 owns typography, CSS, chart rendering and generic DOM/window actions. The public demo consumes it through a manifest-verified local bundle. Application functions, API/data and financial policies remain outside the library.

Public commit b9f883ad4021ff5e5e2b3055ece6ff754d9b77cd passed public Actions 41933965746 and deployed. Public Python 37 tests, UI contracts, actual-browser typography/chart checks, preview privacy boundary and installed asset hashes passed. The user's direct reply resolved the prepared consumer update's authorization question. Consumer-specific commit/test records belong in its own handoff and are deliberately omitted from this public report.

## 2026-11-05 UI-only upstream import — current direction

User authorized importing the integrated private terminal UI unchanged into public trade_monitor/work. UI source is pinned to 7f3130426056f7215f303738ead80eec7b9b8af7; docs/UI_UPSTREAM.json records file hashes. Six English desks, terminal font, independent panels, native Lightweight Charts, authoring/review/analytics/execution/admin screens replace the old public UI. This explicit snapshot request supersedes earlier four-desk/system-font/no-authoring-button product instructions for the imported UI.

Only frontend assets, third-party licenses/provenance and generic synthetic UI tests are included. No private engine/strategy/configuration/registry/runtime/account data or Git history is imported, and no private push is made. docs/UI_SYNC.md defines the update boundary. Public Pages uses pages-preview.js with existing public snapshot and empty accounts/runs; server operations are rejected before fetch. Non-Pages engine-client preserves the same-origin private API contract. Public Python runtime-v1 backend remains legacy and does not implement that contract.

Local validation: Python 32; seven imported UI contract suites; Pages boundary/upstream byte parity/license/private-data checks; actual Chromium native canvas OHLCV against public bars, line/candle/MA, six desks, evidence dialog, no private API/POST requests, 390px responsive passed. The user-visible UI remains the upstream implementation. Only app preview labels, engine-client preview boundary and generated catalog differ; tests check parity of all other imported assets.

Deployment confirmed: 5a46642fc1aba3830b760e2cd09d59595d6c4ea3; Actions 41929231779 test/build-pages/deploy-pages success. Public version.json matches; deployed preview boundary, chart/vendor/font/license bytes match local files; private runtime lists remain empty. Public work only. Documentation-only follow-up skips CI.

Further edits should start from the pinned integrated UI and preserve the source-only publication boundary. Do not automatically copy private engine functionality. See docs/UI_SYNC.md.


## 비공개 서버 운영 전제 UI 최소화 — 2026-11-04

완료: 결과 파일 열기/닫기·파일 input·형식 예시·합성 예시·데모 선택·수동 수집·위젯 구성·배치 편집/정렬/리셋·차트 SVG 버튼을 제품 UI에서 제거했다. 네 작업공간/내부 소화면·전략/종목 선택·검색·창 최대화/닫기·OHLCV 호버는 유지한다. 배치는 자동 분할이며 추가 편집 모드는 없다. 일반 글꼴, 검정 바탕, 어두운 선택창, 주황 활성 메뉴, 작은 사각 버튼/제목줄로 정리했다. 파일/예제 소비 함수는 기존 합성 계약 테스트를 위해 내부에 남아 있지만 화면 action으로 노출하지 않는다.

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


# 이벤트 트레이딩 모니터링 앱 점검

점검일: 2026-11-03, 약 16:04~16:07 KST.

## 기존 프로젝트 상태

- `/workspace/trade_monitor`에는 기존 README.md와 `.git`만 있었다.
- README.md 내용은 제목 `trade_monitor`와 설명 `trade monitoring system &amp; ui` 두 줄이다.
- 기존 REPORT.md, 앱 소스, 의존성 정의, 수집기, 테스트, DB는 없었다.
- 로컬 HEAD와 원격 origin/main은 모두 초기 커밋 `47b0e5058793e9d9276a0d87031d06d1161f4ad3`이다. 원격 HEAD도 동일하다. 다른 브랜치 전체를 조사한 것은 아니다.
- 따라서 이번 확인은 독립 API 접속·수집 점검이며, 기존 앱의 수집 파이프라인이나 UI 동작을 검증한 것은 아니다.

## 환경 설정 적용 여부

- 클라우드 상태: `observations_current=true`, 네트워크 정책 `unrestricted`, 적용 상태 `enforced`.
- 실행 환경 `/etc/codex/network-policy.json`도 HTTP 정책 `unrestricted`를 기록한다.
- VPN은 구성되어 있지 않다. 이번 HTTPS 요청에는 필요하지 않았다.
- 런타임 변수 `DART_API_KEY`는 상태 `ready`이며 프로세스에서도 존재 여부만 확인했다. 인증키 값, 요청 URL, 환경 변수 전체는 출력하거나 저장하지 않았다.
- 최초 기본 실행은 로컬 실행 샌드박스에서 프록시 소켓 접근이 `PermissionError / errno=1`로 거절되었다. 네트워크 권한을 지정한 실행에서는 상속된 프록시와 TLS 검증을 유지한 채 요청이 성공했다. 목적지 허용 정책 차단과 구분해야 한다.

## 실데이터 점검 결과

| 대상 | 요청 | 결과 |
| --- | --- | --- |
| DART | 공시 목록 `/api/list.json`, 2026-10-30, page_count=5 | HTTP 200, API 상태 `000`, total_count=1,080, 5건 수신 |
| DART | 같은 API, 2025-10-30, page_count=5 | HTTP 200, API 상태 `000`, total_count=906, 5건 수신 |
| KRX | 데이터 포털 메인, 기본 요청 헤더 | HTTP 403 |
| KRX | 데이터 포털 메인, User-Agent·Referer 지정, 쿠키 세션 사용 | HTTP 200, HTML 556,558바이트 |
| KRX | 일별 전종목 시세 `MDCSTAT01501`, 2026-10-30 및 2025-10-30 | HTTP 400 |
| KRX | 메인 페이지 접근 후 쿠키를 유지한 2025-10-30 시세 재요청 | HTTP 400, 응답 본문 `LOGOUT` |

DART 공시 실데이터 수신 및 키의 해당 API 인증 성공을 확인했다. 전체 1,080건을 수집한 것은 아니며, 5건만 요청했다. 수신 표본의 회사명·보고서명·접수일·접수번호는 아래 JSON에 있다.

KRX는 메인 페이지에 접근 가능하므로 도메인 접속 허용이 적용된 것으로 확인된다. 그러나 시세 응답은 세션/인증 경로의 `LOGOUT`으로 끝났다. HTTP 접속 성공만으로 데이터 조회 권한이 확보되었다고 볼 수 없으며, 정확한 인증 요구사항은 추가 확인이 필요하다. KRX 시세 데이터 수집 성공은 확인하지 못했다.

## 추가한 점검 자료

- `work/verify_live_data.py`: Python 표준 라이브러리만 사용하는 제한된 읽기 전용 API 점검. 환경 변수로 키를 받고 응답의 허용된 요약 필드만 저장한다. 키를 명령행 인수로 전달하지 않는다.
- `work/live_data_check.json`: DART 결과·표본과 기본 KRX 요청 결과. 인증키 미포함.
- `work/krx_session_check.json`: 쿠키 세션을 사용한 KRX 후속 점검 결과. 쿠키 값 미포함.

재실행 명령: `python work/verify_live_data.py`. 실행 도구의 네트워크 권한이 필요하며, 현재 환경의 프록시 설정을 유지해야 한다.

## 후속 작업에 필요한 사항

기존 앱 소스가 있는 경로·브랜치 또는 이전 작업 파일을 확보해야 앱 작업을 이어갈 수 있다. KRX는 공식 데이터 제공 경로와 필요한 인증/세션 절차를 확인한 후 시세 수집을 다시 검증해야 한다. 이번 점검에서 앱 신규 구현, 배포, 커밋 또는 원격 저장소 변경은 하지 않았다.

---

# 2026-11-03 구현 및 실데이터 검증 업데이트

기존 접속 점검 이후 Catalyst 이벤트 트레이딩 리서치 프로토타입을 새로 구현했다.

## 구현

- Python FastAPI + SQLite 누적 저장 + 빌드 없는 반응형 웹 UI.
- 실적·가이던스, 자사주·환원, M&A·공개매수, 희석·자본조달, 지배구조·특수상황 분류 레지스트리.
- 검색·필터·CSV·관심 이벤트, 표시/순서를 변경하는 대시보드 위젯.
- 공시 원문, 이벤트 전후 가격 차트, D+1/3/5/10/20 가격수익률·KODEX 200 대비 초과수익, 연구 가설·검토 항목.
- Google News RSS 기본 검색과 기업명·이벤트 전후 기간 검색. 뉴스는 관련 후보로 표시하며 인과관계/방향성 신호로 해석하지 않는다.
- 공개매수 수동 시나리오의 스프레드·단순 연율·확률가중 기대값 계산.
- 비용·보유 기간·공시 기간·전일 거래대금 추정 하한을 설정하는 롱온리 단일 포지션 백테스트. 정정/중복/불충분 가격 제외, 일봉 평가액 MDD·승률·체결 CSV.
- 수집기 실패를 격리하고 이전 캐시·마지막 성공 시각을 보존. pykrx 프로세스에 80초 제한 적용.
- Dockerfile·Compose·선택적 HTTP Basic 인증. Compose에서는 비밀번호 설정 필수.

## 실데이터 검증

1. `pykrx==1.2.9`를 설치하고 실제 사용 경로를 코드로 확인했다. `adjusted=True`는 NAVER 일봉을 사용한다. **KRX 직접 인증에 성공한 것이 아니다.** 최초 점검에서 확인한 KRX `LOGOUT`과 모순되지 않는다.
2. 2026-10-01~2026-11-03 수집을 수행했다. DART는 회당 최대 500건이며 요청 당시 전체 건수 4,564건 중 일부다. 서로 다른 요청을 중복 제거해 누적 공시 502건을 확보했다. 전체 시장 이벤트를 모두 받은 것이 아니다.
3. 선택한 12종목에서 각 22개씩 총 264개 수정 일봉을 수신했다. 공시 56건에 가격이 연결됐다. 가격 종목은 해당 공시 표본의 전략 후보 빈도 상위 종목과 삼성전자·KODEX 200을 조합한 연구 표본이다. 투자 가능 유니버스 전체가 아니다.
4. 기본 RSS 수집을 누적해 뉴스 44건을 보관했고, 삼성전자 이벤트에 대한 기업·기간 뉴스 API로 검색 후보 30건을 추가 수신했다. URL 중복으로 최종 누적 건수는 합산과 다를 수 있다.
5. 실데이터 `/api/event/{id}/news`와 `/api/backtest` 호출 모두 HTTP 200을 확인했다. 실적 이벤트·1거래일 보유·편도 20bp 설정에서 완료 거래 1건이 생성됐다. 짧은 표본으로 수익성을 판단할 수 없다. 기본 5거래일 설정에서는 선택 표본의 가격 구간이 부족해 완료 거래가 없을 수 있다.
6. 거래대금이 없는 NAVER 일봉은 종가×거래량 추정치로 별도 표시한다. 실제 체결 거래대금으로 오인해서는 안 된다.
7. 인증키 값·환경 변수 전체·키가 포함된 DART 요청 URL은 출력하거나 파일에 저장하지 않았다.

## 검증과 남은 범위

- Python 계산·저장·API·인증 테스트 **13개 통과**.
- jsdom UI 검사 통과: 실데이터/데모 분리, 검색, 공시 상세, 관심 목록, 위젯 제어, 시나리오 검증, 백테스트 결과, 공급자 상태.
- JavaScript 구문 검사 통과.
- 실제 브라우저 렌더링 검사는 수행하지 못했다. 관리형 환경에 스킬이 지정한 `cua_repl.js`가 없어 별도 브라우저 경로를 임의로 구성하지 않았다.
- Docker 이미지 빌드·컨테이너 실행·인터넷 배포는 수행하지 않았다. FastAPI 운영에는 Python 서버 호스팅이 필요하며 Sites Workers는 Python 수집기를 그대로 실행하는 환경이 아니다. 설치된 환경에 Sites 소스/패키징 보조 스크립트도 없었다.
- 현재는 개인용 단일 프로세스 프로토타입이다. 다중 사용자 권한/작업 큐, 증권사 실시간 API, 공매도·대차·시장 충격, 컨센서스, 공시 본문에서 거래 조건 추출, 기업행동·배당 정합성, point-in-time 이력 및 생존편향 통제는 후속 범위다.
- 현재 분류는 설명 가능한 키워드 규칙이며 자동 투자 판단이나 M&A·공매도 실행 모델이 아니다. 공시 분류에 따른 롱온리 이벤트 연구와 헤지펀드 전략 전체의 검증을 구분한다.

실행법·데이터 계약·확장 구조·배포 설정은 README.md에 기록했다. 기존 Git 원격으로 푸시하거나 커밋하지 않았다.

---

# 2026-11-03 채팅 독립 복구·Render 배포 준비

사용자가 환경 변수 변경 중 세션/환경 소실을 우려해, GitHub를 작업 재개의 기준으로 삼도록 요청했다.

- AGENTS.md 작업 규칙, docs/HANDOFF.md 현재 상태, docs/DEPLOYMENT.md 최초 Render 생성·비밀 설정·재배포·복구 절차를 추가했다.
- render.yaml: work 브랜치, Singapore Starter 단일 인스턴스, 1GB 영속 디스크, CI 통과 후 자동 배포. 비밀번호는 Render 생성값이며 DART 키는 Render에만 입력한다.
- Docker가 PORT를 읽고 영속 디스크 권한을 초기화한 뒤 Python을 비루트 사용자로 실행한다. 인증 필수 모드와 비인증 최소 /healthz를 분리했다.
- 공개 시장 데이터만 허용 필드로 선별한 fixtures/bootstrap-live.json을 추가했다. 502개 공시, 74개 뉴스 후보, 12종목 264개 일봉. 실제 키 값 포함 여부를 검사했다.
- 신규 DB에서만 자동 복원한다. 기존 DB는 보존한다. Git 스냅샷은 기준 자료이며 이후 운영 변경분 전체의 자동 백업은 아니다.
- requirements.lock으로 런타임 의존성을 고정했다. GitHub Actions에 Python·JS·UI DOM 검사를 추가했다.
- Python 테스트 18개 및 UI DOM/구문 검사 통과. Docker 빌드와 컨테이너 HTTP 상태·인증·PORT·DART 키 없는 복구·영속 볼륨 재시작 보존을 확인했다.
- Render 계정/API 연결 및 브라우저 제어 도구가 없어 실제 원격 서비스는 생성하지 않았다. Render의 최초 계정/GitHub 연결·요금 확인·서비스 생성은 사용자 계정에서 수행해야 한다. 배포 URL은 아직 발급되지 않았다.
- GitHub가 비밀 값을 보관하지 않으므로 완전히 새 호스팅 환경에서는 키/비밀번호 설정이 필요하다. 운영 DB 삭제나 영속 디스크 손실까지 Git만으로 최신 상태를 보장할 수는 없다.


---

# 2026-11-03 GitHub Pages로 배포 방향 변경

사용자는 도메인 없이 수정 중 화면만 확인하면 되므로 GitHub만으로 가능한 방식을 요청했다. GCP 프로젝트 krx-dashboard-513607은 보류하고 자원을 생성하지 않았다.

정적 Pages 대시보드와 브라우저 이벤트 연구/백테스트, Python/JavaScript 엔진 정합성 검사, 공개 JSON 빌드, 수동 수집 Actions와 자동 Pages 배포를 추가했다. 원래 Python 서버/Docker 경로는 유지했다. 수집 키는 소스가 아닌 repository Actions secret에서만 사용하도록 구성했다.

작업 중 클라우드 실행 환경 연결이 끊겨 마지막 로컬 검사 결과를 확인할 수 없었다. 원격 GitHub API로 복구 커밋을 작성하고 GitHub Actions에서 검증하도록 했다. 실제 배포·검사 결과를 확인하기 전 성공으로 보고하지 않는다. DART secret 이전과 Pages 계정 설정이 끝났다고 가정하지 않는다.

원격 검증 결과: 0896489의 Python 18개, 브라우저/Python 백테스트 비교 720개, 이벤트 연구 556개, Pages UI·경로·정적 빌드 모두 통과했다. 사용자의 Pages 활성화 후 github-pages 환경이 main만 허용하는 추가 제한을 확인했고 work 추가를 요청했다. DART key의 Actions secret 전송은 자동 승인 심사가 명시적 허용 부족으로 거절해 미실행이다.

최종 배포 확인 (2026-11-03 17:23 KST): 사용자 Pages 활성화와 work 허용 후 CI run 41602592661의 test/build-pages/deploy-pages 모두 성공. https://claudelove.github.io/trade_monitor/ 및 version.json, app.js, static-api.js, live.json HTTP 200. version.json의 배포 커밋은 38f3ffb217b75915c9cf71fdde26e0968043fec6. 공개 스냅샷은 공시 502건·뉴스 74건·12종목이다. DART key 이전은 여전히 미실행이며 기존 데이터 조회와 백테스트에는 영향 없다.


# 2026-11-03 터미널 테마 변경

검정 바탕·주황 탐색/제목·청록 데이터·녹색/빨강 수익률, 모노스페이스, 상단 메뉴, 사각 패널·입력창·조밀한 표·고정 표 헤더/내부 스크롤로 변경했다. 차트의 종목 선은 주황, 벤치마크는 청록으로 통일했다. 기존 분류/분석 로직과 데이터는 변경하지 않았다. 공시 분류는 제목 키워드 매칭이며 본문 거래 조건 파싱은 아직 구현하지 않았다.

테마 변경 검증: JS 구문·UI DOM·Python/브라우저 백테스트 비교 720개·이벤트 연구 556개 및 Pages 정적 API/경로/UI 검사를 통과했다. 실제 브라우저 시각 검증은 수행하지 않았다. 배포는 work 푸시 후 GitHub Actions 결과와 version.json으로 확인한다.

테마 코드 fa76a9f의 GitHub Pages 배포 성공(CI 41603727268). 공개 version.json 일치, index HTTP 200과 새 터미널 CSS 응답 확인.


# 2026-11-03 레퍼런스 기반 간소화

사용자 확인: 검정 배경·차분한 회색 글자. 장식 테두리/아이콘/원색 강조를 제거하고, 회색 타이포그래피와 평평한 표·패널로 정리했다. 수익률 방향은 부호와 낮은 채도의 셀 배경으로 구분한다. 차트도 회색 계열로 변경했다. 기능과 분석 로직은 유지하며 기존 UI/JS 검사와 원격 CI·배포 결과로 검증한다.

간소화 코드 bf8bd40 푸시·배포 확인. CI 41626471554 검사 통과, 공개 version.json 일치와 index/CSS HTTP 200을 확인했다. 배포 기록만 추가한 후속 문서 커밋은 CI를 생략해 기능 코드의 검증된 배포를 유지한다.


# 2026-11-03 일반 글꼴과 가시성 조정

모노스페이스 대신 시스템 산세리프 글꼴을 사용하고 작은 글씨를 소폭 확대했다. 선택 탭/선택 조건/주요 동작에만 주황 포인트를 적용하며, 본문 회색과 테두리 없는 검정 구성을 유지했다. 차트의 장식 면적 그라데이션도 제거했다. 기존 JS 구문/UI DOM 검사 후 커밋·푸시하고 원격 CI·Pages·version.json·배포 CSS로 확인한다. 실제 브라우저 시각 검증과는 구분한다.

0284fb7 푸시·Pages 배포 확인. CI 41629452456 검사 통과, 공개 version.json 커밋 일치, CSS 시스템 글꼴·포인트 색상과 JS 차트 그라데이션 제거를 HTTP 응답으로 검증했다.


# 2026-11-04 프로젝트 전체 재점검

첨부 Bloomberg Equities Workflow(29 PDF쪽)와 한국어 사용자 가이드(48 PDF쪽)의 본문 및 관련 화면을 검토하고, 전체 코드·데이터·배포·테스트 경로를 점검했다. 공시·뉴스·가격 자료와 현재 기능을 구분하고, 에이전트 중심 공통 기능·증거·시점·가설/실험/자동화 구조를 제안했다.

보고서: docs/PROJECT_REVIEW_2026-11-04.md. 기능 계약 14개 설계 초안: docs/agent-capabilities.proposed.json. 독립 재현: scripts/audit_readiness.py. 원본 PDF/추출 전문/화면 이미지는 커밋하지 않는다.

기존 Python 18개·UI DOM·백테스트 비교 720개·이벤트 연구 556개 통과. 별도 합성 사례에서는 미래 거래정지에 따른 소급 거래 제외, 가격 공백 진입, 거래량 0 출구의 이벤트 수익률, 실패 갱신의 상위 시각, 가격 이력 덮어쓰기를 확인했다. 이 문제들은 아직 수정하지 않았고, 원래 계산 정책과 테스트가 공유하는 한계를 기록했다.

공개 Pages version/JSON은 HTTP 200이고 /api/snapshot 및 /openapi.json은 HTTP 404다. 로컬 Python API와 배포된 정적 UI를 구별했다. GitHub 기본 브랜치는 main, secret 목록은 403이라 미확인이다. 키 이전이나 새로운 호스팅/주문/알림 실행은 하지 않았다.

이번 점검은 런타임 변경 없이 문서·설계 초안·재현 도구를 GitHub에 보존한다. 후속 개발의 첫 기준은 화면 개수가 아니라 신뢰 가능한 데이터 계약과 에이전트의 재현 가능한 도구 호출이다.


# 2026-11-04 외부 전략 코드 모니터링으로 경계 수정

사용자가 전략 코드에 리스크·실행·주문·백테스트 전부를 담고 대시보드는 연동/모니터링 인프라만 담당하도록 명시했다. 사용자 docs는 아직 첨부 전이므로 실행 ABI를 임의로 정하지 않았다.

관측 모델/JSON Schema, artifact 버전·해시 등록, atomic bundle import, 중복/역순·코드 충돌 거부, append-only 관측 이력과 최신 상태, 인증된 로컬 Python API·CLI·HTTP 클라이언트를 구현했다. 외부 코드 자체를 업로드/실행하거나 주문하지 않는다.

전략 라이브러리/수동 M&A/내장 고정 보유일 실행 UI와 정적 연구 가설을 제거하고 전략 코드·실행 결과 화면으로 교체했다. 공시 분류는 event_types로 분리했다. 기존 예제 연구 함수는 호환/감사 자료로 보존하되 실행 경로에서 제외했다.

Pages는 개인 결과 파일을 현재 탭으로만 읽어 리스크·지표·포지션·주문·체결·평가액·로그를 보여준다. 공개 산출물에는 등록 전략/실행 결과가 기본 포함되지 않으며 비공개 DB를 읽어 내보내지 않는다. 자세한 규격은 docs/STRATEGY_INTEGRATION.md와 schemas/strategy-runtime-v1.json이다.

외부 전략 관측 인프라 검증: Python 32개 통과(버전 불변·중복/역순·원자적 롤백·미인증 쓰기·코드 미실행·공개 산출물 개인 자료 제외 포함), 기존 UI DOM 및 Pages 파일 검증/패널/XSS/분리 검사 통과. 과거 연구 예제의 Python/JS 비교 720개와 이벤트 연구 556개도 보존해 통과했다. JSON 형식 예시의 CLI validate 통과.

배포 완료: 기능 커밋 7002b82, GitHub Actions 41743580578 성공. 공개 version.json 전체 SHA 일치, 새 메뉴·관측 모듈·스키마/예시 파일 HTTP 200, 공개 전략/실행 결과 0건 확인. 개인 실행 데이터 공개 없이 Pages 연결 예시를 제공한다. 실제 전략 코드 실행/주문은 미구현이며 사용자 docs에 맞출 어댑터가 다음 단계다.


# 2026-11-04 종합 시장·운영 터미널

사용자가 지정한 비공개 레퍼런스의 README·설계·아키텍처·전략 계약·화면 HTML/CSS를 읽었다. 문서/소스/전략/계좌 자료를 공개 저장소로 옮기지 않고, 명령 탐색·공통 context·밀도 높은 패널의 구성을 참고해 현재 앱을 재구성했다.

기본 OVERVIEW에 수집 종목·수정 일봉 캔들·뉴스·선택 실행·공급자 상태를 배치했다. MARKET/SECURITY/NEWS/FILINGS/EXECUTION/RISK/STRATEGY/ACCOUNT/DATA 화면, 공통 종목/실행 선택, GP·ORD 등 명령과 단축키를 제공한다. 공시는 한 화면으로 분리됐다. 종목 분석은 가격/뉴스/공시를 연결하고 20B/60B/ALL과 봉별 OHLCV를 표시한다. 이전 요청의 늦은 응답이 새 데이터 모드를 덮어쓰지 않게 했다.

시장 전체 지표·다른 자산군·계좌 NAV/손익/대사는 미연결이다. 외부 실행기의 리스크 정책/주문/백테스트를 대시보드에 내장하지 않았고 독립 실행을 합산하지 않는다. 비공개 엔진 연결이나 실주문은 수행하지 않았다.

검증: Python 32개·UI DOM·Pages/결과 파일/과거 연구 비교 통과. 실제 로컬 Chromium에서 1440px/390px 화면, 명령/종목 context/20봉/뉴스 검색/개인 결과 파일/리스크/overview 확인. pageerror와 문서 가로 넘침이 없고 캡처를 직접 검토했다. 원격 배포는 푸시 후 별도 확인한다.

종합 터미널 배포 완료: 기능 커밋 5f6ed81, Actions 41747207679 test/build-pages/deploy-pages success. 공개 version.json 전체 SHA 일치, 새 메뉴/명령창/공통 종목 요소와 JS 모듈 HTTP 200. 공개 전략/실행 목록은 각각 0건이다. 후속 문서 커밋은 CI 생략.


# 2026-11-04 비공개 업무 / 공개 대시보드 역할 분리

사용자가 비공개 저장소에 데이터 관리·전략 업무를 두고 모니터링 작업은 공개 저장소에서 이어가도록 지정했다. 비공개 최신 인계·서비스/조회 API·결과 저장·계좌 화면을 읽어 재개 출발점을 확인했다. 비공개 저장소에는 쓰기/커밋/푸시하지 않았고 소스/전문/전략/운영 자료를 공개 저장소로 복사하지 않았다.

공개 docs/REPOSITORY_BOUNDARY.md에 담당 범위·조회 경로·현재 형식 차이·계좌/전략 context·운영 데이터 분리를 기록하고 AGENTS/README/HANDOFF에 반영했다. /api/accounts·/api/runs·/api/data/events와 공개 /api/runtime는 자동 호환되지 않으며 어댑터가 다음 구현 대상이다. 실제 서버/DB 연결과 실행 제어는 하지 않았다.

문서만 변경했으므로 런타임 테스트/재배포는 추가로 실행하지 않는다. 로컬 링크·diff 검사 후 공개 work에만 [skip ci]로 저장한다. 기존 배포 기능 커밋은 5f6ed81이다.


# 2026-11-04 다중 패널 작업 방식과 엔진 원형 소비

사용자 지적에 따라 고정 패널 모양만 복제한 구성을 저장 가능한 다중 패널로 바꿨다. 이어진 질문을 반영해 첨부 매뉴얼의 4개 기본 패널과 별도 Launchpad를 구분했다. 기본은 분할 고정/패널별 기능 선택이고 이동/크기 조절은 배치 편집에서만 가능하다. 최대/최소/복원/닫기·다중 가격/독립 종목·정렬/배치 저장·모바일 스택을 제공한다.

비공개 엔진 형식을 기준으로 native-report 소비기를 추가했다. 계좌/실행 JSON 원형의 필드를 읽고 이전 v1 관측 스키마로 강제 변환하지 않는다. 별도 hash/sequence를 만들거나 비공개 엔진/DB를 변경하지 않았다. 계좌/자식 실행 소유권·평가 시점 및 입력 형식을 검사하며 계좌 장부/기여도·일부 오류 상태를 보존한다. 실행 가격은 같은 결과의 저장 봉만 사용한다. 파일은 탭 메모리에서만 조회하고 개인 자료는 공개 export/브라우저 저장소에 보존하지 않는다.

Python 32개, UI/Pages·새 native/window 계약 검사 및 실제 Chromium 조작/모바일 검증을 수행했다. 비공개 계좌/전략 결과 대신 자체 합성 fixtures를 사용했고 비공개에는 쓰기/푸시하지 않았다. 실제 HTTP 엔진 연결은 아직 미구현이며 후속 읽기 연동의 기준 소비 경로를 마련했다.

배포 완료: 기능 커밋 6643906, Actions 41751488203의 test/build-pages/deploy-pages success. 공개 version.json 전체 SHA 일치·창/원본 결과 모듈 HTTP 200, 공개 runtime-state 전략/실행 0건 확인. 공개 work에만 푸시했으며 배포 기록 후속 문서 커밋은 CI를 생략한다.


# 2026-11-04 전략 중심 워크스페이스·모니터링 진단·색감 강화

사용자 지시에 따라 전략 운용 검토와 종목 시장 탐색을 두 공간으로 분리했다. STRATEGY의 PORTFOLIO/STRATEGY 선택은 성과·보유·노출/집중도·체결/비용을 공유하고 기여도·전략 동행/중복·데이터 상태 패널을 추가 제공한다. 여러 native 결과 파일을 현재 탭에서 전환한다. MARKET은 ticker/source 기반이고 양쪽 배치를 따로 저장한다.

QuantConnect 실행 결과와 IBKR PortfolioAnalyst의 공개 문서를 참고하고 앱 자체 진단 정의를 docs/STRATEGY_MONITORING.md에 기록했다. 성과/낙폭·비연율 변동성·부호 있는 명목/선물 승수·집중도/HHI·ID별 수량 체결률·동일 구간 상관을 계산한다. 원천 미보고는 추정하지 않고 엔진 장부/PnL/기여도를 다시 합산하지 않는다. VaR/factor/실시간 지연/실제 대사는 미구현이다.

주황 탐색·황색 수치/성과·청록 분석·녹색/적색 방향을 더 선명하게 했다. 합성 예시는 명시적 버튼으로만 열며 실제 전략/성과가 아니다. 개인 원본/선택은 영속 저장하거나 공개 산출물에 넣지 않는다.

검증: Python 32개, UI/Pages 및 분석 edge 사례. 실제 Chromium 1440px/390px에서 공유 전략/기여도/포트폴리오 전환·차트 모드·상관·마켓 출처/배치 분리·모바일/새로고침 메모리 격리 통과. 비공개 레포/엔진에 쓰기/푸시하거나 실제 서버/브로커에 접속하지 않았다.

배포 완료: 기능 커밋 b4e3c84, Actions 41774974015 test/build-pages/deploy-pages success. 공개 version.json 전체 SHA 일치, 전략/마켓 메뉴와 strategy-analysis/strategy-ui/analysis-example 모듈 HTTP 200. 공개 기본 전략/실행 목록은 여전히 0건이며 합성 예시는 버튼으로만 생성한다. 공개 work에만 푸시하고 인계 기록 후속 커밋은 CI 생략.


# 2026-11-04 화면 번호별 모듈·공통 인터랙티브 차트

사용자 요청으로 화면 19개를 번호 모듈로 분리했다. 화면 계약 하나가 명령/aliases/메뉴/shortcut/기본 배치/렌더/mount/cleanup을 소유하며 app.js의 switch·뷰 목록·명령 목록을 제거했다. 파일 검색으로 catalog를 생성하고 공개 자산을 하위 폴더까지 빌드한다. 새 화면은 모듈 추가+catalog 재생성으로 확장한다. 중복 번호/명령/버전/파일 번호와 stale catalog를 검사한다.

공식 Bloomberg Charts 소개와 첨부 가이드의 조회/비교 방식을 참고해 차트를 공통 모듈화했다. line/candle/volume·다중 series/좌우 축·20B/60B/ALL·wheel/drag/keyboard pan/zoom·cursor·LINK 시각/구간·standalone SVG를 구현했다. 창 크기의 실제 SVG 좌표를 사용하고 선택 문맥별 메모리 viewport를 보존한다. null/누락 시각은 선을 끊고 정확하지 않은 시각·값을 만들지 않는다.

화면 mount는 AbortSignal/cleanup 경계를 갖고 오류가 다른 패널로 전파되지 않게 했다. 이벤트/observer/chart bus는 닫기·전환·오류에서 정리한다. 비공개 코드/전략/원천을 복사하거나 개인 데이터를 정적 산출물에 넣지 않았다. 엔진 실행/주문/직접 API 범위는 바꾸지 않았다.

Python 32개 및 UI/Pages/새 차트·레지스트리 계약 검사와 실제 Chromium 검증을 수행했다. 번호 호출·선/캔들/거래량·linked cursor/range·wheel/drag/keyboard·metric 변경·SVG 저장·날짜-only precision·보고 닫기/문맥 변경·모바일을 확인하고 캡처를 검토했다. 참조/API/확장 예제는 docs/SCREEN_MODULES.md 및 docs/CHART_MODULE.md에 기록했다.

배포 완료: 기능 커밋 10d576a, Actions 41780865100 test/build-pages/deploy-pages success. 공개 version.json 전체 SHA 일치, 화면 19개 및 공통 하위 모듈 총 26개 HTTP 200, 공개 runtime-state 전략/실행 0건 확인. 공개 work에만 푸시했고 배포 기록 후속 커밋은 CI 생략.
