"use client";

import { useMemo, useState } from "react";
import { paginateItems, TABLE_PAGE_SIZE } from "@/lib/table-pagination";

export function useTablePagination<T>(
  items: T[],
  resetKey?: unknown,
  pageSize = TABLE_PAGE_SIZE
) {
  const [state, setState] = useState({ page: 1, resetKey });
  const page = Object.is(state.resetKey, resetKey) ? state.page : 1;

  const result = useMemo(
    () => paginateItems(items, page, pageSize),
    [items, page, pageSize]
  );

  // Normalize stored state when a filter or deletion removes the selected page.
  if (!Object.is(state.resetKey, resetKey) || state.page !== result.page) {
    setState({ resetKey, page: result.page });
  }

  return {
    ...result,
    setPage: (next: number | ((current: number) => number)) => setState({
      resetKey,
      page: typeof next === "function" ? next(result.page) : next,
    }),
  };
}
