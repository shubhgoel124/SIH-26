import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id

  const { rating, comments } = await req.json()
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 })
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
        comments: comments ?? undefined,
        createdAt,
      }
      dbInner.courseFeedbacks.push(entry)
      return entry
    }

    const existing = dbInner.courseFeedbacks[idx]
    existing.rating = rating
    existing.comments = comments ?? undefined
    return { ...existing }
  })

  return NextResponse.json({ feedback })
}
