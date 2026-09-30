import { NextRequest, NextResponse } from "next/server"
import { mutateDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const { id } = await params
  const { action } = await req.json()

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
  }

  const updated = mutateDb((db) => {
    const user = db.users.find((u) => u.id === id)
    if (!user) return null
    user.approvalStatus = action === "approve" ? "APPROVED" : "REJECTED"
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
    }
  })

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user: updated })
}
