import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const trainerId = authResult.session.user.id
  const db = readDb()

  const trainerCourseIds = new Set(
    db.courses.filter((c) => c.trainerId === trainerId).map((c) => c.id)
  )

  const questionnaires = db.questionnaires
    .filter((q) => trainerCourseIds.has(q.courseId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((q) => {
      const course = db.courses.find((c) => c.id === q.courseId)
      const questionsCount = db.questions.filter((qu) => qu.questionnaireId === q.id).length
      const attemptsCount = db.assessmentAttempts.filter((a) => a.questionnaireId === q.id).length
      return {
        ...q,
        course: course
          ? {
              id: course.id,
              title: course.title,
              subjectTag: course.subjectTag,
              status: course.status,
            }
          : { id: q.courseId, title: "", subjectTag: "", status: "DRAFT" as const },
        _count: { questions: questionsCount, attempts: attemptsCount },
      }
    })

  return NextResponse.json({ questionnaires })
}
