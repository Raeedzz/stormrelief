import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }
  try {
    const results = await geocodeAddress(q);
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { results: [], error: (e as Error).message },
      { status: 200 }
    );
  }
}
