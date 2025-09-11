// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from '@/lib/auth/password'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(c) {
        if (!c?.email || !c?.password) return null
        const user = await prisma.user.findUnique({ where: { email: c.email.toLowerCase() } })
        if (!user) return null
        const ok = await verifyPassword(user.passwordHash, c.password)
        if (!ok) return null
        if (!user.emailVerified) throw new Error('EmailNotVerified')
        return {
          id: String(user.id),                    // 👈 cast bigint → string
          email: user.email,
          name: user.username ?? null,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id
        token.role = (user as any).role
      }
      // verified flag
      const u = token.email
        ? await prisma.user.findUnique({
            where: { email: String(token.email).toLowerCase() },
            select: { emailVerified: true },
          })
        : null
      ;(token as any).verified = !!u?.emailVerified
      return token
    },
    async session({ session, token }) {
      ;(session as any).user.id = (token as any).uid
      ;(session as any).user.role = (token as any).role
      ;(session as any).user.verified = (token as any).verified
      return session
    },
  },
  pages: { signIn: '/signin', error: '/signin' },
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
