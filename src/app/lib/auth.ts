import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// 创建密钥对象
const secretKey = new TextEncoder().encode(JWT_SECRET);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function authenticateToken(request: NextRequest) {
  const headersList = await headers();
  const authorization = headersList.get("authorization");
  const token = authorization?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // 使用jose验证JWT
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Invalid or expired token" },
      { status: 403 }
    );
  }
}

export async function generateToken(username: string) {
  // 使用jose签发JWT
  return await new jose.SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}
