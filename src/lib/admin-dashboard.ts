import { prisma } from "@/lib/prisma";
import {
  DASHBOARD_PERIODS,
  type DashboardPeriod,
  parseDashboardPeriod,
} from "@/lib/dashboard-period";

export type { DashboardPeriod };
export { DASHBOARD_PERIODS, parseDashboardPeriod };

export type DashboardRecentOrder = {
  id: string;
  code: string;
  name: string;
  email: string;
  occasion: string;
  occasionTone: "wedding" | "birthday" | "corporate" | "anniversary" | "custom";
  cakeName: string | null;
  value: number;
  eventDateLabel: string | null;
  statusLabel: string;
  statusTone: "pending" | "progress" | "delivered" | "cancelled";
  avatarTone: string;
};

export type DashboardTopCake = {
  name: string;
  category: string;
  sold: number;
  image: string;
};

export type DashboardScheduleItem = {
  id: string;
  code: string;
  customerName: string;
  cakeName: string | null;
  occasion: string;
  statusLabel: string;
  statusTone: "pending" | "progress" | "delivered" | "cancelled";
  dateKey: string;
  day: number;
  month: number;
  year: number;
  detail: string;
};

export type DashboardSalesBucket = {
  label: string;
  revenue: number;
};

export type DashboardCustomerType = {
  label: string;
  count: number;
  color: string;
};

export type DashboardData = {
  period: DashboardPeriod;
  periodLabel: string;
  comparisonLabel: string;
  completionRate: number;
  completionDelta: number;
  revenuePeriod: number;
  revenueDelta: number;
  totalInquiries: number;
  completedOrders: number;
  salesBuckets: DashboardSalesBucket[];
  customerTypes: DashboardCustomerType[];
  recentOrders: DashboardRecentOrder[];
  topCakes: DashboardTopCake[];
  scheduleItems: DashboardScheduleItem[];
};

const occasionColors = [
  "#D62828",
  "#F6B21A",
  "#C45C26",
  "#6B8F71",
  "#5B6B8C",
  "#8B5A8C",
  "#E07A5F",
  "#3D5A80",
];

const avatarTones = [
  "bg-[#C45C26]",
  "bg-[#5B6B8C]",
  "bg-tarto-red",
  "bg-[#6B8F71]",
  "bg-[#8B6B4A]",
];

type DateRange = { start: Date; end: Date };

type OrderRecord = Awaited<
  ReturnType<typeof prisma.cakeOrder.findMany>
>[number] & {
  cake: { price: number; name: string; category: string; image: string } | null;
  occasion: { name: string; slug: string } | null;
  customer: { name: string; email: string | null } | null;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function monthStart(date: Date) {
  const value = new Date(date);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
}

function nextMonth(date: Date) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + 1);
  return value;
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function inRange(date: Date, range: DateRange) {
  return date >= range.start && date < range.end;
}

function getPeriodRange(period: DashboardPeriod, now = new Date()): DateRange {
  const end = addDays(startOfDay(now), 1);

  switch (period) {
    case "today":
      return { start: startOfDay(now), end };
    case "week":
      return { start: startOfWeek(now), end };
    case "month":
      return { start: monthStart(now), end };
    case "year":
      return { start: new Date(now.getFullYear(), 0, 1), end };
  }
}

function getPreviousPeriodRange(period: DashboardPeriod, now = new Date()): DateRange {
  switch (period) {
    case "today":
      return { start: addDays(startOfDay(now), -1), end: startOfDay(now) };
    case "week":
      return { start: addDays(startOfWeek(now), -7), end: startOfWeek(now) };
    case "month":
      return {
        start: monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: monthStart(now),
      };
    case "year":
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear(), 0, 1),
      };
  }
}

function comparisonLabel(period: DashboardPeriod) {
  switch (period) {
    case "today":
      return "than yesterday";
    case "week":
      return "than last week";
    case "month":
      return "than last month";
    case "year":
      return "than last year";
  }
}

function orderCode(id: string, status: string) {
  const suffix = id.replace(/\W/g, "").slice(-4).toUpperCase();
  if (status === "NEW" || status === "CONTACTED") return `#INQ-${suffix}`;
  return `#ORD-${suffix}`;
}

function occasionTone(label: string, slug = ""): DashboardRecentOrder["occasionTone"] {
  const value = `${label} ${slug}`.toLowerCase();
  if (value.includes("wedding")) return "wedding";
  if (value.includes("birthday") || value.includes("princess")) return "birthday";
  if (value.includes("corporate") || value.includes("office")) return "corporate";
  if (value.includes("annivers") || value.includes("romantic")) return "anniversary";
  return "custom";
}

function occasionChartLabel(name: string) {
  return name.replace(/\s+cakes$/i, "").trim() || name;
}

function statusMeta(status: string) {
  if (status === "NEW") {
    return { label: "Pending", tone: "pending" as const };
  }
  if (status === "CONTACTED" || status === "QUOTED") {
    return { label: "Design Sent", tone: "progress" as const };
  }
  if (status === "CONFIRMED") {
    return { label: "Baking", tone: "progress" as const };
  }
  if (status === "COMPLETED") {
    return { label: "Delivered", tone: "delivered" as const };
  }
  return { label: "Cancelled", tone: "cancelled" as const };
}

function estimateValue(price: number | null | undefined) {
  return price && price > 0 ? price : 0;
}

function revenueInRange(orders: OrderRecord[], range: DateRange) {
  return orders
    .filter(
      (order) =>
        order.status === "COMPLETED" && inRange(order.updatedAt, range)
    )
    .reduce((sum, order) => sum + estimateValue(order.cake?.price), 0);
}

function completedCountInRange(orders: OrderRecord[], range: DateRange) {
  return orders.filter(
    (order) => order.status === "COMPLETED" && inRange(order.updatedAt, range)
  ).length;
}

function buildSalesBuckets(
  period: DashboardPeriod,
  orders: OrderRecord[],
  range: DateRange,
  now = new Date()
): DashboardSalesBucket[] {
  const completedInBucket = (bucket: DateRange) =>
    orders
      .filter(
        (order) =>
          order.status === "COMPLETED" && inRange(order.updatedAt, bucket)
      )
      .reduce((sum, order) => sum + estimateValue(order.cake?.price), 0);

  if (period === "today") {
    const dayStart = range.start;
    return Array.from({ length: 8 }, (_, index) => {
      const start = new Date(dayStart);
      start.setHours(index * 3, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 3);
      const revenue = completedInBucket({ start, end });
      const hour = start.getHours();
      const label =
        hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
      return { label, revenue };
    });
  }

  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const start = addDays(range.start, index);
      const end = addDays(start, 1);
      const revenue = completedInBucket({ start, end });
      return {
        label: start.toLocaleDateString("en-US", { weekday: "short" }),
        revenue,
      };
    });
  }

  if (period === "month") {
    const monthEnd = range.end;
    const buckets: DashboardSalesBucket[] = [];
    let cursor = new Date(range.start);

    while (cursor < monthEnd) {
      const start = new Date(cursor);
      const end = addDays(start, 7);
      const bucketEnd = end > monthEnd ? monthEnd : end;
      const revenue = completedInBucket({ start, end: bucketEnd });
      buckets.push({
        label: start.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        revenue,
      });
      cursor = bucketEnd;
    }

    return buckets.slice(0, 5);
  }

  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, index) => {
    const start = new Date(year, index, 1);
    const end = new Date(year, index + 1, 1);
    const revenue = completedInBucket({ start, end });
    return {
      label: start.toLocaleDateString("en-US", { month: "short" }),
      revenue,
    };
  }).slice(0, now.getMonth() + 1);
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildScheduleItems(orders: OrderRecord[]): DashboardScheduleItem[] {
  return orders
    .filter(
      (order) =>
        order.eventDate &&
        order.status !== "CANCELLED" &&
        order.status !== "COMPLETED"
    )
    .map((order) => {
      const eventDate = order.eventDate!;
      const occasion =
        order.occasionOther?.trim() || order.occasion?.name || "Custom";
      const status = statusMeta(order.status);
      const cakeName = order.cakeName ?? order.cake?.name ?? null;
      const detailParts = [occasion];
      if (order.size) detailParts.push(order.size);
      if (order.flavor) detailParts.push(order.flavor);

      return {
        id: order.id,
        code: orderCode(order.id, order.status),
        customerName: order.customer?.name || order.name,
        cakeName,
        occasion,
        statusLabel: status.label,
        statusTone: status.tone,
        dateKey: dateKeyFromDate(eventDate),
        day: eventDate.getDate(),
        month: eventDate.getMonth(),
        year: eventDate.getFullYear(),
        detail: detailParts.join(" · "),
      };
    })
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.customerName.localeCompare(b.customerName);
    });
}

export async function getDashboardData(
  period: DashboardPeriod = "month"
): Promise<DashboardData> {
  const now = new Date();
  const range = getPeriodRange(period, now);
  const previousRange = getPreviousPeriodRange(period, now);

  const allOrders = await prisma.cakeOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cake: true,
      occasion: true,
      customer: true,
    },
  });

  const periodOrders = allOrders.filter((order) => inRange(order.createdAt, range));
  const activePeriodOrders = periodOrders.filter((order) => order.status !== "CANCELLED");
  const completedPeriodOrders = periodOrders.filter(
    (order) => order.status === "COMPLETED"
  );

  const completionRate =
    activePeriodOrders.length > 0
      ? Math.round((completedPeriodOrders.length / activePeriodOrders.length) * 100)
      : 0;

  const revenuePeriod = revenueInRange(allOrders, range);
  const revenuePrevious = revenueInRange(allOrders, previousRange);
  const revenueDelta = revenuePeriod - revenuePrevious;

  const completedCurrent = completedCountInRange(allOrders, range);
  const completedPrevious = completedCountInRange(allOrders, previousRange);
  const completionDelta =
    completedPrevious > 0
      ? Math.round(((completedCurrent - completedPrevious) / completedPrevious) * 100)
      : completedCurrent > 0
        ? 100
        : 0;

  const salesBuckets = buildSalesBuckets(period, allOrders, range, now);

  const occasionCounts = new Map<string, number>();
  let otherCount = 0;
  for (const order of periodOrders) {
    const catalogName = order.occasion?.name?.trim();
    if (catalogName) {
      const label = occasionChartLabel(catalogName);
      occasionCounts.set(label, (occasionCounts.get(label) ?? 0) + 1);
    } else {
      otherCount += 1;
    }
  }

  if (otherCount > 0) {
    occasionCounts.set("Other", otherCount);
  }

  const customerTypes: DashboardCustomerType[] = [...occasionCounts.entries()]
    .filter(([, count]) => count > 0)
    .map(([label, count], index) => ({
      label,
      count,
      color: occasionColors[index % occasionColors.length],
    }));

  const cakeCounts = new Map<
    string,
    { name: string; category: string; sold: number; image: string }
  >();

  for (const order of periodOrders) {
    const name = order.cakeName ?? order.cake?.name;
    if (!name) continue;
    const key = order.cakeId ?? name;
    const existing = cakeCounts.get(key);
    if (existing) {
      existing.sold += 1;
      continue;
    }
    cakeCounts.set(key, {
      name,
      category: order.cake?.category ?? "custom",
      sold: 1,
      image: order.cake?.image ?? "/images/chocolate-cake.jpg",
    });
  }

  const topCakes = [...cakeCounts.values()]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  const recentOrders: DashboardRecentOrder[] = periodOrders
    .slice(0, 6)
    .map((order, index) => {
      const occasion =
        order.occasionOther?.trim() || order.occasion?.name || "Custom";
      const status = statusMeta(order.status);

      return {
        id: order.id,
        code: orderCode(order.id, order.status),
        name: order.customer?.name || order.name,
        email: order.customer?.email || order.email,
        occasion,
        occasionTone: occasionTone(occasion, order.occasion?.slug),
        cakeName: order.cakeName ?? order.cake?.name ?? null,
        value: estimateValue(order.cake?.price),
        eventDateLabel: order.eventDate
          ? order.eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        statusLabel: status.label,
        statusTone: status.tone,
        avatarTone: avatarTones[index % avatarTones.length],
      };
    });

  const scheduleItems = buildScheduleItems(allOrders);

  return {
    period,
    periodLabel:
      DASHBOARD_PERIODS.find((item) => item.id === period)?.label ?? "This Month",
    comparisonLabel: comparisonLabel(period),
    completionRate,
    completionDelta,
    revenuePeriod,
    revenueDelta,
    totalInquiries: periodOrders.length,
    completedOrders: completedPeriodOrders.length,
    salesBuckets,
    customerTypes,
    recentOrders,
    topCakes,
    scheduleItems,
  };
}
