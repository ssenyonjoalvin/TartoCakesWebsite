import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts, getFeaturedPost, getRecentPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Cake ideas, wedding trends, and baking tips from Tarto Cakes UG.",
};

export default function BlogPage() {
  const featured = getFeaturedPost();
  const recent = getRecentPosts(3);
  const gridPosts = blogPosts.filter((post) => post.id !== featured.id);

  return (
    <section className="bg-tarto-cream py-14">
      <div className="site-container">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-tarto-orange">
            STORIES & IDEAS
          </p>
          <h1 className="mt-3 text-4xl font-bold text-tarto-ink sm:text-5xl">
            Our Blog & Stories
          </h1>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
          <div>
            <article className="overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(26,26,26,0.05)]">
              <Link href={`/blog/${featured.slug}`} className="relative block">
                <div className="relative aspect-[16/8] w-full overflow-hidden sm:aspect-[2/1]">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover object-center"
                  />
                </div>
              </Link>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tarto-orange">
                  {featured.category}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-tarto-ink sm:text-3xl">
                  <Link href={`/blog/${featured.slug}`} className="hover:text-tarto-red">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-tarto-ink/55">
                  {featured.author} · {featured.date}
                </p>
                <p className="mt-4 max-w-3xl leading-relaxed text-tarto-ink/75">
                  {featured.excerpt}
                </p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-5 inline-flex text-sm font-bold text-tarto-red hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </article>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {gridPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(26,26,26,0.05)]"
                >
                  <Link href={`/blog/${post.slug}`} className="relative block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, 35vw"
                        className="object-cover object-center"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tarto-orange">
                      {post.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-tarto-ink">
                      <Link href={`/blog/${post.slug}`} className="hover:text-tarto-red">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-tarto-ink/70">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 text-sm font-bold text-tarto-red hover:underline"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_8px_30px_rgba(26,26,26,0.05)]">
              <h3 className="font-bold text-tarto-ink">Search</h3>
              <input
                type="search"
                placeholder="Search posts..."
                className="mt-3 w-full rounded-md border border-tarto-ink/10 bg-tarto-cream px-3 py-2.5 text-sm outline-none focus:border-tarto-red"
              />
            </div>

            <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_8px_30px_rgba(26,26,26,0.05)]">
              <h3 className="font-bold text-tarto-ink">Categories</h3>
              <ul className="mt-3 space-y-2 text-sm text-tarto-ink/80">
                <li className="flex justify-between">
                  <span>Birthday</span>
                  <span>2</span>
                </li>
                <li className="flex justify-between">
                  <span>Wedding</span>
                  <span>1</span>
                </li>
                <li className="flex justify-between">
                  <span>Tips</span>
                  <span>2</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_8px_30px_rgba(26,26,26,0.05)]">
              <h3 className="font-bold text-tarto-ink">Recent Posts</h3>
              <ul className="mt-4 space-y-4">
                {recent.map((post) => (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="flex gap-3">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-snug text-tarto-ink hover:text-tarto-red">
                          {post.title}
                        </p>
                        <p className="mt-1 text-xs text-tarto-ink/60">{post.date}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.25rem] bg-tarto-red p-5 text-white shadow-sm">
              <h3 className="font-bold">Sweet Newsletter</h3>
              <p className="mt-2 text-sm text-white/85">
                Get cake inspiration and special offers in your inbox.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-md bg-tarto-yellow px-4 py-2 text-sm font-bold text-tarto-ink"
              >
                Subscribe Now
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
