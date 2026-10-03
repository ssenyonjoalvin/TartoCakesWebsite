import type { Metadata } from "next";
import AdminNoStoreGuard from "@/components/admin/AdminNoStoreGuard";

export const dynamic = "force-dynamic";

// Staff area: keep it out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <AdminNoStoreGuard />
      {children}
    </div>
  );
}
