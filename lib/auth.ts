// lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    // Use any provider you like. Credentials shown for brevity.
    CredentialsProvider({
      name: "Admin Login",
      credentials: { username: { label: "User" }, password: { label: "Pass", type: "password" } },
      async authorize(creds) {
        if (!creds) return null;
        // Replace with your real user store
        if (creds.username === process.env.ADMIN_USER && creds.password === process.env.ADMIN_PASS) {
          return { id: "1", name: "Admin", email: "admin@example.com", role: "admin" as const };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role ?? "user";
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role ?? "user";
      return session;
    },
  },
};

export default NextAuth(authOptions);
