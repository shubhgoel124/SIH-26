import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      approvalStatus: action === "approve" ? "APPROVED" : "REJECTED",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      approvalStatus: true,
    },
  })

  return NextResponse.json({ user: updated })
}
