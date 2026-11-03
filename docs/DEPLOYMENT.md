# GitHub Pages로 프로토타입 보기

사용자는 별도 도메인이나 GCP/Render 없이 GitHub에서만 화면을 확인하며 수정하기를 원한다. 현재 기본 배포 방식은 GitHub Pages다. Python 서버 배포 구성은 향후 확장용으로 보존한다.

## 구조

- Pages: 공개 스냅샷을 읽는 대시보드, 공시/뉴스 링크, 가격 차트, 필터/관심 목록/위젯, 시나리오 계산, 브라우저 백테스트.
- Actions: Python 테스트·브라우저 엔진 정합성 검사·정적 산출물 빌드·Pages 배포.
- 데이터 갱신 Actions: Python DART/뉴스/pykrx 수집 → 허용된 공개 필드만 스냅샷으로 커밋 → Pages 재배포.
- API 키는 브라우저에 전달하지 않는다. Pages는 Python 서버·실시간 호가·계좌 기능을 제공하지 않는다.

## 최초 Pages 활성화

현재 주소는 **https://claudelove.github.io/trade_monitor/** 이다. 2026-11-03 17:23 KST 배포 성공 및 HTML·스크립트·데이터·version.json HTTP 200 확인. 확인된 코드 배포 커밋은 38f3ffb다. 이 저장소의 최초 Pages 활성화와 work 환경 허용은 이미 완료했다. 아래는 새 저장소/복구 시 참고 절차다.

Actions에서 Pages 활성화를 시도한다. GitHub 기본 토큰으로 사이트 생성 권한이 부족하면 계정 소유자가 [Settings → Pages](https://github.com/claudelove/trade_monitor/settings/pages)에서 Source를 **GitHub Actions**로 한 번 지정하고 최신 Prototype checks 실행을 재실행한다. 별도 도메인은 필요 없다.

공개 저장소이므로 사이트와 공개 데이터도 누구나 볼 수 있다. 개인 계좌·포지션·메모·라이선스가 제한된 데이터는 공개 스냅샷에 추가하지 않는다. Python 서버의 Basic 인증은 정적 Pages에는 적용되지 않는다.

## 데이터 수집

1. [Actions secrets](https://github.com/claudelove/trade_monitor/settings/secrets/actions)에 DART_API_KEY를 암호화된 repository secret으로 설정한다. 소스 파일이나 채팅에 입력하지 않는다.
2. [Refresh public market snapshot](https://github.com/claudelove/trade_monitor/actions/workflows/collect-live.yml)을 실행한다. work 브랜치, 날짜·종목·뉴스 검색어를 선택한다.
3. 수집 결과가 fixtures/bootstrap-live.json에 기록되고 Pages가 재배포된다. 화면에는 실제 수집 스냅샷 시각을 표시한다.

workflow_dispatch는 워크플로 파일이 기본 브랜치에 있어야 한다. 현재 기본 브랜치가 main의 초기 커밋이면, 수동 수집을 사용하려면 저장소 Settings → General → Default branch를 work로 바꾼다. 이 설정은 main 병합과 별개다. 초기 화면·기존 데이터·백테스트 조회는 DART secret 없이 가능하다.

현재 수집은 수동 실행이다. 주기 스케줄은 설정하지 않았다. Actions의 접근·사용량·서비스 제한에 따라 작업이 지연되거나 실패할 수 있다. 수집 실패 시 기존 스냅샷을 보존하고 공급자 상태를 표시한다.

## 화면 수정

work에 커밋/푸시 → Prototype checks → Python/DOM/정합성 검사 → 정적 빌드 → Pages 배포. version.json으로 배포 커밋을 확인한다. 업데이트 후 같은 주소를 새로고침한다.

수집 워크플로의 GITHUB_TOKEN 커밋은 다른 push 워크플로를 자동 실행하지 않으므로, 수집 워크플로가 직접 빌드·배포까지 수행하도록 구성했다. 동시 수집/배포는 공통 concurrency 그룹으로 직렬화한다. 원격 브랜치가 먼저 변경되면 강제 푸시하지 않고 실패한다.

## 환경/채팅이 사라져도 보존되는 것

코드·공개 스냅샷·배포 워크플로·인계 문서는 GitHub에 있다. 사이트는 Codex의 임시 환경과 독립적으로 제공된다. 비밀 값은 Actions secrets에 따로 보관한다. 관심 목록과 위젯 설정은 각 브라우저 localStorage에 남는다.

Python 서버를 다시 운영할 때는 기존 README 실행법과 monitor.recovery restore를 사용한다. Render 안내는 docs/DEPLOYMENT_RENDER.md에 보관했다. GCP 프로젝트 krx-dashboard-513607은 사용자 선택 변경으로 배포를 보류했으며, 이 작업에서는 GCP 자원을 생성하지 않았다.

## 로컬 정적 빌드/검증

```bash
python scripts/build_pages.py
.venv/bin/python -m pytest -q
npm ci
npm run test:ui
npm run test:pages
```

test:pages는 Python 엔진의 golden 결과를 생성해 JavaScript 엔진과 수익률·체결·제외 사유·MDD·이벤트 연구 결과를 비교한다. 실제 브라우저의 시각적 검증과 별개다.
