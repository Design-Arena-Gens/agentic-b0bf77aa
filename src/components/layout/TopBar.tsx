"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAssetStore } from "@/context/asset-store";
import { formatRelative } from "@/lib/utils";

export const TopBar = () => {
  const { activities, tasks, people } = useAssetStore();

  const nextTask = useMemo(() => {
    const scheduled = tasks
      .filter((task) => task.status !== "completed")
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    if (!scheduled.length) return undefined;
    const task = scheduled[0];
    const assignee = people.find((person) => person.id === task.assignedToId);
    return {
      ...task,
      assigneeName: assignee?.name ?? "Unassigned",
    };
  }, [tasks, people]);

  const latestActivity = activities[0];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">
            IT Asset Verification CRM
          </p>
          <h1 className="text-xl font-semibold text-slate-100">
            Control tower for asset trust and compliance evidence
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assets/new"
            className="group inline-flex items-center gap-2 rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
          >
            <span className="text-lg leading-none">＋</span>
            New Asset
          </Link>
          <Link
            href="/verifications"
            className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 hover:border-slate-700 hover:text-slate-100"
          >
            Verification Queue
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800/60 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-3 text-sm text-slate-400 lg:px-8">
          {latestActivity ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <span className="font-medium text-slate-200">
                {latestActivity.title}
              </span>
              <span className="text-xs text-slate-500">
                {formatRelative(latestActivity.createdAt)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-lg">✅</span>
              No recent activity logged
            </div>
          )}

          {nextTask ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-lg">🗂️</span>
              <span className="uppercase tracking-wide text-slate-500">
                Next due
              </span>
              <span className="font-medium text-slate-200">
                {nextTask.assetId}
              </span>
              <span>{formatRelative(nextTask.dueDate)}</span>
              <span className="text-slate-500">· {nextTask.assigneeName}</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
