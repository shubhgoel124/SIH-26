import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const certificate = await prisma.certificate.findUnique({
    where: { verificationToken: token },
    include: {
      trainee: { select: { name: true, email: true } },
      course: { select: { id: true, title: true, subjectTag: true } },
    },
  })

  if (!certificate || !certificate.isPublic) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
  }

  return NextResponse.json({ certificate })
}
