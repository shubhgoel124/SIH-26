import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const { courseId } = await params
  const db = readDb()

  const course = db.courses.find((c) => c.id === courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const questionnaires = db.questionnaires
    .filter((q) => q.courseId === courseId)
    .map((q) => ({ id: q.id, title: q.title }))

  const questionnaireIds = questionnaires.map((q) => q.id)

  const enrollments = db.enrollments
    .filter((e) => e.courseId === courseId)
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt))
    .map((e) => {
      const trainee = db.users.find((u) => u.id === e.traineeId)
      return {
        ...e,
        trainee: trainee
          ? { id: trainee.id, name: trainee.name, email: trainee.email }
          : { id: e.traineeId, name: "Unknown", email: "" },
      }
    })

  const attempts = db.assessmentAttempts
    .filter((a) => questionnaireIds.includes(a.questionnaireId))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((a) => {
      const trainee = db.users.find((u) => u.id === a.traineeId)
      const questionnaire = db.questionnaires.find((q) => q.id === a.questionnaireId)
      return {
        ...a,
        trainee: trainee
          ? { id: trainee.id, name: trainee.name, email: trainee.email }
          : { id: a.traineeId, name: "Unknown", email: "" },
        questionnaire: questionnaire
          ? { id: questionnaire.id, title: questionnaire.title }
          : { id: a.questionnaireId, title: "" },
      }
    })

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      questionnaires,
    },
    enrollments,
    attempts,
  })
}
