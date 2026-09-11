import { NextResponse } from "next/server";
import { getUpcomingShows } from "@/lib/linktree-tour";

export const revalidate = 3600;

export async function GET() {
  try {
    const shows = await getUpcomingShows();
    return NextResponse.json({ source: "https://linktr.ee/cisne.elocuente", shows });
  } catch {
    return NextResponse.json(
      { source: "https://linktr.ee/cisne.elocuente", shows: [], error: "unavailable" },
      { status: 502 },
    );
  }
}
