import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const competencyMaps = await prisma.competencyMap.findMany({
    include: {
      trainer: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ subjectTag: "asc" }, { proficiencyScore: "desc" }],
  })

  const maps = competencyMaps.map((entry) => ({
    ...entry,
    trainerName: entry.trainer.name,
  }))

  return NextResponse.json({ competencyMaps: maps })
}
