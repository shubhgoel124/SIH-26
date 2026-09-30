import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import type { CourseStatus } from "@/lib/generated/prisma"

const VALID_STATUSES: CourseStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const courses = await prisma.course.findMany({
    where: { trainerId: authResult.session.user.id },
    include: {
      _count: {
        select: { enrollments: true, materials: true, questionnaires: true },
      },
    },
    orderBy: { createdAt: "desc" },
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

  const course = await prisma.course.create({
    data: {
      title,
      description,
      subjectTag,
      trainerId: authResult.session.user.id,
      startDate: parsedStart,
      endDate: parsedEnd,
      status: courseStatus,
    },
  })

  return NextResponse.json({ course }, { status: 201 })
}
