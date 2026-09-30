import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id

  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      enrollments: {
        where: { traineeId },
        select: {
          id: true,
          status: true,
          progressPercent: true,
          enrolledAt: true,
          completionDate: true,
        },
      },
      _count: { select: { materials: true, questionnaires: true } },
    },
    orderBy: { startDate: "asc" },
  })

  const result = courses.map((course) => ({
    ...course,
    enrollment: course.enrollments[0] ?? null,
    enrollments: undefined,
  }))

  return NextResponse.json({ courses: result })
}
