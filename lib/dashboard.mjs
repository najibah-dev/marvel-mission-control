import { TOPICS, planRoute } from './planner.mjs';

// A movie can belong to several topics. Never sum these rows as unique films.
export function topicBreakdown(movies, plan, watchedIds) {
  const watched = new Set(watchedIds);
  const planned = new Set(plan.selected.map(movie => movie.id));
  return Object.entries(TOPICS).map(([id, label]) => {
    const members = movies.filter(movie => movie.topics.includes(id));
    const seen = members.filter(movie => watched.has(movie.id)).length;
    const selected = members.filter(movie => planned.has(movie.id)).length;
    return { id, label, total: members.length, watched: seen, planned: selected,
      omitted: members.length - seen - selected };
  });
}

export function budgetScenarios(movies, watchedIds, budgets = [8, 12, 20]) {
  return budgets.map(hours => {
    const plan = planRoute(movies, hours, watchedIds);
    return { hours, minutes: plan.used, films: plan.selected.length + Number(plan.fits && !plan.destinationWatched),
      topics: plan.covered.length, gaps: plan.gaps.length };
  });
}
