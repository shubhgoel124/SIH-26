import { NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id

  const db = readDb()
  const course = db.courses.find((c) => c.id === courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.status !== "ACTIVE") {
    return NextResponse.json({ error: "Course is not open for enrollment" }, { status: 400 })
  }

  const existing = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === courseId
  )
  if (existing) {
    return NextResponse.json({ enrollment: existing })
  }

  const enrollment = mutateDb((dbInner) => {
    const entry = {
      id: cuid(),
      traineeId,
      courseId,
      status: "ENROLLED" as const,
      progressPercent: 0,
      enrolledAt: new Date().toISOString(),
    }
    dbInner.enrollments.push(entry)
    const courseRef = dbInner.courses.find((c) => c.id === courseId)
    return {
      ...entry,
      course: courseRef ? { id: courseRef.id, title: courseRef.title } : { id: courseId, title: "" },
    }
  })

  return NextResponse.json({ enrollment }, { status: 201 })
}
