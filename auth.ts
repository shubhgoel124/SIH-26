import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import { findUserByEmail, type Role } from "@/lib/store"

// Keep JWT import so module augmentation resolves under NextAuth v5.
void 0 as unknown as JWT

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "trainee" | "trainer" | "admin"
    }
  }

  interface User {
    id: string
    role: "trainee" | "trainer" | "admin"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "trainee" | "trainer" | "admin"
  }
}

const roleMap: Record<string, Role> = {
  trainee: "TRAINEE",
  trainer: "TRAINER",
  admin: "ADMIN",
}

const sessionRoleMap: Record<Role, "trainee" | "trainer" | "admin"> = {
  TRAINEE: "trainee",
  TRAINER: "trainer",
  ADMIN: "admin",
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
        role: { type: "text", label: "Role" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        const roleKey = (credentials?.role as string | undefined)?.toLowerCase()

        if (!email || !password || !roleKey || !roleMap[roleKey]) {
          return null
        }

        const user = findUserByEmail(email)

        if (!user || user.password !== password) return null
        if (user.role !== roleMap[roleKey]) return null
        if (user.approvalStatus !== "APPROVED") return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: sessionRoleMap[user.role],
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          email: session.user?.email || "",
          name: session.user?.name || "",
          role: token.role as "trainee" | "trainer" | "admin",
        },
      }
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 20 * 60,
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  secret: process.env.AUTH_SECRET,
  jwt: {
    maxAge: 20 * 60,
  },
})
