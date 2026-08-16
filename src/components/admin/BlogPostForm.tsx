"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createBlogPost,
  updateBlogPost,
  type BlogFormState,
  type BlogSectionInput,
} from "@/app/admin/(dashboard)/blog/actions";

const initialState: BlogFormState = {};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm outline-none focus:border-tarto-red/40 focus:bg-white";

const CATEGORIES = [
  "Tips",
  "Birthday",
  "Wedding",
  "News",
  "Recipe",
  "Behind the Scenes",
];

type Option = { id: string; name: string };

export type BlogFormPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  gallery: string[];
  sections: BlogSectionInput[];
  quote: string | null;
  featured: boolean;
  occasionId: string | null;
  status: "DRAFT" | "PUBLISHED";
};

type Props = {
  mode: "create" | "edit";
  post?: BlogFormPost;
  occasions: Option[];
};

export default function BlogPostForm({ mode, post, occasions }: Props) {
  const action = mode === "edit" ? updateBlogPost : createBlogPost;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sections, setSections] = useState<BlogSectionInput[]>(
    post?.sections?.length
      ? post.sections
      : [
          { heading: "", body: "" },
          { heading: "", body: "" },
        ]
  );
  const [keepCover, setKeepCover] = useState(Boolean(post?.coverImage));
  const [keptGallery, setKeptGallery] = useState<string[]>(post?.gallery ?? []);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label htmlFor="title" className="text-sm font-semibold text-[#333]">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className={inputClass}
            placeholder="e.g. How to Choose the Perfect Cake Flavours"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="excerpt" className="text-sm font-semibold text-[#333]">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className={inputClass}
            placeholder="Short summary for the blog listing"
          />
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-semibold text-[#333]">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={post?.category ?? "Tips"}
            className={inputClass}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="text-sm font-semibold text-[#333]">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "DRAFT"}
            className={inputClass}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="occasionId" className="text-sm font-semibold text-[#333]">
            Related occasion (optional)
          </label>
          <select
            id="occasionId"
            name="occasionId"
            defaultValue={post?.occasionId ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {occasions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2.5 text-sm text-[#555]">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={post?.featured ?? false}
              className="h-4 w-4 accent-tarto-red"
            />
            Featured on blog home
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#333]">Cover image</p>
        <p className="mt-1 text-xs text-[#888]">
          Hero image at the top of the article.
        </p>
        {post?.coverImage && keepCover ? (
          <div className="mt-3 max-w-sm overflow-hidden rounded-xl bg-[#FAFAFA]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              className="h-40 w-full object-cover"
            />
            <label className="flex items-center gap-2 px-3 py-2 text-xs text-[#555]">
              <input
                type="checkbox"
                name="keepCoverImage"
                value={post.coverImage}
                checked={keepCover}
                onChange={(event) => setKeepCover(event.target.checked)}
                className="h-4 w-4 accent-tarto-red"
              />
              Keep current cover
            </label>
          </div>
        ) : null}
        <input
          name="coverImageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required={mode === "create" || !keepCover}
          className={`${inputClass} mt-3 file:mr-3 file:rounded-lg file:border-0 file:bg-tarto-red file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setCoverPreview(file ? URL.createObjectURL(file) : null);
            if (file) setKeepCover(false);
          }}
        />
        {coverPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPreview}
            alt=""
            className="mt-3 h-40 w-full max-w-sm rounded-xl object-cover"
          />
        ) : null}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#333]">Gallery images</p>
        <p className="mt-1 text-xs text-[#888]">
          Shown after the first section (detail / process photos). Two images
          work best.
        </p>
        {post?.gallery?.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {post.gallery.map((src) => {
              const kept = keptGallery.includes(src);
              return (
                <label key={src} className="overflow-hidden rounded-xl bg-[#FAFAFA]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className={`h-28 w-full object-cover ${kept ? "" : "opacity-40"}`}
                  />
                  <span className="flex items-center gap-2 px-3 py-2 text-xs text-[#555]">
                    <input
                      type="checkbox"
                      name="keepGalleryImages"
                      value={src}
                      checked={kept}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setKeptGallery((current) =>
                            current.includes(src) ? current : [...current, src]
                          );
                        } else {
                          setKeptGallery((current) =>
                            current.filter((item) => item !== src)
                          );
                        }
                      }}
                      className="h-4 w-4 accent-tarto-red"
                    />
                    Keep image
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
        <input
          name="galleryImageFiles"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className={`${inputClass} mt-3 file:mr-3 file:rounded-lg file:border-0 file:bg-tarto-red file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
          }}
        />
        {galleryPreviews.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPreviews.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="h-28 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#333]">Content sections</p>
            <p className="mt-1 text-xs text-[#888]">
              Each section has a heading and body, like the public blog layout.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSections((current) => [...current, { heading: "", body: "" }])
            }
            className="rounded-xl border border-[#E0E0E0] bg-white px-3 py-2 text-sm font-semibold text-[#444] hover:bg-[#F7F7F7]"
          >
            + Add section
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#999]">
                  Section {index + 1}
                </p>
                {sections.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                    className="text-xs font-semibold text-tarto-red hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <label className="mt-3 block text-sm font-semibold text-[#333]">
                Heading
                <input
                  name="sectionHeading"
                  required
                  value={section.heading}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSections((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, heading: value } : item
                      )
                    );
                  }}
                  className={inputClass}
                  placeholder="e.g. Match flavour to the occasion"
                />
              </label>
              <label className="mt-3 block text-sm font-semibold text-[#333]">
                Body
                <textarea
                  name="sectionBody"
                  required
                  rows={4}
                  value={section.body}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSections((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, body: value } : item
                      )
                    );
                  }}
                  className={inputClass}
                  placeholder="Write this section..."
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="quote" className="text-sm font-semibold text-[#333]">
          Pull quote (optional)
        </label>
        <textarea
          id="quote"
          name="quote"
          rows={2}
          defaultValue={post?.quote ?? ""}
          className={inputClass}
          placeholder="Beauty catches the eye. Flavour is what makes people come back for a second slice."
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-[#F0F0F0] pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-tarto-red px-5 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90 disabled:opacity-70"
        >
          {pending
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Create post"}
        </button>
        <Link
          href="/admin/blog"
          className="text-sm font-semibold text-[#777] hover:text-tarto-red"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
