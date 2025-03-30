import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/app/lib/auth";
import { readNotes, writeNotes, updateActivityStats } from "@/app/lib/notes";

export async function POST(request: NextRequest) {
  const authResult = await authenticateToken(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const note = await request.json();
    const notes = await readNotes();

    const existingNote = notes.find((n) => n.uuid === note.uuid);

    if (existingNote) {
      if (existingNote.version > note.version) {
        return NextResponse.json(
          {
            conflict: true,
            serverVersion: existingNote,
          },
          { status: 409 }
        );
      }
      Object.assign(existingNote, note);
    } else {
      notes.push(note);
    }

    await writeNotes(notes);
    await updateActivityStats(notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
