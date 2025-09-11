// app/api/auth/request-reset/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { addHours } from 'date-fns'
import { sendMail } from '@/lib/mailer'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email } = await req.json()
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (user) {
    const token = crypto.randomUUID() + crypto.randomBytes(8).toString('hex')
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expires: addHours(new Date(), 2) }, // 2h expiry
    })
    const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${encodeURIComponent(token)}`
    await sendMail(
      user.email,
      'Reset your Kvotizza password',
      `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`
    )
  }
  return NextResponse.json({ ok: true }) // do not leak user existence
}
