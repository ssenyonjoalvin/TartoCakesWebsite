import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/data/cakes";
import DashboardPeriodFilter from "@/components/admin/DashboardPeriodFilter";
import DashboardCakeSchedule from "@/components/admin/DashboardCakeSchedule";
import {
  type DashboardData,
  type DashboardPeriod,
} from "@/lib/admin-dashboard";

type Props = {
  userName: string;
  data: DashboardData;
  period: DashboardPeriod;
};

const statusStyles = {
  pending: "bg-[#F3E0A8] text-[#7A5A12]",
  progress: "bg-[#E8EEF6] text-[#4A5F7A]",
  delivered: "bg-[#E8F5EC] text-[#2F6B45]",
  cancelled: "bg-[#F5E8E8] text-[#8A4A4A]",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function DonutChart({
  segments,
}: {
  segments: DashboardData["customerTypes"];
}) {
  const total = segments.reduce((sum, item) => sum + item.count, 0);
  const ringTotal = total || 1;
  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth="18"
          />
          {total > 0
            ? segments
                .filter((segment) => segment.count > 0)
                .map((segment) => {
                  const length = (segment.count / ringTotal) * circumference;
                  const dasharray = `${length} ${circumference - length}`;
                  const dashoffset = -offset;
                  offset += length;
                  return (
                    <circle
                      key={segment.label}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="18"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-[#2B2B2B]">{total}</p>
          <p className="text-xs text-[#888]">{total === 1 ? "Order" : "Orders"}</p>
        </div>
      </div>
      <div className="mt-5 w-full space-y-2">
        {segments
          .filter((segment) => segment.count > 0)
          .map((segment) => (
          <div key={segment.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-[#555]">{segment.label}</span>
            </div>
            <span className="font-semibold text-[#2B2B2B]">
              {segment.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesChart({ buckets }: { buckets: DashboardData["salesBuckets"] }) {
  const maxValue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
  const columnClass =
    buckets.length <= 5
      ? "grid-cols-5"
      : buckets.length <= 7
        ? "grid-cols-7"
        : buckets.length <= 8
          ? "grid-cols-8"
          : "grid-cols-12";

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-[#777]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-tarto-yellow" />
          Completed cake sales
        </span>
      </div>
      <div className={`grid h-56 items-end gap-2 sm:gap-4 ${columnClass}`}>
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex h-full flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-5 rounded-t-md bg-tarto-yellow sm:w-7"
                style={{
                  height: `${(bucket.revenue / maxValue) * 100}%`,
                  minHeight: bucket.revenue ? 8 : 0,
                }}
                title={`${bucket.label}: ${formatPrice(bucket.revenue)}`}
              />
            </div>
            <span className="text-[10px] text-[#888] sm:text-xs">{bucket.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardOverview({ userName, data, period }: Props) {
  const conversionRate =
    data.totalInquiries > 0
      ? Math.round((data.completedOrders / data.totalInquiries) * 100)
      : 0;

  const periodSummary =
    period === "today"
      ? "today"
      : period === "week"
        ? "this week"
        : period === "month"
          ? "this month"
          : "this year";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight text-[#2B2B2B]">
            Welcome back, {userName.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-[#777]">
            Here is how Tarto Cakes is performing {periodSummary}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardPeriodFilter period={period} />
          <Link
            href="/admin/orders"
            className="rounded-full bg-[#2B2B2B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#444]"
          >
            View orders
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-semibold text-[#777]">Order completion rate</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-4xl font-bold text-[#2B2B2B]">{data.completionRate}%</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                data.completionDelta >= 0
                  ? "bg-[#E8F5EC] text-[#2F6B45]"
                  : "bg-[#F5E8E8] text-[#8A4A4A]"
              }`}
            >
              {data.completionDelta >= 0 ? "+" : ""}
              {data.completionDelta}%
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
            <div
              className="h-full rounded-full bg-tarto-red"
              style={{ width: `${data.completionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-semibold text-[#777]">Bakery revenue</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold text-[#2B2B2B] sm:text-4xl">
              {formatPrice(data.revenuePeriod)}
            </p>
          </div>
          <p className="mt-3 text-sm text-[#777]">
            {data.revenueDelta >= 0 ? "+" : ""}
            {formatPrice(Math.abs(data.revenueDelta))}{" "}
            {data.revenueDelta >= 0 ? "more" : "less"} {data.comparisonLabel}
          </p>
          <div className="mt-4 flex h-10 items-end gap-1">
            {data.salesBuckets.slice(-6).map((bucket, index) => {
              const max = Math.max(...data.salesBuckets.map((item) => item.revenue), 1);
              return (
                <div
                  key={`${bucket.label}-${index}`}
                  className="flex-1 rounded-t-sm bg-tarto-red/80"
                  style={{
                    height: `${(bucket.revenue / max) * 100}%`,
                    minHeight: bucket.revenue ? 6 : 2,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-semibold text-[#777]">Order conversion</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-4xl font-bold text-[#2B2B2B]">{conversionRate}%</p>
          </div>
          <div className="mt-4 space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-xs text-[#777]">
                <span>Inquiries</span>
                <span>{data.totalInquiries.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-[#E8EEF6]">
                <div className="h-full w-full rounded-full bg-[#5B6B8C]" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-[#777]">
                <span>Completed orders</span>
                <span>{data.completedOrders.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-[#F0F0F0]">
                <div
                  className="h-full rounded-full bg-tarto-yellow"
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardCakeSchedule items={data.scheduleItems} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#2B2B2B]">
              Cake sales
            </h2>
          </div>
          <div className="mt-5">
            <SalesChart buckets={data.salesBuckets} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-6">
          <h2 className="text-lg font-bold text-[#2B2B2B]">Occasions</h2>
          <div className="mt-5">
            <DonutChart segments={data.customerTypes} />
          </div>
          <Link
            href="/admin/customers"
            className="mt-4 inline-flex text-sm font-semibold text-tarto-red hover:underline"
          >
            More details
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F0F0] px-5 py-4">
            <h2 className="text-lg font-bold text-[#2B2B2B]">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-tarto-red hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#F5F5F5] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Needed by</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#F8F8F8] last:border-0">
                      <td className="px-5 py-4 font-semibold text-[#2B2B2B]">{order.code}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${order.avatarTone}`}
                          >
                            {initials(order.name)}
                          </span>
                          <div>
                            <p className="font-semibold text-[#2B2B2B]">{order.name}</p>
                            <p className="text-xs text-[#888]">{order.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#555]">{order.occasion}</td>
                      <td className="px-5 py-4 font-semibold text-[#2B2B2B]">
                        {order.value ? formatPrice(order.value) : "—"}
                      </td>
                      <td className="px-5 py-4 text-[#555]">
                        {order.eventDateLabel ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.statusTone]}`}
                        >
                          {order.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#888]">
                      No orders in this period yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-6">
          <h2 className="text-lg font-bold text-[#2B2B2B]">Top performing cakes</h2>
          <div className="mt-5 space-y-4">
            {data.topCakes.length > 0 ? (
              data.topCakes.map((cake) => (
                <div key={cake.name} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                    <Image
                      src={cake.image}
                      alt={cake.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#2B2B2B]">{cake.name}</p>
                    <p className="text-xs capitalize text-[#888]">{cake.category}</p>
                  </div>
                  <p className="text-sm font-bold text-tarto-red">{cake.sold} sold</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#888]">
                Cake popularity will appear once orders start coming in.
              </p>
            )}
          </div>
          <Link
            href="/admin/products"
            className="mt-5 inline-flex text-sm font-semibold text-tarto-red hover:underline"
          >
            Manage products
          </Link>
        </div>
      </div>
    </div>
  );
}
