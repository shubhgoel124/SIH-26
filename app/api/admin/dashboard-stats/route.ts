import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const [
    coursesCount,
    enrollmentsCount,
    certificationsCount,
    coursesBySubject,
    coursesByStatus,
    enrollmentsByStatus,
    enrollmentsBySubject,
    courseParticipationRows,
    completedAttempts,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.course.groupBy({
      by: ["subjectTag"],
      _count: { _all: true },
      orderBy: { subjectTag: "asc" },
    }),
    prisma.course.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.enrollment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.enrollment.findMany({
      select: {
        course: { select: { subjectTag: true } },
      },
    }),
    prisma.course.findMany({
      select: {
        _count: { select: { enrollments: true, questionnaires: true } },
      },
    }),
    prisma.assessmentAttempt.count(),
  ])

  const expectedAttempts = courseParticipationRows.reduce(
    (sum, course) =>
      sum + course._count.enrollments * course._count.questionnaires,
    0
  )

  const subjectEnrollmentMap = new Map<string, number>()
  for (const row of enrollmentsBySubject) {
    const tag = row.course.subjectTag
    subjectEnrollmentMap.set(tag, (subjectEnrollmentMap.get(tag) ?? 0) + 1)
  }

  const enrollmentsBySubjectChart = Array.from(subjectEnrollmentMap.entries())
    .map(([subjectTag, count]) => ({ subjectTag, count }))
    .sort((a, b) => a.subjectTag.localeCompare(b.subjectTag))

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
      coursesBySubject: coursesBySubject.map((row) => ({
        subjectTag: row.subjectTag,
        count: row._count._all,
      })),
      coursesByStatus: coursesByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      enrollmentsByStatus: enrollmentsByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      enrollmentsBySubject: enrollmentsBySubjectChart,
      participationBySubject,
    },
  })
}
