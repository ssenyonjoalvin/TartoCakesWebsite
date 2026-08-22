"use client";

import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TablePagination from "@/components/admin/TablePagination";
import { useTablePagination } from "@/components/admin/useTablePagination";
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  toggleCatalogItem,
  type CatalogFormState,
  type CatalogKind,
} from "@/app/admin/(dashboard)/settings/catalog-actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { matchesSearch, useAdminSearch } from "@/components/admin/AdminSearch";

export type CatalogRow = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  servings?: number | null;
  slug?: string;
};

type Props = {
  kind: CatalogKind;
  title: string;
  description: string;
  singular: string;
  items: CatalogRow[];
  showServings?: boolean;
};

const initialState: CatalogFormState = {};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-3 py-2.5 text-sm outline-none focus:border-tarto-red/40 focus:bg-white";

function CatalogFormFields({
  kind,
  singular,
  showServings,
  item,
}: {
  kind: CatalogKind;
  singular: string;
  showServings: boolean;
  item?: CatalogRow | null;
}) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div>
        <label htmlFor="name" className="text-sm font-semibold text-[#333]">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={item?.name ?? ""}
          className={inputClass}
          placeholder={
            showServings
              ? 'e.g. 8"'
              : kind === "occasions"
                ? "e.g. Birthday"
                : "e.g. Red Velvet"
          }
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-semibold text-[#333]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={item?.description ?? ""}
          className={inputClass}
        />
      </div>

      {showServings ? (
        <div>
          <label htmlFor="servings" className="text-sm font-semibold text-[#333]">
            Servings (optional)
          </label>
          <input
            id="servings"
            name="servings"
            type="number"
            min={1}
            defaultValue={item?.servings ?? ""}
            className={inputClass}
          />
        </div>
      ) : null}

      {item ? (
        <label className="flex items-center gap-2 text-sm text-[#555]">
          <input
            type="checkbox"
            name="active"
            defaultChecked={item.active}
            className="h-4 w-4 accent-tarto-red"
          />
          Active — shown when choosing cake options
        </label>
      ) : null}

      <p className="sr-only">{singular}</p>
    </>
  );
}

function CatalogDialog({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-[#2B2B2B]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#777]">{description}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-lg leading-none text-[#888] hover:bg-[#F5F5F5] hover:text-tarto-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CatalogManager({
  kind,
  title,
  description,
  singular,
  items,
  showServings = false,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CatalogRow | null>(null);

  const createAction = createCatalogItem.bind(null, kind);
  const updateAction = updateCatalogItem.bind(null, kind);
  const deleteAction = deleteCatalogItem.bind(null, kind);
  const toggleAction = toggleCatalogItem.bind(null, kind);

  const [createState, createFormAction, createPending] = useActionState(
    createAction,
    initialState
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    initialState
  );

  const { query } = useAdminSearch();
  const visible = useMemo(
    () =>
      items.filter((item) =>
        matchesSearch(query, item.name, item.description, item.slug)
      ),
    [items, query]
  );
  const pagination = useTablePagination(visible, query);

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white hover:bg-tarto-red/90"
          >
            + Add {singular}
          </button>
        }
      />

      <CatalogDialog
        open={adding}
        title={`Add ${singular}`}
        description={`Create a new ${singular} for products and quotes.`}
        onClose={() => setAdding(false)}
      >
        <form action={createFormAction} className="mt-5 space-y-4">
          <CatalogFormFields
            kind={kind}
            singular={singular}
            showServings={showServings}
          />
          {createState.error ? (
            <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red">
              {createState.error}
            </p>
          ) : null}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={createPending}
              className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {createPending ? "Adding..." : `Add ${singular}`}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm font-semibold text-[#777] hover:text-tarto-red"
            >
              Cancel
            </button>
          </div>
        </form>
      </CatalogDialog>

      <CatalogDialog
        open={Boolean(editing)}
        title={`Edit ${singular}`}
        description={`Update this ${singular}.`}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <form
            key={editing.id}
            action={updateFormAction}
            className="mt-5 space-y-4"
          >
            <CatalogFormFields
              kind={kind}
              singular={singular}
              showServings={showServings}
              item={editing}
            />
            {updateState.error ? (
              <p className="rounded-md bg-tarto-red/10 px-3 py-2 text-sm text-tarto-red">
                {updateState.error}
              </p>
            ) : null}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={updatePending}
                className="rounded-xl bg-tarto-red px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70"
              >
                {updatePending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-sm font-semibold text-[#777] hover:text-tarto-red"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </CatalogDialog>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Description</th>
                {showServings ? <th className="px-5 py-3.5">Servings</th> : null}
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={showServings ? 5 : 4}
                    className="px-5 py-12 text-center text-[#888]"
                  >
                    {query.trim()
                      ? `No ${title.toLowerCase()} match this search.`
                      : `No ${title.toLowerCase()} yet. Add your first ${singular}.`}
                  </td>
                </tr>
              ) : (
                pagination.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#F5F5F5] last:border-0">
                    <td className="px-5 py-4 font-semibold text-[#2B2B2B]">
                      {item.name}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-[#666]">
                      {item.description || "—"}
                    </td>
                    {showServings ? (
                      <td className="px-5 py-4 text-[#555]">
                        {item.servings ?? "—"}
                      </td>
                    ) : null}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.active
                            ? "bg-[#E8F5EC] text-[#2F6B45]"
                            : "bg-[#EBEBEB] text-[#777]"
                        }`}
                      >
                        {item.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setAdding(false);
                          }}
                          aria-label={`Edit ${item.name}`}
                          title="Edit"
                          className="rounded-lg p-2 text-[#2563EB] transition hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current stroke-2"
                            aria-hidden
                          >
                            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                            <path d="m13.5 6.5 3 3" />
                          </svg>
                        </button>
                        <form action={toggleAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={item.active ? "true" : "false"}
                          />
                          <button
                            type="submit"
                            aria-label={item.active ? `Hide ${item.name}` : `Show ${item.name}`}
                            title={item.active ? "Hide" : "Show"}
                            className="rounded-lg p-2 text-[#777] transition hover:bg-[#F5F5F5] hover:text-tarto-ink"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-none stroke-current stroke-2"
                              aria-hidden
                            >
                              {item.active ? (
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
                        <ConfirmDeleteForm
                          action={deleteAction}
                          message={`Delete ${singular} "${item.name}"? This cannot be undone.`}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            aria-label={`Delete ${item.name}`}
                            title="Delete"
                            className="rounded-lg p-2 text-tarto-red transition hover:bg-[#FBEAEA]"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-none stroke-current stroke-2"
                              aria-hidden
                            >
                              <path d="M4 7h16" />
                              <path d="M9 7V5h6v2" />
                              <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </ConfirmDeleteForm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.setPage}
          label={title.toLowerCase()}
        />
      </div>
    </div>
  );
}
