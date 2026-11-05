# Financial display contract corrections

The deployed preview is intentionally disconnected from private services. Its empty account/book/OMS states are not proof that an engine function ran. Protected-function checks used a separate synthetic host; no private runtime payload is included here.

| Function | Observed fault | Correction |
| --- | --- | --- |
| 0405 BOOK | Valid canonical decimal-string bid/ask prices rendered as unavailable | Explicit exact-decimal display adapter and numeric alignment; raw strings and unknown stream/session quality retained |
| 0503 OMS | Valid string limit price rendered as unavailable | Same typed adapter; ACK/fill/order state semantics unchanged |
| 0501 BLOTTER | Actual unfilled source state missing from selectable states | Include unfilled, preserving original engine records |
| 0502 FILLS | Order-status filtering could discard every actual fill because fills have no status field | Remove that control for fill tape and ignore an old in-memory order filter |

The common number formatter remains strict: identifier strings such as 005930 are not globally converted to numbers. The new adapter is used only for schema-declared decimal financial fields, preserves values beyond JavaScript's safe integer range and ten-place fractions, rejects nonfinite/malformed data and never rewrites source payloads. No new API route or private-host configuration is embedded in Pages.

Regression fixture values are explicitly synthetic. Browser checks and automated tests cover price presence, source immutability, raw lineage, unknown continuity and fill-specific filtering. Both host copies use identical reviewed adapter/screen/view bytes; common library and styling remain pinned unchanged.
