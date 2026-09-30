import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

type QuestionInput = {
  questionText: string
  options: string[]
  correctOption: number
  subjectTag: string
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const { courseId, title, deadline, questions } = await req.json()

  if (!courseId || !title || !deadline || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsedDeadline = new Date(deadline)
  if (Number.isNaN(parsedDeadline.getTime())) {
    return NextResponse.json({ error: "Invalid deadline" }, { status: 400 })
  }

  for (const q of questions as QuestionInput[]) {
    if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
      return NextResponse.json({ error: "Each question needs text and at least 2 options" }, { status: 400 })
    }
    if (
      typeof q.correctOption !== "number" ||
      q.correctOption < 0 ||
      q.correctOption >= q.options.length
    ) {
      return NextResponse.json({ error: "Invalid correctOption for a question" }, { status: 400 })
    }
    if (!q.subjectTag) {
      return NextResponse.json({ error: "Each question needs a subjectTag" }, { status: 400 })
    }
  }

  const questionnaire = await prisma.questionnaire.create({
    data: {
      courseId,
      trainerId: authResult.session.user.id,
      title,
      deadline: parsedDeadline,
      questions: {
        create: (questions as QuestionInput[]).map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          subjectTag: q.subjectTag,
        })),
      },
    },
    include: { questions: true },
  })

  return NextResponse.json({ questionnaire }, { status: 201 })
}
