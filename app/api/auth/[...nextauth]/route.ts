// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from '@/lib/auth/password'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } })
        if (!user) return null
        const ok = await verifyPassword(user.passwordHash, credentials.password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name || null, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // put role and id into JWT
      if (user) {
        token.uid = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      (session as any).user.id = token.uid
      ;(session as any).user.role = token.role
      return session
    },
  },
  pages: {
    signIn: '/signin',   // custom page
    error: '/signin',    // reuse
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
