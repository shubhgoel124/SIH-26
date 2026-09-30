import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import type { MaterialType } from "@/lib/generated/prisma"

const VALID_TYPES: MaterialType[] = ["VIDEO", "PDF", "PRESENTATION", "OTHER"]

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const { courseId, title, type, fileUrl } = await req.json()

  if (!courseId || !title || !type || !fileUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid material type" }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const material = await prisma.courseMaterial.create({
    data: {
      courseId,
      title,
      type,
      fileUrl,
    },
  })

  return NextResponse.json({ material }, { status: 201 })
}
