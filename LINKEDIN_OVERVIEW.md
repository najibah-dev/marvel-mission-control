# Copy-ready briefing for ChatGPT

Write a natural LinkedIn post of about 180–220 words about my project, in first person. Use a curious, beginner-friendly tone, a personal opening, and a short closing question. Avoid hype, invented impact metrics, or claiming I built a production-ready system. Mention that I used AI coding assistance. I am learning AI engineering through hands-on projects and preparing for a Forward Deployed Engineer role; describe this as part of that learning journey, not professional experience I already have.

Project: **Marvel Mission Control — Your Marvel Journey**.

Personal motivation: I started watching Marvel to prepare for Avengers: Doomsday, but the number of movies felt overwhelming. I wanted a practical answer to “What background should I prioritize with the time I have?”

What the dashboard does:
- Builds a catch-up plan from weekly viewing time, a chosen finish-before date, and films already watched.
- Uses 20 curated movie records from a Kaggle Marvel dataset, supplemented by editorial context notes and selected official-source checks.
- Labels films High priority, Useful context, or Optional origins. These are our recommendations, not Marvel's official prerequisites or proof that a film is integral to Doomsday's plot.
- Shows a story-connection map leading to Doomsday, plan metrics, suggested finish-by dates, topic coverage, weekly-pace comparisons, and omitted films.
- Recalculates the plan when watched progress changes and advances the next-film panel.
- Offers on-demand Groq explanations based on retrieved editorial notes, with visible sources and actual token usage.

Engineering: React/TypeScript UI; deterministic, priority-weighted knapsack planning; release-order viewing; calendar-based scheduling. Code handles exact calculations, while AI explains editorial context. The AI harness includes input/output validation, timeout handling, an output-token cap, caching, a per-instance request limit, and a non-AI fallback. It is a bounded workflow, not an autonomous agent. No vector database or measured token-savings claim.

Verification: 726 planner budget/history cases, 28 timeline/dashboard combinations, and nine explanation/persistence test groups passed. These are software checks, not measurements of recommendation quality or AI factual accuracy. The site is an owner-private prototype. Browser/mobile interaction verification is incomplete, and the catalog excludes TV series. Five AI-simulated role perspectives informed reviews; they were not human reviewers.

Portfolio angle: exploring how a dashboard can help users move from understanding data to making a decision, with AI explaining the choices. Do not claim Power BI is being replaced or lacks AI; this project has no Power BI integration.

My takeaway: useful AI products need trustworthy data, clear rules, explicit tradeoffs, and reliable behavior around the model—not just a chatbot.

Please select the strongest details for the post rather than cramming in every feature or test count. Do not include an invitation to use a public demo link because the current site is private.
