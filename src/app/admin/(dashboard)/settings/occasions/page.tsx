import type { Metadata } from "next";
import CatalogManager from "@/components/admin/CatalogManager";
import { listCatalog } from "../catalog-actions";

export const metadata: Metadata = { title: "Occasions" };

export default async function OccasionSettingsPage() {
  let items: Awaited<ReturnType<typeof listCatalog>> = [];
  try {
    items = await listCatalog("occasions");
  } catch {
    items = [];
  }

  return (
    <CatalogManager
      kind="occasions"
      title="Occasions"
      singular="occasion"
      description="Celebration types used to organise the cake gallery and quote requests."
      items={items}
    />
  );
}
