import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const db = readDb()
  const certificate = db.certificates.find((c) => c.verificationToken === token)

  if (!certificate || !certificate.isPublic) {
    return NextResponse.json(
      { valid: false, message: "Certificate not found or not public" },
      { status: 404 }
    )
  }

  const trainee = db.users.find((u) => u.id === certificate.traineeId)
  const course = certificate.courseId
    ? db.courses.find((c) => c.id === certificate.courseId)
    : undefined

  return NextResponse.json({
    valid: true,
    certificate: {
      title: certificate.title,
      issuer: certificate.issuer,
      issueDate: certificate.issueDate,
      traineeName: trainee?.name ?? "Unknown",
      courseTitle: course?.title,
      verificationToken: certificate.verificationToken,
    },
  })
}
