import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
      },
    }
  );
}
