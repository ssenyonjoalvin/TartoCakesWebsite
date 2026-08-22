import { prisma } from "@/lib/prisma";

export type AdminNotificationItem = {
  id: string;
  type: "inquiry" | "review";
  title: string;
  detail: string;
  href: string;
  timeLabel: string;
  createdAt: number;
};

export type AdminNotificationSummary = {
  newInquiries: number;
  pendingReviews: number;
  total: number;
  items: AdminNotificationItem[];
};

function timeLabel(date: Date) {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
  });
}

export async function getAdminNotifications(): Promise<AdminNotificationSummary> {
  const [newInquiries, pendingReviews, recentOrders, recentReviews] =
    await Promise.all([
      prisma.cakeOrder.count({ where: { status: "NEW" } }),
      prisma.cakeReview.count({ where: { status: "PENDING" } }),
      prisma.cakeOrder.findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          cakeName: true,
          createdAt: true,
          occasionOther: true,
          cake: { select: { name: true } },
          occasion: { select: { name: true } },
        },
      }),
      prisma.cakeReview.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          rating: true,
          createdAt: true,
          cake: { select: { name: true } },
        },
      }),
    ]);

  const inquiryItems: AdminNotificationItem[] = recentOrders.map((order) => {
    const cake = order.cakeName ?? order.cake?.name;
    const occasion = order.occasionOther?.trim() || order.occasion?.name;
    const detail = [order.name, cake ?? occasion].filter(Boolean).join(" · ");

    return {
      id: `inquiry-${order.id}`,
      type: "inquiry",
      title: "New quote request",
      detail,
      href: "/admin/orders",
      timeLabel: timeLabel(order.createdAt),
      createdAt: order.createdAt.getTime(),
    };
  });

  const reviewItems: AdminNotificationItem[] = recentReviews.map((review) => ({
    id: `review-${review.id}`,
    type: "review",
    title: "Review to approve",
    detail: `${review.name} · ${review.rating}★ · ${review.cake.name}`,
    href: "/admin/reviews",
    timeLabel: timeLabel(review.createdAt),
    createdAt: review.createdAt.getTime(),
  }));

  const items = [...inquiryItems, ...reviewItems]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  return {
    newInquiries,
    pendingReviews,
    total: newInquiries + pendingReviews,
    items,
  };
}
