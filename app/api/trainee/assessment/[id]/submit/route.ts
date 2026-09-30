import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: questionnaireId } = await params
  const traineeId = authResult.session.user.id

  const { answers } = await req.json()
  if (!Array.isArray(answers) || answers.some((a) => typeof a !== "number")) {
    return NextResponse.json({ error: "answers must be an array of numbers" }, { status: 400 })
  }

  const db = readDb()
  const questionnaire = db.questionnaires.find((q) => q.id === questionnaireId)
  if (!questionnaire) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  if (new Date(questionnaire.deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: "Assessment deadline has passed" }, { status: 400 })
  }

  const questions = db.questions
    .filter((q) => q.questionnaireId === questionnaireId)
    .sort((a, b) => a.id.localeCompare(b.id))

  const enrollment = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === questionnaire.courseId
  )
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: "Assessment has no questions" }, { status: 400 })
  }

  if (answers.length !== questions.length) {
    return NextResponse.json(
      { error: "Answer count must match question count" },
      { status: 400 }
    )
  }

  if (answers.some((a, i) => a < 0 || a >= questions[i].options.length)) {
    return NextResponse.json({ error: "One or more answers are out of range" }, { status: 400 })
  }

  let correct = 0
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctOption) {
      correct++
    }
  }
  const score = (correct / questions.length) * 100

  const attempt = mutateDb((dbInner) => {
    const submittedAt = new Date().toISOString()
    const existingIdx = dbInner.assessmentAttempts.findIndex(
      (a) => a.traineeId === traineeId && a.questionnaireId === questionnaireId
    )

    let attemptRecord
    if (existingIdx === -1) {
      attemptRecord = {
        id: cuid(),
        traineeId,
        questionnaireId,
        score,
        answers,
        submittedAt,
      }
      dbInner.assessmentAttempts.push(attemptRecord)
    } else {
      const existing = dbInner.assessmentAttempts[existingIdx]
      existing.score = score
      existing.answers = answers
      existing.submittedAt = submittedAt
      attemptRecord = { ...existing }
    }

    if (score >= 70) {
      const en = dbInner.enrollments.find((e) => e.id === enrollment.id)
      if (en && en.status !== "COMPLETED") {
        const newProgress = Math.max(en.progressPercent, Math.round(score))
        en.progressPercent = newProgress
        en.status = newProgress >= 100 ? "COMPLETED" : "IN_PROGRESS"
        if (newProgress >= 100) {
          en.completionDate = submittedAt
        }
      }
    }

    return attemptRecord
  })

  return NextResponse.json({ attempt, score, passed: score >= 70 })
}
