# UNIV 0412 and condition-only CODE 0304

UNIV is an independent Analytics & Data function. Protected same-origin settings,
preview and save are capability-gated; public Pages displays no private universe
and never dispatches these writes. New rules are drafts until explicitly saved.
The provider preview keeps six-digit tickers and exact integer capital strings;
reference source/date/receipt are visible. Save sends the loaded immutable rule
revision and default generation (CAS), not a generation silently refreshed while
editing. No financial/source payload is stored in browser localStorage.

CODE normally uses `[universe] use_default=true` and the saved default pool.
Users specify dates, adjustment, listing age, rank cap and minimum observations;
there are no per-test ticker/data dropdowns. Current-cohort retrospective research
requires an explicit survivorship-bias acknowledgment. Known-at-start membership
requires an actual old snapshot on the protected host. The public screen cannot
supply or certify that history.

The exact source/policy/conditions/default revision review is invalidated when
inputs change. Save/validate remains inert. POST `/api/v1/universes/research`
passes source version + expected version, expected universe revision, conditions,
reviewed=true and stable request ID. The protected host resolves members/data and
publishes parent progress; CODE polls GET research-jobs/{id}, supports owned stop
and opens the real result. No UI no-op result, automatic brokerage order or
browser source execution. Legacy explicit policies can be converted using the
host's inert convert-policy endpoint, preserving risk/execution settings.

The frontend release includes 0304, 0411, 0412, the generic strategy skeleton and
scoped workbench CSS. Common terminal-ui remains unchanged. All tests are synthetic;
no strategy, account, credential or operational dataset is exported to Pages.

## 2026-11-08 audit fixes / universes-2

Background polling preserves the selected rule and unsaved form; it never advances
reviewed rule/default CAS. RELOAD SETTINGS explicitly renders the selected saved
rule and replaces draft edits, refreshing the revision/generation for review. LOAD
RULE on NEW RULE clears the old revision and resets the form. Requests disable
editing/load controls; editing invalidates old preview rows. Key status names the
selected real/demo environment and distinguishes presence from actual connectivity.
Public Pages remains protected-operation-free. The common package is unchanged.

The app-owned command adapter also clears stale error tooltips on a successful
command/refresh. Toast callbacks retain their own node and reset the timer rather
than querying a disposed document. Private hosts apply these small reviewed host
adapter changes; they do not mirror the public app/Pages transport wholesale.
