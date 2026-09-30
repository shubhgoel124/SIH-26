import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: questionnaireId },
    include: { questions: { orderBy: { id: "asc" } } },
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

  if (questionnaire.questions.length === 0) {
    return NextResponse.json({ error: "Assessment has no questions" }, { status: 400 })
  }

  if (answers.length !== questionnaire.questions.length) {
    return NextResponse.json(
      { error: "Answer count must match question count" },
      { status: 400 }
    )
  }

  let correct = 0
  for (let i = 0; i < questionnaire.questions.length; i++) {
    if (answers[i] === questionnaire.questions[i].correctOption) {
      correct++
    }
  }
  const score = (correct / questionnaire.questions.length) * 100

  const attempt = await prisma.assessmentAttempt.upsert({
    where: {
      traineeId_questionnaireId: { traineeId, questionnaireId },
    },
    create: {
      traineeId,
      questionnaireId,
      score,
      answers,
    },
    update: {
      score,
      answers,
      submittedAt: new Date(),
    },
  })

  if (score >= 70 && enrollment.status !== "COMPLETED") {
    const newProgress = Math.max(enrollment.progressPercent, Math.round(score))
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent: newProgress,
        status: newProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
        ...(newProgress >= 100 ? { completionDate: new Date() } : {}),
      },
    })
  }

  return NextResponse.json({ attempt, score, passed: score >= 70 })
}
