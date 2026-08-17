export type DashboardPeriod = "today" | "week" | "month" | "year";

export const DASHBOARD_PERIODS: { id: DashboardPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export function parseDashboardPeriod(value?: string): DashboardPeriod {
  if (
    value === "today" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  ) {
    return value;
  }
  return "month";
}
