import { AssetDetail } from "@/components/assets/AssetDetail";

export default function AssetDetailPage({
  params,
}: {
  params: { assetId: string };
}) {
  return <AssetDetail assetId={params.assetId} />;
}
