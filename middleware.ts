// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/admin/:path*", "/api/top-matches", "/api/top-matches/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api/");
  const isTopMatches = pathname.startsWith("/api/top-matches");

  // 1) Public GET for /api/top-matches
  if (isTopMatches && req.method === "GET") {
    return NextResponse.next();
  }

  // 2) For everything else matched above, require a token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // For API requests, return JSON 401; for pages, redirect to sign-in
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  // 3) Role check
  const role = (token as any).role ?? "user";

  // Admin area requires admin role
  if (isAdmin && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Non-GET to /api/top-matches (e.g., POST/PUT/DELETE) requires admin
  if (isTopMatches && req.method !== "GET" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}
