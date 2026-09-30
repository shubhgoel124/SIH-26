import type { NextAuthConfig } from "next-auth"

function homeForRole(role: string) {
  if (role === "admin") return "/admin"
  if (role === "trainer") return "/trainer"
  return "/trainee"
}

/**
 * Edge-safe auth config (no Node fs / DB imports).
 * Used by middleware. Full Credentials provider lives in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 20 * 60,
  },
  providers: [],
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
        token.role = (user as { role?: string }).role as
          | "trainee"
          | "trainer"
          | "admin"
      }
      return token
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user

      const isPublic =
        pathname === "/" ||
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/verify/") ||
        pathname.startsWith("/uploads/")

      if (isPublic) {
        if (isLoggedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
          return Response.redirect(new URL(homeForRole(auth!.user!.role), request.nextUrl))
        }
        return true
      }

      if (!isLoggedIn) return false

      const role = auth.user.role
      if (pathname.startsWith("/admin") && role !== "admin") {
        return Response.redirect(new URL(homeForRole(role), request.nextUrl))
      }
      if (pathname.startsWith("/trainer") && role !== "trainer") {
        return Response.redirect(new URL(homeForRole(role), request.nextUrl))
      }
      if (pathname.startsWith("/trainee") && role !== "trainee") {
        return Response.redirect(new URL(homeForRole(role), request.nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
