import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const traineeId = authResult.session.user.id
  const db = readDb()

  const courses = db.courses
    .filter((c) => c.status === "ACTIVE")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((course) => {
      const trainer = db.users.find((u) => u.id === course.trainerId)
      const enrollment = db.enrollments.find(
        (e) => e.traineeId === traineeId && e.courseId === course.id
      )
      const materialsCount = db.courseMaterials.filter((m) => m.courseId === course.id).length
      const questionnairesCount = db.questionnaires.filter((q) => q.courseId === course.id).length

      const { trainerId, ...rest } = course
      return {
        ...rest,
        trainerId,
        trainer: trainer
          ? { id: trainer.id, name: trainer.name, email: trainer.email }
          : { id: course.trainerId, name: "Unknown", email: "" },
        enrollment: enrollment
          ? {
              id: enrollment.id,
              status: enrollment.status,
              progressPercent: enrollment.progressPercent,
              enrolledAt: enrollment.enrolledAt,
              completionDate: enrollment.completionDate ?? null,
            }
          : null,
        _count: { materials: materialsCount, questionnaires: questionnairesCount },
      }
    })

  return NextResponse.json({ courses })
}
