import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, cookieOptions, signSession, verifySession } from "@/lib/session";

/**
 * Admin sign-out after inactivity.
 * Admin sessions last ADMIN_IDLE_MINUTES. Every admin request (page, save, upload) renews them,
 * so an admin who keeps working stays signed in, and one who walks away is signed out.
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const isApi = req.nextUrl.pathname.startsWith("/api/");

  // Signed in, but not as an admin
  if (session && session.role !== "ADMIN") {
    return isApi ? NextResponse.json({ error: "Not allowed" }, { status: 403 }) : NextResponse.redirect(new URL("/", req.url));
  }

  if (!session) {
    if (isApi) return NextResponse.json({ error: "Your admin session has ended. Sign in again." }, { status: 401 });
    const url = new URL("/account/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    if (token) url.searchParams.set("expired", "1"); // had a session, but it ran out
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Still active: renew the session for another ADMIN_IDLE_MINUTES
  const res = NextResponse.next();
  res.cookies.set(SESSION_COOKIE, await signSession(session.userId, "ADMIN"), cookieOptions("ADMIN"));
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
