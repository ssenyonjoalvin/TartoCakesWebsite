import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/data/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Story Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);

  return (
    <article className="bg-tarto-cream py-10 lg:py-14">
      <div className="site-container">
        <div className="mx-auto max-w-4xl">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-tarto-red">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-tarto-ink/35">&gt;</span>
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
            <span className="text-tarto-ink/35">&gt;</span>
            <span className="text-tarto-ink">{post.category}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-tarto-red sm:text-4xl lg:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-tarto-ink/60">
            {post.author} · {post.date} · {post.category}
          </p>

          <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(26,26,26,0.06)] sm:aspect-[2/1]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              quality={92}
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover object-center"
            />
          </div>

          <div className="mt-10 space-y-8 text-[1.02rem] leading-relaxed text-tarto-ink/80">
            {post.sections.map((section, index) => (
              <div key={section.heading}>
                <h2 className="text-xl font-bold text-tarto-red sm:text-2xl">
                  {section.heading}
                </h2>
                <p className="mt-3">{section.body}</p>

                {index === 0 && (
                  <div className="mt-8 grid grid-cols-2 items-stretch gap-4">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={post.gallery[0]}
                        alt={`${post.title} detail`}
                        fill
                        sizes="(max-width: 768px) 50vw, 420px"
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl sm:aspect-[4/5]">
                      <Image
                        src={post.gallery[1]}
                        alt={`${post.title} process`}
                        fill
                        sizes="(max-width: 768px) 50vw, 420px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {index === 1 && post.quote && (
                  <blockquote className="mt-8 border-l-4 border-tarto-yellow bg-white/70 px-5 py-4 text-[1.05rem] italic text-tarto-ink">
                    {post.quote}
                  </blockquote>
                )}
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[1.25rem] border-2 border-tarto-red bg-white px-6 py-8 text-center sm:px-10">
            <h2 className="text-2xl font-bold text-tarto-ink">
              Craving Something Special?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-tarto-ink/70">
              Tell us your date, theme, and flavours — we will bake a cake that
              fits the moment.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-full bg-tarto-red px-7 py-3 text-sm font-bold text-white transition hover:bg-tarto-red/90"
            >
              Order a Custom Cake
            </Link>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-tarto-ink">Related Stories</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug}`}
                className="group overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_30px_rgba(26,26,26,0.05)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tarto-orange">
                    {item.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-tarto-ink group-hover:text-tarto-red">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
