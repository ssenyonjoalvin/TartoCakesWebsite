"use client";

import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  deleteBlogPost,
  toggleBlogStatus,
} from "@/app/admin/(dashboard)/blog/actions";

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  authorName: string;
  authorInitials: string;
  dateLabel: string;
};

type Props = {
  posts: BlogRow[];
  page: number;
  pageSize: number;
  total: number;
};

function PlaceholderThumb() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F0F0F0] text-[#B0B0B0]">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-1.5" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m21 16-5.5-5.5L8 18" />
      </svg>
    </div>
  );
}

export default function BlogManager({ posts, page, pageSize, total }: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <AdminPageHeader
        title="Blog Management"
        description="Manage your bakery's stories, recipes, and news."
        actions={
          <Link
            href="/admin/blog/new"
            className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90"
          >
            + Create New Post
          </Link>
        }
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5">Thumbnail</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#888]">
                    No blog posts yet.{" "}
                    <Link
                      href="/admin/blog/new"
                      className="font-semibold text-tarto-red hover:underline"
                    >
                      Create your first post
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="px-5 py-4">
                      {post.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.thumbnail}
                          alt=""
                          className="h-14 w-14 rounded-xl object-cover bg-[#F3F3F3]"
                        />
                      ) : (
                        <PlaceholderThumb />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#2B2B2B]">{post.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[#F8E9B8] px-2.5 py-0.5 text-[11px] font-semibold text-[#7A5A12]">
                          {post.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            post.status === "PUBLISHED"
                              ? "bg-[#EBEBEB] text-[#555]"
                              : "bg-[#FBEAEA] text-tarto-red"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? "Published" : "Draft"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDEDED] text-xs font-bold text-[#666]">
                          {post.authorInitials}
                        </div>
                        <span className="text-[#444]">{post.authorName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#555]">{post.dateLabel}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          title="Edit"
                          aria-label={`Edit ${post.title}`}
                          className="rounded-lg p-2 text-[#2563EB] transition hover:bg-[#EFF6FF]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                            <path d="m13.5 6.5 3 3" />
                          </svg>
                        </Link>
                        <form action={toggleBlogStatus}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            title={
                              post.status === "PUBLISHED"
                                ? "Unpublish"
                                : "Publish"
                            }
                            className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                              {post.status === "PUBLISHED" ? (
                                <>
                                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                                  <circle cx="12" cy="12" r="2.5" />
                                </>
                              ) : (
                                <>
                                  <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                                  <path d="m4 4 16 16" />
                                </>
                              )}
                            </svg>
                          </button>
                        </form>
                        <form action={deleteBlogPost}>
                          <input type="hidden" name="id" value={post.id} />
                          <button
                            type="submit"
                            title="Delete"
                            aria-label={`Delete ${post.title}`}
                            className="rounded-lg p-2 text-tarto-red transition hover:bg-[#FBEAEA]"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                              <path d="M4 7h16" />
                              <path d="M9 7V5h6v2" />
                              <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] px-5 py-3.5 text-sm text-[#777]">
          <p>
            Showing {from} to {to} of {total} posts
          </p>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/blog?page=${Math.max(1, page - 1)}`}
              aria-disabled={page <= 1}
              className={`rounded-lg px-2.5 py-1.5 ${
                page <= 1
                  ? "pointer-events-none text-[#CCC]"
                  : "text-[#555] hover:bg-[#F5F5F5]"
              }`}
            >
              ‹
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={`/admin/blog?page=${pageNumber}`}
                  className={`min-w-8 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold ${
                    pageNumber === page
                      ? "border border-tarto-red text-tarto-red"
                      : "text-[#555] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
            <Link
              href={`/admin/blog?page=${Math.min(totalPages, page + 1)}`}
              aria-disabled={page >= totalPages}
              className={`rounded-lg px-2.5 py-1.5 ${
                page >= totalPages
                  ? "pointer-events-none text-[#CCC]"
                  : "text-[#555] hover:bg-[#F5F5F5]"
              }`}
            >
              ›
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
