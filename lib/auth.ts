import { cookies } from "next/headers";
import { JWTPayload, jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthPayload extends JWTPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export async function createToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("domain_manager_token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
