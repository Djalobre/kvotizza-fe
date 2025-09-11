// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: ['/admin/:path*', '/api/top-matches', '/api/top-matches/:path*'],
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isAdmin = pathname.startsWith('/admin')
  const isApi = pathname.startsWith('/api/')
  const isTopMatches = pathname.startsWith('/api/top-matches')
  if (isTopMatches && req.method === 'GET') {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const signInUrl = new URL('/api/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(signInUrl)
  }
  const role = (token as any).role || 'USER'
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (isAdmin && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Non-GET to /api/top-matches (e.g., POST/PUT/DELETE) requires admin
  if (isTopMatches && req.method !== 'GET' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Forward identity to FastAPI when proxying
  const res = NextResponse.next()
  res.headers.set('x-user-role', 'admin')
  res.headers.set('x-user-id', String((token as any).uid || ''))
  res.headers.set('x-user-email', String(token.email || ''))
  return res
}
