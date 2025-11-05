"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssetStore } from "@/context/asset-store";
import { makeId } from "@/lib/uuid";

const categories = [
  "Endpoint",
  "Server",
  "Network",
  "Peripheral",
  "Security",
  "Application",
];

export const NewAssetForm = () => {
  const router = useRouter();
  const { people, locations, addAsset, addActivity } = useAssetStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Endpoint");
  const [ownerId, setOwnerId] = useState(people[0]?.id ?? "");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [assetTag, setAssetTag] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [warrantyExpiry, setWarrantyExpiry] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 3))
      .toISOString()
      .split("T")[0]
  );
  const [riskRating, setRiskRating] = useState<"low" | "medium" | "high">("medium");
  const [tags, setTags] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !ownerId || !locationId) return;

    const assetId = makeId("AST");
    const now = new Date().toISOString().split("T")[0];
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    addAsset({
      id: assetId,
      name,
      assetTag: assetTag || makeId("TAG"),
      category,
      ownerId,
      locationId,
      status: "pending",
      lastVerified: now,
      nextDue: new Date(new Date(now).setMonth(new Date(now).getMonth() + 3))
        .toISOString()
        .split("T")[0],
      riskRating,
      serialNumber,
      purchaseDate,
      warrantyExpiry,
      costCenter: costCenter || "CC-UNASSIGNED",
      tags: parsedTags,
      verifications: [],
    });

    addActivity({
      id: makeId("ACT"),
      type: "asset",
      title: `Asset onboarded: ${name}`,
      description: `New ${category} registered with risk rating ${riskRating}.`,
      assetId,
      personId: ownerId,
      createdAt: new Date().toISOString(),
      status: "info",
    });

    router.push(`/assets/${assetId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Asset name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
            placeholder="MacBook Pro 16”"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Owner
          <select
            value={ownerId}
            onChange={(event) => setOwnerId(event.target.value)}
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.department}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Location
          <select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Risk rating
          <select
            value={riskRating}
            onChange={(event) =>
              setRiskRating(event.target.value as typeof riskRating)
            }
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Asset tag
          <input
            value={assetTag}
            onChange={(event) => setAssetTag(event.target.value)}
            placeholder="IT-ALPHA-001"
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Serial number
          <input
            value={serialNumber}
            onChange={(event) => setSerialNumber(event.target.value)}
            placeholder="SN-123456789"
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Cost center
          <input
            value={costCenter}
            onChange={(event) => setCostCenter(event.target.value)}
            placeholder="CC-ITOPS-001"
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Purchase date
          <input
            type="date"
            value={purchaseDate}
            onChange={(event) => setPurchaseDate(event.target.value)}
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Warranty expiry
          <input
            type="date"
            value={warrantyExpiry}
            onChange={(event) => setWarrantyExpiry(event.target.value)}
            className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/60 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
        Tags (comma separated)
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="High Value, Executive, Encryption"
          className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
        />
      </label>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-800/60 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:text-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Register asset
        </button>
      </div>
    </form>
  );
};
