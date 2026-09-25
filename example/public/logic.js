// Pure helpers used by the UI. Keep these free of DOM access so they stay testable.

export function groupByDate(expenses) {
  const groups = new Map();
  for (const e of expenses) {
    if (!groups.has(e.date)) groups.set(e.date, []);
    groups.get(e.date).push(e);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function initials(name) {
  return name.slice(0, 1).toUpperCase();
}
