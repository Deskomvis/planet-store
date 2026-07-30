import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

// Routes the restricted "input" role (category/product CRUD only) may not
// visit, even with a valid session — kept in sync with the API-level
// requireAdmin({ role: "admin" }) checks on banners/testimonials/settings.
const ADMIN_ONLY_PATHS = ["/admin/testimoni", "/admin/pengaturan"];

function getSecretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const role = (payload as { role?: string }).role;

    if (role === "input" && ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
