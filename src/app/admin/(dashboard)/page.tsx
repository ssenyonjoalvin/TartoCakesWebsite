import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { getAdminSession } from "@/lib/auth";
import {
  getDashboardData,
} from "@/lib/admin-dashboard";
import { parseDashboardPeriod } from "@/lib/dashboard-period";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

type Props = {
  searchParams: Promise<{ period?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const period = parseDashboardPeriod(params.period);
  const data = await getDashboardData(period);

  return (
    <DashboardOverview
      userName={session.name}
      data={data}
      period={period}
    />
  );
}
