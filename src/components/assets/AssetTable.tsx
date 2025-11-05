"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Asset, Location, Person } from "@/types";
import { formatDate, formatRelative, riskColor, statusColor } from "@/lib/utils";

interface AssetTableProps {
  assets: Asset[];
  people: Person[];
  locations: Location[];
}

const headers = [
  "Asset",
  "Owner",
  "Location",
  "Status",
  "Risk",
  "Last Evidence",
  "Next Due",
];

export const AssetTable = ({ assets, people, locations }: AssetTableProps) => {
  const [sortKey, setSortKey] = useState<"name" | "status" | "nextDue" | "riskRating">(
    "nextDue"
  );

  const ownerMap = useMemo(
    () =>
      people.reduce<Record<string, Person>>((acc, person) => {
        acc[person.id] = person;
        return acc;
      }, {}),
    [people]
  );

  const locationMap = useMemo(
    () =>
      locations.reduce<Record<string, Location>>((acc, location) => {
        acc[location.id] = location;
        return acc;
      }, {}),
    [locations]
  );

  const sortedAssets = useMemo(() => {
    const asc = [...assets];
    asc.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "riskRating": {
          const rank = { high: 0, medium: 1, low: 2 } as const;
          return rank[a.riskRating] - rank[b.riskRating];
        }
        default:
          return (
            new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
          );
      }
    });
    return asc;
  }, [assets, sortKey]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60">
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-900/60 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
        <span>Asset grid</span>
        <div className="flex gap-3 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => setSortKey("nextDue")}
            className={`rounded-full px-3 py-1 ${
              sortKey === "nextDue"
                ? "bg-emerald-500/10 text-emerald-200"
                : "hover:bg-slate-800/60"
            }`}
          >
            Next due
          </button>
          <button
            type="button"
            onClick={() => setSortKey("riskRating")}
            className={`rounded-full px-3 py-1 ${
              sortKey === "riskRating"
                ? "bg-emerald-500/10 text-emerald-200"
                : "hover:bg-slate-800/60"
            }`}
          >
            Risk
          </button>
          <button
            type="button"
            onClick={() => setSortKey("status")}
            className={`rounded-full px-3 py-1 ${
              sortKey === "status"
                ? "bg-emerald-500/10 text-emerald-200"
                : "hover:bg-slate-800/60"
            }`}
          >
            Status
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/60">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
            {sortedAssets.map((asset) => (
              <tr
                key={asset.id}
                className="transition hover:bg-slate-900/80 hover:text-slate-100"
              >
                <td className="px-4 py-4">
                  <div>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-semibold text-slate-100 hover:text-emerald-300"
                    >
                      {asset.name}
                    </Link>
                    <p className="text-xs text-slate-500">{asset.assetTag}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">
                      {ownerMap[asset.ownerId]?.name ?? "Unassigned"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {ownerMap[asset.ownerId]?.department ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs text-slate-400">
                    <p className="font-medium text-slate-200">
                      {locationMap[asset.locationId]?.name ?? "—"}
                    </p>
                    <p>{locationMap[asset.locationId]?.region ?? ""}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[asset.status]}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${riskColor[asset.riskRating]}`}>
                    {asset.riskRating}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-slate-400">
                  {asset.lastVerified ? formatRelative(asset.lastVerified) : "—"}
                </td>
                <td className="px-4 py-4 text-xs text-slate-400">
                  {formatDate(asset.nextDue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
