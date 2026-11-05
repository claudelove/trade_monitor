# DATAFLOW 0411 — protected data service UI

Analytics & Data includes **0411 DATAFLOW / Data Research & Recording**. This repository owns the numbered descriptor, CODE dataset labels, form layout and synthetic DOM tests. Backend implementations and real data/credentials are not published here. The common terminal-ui package remains unchanged; screen releases are separate from common-package updates.

The workflow is daily historical equity data request → immutable dataset in CODE → exact-version research and BTRESULT inspection → explicit human review → a shared strategy recording policy. Multiple strategies can request the same symbols; stopping one owner's recording request must not imply stopping a strategy or cancelling an order. Result quality is not inferred from an in-sample profit threshold.

Protected same-origin contract `data-pipeline-1`:

- GET `/api/v1/data/status`: bounded jobs (`id,status,request,result,error`), 100-policy pages (`after_strategy`) or exact strategy search (`strategy`), recording (`strategy_id,generation,enabled,symbols,expires_at,run_id`), role/source states, dataset metadata and audit. No secrets/raw archives in this response.
- POST `/api/v1/data/history`: `{request_id,request:{symbols,start,end,adjustment}}`. The browser creates a stable 32-hex request identity and retains it for an unconfirmed retry of unchanged input. Server queues bounded data retrieval; HTTP does not wait for KIS. `adjustment` is `original` or `adjusted`.
- POST `/api/v1/data/recording/review`: `{strategy_id,research_job_id,expected_generation,expires_days,review_note,reviewed:true}`. Server must verify a completed non-synthetic, source-reviewed job against its own immutable dataset/result. UI filtering is not server authorization. A recording review is never live-strategy activation.
- POST `/api/v1/data/recording/disable`: `{strategy_id,expected_generation}`. Disable one recording owner with generation CAS; preserve other strategies' shared subscriptions.

Same admin/Origin/Host policy applies. The public Pages adapter still rejects these APIs before any network request and keeps the form disabled. No private endpoint URL, key, strategy code, sample account or trading logic is embedded. The pre-existing public Python backend is not this protected service.

CODE marks datasets with `point_in_time:false` as **RETROSPECTIVE · NOT POINT-IN-TIME**. Availability, source completeness, adjustment history and true execution support are server responsibilities. DATAFLOW shows requested policies separately from effective worker/transport/source state. WebSocket receipt is not verified exchange sequencing; REST samples cannot establish continuity. Preserve missing/failure/gap states and never label this UI live-ready because credentials were entered.

No financial/source data is persisted in browser storage. Forms use current pane memory only. Observed date spans/bar counts remain distinct from the requested period. Module cleanup aborts/ignores late responses, removes listeners and clears its refresh timer. Reuse the shared table formatter, tokens and existing window manager. The application form layout remains in workbench.css; new functions do not require common-library code changes.
