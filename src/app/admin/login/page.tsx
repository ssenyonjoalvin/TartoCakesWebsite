import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to the Tarto Cakes UG admin dashboard.",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border-t-4 border-tarto-red bg-white px-7 py-9 shadow-[0_16px_50px_rgba(26,26,26,0.08)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-tarto-red">
            <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
              <path
                d="M18 16h12l2 4H16l2-4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 20h16l-1.4 16.5A3 3 0 0 1 27.6 40H20.4a3 3 0 0 1-3-2.5L16 20z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M24 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="7" r="1.8" fill="#f6b21a" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-tarto-red">Tarto Cakes UG</h1>
          <p className="mt-1 text-sm text-tarto-ink/60">Admin Control</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
