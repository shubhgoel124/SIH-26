import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, text } from "@/lib/validation"

type QuestionInput = {
  questionText: string
  options: string[]
  correctOption: number
  subjectTag: string
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const payload = await req.json()
  const courseId = text(payload.courseId)
  const title = text(payload.title)
  const deadline = text(payload.deadline)
  const questions = payload.questions

  if (!courseId) return badRequest("Select a course")
  if (!title) return badRequest("Questionnaire title is required")
  if (!deadline) return badRequest("Deadline is required")
  if (!Array.isArray(questions) || questions.length === 0) {
    return badRequest("Add at least one question")
  }

  const db = readDb()
  const course = db.courses.find((c) => c.id === courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsedDeadline = new Date(deadline)
  if (Number.isNaN(parsedDeadline.getTime())) {
    return badRequest("Invalid deadline")
  }

  const cleaned: QuestionInput[] = []
  for (const [i, q] of (questions as QuestionInput[]).entries()) {
    const questionText = text(q?.questionText)
    const subjectTag = text(q?.subjectTag)
    const options = Array.isArray(q?.options) ? q.options.map((o) => text(o)) : []

    if (!questionText) {
      return badRequest(`Question ${i + 1}: question text is required`)
    }
    if (options.length < 2 || options.some((o) => !o)) {
      return badRequest(`Question ${i + 1}: fill in every option (at least 2)`)
    }
    if (
      typeof q.correctOption !== "number" ||
      q.correctOption < 0 ||
      q.correctOption >= options.length
    ) {
      return badRequest(`Question ${i + 1}: pick a valid correct option index`)
    }
    if (!subjectTag) {
      return badRequest(`Question ${i + 1}: subject tag is required`)
    }
    cleaned.push({
      questionText,
      options,
      correctOption: q.correctOption,
      subjectTag,
    })
  }

  const questionnaire = mutateDb((dbInner) => {
    const questionnaireId = cuid()
    const createdAt = new Date().toISOString()
    const qEntry = {
      id: questionnaireId,
      courseId,
      trainerId: authResult.session.user.id,
      title,
      deadline: parsedDeadline.toISOString(),
      createdAt,
    }
    dbInner.questionnaires.push(qEntry)

    const questionRecords = cleaned.map((q) => ({
      id: cuid(),
      questionnaireId,
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctOption,
      subjectTag: q.subjectTag,
    }))
    dbInner.questions.push(...questionRecords)

    return { ...qEntry, questions: questionRecords }
  })

  return NextResponse.json({ questionnaire }, { status: 201 })
}
