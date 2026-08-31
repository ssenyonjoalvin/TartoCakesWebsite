import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import OrderManager, {
  type OrderRow,
  type OrderUiStatus,
} from "@/components/admin/OrderManager";

export const metadata: Metadata = { title: "Order Management" };

const tones = [
  "bg-[#C45C26]",
  "bg-[#5B6B8C]",
  "bg-tarto-red",
  "bg-[#6B8F71]",
  "bg-[#8B6B4A]",
];

function mapUiStatus(status: string): OrderUiStatus {
  if (status === "NEW") return "new";
  if (status === "COMPLETED") return "fulfilled";
  if (status === "CANCELLED") return "cancelled";
  return "responded";
}

function occasionToneFromLabel(label: string): OrderRow["occasionTone"] {
  const value = label.toLowerCase();
  if (value.includes("wedding")) return "wedding";
  if (value.includes("birthday") || value.includes("princess")) {
    return "birthday";
  }
  if (value.includes("corporate") || value.includes("office")) {
    return "corporate";
  }
  if (value.includes("annivers") || value.includes("romantic")) {
    return "anniversary";
  }
  return "custom";
}

function orderCode(id: string, status: string) {
  const suffix = id.replace(/\W/g, "").slice(-4).toUpperCase();
  if (status === "NEW" || status === "CONTACTED") return `#INQ-${suffix}`;
  return `#ORD-${suffix}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export default async function AdminOrdersPage() {
  const today = startOfToday();
  const monthStart = startOfMonth();

  const [rows, newInquiries, newToday, pendingQuotes, fulfilledMonth] =
    await Promise.all([
      prisma.cakeOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          cake: true,
          customer: true,
          occasion: true,
        },
      }),
      prisma.cakeOrder.count({ where: { status: "NEW" } }),
      prisma.cakeOrder.count({
        where: { status: "NEW", createdAt: { gte: today } },
      }),
      prisma.cakeOrder.count({
        where: {
          status: { in: ["CONTACTED", "QUOTED", "CONFIRMED"] },
        },
      }),
      prisma.cakeOrder.count({
        where: {
          status: "COMPLETED",
          updatedAt: { gte: monthStart },
        },
      }),
    ]);

  const orders: OrderRow[] = rows.map((row, index) => {
    const occasion = row.occasionOther?.trim() || row.occasion?.name || "Custom";

    return {
      id: row.id,
      code: orderCode(row.id, row.status),
      name: row.customer?.name || row.name,
      email: row.customer?.email || row.email,
      phone: row.customer?.phone || row.phone,
      dateLabel: row.createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      eventDateLabel: row.eventDate
        ? row.eventDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      occasion,
      occasionTone: occasionToneFromLabel(
        `${occasion} ${row.occasion?.slug ?? ""}`
      ),
      status: mapUiStatus(row.status),
      dbStatus: row.status,
      message: row.message,
      notes: row.notes ?? "",
      cakeName: row.cakeName ?? row.cake?.name ?? null,
      size: row.size,
      flavor: row.flavor,
      referenceImages: asStringArray(row.referenceImages),
      avatarTone: tones[index % tones.length],
    };
  });

  return (
    <OrderManager
      orders={orders}
      stats={{
        newInquiries,
        newToday,
        pendingQuotes,
        fulfilledMonth,
      }}
    />
  );
}
