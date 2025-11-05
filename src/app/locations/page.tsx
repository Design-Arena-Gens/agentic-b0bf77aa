"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAssetStore } from "@/context/asset-store";
import { formatRelative } from "@/lib/utils";

export default function LocationsPage() {
  const { locations, assets, people, activities } = useAssetStore();

  const enriched = useMemo(
    () =>
      locations.map((location) => {
        const locationAssets = assets.filter((asset) => asset.locationId === location.id);
        const health = locationAssets.reduce(
          (acc, asset) => {
            acc.total += 1;
            if (asset.status === "verified") acc.verified += 1;
            if (asset.status === "flagged") acc.flagged += 1;
            return acc;
          },
          { total: 0, verified: 0, flagged: 0 }
        );
        const contact = people.find((person) => person.id === location.contactId);
        return {
          ...location,
          assets: locationAssets,
          health,
          contact,
        };
      }),
    [locations, assets, people]
  );

  const regionalSignals = activities
    .filter((activity) => activity.assetId)
    .slice(0, 6)
    .map((activity) => ({
      ...activity,
      asset: assets.find((asset) => asset.id === activity.assetId),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Global footprint
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">
            Location-level compliance posture
          </h1>
          <p className="text-sm text-slate-400">
            Understand which offices, data centers, and hubs carry the highest verification
            load or risk.
          </p>
        </div>
        <Link
          href="/reports"
          className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:text-slate-100"
        >
          Generate reports
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {enriched.map((location) => (
          <section
            key={location.id}
            className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6"
          >
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {location.code}
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  {location.name}
                </h2>
                <p className="text-xs text-slate-400">{location.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Occupancy
                </p>
                <p className="text-lg font-semibold text-slate-100">
                  {location.occupancy}%
                </p>
                <p className="text-xs text-slate-400">
                  {location.assets.length} assets on site
                </p>
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-400">
                <p className="uppercase tracking-wide text-slate-500">
                  Verified
                </p>
                <p className="mt-2 text-xl font-semibold text-emerald-200">
                  {location.health.verified}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-400">
                <p className="uppercase tracking-wide text-slate-500">Flagged</p>
                <p className="mt-2 text-xl font-semibold text-rose-200">
                  {location.health.flagged}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-400">
                <p className="uppercase tracking-wide text-slate-500">
                  Compliance
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-100">
                  {location.health.total
                    ? Math.round(
                        (location.health.verified / location.health.total) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-400">
              <p className="uppercase tracking-wide text-slate-500">
                Regional owner
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-200">
                {location.contact?.name ?? "Unassigned"}
              </p>
              <p>{location.contact?.email ?? "-"}</p>
              <p>{location.contact?.phone ?? ""}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Assets
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {location.assets.slice(0, 5).map((asset) => (
                  <li key={asset.id} className="flex items-center justify-between">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="text-slate-200 hover:text-emerald-200"
                    >
                      {asset.name}
                    </Link>
                    <span className="text-xs text-slate-500">{asset.assetTag}</span>
                  </li>
                ))}
                {location.assets.length > 5 && (
                  <li className="text-[11px] text-slate-500">
                    +{location.assets.length - 5} more assets
                  </li>
                )}
                {location.assets.length === 0 && (
                  <li className="text-xs text-slate-500">No assets recorded.</li>
                )}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Regional signals
          </h2>
          <p className="text-xs text-slate-400">
            Incident and verification insights tied to physical locations.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {regionalSignals.map((signal) => (
            <article
              key={signal.id}
              className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-xs text-slate-400"
            >
              <p className="font-mono text-[11px] text-slate-500">{signal.id}</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {signal.title}
              </p>
              <p>{signal.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span>{formatRelative(signal.createdAt)}</span>
                {signal.asset ? (
                  <span>{signal.asset.locationId}</span>
                ) : null}
              </div>
            </article>
          ))}
          {!regionalSignals.length && (
            <p className="text-xs text-slate-500">
              No recent location-related signals.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
