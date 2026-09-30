import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb, type CourseStatus } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

const VALID_STATUSES: CourseStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const trainerId = authResult.session.user.id
  const db = readDb()

  const courses = db.courses
    .filter((c) => c.trainerId === trainerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((course) => {
      const enrollmentsCount = db.enrollments.filter((e) => e.courseId === course.id).length
      const materialsCount = db.courseMaterials.filter((m) => m.courseId === course.id).length
      const questionnairesCount = db.questionnaires.filter((q) => q.courseId === course.id).length
      return {
        ...course,
        _count: {
          enrollments: enrollmentsCount,
          materials: materialsCount,
          questionnaires: questionnairesCount,
        },
      }
    })

  return NextResponse.json({ courses })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const { title, description, subjectTag, startDate, endDate, status } = await req.json()

  if (!title || !description || !subjectTag || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const parsedStart = new Date(startDate)
  const parsedEnd = new Date(endDate)
  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 })
  }

  let courseStatus: CourseStatus = "DRAFT"
  if (status && VALID_STATUSES.includes(status)) {
    courseStatus = status
  }

  const course = mutateDb((db) => {
    const entry = {
      id: cuid(),
      title,
      description,
      subjectTag,
      trainerId: authResult.session.user.id,
      startDate: parsedStart.toISOString(),
      endDate: parsedEnd.toISOString(),
      status: courseStatus,
      createdAt: new Date().toISOString(),
    }
    db.courses.push(entry)
    return entry
  })

  return NextResponse.json({ course }, { status: 201 })
}
