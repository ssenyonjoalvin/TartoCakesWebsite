import type { Metadata } from "next";
import CatalogManager from "@/components/admin/CatalogManager";
import { listCatalog } from "../catalog-actions";

export const metadata: Metadata = { title: "Cake Flavors" };

export default async function FlavorSettingsPage() {
  let items: Awaited<ReturnType<typeof listCatalog>> = [];
  try {
    items = await listCatalog("flavors");
  } catch {
    items = [];
  }

  return (
    <CatalogManager
      kind="flavors"
      title="Cake Flavors"
      singular="flavor"
      description="Flavours available when creating products or taking quote requests."
      items={items}
    />
  );
}
