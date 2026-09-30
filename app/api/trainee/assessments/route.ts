import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id
  const db = readDb()

  const courseIds = db.enrollments
    .filter((e) => e.traineeId === traineeId)
    .map((e) => e.courseId)

  const questionnaires = db.questionnaires
    .filter((q) => courseIds.includes(q.courseId))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .map((q) => {
      const course = db.courses.find((c) => c.id === q.courseId)
      const questionsCount = db.questions.filter((qu) => qu.questionnaireId === q.id).length
      const attempts = db.assessmentAttempts
        .filter((a) => a.questionnaireId === q.id && a.traineeId === traineeId)
        .map((a) => ({ id: a.id, score: a.score, submittedAt: a.submittedAt }))
      return {
        ...q,
        course: course
          ? { id: course.id, title: course.title, subjectTag: course.subjectTag }
          : { id: q.courseId, title: "", subjectTag: "" },
        _count: { questions: questionsCount },
        attempts,
      }
    })

  return NextResponse.json({ questionnaires })
}
