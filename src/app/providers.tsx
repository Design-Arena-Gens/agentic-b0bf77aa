"use client";

import { AssetStoreProvider } from "@/context/asset-store";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AssetStoreProvider>{children}</AssetStoreProvider>
);
