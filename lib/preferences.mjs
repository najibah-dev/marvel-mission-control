// Treat browser storage as untrusted input, including data from older app versions.
export function restorePreferences(raw, movies) {
  const defaults = { hours: 12, watched: [] };
  if (!raw) return defaults;
  const saved = JSON.parse(raw);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
  const hours = Number.isFinite(saved.hours) && saved.hours >= 0 && saved.hours <= 30
    ? Math.round(saved.hours * 2) / 2 : defaults.hours;
  const known = new Set(movies.map(movie => movie.id));
  const watched = Array.isArray(saved.watched)
    ? [...new Set(saved.watched.filter(id => typeof id === 'string' && known.has(id)))] : [];
  return { hours, watched };
}

// Apply the requested state; repeated checked events must not undo progress.
export function setMovieWatched(watched, id, checked) {
  if (checked) return watched.includes(id) ? watched : [...watched, id];
  return watched.includes(id) ? watched.filter(value => value !== id) : watched;
}
