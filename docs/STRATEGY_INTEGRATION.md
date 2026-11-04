# 현재 우선 계약

비공개 엔진의 기존 계좌/실행 JSON이 기준이다. 현재 워크스페이스의 결과 파일 열기는 그 원형을 읽는다. /api/runtime v1은 이전 파일/클라이언트의 호환 경로이며 비공개 엔진에 이 형식이나 필수 sequence/hash를 요구하지 않는다. 자세한 경계는 [REPOSITORY_BOUNDARY.md](REPOSITORY_BOUNDARY.md), 새 소비 경로는 [NATIVE_REPORTS.md](NATIVE_REPORTS.md)를 참고한다. 직접 HTTP 연결은 미구현이다.

# 외부 전략 코드 연동 v1 — 모니터링 경계

갱신: 2026-11-04. 사용자가 제공할 전략 실행 docs가 우선이며, 이 문서는 그 실행 ABI를 대신 정의하지 않는다. 현재 구현한 v1은 **관측/결과 전송 규격**이다. 코드의 실행 진입점·이벤트 콜백·브로커/백테스터 인터페이스는 docs를 받은 후 어댑터로 연결한다.

## 책임

| 외부 전략 코드/실행기 | Catalyst 모니터 |
| --- | --- |
| 신호, 진입/청산, 리스크 정책/한도 | 코드 ID·버전·보고된 SHA256 등록 |
| 포지션/자금 관리, 주문 종류/라우팅/취소 | 실행 상태·리스크·포지션·주문·체결 관측 |
| 데이터 선택, 백테스트/체결/비용 모델 | 지표·평가액·로그·데이터 버전 표시 |
| 실제 실행과 중단/재개 결정 | 스냅샷 중복/순서/코드 식별자 검사와 이력 저장 |

대시보드는 리스크 값을 재판정하거나 주문을 생성하지 않는다. 전략별 설정 폼·매매 규칙을 앱에 내장하지 않는다. 코드 등록은 메타데이터 등록이며 코드 읽기/업로드/실행이 아니다. `code_ref`는 표시용 식별 정보이고 동적 import, eval, shell 실행에 사용하지 않는다. SHA256도 외부에서 보고한 값이며 앱이 원격 코드 내용을 다운로드해 검증한 값이 아니다.

## 구현 경로

- Python 모델/서비스/CLI: monitor/integration.py
- 에이전트·실행기용 HTTP 클라이언트: monitor/client.py
- 고정 JSON Schema: schemas/strategy-runtime-v1.json
- 가상 보고 형식 예시: schemas/strategy-runtime-example.json (실행 코드 없음)
- UI: 전략 코드 / 실행·결과
- 공개 Pages: 개인 결과 파일을 현재 탭에서만 조회. 백엔드로 전송하거나 localStorage에 저장하지 않는다.

코드 내용과 실행기는 아직 연결하지 않았으므로 `execution_adapter=not_connected`, `strategy_execution_abi=pending_user_documentation`을 반환한다. 보고된 `mode=live`는 실거래 보고라는 구분이지 이 시스템이 실거래를 시작했다는 뜻이 아니다.

## 관측 규격

루트는 `schema_version`, `strategies`, `runs`다. 전략 manifest에는 ID·이름·버전·code_ref·code_sha256·declared_modes·설명을 넣는다. run은 실행 전체의 현재 스냅샷이며 변경 patch가 아니다.

필수 실행 식별자: snapshot_id, run_id, strategy_id, strategy_version, code_sha256, sequence, mode, status, as_of.

- mode: backtest / paper / live. 상태: created / running / paused / completed / failed / stopped.
- metrics: 외부 코드가 정의한 key·label·value·unit. 고정된 전략/성과 지표를 강제하지 않는다.
- risks: 외부 코드가 보고한 상태·관측값·한도·단위. 한도를 앱이 계산/강제하지 않는다.
- positions / orders / fills: 현재 포지션, 주문, 체결 보고. order_type과 주문 status는 실행기 표현을 사용한다.
- equity / logs: 보고된 평가액 이력과 실행 로그.
- data_snapshot_id: 외부 실행의 입력 데이터 버전. 생략하면 UI에 미보고로 표시한다.

시각에는 시간대가 필요하고 숫자는 유한 값이어야 한다. 목록 상한과 필드 규격은 JSON Schema를 따른다. 새로운 실행 프로토콜이 필요하면 v1에 사업 규칙을 덧붙이지 않고 어댑터/버전으로 확장한다. 여러 자산/복합 주문/정정 체결 등은 사용자 docs를 검토해 매핑한다.

## 저장 규칙

- 전략 ID+버전은 불변이다. 같은 버전의 메타데이터/해시를 바꾸면 충돌을 반환한다.
- run_id의 전략 ID·버전·해시·mode는 불변이다. 다른 실행에는 새 run_id를 쓴다.
- sequence는 증가하고 as_of는 역행하지 않는다.
- 동일 snapshot_id와 동일 정규화 payload 재전송은 중복으로 받아들이되 다시 저장하지 않는다. 같은 ID에 다른 payload는 409다.
- 등록과 관측은 SQLite 단일 트랜잭션으로 처리한다. 일부 관측이 잘못되면 같은 bundle의 변경 전체를 롤백한다.
- 최신 상태와 원래 관측 이력을 별도 테이블에 둔다. 수신 시각 received_at도 저장한다.
- 상태 화면은 보고된 시각을 표시한다. 단지 `running`이라는 오래된 보고가 있다고 실시간 연결 정상이라고 단정하지 않는다.

## 로컬/비공개 Python API

```text
GET  /api/runtime/contract
GET  /api/runtime/example
GET  /api/runtime/state
POST /api/runtime/bundles
GET  /api/runtime/runs/{run_id}/observations?after_sequence=0&limit=100
```

POST는 기존 MONITOR_PASSWORD 인증이 설정되어 있어야 한다. 미설정이면 503, 인증 누락/오류는 401, 형식 오류는 422, 충돌은 409다. GET도 비밀번호가 설정되면 기존 인증 게이트를 따른다. 외부 호스팅은 HTTPS와 인증을 사용하며, 비밀 값은 Git/보고 데이터에 포함하지 않는다. 모니터링 API만 구현했고 주문/실행 요청 API는 없다.

Python 연동 예:

```python
import os
from monitor.client import MonitorClient

client = MonitorClient(
    "http://127.0.0.1:8000",
    username=os.environ.get("MONITOR_USERNAME", "research"),
    password=os.environ["MONITOR_PASSWORD"],
)
# 외부 실행기가 만든 artifact/실행 스냅샷을 bundle에 담는다.
# 첫 보고에서는 strategies에 manifest를 포함하고, 이후에는 이미 등록됐다면 생략 가능하다.
client.publish(bundle)
latest = client.state()
```

클라이언트는 보고만 전달한다. 외부 코드에 새 signal/risk/order 정책을 삽입하지 않는다. HTTP는 localhost용으로만 허용하고 원격에는 HTTPS를 요구한다. 자격 증명을 URL에 넣지 않는다.

## CLI / 파일 어댑터

```bash
.venv/bin/python -m monitor.integration schema
.venv/bin/python -m monitor.integration validate --path schemas/strategy-runtime-example.json
MONITOR_DB=work/runtime-demo.db .venv/bin/python -m monitor.integration import --path schemas/strategy-runtime-example.json
MONITOR_DB=work/runtime-demo.db .venv/bin/python -m monitor.integration state
```

예시는 주문이 아니라 가상 보고 레코드다. 서버를 띄울 경우 같은 MONITOR_DB를 사용한다. 실제 전략 코드/문서에 맞춘 어댑터는 추후 추가한다.

Pages에서 보는 방법:

1. 전략 코드 → 형식 예시 다운로드로 규격을 확인한다.
2. 외부 실행기가 같은 형식의 JSON을 파일로 만든다.
3. 전략 코드 → 실행 결과 파일 열기로 조회한다.
4. 실행·결과에서 리스크·포지션·주문·체결·지표·로그를 확인한다.

브라우저 파일 조회는 standalone bundle이므로 참조하는 manifest를 파일 안에 포함한다. 5MB 이하이며 현재 탭에서만 유지한다. 잘못된 파일이면 기존 화면 상태를 바꾸지 않는다. 파일을 열어도 코드/주문은 실행되지 않는다. 공개 페이지이므로 해당 파일을 저장소에 커밋해 업로드하는 방식으로 공유하지 않는다.

## 공개/비공개 분리

Pages 빌드는 runtime-state.json을 항상 빈 목록으로 생성한다. 로컬 운영 DB의 전략·주문·포지션·로그를 읽어 공개하지 않는다. 시장 데이터 export도 기존 허용 필드만 사용하므로 runtime 테이블이 섞이지 않는다. 실제 개인 자료는 비공개 API/DB나 현재 탭에 보관한다.

## 기존 프로토타입 정리

- 전략 라이브러리/공개매수 수동 계산/내장 이벤트별 백테스트 UI를 외부 코드·실행 결과 화면으로 대체했다.
- /api/backtest와 정적 API의 내장 전략 실행은 종료했다. 기존 잘 알려진 연구 모형을 실제 전략 실행기로 오해하지 않도록 한다.
- 문서 제목 분류는 monitor/event_types.py로 분리했다. 원시 자료의 strategy 키는 과거 데이터 호환용 분류 별칭이며 실행 전략 ID가 아니다. 신규 필드는 event_type이다.
- monitor/strategies.py는 과거 예제/테스트용 호환 import다. 전략 정책을 제공하지 않는다.
- 과거 monitor/analytics.py와 web/analytics.js의 롱온리 예제 계산은 보존했으나 현재 전략 실행/결과 화면에서는 호출하지 않는다. 감사에서 발견한 금융 모형 한계를 해결했다고 주장하지 않는다.

사용자가 준비한 docs가 도착하면 이 경계에 실행기의 native 형식을 맞추고, 코드 패키징·백테스트/실행 진입점·상태 콜백을 문서에 따라 연결한다. 지금 정한 것은 모니터링 관측 인프라까지다.
