import { auth } from "@/auth"
import { NextResponse } from "next/server"

export type SessionRole = "trainee" | "trainer" | "admin"

export type AppSession = {
  user: {
    id: string
    email: string
    name: string
    role: SessionRole
  }
}

export type RequireRoleResult =
  | { ok: true; session: AppSession }
  | { ok: false; response: NextResponse }

export async function requireRole(role: SessionRole): Promise<RequireRoleResult> {
  const session = await auth()
  if (!session?.user || session.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return {
    ok: true,
    session: {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    },
  }
}
