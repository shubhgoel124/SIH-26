import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id
  const db = readDb()

  const enrollment = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === courseId
  )
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const materials = db.courseMaterials
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))

  return NextResponse.json({ materials })
}
