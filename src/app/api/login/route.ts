import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await generateToken(username);
  return NextResponse.json({ token });
}
