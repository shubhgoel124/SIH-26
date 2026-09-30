import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb, type CourseStatus } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, text } from "@/lib/validation"

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

  const body = await req.json()
  const title = text(body.title)
  const description = text(body.description)
  const subjectTag = text(body.subjectTag)
  const startDate = text(body.startDate)
  const endDate = text(body.endDate)
  const status = body.status

  if (!title) return badRequest("Course title is required")
  if (!description) return badRequest("Course description is required")
  if (!subjectTag) return badRequest("Subject tag is required")
  if (!startDate || !endDate) return badRequest("Start and end dates are required")

  const parsedStart = new Date(startDate)
  const parsedEnd = new Date(endDate)
  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    return badRequest("Invalid start or end date")
  }
  if (parsedEnd < parsedStart) {
    return badRequest("End date must be on or after the start date")
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
