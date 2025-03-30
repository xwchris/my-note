import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/app/lib/auth";
import { readNotes, updateActivityStats } from "@/app/lib/notes";

export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const notes = await readNotes();
    const stats = await updateActivityStats(notes);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get stats:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
