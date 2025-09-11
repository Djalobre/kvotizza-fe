// app/api/auth/reset/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { passwordSchema } from '@/lib/validation'

const prisma = new PrismaClient()
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { token, password } = await req.json()

  // validate password rules
  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const pr = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!pr || pr.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await prisma.user.update({ where: { id: pr.userId }, data: { passwordHash } })
  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ ok: true })
}
