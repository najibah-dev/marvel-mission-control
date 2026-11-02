# Marvel Mission Control — Your Marvel Journey

A movie-only catch-up planner leading to **Avengers: Doomsday**, using 20 curated films from a Kaggle Marvel dataset. Set hours per week and a finish-before date; the app chooses background films by editorial priority, excludes watched titles, and schedules the selected films in release order. It does not claim every film is integral or that the shortlist guarantees readiness.

## Run

Use Node 24 LTS and npm:

```sh
npm ci
npm run dev
```

Open the printed local URL. No API key or account is required.

[Use the live dashboard](https://marvel-mission-control-raya.ahmednajibah400.chatgpt.site/)

## Planning rules

- Default deadline: December 18, 2026, the official U.S. release date checked November 2, 2026. Users can choose a different cinema date. Release information is not refreshed automatically.
- Available minutes = floor(days before target × hours per week × 60 / 7). The target day itself is excluded. Past deadlines and zero pace produce no catch-up plan.
- High priority = 1,000 × editorial weight; useful context = 10 × weight; optional origin/background = 1. A grouped knapsack solver maximizes the total; ties use less time. Scores are ranking rules, not probabilities, measured importance, or readiness percentages.
- Infinity War is bundled with Endgame when neither has been watched; other map edges are soft context links. Watched films never use the remaining budget.
- Selected films play in release order, not in-universe chronology. Suggested finish-by dates assume weekly time is spread evenly and films may be split across sessions.
- Doomsday is a destination marker only: no invented runtime, watched checkbox, or catch-up budget reservation.
- Marking the displayed film watched advances to the first film of the recalculated route. Manually selected films are labeled “Explore this film”; “Back to my next recommendation” returns to automatic selection.

## Data and sources

[Original Kaggle dataset](https://www.kaggle.com/datasets/vanshkumar007/mcu-and-marvel-media-complete-dataset). TMDB poster URLs come from supplied metadata. This is an unofficial fan learning project, not affiliated with Marvel/Disney/TMDB. Permissions for public redistribution remain to be reviewed before broader release.

See [Doomsday editorial decisions and source notes](DOOMSDAY_PLAN.md). Catalog records distinguish official runtime checks from unverified Kaggle runtimes. Thunderbolts* uses Disney's 126 minutes instead of the dataset's 127. Priority notes are written editorially; raw Kaggle plot text is not sent to the model. Movies only: Loki and other television stories are outside the current shortlist.

`lib/catalog.json` is the reviewed app catalog. `scripts/build-doomsday-catalog.py /path/to/marvel_master.csv` reproduces its extension from the retained original 12 records. The parent project's older `build_catalog.py` creates the superseded Infinity War catalog; do not use it to overwrite this version.

## How it works

`catalog.json` + `timeline.mjs` → `planner.mjs` → dashboard, story map and suggested schedule. The React/TypeScript interface uses the same calculated plan for its metrics and recommendations. Watched progress and preferences stay in local storage on your browser.

`timeline.mjs` works with calendar dates to avoid daylight-saving errors. It restores saved pace and deadline preferences and migrates watched IDs from the earlier planner. Curated film notes explain the recommendation, with visible source links and earlier story connections.

## Verification

```sh
node scripts/test-planner.mjs
node scripts/test-dashboard.mjs
node scripts/test-public-release.mjs
npx tsc --noEmit
npm run build
```

Planner tests cover 726 budget/history cases and compare optimal scores against exhaustive small fixtures. Timeline/dashboard tests cover 28 combinations, leap/DST dates, expired deadlines, progress migration, and next-film selection. Public-release checks verify the delivered explanation flow.

## Demo

1. Show Doomsday and the default U.S. release date.
2. Compare 1, 2, and 4 hours per week; inspect priority tradeoffs and finish-by dates.
3. Follow the map to Doomsday, or explore a story topic.
4. Mark the displayed film watched and see the next recommendation.
5. Read “Why this film?” and inspect the sources and earlier story connections.
