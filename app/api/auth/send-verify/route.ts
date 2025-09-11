// app/api/auth/send-verify/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { addHours } from 'date-fns'
import { sendMail } from '@/lib/mailer'

const prisma = new PrismaClient()

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { email } = await req.json()
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return NextResponse.json({ ok: true }) // silent fail

  const token = crypto.randomUUID() + crypto.randomBytes(8).toString('hex')
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires: addHours(new Date(), 24), // valid for 24h
    },
  })

  const url = `${process.env.NEXTAUTH_URL}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`
  await sendMail(
    user.email,
    'Verify your Kvotizza account',
    `<p>Click to verify your email:</p><p><a href="${url}">${url}</a></p>`
  )

  return NextResponse.json({ ok: true })
}
