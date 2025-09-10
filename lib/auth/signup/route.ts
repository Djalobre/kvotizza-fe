// app/api/auth/signup/route.ts (Next.js App Router)
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const role = (process.env.ADMIN_EMAILS || '')
      .split(',').map(s=>s.trim().toLowerCase()).includes(email.toLowerCase()) ? 'ADMIN' : 'USER'

    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), name: name || null, passwordHash, role }
    })
    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
