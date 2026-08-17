import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MediaManager from "@/components/admin/MediaManager";
import { listMediaItems } from "@/lib/media";

export const metadata: Metadata = { title: "Media Management" };

export default async function AdminMediaPage() {
  const items = await listMediaItems();

  return (
    <div>
      <AdminPageHeader
        title="Media Management"
        description="Upload, browse, and reuse cake photos across products, blog posts, and the site."
      />
      <div className="mt-6">
        <MediaManager items={items} />
      </div>
    </div>
  );
}
