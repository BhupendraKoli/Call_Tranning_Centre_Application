import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secret = new TextEncoder().encode(secretKey);

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
};

export async function createSession(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as "ADMIN" | "EMPLOYEE",
    };
  } catch {
    return null;
  }
}