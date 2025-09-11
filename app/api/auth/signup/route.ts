// app/api/auth/signup/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { sendMail } from '@/lib/mailer'
import crypto from 'crypto'
import { addHours } from 'date-fns'

// (optional) Prisma singleton in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()
    const lower = String(email).toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: lower } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const role = (process.env.ADMIN_EMAILS || '')
      .split(',').map(s => s.trim().toLowerCase())
      .includes(lower) ? 'ADMIN' : 'USER'   // <- string

    // if your DB columns created_at/updated_at have NO defaults, set them here:
    // const now = new Date()

    await prisma.user.create({
      data: {
        email: lower,
        username: name ?? null,
        passwordHash,
        role,                   // <- string
        // createdAt: now,
        // updatedAt: now,
      },
    })

    const token = crypto.randomUUID() + crypto.randomBytes(8).toString('hex')
    await prisma.verificationToken.create({
      data: { identifier: lower, token, expires: addHours(new Date(), 24) },
    })

    const base = process.env.NEXTAUTH_URL!
    const url = `${base}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(lower)}`
    await sendMail(lower, 'Verify your Kvotizza account',
      `<p>Kliknite da verifikujete nalog:</p><p><a href="${url}">${url}</a></p>`)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('signup error:', e)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
