import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

const userSelect = (u: {
  id: string
  name: string
  email: string
  role: string
  approvalStatus: string
  createdAt: string
}) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  approvalStatus: u.approvalStatus,
  createdAt: u.createdAt,
})

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const db = readDb()

  const pending = db.users
    .filter((u) => u.approvalStatus === "PENDING")
    .map(userSelect)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const all = db.users.map(userSelect).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ pending, all })
}
