import { NextResponse } from "next/server";
import { destroyCurrentAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await destroyCurrentAdminSession();
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
      },
    }
  );
}
