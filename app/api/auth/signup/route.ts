// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { signupSchema } from '@/lib/validation'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { email, name, password } = parsed.data
    const lower = email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: lower } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const role = (process.env.ADMIN_EMAILS || '')
      .split(',').map(s=>s.trim().toLowerCase()).includes(lower) ? 'ADMIN' : 'USER'

    await prisma.user.create({ data: { email: lower, name: name || null, passwordHash, role } })

    // 🔔 send verification email
    await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // use absolute URL so it works in prod + server
      body: JSON.stringify({ email: lower }),
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('signup error:', e)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
