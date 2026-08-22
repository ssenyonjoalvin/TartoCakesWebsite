"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type AdminSearchValue = {
  query: string;
  setQuery: (value: string) => void;
};

const AdminSearchContext = createContext<AdminSearchValue>({
  query: "",
  setQuery: () => {},
});

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const value = useMemo(() => ({ query, setQuery }), [query]);

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  return useContext(AdminSearchContext);
}

export function matchesSearch(
  query: string,
  ...values: Array<string | number | null | undefined>
) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(term)
  );
}
