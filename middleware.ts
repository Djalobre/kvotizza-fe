// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: [
    '/admin/:path*',          // protect admin UI
    '/api/admin/:path*',      // protect admin APIs (your daily-picks route)
    '/api/top-matches',       // GET open, others protected
    '/api/top-matches/:path*'
  ],
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  const isAdminUI   = pathname.startsWith('/admin')
  const isAdminAPI  = pathname.startsWith('/api/admin')
  const isTop       = pathname.startsWith('/api/top-matches')
  const isTopWrite  = isTop && req.method !== 'GET'

  // public GET for /api/top-matches
  if (isTop && req.method === 'GET') {
    return NextResponse.next()
  }

  // auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    // APIs get 401; pages redirect to sign-in
    if (isAdminAPI || isTopWrite) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const signInUrl = new URL('/api/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname + search)
    return NextResponse.redirect(signInUrl)
  }

  const role = (token as any).role ?? 'USER'

  // require admin for admin UI/APIs and non-GET top-matches
  if ((isAdminUI || isAdminAPI || isTopWrite) && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 🔑 pass identity to downstream route handlers as *request* headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-role', String(role).toLowerCase())
  requestHeaders.set('x-user-id', String((token as any).uid || ''))
  requestHeaders.set('x-user-email', String(token.email || ''))

  return NextResponse.next({ request: { headers: requestHeaders } })
}
