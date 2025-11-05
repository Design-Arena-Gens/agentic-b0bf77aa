export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatRelative = (value: string) => {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diff = target - now;
  const abs = Math.abs(diff);
  const day = 1000 * 60 * 60 * 24;

  if (abs < day) {
    const hours = Math.round(abs / (1000 * 60 * 60));
    if (diff > 0) return `in ${hours}h`;
    if (hours === 0) return "today";
    return `${hours}h ago`;
  }

  const days = Math.round(abs / day);
  if (diff > 0) return `in ${days}d`;
  return `${days}d ago`;
};

export const riskColor = {
  low: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  medium: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
  high: "bg-rose-500/20 text-rose-200 border border-rose-500/40",
} as const;

export const statusColor = {
  verified: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40",
  pending: "bg-blue-500/20 text-blue-200 border border-blue-500/40",
  flagged: "bg-rose-500/20 text-rose-200 border border-rose-500/40",
  retired: "bg-slate-500/20 text-slate-200 border border-slate-500/40",
} as const;

export const taskStatusColor = {
  scheduled: "bg-blue-500/10 text-blue-200 border border-blue-400/40",
  "in-progress": "bg-amber-500/10 text-amber-200 border border-amber-400/40",
  completed: "bg-emerald-500/10 text-emerald-200 border border-emerald-400/40",
  overdue: "bg-rose-500/10 text-rose-200 border border-rose-400/40",
} as const;
