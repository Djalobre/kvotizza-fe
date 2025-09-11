// app/verify/route.ts
export const runtime = 'nodejs'  // ✅ force Node.js so Prisma works

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const email = (url.searchParams.get('email') || '').toLowerCase()

  try {
    // Look up by unique token
    const vt = await prisma.verificationToken.findUnique({ where: { token } })
    if (!vt || vt.identifier.toLowerCase() !== email || vt.expires < new Date()) {
      // absolute redirect to avoid proxy weirdness
      return NextResponse.redirect(new URL('/signin?error=VerifyFailed', url))
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })
    await prisma.verificationToken.delete({ where: { token } })

    // absolute redirect (based on current origin)
    return NextResponse.redirect(new URL('/signin?verify=ok', url))
  } catch (err) {
    console.error('verify error:', err)
    return NextResponse.redirect(new URL('/signin?error=VerifyFailed', url))
  }
}
