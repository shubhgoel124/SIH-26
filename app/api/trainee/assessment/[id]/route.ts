import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: questionnaireId } = await params
  const traineeId = authResult.session.user.id
  const db = readDb()

  const q = db.questionnaires.find((item) => item.id === questionnaireId)
  if (!q) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const course = db.courses.find((c) => c.id === q.courseId)
  const questions = db.questions
    .filter((qu) => qu.questionnaireId === questionnaireId)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((qu) => ({
      id: qu.id,
      questionText: qu.questionText,
      options: qu.options,
      subjectTag: qu.subjectTag,
    }))

  const questionnaire = {
    ...q,
    course: course ? { id: course.id, title: course.title } : { id: q.courseId, title: "" },
    questions,
    deadlinePassed: new Date(q.deadline).getTime() < Date.now(),
  }

  const enrollment = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === q.courseId
  )
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const attempt =
    db.assessmentAttempts.find(
      (a) => a.traineeId === traineeId && a.questionnaireId === questionnaireId
    ) ?? null

  return NextResponse.json({ questionnaire, attempt })
}
