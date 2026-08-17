"use client";

import { useRouter } from "next/navigation";
import {
  DASHBOARD_PERIODS,
  type DashboardPeriod,
} from "@/lib/dashboard-period";

type Props = {
  period: DashboardPeriod;
};

export default function DashboardPeriodFilter({ period }: Props) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as DashboardPeriod;
    if (value === "month") {
      router.push("/admin");
      return;
    }
    router.push(`/admin?period=${value}`);
  }

  return (
    <div className="relative">
      <select
        value={period}
        onChange={handleChange}
        aria-label="Filter dashboard by period"
        className="appearance-none rounded-full border border-[#E6E6E6] bg-white py-2 pl-4 pr-10 text-sm font-medium text-[#555] outline-none transition focus:border-tarto-red/30 focus:ring-2 focus:ring-tarto-red/10"
      >
        {DASHBOARD_PERIODS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#888]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
