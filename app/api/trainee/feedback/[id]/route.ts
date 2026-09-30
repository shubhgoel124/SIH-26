import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

  const enrollment = await prisma.enrollment.findUnique({
    where: { traineeId_courseId: { traineeId, courseId } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const feedback = await prisma.courseFeedback.upsert({
    where: { traineeId_courseId: { traineeId, courseId } },
    create: {
      traineeId,
      courseId,
      rating,
      comments: comments ?? null,
    },
    update: {
      rating,
      comments: comments ?? null,
    },
  })

  return NextResponse.json({ feedback })
}
