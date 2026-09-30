import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id

  const enrollments = await prisma.enrollment.findMany({
    where: { traineeId },
    select: { courseId: true },
  })
  const courseIds = enrollments.map((e) => e.courseId)

  const questionnaires = await prisma.questionnaire.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { id: true, title: true, subjectTag: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { traineeId },
        select: { id: true, score: true, submittedAt: true },
      },
    },
    orderBy: { deadline: "asc" },
  })

  return NextResponse.json({ questionnaires })
}
