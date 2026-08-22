"use client";

import { useEffect, useState } from "react";

function leaveAdmin() {
  window.location.replace("/admin/login");
}

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch {
      // Still leave the dashboard even if the request fails.
    }
    leaveAdmin();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="text-sm font-semibold text-tarto-red hover:underline disabled:opacity-70"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
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
