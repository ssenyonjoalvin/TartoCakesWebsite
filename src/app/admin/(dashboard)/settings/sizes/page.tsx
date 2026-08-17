import type { Metadata } from "next";
import CatalogManager from "@/components/admin/CatalogManager";
import { listCatalog } from "../catalog-actions";

export const metadata: Metadata = { title: "Cake Sizes" };

export default async function SizeSettingsPage() {
  let items: Awaited<ReturnType<typeof listCatalog>> = [];
  try {
    items = await listCatalog("sizes");
  } catch {
    items = [];
  }

  return (
    <CatalogManager
      kind="sizes"
      title="Cake Sizes"
      singular="size"
      description="Size and tier options customers can choose from."
      items={items}
      showServings
    />
  );
}
