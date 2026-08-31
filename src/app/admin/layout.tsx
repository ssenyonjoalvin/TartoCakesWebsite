import AdminNoStoreGuard from "@/components/admin/AdminNoStoreGuard";

export const dynamic = "force-dynamic";

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
