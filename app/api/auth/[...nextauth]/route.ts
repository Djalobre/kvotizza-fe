// app/api/auth/[...nextauth]/route.ts
export const runtime = 'nodejs' // ✅ Prisma/Node only

import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from '@/lib/auth/password'

// ✅ Prisma singleton (prevents connection leaks on hot reloads)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,   // ✅ required in prod
  trustHost: true,                       // ✅ behind proxy / custom host

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(c) {
        if (!c?.email || !c?.password) return null

        const email = c.email.toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const ok = await verifyPassword(user.passwordHash, c.password)
        if (!ok) return null

        if (!user.emailVerified) {
          // 👇 your SignIn page checks for this exact string
          throw new Error('EmailNotVerified')
        }

        // Normalize role if you like (e.g., ADMIN/USER)
        const role = String(user.role).toUpperCase()

        return {
          id: String(user.id), // bigint -> string
          email: user.email,
          name: user.username ?? null,
          role,
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid  = (user as any).id
        token.role = (user as any).role
      }
      if (token.email) {
        const u = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { emailVerified: true },
        })
        ;(token as any).verified = !!u?.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).user.id       = (token as any).uid
      ;(session as any).user.role     = (token as any).role
      ;(session as any).user.verified = (token as any).verified
      return session
    },
  },

  pages: {
    signIn: '/signin',
    error : '/signin', // so ?error=EmailNotVerified lands on your form
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
