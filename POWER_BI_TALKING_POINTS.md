# Discussing this project alongside Power BI and AI

Research checked: 2026-11-01. This is a custom React dashboard using Groq, not a Power BI integration, plugin, or replacement.

## What Microsoft documents

Power BI Copilot supports questions and summaries over reports, as well as report creation/editing and DAX-related assistance. Microsoft emphasizes preparing the semantic model so AI understands the data and context. Availability differs by experience; some capabilities are preview, and capacity, permissions, and administrator settings matter. [Microsoft Learn: Copilot for Power BI overview](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction).

## Your interpretation, illustrated by this prototype

“I wanted to explore how dashboards can combine measurement, exploration, and a next action. My Marvel dashboard shows a time budget and topic coverage, lets me inspect movie relationships, compares viewing plans, and uses AI to explain an editorial recommendation. The calculations remain deterministic and the AI output is labeled separately.”

| Demo action | What it illustrates |
|---|---|
| Move the budget slider | Measures update from defined business rules. |
| Select a story topic | Coordinated views make relationships easier to inspect. The highlight does not change the underlying plan. |
| Apply an 8-, 12-, or 20-hour scenario | A dashboard can help explore a decision, not just display a number. |
| Select a film and request an explanation | AI can provide a language layer over retrieved context. |
| Inspect source notes and token usage | Useful AI interfaces need traceability and operational visibility. |

## The claim to avoid

Do not claim Power BI only has static charts, lacks AI, or cannot implement comparable interactions. Filters, what-if analysis, and interactive reports are established BI ideas. This project's contribution is your specific integration of a movie graph, a constrained planner, and an inspectable AI explanation workflow.

The app does not implement DAX, a Power BI semantic model, enterprise data refresh, shared tenant governance, or a general-purpose AI analyst. Topic coverage is an editorial count, not verified Marvel knowledge. AI explanations have structural validation, not comprehensive factual verification.

## A concise portfolio framing

“Built a Marvel viewing dashboard with linked story-map exploration, deterministic budget scenarios, and Groq-powered explanation drafts. Added source visibility, token reporting, input validation, caching, failure fallbacks, and automated checks.”

A useful discussion question: “As AI adds conversational interfaces to BI, which decisions should remain explicit, testable calculations, and which benefit from generated language?”
