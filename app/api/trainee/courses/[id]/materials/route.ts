import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { id: courseId } = await params
  const traineeId = authResult.session.user.id

  const enrollment = await prisma.enrollment.findUnique({
    where: { traineeId_courseId: { traineeId, courseId } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const materials = await prisma.courseMaterial.findMany({
    where: { courseId },
    orderBy: { uploadedAt: "asc" },
  })

  return NextResponse.json({ materials })
}
