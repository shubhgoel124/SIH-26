import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, text } from "@/lib/validation"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id

  const payload = await req.json()
  const rating = Number(payload.rating)
  const comments = text(payload.comments)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return badRequest("Rating must be a number between 1 and 5")
  }
  if (!comments) {
    return badRequest("Feedback comments are required")
  }

  const db = readDb()
  const enrollment = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === courseId
  )
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const feedback = mutateDb((dbInner) => {
    const idx = dbInner.courseFeedbacks.findIndex(
      (f) => f.traineeId === traineeId && f.courseId === courseId
    )
    const createdAt = new Date().toISOString()

    if (idx === -1) {
      const entry = {
        id: cuid(),
        traineeId,
        courseId,
        rating,
        comments,
        createdAt,
      }
      dbInner.courseFeedbacks.push(entry)
      return entry
    }

    const existing = dbInner.courseFeedbacks[idx]
    existing.rating = rating
    existing.comments = comments
    return { ...existing }
  })

  return NextResponse.json({ feedback })
}
