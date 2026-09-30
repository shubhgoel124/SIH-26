import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id
  const db = readDb()

  const certificates = db.certificates
    .filter((c) => c.traineeId === traineeId)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .map((cert) => {
      const course = cert.courseId ? db.courses.find((c) => c.id === cert.courseId) : undefined
      return {
        ...cert,
        course: course
          ? { id: course.id, title: course.title, subjectTag: course.subjectTag }
          : null,
      }
    })

  return NextResponse.json({ certificates })
}
