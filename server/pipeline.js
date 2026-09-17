/** Production enquiry pipeline: validated status transitions. */
export const STATUSES = [
  "new", "reviewing", "contacted", "demo", "pilot", "converted", "not_suitable", "closed",
];

/** Enquiry → Lead → Demo → Pilot → Customer (→ Subscription, future) */
export const TRANSITIONS = {
  new: ["reviewing", "contacted", "not_suitable", "closed"],
  reviewing: ["contacted", "demo", "not_suitable", "closed"],
  contacted: ["reviewing", "demo", "not_suitable", "closed"],
  demo: ["pilot", "contacted", "not_suitable", "closed"],
  pilot: ["converted", "demo", "closed"],
  converted: ["closed"],
  not_suitable: ["new"],
  closed: ["new"],
};

export function canTransition(from, to) {
  if (from === to) return true;
  return (TRANSITIONS[from] || []).includes(to);
}
