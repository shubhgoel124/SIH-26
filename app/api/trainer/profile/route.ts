import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const db = readDb()
  const profile = db.trainerProfiles.find((p) => p.userId === authResult.session.user.id) ?? null

  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const body = await req.json()
  const { bio, subjectAreas, yearsExperience, phone } = body
  const userId = authResult.session.user.id

  const profile = mutateDb((db) => {
    const idx = db.trainerProfiles.findIndex((p) => p.userId === userId)
    const updatedAt = new Date().toISOString()

    if (idx === -1) {
      const created = {
        id: cuid(),
        userId,
        bio: bio ?? undefined,
        subjectAreas: Array.isArray(subjectAreas) ? subjectAreas : [],
        yearsExperience: typeof yearsExperience === "number" ? yearsExperience : undefined,
        phone: phone ?? undefined,
        updatedAt,
      }
      db.trainerProfiles.push(created)
      return created
    }

    const existing = db.trainerProfiles[idx]
    if (bio !== undefined) existing.bio = bio
    if (subjectAreas !== undefined) {
      existing.subjectAreas = Array.isArray(subjectAreas) ? subjectAreas : []
    }
    if (yearsExperience !== undefined) {
      const parsed =
        typeof yearsExperience === "number"
          ? yearsExperience
          : Number(yearsExperience)
      existing.yearsExperience = Number.isFinite(parsed) ? parsed : undefined
    }
    if (phone !== undefined) existing.phone = phone
    existing.updatedAt = updatedAt
    return { ...existing }
  })

  return NextResponse.json({ profile })
}
