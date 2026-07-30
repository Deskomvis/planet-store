import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Pass `{ role: "admin" }` to restrict a route to full admins only — the
 * "input" role is limited to category/product CRUD and gets a 403
 * everywhere else, even if it somehow bypasses the UI/page-level gate.
 */
export async function requireAdmin(opts?: { role?: "admin" }) {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (opts?.role && session.role !== opts.role) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null };
}
