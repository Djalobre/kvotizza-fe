// middleware.ts  (place at repo root, or src/middleware.ts if you use /src)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // not signed in
  if (!token) {
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // role check
  const role = (token as any).role ?? "user";
  if (role !== "admin") {
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
