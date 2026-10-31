// Sign-in tokens, shared by the server code and the middleware (no database access here).
import { SignJWT, jwtVerify } from "jose";

import { ADMIN_IDLE_SECONDS, CUSTOMER_MAX_AGE } from "./session-config";

export const SESSION_COOKIE = "ck_session";

export type Role = "CUSTOMER" | "ADMIN";
export type Session = { userId: string; role: Role };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(s);
}

/** Admin tokens are short-lived and renewed on every admin request, so they expire after inactivity. */
export const maxAgeFor = (role: Role) => (role === "ADMIN" ? ADMIN_IDLE_SECONDS : CUSTOMER_MAX_AGE);

export async function signSession(userId: string, role: Role) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeFor(role)}s`)
    .sign(secret());
}

/** Returns the session, or null if the token is missing, tampered with or expired. */
export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { userId: payload.sub, role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER" };
  } catch {
    return null;
  }
}

export const cookieOptions = (role: Role) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeFor(role),
});
