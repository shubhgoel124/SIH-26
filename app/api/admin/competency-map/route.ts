import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const db = readDb()

  const competencyMaps = [...db.competencyMaps].sort((a, b) => {
    const tagCmp = a.subjectTag.localeCompare(b.subjectTag)
    if (tagCmp !== 0) return tagCmp
    return b.proficiencyScore - a.proficiencyScore
  })

  const maps = competencyMaps.map((entry) => {
    const trainer = db.users.find((u) => u.id === entry.trainerId)
    return {
      ...entry,
      trainer: trainer
        ? { id: trainer.id, name: trainer.name, email: trainer.email }
        : { id: entry.trainerId, name: "Unknown", email: "" },
      trainerName: trainer?.name ?? "Unknown",
    }
  })

  return NextResponse.json({ competencyMaps: maps })
}
