import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id
  const db = readDb()

  const enrollments = db.enrollments
    .filter((e) => e.traineeId === traineeId)
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt))
    .map((enrollment) => {
      const course = db.courses.find((c) => c.id === enrollment.courseId)
      if (!course) {
        return { ...enrollment, course: null }
      }
      const trainer = db.users.find((u) => u.id === course.trainerId)
      const materialsCount = db.courseMaterials.filter((m) => m.courseId === course.id).length
      const questionnairesCount = db.questionnaires.filter((q) => q.courseId === course.id).length
      return {
        ...enrollment,
        course: {
          ...course,
          trainer: trainer ? { id: trainer.id, name: trainer.name } : { id: course.trainerId, name: "Unknown" },
          _count: { materials: materialsCount, questionnaires: questionnairesCount },
        },
      }
    })

  return NextResponse.json({ enrollments })
}
