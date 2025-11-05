"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAssetStore } from "@/context/asset-store";
import {
  formatDate,
  formatRelative,
  riskColor,
  statusColor,
  taskStatusColor,
} from "@/lib/utils";
import { VerificationTask } from "@/types";

const SectionCard = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm shadow-slate-900/40">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {description ? (
          <p className="text-xs text-slate-400">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
    {children}
  </section>
);

const TaskRow = ({ task }: { task: VerificationTask }) => (
  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800/50 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
    <span className="font-mono text-xs text-slate-500">{task.id}</span>
    <span className="font-medium text-slate-200">{task.assetId}</span>
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${taskStatusColor[task.status]}`}
    >
      {task.status.replace("-", " ")}
    </span>
    <span className="text-xs text-slate-400">
      Due {formatDate(task.dueDate)} ({formatRelative(task.dueDate)})
    </span>
  </div>
);

export const Dashboard = () => {
  const { assets, activities, tasks, people } = useAssetStore();

  const metrics = useMemo(() => {
    const totalAssets = assets.length;
    const verified = assets.filter((asset) => asset.status === "verified").length;
    const flagged = assets.filter((asset) => asset.status === "flagged").length;
    const pending = assets.filter((asset) => asset.status === "pending").length;
    const complianceRate = totalAssets
      ? Math.round((verified / totalAssets) * 100)
      : 0;
    const highRisk = assets.filter((asset) => asset.riskRating === "high").length;
    const dueSoon = tasks.filter(
      (task) =>
        ["scheduled", "in-progress"].includes(task.status) &&
        new Date(task.dueDate).getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 7 &&
        new Date(task.dueDate).getTime() >= Date.now()
    ).length;
    const overdue =
      tasks.filter((task) => {
        if (task.status === "overdue") return true;
        if (task.status === "completed") return false;
        return new Date(task.dueDate).getTime() < Date.now();
      }).length ?? 0;
    const evidence = assets.reduce((count, asset) => {
      return (
        count +
        asset.verifications.filter(
          (verification) =>
            Date.now() - new Date(verification.date).getTime() <=
            1000 * 60 * 60 * 24 * 30
        ).length
      );
    }, 0);
    return {
      totalAssets,
      verified,
      flagged,
      pending,
      complianceRate,
      highRisk,
      dueSoon,
      overdue,
      evidence,
    };
  }, [assets, tasks]);

  const verificationBreakdown = useMemo(() => {
    return [
      {
        label: "Verified",
        count: metrics.verified,
        trend: "+8%",
        color: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200",
      },
      {
        label: "Pending",
        count: metrics.pending,
        trend: "-3%",
        color: "bg-sky-500/10 border border-sky-500/30 text-sky-200",
      },
      {
        label: "Flagged",
        count: metrics.flagged,
        trend: "+12%",
        color: "bg-rose-500/10 border border-rose-500/30 text-rose-200",
      },
    ];
  }, [metrics.flagged, metrics.pending, metrics.verified]);

  const highRiskAssets = useMemo(
    () =>
      assets
        .filter((asset) => asset.riskRating !== "low")
        .sort(
          (a, b) =>
            new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
        )
        .slice(0, 4),
    [assets]
  );

  const openTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== "completed")
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
        .slice(0, 5),
    [tasks]
  );

  const teamWorkload = useMemo(
    () =>
      people.map((person) => ({
        ...person,
        total: person.workload.pending + person.workload.completed,
      })),
    [people]
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Program posture"
        description="Real-time signal on asset verification coverage and evidence capture."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total assets</p>
            <p className="mt-2 text-3xl font-semibold text-slate-100">
              {metrics.totalAssets}
            </p>
            <p className="text-xs text-slate-500">
              {metrics.highRisk} high risk / {metrics.flagged} flagged
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200">
              Compliance rate
            </p>
            <p className="mt-2 text-3xl font-semibold text-emerald-100">
              {metrics.complianceRate}%
            </p>
            <p className="text-xs text-emerald-200/70">
              {metrics.evidence} verification evidences in last 30 days
            </p>
          </div>
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-sky-200">Due this week</p>
            <p className="mt-2 text-3xl font-semibold text-sky-100">
              {metrics.dueSoon}
            </p>
            <p className="text-xs text-sky-200/80">
              {openTasks.length} tasks in active queue
            </p>
          </div>
          <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-rose-200">SLA risk</p>
            <p className="mt-2 text-3xl font-semibold text-rose-100">
              {metrics.overdue}
            </p>
            <p className="text-xs text-rose-200/70">Requires escalation review</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Verification pipeline"
          description="Status of evidence packages, remediation, and pending attestations."
        >
          <div className="space-y-3">
            {verificationBreakdown.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${item.color}`}
              >
                <div>
                  <p className="text-xs uppercase tracking-wide">{item.label}</p>
                  <p className="text-2xl font-semibold">{item.count}</p>
                </div>
                <span className="text-xs">{item.trend} vs last cycle</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="High-risk assets"
          description="Assets with elevated risk scores or overdue evidence."
          action={
            <Link
              href="/assets"
              className="text-xs text-emerald-300 hover:text-emerald-200"
            >
              View all →
            </Link>
          }
        >
          <div className="space-y-3">
            {highRiskAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="block rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {asset.name}
                    </p>
                    <p className="text-xs text-slate-400">{asset.assetTag}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${riskColor[asset.riskRating]}`}>
                    {asset.riskRating} risk
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className={`rounded-full px-2 py-0.5 ${statusColor[asset.status]}`}>
                    {asset.status}
                  </span>
                  <span>Next due {formatDate(asset.nextDue)}</span>
                  <span>Last evidence {formatRelative(asset.lastVerified)}</span>
                </div>
              </Link>
            ))}
            {!highRiskAssets.length && (
              <p className="text-sm text-slate-400">No elevated risks detected.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming verifications"
          description="Assigned verification tasks and remediation follow-ups."
          action={
            <Link
              href="/verifications"
              className="text-xs text-emerald-300 hover:text-emerald-200"
            >
              Manage queue →
            </Link>
          }
        >
          <div className="space-y-3">
            {openTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {!openTasks.length && (
              <p className="text-sm text-slate-400">All verification tasks completed.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Activity stream"
          description="Latest movements across verification, incidents, and asset changes."
        >
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 text-sm text-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{activity.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        activity.status === "critical"
                          ? "border border-rose-500/60 bg-rose-500/10 text-rose-200"
                          : activity.status === "warning"
                          ? "border border-amber-400/60 bg-amber-500/10 text-amber-200"
                          : "border border-slate-500/60 bg-slate-500/10 text-slate-200"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatRelative(activity.createdAt)}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-slate-100">{activity.title}</p>
                <p className="text-xs text-slate-400">{activity.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {activity.assetId ? (
                    <span className="font-mono text-slate-400">{activity.assetId}</span>
                  ) : null}
                  {activity.personId ? (
                    <span>
                      Owner:{" "}
                      {people.find((person) => person.id === activity.personId)?.name ??
                        "N/A"}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Team performance"
          description="Investigation capacity and SLA risk across verification squads."
        >
          <div className="space-y-3">
            {teamWorkload.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800/50 bg-slate-900/40 p-4 text-sm"
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full text-lg text-white ${member.avatarColor}`}
                >
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-[140px] flex-1">
                  <p className="font-semibold text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>
                <div className="text-xs text-slate-400">
                  <p>
                    Pending{" "}
                    <span className="font-semibold text-slate-100">
                      {member.workload.pending}
                    </span>
                  </p>
                  <p>
                    Completed{" "}
                    <span className="font-semibold text-slate-100">
                      {member.workload.completed}
                    </span>
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (member.workload.completed /
                              Math.max(1, member.total)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                    SLA risk: {member.workload.slaRisk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
