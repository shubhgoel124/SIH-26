import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: questionnaireId } = await params
  const traineeId = authResult.session.user.id

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: questionnaireId },
    include: {
      course: { select: { id: true, title: true } },
      questions: {
        select: {
          id: true,
          questionText: true,
          options: true,
          subjectTag: true,
        },
      },
    },
  })

  if (!questionnaire) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      traineeId_courseId: { traineeId, courseId: questionnaire.courseId },
    },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      traineeId_questionnaireId: { traineeId, questionnaireId },
    },
  })

  return NextResponse.json({ questionnaire, attempt })
}
