import type { Metadata } from "next";
import CustomerDirectory, {
  type CustomerRow,
} from "@/components/admin/CustomerDirectory";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Customer Management" };

const demoCustomers: CustomerRow[] = [
  {
    id: "demo-1",
    code: "#CUST-8092",
    name: "Elena Voss",
    email: "elena.v@email.com",
    phone: "+1 (555) 019-2834",
    lastInquiry: "Oct 24, 2024",
    status: "quote",
    avatarTone: "bg-[#C45C26]",
    inquiries: [],
  },
  {
    id: "demo-2",
    code: "#CUST-7741",
    name: "Marcus Thorne",
    email: "m.thorne@studio.co",
    phone: "+1 (555) 882-1102",
    lastInquiry: "Oct 22, 2024",
    status: "newsletter",
    avatarTone: "bg-[#5B6B8C]",
    inquiries: [],
  },
  {
    id: "demo-3",
    code: "#CUST-9021",
    name: "Sophia Laurent",
    email: "sophia.l@pastry.io",
    phone: "+1 (555) 441-9981",
    lastInquiry: "Oct 21, 2024",
    status: "active",
    avatarTone: "bg-tarto-red",
    inquiries: [],
  },
];

const tones = ["bg-[#C45C26]", "bg-[#5B6B8C]", "bg-tarto-red", "bg-[#6B8F71]"];

function mapStatus(
  orderStatus: string | undefined
): CustomerRow["status"] {
  if (!orderStatus) return "newsletter";
  if (orderStatus === "CONFIRMED" || orderStatus === "QUOTED" || orderStatus === "COMPLETED") {
    return "active";
  }
  if (orderStatus === "NEW" || orderStatus === "CONTACTED") return "quote";
  return "newsletter";
}

function mapInquiryStatus(status: string) {
  if (status === "COMPLETED") return "Fulfilled";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "NEW") return "New";
  return "In progress";
}

export default async function AdminCustomersPage() {
  let customers = demoCustomers;

  try {
    const rows = await prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { occasion: { select: { name: true } } },
        },
      },
      take: 50,
    });

    if (rows.length > 0) {
      customers = rows.map((row, index) => {
        const latest = row.orders[0];
        return {
          id: row.id,
          code: `#CUST-${row.id.slice(-4).toUpperCase()}`,
          name: row.name,
          email: row.email ?? "—",
          phone: row.phone ?? "—",
          lastInquiry: (latest?.createdAt ?? row.updatedAt).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          ),
          status: mapStatus(latest?.status),
          avatarTone: tones[index % tones.length],
          inquiries: row.orders.map((order) => ({
            id: order.id,
            code: `#INQ-${order.id.slice(-4).toUpperCase()}`,
            dateLabel: order.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            occasion: order.occasion?.name ?? order.occasionOther ?? "Custom",
            cakeName: order.cakeName,
            statusLabel: mapInquiryStatus(order.status),
          })),
        };
      });
    }
  } catch {
    customers = demoCustomers;
  }

  return <CustomerDirectory customers={customers} />;
}
