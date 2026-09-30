import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

function groupCount<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): { key: K; count: number }[] {
  const map = new Map<K, number>()
  for (const item of items) {
    const key = keyFn(item)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count }))
}

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const db = readDb()

  const coursesCount = db.courses.length
  const enrollmentsCount = db.enrollments.length
  const certificationsCount = db.certificates.length
  const completedAttempts = db.assessmentAttempts.length

  const coursesBySubjectRaw = groupCount(db.courses, (c) => c.subjectTag).sort((a, b) =>
    String(a.key).localeCompare(String(b.key))
  )
  const coursesByStatusRaw = groupCount(db.courses, (c) => c.status)
  const enrollmentsByStatusRaw = groupCount(db.enrollments, (e) => e.status)

  const subjectEnrollmentMap = new Map<string, number>()
  for (const enrollment of db.enrollments) {
    const course = db.courses.find((c) => c.id === enrollment.courseId)
    if (!course) continue
    const tag = course.subjectTag
    subjectEnrollmentMap.set(tag, (subjectEnrollmentMap.get(tag) ?? 0) + 1)
  }

  const enrollmentsBySubjectChart = Array.from(subjectEnrollmentMap.entries())
    .map(([subjectTag, count]) => ({ subjectTag, count }))
    .sort((a, b) => a.subjectTag.localeCompare(b.subjectTag))

  let expectedAttempts = 0
  for (const course of db.courses) {
    const enrollmentCount = db.enrollments.filter((e) => e.courseId === course.id).length
    const questionnaireCount = db.questionnaires.filter((q) => q.courseId === course.id).length
    expectedAttempts += enrollmentCount * questionnaireCount
  }

  const assessmentCompletionRate =
    expectedAttempts > 0
      ? Math.round((completedAttempts / expectedAttempts) * 10000) / 100
      : 0

  const participationBySubject = enrollmentsBySubjectChart.map(({ subjectTag, count }) => ({
    subjectTag,
    enrollments: count,
  }))

  return NextResponse.json({
    counts: {
      courses: coursesCount,
      enrollments: enrollmentsCount,
      certifications: certificationsCount,
      assessmentCompletionRate,
      assessmentAttempts: completedAttempts,
    },
    charts: {
      coursesBySubject: coursesBySubjectRaw.map((row) => ({
        subjectTag: row.key,
        count: row.count,
      })),
      coursesByStatus: coursesByStatusRaw.map((row) => ({
        status: row.key,
        count: row.count,
      })),
      enrollmentsByStatus: enrollmentsByStatusRaw.map((row) => ({
        status: row.key,
        count: row.count,
      })),
      enrollmentsBySubject: enrollmentsBySubjectChart,
      participationBySubject,
    },
  })
}
