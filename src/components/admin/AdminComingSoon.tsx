import type { ReactNode } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function AdminComingSoon({
  title,
  description,
  actions,
}: Props) {
  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={actions}
      />
      <div className="mt-6 rounded-2xl border border-dashed border-[#E0E0E0] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <p className="text-sm font-semibold text-[#555]">Coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#888]">
          This module will use the same admin layout — table views, filters, and
          actions — once we wire it to the database.
        </p>
      </div>
    </div>
  );
}
