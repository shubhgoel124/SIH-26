import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const enrollments = await prisma.enrollment.findMany({
    where: { traineeId: authResult.session.user.id },
    include: {
      course: {
        include: {
          trainer: { select: { id: true, name: true } },
          _count: { select: { materials: true, questionnaires: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return NextResponse.json({ enrollments })
}
