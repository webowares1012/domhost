import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/register"];

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("domain_manager_token")?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Check whether the token is actually valid
  let user = null;

  if (token) {
    user = await verifyToken(token);
  }

  /*
   * USER IS LOGGED IN
   *
   * If they try to visit /login or /register,
   * send them back to dashboard.
   */
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  /*
   * USER IS NOT LOGGED IN
   *
   * Protect dashboard routes.
   */
  if (!user && pathname.startsWith("/dashboard")) {
    const response = NextResponse.redirect(new URL("/login", req.url));

    // Prevent caching the protected response
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    return response;
  }

  /*
   * Prevent browser/proxy caching of auth pages.
   */
  const response = NextResponse.next();

  if (
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    response.headers.set("Pragma", "no-cache");

    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
