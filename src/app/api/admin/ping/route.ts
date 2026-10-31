import { NextResponse } from "next/server";

// Called by the admin while you're working, so the session doesn't run out mid-task.
// The middleware renews the session on the way in; this just confirms it's still valid.
export function POST() {
  return NextResponse.json({ ok: true });
}
