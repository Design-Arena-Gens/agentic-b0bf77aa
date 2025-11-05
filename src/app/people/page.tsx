"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAssetStore } from "@/context/asset-store";
import { formatRelative } from "@/lib/utils";

export default function PeoplePage() {
  const { people, assets, activities, tasks } = useAssetStore();

  const ownership = useMemo(() => {
    return people.map((person) => {
      const ownedAssets = assets.filter((asset) => asset.ownerId === person.id);
      const openTasks = tasks.filter(
        (task) => task.assignedToId === person.id && task.status !== "completed"
      );
      return {
        ...person,
        ownedAssets,
        openTasks,
      };
    });
  }, [people, assets, tasks]);

  const recentActivity = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Team</p>
          <h1 className="text-2xl font-semibold text-slate-100">
            Asset custodians and verification specialists
          </h1>
          <p className="text-sm text-slate-400">
            Manage assignments, workload balance, and certification coverage across the
            verification program.
          </p>
        </div>
        <Link
          href="/verifications"
          className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
        >
          View verification queue
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Custodian roster
              </h2>
              <p className="text-xs text-slate-400">
                Ownership distribution and workload at-a-glance.
              </p>
            </div>
          </header>
          <div className="space-y-4">
            {ownership.map((member) => (
              <article
                key={member.id}
                className="flex flex-wrap items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-full text-lg font-medium text-white ${member.avatarColor}`}
                >
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400">{member.role}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                    {member.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="rounded-full border border-slate-700/80 bg-slate-900/70 px-2 py-0.5 text-slate-400"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs">
                      <p className="uppercase tracking-wide text-slate-500">Assets</p>
                      <p className="text-lg font-semibold text-slate-100">
                        {member.ownedAssets.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs">
                      <p className="uppercase tracking-wide text-slate-500">
                        Open tasks
                      </p>
                      <p className="text-lg font-semibold text-slate-100">
                        {member.openTasks.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs">
                      <p className="uppercase tracking-wide text-slate-500">
                        SLA risk
                      </p>
                      <p className="text-lg font-semibold text-rose-200">
                        {member.workload.slaRisk}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Assigned assets
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {member.ownedAssets.slice(0, 4).map((asset) => (
                      <li key={asset.id}>
                        <Link
                          href={`/assets/${asset.id}`}
                          className="text-slate-300 hover:text-emerald-200"
                        >
                          {asset.name}
                        </Link>{" "}
                        · {asset.assetTag}
                      </li>
                    ))}
                    {member.ownedAssets.length === 0 && (
                      <li>No assigned assets.</li>
                    )}
                    {member.ownedAssets.length > 4 && (
                      <li className="text-[11px] text-slate-500">
                        +{member.ownedAssets.length - 4} more assets
                      </li>
                    )}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Recent activity
            </h2>
            <p className="text-xs text-slate-400">
              Signals tied to people across the verification stream.
            </p>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <article
                key={activity.id}
                className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-xs text-slate-400"
              >
                <p className="font-mono text-[11px] text-slate-500">{activity.id}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  {activity.title}
                </p>
                <p>{activity.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>{formatRelative(activity.createdAt)}</span>
                  {activity.personId ? (
                    <span>
                      Owner:{" "}
                      {
                        people.find((person) => person.id === activity.personId)?.name
                      }
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
            {!recentActivity.length && (
              <p className="text-xs text-slate-500">No recent activity recorded.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
