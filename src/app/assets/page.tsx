"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AssetTable } from "@/components/assets/AssetTable";
import { useAssetStore } from "@/context/asset-store";

const statusFilters = [
  { label: "All statuses", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Flagged", value: "flagged" },
  { label: "Retired", value: "retired" },
];

const riskFilters = [
  { label: "All risk", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function AssetsPage() {
  const { assets, people, locations } = useAssetStore();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [risk, setRisk] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        !search ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" ? true : asset.status === status;
      const matchesRisk = risk === "all" ? true : asset.riskRating === risk;
      const matchesLocation =
        location === "all" ? true : asset.locationId === location;
      return matchesSearch && matchesStatus && matchesRisk && matchesLocation;
    });
  }, [assets, search, status, risk, location]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Asset inventory</h1>
          <p className="text-sm text-slate-400">
            Full fleet visibility across categories, locations, and verification posture.
          </p>
        </div>
        <Link
          href="/assets/new"
          className="rounded-xl border border-emerald-400/70 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Register asset
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, asset tag, or ID"
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Risk
          <select
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
          >
            {riskFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Location
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-none"
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AssetTable assets={filteredAssets} people={people} locations={locations} />
    </div>
  );
}
