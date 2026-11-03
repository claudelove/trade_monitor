# 작업 인계 — Catalyst

갱신일: 2026-11-03 (KST)

## 최신 사용자 결정

이벤트 트레이딩 리서치 앱을 확인하며 수정하는 동안 별도 도메인·GCP·Render 없이 GitHub만 사용하고 싶다고 요청했다. GitHub Pages + Actions로 전환한다. GCP 프로젝트 ID는 krx-dashboard-513607이지만 배포는 보류하며 자원을 생성하지 않았다.

## 저장소와 현재 상태

- 저장소 https://github.com/claudelove/trade_monitor, 작업 브랜치 work. main은 초기 커밋이며 자동 병합하지 않는다.
- 최초 기능 5fa9d8c, 복구/Docker 기준 96b2ed6.
- 공개 예상 주소 https://claudelove.github.io/trade_monitor/ (배포 결과로 확인 필요).
- 작업 도중 관리형 클라우드 실행 환경이 unavailable로 바뀌어 GitHub API로 0896489를 저장했다. 이후 환경 연결이 복구돼 로컬 draft를 stash 보존하고 원격 0896489로 fast-forward 했다.
- Pages 설정 자동 활성화는 Actions에서 시도한다. 부족한 관리 권한은 사용자가 Settings → Pages에서 Source=GitHub Actions로 한 번 지정해야 한다.
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
- 사용자가 Pages Source를 GitHub Actions로 지정했다. 재배포는 github-pages 환경의 브랜치 정책이 main만 허용해서 실행 전에 차단됐다. work 추가 요청 중이다. 도구의 환경 정책 변경은 HTTP 403으로 거절됐다.
- 실제 브라우저 시각 검증 미수행. 지원되는 브라우저 도구가 없었다.

## 다음 행동

1. 새 Pages 변경 커밋의 Prototype checks/test, build-pages, deploy-pages 결과 확인.
2. Pages 설정 권한 오류면 Source=GitHub Actions 활성화 후 재실행. 배포 URL과 version.json HTTP/커밋 확인 뒤 이 문서에 결과 기록.
3. 필요 시 기본 브랜치 work 설정과 Actions secret 등록 후 수동 수집 확인.
4. 화면 피드백 → 관련 테스트 → 인계 갱신 → 커밋·푸시를 유지한다.

## 계정 설정 대기 (2026-11-03)

사용자에게 Settings → Environments → github-pages → Deployment branches and tags에 work 브랜치 추가를 요청했다. 완료 응답 후 run 41601438353의 실패 job을 재실행한다. Pages 최초 활성화는 완료됐지만 앱 배포 성공과 HTTP 응답은 아직 확인하지 못했다. Repository default branch 변경도 HTTP 403이므로 main을 유지한다.
