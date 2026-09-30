import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      questionnaires: { select: { id: true, title: true } },
    },
  })

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      trainee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { enrolledAt: "desc" },
  })

  const questionnaireIds = course.questionnaires.map((q) => q.id)

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { questionnaireId: { in: questionnaireIds } },
    include: {
      trainee: { select: { id: true, name: true, email: true } },
      questionnaire: { select: { id: true, title: true } },
    },
    orderBy: { submittedAt: "desc" },
  })

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      questionnaires: course.questionnaires,
    },
    enrollments,
    attempts,
  })
}
