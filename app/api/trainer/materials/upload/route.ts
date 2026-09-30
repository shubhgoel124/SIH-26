import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb, type MaterialType } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, text } from "@/lib/validation"

const VALID_TYPES: MaterialType[] = ["VIDEO", "PDF", "PRESENTATION", "OTHER"]

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const payload = await req.json()
  const courseId = text(payload.courseId)
  const title = text(payload.title)
  const type = payload.type
  const fileUrl = text(payload.fileUrl)

  if (!courseId) return badRequest("Select a course")
  if (!title) return badRequest("Material title is required")
  if (!type || !VALID_TYPES.includes(type)) return badRequest("Select a valid material type")
  if (!fileUrl) return badRequest("Upload a file first")

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
