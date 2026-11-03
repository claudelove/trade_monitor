# Render에서 개인용 프로토타입 배포

## 최초 연결

[Render 배포 설정 열기](https://render.com/deploy?repo=https://github.com/claudelove/trade_monitor/tree/work)

1. Render에 로그인하고 GitHub 저장소 접근을 허용한다. 비공개 저장소라면 해당 저장소 접근 권한도 필요하다.
2. `work` 브랜치의 `render.yaml` Blueprint를 선택한다. 자동 인식되지 않으면 Render의 **New → Blueprint**에서 저장소·브랜치 `work`·파일 `render.yaml`을 선택한다.
3. Starter 웹 서비스와 1GB 영속 디스크의 **표시된 요금을 확인**한 뒤 생성한다. 무료 플랜은 이 영속 디스크 구성에 해당하지 않는다.
4. DART_API_KEY를 Render의 비밀 환경 변수로 입력한다. **이 Codex 채팅의 환경 변수를 변경할 필요는 없다.** 값은 GitHub/채팅에 붙여넣지 않는다.
5. 배포가 성공하면 Render가 발급한 HTTPS 주소를 연다. 사용자명은 `research`, 비밀번호는 Render가 자동 생성한 `MONITOR_PASSWORD`다. Render Environment 화면에서 본인만 확인한다.
6. URL·서비스 ID를 docs/HANDOFF.md에 기록한다. 비밀번호·API 키는 기록하지 않는다.

Render 계정 연결/API 자격 증명이 이 작업 환경에는 없어 최초 생성은 아직 수행하지 않았다. 위 링크는 **배포 설정 링크**이고, 이미 가동 중인 앱의 주소가 아니다.

## 적용 설정

- Docker가 Render의 `PORT`를 읽어 0.0.0.0에서 단일 워커로 실행한다.
- 상태 확인 `/healthz`만 비밀번호 없이 HTTP 200을 반환한다. 앱·데이터·`/api/health`·API 문서는 인증 대상이다.
- `MONITOR_REQUIRE_AUTH=1`: 비밀번호 누락 시 시작 실패로 처리해 인증 없는 공개 실행을 방지한다.
- `MONITOR_DB=/var/data/monitor.db`: SQLite는 1GB 영속 디스크에 보관한다. 디스크가 추가된 단일 인스턴스이므로 재배포 시 잠깐 중단될 수 있다.
- `MONITOR_BOOTSTRAP=/app/fixtures/bootstrap-live.json`: 빈 DB에서만 기준 스냅샷을 복원한다. 기존 운영 DB는 덮어쓰지 않는다.
- `autoDeployTrigger=checksPass`: GitHub의 work 브랜치에 푸시한 커밋의 검사 통과 후 배포한다. Render GitHub 연결에서 체크 접근 권한이 필요하다.
- 인증키가 없거나 유효하지 않아도 기존 스냅샷 조회·데모는 가능하고, DART 신규 수집만 실패 상태가 된다.
- 환경 변수 변경·재배포는 SQLite를 초기화하지 않는다. **서비스/디스크를 삭제하거나 마운트 경로를 바꾸면 보존되지 않을 수 있다.**

## 수정 → 확인

1. 코드 수정, 관련 테스트 실행.
2. docs/HANDOFF.md 업데이트, work 브랜치 커밋·푸시.
3. GitHub Actions의 Prototype checks 성공 확인.
4. Render 이벤트 로그에서 **동일 커밋** 배포 성공 확인.
5. 같은 HTTPS 주소를 새로고침하여 결과 확인.

배포 실패 시 기존 URL의 마지막 정상 버전이 유지되는지 Render에서 확인한다. 실패 로그에 비밀 값이 포함될 수 있으므로 로그 전체를 무분별하게 복사하지 않는다. 이전 커밋으로 되돌릴 때는 Git revert로 이력을 남기고 다시 검사·배포한다.

## 데이터 보존과 복구

GitHub에 저장되는 것: 코드, 배포 정의, 테스트, 인계 문서, 2026-11-03 공개 시장 기준 스냅샷.

GitHub에 저장되지 않는 것: API 키·로그인 비밀번호, 운영 DB의 이후 갱신분, 브라우저 로컬 관심 목록/위젯 설정.

공개 데이터 기준 스냅샷을 갱신할 때:

```bash
.venv/bin/python -m monitor.recovery export --path fixtures/bootstrap-live.json
```

출력 파일을 검토하고 비밀 값 검사를 통과한 뒤 커밋·푸시한다. export는 공시·일봉·뉴스·공급자 상태의 허용된 필드만 저장한다. 개인 계좌/포지션/메모 데이터를 이 경로로 저장하면 안 된다.

새 환경에서 현재 기준 스냅샷 복구:

```bash
python -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m monitor.recovery restore
.venv/bin/uvicorn monitor.app:app --host 127.0.0.1 --port 8000 --workers 1
```

기존 DB가 있으면 restore는 아무것도 덮어쓰지 않는다. 웹 배포 Docker에서는 첫 부팅에 자동 수행한다. 스냅샷 시각은 그대로 유지하며, 공급자 상태에 Git 기준 스냅샷 복원을 표시한다.

운영 DB의 최신 상태는 별도 백업이 필요하다. Render Shell에서 Python 표준 sqlite3의 `Connection.backup()`으로 `/var/data/`에 시각별 `.db`를 만들고 플랫폼의 보관/다운로드 수단으로 다른 저장소에 보관한다. 실행 중인 WAL DB는 DB 파일 하나만 단순 복사하면 최근 변경이 누락될 수 있다. 플랫폼 디스크 스냅샷/복구는 Render 정책과 제공 기능을 확인한다. **현재 자동 외부 DB 백업은 구성하지 않았다.**

## 새 채팅에 전달할 문장

> GitHub claudelove/trade_monitor의 work 브랜치에서 작업을 이어가자. AGENTS.md와 docs/HANDOFF.md, docs/DEPLOYMENT.md, README.md, REPORT.md를 먼저 읽고 현재 배포 상태를 확인해. 비밀 값은 출력하지 말고, 변경사항·인계 기록을 테스트 후 커밋·푸시해.
