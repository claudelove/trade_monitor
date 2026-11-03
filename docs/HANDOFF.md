# 작업 인계 — Catalyst

갱신일: 2026-11-03 (KST)

## 최신 사용자 결정

이벤트 트레이딩 리서치 앱을 확인하며 수정하는 동안 별도 도메인·GCP·Render 없이 GitHub만 사용하고 싶다고 요청했다. GitHub Pages + Actions로 전환한다. GCP 프로젝트 ID는 krx-dashboard-513607이지만 배포는 보류하며 자원을 생성하지 않았다.

## 저장소와 현재 상태

- 저장소 https://github.com/claudelove/trade_monitor, 작업 브랜치 work. main은 초기 커밋이며 자동 병합하지 않는다.
- 최초 기능 5fa9d8c, 복구/Docker 기준 96b2ed6.
- **배포 주소: https://claudelove.github.io/trade_monitor/**. 2026-11-03 17:23 KST HTTP 200 확인.
- 확인된 배포 커밋: 38f3ffb217b75915c9cf71fdde26e0968043fec6. version.json과 일치. CI 실행 41602592661의 test/build-pages/deploy-pages 모두 success.
- 작업 도중 관리형 클라우드 실행 환경이 unavailable로 바뀌어 GitHub API로 0896489를 저장했다. 이후 환경 연결이 복구돼 로컬 draft를 stash 보존하고 원격 0896489로 fast-forward 했다.
- 사용자가 Pages Source=GitHub Actions 및 github-pages 환경 허용 브랜치 work 설정을 완료했다. 현재 자동 Pages 배포 정상 동작.
- repository default branch가 main이면 workflow_dispatch 수집 기능을 위해 work로 변경하거나 향후 명시적으로 워크플로를 main에 반영해야 한다. 기본 브랜치를 자동 변경했다고 가정하지 않는다.
- DART key의 Actions secret 이전은 미완료. 자동 승인 심사가 해당 키/목적지에 대한 명시적 허용 부족으로 전송을 거절했다. 사용자에게 별도 허용을 요청했으며, 사용자는 키 유출 위험을 질문해 답변한 상태다. 질문을 전송 허용으로 간주하지 않는다. 기존 화면/백테스트는 키 없이 공개 스냅샷만으로 동작한다.

## 기능

FastAPI·SQLite 기반 원래 Python 앱은 보존했다. 검색·필터·CSV·관심 목록·위젯, 5개 이벤트 전략 분류·검토 항목, DART 원문·뉴스, 전후 차트·초과수익, M&A 수동 시나리오, 롱온리 이벤트 백테스트를 지원한다.

Pages에서는 web/static-api.js가 공개 JSON을 읽고 web/analytics.js가 브라우저에서 이벤트 연구·백테스트를 계산한다. scripts/build_pages.py는 상대 경로로 정적 산출물을 만들며 Python 서버는 실행하지 않는다. Python/브라우저 엔진의 정합성 검사를 tests/pages_fixtures.py와 tests/pages.mjs에 추가했다.

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

1. 사용자의 공개 Pages 화면 피드백을 받아 수정. 확인된 코드 배포는 38f3ffb, 그 이후 문서 커밋은 별도 자동 실행 여부 확인.
2. 코드 수정 시 test/build-pages/deploy-pages 및 version.json 커밋을 확인. 계정 Pages 설정은 완료돼 다시 요청할 필요 없음.
3. 필요 시 기본 브랜치 work 설정과 Actions secret 등록 후 수동 수집 확인.
4. 화면 피드백 → 관련 테스트 → 인계 갱신 → 커밋·푸시를 유지한다.

## 계정 설정 결과 (2026-11-03)

Pages Source=GitHub Actions 및 환경의 work 브랜치 허용은 사용자 설정으로 완료됐다. Repository default branch는 main 그대로다. 수동 수집 workflow_dispatch와 DART Actions secret은 별도 설정/명시적 허용이 필요하므로 현재 완료됐다고 말하지 않는다. 사이트 열람·기존 스냅샷·백테스트에는 필요 없다.

## 최신 화면 변경 (2026-11-03)

사용자 요청으로 Bloomberg Terminal 스타일의 검정/주황/청록 테마로 변경했다. 상단 가로 메뉴, 모노스페이스, 사각 테두리, 촘촘한 표와 고정 헤더·내부 스크롤, 차트 색상을 적용했다. Catalyst 명칭과 기존 기능을 유지한다.

공시 분류는 monitor/strategies.py의 제목 정규화+키워드 최초 일치 규칙이다. 본문/금액/조건 파싱이나 복합 이벤트 다중 분류가 아니다. 이번 요청에서는 테마만 수정했고 분류 규칙과 분석 계산은 변경하지 않았다.

테마 변경 검증: JS 구문·UI DOM·Python/브라우저 백테스트 비교 720개·이벤트 연구 556개 및 Pages 정적 API/경로/UI 검사를 통과했다. 실제 브라우저 시각 검증은 수행하지 않았다. 배포는 work 푸시 후 GitHub Actions 결과와 version.json으로 확인한다.
