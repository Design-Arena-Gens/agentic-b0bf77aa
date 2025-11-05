"use client";

import { useMemo } from "react";
import { useAssetStore } from "@/context/asset-store";
import { formatDate, formatRelative, statusColor, riskColor, taskStatusColor } from "@/lib/utils";

const columns: {
  key: "scheduled" | "in-progress" | "overdue" | "completed";
  title: string;
  description: string;
  empty: string;
}[] = [
  {
    key: "scheduled",
    title: "Scheduled",
    description: "Future-dated verifications waiting to start.",
    empty: "No upcoming verifications scheduled.",
  },
  {
    key: "in-progress",
    title: "In progress",
    description: "Actively being worked by verifiers.",
    empty: "No verifications currently in progress.",
  },
  {
    key: "overdue",
    title: "Overdue",
    description: "Tasks requiring immediate attention or escalation.",
    empty: "No overdue verifications. Great job!",
  },
  {
    key: "completed",
    title: "Completed",
    description: "Closed verifications with captured evidence.",
    empty: "No completed verifications yet.",
  },
];

export default function VerificationQueuePage() {
  const { tasks, assets, people, updateTaskStatus } = useAssetStore();

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: tasks
        .filter((task) => task.status === column.key)
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ),
    }));
  }, [tasks]);

  const assetMap = useMemo(
    () =>
      assets.reduce<Record<string, typeof assets[number]>>((acc, asset) => {
        acc[asset.id] = asset;
        return acc;
      }, {}),
    [assets]
  );

  const peopleMap = useMemo(
    () =>
      people.reduce<Record<string, typeof people[number]>>((acc, person) => {
        acc[person.id] = person;
        return acc;
      }, {}),
    [people]
  );

  const changeStatus = (taskId: string, status: typeof columns[number]["key"]) => {
    updateTaskStatus(taskId, status);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Verification control
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Evidence collection and remediation queue
        </h1>
        <p className="text-sm text-slate-400">
          Track verifications end-to-end, assign ownership, and keep SLA timers green.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Active</p>
          <p className="text-2xl font-semibold text-slate-100">
            {tasks.filter((task) => task.status !== "completed").length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Overdue</p>
          <p className="text-2xl font-semibold text-rose-200">
            {tasks.filter((task) => task.status === "overdue").length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Completed (30d)
          </p>
          <p className="text-2xl font-semibold text-emerald-200">
            {
              tasks.filter(
                (task) =>
                  task.status === "completed" &&
                  Date.now() - new Date(task.dueDate).getTime() <=
                    1000 * 60 * 60 * 24 * 30
              ).length
            }
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Average time to close
          </p>
          <p className="text-2xl font-semibold text-sky-200">72h</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {grouped.map((column) => (
          <section
            key={column.key}
            className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4"
          >
            <header>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">
                  {column.title}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${taskStatusColor[column.key]}`}
                >
                  {column.tasks.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">{column.description}</p>
            </header>
            <div className="space-y-3">
              {column.tasks.length === 0 ? (
                <p className="text-xs text-slate-500">{column.empty}</p>
              ) : (
                column.tasks.map((task) => {
                  const asset = assetMap[task.assetId];
                  const assignee = peopleMap[task.assignedToId];
                  return (
                    <article
                      key={task.id}
                      className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-500">
                          {task.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide ${statusColor[asset?.status ?? "pending"]}`}
                        >
                          {asset?.status ?? "pending"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {asset?.name ?? task.assetId}
                        </p>
                        <p className="text-xs text-slate-400">
                          {asset?.assetTag ?? "Asset record"}
                        </p>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p>
                          Due {formatDate(task.dueDate)} ({formatRelative(task.dueDate)})
                        </p>
                        <p>Assigned to {assignee?.name ?? "Unassigned"}</p>
                      </div>
                      <ul className="list-inside list-disc text-xs text-slate-400">
                        {task.checklist.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {column.key !== "completed" ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(task.id, "completed")}
                            className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:bg-emerald-500/20"
                          >
                            Mark complete
                          </button>
                        ) : null}
                        {column.key === "scheduled" ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(task.id, "in-progress")}
                            className="rounded-full border border-sky-400/60 bg-sky-500/10 px-3 py-1 text-sky-200 transition hover:bg-sky-500/20"
                          >
                            Start verification
                          </button>
                        ) : null}
                        {column.key === "in-progress" ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(task.id, "overdue")}
                            className="rounded-full border border-rose-400/60 bg-rose-500/10 px-3 py-1 text-rose-200 transition hover:bg-rose-500/20"
                          >
                            Escalate
                          </button>
                        ) : null}
                        {column.key === "overdue" ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(task.id, "in-progress")}
                            className="rounded-full border border-sky-400/60 bg-sky-500/10 px-3 py-1 text-sky-200 transition hover:bg-sky-500/20"
                          >
                            Resume
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
