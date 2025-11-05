"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAssetStore } from "@/context/asset-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/assets", label: "Assets", icon: "💼" },
  { href: "/verifications", label: "Verifications", icon: "✅" },
  { href: "/people", label: "People", icon: "🧑‍🤝‍🧑" },
  { href: "/locations", label: "Locations", icon: "📍" },
  { href: "/reports", label: "Reports", icon: "📑" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { assets, tasks } = useAssetStore();

  const stats = useMemo(() => {
    const total = assets.length;
    const verified = assets.filter((asset) => asset.status === "verified").length;
    const flagged = assets.filter((asset) => asset.status === "flagged").length;
    const completion = total === 0 ? 0 : Math.round((verified / total) * 100);
    const overdue = tasks.filter((task) => task.status === "overdue").length;
    return { total, verified, flagged, completion, overdue };
  }, [assets, tasks]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-800/60 bg-slate-950/70 px-6 py-6 lg:flex">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          asset<span className="text-emerald-400">verify</span>
        </Link>
        <span className="rounded-full border border-emerald-500/50 px-2 py-1 text-xs font-medium text-emerald-200/80">
          Live
        </span>
      </div>

      <div className="mb-8 space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>Compliance score</span>
          <span>{stats.completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
            style={{ width: `${stats.completion}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>{stats.verified} verified</span>
          <span className="text-rose-300/80">{stats.flagged} flagged</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                isActive
                  ? "bg-gradient-to-r from-slate-800 via-slate-800/70 to-transparent text-slate-100 shadow-lg shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
        <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          SLA Outlook
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              stats.overdue > 0
                ? "border border-rose-400/60 bg-rose-500/10 text-rose-200"
                : "border border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {stats.overdue > 0 ? `${stats.overdue} overdue` : "on track"}
          </span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Monitoring priority verifications, evidence capture, and remediation tracking in
          real-time.
        </p>
      </div>
    </aside>
  );
};
