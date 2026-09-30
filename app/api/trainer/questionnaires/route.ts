import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const trainerId = authResult.session.user.id

  const questionnaires = await prisma.questionnaire.findMany({
    where: {
      course: { trainerId },
    },
    include: {
      course: { select: { id: true, title: true, subjectTag: true, status: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ questionnaires })
}
