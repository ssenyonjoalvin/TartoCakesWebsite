"use client";

import { useEffect, useMemo, useState } from "react";
import { paginateItems, TABLE_PAGE_SIZE } from "@/lib/table-pagination";

export function useTablePagination<T>(
  items: T[],
  resetKey?: unknown,
  pageSize = TABLE_PAGE_SIZE
) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const result = useMemo(
    () => paginateItems(items, page, pageSize),
    [items, page, pageSize]
  );

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages);
    }
  }, [page, result.totalPages]);

  return {
    ...result,
    setPage,
  };
}
