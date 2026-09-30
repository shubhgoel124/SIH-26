import { NextResponse } from "next/server"
import { resetDb } from "@/lib/store"

/**
 * Reseed demo data for recording / local demos.
 * Always available in development. In production set ALLOW_DEMO_RESET=1.
 */
export async function POST() {
  const allowed =
    process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_RESET === "1"

  if (!allowed) {
    return NextResponse.json({ error: "Demo reset is disabled" }, { status: 403 })
  }

  const db = resetDb()
  const pending = db.users.filter((u) => u.approvalStatus === "PENDING").map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
  }))

  return NextResponse.json({
    ok: true,
    message: "Demo data reset. Sign in again if your session broke.",
    pending,
    announcements: db.announcements.length,
  })
}

export async function GET() {
  return POST()
}
