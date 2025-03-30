import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({ ping: true });
}
