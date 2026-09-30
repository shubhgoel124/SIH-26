import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.status !== "ACTIVE") {
    return NextResponse.json({ error: "Course is not open for enrollment" }, { status: 400 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { traineeId_courseId: { traineeId, courseId } },
  })
  if (existing) {
    return NextResponse.json({ enrollment: existing })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      traineeId,
      courseId,
      status: "ENROLLED",
      progressPercent: 0,
    },
    include: { course: { select: { id: true, title: true } } },
  })

  return NextResponse.json({ enrollment }, { status: 201 })
}
