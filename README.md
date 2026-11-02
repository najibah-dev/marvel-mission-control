# Marvel Mission Control — Your Marvel Journey

A movie-only catch-up planner leading to **Avengers: Doomsday**, using 20 curated films from Raya's Kaggle dataset. Set hours per week and a finish-before date; the app chooses background films by editorial priority, excludes watched titles, and schedules the selected films in release order. It does not claim every film is integral or that the shortlist guarantees readiness.

## Run

Use Node 24 LTS and npm:

```sh
npm ci
cp .env.example .env.local
# Set GROQ_API_KEY locally; never commit it.
npm run dev
```

Open the printed local URL. The planner works without an API key; explanations fall back to editorial notes. The hosted site is owner-private.

## Planning rules

- Default deadline: December 18, 2026, the official U.S. release date checked November 2, 2026. Users can choose a different cinema date. Release information is not refreshed automatically.
- Available minutes = floor(days before target × hours per week × 60 / 7). The target day itself is excluded. Past deadlines and zero pace produce no catch-up plan.
- High priority = 1,000 × editorial weight; useful context = 10 × weight; optional origin/background = 1. A grouped knapsack solver maximizes the total; ties use less time. Scores are ranking rules, not probabilities, measured importance, or readiness percentages.
- Infinity War is bundled with Endgame when neither has been watched; other map edges are soft context links. Watched films never use the remaining budget.
- Selected films play in release order, not in-universe chronology. Suggested finish-by dates assume weekly time is spread evenly and films may be split across sessions.
- Doomsday is a destination marker only: no invented runtime, watched checkbox, or catch-up budget reservation.
- Marking the displayed film watched clears its AI response and advances to the first film of the recalculated route. Manually selected films are labeled “Explore this film”; “Back to my next recommendation” returns to automatic selection.

## Data and sources

[Original Kaggle dataset](https://www.kaggle.com/datasets/vanshkumar007/mcu-and-marvel-media-complete-dataset). TMDB poster URLs come from supplied metadata. This is an unofficial fan learning project, not affiliated with Marvel/Disney/TMDB. Permissions for public redistribution remain to be reviewed before broader release.

See [Doomsday editorial decisions and source notes](DOOMSDAY_PLAN.md). Catalog records distinguish official runtime checks from unverified Kaggle runtimes. Thunderbolts* uses Disney's 126 minutes instead of the dataset's 127. Priority notes are written editorially; raw Kaggle plot text is not sent to the model. Movies only: Loki and other television stories are outside the current shortlist.

`lib/catalog.json` is the reviewed app catalog. `scripts/build-doomsday-catalog.py /path/to/marvel_master.csv` reproduces its extension from the retained original 12 records. The parent project's older `build_catalog.py` creates the superseded Infinity War catalog; do not use it to overwrite this version.

## Architecture and harness

`catalog.json` + `timeline.mjs` → `planner.mjs` → dashboard/map/calendar. `timeline.mjs` restores saved pace/date and migrates watched IDs from the older planner; malformed storage falls back to defaults. Dates are computed as calendar dates, avoiding DST duration errors.

`POST /api/explain` validates inputs, calculates the same route, retrieves the selected film and incoming editorial context notes, calls Groq, validates output structure/reference IDs, and returns real token usage. The prompt explicitly prohibits inventing prerequisites, sequence changes, or plot details. A valid response is still an AI draft, not proof of factual accuracy.

The harness includes a 15-second timeout, 1,024 output-token cap, bounded cache, per-isolate request limiter, and non-AI fallback. Model: `openai/gpt-oss-20b`, low reasoning effort. This is a bounded workflow, not an autonomous agent. The limiter is not a durable global spend cap; retain private hosting until stronger public-use controls are in place.

## Verification

```sh
node scripts/test-planner.mjs
node scripts/test-dashboard.mjs
node scripts/test-explanations.mjs
npx tsc --noEmit
npm run build
```

Planner tests cover 726 budget/history cases and compare optimal scores against exhaustive small fixtures. Timeline/dashboard tests cover 28 combinations, leap/DST dates, expired deadlines, progress migration, and next-film selection. Nine explanation/persistence groups simulate provider failures, output validation, caching, rate limiting, and existing preference handling. These tests do not measure factual accuracy or substitute for browser interaction checks.

## Demo

1. Show Doomsday and the default U.S. release date.
2. Compare 1, 2, and 4 hours per week; inspect priority tradeoffs and finish-by dates.
3. Follow the map to Doomsday, or explore a story topic.
4. Mark the displayed film watched and see the next recommendation.
5. Ask AI to explain the recommendation; inspect editorial sources and actual usage.

[Review log](REVIEW_LOG.md) records the five AI-persona rounds and verification limits. [Power BI talking points](POWER_BI_TALKING_POINTS.md) cover the analytics-plus-actions narrative; this app is not integrated with Power BI.
