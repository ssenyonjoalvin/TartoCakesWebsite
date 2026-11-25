import { notFound } from "next/navigation";
import { getPublishedCakeBySlug } from "@/lib/public-cakes";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * Checks the cake exists *before* loading.tsx starts streaming. Once
 * streaming begins the HTTP status (200) is already sent, so a notFound()
 * inside the page could only show the 404 UI, not return a real 404 status.
 * Layouts render before the page's Suspense boundary, so this one can.
 * (The lookup is cached, so the page's own query costs nothing extra.)
 */
export default async function CakeLayout({ children, params }: Props) {
  const { slug } = await params;
  if (!(await getPublishedCakeBySlug(slug))) notFound();
  return children;
}
