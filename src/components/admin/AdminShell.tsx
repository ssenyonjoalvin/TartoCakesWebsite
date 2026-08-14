import { logoutAdmin } from "@/app/admin/actions";
import AdminNav from "@/components/admin/AdminNav";
import type { AdminRole } from "@/generated/prisma/client";

type Props = {
  name: string;
  email: string;
  role: AdminRole;
  children: React.ReactNode;
};

export default function AdminShell({ name, email, role, children }: Props) {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 flex-col bg-white shadow-sm md:flex">
        <div className="border-b border-tarto-ink/10 px-5 py-5">
          <p className="text-lg font-bold text-tarto-red">Tarto Cakes UG</p>
          <p className="text-xs text-tarto-ink/55">Admin Control</p>
        </div>
        <AdminNav role={role} />
        <form action={logoutAdmin} className="border-t border-tarto-ink/10 p-4">
          <p className="truncate text-sm font-semibold text-tarto-ink">{name}</p>
          <p className="truncate text-xs text-tarto-ink/55">{email}</p>
          <button
            type="submit"
            className="mt-2 text-sm font-semibold text-tarto-red hover:underline"
          >
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-tarto-ink/10 bg-white px-5 py-4 md:hidden">
          <p className="font-bold text-tarto-red">Tarto Cakes UG</p>
          <form action={logoutAdmin}>
            <button type="submit" className="text-sm font-semibold text-tarto-red">
              Sign out
            </button>
          </form>
        </header>
        <div className="flex-1 p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
