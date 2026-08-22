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
    <div className="flex min-h-screen items-stretch p-3 sm:p-5">
      <div
        className="relative flex w-full flex-1 flex-col overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 12% 42%, rgba(214,40,40,0.55) 0%, transparent 58%), radial-gradient(ellipse 65% 70% at 88% 28%, rgba(246,178,26,0.42) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 78% 88%, rgba(255,193,7,0.28) 0%, transparent 50%), linear-gradient(135deg, #f4b3ae 0%, #f3c4b6 38%, #fff4e5 72%, #fde7b8 100%)",
        }}
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

          <div className="w-full max-w-[420px] rounded-[1.75rem] bg-white px-7 py-9 shadow-[0_24px_60px_rgba(26,26,26,0.12)] sm:px-10 sm:py-10">
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
