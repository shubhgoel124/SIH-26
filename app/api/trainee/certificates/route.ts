import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const certificates = await prisma.certificate.findMany({
    where: { traineeId: authResult.session.user.id },
    include: {
      course: { select: { id: true, title: true, subjectTag: true } },
    },
    orderBy: { issueDate: "desc" },
  })

  return NextResponse.json({ certificates })
}
