import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const [pending, all] = await Promise.all([
    prisma.user.findMany({
      where: { approvalStatus: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return NextResponse.json({ pending, all })
}
