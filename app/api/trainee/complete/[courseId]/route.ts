import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const { courseId } = await params
  const traineeId = authResult.session.user.id

  const enrollment = await prisma.enrollment.findUnique({
    where: { traineeId_courseId: { traineeId, courseId } },
    include: {
      course: { include: { trainer: { select: { name: true } } } },
      trainee: { select: { name: true } },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "COMPLETED",
      progressPercent: 100,
      completionDate: new Date(),
    },
  })

  let certificate = await prisma.certificate.findFirst({
    where: { traineeId, courseId },
  })

  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: {
        traineeId,
        courseId,
        title: `Certificate of Completion — ${enrollment.course.title}`,
        issuer: enrollment.course.trainer?.name ?? "SANGAM Training Program",
        isPublic: true,
      },
    })
  }

  return NextResponse.json({ enrollment: updatedEnrollment, certificate })
}
