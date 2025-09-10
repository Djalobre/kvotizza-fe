// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/admin/:path*", "/api/top-matches", "/api/top-matches/:path*"],
};

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const signInUrl = new URL('/api/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(signInUrl)
  }
  const role = (token as any).role || 'USER'
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Forward identity to FastAPI when proxying
  const res = NextResponse.next()
  res.headers.set('x-user-role', 'admin')
  res.headers.set('x-user-id', String((token as any).uid || ''))
  res.headers.set('x-user-email', String(token.email || ''))
  return res
}
