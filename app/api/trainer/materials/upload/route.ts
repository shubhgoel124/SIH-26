import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb, type MaterialType } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

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

  const db = readDb()
  const course = db.courses.find((c) => c.id === courseId)
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }
  if (course.trainerId !== authResult.session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const material = mutateDb((dbInner) => {
    const entry = {
      id: cuid(),
      courseId,
      title,
      type: type as MaterialType,
      fileUrl,
      uploadedAt: new Date().toISOString(),
    }
    dbInner.courseMaterials.push(entry)
    return entry
  })

  return NextResponse.json({ material }, { status: 201 })
}
