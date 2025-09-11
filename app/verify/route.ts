// app/verify/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const email = (url.searchParams.get('email') || '').toLowerCase()
  const base = process.env.NEXTAUTH_URL || `${url.protocol}//${url.host}`

  try {
    const vt = await prisma.verificationToken.findUnique({ where: { token } })
    if (!vt || vt.identifier.toLowerCase() !== email || vt.expires < new Date()) {
      return NextResponse.redirect(`${base}/signin?error=VerifyFailed`)
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date(), isVerified: true },
    })
    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.redirect(`${base}/signin?verify=ok`)
  } catch (e) {
    console.error('verify error:', e)
    return NextResponse.redirect(`${base}/signin?error=VerifyFailed`)
  }
}
