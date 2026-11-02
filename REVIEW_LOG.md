# Marvel Mission Control — five-round review

Started: 2026-10-31. Review mode: sequential AI personas, not independent agents or human reviewers.
Baseline: existing local 12-film prototype; hosted Site has zero saved versions. Unrelated Ask Sage work is outside scope.

## Round 1 — purpose and scope (completed)

Inspected: project README, catalog/planner, explanation API, page implementation, existing tests, and hosting status.

| Persona | Finding / decision | Evidence / action |
|---|---|---|
| Product Manager | Preserve the weekend scope: help a Marvel beginner choose a route to Infinity War. | Do not imply a complete MCU or Doomsday guide. Improve the primary journey, not feature count. |
| Solution Architect | Keep the deterministic planner separate from on-demand AI. | Existing split is appropriate; review failure handling and persisted inputs. |
| Business Analyst | Define what completion means before modifying the app. | Acceptance criteria below; distinguish planning, AI, and hosting results. |
| Data Analyst | Existing planner tests do not establish AI factual accuracy. | Add response-validation tests and expose the actual editorial notes for inspection. |
| FDE | Hosting is unverified, not a working deliverable. | Native Site lookup confirms version 0; local demo and private deployment tracked separately. |

Acceptance criteria:

1. Selected unwatched films plus an unwatched destination fit the budget; watched films are not repeated.
2. Omitted connections include context for the destination when it is in the route.
3. Saved preferences cannot create duplicate watched counts or invalid API requests.
4. Users can find details after selecting a film, inspect supporting notes, and distinguish AI drafts from editorial facts.
5. Invalid input is rejected; provider failure and invalid responses return clearly labeled editorial fallback.
6. Current planner and explanation checks, TypeScript check, and production build pass.
7. Demo instructions are reproducible; delivery status and AI limitations are honest.

Release targets: verified local demo; attempt existing owner-private deployment with preserved audience. Public sharing and broader MCU coverage are out of scope. No user-validated usability or factual-accuracy score will be claimed.

## Round 2 — working implementation (completed)

Reproduced defect: a 2.5-hour route contains Infinity War but reports zero omitted context links, although six incoming destination links exist. Fixed; regression checks now require six destination links at 2.5 hours and no gaps for the complete 30-hour route.


| Persona | Finding | Change / evidence |
|---|---|---|
| Product Manager | Selecting a movie changed content far below the map without taking the user there. | Movie selection now scrolls to and focuses its details heading; instructions describe the actual hours → watched → explore flow. Browser verification scheduled for round 4. |
| Solution Architect | Persisted preferences could contain duplicate IDs and unsupported budget increments. | Added `restorePreferences`: validate IDs, deduplicate, clamp invalid budgets to defaults, normalize half-hour steps. |
| Business Analyst | “Outside budget” conflated not selected with not affordable; destination-watched wording was confusing. | Use “Not in this route”; show destination-watched budget and route labels. |
| Data Analyst | Destination links were excluded from gap counts; AI replaced the only visible editorial note. | Include destination in gap accounting; preserve editorial notes and render AI-cited notes under sources; label AI text as a draft. |
| FDE | Provider behavior was difficult to test without paid/network calls. | Extracted the same handler used by the route into a dependency-injected service; retained server-side credentials. |

Decision: preserve the scoring rule and catalog. This round fixes explanations of the route rather than silently changing what “best” means.

## Round 3 — failures and evidence (completed for automated checks)

Inspected and executed: `scripts/test-planner.mjs`, `scripts/test-explanations.mjs`, TypeScript no-emit check.

| Persona | Review outcome | Evidence |
|---|---|---|
| Product Manager | Core planner remains usable without AI. | Missing-key, provider-error, and invalid-response tests return editorial fallback. |
| Solution Architect | Boundaries and failure behavior now have executable checks. | Foreign-origin rejection, payload limit, provider timeout/error fallback, cache reuse, and per-isolate limit tested. |
| Business Analyst | Selection status and request constraints match explicit rules. | Included/omitted/watched cases; invalid and duplicate IDs rejected; persisted state normalized before API use. |
| Data Analyst | Tightened the advertised 90-word response limit and exact response fields. | Unknown source IDs, missing selected source, malformed JSON, extra fields, null/array output, and overlong output rejected. These are structural checks, not factual entailment. |
| FDE | Code checks pass after extraction. | 305 budget/history cases plus destination-gap regressions; nine explanation/persistence groups; TypeScript exit 0. |

The provider timeout test injects a timeout error; it does not measure a real 15-second network delay. Stub usage values test reporting, not model performance. A separate live call and browser check follow.


## Round 4 — user experience and delivery (completed)

Inspected: live local browser, live Groq API response, setup instructions, and current Site audience/source helper.

| Persona | Finding / action | Evidence / status |
|---|---|---|
| Product Manager | Direct selection now makes the next action visible. | Clicking Iron Man moved focus to `film-title`, positioned within the viewport. Sources expanded to the actual editorial note. Verified. |
| Solution Architect | Live provider integration still works after the service extraction. | Local API returned AI mode with provider-reported usage (564 input, 125 output tokens; one observed 574 ms request). This is a single observation, not a performance benchmark. |
| Business Analyst | Destination-watched and short-budget behavior must match the rules. | Browser showed six omitted links at 2.5 hours, then “Destination already watched” and one watched title after toggling. Verified. |
| Data Analyst | Live prose includes subjective phrases such as “plot momentum” unsupported by the short note. | Keep the “AI draft” label and original notes; no automated entailment or factual-accuracy claim. Human-rated grounding evaluation deferred as an explicit prototype limitation. |
| FDE | Reproducible test instructions must match runtime support; review log should travel with app source. | README now specifies Node 24, both test commands, restart instructions, and a relative in-repo review-log link. Source helper prepared the existing unhosted Site without changing audience. |

Minor fixes found during UI inspection: singular “1 film” wording and preserving proper-name capitalization in omission notes. Applied; final checks follow.


## Round 5 — final recheck (completed)

Inspected the final code, prior findings, live browser results, source notes, TypeScript result, and successful Sites production build.

| Persona | Final verdict for local prototype | Evidence / limitations |
|---|---|---|
| Product Manager | Pass | Clear hours → watched → explore instructions; film selection visibly moves focus to details; 12-film scope preserved. No real-user usability study was performed. |
| Solution Architect | Pass | Deterministic planning preserved; server-only key access; testable provider boundary; request/output validation and fallback verified. In-memory limiting is not a global spend cap. |
| Business Analyst | Pass | Destination context gaps fixed, destination-watched wording verified, persisted progress survives reload, and requirements map to checks below. |
| Data Analyst | Pass for an explicitly labeled prototype | Source notes stay visible, runtime provenance remains labeled, and generated prose is identified as a draft. Structural validation does not prove entailment; the live sample still contains subjective elaboration. No accuracy or token-savings percentage claimed. |
| FDE | Pass locally; hosting pending | TypeScript and production build exit 0; live Groq response succeeds; browser console returned no error entries. Private deployment result will be recorded separately. |

### Finding register

| ID | Severity | Finding | Final status / verification |
|---|---|---|---|
| M-01 | Major | Destination context omitted from gap count | Verified: six gaps at 2.5 hours in unit test and browser. |
| M-02 | Major | Duplicate/invalid saved IDs could break explanation requests | Verified: preference tests deduplicate/filter before use; API still rejects invalid input. |
| M-03 | Major | Failure behavior and response schema lacked executable tests | Verified: nine automated groups cover errors, timeout fallback, validation, cache, rate limit, and persistence. |
| M-04 | Major | AI explanation hid its editorial basis and appeared more authoritative than warranted | Verified: source note and cited notes accessible after generation; explicit AI-draft label. Full factual evaluation remains deferred, with no claim of factual verification. |
| M-05 | Minor | Movie selection left details off-screen | Verified: focus moved to film-title and heading appeared in viewport. |
| M-06 | Minor | Misleading omitted/affordable and watched-destination wording | Verified in source, browser, and status tests. |
| M-07 | Minor | “1 films” and lowercased proper names | Fixed; final TypeScript/build passed. |
| M-08 | Major for hosted delivery only | No deployed demo | Private publishing attempted after code verification; see delivery receipt. Local functionality is unaffected. |

### Acceptance results

1. Budget/watch invariants: pass, 305 scenarios.
2. Destination gap accounting: pass, added boundary regressions and browser result.
3. Persisted input normalization: pass, automated corrupted/duplicate-state cases and reload observation.
4. Detail navigation and evidence: pass, actual browser focus and expanded source-note inspection after AI response.
5. API input/failure handling: pass, nine simulated test groups plus a separate real provider call. No claim of exhaustive failure coverage.
6. TypeScript and production build: pass, exit 0 after final code edits.
7. Handoff documentation: updated Node 24 requirement, both test commands, restart instructions, demo sequence, and limitations.

Responsive check: 390 × 844 viewport, document body width 375 with a 390-wide viewport (no page overflow). Map intentionally scrolls horizontally. Desktop viewport restored. Current browser console query returned no error entries. No full screen-reader audit was performed.

Actual rounds completed: **5** (round 1 was scope review, not a code revision). Reviews were performed sequentially by one AI assistant using five perspectives. No independent agents or humans were consulted.

Ready for user feedback: **Yes for the reviewed local prototype.** Private hosting is tracked separately. Public sharing, wider MCU coverage, rigorous human-rated grounding evaluation, and durable provider-spend protection remain outside this iteration.


# Dashboard iteration — 2026-11-01

New requested scope: dashboard-style presentation with the story map retained, supporting an accurate discussion of BI and AI. Mode: sequential five-persona reviews by one assistant.

## Dashboard round 1 — purpose and scope

| Persona | Decision |
|---|---|
| PM | Preserve movie planning as the primary use case; add metrics and exploration, not decorative charts. |
| Architect | Reuse the planner and API; derive dashboard measures locally with no new backend or model calls. |
| BA | Define highlight as view-only; scenario selection changes the actual budget. |
| Data Analyst | Topic counts overlap across films and are not a readiness score; state denominators and exclusions. |
| FDE | Preserve existing private hosting and provide an evidence-backed portfolio explanation. |

Acceptance: map retained; four measures update from the current plan; topic highlights leave the route unchanged; scenario buttons apply their budget; mobile layout and existing explanation flow remain usable; comparison avoids unsupported claims about Power BI.

## Dashboard round 2 — working implementation

Inspected: `dashboard-panels.tsx`, `dashboard.mjs`, updated page/CSS, Microsoft Copilot documentation.

| Persona | Feedback / implemented response |
|---|---|
| PM | Replace the large promotional heading with a compact overview and section navigation; keep the map before detailed analytics. |
| Architect | Scenario plans depend on watched history, not on map highlighting; memoize derivations and preserve the existing AI endpoint. |
| BA | Label unavailable-budget time as “More time needed”; label selected highlights without calling them plan filters. |
| Data Analyst | Show counts rather than invented percentages; topic rows state that a film can belong to several topics. |
| FDE | Add source-backed talking points distinguishing this React/Groq demo from Power BI itself. |

Round 2 check: TypeScript passed. New dashboard tests and browser interaction verification follow.

## Dashboard round 3 — failures and evidence

Inspected actual test output: 305 planner scenarios, 28 dashboard cases, and nine explanation/persistence groups passed. The latter simulate provider behavior and do not measure factual accuracy.

| Persona | Review and result |
|---|---|
| PM | Default plan still supplies a useful five-film route; no scope expansion needed. |
| Architect | API failure/cache/rate-limit regressions pass; dashboard interactions require no AI call. |
| BA | Browser: applying 8h changes metrics to 3 films, 6h53m, 1h7m remaining, 3/6 topics. Selecting mystical-world focus leaves that plan unchanged. |
| Data Analyst | Topic partitions and scenario consistency pass across 28 cases, including all-watched. Default 12h is 694 minutes, five films, five topics. |
| FDE | Existing explanation service tests pass; new live-provider accuracy was not evaluated. |

No additional defects found in these checks.

## Dashboard round 4 — user experience and delivery

Inspected desktop screenshot, accessibility tree, actual scenario and chart interactions, README, and talking-points document.

| Persona | Review and response |
|---|---|
| PM | Compact overview and metrics visibly precede the retained map; analysis supports the watch decision. |
| Architect | Reused components/planner/API; no additional services or secret exposure. |
| BA | Clear highlight restores the map; restored 12h reproduces initial figures. Topic action is explicitly view-only. |
| Data Analyst | UI explicitly states overlapping categories and avoids readiness percentages. Power BI comparison acknowledges existing Copilot capabilities. |
| FDE | Added dashboard operation and test instructions to README. Production build passes. |

External limitation D-01: mobile browser check timed out, then browser-control tool was unavailable after interruption. Responsive CSS inspected but new mobile behavior is **not verified**. No full accessibility audit. Desktop prototype is the verified delivery level; broader responsive acceptance remains open.

## Dashboard round 5 — final recheck

Inspected final page/components/calculation helper, actual successful production build, test outputs, and documentation. Only documentation changed after the build; application source was unchanged.

| Persona | Verdict | Evidence / limitation |
|---|---|---|
| PM | Pass for desktop prototype | Requested dashboard with retained map and usable scenario actions observed. |
| Architect | Pass | Deterministic calculations, isolated highlight state, existing explanation service regression checks. |
| BA | Pass for desktop; responsive criterion not verified | Apply-budget and view-only highlight observed; mobile check interrupted. |
| Data Analyst | Pass | Reproducible metric tests and explicit category limitations; no AI quality claims. |
| FDE | Pass for local build; private deployment tracked separately | TypeScript and production build pass; hosting receipt follows outside the deployment snapshot. |

Actual dashboard rounds completed: **5**, sequential AI perspectives, not independent agents or human reviews. No changes were needed in rounds 3 or 5; round 4 improved handoff documentation. Ready for desktop user feedback, with mobile verification outstanding. Twelve curated titles, editorial weights, AI draft accuracy, and private-only access remain limitations.
