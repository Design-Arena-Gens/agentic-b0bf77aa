"use client";

import { useMemo } from "react";
import { useAssetStore } from "@/context/asset-store";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const { assets, tasks, activities } = useAssetStore();

  const metrics = useMemo(() => {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const evidences = assets.flatMap((asset) =>
      asset.verifications.filter(
        (verification) => new Date(verification.date) >= periodStart
      )
    );

    const remediationRate = (() => {
      const failures = evidences.filter((verification) => verification.status === "failed");
      const resolved = failures.filter((failure) =>
        assets.some((asset) =>
          asset.verifications.some(
            (verification) =>
              verification.assetId === failure.assetId &&
              verification.status === "passed" &&
              new Date(verification.date) > new Date(failure.date)
          )
        )
      );
      return failures.length
        ? Math.round((resolved.length / failures.length) * 100)
        : 100;
    })();

    return {
      evidenceCount: evidences.length,
      avgTasksPerAsset: assets.length
        ? (tasks.length / assets.length).toFixed(1)
        : "0",
      remediationRate,
      incidents: activities.filter((activity) => activity.status !== "info").length,
    };
  }, [assets, tasks, activities]);

  const exportData = {
    generatedAt: new Date().toISOString(),
    metrics,
    assets: assets.slice(0, 10),
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asset-verification-report-${formatDate(
      new Date().toISOString().split("T")[0]
    )}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Reporting
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">
            Verification analytics & audit export
          </h1>
          <p className="text-sm text-slate-400">
            Summarize evidence coverage, remediation velocity, and incident posture for
            audit stakeholders.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
        >
          Download JSON export
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Evidence collected
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {metrics.evidenceCount}
          </p>
          <p className="text-xs text-slate-500">Last 30 days</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Avg tasks per asset
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {metrics.avgTasksPerAsset}
          </p>
          <p className="text-xs text-slate-500">Queue depth indicator</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Remediation rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-200">
            {metrics.remediationRate}%
          </p>
          <p className="text-xs text-slate-500">Failed verifications resolved</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Incidents
          </p>
          <p className="mt-2 text-3xl font-semibold text-rose-200">
            {metrics.incidents}
          </p>
          <p className="text-xs text-slate-500">Critical or warning events</p>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Evidence by asset
          </h2>
          <p className="text-xs text-slate-400">
            Snapshot of recent verification entries across the fleet.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="min-w-full divide-y divide-slate-800/60 text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Asset</th>
                <th className="px-4 py-3 text-left">Verification count</th>
                <th className="px-4 py-3 text-left">Last evidence</th>
                <th className="px-4 py-3 text-left">Next due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {assets.slice(0, 10).map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-slate-100">
                    {asset.name}
                    <span className="block text-xs font-normal text-slate-500">
                      {asset.assetTag}
                    </span>
                  </td>
                  <td className="px-4 py-3">{asset.verifications.length}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {asset.lastVerified ? formatDate(asset.lastVerified) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDate(asset.nextDue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
