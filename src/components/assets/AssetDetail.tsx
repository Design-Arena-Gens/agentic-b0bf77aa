"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  statusColor,
  riskColor,
  formatDate,
  formatRelative,
} from "@/lib/utils";
import { useAssetStore } from "@/context/asset-store";
import { makeId } from "@/lib/uuid";

const timelineColor = {
  passed: "border-emerald-400/70 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-400/70 bg-rose-500/10 text-rose-200",
  "in-progress": "border-sky-400/70 bg-sky-500/10 text-sky-200",
} as const;

export const AssetDetail = ({ assetId }: { assetId: string }) => {
  const {
    assets,
    people,
    locations,
    tasks,
    addVerification,
    addActivity,
    updateTaskStatus,
  } = useAssetStore();

  const asset = assets.find((item) => item.id === assetId);
  const [status, setStatus] = useState<"passed" | "failed" | "in-progress">(
    "passed"
  );
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState("");
  const [performedBy, setPerformedBy] = useState(
    people.length ? people[0].id : ""
  );
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const assetTasks = useMemo(
    () =>
      tasks.filter((task) => task.assetId === assetId && task.status !== "completed"),
    [tasks, assetId]
  );

  if (!asset) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
        <h1 className="text-xl font-semibold text-slate-100">Asset not found</h1>
        <p className="text-sm text-slate-400">
          The requested asset does not exist or has been removed from the inventory.
        </p>
        <Link
          href="/assets"
          className="inline-flex w-fit rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
        >
          Return to assets
        </Link>
      </div>
    );
  }

  const location = locations.find((item) => item.id === asset.locationId);
  const owner = people.find((item) => item.id === asset.ownerId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!performedBy) return;
    const verification = {
      id: makeId("VER"),
      assetId: asset.id,
      date,
      status,
      performedById: performedBy,
      notes,
      issues: issues
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    addVerification(asset.id, verification);
    addActivity({
      id: makeId("ACT"),
      type: "verification",
      title: `Verification ${status === "passed" ? "completed" : status} for ${
        asset.name
      }`,
      description: notes || "Evidence captured.",
      assetId: asset.id,
      personId: performedBy,
      createdAt: new Date().toISOString(),
      status: status === "failed" ? "critical" : status === "in-progress" ? "warning" : "info",
    });
    if (status === "passed") {
      const nextTask = assetTasks[0];
      if (nextTask) {
        updateTaskStatus(nextTask.id, "completed");
      }
    } else if (status === "failed") {
      assetTasks.forEach((task) => updateTaskStatus(task.id, "overdue"));
    }
    setNotes("");
    setIssues("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Asset profile
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">{asset.name}</h1>
          <p className="text-sm text-slate-400">{asset.assetTag}</p>
        </div>
        <Link
          href="/assets"
          className="rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:text-slate-100"
        >
          Back to inventory
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            Ownership
          </h2>
          <p className="mt-2 text-base font-semibold text-slate-100">
            {owner?.name ?? "Unassigned"}
          </p>
          <p className="text-xs text-slate-400">{owner?.department ?? "—"}</p>
          <p className="mt-2 text-xs text-slate-500">{owner?.email}</p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            Location
          </h2>
          <p className="mt-2 text-base font-semibold text-slate-100">
            {location?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-400">{location?.region ?? "—"}</p>
          <p className="mt-2 text-xs text-slate-500">{location?.address}</p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            Lifecycle
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Purchased {formatDate(asset.purchaseDate)}
          </p>
          <p className="text-xs text-slate-400">
            Warranty ends {formatDate(asset.warrantyExpiry)}
          </p>
          <p className="mt-2 text-xs text-slate-500">{asset.costCenter}</p>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            Compliance
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className={`rounded-full px-2 py-0.5 ${statusColor[asset.status]}`}>
              {asset.status}
            </span>
            <span className={`rounded-full px-2 py-0.5 ${riskColor[asset.riskRating]}`}>
              {asset.riskRating} risk
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Last evidence {formatRelative(asset.lastVerified)}
          </p>
          <p className="text-xs text-slate-400">Next due {formatDate(asset.nextDue)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Verification history
              </h2>
              <p className="text-xs text-slate-400">
                Evidence trail and remediation notes for this asset.
              </p>
            </div>
          </header>
          <div className="space-y-4">
            {asset.verifications.map((verification) => {
              const ownerName =
                people.find((person) => person.id === verification.performedById)?.name ??
                "Unknown";
              return (
                <div
                  key={verification.id}
                  className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${timelineColor[verification.status]}`}
                      >
                        {verification.status}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {verification.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(verification.date)} · {ownerName}
                    </span>
                  </div>
                  <p className="mt-3 text-slate-200">{verification.notes}</p>
                  {verification.issues?.length ? (
                    <div className="mt-3 space-y-2 text-xs text-rose-200">
                      <p className="font-semibold uppercase tracking-wide text-rose-300">
                        Issues
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {verification.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {!asset.verifications.length && (
              <p className="text-sm text-slate-400">
                No verification events recorded yet.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Log verification
            </h2>
            <p className="text-xs text-slate-400">
              Capture new evidence or escalate remediation with structured notes.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm text-slate-300">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as typeof status)
                }
                className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
              >
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="in-progress">In progress</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
              Performed by
              <select
                value={performedBy}
                onChange={(event) => setPerformedBy(event.target.value)}
                className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
              Evidence notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Summary of checks performed, evidence captured, remediation follow-up..."
                className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
              Issues (comma separated)
              <input
                value={issues}
                onChange={(event) => setIssues(event.target.value)}
                placeholder="e.g. Missing logs, out-of-date firmware"
                className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Record verification
            </button>
          </form>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-xs text-slate-400">
            <p className="uppercase tracking-wide text-slate-500">
              Open tasks ({assetTasks.length})
            </p>
            <div className="mt-3 space-y-2">
              {assetTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-3">
                  <p className="font-mono text-[11px] text-slate-500">{task.id}</p>
                  <p className="text-sm text-slate-200">{task.checklist[0]}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Due {formatDate(task.dueDate)} ({formatRelative(task.dueDate)})
                  </p>
                </div>
              ))}
              {!assetTasks.length && (
                <p className="text-[11px] text-slate-500">
                  No open verification tasks for this asset.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
