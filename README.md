# Marvel Mission Control

A beginner-friendly, interactive viewing map for a curated route to **Avengers: Infinity War**. It uses 12 movie records, explicit editorial connection notes, a deterministic budget planner, and Groq explanation drafts based on retrieved editorial notes.

## Run

Use Node 24 LTS and npm (the explanation tests use native TypeScript support).

```sh
npm ci
cp .env.example .env.local
# Set GROQ_API_KEY in .env.local; never commit it.
npm run dev
```

Open the local URL printed in the terminal. Without a key, movie explanations use clearly labeled editorial notes. The planner always works without AI.

## Architecture

`lib/catalog.json` → `lib/planner.mjs` → `app/page.tsx`

The browser tracks watched movies and the time budget in local storage on this device. No account or shared user database is used. The planner enumerates at most 2,048 subsets of 11 background movies. It reserves the destination runtime unless watched, maximizes new topic coverage × 20 plus editorial weights and connected pairs × 2, breaks ties using less time, and returns release order. Connections are soft context links, not mandatory dependencies. Skipped context is surfaced rather than hidden.

`POST /api/explain` → validate request → calculate plan → retrieve selected movie and incoming connection notes → call Groq → validate response structure/source IDs → return explanation and real usage.

This is a **bounded workflow**, not an autonomous agent. The harness includes input validation, a 15-second timeout, an output limit, a small in-memory cache, response validation, and a labeled non-AI fallback. Groq currently serves `openai/gpt-oss-20b` with strict JSON output and low reasoning effort. Selection status is prepended by code rather than delegated to the model. A per-isolate rate limiter reduces accidental repeated calls; it is not a global spending cap. Keep the hosted demo private until durable abuse protection and provider spend controls are configured.

## Data and attribution

Source catalog: [Kaggle MCU and Marvel media dataset](https://www.kaggle.com/datasets/vanshkumar007/mcu-and-marvel-media-complete-dataset). Movie poster URLs come from the supplied TMDB fields; images belong to their respective owners. This is an unofficial fan learning project, not affiliated with Marvel, Disney, or TMDB. Source redistribution and image reuse permissions should be reviewed before public distribution.

The parent `scripts/build_catalog.py` records the selected titles and editorial notes and generates the app catalog. Eight Disney movie pages support corresponding runtime/setting checks. Other entries preserve the source runtimes with their provenance explicitly labeled; their links are title references rather than claims of independent runtime verification. Release order and relationship weights are editorial. The graph is not a complete chronology and does not claim an official essential viewing route.

Raw Kaggle RAG plot documents are not sent to the model: they may contain errors or spoilers. The smaller curated notes are retrieved instead. The app minimizes plot details but makes no guarantee of zero spoilers; source pages can contain spoilers. Output validation checks shape and source IDs, not factual entailment.

## Verification

```sh
node scripts/test-planner.mjs
node scripts/test-explanations.mjs
npx tsc --noEmit
npm run build
```

The planner test covers 305 budget/history combinations, exact destination-runtime boundaries, unknown IDs, invalid budgets, unique catalog IDs, and forward-only connections. The read-only WebMCP tool `get_marvel_watch_plan` exposes the same visible plan to compatible browsers without changing state or making AI calls.

## Demo sequence

1. Start at 12 hours. Inspect the recommended route and its missing story background.
2. Move to 8 hours, then 20. Explain the tradeoff rather than claiming a readiness percentage.
3. Mark an included movie watched: its runtime leaves the remaining plan and frees time for another.
4. Select a movie and request its AI explanation. Open Under the hood to inspect actual tokens and latency.
5. Set the budget below the destination runtime to demonstrate the infeasible-plan state.

## Next experiment

Compare passing all curated notes with retrieving only the selected movie and its direct context notes. Measure actual tokens, latency, and human-rated grounding on the same requests. No savings or accuracy improvements are claimed before this experiment is run.

## Previous local verification — 2026-09-23

- Production build and TypeScript checks passed.
- 305 planner scenarios passed.
- Live Groq calls returned explanations and token usage; invalid movie IDs returned HTTP 400.
- Browser checks covered zero/max budgets, watched updates, persistence after reload, Map/List views, and the explanation button. Phone layout checked at 390 × 844.
- Hosting remains pending: the installed Sites helper files became unavailable during the session. This is a local demo, not a published link.

AI text remains a draft: the application verifies response structure and reference IDs, but does not automatically prove every sentence follows from its source notes.


## Five-role review — 2026-10-31

All five review rounds are recorded in [the review log](REVIEW_LOG.md), including findings, changes, and verification. The review preserves the 12-film scope. Fixes include destination context-gap counting, validated saved preferences, direct navigation to film details, clearer route labels, and visible editorial notes alongside AI drafts.

The API service is separated from its Cloudflare route so failures can be tested without live model calls. `test-explanations.mjs` covers nine groups of request validation, output validation, provider fallback, cache, rate-limit, and saved-state checks. These checks do not establish factual accuracy of AI prose.

### Demo and restart

From this `site` directory, run `npm run dev` and open the printed local URL. The local server must stay running. The budget is remaining viewing time; already-watched titles do not consume it. Start at 2.5 hours to see Infinity War alone and six omitted context connections, then increase to 12 hours. Select a film to jump to its detail section. Expand Sources & earlier context to inspect the editorial notes.

A private hosted link requires the owner's authorized sign-in and is not a public recruiter demo. Public access, complete MCU coverage, durable abuse limits, and a human-rated AI grounding evaluation remain future work.
