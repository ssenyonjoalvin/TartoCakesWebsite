"use client";

import { useEffect, useState } from "react";

function leaveAdmin() {
  window.location.replace("/admin/login");
}

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Sign out failed");
      const result = await response.json();
      if (result.ok !== true) throw new Error("Sign out failed");
      leaveAdmin();
    } catch {
      setError("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="text-right">
      <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="text-sm font-semibold text-tarto-red hover:underline disabled:opacity-70"
    >
      {pending ? "Signing out..." : "Sign out"}
      </button>
      {error ? <p role="alert" className="mt-1 text-sm text-tarto-red">{error}</p> : null}
    </div>
  );
}

export function AdminSessionGuard() {
  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!cancelled && !response.ok) leaveAdmin();
      } catch {
        // Ignore brief network errors; middleware still blocks full reloads.
      }
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
        return;
      }
      void verifySession();
    }

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", verifySession);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", verifySession);
    };
  }, []);

  return null;
}
