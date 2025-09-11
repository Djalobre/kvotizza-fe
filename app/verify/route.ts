// app/verify/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') || ''
  const email = (searchParams.get('email') || '').toLowerCase()

  const vt = await prisma.verificationToken.findUnique({ where: { token } })
  if (!vt || vt.identifier.toLowerCase() !== email || vt.expires < new Date()) {
    return NextResponse.redirect('/signin?error=VerifyFailed')
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })
  await prisma.verificationToken.delete({ where: { token } })
  return NextResponse.redirect('/signin?verify=ok')
}
