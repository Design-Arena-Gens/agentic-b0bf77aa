import { NewAssetForm } from "@/components/assets/NewAssetForm";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Register asset
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Add IT asset to verification program
        </h1>
        <p className="text-sm text-slate-400">
          Configure ownership, lifecycle, and risk metadata so the verification engine can
          schedule evidence workflows.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
        <NewAssetForm />
      </div>
    </div>
  );
}
