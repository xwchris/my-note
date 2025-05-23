import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/app/lib/auth";
import { readNotes } from "@/app/lib/notes";

export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const notes = await readNotes();
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to get notes:", error);
    return NextResponse.json({ error: "Failed to get notes" }, { status: 500 });
  }
}
