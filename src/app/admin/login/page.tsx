import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to the Tarto Cakes UG admin dashboard.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-stretch bg-[#faf9f6]">
      <div
        className="relative flex w-full flex-1 flex-col bg-[#faf9f6]"
      >
        <Link
          href="/"
          className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-sm font-medium text-tarto-ink/80 backdrop-blur-sm transition hover:bg-white/40 hover:text-tarto-ink sm:left-8 sm:top-7"
        >
          <span aria-hidden>←</span>
          Home page
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6">
          <div className="mb-7 flex flex-col items-center">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
              <Image
                src="/images/brand/tarto-logo.png"
                alt="Tarto Cakes UG"
                width={72}
                height={72}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <p className="mt-3 font-brand text-3xl leading-none text-tarto-red">
            Tarto Cakes UG
            </p>
          </div>

          <div className="w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white px-7 py-9 shadow-[0_12px_40px_rgba(26,26,26,0.08)] sm:px-10 sm:py-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-tarto-ink">Welcome Back!</h1>
              <p className="mt-1.5 text-sm text-tarto-ink/50">
                 Please enter your details.
              </p>
            </div>

            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
