import { NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { courseId } = await params
  const traineeId = authResult.session.user.id

  const db = readDb()
  const enrollment = db.enrollments.find(
    (e) => e.traineeId === traineeId && e.courseId === courseId
  )

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const course = db.courses.find((c) => c.id === courseId)
  const trainer = course ? db.users.find((u) => u.id === course.trainerId) : undefined

  const result = mutateDb((dbInner) => {
    const en = dbInner.enrollments.find((e) => e.id === enrollment.id)
    if (!en) throw new Error("Enrollment missing")

    const completionDate = new Date().toISOString()
    en.status = "COMPLETED"
    en.progressPercent = 100
    en.completionDate = completionDate

    let certificate = dbInner.certificates.find(
      (c) => c.traineeId === traineeId && c.courseId === courseId
    )

    if (!certificate && course) {
      certificate = {
        id: cuid(),
        traineeId,
        courseId,
        title: `Certificate of Completion - ${course.title}`,
        issuer: trainer?.name ?? "SANGAM Training Program",
        issueDate: completionDate,
        verificationToken: cuid(),
        isPublic: true,
      }
      dbInner.certificates.push(certificate)
    }

    return { enrollment: { ...en }, certificate: certificate ? { ...certificate } : null }
  })

  return NextResponse.json(result)
}
